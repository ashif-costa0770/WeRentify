import User from "../../models/users/user.model.js";
import { generateToken } from "../../utils/token.js";
import { successResponse, errorResponse } from "../../utils/response.js";


export const loginWithPhone = async (req, res) => {
  const { mobileNumber, countryCode } = req.body;

  if (!mobileNumber || !countryCode) {
    return errorResponse(
      res,
      400,
      "Mobile number and country code are required",
    );
  }

  try {
    // 1. Check if user exists
    let user = await User.findOne({ mobileNumber });

    let isNewUser = false;

    if (!user) {
      // 2. Register new user if not exists
      isNewUser = true;
      user = await User.create({
        mobileNumber,
        countryCode,
        // Default values from schema will apply (role: user, mode: renter, etc.)
      });
    }

    // 3. Generate Token
    const token = generateToken(user._id);

    res.cookie("token", token, { httpOnly: true});

    // 5. Return Response
    return successResponse(
      res,
      200,
      isNewUser ? "User registered successfully" : "Login successful",
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        countryCode: user.countryCode,
        role: user.role,
        mode: user.mode,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isNewUser,
        token
      },
    );
  } catch (error) {
    console.error("Login Error:", error);
    return errorResponse(res, 500, "Server error during login");
  }
};


export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

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
