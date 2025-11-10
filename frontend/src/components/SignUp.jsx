import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

gsap.registerPlugin(useGSAP);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.4 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.3-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.3 18.9 12.7 24 12.7c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 16 4 9.2 8.5 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.1 0 9.9-1.7 13.5-4.7l-6.2-4.9c-2 1.4-4.6 2.2-7.3 2.2-5.1 0-9.5-3.5-11.1-8.2l-6.5 5C9.2 39.5 16 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3 5.3-5.6 6.9l6.2 4.9C38.6 37.2 44 31.7 44 24c0-1.3-.1-2.3-.4-3.5z"/>
  </svg>
);

const API_BASE = "http://localhost:3000";

const SignUp = ({ onClose, onLoginClick } = {}) => {
  const root = useRef(null);
  const backdrop = useRef(null);
  const panel = useRef(null);
  const nameRef = useRef(null);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("form"); // 'form' | 'verify'
  const [otp, setOtp] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useGSAP(() => {
    gsap.set(backdrop.current, { autoAlpha: 0 });
    gsap.set(panel.current, { autoAlpha: 0, y: 16, scale: 0.96 });

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(backdrop.current, { autoAlpha: 1, duration: 0.18 }, 0)
      .to(panel.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24 }, 0.05);

    gsap.delayedCall(0.25, () => nameRef.current?.focus());
  }, { scope: root });

  const closeWithAnim = (cb, callOnClose = true) => {
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    tl.to(panel.current, { autoAlpha: 0, y: 12, scale: 0.98, duration: 0.18 })
      .to(backdrop.current, { autoAlpha: 0, duration: 0.12 }, "-=0.08")
      .then(() => {
        cb?.();
        if (callOnClose) onClose?.();
      });
  };

  const handleClose = () => closeWithAnim();
  const onBackdropClick = (e) => { if (e.target === e.currentTarget) handleClose(); };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const requestSignupOtp = async (evt) => {
    evt?.preventDefault();
    setError("");
    if (!name.trim() || !email.includes("@") || !agree) {
      setError("Please fill name, valid email and agree to terms.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup/email/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setStep("verify");
    } catch (e) {
      setError(e.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifySignupOtp = async () => {
    setError("");
    if (otp.trim().length !== 6) {
      setError("Enter a 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup/email/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || JSON.stringify(data));

      const accessToken = data.accessToken;
      const userObj = data.user ?? null;

      if (accessToken) {
        let finalUser = userObj;
        if (!finalUser) {
          try {
            const p = await fetch(`${API_BASE}/api/users/me`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (p.ok) finalUser = await p.json();
          } catch (e) {}
        }

        auth.login({ token: accessToken, user: finalUser || { name } });

        // If auth modal was used, close it (AuthContext will also run onSuccess)
        if (auth?.authModal?.mode) {
          auth.closeAuthModal?.();
        } else {
          // redirect to original destination (if present) or home
          const dest = location.state?.from?.pathname || "/";
          navigate(dest, { replace: true });
        }

        handleClose();
      } else {
        throw new Error("Signup didn't return a token");
      }
    } catch (e) {
      setError(e.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const openGoogleSignup = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <div ref={root} className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-16" role="dialog" aria-modal="true" onClick={onBackdropClick}>
      <div ref={backdrop} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div ref={panel} className="relative w-[92%] max-w-xl rounded-xl bg-white p-6 sm:p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} aria-label="Close signup" className="absolute right-4 top-4 h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800">✕</button>

        <h2 className="mb-6 text-3xl font-semibold text-gray-900">Signup</h2>

        {step === "form" ? (
          <form onSubmit={requestSignupOtp}>
            <input ref={nameRef} type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 text-[15px] outline-none focus:border-transparent focus:ring-2 focus:ring-gray-800/20" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 text-[15px] outline-none focus:border-transparent focus:ring-2 focus:ring-gray-800/20" />

            <label className="mb-4 flex items-start gap-3 text-[14px] text-gray-600">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300" />
              <span>I agree to KIMIRO's Terms and Privacy Policy</span>
            </label>

            <button type="submit" disabled={loading} className={`mb-4 w-full rounded-md px-4 py-3 text-[16px] font-medium ${loading ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-gray-800 text-white hover:brightness-105"}`}>
              {loading ? "Sending..." : "Create account"}
            </button>
          </form>
        ) : (
          <>
            <p className="mb-3 text-sm text-gray-600">We sent a 6-digit code to <b>{email}</b>. Enter it below.</p>
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 text-[18px] tracking-widest text-center outline-none focus:border-transparent focus:ring-2 focus:ring-gray-800/20" />
            <div className="flex gap-2">
              <button onClick={verifySignupOtp} disabled={loading} className="flex-1 rounded-md bg-gray-800 px-4 py-3 text-[16px] font-medium text-white hover:brightness-105 disabled:opacity-60">{loading ? "Verifying..." : "Verify & Create"}</button>
              <button onClick={() => setStep("form")} className="rounded-md border border-gray-300 px-4 py-3 text-[15px] hover:bg-gray-50">Change</button>
            </div>
          </>
        )}

        <div className="my-4 flex items-center gap-3 text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          <span>or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button onClick={openGoogleSignup} className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 text-[15px] hover:bg-gray-50">
          <GoogleIcon />
          <span>Sign in with Google</span>
        </button>

        <p className="mt-6 text-center text-[15px] text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => closeWithAnim(() => onLoginClick?.(), false)}
            className="text-purple-500 hover:underline"
          >
            Login
          </button>
        </p>

        {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default SignUp;
