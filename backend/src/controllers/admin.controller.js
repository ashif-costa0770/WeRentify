import Admin from "../models/admin.model.js";
import { generateToken } from "../utils/token.js";
import { successResponse, errorResponse } from "../utils/response.js";
import argon2 from "argon2";
import User from "../models/users/user.model.js";
import Listing from "../models/listing/listing.model.js";
import Service from "../models/service/service.model.js";
import Category from "../models/category.model.js";
import Plan from "../models/plan.model.js";
import Post from "../models/community/post.model.js";
import Comment from "../models/community/comment.model.js";
import Favorite from "../models/favorite.model.js";
import mongoose from "mongoose";
import { deleteMultipleFromCloudinary } from "../config/cloudinary.js";
import stripe from "../config/stripe.js";

const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

const isLocalRequestHost = (req) => {
  const rawHost =
    req?.headers?.["x-forwarded-host"] || req?.headers?.host || "";
  const host = rawHost.split(",")[0]?.trim().split(":")[0]?.toLowerCase();

  return LOCALHOST_HOSTNAMES.has(host);
};

const getAdminCookieOptions = (req) => {
  const isProduction = process.env.NODE_ENV === "production";
  const secureOverride = process.env.ADMIN_COOKIE_SECURE;
  const secure =
    typeof secureOverride === "string"
      ? secureOverride.toLowerCase() === "true"
      : isProduction;
  const requestedSameSiteRaw = (
    process.env.ADMIN_COOKIE_SAMESITE || (secure ? "none" : "lax")
  ).toLowerCase();
  const requestedSameSite = ["strict", "lax", "none"].includes(
    requestedSameSiteRaw,
  )
    ? requestedSameSiteRaw
    : secure
      ? "none"
      : "lax";
  const sameSite =
    requestedSameSite === "none" && !secure ? "lax" : requestedSameSite;

  const options = {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  if (process.env.ADMIN_COOKIE_DOMAIN && !isLocalRequestHost(req)) {
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

  res.cookie("adminToken", token, getAdminCookieOptions(req));

  return successResponse(res, 200, "Admin logged in successfully", {
    _id: admin._id,
    role: admin.role,
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
    res.clearCookie("adminToken", getAdminCookieOptions(req));
    return successResponse(res, 200, "Admin logged out successfully");
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Server error logging out admin",
      error.message,
    );
  }
};

//! Get admin dashboard stats
export const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      totalServices,
      totalPosts,
      latestListing,
      latestService,
      latestPost,
      latestPlanPurchase,
    ] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Service.countDocuments(),
      Post.countDocuments(),
      Listing.findOne()
        .select("itemName status createdAt updatedAt owner")
        .populate("owner", "firstname lastname email")
        .sort({ updatedAt: -1, createdAt: -1 })
        .lean(),
      Service.findOne()
        .select("businessName status createdAt updatedAt owner")
        .populate("owner", "firstname lastname email")
        .sort({ updatedAt: -1, createdAt: -1 })
        .lean(),
      Post.findOne()
        .select("title createdAt updatedAt author")
        .populate("author", "firstname lastname email")
        .sort({ updatedAt: -1, createdAt: -1 })
        .lean(),
      User.findOne({ plan: { $ne: null } })
        .select("firstname lastname createdAt updatedAt plan")
        .populate("plan", "name")
        .sort({ updatedAt: -1, createdAt: -1 })
        .lean(),
    ]);

    const totalOrders = 0;
    const revenue = 0;

    const recentActivity = [
      latestListing
        ? {
            id: String(latestListing._id),
            title: latestListing.itemName || "Untitled Listing",
            type: "Listing",
            status: latestListing.status || "active",
            user:
              `${latestListing?.owner?.firstname || ""} ${latestListing?.owner?.lastname || ""}`.trim() ||
              latestListing?.owner?.email ||
              "Unknown",
            createdAt: latestListing.updatedAt || latestListing.createdAt,
          }
        : null,
      latestService
        ? {
            id: String(latestService._id),
            title: latestService.businessName || "Untitled Service",
            type: "Service",
            status: latestService.status || "active",
            user:
              `${latestService?.owner?.firstname || ""} ${latestService?.owner?.lastname || ""}`.trim() ||
              latestService?.owner?.email ||
              "Unknown",
            createdAt: latestService.updatedAt || latestService.createdAt,
          }
        : null,
      latestPost
        ? {
            id: String(latestPost._id),
            title: latestPost.title || "Untitled Post",
            type: "Post",
            status: "live",
            user:
              `${latestPost?.author?.firstname || ""} ${latestPost?.author?.lastname || ""}`.trim() ||
              latestPost?.author?.email ||
              "Unknown",
            createdAt: latestPost.updatedAt || latestPost.createdAt,
          }
        : null,
      latestPlanPurchase
        ? {
            id: `plan-purchase-${latestPlanPurchase._id}`,
            title: `${latestPlanPurchase?.plan?.name || "Basic"} Plan`,
            type: "Plan",
            status: "paid",
            user:
              `${latestPlanPurchase.firstname || ""} ${latestPlanPurchase.lastname || ""}`.trim() ||
              "Unknown",
            createdAt: latestPlanPurchase.updatedAt || latestPlanPurchase.createdAt,
          }
        : null,
    ]
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);

    return successResponse(res, 200, "Dashboard stats fetched", {
      totalUsers,
      totalListings,
      totalServices,
      totalPosts,
      totalOrders,
      revenue,
      recentActivity,
    });
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to fetch dashboard stats",
      error.message,
    );
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

    let matchingPlanIds = [];
    if (search) {
      const matchingPlans = await Plan.find({
        name: { $regex: search, $options: "i" },
      })
        .select("_id")
        .lean();
      matchingPlanIds = matchingPlans.map((plan) => plan._id);
    }

    const searchQuery = search
      ? {
          $or: [
            { firstname: { $regex: search, $options: "i" } },
            { lastname: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            ...(matchingPlanIds.length > 0 ? [{ plan: { $in: matchingPlanIds } }] : []),
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
      }),
    );

    const totalUsers = await User.countDocuments(searchQuery);

    return successResponse(
      res,
      200,
      "Users fetched successfully",
      usersWithCounts,
      {
        total: totalUsers,
        page: pageNumber,
        pages: Math.ceil(totalUsers / pageSize),
      },
    );
  } catch (error) {
    console.error("Admin users error:", error);
    return errorResponse(res, 500, "Failed to fetch users", error.message);
  }
};

//! Deactivate user
export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true },
    );
    return successResponse(res, 200, "User deactivated successfully", user);
  } catch (error) {
    return errorResponse(res, 500, "Failed to deactivate user", error.message);
  }
};

//! Activate user
export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true },
    );
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
        { session },
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
    return errorResponse(
      res,
      500,
      "Failed to fetch user details",
      error.message,
    );
  }
};

//! Get all listings with pagination (admin)
export const getAllListingsByAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * pageSize;

    let matchingCategoryIds = [];
    if (search) {
      const matchingCategories = await Category.find({
        name: { $regex: search, $options: "i" },
      })
        .select("_id")
        .lean();
      matchingCategoryIds = matchingCategories.map((category) => category._id);
    }

    const searchQuery = search
      ? {
          $or: [
            { itemName: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { pickupLocation: { $regex: search, $options: "i" } },
            ...(matchingCategoryIds.length > 0
              ? [{ category: { $in: matchingCategoryIds } }]
              : []),
          ],
        }
      : {};

    const [listings, total] = await Promise.all([
      Listing.find(searchQuery)
        .select(
          "itemName dailyRate status isAvailable bookings createdAt owner category",
        )
        .populate("owner", "email firstname lastname _id")
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Listing.countDocuments(searchQuery),
    ]);

    const data = listings.map((listing) => ({
      _id: listing._id,
      itemName: listing.itemName,
      dailyRate: listing.dailyRate,
      bookings: listing.bookings ?? 0,
      status: listing.status,
      isAvailable: listing.isAvailable,
      createdAt: listing.createdAt,
      category: listing?.category?.name || "-",
      owner: {
        _id: listing?.owner?._id || null,
        email: listing?.owner?.email || "-",
        fullName:
          `${listing?.owner?.firstname || ""} ${listing?.owner?.lastname || ""}`.trim() ||
          "Unknown owner",
      },
    }));

    return successResponse(res, 200, "Listings fetched successfully", {
      listings: data,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch listings", error.message);
  }
};

//! Get listing details by admin
export const getListingDetailsByAdmin = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId)
      .populate(
        "owner",
        "email firstname lastname avatar _id isActive createdAt",
      )
      .populate("category", "name")
      .lean();

    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }

    const normalized = {
      _id: listing._id,
      itemName: listing.itemName,
      description: listing.description || "",
      category: listing?.category?.name || "-",
      pickupLocation: listing.pickupLocation || "-",
      status: listing.status || "inactive",
      isAvailable: Boolean(listing.isAvailable),
      offerDelivery: Boolean(listing.offerDelivery),
      deliveryFee: listing.deliveryFee,
      cancellationPolicy: listing.cancellationPolicy || "-",
      features: Array.isArray(listing.features) ? listing.features : [],
      rentalRules: Array.isArray(listing.rentalRules)
        ? listing.rentalRules
        : [],
      dailyRate: listing.dailyRate,
      hourlyRate: listing.hourlyRate,
      weeklyRate: listing.weeklyRate,
      views: listing.views ?? 0,
      bookings: listing.bookings ?? 0,
      rating: listing.rating ?? 0,
      reviewCount: listing.reviewCount ?? 0,
      photos: Array.isArray(listing.photos) ? listing.photos : [],
      videos: Array.isArray(listing.videos) ? listing.videos : [],
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      owner: {
        _id: listing?.owner?._id || null,
        email: listing?.owner?.email || "-",
        fullName:
          `${listing?.owner?.firstname || ""} ${listing?.owner?.lastname || ""}`.trim() ||
          "Unknown owner",
        isActive: Boolean(listing?.owner?.isActive),
        joinedAt: listing?.owner?.createdAt || null,
      },
    };

    return successResponse(
      res,
      200,
      "Listing details fetched successfully",
      normalized,
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to fetch listing details",
      error.message,
    );
  }
};

//! Get all services with pagination (admin)
export const getAllServicesByAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * pageSize;

    let matchingCategoryIds = [];
    if (search) {
      const matchingCategories = await Category.find({
        name: { $regex: search, $options: "i" },
      })
        .select("_id")
        .lean();
      matchingCategoryIds = matchingCategories.map((category) => category._id);
    }

    const searchQuery = search
      ? {
          $or: [
            { businessName: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { serviceType: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            ...(matchingCategoryIds.length > 0
              ? [{ category: { $in: matchingCategoryIds } }]
              : []),
          ],
        }
      : {};

    const [services, total] = await Promise.all([
      Service.find(searchQuery)
        .select(
          "businessName serviceType hourlyRate status verified bookings createdAt owner category photos videos",
        )
        .populate("owner", "email firstname lastname _id")
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Service.countDocuments(searchQuery),
    ]);

    const data = services.map((service) => ({
      _id: service._id,
      businessName: service.businessName,
      serviceType: service.serviceType,
      hourlyRate: service.hourlyRate,
      status: service.status,
      verified: Boolean(service.verified),
      bookings: service.bookings ?? 0,
      createdAt: service.createdAt,
      category: service?.category?.name || "-",
      owner: {
        _id: service?.owner?._id || null,
        email: service?.owner?.email || "-",
        fullName:
          `${service?.owner?.firstname || ""} ${service?.owner?.lastname || ""}`.trim() ||
          "Unknown owner",
      },
    }));

    return successResponse(res, 200, "Services fetched successfully", {
      services: data,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch services", error.message);
  }
};

//! Get service details by admin
export const getServiceDetailsByAdmin = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findById(serviceId)
      .populate(
        "owner",
        "email firstname lastname avatar _id isActive createdAt",
      )
      .populate("category", "name")
      .lean();

    if (!service) {
      return errorResponse(res, 404, "Service not found");
    }

    const normalized = {
      _id: service._id,
      businessName: service.businessName,
      serviceType: service.serviceType || "-",
      category: service?.category?.name || "-",
      yearsInBusiness: service.yearsInBusiness ?? 0,
      description: service.description || "",
      location: service.location || "-",
      serviceRadius: service.serviceRadius ?? 0,
      phone: service.phone || "-",
      email: service.email || "-",
      website: service.website || "-",
      certifications: service.certifications || "-",
      hourlyRate: service.hourlyRate || "-",
      plan: service.plan || "basic",
      views: service.views ?? 0,
      bookings: service.bookings ?? 0,
      rating: service.rating ?? 0,
      reviewCount: service.reviewCount ?? 0,
      status: service.status || "inactive",
      verified: Boolean(service.verified),
      photos: Array.isArray(service.photos) ? service.photos : [],
      videos: Array.isArray(service.videos) ? service.videos : [],
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      owner: {
        _id: service?.owner?._id || null,
        email: service?.owner?.email || "-",
        fullName:
          `${service?.owner?.firstname || ""} ${service?.owner?.lastname || ""}`.trim() ||
          "Unknown owner",
        isActive: Boolean(service?.owner?.isActive),
        joinedAt: service?.owner?.createdAt || null,
      },
    };

    return successResponse(
      res,
      200,
      "Service details fetched successfully",
      normalized,
    );
  } catch (error) {
    return errorResponse(
      res,
      500,
      "Failed to fetch service details",
      error.message,
    );
  }
};

//! Get all posts with pagination (admin)
export const getAllPostsByAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * pageSize;

    const searchQuery = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { type: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [posts, total] = await Promise.all([
      Post.find(searchQuery)
        .select(
          "title description type category location dateNeeded budget likes commentsCount saves createdAt author",
        )
        .populate("author", "email firstname lastname _id")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Post.countDocuments(searchQuery),
    ]);

    const data = posts.map((post) => ({
      _id: post._id,
      title: post.title,
      type: post.type,
      category: post.category,
      location: post.location,
      dateNeeded: post.dateNeeded,
      budget: post.budget || "-",
      commentsCount: post.commentsCount ?? 0,
      likesCount: Array.isArray(post.likes) ? post.likes.length : 0,
      savesCount: Array.isArray(post.saves) ? post.saves.length : 0,
      createdAt: post.createdAt,
      author: {
        _id: post?.author?._id || null,
        email: post?.author?.email || "-",
        fullName:
          `${post?.author?.firstname || ""} ${post?.author?.lastname || ""}`.trim() ||
          "Unknown author",
      },
    }));

    return successResponse(res, 200, "Posts fetched successfully", {
      posts: data,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch posts", error.message);
  }
};

//! Get post details by admin
export const getPostDetailsByAdmin = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId)
      .populate("author", "email firstname lastname avatar _id isActive createdAt")
      .lean();

    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    const normalized = {
      _id: post._id,
      title: post.title,
      description: post.description || "",
      type: post.type || "-",
      category: post.category || "-",
      location: post.location || "-",
      dateNeeded: post.dateNeeded || null,
      budget: post.budget || "-",
      commentsCount: post.commentsCount ?? 0,
      likesCount: Array.isArray(post.likes) ? post.likes.length : 0,
      savesCount: Array.isArray(post.saves) ? post.saves.length : 0,
      photos: Array.isArray(post.photos) ? post.photos : [],
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        _id: post?.author?._id || null,
        email: post?.author?.email || "-",
        fullName:
          `${post?.author?.firstname || ""} ${post?.author?.lastname || ""}`.trim() ||
          "Unknown author",
        isActive: Boolean(post?.author?.isActive),
        joinedAt: post?.author?.createdAt || null,
      },
    };

    return successResponse(res, 200, "Post details fetched successfully", normalized);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch post details", error.message);
  }
};

//! Get all plans with pagination (admin)
export const getAllPlansByAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * pageSize;

    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { currency: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [plans, total] = await Promise.all([
      Plan.find(searchQuery).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      Plan.countDocuments(searchQuery),
    ]);

    return successResponse(res, 200, "Plans fetched successfully", {
      plans,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.max(Math.ceil(total / pageSize), 1),
      },
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch plans", error.message);
  }
};

//! Create plan by admin
export const createPlanByAdmin = async (req, res) => {
  try {
    const {
      name,
      price,
      currency,
      platformFeePercent,
      features,
      popular = false,
      isActive = true,
    } = req.body;

    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) {
      return errorResponse(res, 400, "Plan already exists");
    }

    const priceInSmallestUnit = Math.round(Number(price) * 100);

    const product = await stripe.products.create({ name });
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: priceInSmallestUnit,
      currency,
      recurring: { interval: "month" },
    });

    const plan = await Plan.create({
      name,
      price,
      currency,
      stripePriceId: stripePrice.id,
      stripeProductId: product.id,
      platformFeePercent,
      features,
      popular,
      isActive,
    });

    return successResponse(res, 201, "Plan created successfully", plan);
  } catch (error) {
    return errorResponse(res, 500, "Failed to create plan", error.message);
  }
};

//! Get plan details by admin
export const getPlanDetailsByAdmin = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await Plan.findById(planId).lean();

    if (!plan) {
      return errorResponse(res, 404, "Plan not found");
    }

    return successResponse(res, 200, "Plan details fetched successfully", plan);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch plan details", error.message);
  }
};

//! Update plan by admin
export const updatePlanByAdmin = async (req, res) => {
  try {
    const { planId } = req.params;
    const {
      name,
      price,
      currency,
      platformFeePercent,
      features,
      popular,
      isActive,
    } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return errorResponse(res, 404, "Plan not found");
    }

    if (name !== undefined && name !== plan.name) {
      const existingPlan = await Plan.findOne({ name, _id: { $ne: planId } });
      if (existingPlan) {
        return errorResponse(res, 400, "Plan name already exists");
      }
      plan.name = name;
    }

    if (price !== undefined && Number(price) !== Number(plan.price)) {
      const priceInSmallestUnit = Math.round(Number(price) * 100);
      const stripePrice = await stripe.prices.create({
        product: plan.stripeProductId,
        unit_amount: priceInSmallestUnit,
        currency: currency || plan.currency,
        recurring: { interval: "month" },
      });

      plan.stripePriceId = stripePrice.id;
      plan.price = Number(price);
    }

    if (currency !== undefined) plan.currency = currency;
    if (platformFeePercent !== undefined) plan.platformFeePercent = platformFeePercent;
    if (features !== undefined) plan.features = features;
    if (popular !== undefined) plan.popular = popular;
    if (isActive !== undefined) plan.isActive = isActive;

    await plan.save();

    return successResponse(res, 200, "Plan updated successfully", plan);
  } catch (error) {
    return errorResponse(res, 500, "Failed to update plan", error.message);
  }
};

//! Deactivate plan by admin
export const deactivatePlanByAdmin = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await Plan.findById(planId);

    if (!plan) {
      return errorResponse(res, 404, "Plan not found");
    }

    plan.isActive = false;
    await plan.save();

    return successResponse(res, 200, "Plan deactivated successfully", plan);
  } catch (error) {
    return errorResponse(res, 500, "Failed to deactivate plan", error.message);
  }
};

//! Activate plan by admin
export const activatePlanByAdmin = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await Plan.findById(planId);

    if (!plan) {
      return errorResponse(res, 404, "Plan not found");
    }

    plan.isActive = true;
    await plan.save();

    return successResponse(res, 200, "Plan activated successfully", plan);
  } catch (error) {
    return errorResponse(res, 500, "Failed to activate plan", error.message);
  }
};

//! Delete listing by admin
export const deleteListingByAdmin = async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return errorResponse(res, 404, "Listing not found");
    }

    if (listing.photos?.length) {
      await deleteMultipleFromCloudinary(
        listing.photos.map((photo) => photo.public_id),
        "image",
      );
    }

    if (listing.videos?.length) {
      await deleteMultipleFromCloudinary(
        listing.videos.map((video) => video.public_id),
        "video",
      );
    }

    await Listing.findByIdAndDelete(listingId);
    return successResponse(res, 200, "Listing deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete listing", error.message);
  }
};

//! Delete post by admin
export const deletePostByAdmin = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    await Comment.deleteMany({ post: postId });
    await Post.findByIdAndDelete(postId);

    return successResponse(res, 200, "Post deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete post", error.message);
  }
};

//! Delete service by admin
export const deleteServiceByAdmin = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);

    if (!service) {
      return errorResponse(res, 404, "Service not found");
    }

    if (service.photos?.length) {
      await deleteMultipleFromCloudinary(
        service.photos.map((photo) => photo.public_id),
        "image",
      );
    }

    if (service.videos?.length) {
      await deleteMultipleFromCloudinary(
        service.videos.map((video) => video.public_id),
        "video",
      );
    }

    await Service.findByIdAndDelete(serviceId);
    return successResponse(res, 200, "Service deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete service", error.message);
  }
};

//!Toggle listing status by admin
export const toggleListingStatusByAdmin = async (req, res) =>{
  try {
    const {listingId} = req.params;
    const listing = await Listing.findById(listingId);
    if(!listing){
      return errorResponse(res, 404, "Listing not found");
    }
    listing.status = listing.status === "active" ? "inactive" : "active";
    await listing.save();
    return successResponse(res, 200, "Listing status updated successfully", listing);
  } catch (error) {
    return errorResponse(res, 500, "Failed to update listing status", error.message);    
  }
}

//!Toggle service status by admin
export const toggleServiceStatusByAdmin = async (req, res) =>{
  try {
    const {serviceId} = req.params;
    const service = await Service.findById(serviceId);
    if(!service){
      return errorResponse(res, 404, "Service not found");
    }
    service.status = service.status === "active" ? "inactive" : "active";
    await service.save();
    return successResponse(res, 200, "Service status updated successfully", service);
  } catch (error) {
    return errorResponse(res, 500, "Failed to update service status", error.message);    
  }
}
