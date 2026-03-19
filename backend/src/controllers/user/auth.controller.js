import User from "../../models/users/user.model.js";
import OTP from "../../models/users/otp.model.js";
import { generateToken } from "../../utils/token.js";
import { generateOtp } from "../../utils/opt.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { sendOtpEmail } from "../../utils/mailer.js";
import argon2 from "argon2";
import axios from "axios";

const RESEND_COOLDOWN_SECONDS = 60;

/* STEP 1 — Verify Email / Send OTP */
export const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); //valid for 2 min

    await OTP.deleteMany({ email }); //delete old otps

    await OTP.create({ email, otp, expiresAt });

    await sendOtpEmail(email, otp);
    return successResponse(res, 200, "OTP sent successfully");
  } catch (error) {
    console.error("email verification faild Error:", error.message);
    return errorResponse(res, 400, "Invalid data");
  }
};

//!step 2
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await OTP.findOne({ email, otp });

    if (!record) return errorResponse(res, 400, "Invalid OTP");

    if (record.expiresAt < new Date())
      return errorResponse(res, 400, "OTP expired");

    record.isVerified = true;
    await record.save();

    return successResponse(res, 200, "OTP verified successfully");
  } catch (err) {
    return errorResponse(
      res,
      400,
      "Invalid data, Opt varification failed",
      err.message,
    );
  }
};

//! Otp resend with cooldown
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const existingRecord = await OTP.findOne({ email });

    if (!existingRecord)
      return res.status(400).json({ message: "Request OTP first" });

    const now = Date.now();
    const lastSent = new Date(existingRecord.lastSentAt).getTime();
    const diffSeconds = Math.floor((now - lastSent) / 1000);

    if (diffSeconds < RESEND_COOLDOWN_SECONDS) {
      return errorResponse(res, 429, "Please wait before resending OTP", {
        retryAfter: RESEND_COOLDOWN_SECONDS - diffSeconds,
      });
    }

    const newOtp = generateOtp();
    const newExpiry = new Date(Date.now() + 2 * 60 * 1000);

    existingRecord.otp = newOtp;
    existingRecord.expiresAt = newExpiry;
    existingRecord.lastSentAt = new Date();
    existingRecord.isVerified = false;

    await existingRecord.save();

    await sendOtpEmail(email, newOtp);
    return successResponse(res, 200, "OTP resent successfully");
  } catch (err) {
    return errorResponse(
      res,
      400,
      "Invalid data, resend otp faild",
      err.message,
    );
  }
};

//! Step 3
export const createUser = async (req, res) => {
  try {
    const { firstname, email, password, confirmPassword } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) return errorResponse(res, 400, "User already exists");

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord || !otpRecord.isVerified)
      return errorResponse(res, 400, "Email not verified");

    const hashedPassword = await argon2.hash(password);

    const user = await User.create({
      firstname,
      email,
      password: hashedPassword,
      isVerified: true,
      lastLoginProvider: "email",
    });
    // ✅ AUTO LOGIN LOGIC
    const token = generateToken(user._id);
    res.cookie("token", token, { httpOnly: true });

    await OTP.deleteMany({ email });
    return successResponse(res, 200, "Account created successfully", {
      _id: user._id,
      firstname: user.firstname,
      email: user.email,
      token,
    });
  } catch (err) {
    return errorResponse(
      res,
      400,
      "Invalid data, Account creation failed",
      err.message,
    );
  }
};

/!* LOGIN ENDPOINT */;
export const login = async (req, res) => {
  try {
    const { firstname, email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return errorResponse(res, 400, "Invalid credentials, user not found");

    if (!user.isVerified)
      return errorResponse(res, 403, "Account not verified");

    const isMatch = await argon2.verify(user.password, password);

    if (!isMatch) return errorResponse(res, 400, "Invalid credentials");

    if (user.lastLoginProvider !== "email") {
      user.lastLoginProvider = "email";
      await user.save();
    }

    const token = generateToken(user._id);
    res.cookie("token", token, { httpOnly: true });

    return successResponse(res, 200, "Login successful", {
      _id: user._id,
      firstname: user.firstname,
      email: user.email,
      token,
    });
  } catch (err) {
    return errorResponse(res, 400, "Login Failed", err.message);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("plan");

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "User profile fetched", user);
  } catch (error) {
    console.error("GetMe Error:", error);
    return errorResponse(res, 500, "Server error fetching profile");
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  return successResponse(res, 200, "Logged out successfully");
};

// ! Facebook auth
export const facebookAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return errorResponse(res, 400, "Access token missing");
    }

    const fbRes = await axios.get("https://graph.facebook.com/me", {
      params: {
        fields: "id,name,email,picture",
        access_token: accessToken,
      },
    });

    const { id, name, email, picture } = fbRes.data;

    if (!email) {
      return errorResponse(res, 400, "Facebook account has no email");
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        firstname: name,
        email,
        facebookId: id,
        isVerified: true,
        lastLoginProvider: "facebook",
      });
    } else {
      if (user.facebookId && user.facebookId !== id) {
        return errorResponse(
          res,
          409,
          "This email is already linked to a different Facebook account",
        );
      }

      // Link facebook login for existing email users (email/password or google).
      if (!user.facebookId) {
        user.facebookId = id;
      }

      if (!user.isVerified) user.isVerified = true;
      user.lastLoginProvider = "facebook";
      await user.save();
    }

    // ✅ Use SAME token logic as login
    const token = generateToken(user._id);

    // ✅ Store token in cookie (same as login)
    res.cookie("token", token, { httpOnly: true });

    return successResponse(res, 200, "Facebook login successful", {
      _id: user._id,
      firstname: user.firstname,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error("Facebook Auth Error:", err.response?.data || err.message);
    return errorResponse(res, 500, "Facebook authentication failed");
  }
};
