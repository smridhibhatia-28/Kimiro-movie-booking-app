import mongoose from "mongoose";

const ProvidersSchema = new mongoose.Schema(
  {
    emailOtp: { verified: { type: Boolean, default: false }, lastAt: Date },
    phoneOtp: { verified: { type: Boolean, default: false }, lastAt: Date },
    google: { sub: String, emailVerified: Boolean, lastAt: Date }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    name: { type: String, required: true, trim: true },
    providers: { type: ProvidersSchema, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
