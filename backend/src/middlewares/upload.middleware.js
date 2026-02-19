import multer from "multer";

// Store files in memory (Buffer)
const storage = multer.memoryStorage();

// Allowed mime types
const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml"
];

const VIDEO_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime", // mov
  "video/x-msvideo", // avi
  "video/webm",
];

const ALLOWED_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];

// File filter based on types
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        "Invalid file type. Only images (jpg, png, webp, gif) and videos (mp4, mov, avi, webm) are allowed.",
      ),
      false,
    );
  }
  cb(null, true);
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 8, // total files (6 photos + 2 videos)
  },
});

// Listing media upload middleware
export const uploadListingMedia = upload.fields([
  { name: "photos", maxCount: 6 },
  { name: "videos", maxCount: 2 },
]);

// Multer error handler
export const handleMulterError = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File too large. Max size is 50MB per file.",
        });

      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many files uploaded.",
        });

      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Unexpected file field.",
        });

      default:
        return res.status(400).json({
          success: false,
          message: err.message,
        });
    }
  }

  // Custom / fileFilter errors
  return res.status(400).json({
    success: false,
    message: err.message || "File upload failed",
  });
};

// Category icon upload (single image only)
export const uploadCategoryIcon = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!IMAGE_TYPES.includes(file.mimetype)) {
      return cb(
        new Error("Only image files (jpg, png, webp, gif, svg) are allowed."),
        false
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max for icon
    files: 1,
  },
}).single("icon");

// Avatar upload (single image only)
export const uploadAvatar = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!IMAGE_TYPES.includes(file.mimetype)) {
      return cb(
        new Error("Only image files are allowed for avatar."),
        false
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // ⭐ 2MB is ideal for avatars
    files: 1,
  },
}).single("avatar");   // field name must match frontend
