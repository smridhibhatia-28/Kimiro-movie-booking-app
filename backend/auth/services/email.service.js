// auth/services/email.service.js
import nodemailer from "nodemailer";

let _transporter = null;

function getTransporter() {
  // lazy init so env vars are available even if this module was imported early
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const secure = String(process.env.SMTP_SECURE || "false") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    // not configured — fall back to null and caller will log dev fallback
    console.warn("[email] SMTP not configured (SMTP_HOST/PORT/USER/PASS missing). Using console fallback.");
    return null;
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure, // true for 465, false for 587
    auth: { user, pass },
    greetTimeout: 5000,
    connectionTimeout: 5000,
  });

  // verify connection once
  _transporter.verify()
    .then(() => console.log("[email] SMTP transporter verified"))
    .catch((err) => console.error("[email] SMTP verify failed:", err?.message || err));

  return _transporter;
}

/**
 * sendEmailOtp(to, otp, { name } = {})
 * - tries to send via SMTP if configured
 * - else falls back to console log (dev)
 */
export async function sendEmailOtp(to, otp, { name } = {}) {
  const transporter = getTransporter();

  // Prefer EMAIL_FROM env, otherwise use a sane default
  const from = process.env.EMAIL_FROM || "KIMIRO <no-reply@kimiro.app>";
  console.log("[email] using FROM:", from, "TO:", to);

  const subject = "Your KIMIRO verification code";
  const text = `Hi${name ? " " + name : ""},\n\nYour verification code is ${otp}. It expires in ${process.env.OTP_TTL_MIN || 10} minutes.\n\n— KIMIRO`;
  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;line-height:1.4">
      <p>Hi${name ? " " + name : ""},</p>
      <p>Your verification code is</p>
      <div style="font-size:22px;font-weight:700;letter-spacing:4px;margin:10px 0">${otp}</div>
      <p>This code expires in ${process.env.OTP_TTL_MIN || 10} minutes.</p>
      <p style="color:#666;margin-top:8px">If you didn't request this, you can ignore this email.</p>
      <p style="margin-top:12px">— KIMIRO</p>
    </div>
  `;

  // If no transporter, fallback to console log for dev
  if (!transporter) {
    console.log(`[EMAIL DEV] to=${to} subject="${subject}" otp=${otp}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log("[email] SMTP sent:", info?.messageId || info);
    // nodemailer returns info with messageId, accepted, rejected etc.
    return info;
  } catch (err) {
    console.error("[email] SMTP send failed:", err?.message || err);
    // as a safety: fall back to console so devs still see the code
    console.log(`[EMAIL DEV-FALLBACK] to=${to} subject="${subject}" otp=${otp}`);
    return { error: err?.message || err };
  }
}
