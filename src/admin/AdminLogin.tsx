import React, { useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminLogin() {
  const { login, loading } = useAdminAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="text-3xl font-black tracking-tight">
            Cookers<span className="text-[#EC4824]">Delight</span>
          </span>
          <p className="text-white/30 text-sm mt-2 uppercase tracking-widest font-bold">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#EC4824] focus:outline-none transition-colors"
              placeholder="admin@cookersdelight.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#EC4824] focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#EC4824] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#d4401f] disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
