// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import argon2 from "argon2";
// import Admin from "../models/admin.model.js";

// dotenv.config();

// const createAdmin = async () => {
//   await mongoose.connect(process.env.MONGO_URI);

//   const exists = await Admin.findOne({ role: "admin" });
//   if (exists) {
//     console.log("Admin already exists");
//     process.exit();
//   }

//   const hashedPassword = await argon2.hash(process.env.INIT_ADMIN_PASSWORD);

//   await Admin.create({
//     name: "Admin",
//     email: "admin@weblistify.com",
//     password: hashedPassword,
//     role: "admin",
//   });

//   console.log("Admin created successfully");
//   process.exit();
// };

// createAdmin();