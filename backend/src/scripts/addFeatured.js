import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "../models/service/service.model.js"; // adjust path if needed

dotenv.config();

async function migrateServices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Connected to database");

    const result = await Service.updateMany(
      { isFeatured: { $exists: false } },
      {
        $set: {
          isFeatured: false,
          featuredUntil: null
        }
      }
    );

    console.log(`✅ ${result.modifiedCount} services updated`);

    await mongoose.disconnect();

    console.log("🎉 Service migration completed");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateServices();