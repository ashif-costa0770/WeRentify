import Admin from "../models/admin.model.js";
import { generateToken } from "../utils/token.js";
import { successResponse, errorResponse } from "../utils/response.js";
import argon2 from "argon2";
import User from "../models/users/user.model.js";
import Listing from "../models/listing/listing.model.js";
import Service from "../models/service/service.model.js";
import Post from "../models/community/post.model.js";
import Comment from "../models/community/comment.model.js";
import Favorite from "../models/favorite.model.js";
import mongoose from "mongoose";

const getAdminCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const sameSite = (process.env.ADMIN_COOKIE_SAMESITE || (isProduction ? "none" : "lax")).toLowerCase();

  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  if (process.env.ADMIN_COOKIE_DOMAIN) {
    options.domain = process.env.ADMIN_COOKIE_DOMAIN;
  }

  return options;
};


//! Admin login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) {
    return errorResponse(res, 401, "Invalid credentials, admin not found");
  }

  const isMatch = await argon2.verify(admin.password, password);

  if (!isMatch) {
    return errorResponse(res, 401, "Invalid credentials, wrong password");
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = generateToken(admin._id, {
    secret: process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
    expiresIn: "7d",
  });

  res.cookie("adminToken", token, getAdminCookieOptions());

  return successResponse(res, 200, "Admin logged in successfully", {
    _id: admin._id,
    role: admin.role
  });
};


//! Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return errorResponse(res, 404, "Admin not found");
    }
    return successResponse(
      res,
      200,
      "Admin profile fetched successfully",
      admin,
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Server error fetching admin profile",
      error.message,
    );
  }
};


//! Admin logout
export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("adminToken", getAdminCookieOptions());
    return successResponse(res, 200, "Admin logged out successfully");
  } catch (error) {
    return errorResponse(res, 500, "Server error logging out admin", error.message);
  }
};


//! Get admin dashboard stats
export const getAdminDashboardStats = async (req, res) => {
  try {
    // Fetch all required counts with Promise.all for efficiency
    const [
      totalUsers,
      totalListings,
      totalServices,
      totalPosts
    ] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Service.countDocuments(),
      Post.countDocuments()
    ]);

    // Since Orders and Revenue are to be set to 0
    const totalOrders = 0;
    const revenue = 0;

    return successResponse(res, 200, "Dashboard stats fetched", {
      totalUsers,
      totalListings,
      totalServices,
      totalPosts,
      totalOrders,
      revenue
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch dashboard stats", error.message);
  }
};


//! Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    /* ------------------------------
       Search Condition
    ------------------------------ */

    const searchQuery = search
      ? {
          $or: [
            { firstname: { $regex: search, $options: "i" } },
            { lastname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    /* ------------------------------
       Fetch Users
    ------------------------------ */

    const users = await User.find(searchQuery)
      .select("firstname lastname email plan isActive createdAt")
      .populate("plan", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    /* ------------------------------
       Add Counts (simple version)
    ------------------------------ */

    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const listingsCount = await Listing.countDocuments({
          owner: user._id,
        });

        const servicesCount = await Service.countDocuments({
          owner: user._id,
        });

        return {
          _id: user._id,
          fullName: `${user.firstname || ""} ${user.lastname || ""}`,
          email: user.email,
          plan: user.plan?.name || "Basic",
          isActive: user.isActive,
          listingsCount,
          servicesCount,
          createdAt: user.createdAt,
        };
      })
    );

    const totalUsers = await User.countDocuments(searchQuery);

    return successResponse(res, 200, "Users fetched successfully", usersWithCounts, {
      total: totalUsers,
      page: pageNumber,
      pages: Math.ceil(totalUsers / pageSize),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return errorResponse(res, 500, "Failed to fetch users", error.message);
  }
};

//! Deactivate user
export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
    return successResponse(res, 200, "User deactivated successfully", user);
  } catch (error) {
    return errorResponse(res, 500, "Failed to deactivate user", error.message);
  }
};

//! Activate user
export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
    return successResponse(res, 200, "User activated successfully", user);
  } catch (error) {
    return errorResponse(res, 500, "Failed to activate user", error.message);
  }
};

//! Delete user by admin
export const deleteUserByAdmin = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      await session.abortTransaction();
      return errorResponse(res, 400, "Invalid user ID");
    }

    const user = await User.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();
      return errorResponse(res, 404, "User not found");
    }

    /* -----------------------------------------------------------
       Optional Safety Checks
    ----------------------------------------------------------- */

    // Prevent admin from deleting himself
    if (req.admin && req.admin._id.toString() === userId) {
      await session.abortTransaction();
      return errorResponse(res, 400, "Admin cannot delete his own account");
    }

    /* -----------------------------------------------------------
       STEP 1: Fetch comments BEFORE deletion
    ----------------------------------------------------------- */

    const comments = await Comment.find({ user: userId })
      .select("post")
      .session(session);

    const postMap = {};

    comments.forEach((comment) => {
      const postId = comment.post.toString();
      postMap[postId] = (postMap[postId] || 0) + 1;
    });

    /* -----------------------------------------------------------
       STEP 2: Decrement commentsCount accurately
    ----------------------------------------------------------- */

    for (const postId in postMap) {
      await Post.findByIdAndUpdate(
        postId,
        { $inc: { commentsCount: -postMap[postId] } },
        { session }
      );
    }

    /* -----------------------------------------------------------
       STEP 3: Delete dependent documents
    ----------------------------------------------------------- */

    await Listing.deleteMany({ owner: userId }).session(session);
    await Service.deleteMany({ owner: userId }).session(session);
    await Post.deleteMany({ author: userId }).session(session);
    await Comment.deleteMany({ user: userId }).session(session);
    await Favorite.deleteMany({ user: userId }).session(session);

    /* -----------------------------------------------------------
       STEP 4: Delete user
    ----------------------------------------------------------- */

    await User.findByIdAndDelete(userId).session(session);

    await session.commitTransaction();

    return successResponse(res, 200, "User deleted successfully by admin", {
      _id: user._id,
      email: user.email,
    });
  } catch (error) {
    await session.abortTransaction();

    return errorResponse(res, 500, "Failed to delete user", error.message);
  } finally {
    session.endSession();
  }
};


//! Get user details by admin
export const getUserDetailsByAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
      .select("-password")
      .populate("plan");

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const [
      listingsCount,
      servicesCount,
      postsCount,
      commentsCount,
      lastListing,
      lastService,
      lastPost,
    ] = await Promise.all([
      Listing.countDocuments({ owner: userId }),
      Service.countDocuments({ owner: userId }),
      Post.countDocuments({ author: userId }),
      Comment.countDocuments({ user: userId }),
      Listing.findOne({ owner: userId })
        .select("itemName status createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      Service.findOne({ owner: userId })
        .select("businessName status createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      Post.findOne({ author: userId })
        .select("title createdAt")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const recentContent = [];

    if (lastListing) {
      recentContent.push({
        id: String(lastListing._id),
        title: lastListing.itemName || "Untitled Listing",
        type: "Listing",
        status: lastListing.status || "active",
        createdAt: lastListing.createdAt,
      });
    }

    if (lastService) {
      recentContent.push({
        id: String(lastService._id),
        title: lastService.businessName || "Untitled Service",
        type: "Service",
        status: lastService.status || "active",
        createdAt: lastService.createdAt,
      });
    }

    if (lastPost) {
      recentContent.push({
        id: String(lastPost._id),
        title: lastPost.title || "Untitled Post",
        type: "Post",
        status: "published",
        createdAt: lastPost.createdAt,
      });
    }

    recentContent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return successResponse(res, 200, "User details fetched successfully", {
      user,
      stats: {
        listingsCount,
        servicesCount,
        postsCount,
        commentsCount,
      },
      recentContent,
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch user details", error.message);
  }
};
