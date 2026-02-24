import "dotenv/config";
import express from "express";
import http from "http";                  
import { Server } from "socket.io";      

import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import session from "express-session";

import passport from "./config/passport.js";
import { connectDB } from "./config/index.js";
import { initSocket } from "./config/socket.js";   

import listingRoutes from "./routes/listing/listing.route.js";
import serviceRoutes from "./routes/service/service.route.js";
import postRoutes from "./routes/community/post.route.js";
import commentRoutes from "./routes/community/comment.route.js";
import userRoutes from "./routes/user/user.route.js";
import authRoutes from "./routes/user/auth.route.js";
import CategoryRoute from "./routes/category.route.js";
import favoriteRoute from "./routes/favorite.route.js";
import messageRoutes from "./routes/messages/message.route.js";
import conversationRoutes from "./routes/messages/conversation.route.js";
import Conversation from "./models/messages/conversation.model.js";

const app = express();
const PORT = process.env.PORT || 5000;


/* MIDDLEWARES */
/* -------------------------------------------------- */

app.use(helmet());
app.use(compression());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:3000",
        "https://localhost:3000",
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Passport Session (Google Auth) */

app.use(
  session({
    secret: "google_auth_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ROUTES */
/* -------------------------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts", commentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/category", CategoryRoute);
app.use("/api/favorites", favoriteRoute);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);


/* HEALTH */
/* -------------------------------------------------- */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Rental Marketplace API",
  });
});


/* ERROR HANDLERS */
/* -------------------------------------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestedUrl: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});


/* DATABASE */
await connectDB();

/* One-time-safe index migration for conversations */
try {
  await Conversation.collection.dropIndex("participants_1_refId_1");
} catch (error) {
  if (error?.codeName !== "IndexNotFound") {
    throw error;
  }
}

/* Backfill participantsKey for older conversation documents */
const missingParticipantsKey = await Conversation.find({
  $or: [
    { participantsKey: { $exists: false } },
    { participantsKey: "" },
  ],
})
  .select("_id participants")
  .lean();

if (missingParticipantsKey.length > 0) {
  const ops = missingParticipantsKey
    .filter(
      (item) =>
        Array.isArray(item.participants) &&
        item.participants.length === 2,
    )
    .map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: {
          $set: {
            participantsKey: Conversation.buildParticipantsKey(item.participants),
          },
        },
      },
    }));

  if (ops.length > 0) {
    await Conversation.bulkWrite(ops);
  }
}

await Conversation.syncIndexes();


/* ✅ HTTP SERVER (REQUIRED FOR SOCKET.IO) */
/* -------------------------------------------------- */
const server = http.createServer(app);


/* ✅ SOCKET.IO INITIALIZATION */
/* -------------------------------------------------- */
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "https://localhost:3000",
    ].filter(Boolean),
    credentials: true,
  },
});

/* Delegate all socket logic */
initSocket(io);

/* SERVER START */
/* -------------------------------------------------- */
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 Server running on port ${PORT}         ║
║   📝 Environment: ${process.env.NODE_ENV || "development"}              ║
║   🌐 API URL: http://localhost:${PORT}      ║
╚════════════════════════════════════════════╝
  `);
});


/* PROCESS SAFETY */
/* -------------------------------------------------- */
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});

/* ✅ Export io for message system */
export { io };
