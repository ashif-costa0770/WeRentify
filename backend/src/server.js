import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { connectDB } from "./config/index.js";
import listingRoutes from "./routes/listing/listing.route.js";
import serviceRoutes from "./routes/service/service.route.js"
import postRoutes from "./routes/community/post.route.js";
import commentRoutes from "./routes/community/comment.route.js";
import authRoutes from "./routes/user/auth.route.js";
import CategoryRoute from "./routes/category.route.js"
import favoriteRoute from "./routes/favorite.route.js"
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cookieParser());
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true,
//   }),
// );
app.use(
  cors({
    origin: true,          // ✅ Allow any origin dynamically
    credentials: true,
  })
);

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies


// Auth Routes
app.use("/api/auth", authRoutes);
// Listing Routes
app.use("/api/listings", listingRoutes);
// Community Routes
app.use("/api/posts", postRoutes);
app.use("/api/posts", commentRoutes);
// Services Routes
app.use("/api/services", serviceRoutes)
// Category Routes
app.use("/api/category", CategoryRoute)
// Add to favorite
app.use("/api/favorites", favoriteRoute)

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Root route
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Welcome to Rental Marketplace API" });
});

// 404 handler - Must be after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestedUrl: req.originalUrl,
  });
});

// Global error handler - Must be last
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Connect to MongoDB
await connectDB();

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 Server running on port ${PORT}         ║
║   📝 Environment: ${process.env.NODE_ENV || "development"}              ║
║   🌐 API URL: http://localhost:${PORT}      ║
╚════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  // Close server & exit process
  process.exit(1);
});
