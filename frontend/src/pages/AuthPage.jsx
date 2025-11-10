// src/pages/AuthPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Login from "../components/Login";
import Signup from "../components/SignUp";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // state controls which modal to show
  const [mode, setMode] = useState("login"); // "login" | "signup"

  // When user logs in (auth.user becomes truthy), redirect to original destination
  useEffect(() => {
    if (user) {
      const dest = location.state?.from?.pathname || "/";
      navigate(dest, { replace: true });
    }
  }, [user, location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="w-full max-w-2xl">
        {/* small header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
          <p className="text-sm text-gray-600 mt-1">Log in or sign up to continue</p>
        </div>

        {/* Buttons to switch between login & signup modals */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`px-4 py-2 rounded-md ${mode === "login" ? "bg-white shadow-sm" : "bg-white/60"} border`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`px-4 py-2 rounded-md ${mode === "signup" ? "bg-white shadow-sm" : "bg-white/60"} border`}
          >
            Sign up
          </button>
        </div>

        {/* Render the modal components (they already have animation + closing handlers).
            We pass onClose just to keep API consistent; AuthPage will automatically redirect when auth.user appears. */}
        {mode === "login" ? (
          <Login onClose={() => { /* user can still close—AuthPage will stay */ }} />
        ) : (
          <Signup onClose={() => setMode("login")} />
        )}

        {/* Helpful copy for users who close modal */}
        <div className="mt-6 text-center text-sm text-gray-500">
          If you close the modal, you can open it again from this page.
        </div>
      </div>
    </div>
  );
}
