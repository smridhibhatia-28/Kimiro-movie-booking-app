// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MoviesDebug from "./components/MoviesDebug";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Footer from "./components/Footer";
import MovieDetail from "./pages/MovieDetail";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";         // create later or stub
// import Bookings from "./pages/Bookings";       // create later or stub
import { useAuth } from "./context/AuthContext";
import ShowtimeBooking from "./pages/ShowtimeBooking";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { authModal, closeAuthModal } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 to-purple-50 text-gray-800">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <Routes>
          {/* Public: movies grid */}
          <Route path="/" element={<MoviesDebug />} />

          {/* Public: movie detail page (deep-linkable) */}
          <Route path="/movie/:id" element={<MovieDetail />} />

          {/* Dedicated auth page that mounts Login/Signup (redirects after login) */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Convenience: /login -> /auth */}
          <Route path="/login" element={<Navigate to="/auth" replace />} />

          {/* Protected routes (require login) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          /> */}

          {/* Catch-all: redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />

          <Route path="/movie/:id/book" element={<ShowtimeBooking />} />

        </Routes>
      </main>

      <Footer />

      {/* Central modal mount: shows Login or Signup when opened via openAuthModal */}
      {authModal?.mode === "login" && <Login onClose={() => closeAuthModal()} />}
      {authModal?.mode === "signup" && <SignUp onClose={() => closeAuthModal()} />}
    </div>
  );
}
