import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    channel: { type: String, enum: ["email", "phone"], required: true },
    identifier: { type: String, required: true },    // email or E.164 phone
    purpose: { type: String, enum: ["signup", "login"], required: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ channel: 1, identifier: 1, purpose: 1 }, { unique: true });

export default mongoose.model("Otp", OtpSchema);
