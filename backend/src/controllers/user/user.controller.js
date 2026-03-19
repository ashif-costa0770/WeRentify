import User from "../../models/users/user.model.js";
import Favorite from "../../models/favorite.model.js";
import Listing from "../../models/listing/listing.model.js";
import Service from "../../models/service/service.model.js";
import Post from "../../models/community/post.model.js";
import Comment from "../../models/community/comment.model.js";
import mongoose from "mongoose";
import { successResponse, errorResponse } from "../../utils/response.js";
import { uploadBufferToCloudinary } from "../../config/cloudinary.js";
import { cloudinary } from "../../config/cloudinary.js";
import OTP from "../../models/users/otp.model.js";
import { sendOtpEmail } from "../../utils/mailer.js";
import { generateOtp } from "../../utils/opt.js";
import argon2 from "argon2";
import Plan from "../../models/plan.model.js";

const RESEND_COOLDOWN_SECONDS = 60;

export const switchToHost = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return errorResponse(res, 401, "Unauthorized");

    const basicPlan = await Plan.findOne({ name: "Basic" });
    if (!basicPlan) return errorResponse(res, 500, "Basic plan is not configured");

    const user = await User.findByIdAndUpdate(
      userId,
      { mode: "host", plan: basicPlan._id },
      { new: true, runValidators: true },
    ).populate("plan");

    if (!user) return errorResponse(res, 404, "User not found");
    return successResponse(res, 200, "Switched to host", user);
  } catch (error) {
    return errorResponse(res, 400, "Failed to switch to host", error.message);
  }
};

export const updateMyMode = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return errorResponse(res, 401, "Unauthorized");

    const { mode } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { mode },
      { new: true, runValidators: true },
    ).populate("plan");

    if (!user) return errorResponse(res, 404, "User not found");
    return successResponse(res, 200, "Mode updated", user);
  } catch (error) {
    return errorResponse(res, 400, "Failed to update mode", error.message);
  }
};

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

/**
 * Update the authenticated user's plan (e.g. downgrade to Basic).
 * Use this when the user selects Basic in the UI; paid upgrades go through Stripe + verifySession.
 */
export const updateMyPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const { plan } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { plan },
      { new: true, runValidators: true }
    );

    return successResponse(res, 200, "Plan updated", user);
  } catch (error) {
    return errorResponse(res, 400, "Plan update failed", error.message);
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

//! Otp resend with cooldown
export const resendPasswordChangeOtp = async (req, res) => {
  try {
    const email = req.user?.email;
    console.log(email);

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
    if (!otpRecord.isVerified)
      return errorResponse(res, 400, "OTP not verified");

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

//! Delete user with all details (listings, services, account, post, comment, favorites)

export const deleteUserAccount = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const email = req.user?.email;

    const user = await User.findOne({ email }).session(session);

    if (!user) {
      await session.abortTransaction();
      return errorResponse(res, 404, "User not found");
    }

    const userId = user._id;

    /* -----------------------------------------------------------
       STEP 1: Fetch comments BEFORE deletion
       We need them to fix commentsCount on posts
       ----------------------------------------------------------- */

    const comments = await Comment.find({ user: userId })
      .select("post")
      .session(session);

    /* -----------------------------------------------------------
       STEP 2: Build per-post decrement map
       Example:
         PostA → 3 comments
         PostB → 1 comment
       ----------------------------------------------------------- */

    const postMap = {};

    comments.forEach((comment) => {
      const postId = comment.post.toString();
      postMap[postId] = (postMap[postId] || 0) + 1;
    });

    //  STEP 3: Decrement counters accurately

    for (const postId in postMap) {
      await Post.findByIdAndUpdate(postId, {
        $inc: { commentsCount: -postMap[postId] },
      }).session(session);
    }

    //  STEP 4: Delete dependent documents

    await Listing.deleteMany({ owner: userId }).session(session);
    await Service.deleteMany({ owner: userId }).session(session);

    // ⚠ Ensure field name EXACTLY matches schema
    await Post.deleteMany({ author: userId }).session(session);

    await Comment.deleteMany({ user: userId }).session(session);
    await Favorite.deleteMany({ user: userId }).session(session);

    //  STEP 5: Delete user

    await User.findByIdAndDelete(userId).session(session);

    await session.commitTransaction();

    return successResponse(res, 200, "User account deleted successfully", {
      _id: userId,
      email: user.email,
    });
  } catch (error) {
    await session.abortTransaction();

    return errorResponse(res, 400, "Failed to delete user", error.message);
  } finally {
    session.endSession();
  }
};
