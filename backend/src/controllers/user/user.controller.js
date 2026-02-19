import User from "../../models/users/user.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { uploadBufferToCloudinary } from "../../config/cloudinary.js";
import { cloudinary } from "../../config/cloudinary.js";
import OTP from "../../models/users/otp.model.js";
import { sendOtpEmail } from "../../utils/mailer.js";
import { generateOtp } from "../../utils/opt.js";
import argon2 from "argon2";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstname, lastname, phone } = req.body;

    const user = await User.findById(userId);

    if (!user) return errorResponse(res, 404, "User not found");

    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(
        req.file.buffer,
        "user-profile/avatar",
        "image",
      );

      if (user.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }

      user.avatar = {
        public_id: uploadResult.public_id,
        url: uploadResult.url,
      };
    }

    if (firstname !== undefined) user.firstname = firstname;
    if (lastname !== undefined) user.lastname = lastname;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    return successResponse(res, 200, "Profile updated", user);
  } catch (error) {
    return errorResponse(res, 400, "Profile update failed", error.message);
  }
};

export const sendPasswordChangeOtp = async (req, res) => {
  try {
    const email = req.user?.email;

    if (!email) return errorResponse(res, 401, "Unauthorized");

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 404, "User not found");

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt, isVerified: false });

    await sendOtpEmail(email, otp);
    return successResponse(res, 200, "OTP sent successfully");
  } catch (error) {
    return errorResponse(res, 400, "Failed to send OTP", error.message);
  }
};

export const verifyPasswordChangeOtp = async (req, res) => {
  try {
    const email = req.user?.email;
    const { otp } = req.body;

    if (!email) return errorResponse(res, 401, "Unauthorized");

    const record = await OTP.findOne({ email, otp });
    if (!record) return errorResponse(res, 400, "Invalid OTP");
    if (record.expiresAt < new Date()) {
      return errorResponse(res, 400, "OTP expired");
    }

    record.isVerified = true;
    await record.save();

    return successResponse(res, 200, "OTP verified successfully");
  } catch (err) {
    return errorResponse(res, 400, "OTP verification failed", err.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const email = req.user?.email;


    if (password.length < 6) {
      return errorResponse(res, 400, "Password must be at least 6 characters");
    }

    if (!email) return errorResponse(res, 401, "Unauthorized");

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 404, "User not found");

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) return errorResponse(res, 400, "OTP not found");
    if (!otpRecord.isVerified) return errorResponse(res, 400, "OTP not verified");

    const hashedPassword = await argon2.hash(password);

    user.password = hashedPassword;
    await user.save();

    await OTP.deleteMany({ email });

    return successResponse(res, 200, "Password changed successfully", {
      _id: user._id,
      email: user.email,
    });
  } catch (err) {
    return errorResponse(res, 400, "Password change failed", err.message);
  }
};
