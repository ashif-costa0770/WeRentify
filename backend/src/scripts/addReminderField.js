// import mongoose from "mongoose";
// import Booking from "../models/booking.model.js";
// import dotenv from "dotenv";

// dotenv.config();

// const migrate = async () => {
//   try {

//     await mongoose.connect(process.env.MONGO_URI);

//     console.log("Connected to DB");

//     const result = await Booking.updateMany(
//       { reminderSent: { $exists: false } },
//       { $set: { reminderSent: false } }
//     );

//     console.log("Migration completed");
//     console.log(`Updated ${result.modifiedCount} bookings`);

//     process.exit();

//   } catch (error) {
//     console.error("Migration failed:", error);
//     process.exit(1);
//   }
// // }

// migrate();