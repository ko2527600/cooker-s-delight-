import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiOutlineEnvelope, HiLockClosed, HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowRight } from 'react-icons/hi2';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';
import { useCustomer } from '../CustomerContext';
import api from '../../api/axios';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const { login } = useCustomer();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/customers/auth/login', { ...formData, rememberMe });
      login(res.data.token, res.data.customer);
      toast.success('Welcome back! 👋');
      navigate('/portal/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      // Typically you'd send the credential to your backend
      const res = await api.post('/customers/auth/google', { 
        credential: response.credential 
      });
      login(res.data.token, res.data.customer);
      toast.success('Welcome back with Google! 👋');
      navigate('/portal/dashboard');
    } catch (err) {
      toast.error('Google Sign-In failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex overflow-hidden">
      
      {/* Left Column: Image/Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1a1a1a]">
        <div className="absolute inset-0 z-0 overflow-hidden">
           <img 
            src="/assets/jollof.jpg" 
            alt="Delicious food" 
            className="w-full h-full object-cover opacity-40 scale-110 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0f0f0f] via-transparent to-brand-orange/20" />
        </div>
        
        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <Link to="/" className="flex items-center gap-4">
             <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center text-white shadow-2xl">
              <span className="text-2xl font-black">CD</span>
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-white">Cookers <span className="text-brand-orange">Delight</span></span>
          </Link>

          <div>
             <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-black tracking-tighter leading-tight text-white mb-6"
            >
              WELCOME <br /> <span className="text-brand-orange">BACK.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/60 max-w-md font-medium"
            >
              Order your favourite meals, track your deliveries, and earn loyalty points with every bite.
            </motion.p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
               <p className="text-2xl font-black text-white">50+</p>
               <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Menu Items</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
               <p className="text-2xl font-black text-brand-orange">2k+</p>
               <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Happy Foodies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        {/* Subtle background glow for mobile */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 blur-[120px] rounded-full lg:hidden" />
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10 relative z-10"
        >
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Sign In</h2>
            <p className="text-white/40 font-medium">Access your portal account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
               <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
               <div className="relative group">
                  <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-orange transition-colors" size={20} />
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="name@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-brand-orange focus:bg-white/[0.07] transition-all"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Password</label>
                  <button type="button" className="text-[10px] font-bold text-brand-orange hover:underline uppercase tracking-wider">Forgot Password?</button>
               </div>
               <div className="relative group">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-orange transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white focus:outline-none focus:border-brand-orange focus:bg-white/[0.07] transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showPassword ? <HiOutlineEyeSlash size={20} /> : <HiOutlineEye size={20} />}
                  </button>
               </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <input 
                type="checkbox" 
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-5 h-5 accent-brand-orange cursor-pointer rounded-lg"
              />
              <label htmlFor="rememberMe" className="text-white/40 text-sm cursor-pointer hover:text-white/60 transition-colors">
                Keep me logged in for 30 days
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-2 group transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'AUTHENTICATING...' : (
                <>
                  SIGN IN TO PORTAL
                  <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <span className="relative px-4 bg-[#0f0f0f] text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Or continue with</span>
          </div>

          <div className="flex justify-center">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => toast.error('Google Login Error')}
              theme="filled_black"
              shape="circle"
              size="large"
              text="continue_with"
              width="320"
            />
          </div>

          <p className="text-center text-sm font-medium text-white/40">
            Don't have an account? {' '}
            <Link to="/portal/register" className="text-brand-orange font-bold hover:underline">Register here</Link>
          </p>

          <div className="pt-8 text-center">
             <Link to="/" className="text-[10px] font-bold text-white/20 hover:text-white uppercase tracking-widest transition-colors">
                ← Back to main website
             </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default CustomerLogin;
