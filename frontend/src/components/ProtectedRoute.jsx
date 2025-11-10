// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // redirect to /auth and remember where the user wanted to go
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
