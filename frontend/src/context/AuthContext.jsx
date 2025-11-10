// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const TOKEN_KEY = "kimiro_access_token";
const USER_KEY = "kimiro_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // --- Modal state for login/signup prompt ---
  // modal.mode: null | 'login' | 'signup'
  // modal.onSuccess: optional callback to run after login/signup completes
  const [authModal, setAuthModal] = useState({ mode: null, onSuccess: null });

  const [toast, setToast] = useState(null); // { msg, id }

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  // login: store token + user and show toast
  const login = useCallback(({ token: tkn, user: usr, showToast = true }) => {
    if (tkn) setToken(tkn);
    if (usr) setUser(usr);
    if (showToast && usr && usr.name) {
      const first = String(usr.name).split(" ")[0] || usr.name;
      const id = Date.now();
      setToast({ msg: `Hello ${first}`, id });
      setTimeout(() => setToast(null), 3000);
    }

    // run modal onSuccess if present
    setAuthModal((m) => {
      if (m?.onSuccess) {
        try { m.onSuccess(usr); } catch (e) { /* ignore */ }
      }
      return { ...m, mode: null, onSuccess: null };
    });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // auth modal helpers exposed to components
  const openAuthModal = useCallback((mode = "login", onSuccess = null) => {
    setAuthModal({ mode, onSuccess });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal({ mode: null, onSuccess: null });
  }, []);

  return (
    <AuthContext.Provider value={{
      token, user, login, logout, toast, setToast,
      // modal controls:
      authModal, openAuthModal, closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
