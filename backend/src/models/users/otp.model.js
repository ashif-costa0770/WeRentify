import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expiresAt: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
   lastSentAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
