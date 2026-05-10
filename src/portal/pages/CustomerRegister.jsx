import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  HiOutlineEnvelope, HiLockClosed, HiOutlineEye, HiOutlineEyeSlash, 
  HiOutlineUser, HiOutlinePhone, HiOutlineArrowRight, HiOutlineShieldCheck
} from 'react-icons/hi2';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';
import { useCustomer } from '../CustomerContext';
import api from '../../api/axios';

const CustomerRegister = () => {
  const navigate = useNavigate();
  const { login } = useCustomer();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '' 
  });

  const passwordStrength = useMemo(() => {
    const pw = formData.password;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score += 25;
    if (/[A-Z]/.test(pw)) score += 25;
    if (/[0-9]/.test(pw)) score += 25;
    if (/[^A-Za-z0-9]/.test(pw)) score += 25;
    return score;
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordStrength < 50) {
      return toast.error('Please choose a stronger password');
    }

    setLoading(true);
    try {
      const res = await api.post('/customers/auth/register', formData);
      login(res.data.token, res.data.customer);
      toast.success('Account created! Welcome! 🎉');
      toast('You earned 50 bonus points! 🎁', { icon: '⭐' });
      navigate('/portal/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await api.post('/customers/auth/google', { 
        credential: response.credential 
      });
      login(res.data.token, res.data.customer);
      toast.success('Registered with Google! 👋');
      navigate('/portal/dashboard');
    } catch (err) {
      toast.error('Google Sign-Up failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex overflow-hidden">
      
      {/* Right Column (Form) is now on mobile/tablet primarily, Desktop gets split */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 blur-[120px] rounded-full lg:hidden" />
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8 relative z-10 py-10"
        >
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Join the Club</h2>
            <p className="text-white/40 font-medium text-sm">Register to start earning loyalty points with every order.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                    <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-orange transition-colors" size={20} />
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-brand-orange transition-all text-sm"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                    <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-orange transition-colors" size={20} />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-brand-orange transition-all text-sm"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                    <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-orange transition-colors" size={20} />
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="024 XXX XXXX"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-brand-orange transition-all text-sm"
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                    <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-orange transition-colors" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder="Create password"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-white focus:outline-none focus:border-brand-orange transition-all text-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                    >
                      {showPassword ? <HiOutlineEyeSlash size={20} /> : <HiOutlineEye size={20} />}
                    </button>
                </div>
                {/* Strength Meter */}
                <div className="flex gap-1 px-1 h-1">
                   <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 25 ? 'bg-red-500' : 'bg-white/5'}`} />
                   <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 50 ? 'bg-orange-500' : 'bg-white/5'}`} />
                   <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 75 ? 'bg-yellow-500' : 'bg-white/5'}`} />
                   <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 100 ? 'bg-green-500' : 'bg-white/5'}`} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                    <HiOutlineShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-orange transition-colors" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Repeat password"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-brand-orange transition-all text-sm"
                    />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-2 group transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              {loading ? 'CREATING ACCOUNT...' : (
                <>
                  CREATE PORTAL ACCOUNT
                  <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <span className="relative px-4 bg-[#0f0f0f] text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Or use Google</span>
          </div>

          <div className="flex justify-center">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => toast.error('Google Register Error')}
              theme="filled_black"
              shape="circle"
              size="large"
              text="signup_with"
              width="320"
            />
          </div>

          <p className="text-center text-sm font-medium text-white/40 pb-10">
            Already have an account? {' '}
            <Link to="/portal/login" className="text-brand-orange font-bold hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>

      {/* Left Column (Branding/Image) */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1a1a1a]">
        <div className="absolute inset-0 z-0 overflow-hidden">
           <img 
            src="/assets/cookers delight4.webp" 
            alt="Delicious food" 
            className="w-full h-full object-cover opacity-40 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-tl from-[#0f0f0f] via-transparent to-brand-orange/20" />
        </div>
        
        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center text-white shadow-2xl">
              <span className="text-2xl font-black">CD</span>
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-white">Cookers <span className="text-brand-orange">Delight</span></span>
          </div>

          <div>
             <motion.h1 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl font-black tracking-tighter leading-tight text-white mb-6"
            >
              START <br /> <span className="text-brand-orange">EARNING.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/60 max-w-sm font-medium"
            >
              Get 50 bonus points immediately upon registration. Every order brings you closer to free rewards.
            </motion.p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl self-start">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white font-black text-xs">🎁</div>
                <span className="text-sm font-black text-white uppercase tracking-tight">Registration Bonus</span>
             </div>
             <p className="text-xs text-white/60">Your first 50 points are on the house!</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerRegister;
