import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  HiOutlineStar, HiOutlineShoppingBag, HiOutlineChatBubbleLeftRight,
  HiOutlineGift, HiOutlineArrowRight, HiLockClosed,
  HiOutlineCalendarDays, HiOutlineInformationCircle
} from 'react-icons/hi2';
import { useCustomer } from '../CustomerContext';
import api from '../../api/axios';

const LoyaltyPoints = () => {
  const { customer } = useCustomer();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/customers/profile'); // Includes loyaltyHistory
        setHistory(res.data.loyaltyHistory || []);
      } catch (err) {
        console.error('Failed to fetch loyalty history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const totalEarned = history.filter(h => h.type === 'credit').reduce((sum, h) => sum + h.points, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      
      {/* Hero Points Card */}
      <section className="bg-gradient-to-br from-[#872735] to-[#EC4824] rounded-[3rem] p-12 text-center relative overflow-hidden group shadow-2xl shadow-brand-orange/20">
         <div className="absolute inset-0 bg-[url('/assets/cookers delight4.webp')] bg-cover bg-center opacity-10 mix-blend-overlay scale-110 group-hover:scale-125 transition-transform duration-1000" />
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
         
         <div className="relative z-10 space-y-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto border border-white/20 shadow-2xl"
            >
               <HiOutlineStar size={48} className="text-yellow-400 animate-pulse" />
            </motion.div>
            <div>
               <motion.h2 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.1 }}
                 className="text-6xl font-black text-white tracking-tighter"
               >
                 {customer?.loyaltyPoints || 0} <span className="text-3xl text-white/60">PTS</span>
               </motion.h2>
               <p className="text-white/60 font-bold uppercase tracking-[0.3em] text-xs mt-2">Available Loyalty Balance</p>
            </div>
            <div className="inline-block px-6 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-white/80 text-xs font-bold uppercase tracking-widest">
               Approximate Value: ₵{(customer?.loyaltyPoints || 0) / 10}
            </div>
         </div>
      </section>

      {/* How it Works Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { title: 'Place Orders', desc: 'Earn 1 point for every ₵10 spent on any meal.', icon: HiOutlineShoppingBag, color: 'text-orange-400' },
           { title: 'Write Reviews', desc: 'Earn 10 bonus points for every review approved.', icon: HiOutlineChatBubbleLeftRight, color: 'text-blue-400' },
           { title: 'Welcome Gift', desc: 'Get 50 points instantly when you create an account.', icon: HiOutlineGift, color: 'text-yellow-400' }
         ].map((item, i) => (
           <motion.div 
             key={item.title}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 + 0.2 }}
             className="bg-[#141414] border border-white/5 p-8 rounded-[2.5rem] space-y-4 hover:bg-white/[0.03] transition-all"
           >
              <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ${item.color}`}>
                 <item.icon size={24} />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-tight">{item.title}</h4>
              <p className="text-sm text-white/40 leading-relaxed font-medium">{item.desc}</p>
           </motion.div>
         ))}
      </section>

      {/* History & Redemption */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* History Table */}
         <section className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
               <HiOutlineCalendarDays className="text-brand-orange" />
               Points History
            </h3>

            <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/20">
                        <th className="px-8 py-4">Date</th>
                        <th className="px-8 py-4">Activity</th>
                        <th className="px-8 py-4 text-right">Points</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {loading ? (
                        <tr><td colSpan="3" className="px-8 py-10 text-center animate-pulse text-white/10">Loading history...</td></tr>
                     ) : history.length > 0 ? history.map((h) => (
                        <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                           <td className="px-8 py-5 text-xs text-white/40 font-bold uppercase tracking-tighter">
                              {new Date(h.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </td>
                           <td className="px-8 py-5">
                              <p className="text-sm font-bold text-white/80">{h.description}</p>
                           </td>
                           <td className={`px-8 py-5 text-right font-black ${h.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                              {h.type === 'credit' ? `+${h.points}` : `-${h.points}`}
                           </td>
                        </tr>
                     )) : (
                        <tr><td colSpan="3" className="px-8 py-20 text-center text-white/20 uppercase font-black text-xs tracking-widest">No transaction history</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
         </section>

         {/* Redeem Sidebar */}
         <section className="space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
               <HiOutlineGift className="text-brand-orange" />
               Redeem Rewards
            </h3>
            
            <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
               <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/40 border border-white/10">
                     <HiLockClosed size={28} />
                  </div>
                  <div className="text-center">
                     <p className="text-sm font-black text-white uppercase tracking-widest">Coming Soon</p>
                     <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">Reward Store Opening Soon</p>
                  </div>
               </div>
               
               <div className="space-y-6 relative z-10 opacity-30 grayscale">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-white uppercase">₵20 Discount</span>
                        <span className="text-[10px] bg-brand-orange text-white px-2 py-0.5 rounded-full font-bold">200 PTS</span>
                     </div>
                     <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="bg-brand-orange h-full w-[25%]" />
                     </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-white uppercase">Free Jollof Bowl</span>
                        <span className="text-[10px] bg-brand-orange text-white px-2 py-0.5 rounded-full font-bold">500 PTS</span>
                     </div>
                     <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="bg-brand-orange h-full w-[10%]" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-brand-orange/5 border border-brand-orange/10 p-8 rounded-[2.5rem] space-y-4">
               <div className="flex items-center gap-3">
                  <HiOutlineInformationCircle className="text-brand-orange" size={24} />
                  <span className="text-sm font-black text-white uppercase tracking-tight">Terms & Conditions</span>
               </div>
               <p className="text-[10px] text-white/40 leading-relaxed font-medium">Points expire 12 months after earning. Rewards cannot be exchanged for cash. Standard terms apply to all loyalty transactions.</p>
            </div>
         </section>

      </div>

    </div>
  );
};

export default LoyaltyPoints;
