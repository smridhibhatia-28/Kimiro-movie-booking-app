import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  signupRequestEmailOtp,
  signupVerifyEmailOtp,
  loginEmailRequestOtp,
  loginEmailVerifyOtp
} from "../controllers/auth.controller.js";

const router = Router();

const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

const emailReq = z.object({ email: z.string().email(), name: z.string().min(2).max(60) });
const emailVerify = z.object({ email: z.string().email(), otp: z.string().length(6), name: z.string().min(2).max(60) });


const validate = (schema) => (req, res, next) => {
  const out = schema.safeParse(req.body);
  if (!out.success) return res.status(400).json({ error: "VALIDATION_ERROR", details: out.error.flatten() });
  req.body = out.data;
  next();
};

router.post("/signup/email/request-otp", requestLimiter, validate(emailReq), signupRequestEmailOtp);
router.post("/signup/email/verify-otp",  requestLimiter, validate(emailVerify), signupVerifyEmailOtp);


router.post(
  "/login/email/request-otp",
  requestLimiter,
  validate(z.object({ email: z.string().email() })),
  loginEmailRequestOtp
);

router.post(
  "/login/email/verify-otp",
  requestLimiter,
  validate(z.object({ email: z.string().email(), otp: z.string().regex(/^\d{6}$/) })),
  loginEmailVerifyOtp
);


export default router;
