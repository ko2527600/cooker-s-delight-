import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiChartBar, HiBolt } from "react-icons/hi2";
import { motion, AnimatePresence } from "motion/react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password, rememberMe });
      login(response.data.user, response.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-body">
      {/* Left Column - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Admin Background"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        
        <div className="relative z-10 p-20 flex flex-col justify-between w-full">
          <div>
            <h1 className="text-6xl font-display font-bold text-white mb-2">Cookers Delight</h1>
            <p className="text-brand-orange text-2xl font-display italic">Great Foods. Great People.</p>
          </div>
          
          <div className="flex gap-4">
            {[
              { icon: <HiLockClosed size={14} />, text: "Secure Admin Portal" },
              { icon: <HiChartBar size={14} />, text: "Full Analytics" },
              { icon: <HiBolt size={14} />, text: "Real-time Updates" }
            ].map((pill) => (
              <span key={pill.text} className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white border border-white/10 font-bold whitespace-nowrap">
                <span className="text-[#EC4824]">{pill.icon}</span>
                {pill.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 bg-[#0f0f0f] flex items-center justify-center p-8 md:p-20">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-12">
            <h2 className="text-5xl font-display font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-[#EC4824] font-bold tracking-widest uppercase text-xs">Admin Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative group">
                <HiEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-orange transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-brand-orange outline-none transition-all"
                  placeholder="admin@cookersdelight.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-4">Password</label>
              <div className="relative group">
                <HiLockClosed className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-orange transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:border-brand-orange outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <HiEyeSlash size={20} /> : <HiEye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4">
              <input 
                type="checkbox" 
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-5 h-5 accent-[#EC4824] cursor-pointer rounded-lg"
              />
              <label htmlFor="rememberMe" className="text-white/40 text-sm cursor-pointer hover:text-white/60 transition-colors">
                Keep me logged in for 30 days
              </label>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: [0, -10, 10, -10, 10, 0], opacity: 1 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-bold"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#EC4824] hover:bg-[#EC4824]/90 text-white py-5 rounded-2xl font-bold text-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-brand-orange/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
              Default: admin@cookersdelight.com / CookersAdmin2026!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
