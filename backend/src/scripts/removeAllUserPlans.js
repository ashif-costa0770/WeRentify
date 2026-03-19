// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import User from "../models/users/user.model.js";

// dotenv.config();

// const removeAllUserPlans = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("Connected to database");

//     const usersWithPlan = await User.countDocuments({
//       plan: { $exists: true, $ne: null },
//     });

//     const result = await User.updateMany(
//       { plan: { $exists: true } },
//       { $unset: { plan: "" } },
//     );

//     console.log("User plan cleanup completed");
//     console.log(`Users that had a plan: ${usersWithPlan}`);
//     console.log(`Matched users: ${result.matchedCount}`);
//     console.log(`Modified users: ${result.modifiedCount}`);
//   } catch (error) {
//     console.error("Failed to remove user plans:", error);
//     process.exitCode = 1;
//   } finally {
//     await mongoose.connection.close();
//   }
// };

// removeAllUserPlans();
