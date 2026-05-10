import React, { createContext, useContext, useState, useEffect } from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("cd_admin_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        const storedToken = localStorage.getItem("cd_admin_token");
        if (storedToken) setToken(storedToken);
      } catch (err) {
        setUser(null);
        setToken(null);
        localStorage.removeItem("cd_admin_token");
        localStorage.removeItem("cd_admin_user");
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("cd_admin_token", userToken);
    localStorage.setItem("cd_admin_user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem("cd_admin_token");
    localStorage.removeItem("cd_admin_user");
    window.location.href = "/admin/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-brand-orange rounded-full animate-spin"/>
          <p className="text-white/30 text-sm">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
