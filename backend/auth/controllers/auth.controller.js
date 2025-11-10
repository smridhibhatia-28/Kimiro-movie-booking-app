import User from "../models/User.js";
import { createOtp, verifyOtp } from "../services/otp.service.js";
import { sendEmailOtp } from "../services/email.service.js";
// import { sendSmsOtp } from "../services/sms.service.js";
import { signAccess } from "../services/token.service.js";
// import { normalizePhone } from "../utils/normalize.js";

/* -------------------------------- SIGNUP (EMAIL) -------------------------------- */

/** Step 1: Request email OTP */
export async function signupRequestEmailOtp(req, res) {
  try {
    const { email, name } = req.body;
    const lower = email.toLowerCase().trim();

    const exists = await User.findOne({ email: lower });
    if (exists) return res.status(409).json({ error: "EMAIL_EXISTS" });

    const otp = await createOtp({ channel: "email", identifier: lower, purpose: "signup" });

    // mock for dev — remove when email service connected
    console.log(`[Signup OTP to ${lower}] ${otp}`);
    await sendEmailOtp(lower, otp, { name });

    res.json({ ok: true });
  } catch (err) {
    console.error("signupRequestEmailOtp error:", err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
}

/** Step 2: Verify email OTP and create user */
export async function signupVerifyEmailOtp(req, res) {
  try {
    const { email, otp, name } = req.body;
    const lower = email.toLowerCase().trim();

    const v = await verifyOtp({ channel: "email", identifier: lower, purpose: "signup", otp });
    if (!v.ok) return res.status(400).json(v);

    const exists = await User.findOne({ email: lower });
    if (exists) return res.status(409).json({ error: "EMAIL_EXISTS" });

    const user = await User.create({
      email: lower,
      name,
      providers: { emailOtp: { verified: true, lastAt: new Date() } }
    });

    const accessToken = signAccess(user);
    res.json({ accessToken, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("signupVerifyEmailOtp error:", err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
}




/* -------------------------------- LOGIN (EMAIL) -------------------------------- */

/** Step 1: Request email OTP */
export async function loginEmailRequestOtp(req, res) {
  try {
    const { email } = req.body;
    const lower = email.toLowerCase().trim();

    const user = await User.findOne({ email: lower });
    if (!user) return res.status(404).json({ error: "EMAIL_NOT_FOUND", hint: "Sign up first" });

    const otp = await createOtp({ channel: "email", identifier: lower, purpose: "login" });

    console.log(`[Login OTP to ${lower}] ${otp}`);
    await sendEmailOtp(lower, otp, { name: user.name });

    res.json({ ok: true });
  } catch (err) {
    console.error("loginEmailRequestOtp error:", err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
}

/** Step 2: Verify email OTP and issue token */
export async function loginEmailVerifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const lower = email.toLowerCase().trim();

    const v = await verifyOtp({ channel: "email", identifier: lower, purpose: "login", otp });
    if (!v.ok) return res.status(400).json(v);

    const user = await User.findOne({ email: lower });
    if (!user) return res.status(404).json({ error: "EMAIL_NOT_FOUND" });

    const accessToken = signAccess(user);
    res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error("loginEmailVerifyOtp error:", err);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
}
