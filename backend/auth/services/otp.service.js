import crypto from "crypto";
import Otp from "../models/Otp.js";

const OTP_LEN = 6;
const OTP_TTL_MIN = Number(process.env.OTP_TTL_MIN || 10);

function genOtp() {
  return String(Math.floor(10 ** (OTP_LEN - 1) + Math.random() * 9 * 10 ** (OTP_LEN - 1)));
}
function hashOtp(otp) {
  return crypto.createHmac("sha256", process.env.OTP_SECRET).update(otp).digest("hex");
}

export async function createOtp({ channel, identifier, purpose }) {
  const otp = genOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
  await Otp.findOneAndUpdate(
    { channel, identifier, purpose },
    { otpHash, attempts: 0, expiresAt },
    { upsert: true, setDefaultsOnInsert: true }
  );
  return otp;
}

export async function verifyOtp({ channel, identifier, purpose, otp }) {
  const rec = await Otp.findOne({ channel, identifier, purpose });
  if (!rec) return { ok: false, reason: "OTP_NOT_FOUND" };
  if (rec.expiresAt < new Date()) return { ok: false, reason: "OTP_EXPIRED" };
  if (rec.attempts >= 5) return { ok: false, reason: "OTP_MAX_ATTEMPTS" };

  const valid = rec.otpHash === hashOtp(otp);
  if (!valid) {
    await Otp.updateOne({ _id: rec._id }, { $inc: { attempts: 1 } });
    return { ok: false, reason: "OTP_INVALID", attemptsLeft: Math.max(0, 4 - rec.attempts) };
  }
  await Otp.deleteOne({ _id: rec._id }); // one-time
  return { ok: true };
}
