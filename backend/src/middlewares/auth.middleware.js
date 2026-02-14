import jwt from "jsonwebtoken";
import User from "../models/users/user.model.js";
import { errorResponse } from "../utils/response.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization) {
    // Get token from header
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded?.id);
      if (!req.user) {
        return errorResponse(res, 401, "Not authorized, user not found");
      }
      next();
    } catch (error) {
      console.error(error);
      return errorResponse(res, 401, "Not authorized, token failed");
    }
  }

  if (!token) {
    return errorResponse(res, 401, "Not authorized, no token");
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return errorResponse(res, 403, "Not authorized as an admin");
  }
};
