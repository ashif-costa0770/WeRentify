// import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config();

// const MONGO_URI = process.env.MONGO_URI; // replace with your DB connection
// if (!MONGO_URI) {
//   console.error("Missing MONGO_URI in environment.");
//   process.exit(1);
// }

// async function migrateServices() {
//   try {
//     await mongoose.connect(MONGO_URI);

//     const db = mongoose.connection.db;
//     const services = db.collection("services");

//     const defaultSlots = [
//       {
//         day: "Monday",
//         slots: ["09:00","10:00","11:00","12:00","14:00","15:00","16:00"]
//       },
//       {
//         day: "Tuesday",
//         slots: ["09:00","10:00","11:00","12:00","14:00","15:00","16:00"]
//       },
//       {
//         day: "Wednesday",
//         slots: ["09:00","10:00","11:00","12:00","14:00","15:00","16:00"]
//       },
//       {
//         day: "Thursday",
//         slots: ["09:00","10:00","11:00","12:00","14:00","15:00","16:00"]
//       },
//       {
//         day: "Friday",
//         slots: ["09:00","10:00","11:00","12:00","14:00","15:00","16:00"]
//       },
//       {
//         day: "Saturday",
//         slots: ["09:00","10:00","11:00","12:00","14:00","15:00","16:00"]
//       }
//     ];

//     const result = await services.updateMany(
//       {
//         serviceMode: { $exists: false }
//       },
//       {
//         $set: {
//           serviceMode: "onsite",
//           availableSlots: defaultSlots
//         }
//       }
//     );

//     console.log("Migration completed");
//     console.log("Updated services:", result.modifiedCount);

//     await mongoose.disconnect();
//   } catch (error) {
//     console.error("Migration failed:", error);
//   }
// }

// migrateServices();