import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineStar, HiOutlinePlus, HiOutlineTrash, 
  HiOutlineCheckCircle, HiOutlineClock, HiOutlineChatBubbleLeftEllipsis,
  HiOutlineArrowRight, HiStar
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [branches, setBranches] = useState([]);
  
  const [formData, setFormData] = useState({
    menuItemId: '',
    branchId: '',
    rating: 5,
    comment: ''
  });

  const fetchData = async () => {
    try {
      const [revRes, menuRes, branchRes] = await Promise.all([
        api.get('/customers/reviews'),
        api.get('/menu'),
        api.get('/branches')
      ]);
      setReviews(revRes.data);
      setMenuItems(menuRes.data);
      setBranches(branchRes.data);
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.comment.length < 20) return toast.error('Review must be at least 20 characters');
    if (!formData.menuItemId) return toast.error('Please select a menu item');
    
    setSubmitting(true);
    try {
      await api.post('/customers/reviews', formData);
      toast.success('Review submitted! It will appear once approved by admin.');
      toast('You will earn 10 points when approved! ⭐', { icon: '🎁' });
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/customers/reviews/${id}`);
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">My Reviews</h2>
          <p className="text-white/40 text-sm font-medium mt-1">Share your experience and earn loyalty points.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-brand-orange/20"
        >
           <HiOutlinePlus size={20} /> Write a Review
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.length > 0 ? reviews.map((review) => (
          <motion.div 
            key={review.id}
            layout
            className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-8 space-y-6 relative group hover:bg-white/[0.02] transition-all"
          >
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 text-yellow-400">
                   {[...Array(5)].map((_, i) => (
                      <HiStar key={i} size={18} className={i < review.rating ? 'text-yellow-400' : 'text-white/10'} />
                   ))}
                </div>
                {review.status === 'approved' ? (
                   <span className="flex items-center gap-1.5 text-[8px] bg-green-500/10 text-green-400 px-3 py-1 rounded-full font-black uppercase tracking-[0.2em]">
                      <HiOutlineCheckCircle /> Published
                   </span>
                ) : (
                   <span className="flex items-center gap-1.5 text-[8px] bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full font-black uppercase tracking-[0.2em]">
                      <HiOutlineClock /> Pending Approval
                   </span>
                )}
             </div>

             <div className="space-y-4">
                <div>
                   <p className="text-xs font-black text-brand-orange uppercase tracking-widest mb-1">{review.menuItem?.name || 'General Experience'}</p>
                   <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{review.branch?.name || 'Any Branch'}</p>
                </div>
                <p className="text-sm text-white/60 leading-relaxed italic">"{review.comment}"</p>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest pt-4">Submitted {new Date(review.createdAt).toLocaleDateString()}</p>
             </div>

             <div className="pt-6 border-t border-white/5 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(review.id)} className="p-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all">
                   <HiOutlineTrash size={18} />
                </button>
             </div>
          </motion.div>
        )) : (
          <div className="col-span-full bg-[#141414] border border-white/5 p-24 rounded-[3rem] text-center space-y-6">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                <HiOutlineChatBubbleLeftEllipsis size={40} />
             </div>
             <div>
                <p className="text-white/40 font-bold max-w-xs mx-auto mb-6">You haven't shared any reviews yet. Every review helps us grow and earns you 10 points!</p>
                <button onClick={() => setShowModal(true)} className="text-brand-orange font-bold text-xs hover:underline uppercase tracking-widest">Share your first review</button>
             </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowModal(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-xl bg-[#141414] border border-white/10 rounded-[3rem] p-10 overflow-hidden"
             >
                <h3 className="text-2xl font-black text-white uppercase mb-8">Share Your Experience</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Menu Item</label>
                         <select 
                           required
                           value={formData.menuItemId}
                           onChange={e => setFormData({...formData, menuItemId: e.target.value})}
                           className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm focus:border-brand-orange outline-none text-white appearance-none"
                         >
                            <option value="">Select Item</option>
                            {menuItems.map(item => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Branch (Optional)</label>
                         <select 
                           value={formData.branchId}
                           onChange={e => setFormData({...formData, branchId: e.target.value})}
                           className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm focus:border-brand-orange outline-none text-white appearance-none"
                         >
                            <option value="">Any Branch</option>
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                         </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1 text-center block mb-2">Rating</label>
                      <div className="flex justify-center gap-3">
                         {[1, 2, 3, 4, 5].map(star => (
                           <button 
                             key={star}
                             type="button"
                             onClick={() => setFormData({...formData, rating: star})}
                             className={`p-2 transition-all hover:scale-125 ${formData.rating >= star ? 'text-yellow-400' : 'text-white/10'}`}
                           >
                             <HiStar size={36} />
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Your Comment</label>
                      <textarea 
                        required
                        value={formData.comment}
                        onChange={e => setFormData({...formData, comment: e.target.value})}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl p-6 text-sm focus:border-brand-orange outline-none h-40"
                        placeholder="Tell us what you liked about the meal! (Min 20 characters)"
                      />
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest text-right">
                         Characters: {formData.comment.length} / 20
                      </p>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-xs text-white/40 uppercase tracking-widest">Cancel</button>
                      <button 
                        type="submit" 
                        disabled={submitting} 
                        className="flex-[2] bg-brand-orange text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-orange/20 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? 'SUBMITTING...' : (
                          <>
                            POST REVIEW <HiOutlineArrowRight />
                          </>
                        )}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MyReviews;
