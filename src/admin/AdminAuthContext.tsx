import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue>({
  user: null, token: null, loading: true,
  login: async () => {}, logout: () => {},
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

const TOKEN_KEY = 'cd_admin_token';
const USER_KEY  = 'cd_admin_user';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken]   = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser]     = useState<AdminUser | null>(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_TI_API_URL}/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Invalid credentials');

      const data = await res.json();
      const tok  = data.token ?? data.access_token ?? data.data?.token;
      const usr  = data.user  ?? data.data?.user ?? { id: 1, name: email, email, role: 'admin' };

      localStorage.setItem(TOKEN_KEY, tok);
      localStorage.setItem(USER_KEY, JSON.stringify(usr));
      setToken(tok);
      setUser(usr);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
