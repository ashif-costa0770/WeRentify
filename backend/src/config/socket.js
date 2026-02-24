import jwt from "jsonwebtoken";
import User from "../models/users/user.model.js";

const extractTokenFromCookie = (cookieHeader) => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");

  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split("=");

    if (key === "token") return value; // your cookie name
  }

  return null;
};

export const initSocket = (io) => {
  /* -------------------------------------------------- */
  /* ✅ AUTH USING HTTP-ONLY COOKIE */
  /* -------------------------------------------------- */

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;

      const token = extractTokenFromCookie(cookieHeader);

      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded?.id);

      if (!user) return next(new Error("Unauthorized"));

      socket.userId = user._id.toString();   // ✅ IMPORTANT
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  /* -------------------------------------------------- */
  /* ✅ CONNECTION */
  /* -------------------------------------------------- */

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.userId);

    socket.join(socket.userId);

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.userId);
    });
  });
};