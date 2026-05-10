import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineChatBubbleLeftRight, HiOutlineStar, HiStar, 
  HiOutlinePhoto, HiOutlineXMark, HiOutlineCheckCircle,
  HiOutlineInformationCircle, HiOutlineClock, HiOutlineChevronRight
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const CATEGORIES = [
  { id: 'bug_report', label: 'Bug Report', icon: '🐛', color: 'bg-red-500/10 text-red-500' },
  { id: 'feature_request', label: 'Feature Request', icon: '✨', color: 'bg-blue-500/10 text-blue-500' },
  { id: 'food_quality', label: 'Food Quality', icon: '🍔', color: 'bg-orange-500/10 text-orange-500' },
  { id: 'delivery_experience', label: 'Delivery', icon: '🚴', color: 'bg-yellow-500/10 text-yellow-500' },
  { id: 'app_experience', label: 'App Experience', icon: '📱', color: 'bg-purple-500/10 text-purple-500' },
  { id: 'payment_issue', label: 'Payment Issue', icon: '💳', color: 'bg-red-500/10 text-red-500' },
  { id: 'general', label: 'General', icon: '💬', color: 'bg-gray-500/10 text-gray-400' },
  { id: 'other', label: 'Other', icon: '🔧', color: 'bg-gray-500/10 text-gray-400' }
];

const RATING_LABELS = {
  1: "😤 Very Poor",
  2: "😕 Poor",
  3: "😐 Okay",
  4: "😊 Good",
  5: "🤩 Excellent!"
};

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    category: 'general',
    title: '',
    message: ''
  });
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/customers/feedback');
      setFeedbacks(res.data);
    } catch (err) {
      toast.error('Failed to load feedback history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('File too large (max 5MB)');
      setScreenshot(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.message.length < 20) return toast.error('Please provide more details (min 20 chars)');

    setSubmitting(true);
    const data = new FormData();
    data.append('rating', formData.rating);
    data.append('category', formData.category);
    data.append('title', formData.title);
    data.append('message', formData.message);
    if (screenshot) data.append('screenshot', screenshot);

    try {
      await api.post('/customers/feedback', data);
      setSubmitted(true);
      fetchFeedbacks();
      setFormData({ rating: 5, category: 'general', title: '', message: '' });
      setScreenshot(null);
      setPreview(null);
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'new': return 'bg-white/5 text-white/40';
      case 'under_review': return 'bg-blue-500/10 text-blue-400';
      case 'resolved': return 'bg-green-500/10 text-green-400';
      case 'dismissed': return 'bg-red-500/10 text-red-400';
      default: return 'bg-white/5 text-white/40';
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Feedback</h1>
        <p className="text-white/40 font-medium">Help us build the perfect dining experience.</p>
      </div>

      {/* Past Feedback */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <HiOutlineClock className="text-brand-orange" />
             History
           </h2>
           {!showForm && (
             <button 
               onClick={() => { setShowForm(true); setSubmitted(false); }}
               className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 text-sm"
             >
               + New Submission
             </button>
           )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[1,2].map(i => <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse" />)}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white/5 border border-white/5 rounded-[40px] p-12 text-center">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
               <HiOutlineChatBubbleLeftRight className="text-white/20" size={32} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">No feedback yet</h3>
             <p className="text-white/40 max-w-xs mx-auto mb-8">Share your thoughts with us and earn loyalty points!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {feedbacks.map(f => (
               <motion.div 
                 key={f.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white/5 border border-white/5 p-6 rounded-3xl relative group overflow-hidden"
               >
                  <div className="flex justify-between items-start mb-4">
                     <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${CATEGORIES.find(c => c.id === f.category)?.color}`}>
                       {CATEGORIES.find(c => c.id === f.category)?.label}
                     </span>
                     <div className="flex text-brand-orange">
                        {[...Array(5)].map((_, i) => (
                          <HiStar key={i} size={14} className={i >= f.rating ? 'opacity-20' : ''} />
                        ))}
                     </div>
                  </div>
                  <h4 className="text-white font-bold mb-1 truncate">{f.title}</h4>
                  <p className="text-white/40 text-xs line-clamp-2 mb-4 leading-relaxed">{f.message}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                     <span className="text-[10px] text-white/20 font-bold">{new Date(f.createdAt).toLocaleDateString()}</span>
                     <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${getStatusStyle(f.status)}`}>
                        {f.status === 'new' ? 'Submitted' : f.status.replace('_', ' ')}
                     </span>
                  </div>

                  {f.adminNote && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                       <p className="text-[10px] text-brand-orange font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                         <HiOutlineInformationCircle size={14} /> Admin Response
                       </p>
                       <p className="text-xs text-white/60 italic">"{f.adminNote}"</p>
                    </div>
                  )}
               </motion.div>
             ))}
          </div>
        )}
      </section>

      {/* Feedback Form */}
      <AnimatePresence>
        {showForm && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="bg-[#1a1a1a] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
               <div className="p-8 border-b border-white/5 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-white">Share Your Feedback</h3>
                    <p className="text-white/40 text-sm font-medium">Earn ⭐ 5 loyalty points for every submission!</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors">
                    <HiOutlineXMark size={20} />
                  </button>
               </div>

               {submitted ? (
                 <div className="p-16 text-center">
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <HiOutlineCheckCircle size={48} />
                    </motion.div>
                    <h4 className="text-2xl font-black text-white mb-2">Thank you!</h4>
                    <p className="text-white/40 mb-8">You've earned 5 loyalty points 🎉<br/>Your feedback helps us serve you better.</p>
                    <button 
                      onClick={() => { setShowForm(false); setSubmitted(false); }}
                      className="bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-3 rounded-2xl transition-all"
                    >
                      Back to History
                    </button>
                 </div>
               ) : (
                 <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Rating */}
                    <div className="text-center">
                       <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-4">Overall Satisfaction</p>
                       <div className="flex justify-center gap-3 mb-3">
                          {[1,2,3,4,5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormData({...formData, rating: star})}
                              className={`transition-all ${formData.rating >= star ? 'text-brand-orange scale-110' : 'text-white/10 hover:text-white/30'}`}
                            >
                              {formData.rating >= star ? <HiStar size={40} /> : <HiOutlineStar size={40} />}
                            </button>
                          ))}
                       </div>
                       <p className="text-brand-orange font-bold text-lg">{RATING_LABELS[formData.rating]}</p>
                    </div>

                    {/* Category */}
                    <div className="space-y-4">
                       <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Select Category</p>
                       <div className="flex flex-wrap gap-2">
                          {CATEGORIES.map(cat => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setFormData({...formData, category: cat.id})}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                formData.category === cat.id 
                                  ? 'bg-brand-orange border-brand-orange text-white shadow-lg shadow-brand-orange/20' 
                                  : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <span className="mr-2">{cat.icon}</span>
                              {cat.label}
                            </button>
                          ))}
                       </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Title</label>
                          <input 
                            type="text" 
                            required
                            maxLength={100}
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="Give your feedback a title"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-orange transition-all font-medium"
                          />
                       </div>

                       <div className="space-y-2">
                          <div className="flex justify-between items-center ml-1">
                             <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Message</label>
                             <span className={`text-[10px] font-bold ${formData.message.length < 20 ? 'text-red-400' : 'text-white/20'}`}>
                                {formData.message.length} / 500
                             </span>
                          </div>
                          <textarea 
                            required
                            rows={4}
                            maxLength={500}
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                            placeholder="Tell us more about your experience... (min 20 characters)"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-orange transition-all font-medium resize-none"
                          />
                       </div>
                    </div>

                    {/* Screenshot Upload */}
                    <div className="space-y-4">
                       <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Screenshot (Optional)</p>
                       {!preview ? (
                         <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-white/10 rounded-[32px] p-8 text-center hover:border-brand-orange/50 hover:bg-brand-orange/5 transition-all group">
                               <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                  <HiOutlinePhoto className="text-white/20 group-hover:text-brand-orange" size={24} />
                               </div>
                               <p className="text-sm font-bold text-white mb-1">Attach a screenshot</p>
                               <p className="text-xs text-white/30">Drag & drop or click to browse (Max 5MB)</p>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                         </label>
                       ) : (
                         <div className="relative w-full aspect-video rounded-[32px] overflow-hidden border border-white/10">
                            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                            <button 
                              type="button"
                              onClick={() => { setScreenshot(null); setPreview(null); }}
                              className="absolute top-4 right-4 w-10 h-10 bg-brand-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                            >
                               <HiOutlineXMark size={20} />
                            </button>
                            <div className="absolute bottom-4 left-4 bg-brand-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold text-white/60">
                               {(screenshot.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                         </div>
                       )}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          SUBMITTING...
                        </>
                      ) : (
                        <>
                          SUBMIT FEEDBACK — EARN ⭐ 5 POINTS
                        </>
                      )}
                    </button>
                 </form>
               )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackPage;
