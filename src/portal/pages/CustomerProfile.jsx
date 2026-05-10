import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  HiOutlineUser, HiOutlineEnvelope, HiOutlinePhone, 
  HiOutlineShieldCheck, HiOutlineTrash, HiOutlineArrowRight,
  HiOutlineCalendar, HiOutlineShoppingBag, HiOutlineBanknotes, HiOutlineStar,
  HiLockClosed
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { useCustomer } from '../CustomerContext';
import api from '../../api/axios';

const ProfileCard = ({ title, icon: Icon, children }) => (
  <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
    <div className="flex items-center gap-3">
       <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand-orange">
          <Icon size={22} />
       </div>
       <h4 className="text-lg font-black text-white uppercase tracking-tight">{title}</h4>
    </div>
    {children}
  </div>
);

const CustomerProfile = () => {
  const { customer, refreshCustomer } = useCustomer();
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/customers/auth/profile', profileData);
      toast.success('Profile updated successfully');
      refreshCustomer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await api.patch('/customers/auth/change-password', passwordData);
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      
      {/* Profile Header Card */}
      <section className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform" />
         
         <div className="flex flex-col md:flex-row items-center gap-10 relative z-10 text-center md:text-left">
            <div className="relative">
               <div className="w-32 h-32 rounded-full border-4 border-brand-orange p-1 overflow-hidden shadow-2xl">
                  {customer?.avatar ? (
                    <img src={customer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-brand-orange/10 rounded-full flex items-center justify-center text-4xl font-black text-brand-orange">
                      {customer?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
               </div>
               <div className="absolute bottom-1 right-1 w-8 h-8 bg-green-500 border-4 border-[#1a1a1a] rounded-full" />
            </div>

            <div className="flex-1 space-y-4">
               <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter">{customer?.name}</h2>
                  <p className="text-white/40 font-medium">{customer?.email}</p>
               </div>
               <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-white/60">
                     <HiOutlineCalendar className="text-brand-orange" /> Joined {new Date(customer?.createdAt).toLocaleDateString()}
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-white/60">
                     <HiOutlineShieldCheck className="text-green-400" /> Account Verified
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                  <p className="text-xl font-black text-white">{customer?.loyaltyPoints}</p>
                  <p className="text-[8px] text-white/40 uppercase font-black tracking-widest">Points</p>
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center">
                  <p className="text-xl font-black text-brand-orange">VIP</p>
                  <p className="text-[8px] text-white/40 uppercase font-black tracking-widest">Status</p>
               </div>
            </div>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         {/* Personal Info Form */}
         <ProfileCard title="Personal Information" icon={HiOutlineUser}>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                     <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-orange transition-colors" size={20} />
                     <input 
                        type="text" 
                        value={profileData.name}
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-brand-orange outline-none transition-all"
                     />
                  </div>
               </div>
               <div className="space-y-2 opacity-50">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Email (Immutable)</label>
                  <div className="relative">
                     <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                     <input type="email" value={customer?.email} disabled className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white/40 cursor-not-allowed" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                     <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-orange transition-colors" size={20} />
                     <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-brand-orange outline-none transition-all"
                     />
                  </div>
               </div>
               <button 
                 disabled={loading}
                 className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
               >
                 {loading ? 'SAVING...' : 'SAVE CHANGES'}
               </button>
            </form>
         </ProfileCard>

         <div className="space-y-10">
            {/* Password Form (Only for non-Google users) */}
            {!customer?.googleId && (
              <ProfileCard title="Update Password" icon={HiLockClosed}>
                 <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Current Password</label>
                       <input 
                          type="password" 
                          required
                          value={passwordData.currentPassword}
                          onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-white focus:border-brand-orange outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">New Password</label>
                       <input 
                          type="password" 
                          required
                          value={passwordData.newPassword}
                          onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-white focus:border-brand-orange outline-none transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Confirm New Password</label>
                       <input 
                          type="password" 
                          required
                          value={passwordData.confirmPassword}
                          onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3.5 text-sm text-white focus:border-brand-orange outline-none transition-all"
                       />
                    </div>
                    <button 
                      disabled={loading}
                      className="w-full bg-white text-[#1a1a1a] font-black py-4 rounded-2xl hover:scale-105 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
                    >
                      UPDATE PASSWORD
                    </button>
                 </form>
              </ProfileCard>
            )}

            {/* Account Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-8 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                     <HiOutlineTrash size={22} />
                  </div>
                  <h4 className="text-lg font-black text-red-500 uppercase tracking-tight">Danger Zone</h4>
               </div>
               <p className="text-xs text-white/40 leading-relaxed font-medium">Permanently delete your account and all associated data, including order history and loyalty points. This action cannot be undone.</p>
               <button className="w-full border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest">
                  DELETE MY ACCOUNT
               </button>
            </div>
         </div>

      </div>

    </div>
  );
};

export default CustomerProfile;
