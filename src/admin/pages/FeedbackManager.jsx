import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineChatBubbleLeftRight, HiOutlineStar, HiStar, 
  HiOutlineAdjustmentsHorizontal, HiOutlineMagnifyingGlass,
  HiOutlineEye, HiOutlineCheckCircle, HiOutlineClock,
  HiOutlineExclamationCircle, HiOutlineXMark, HiOutlineChevronRight
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const CATEGORIES = {
  bug_report: { label: 'Bug Report', color: 'bg-red-500/10 text-red-500' },
  feature_request: { label: 'Feature Request', color: 'bg-blue-500/10 text-blue-500' },
  food_quality: { label: 'Food Quality', color: 'bg-orange-500/10 text-orange-500' },
  delivery_experience: { label: 'Delivery', color: 'bg-yellow-500/10 text-yellow-500' },
  app_experience: { label: 'App Experience', color: 'bg-purple-500/10 text-purple-500' },
  payment_issue: { label: 'Payment Issue', color: 'bg-red-500/10 text-red-500' },
  general: { label: 'General', color: 'bg-gray-500/10 text-gray-400' },
  other: { label: 'Other', color: 'bg-gray-500/10 text-gray-400' }
};

const STATUSES = {
  new: { label: 'New', color: 'bg-white/5 text-white/40' },
  under_review: { label: 'Under Review', color: 'bg-blue-500/10 text-blue-400' },
  resolved: { label: 'Resolved', color: 'bg-green-500/10 text-green-400' },
  dismissed: { label: 'Dismissed', color: 'bg-red-500/10 text-red-400' }
};

const FeedbackManager = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: '',
    rating: '',
    search: ''
  });

  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [updateData, setUpdateData] = useState({ status: '', adminNote: '' });
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const [feedRes, statsRes] = await Promise.all([
        api.get('/admin/feedback', { params: filters }),
        api.get('/admin/feedback/stats')
      ]);
      setFeedbacks(feedRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to fetch feedback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleUpdateStatus = async () => {
    if (!updateData.status) return toast.error('Please select a status');
    setUpdating(true);
    try {
      await api.patch(`/admin/feedback/${selectedFeedback.id}/status`, updateData);
      toast.success('Feedback updated successfully');
      fetchData();
      setSelectedFeedback(null);
    } catch (err) {
      toast.error('Failed to update feedback');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Feedback Manager</h1>
          <p className="text-white/40 font-medium">Monitor and respond to customer suggestions & issues.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: 'Total Feedback', val: stats.total, icon: <HiOutlineChatBubbleLeftRight size={24} />, color: 'text-white' },
             { label: 'New / Unread', val: stats.new, icon: <HiOutlineExclamationCircle size={24} />, color: 'text-brand-orange', badge: true },
             { label: 'Average Rating', val: (stats.avgRating || 0).toFixed(1), icon: <HiOutlineStar size={24} />, color: 'text-yellow-500', stars: true },
             { label: 'Resolved', val: stats.resolved, icon: <HiOutlineCheckCircle size={24} />, color: 'text-green-500' }
           ].map((s, i) => (
             <div key={i} className="bg-[#1a1a1a] border border-white/5 p-6 rounded-[32px] flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${s.color}`}>
                   {s.icon}
                </div>
                <div>
                   <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">{s.label}</p>
                   <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-white">{s.val}</span>
                      {s.stars && <HiStar className="text-yellow-500 mb-1" />}
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#1a1a1a] border border-white/5 p-4 rounded-[32px] space-y-4">
         <div className="flex flex-wrap gap-4 items-center">
            <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
               {['all', 'new', 'under_review', 'resolved', 'dismissed'].map(s => (
                 <button
                   key={s}
                   onClick={() => setFilters({...filters, status: s})}
                   className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                     filters.status === s ? 'bg-brand-orange text-white' : 'text-white/40 hover:text-white'
                   }`}
                 >
                   {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
                 </button>
               ))}
            </div>

            <div className="flex-1 relative">
               <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
               <input 
                 type="text" 
                 placeholder="Search by title or customer name..."
                 value={filters.search}
                 onChange={e => setFilters({...filters, search: e.target.value})}
                 className="w-full bg-black/40 border border-white/5 rounded-2xl pl-11 pr-6 py-3 text-sm focus:outline-none focus:border-brand-orange/50 transition-all"
               />
            </div>
         </div>

         <div className="flex gap-4">
            <select 
              value={filters.category}
              onChange={e => setFilters({...filters, category: e.target.value})}
              className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white/60 focus:outline-none"
            >
               <option value="">All Categories</option>
               {Object.entries(CATEGORIES).map(([id, cat]) => <option key={id} value={id}>{cat.label}</option>)}
            </select>

            <select 
              value={filters.rating}
              onChange={e => setFilters({...filters, rating: e.target.value})}
              className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white/60 focus:outline-none"
            >
               <option value="">All Ratings</option>
               {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
            </select>
         </div>
      </div>

      {/* Feedback List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-40 bg-white/5 rounded-[32px] animate-pulse" />)
        ) : feedbacks.length === 0 ? (
          <div className="bg-white/5 border border-white/5 rounded-[40px] p-20 text-center">
             <HiOutlineChatBubbleLeftRight className="mx-auto text-white/10 mb-6" size={60} />
             <h3 className="text-2xl font-black text-white mb-2">No feedback found</h3>
             <p className="text-white/40">Adjust your filters to see more results.</p>
          </div>
        ) : (
          feedbacks.map(f => (
            <motion.div 
              key={f.id}
              layout
              className="bg-[#1a1a1a] border border-white/5 p-8 rounded-[40px] flex flex-col lg:flex-row gap-8 items-start group"
            >
               <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/5">
                     {f.customer.avatar ? (
                       <img src={f.customer.avatar} className="w-full h-full object-cover" alt="" />
                     ) : (
                       <div className="w-full h-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                          {f.customer.name.charAt(0)}
                       </div>
                     )}
                  </div>
                  <div>
                     <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h4 className="font-bold text-lg text-white">{f.customer.name}</h4>
                        <span className="text-[10px] text-white/20 font-bold">•</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${CATEGORIES[f.category]?.color}`}>
                           {CATEGORIES[f.category]?.label}
                        </span>
                        <div className="flex text-yellow-500">
                           {[...Array(5)].map((_, i) => <HiStar key={i} size={14} className={i >= f.rating ? 'opacity-10' : ''} />)}
                        </div>
                     </div>
                     <p className="text-white/40 text-xs font-medium mb-4">{f.customer.email}</p>
                     <h3 className="text-white font-bold text-xl mb-3">{f.title}</h3>
                     <p className="text-white/60 text-sm leading-relaxed max-w-2xl">{f.message}</p>
                     
                     <div className="flex flex-wrap items-center gap-6 mt-6">
                        <div className="flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                           <HiOutlineClock size={14} /> {new Date(f.createdAt).toLocaleString()}
                        </div>
                        {f.deviceInfo && (
                          <div className="text-[10px] text-white/20 font-medium max-w-[200px] truncate" title={f.deviceInfo}>
                             Device: {f.deviceInfo.split(')')[0].split('(')[1] || f.deviceInfo}
                          </div>
                        )}
                     </div>
                  </div>
               </div>

               <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
                  <span className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl ${STATUSES[f.status].color}`}>
                     {STATUSES[f.status].label}
                  </span>

                  {f.screenshot && (
                    <div className="w-32 aspect-video rounded-2xl overflow-hidden border border-white/10 group-hover:scale-105 transition-transform cursor-pointer">
                       <img src={f.screenshot} className="w-full h-full object-cover" alt="Screenshot" />
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      setSelectedFeedback(f);
                      setUpdateData({ status: f.status, adminNote: f.adminNote || '' });
                    }}
                    className="w-full lg:w-auto bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <HiOutlineEye size={18} /> Manage
                  </button>
               </div>
            </motion.div>
          ))
        )}
      </div>

      {/* View/Edit Modal */}
      <AnimatePresence>
        {selectedFeedback && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedFeedback(null)} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-[10%] left-[5%] right-[5%] lg:left-1/2 lg:-translate-x-1/2 lg:w-[800px] bg-[#1a1a1a] border border-white/10 rounded-[40px] z-[101] overflow-hidden flex flex-col max-h-[80vh]"
            >
               <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <h3 className="text-2xl font-black text-white">Manage Feedback</h3>
                  <button onClick={() => setSelectedFeedback(null)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white">
                    <HiOutlineXMark size={24} />
                  </button>
               </div>

               <div className="p-8 overflow-y-auto space-y-10 no-scrollbar">
                  {/* Detailed Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <div>
                           <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Customer</p>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                                 {selectedFeedback.customer.name.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-bold text-white">{selectedFeedback.customer.name}</p>
                                 <p className="text-xs text-white/40">{selectedFeedback.customer.email}</p>
                              </div>
                           </div>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Original Message</p>
                           <h4 className="text-white font-bold mb-2">{selectedFeedback.title}</h4>
                           <p className="text-white/60 text-sm leading-relaxed">{selectedFeedback.message}</p>
                        </div>
                        {selectedFeedback.deviceInfo && (
                          <div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Technical Data</p>
                            <p className="text-[10px] text-white/40 font-medium">OS/Browser: {selectedFeedback.deviceInfo}</p>
                            <p className="text-[10px] text-white/40 font-medium">App Version: {selectedFeedback.appVersion}</p>
                          </div>
                        )}
                     </div>

                     <div className="space-y-6">
                        {selectedFeedback.screenshot ? (
                          <div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Screenshot</p>
                            <a href={selectedFeedback.screenshot} target="_blank" rel="noreferrer" className="block rounded-2xl overflow-hidden border border-white/10 hover:border-brand-orange/50 transition-all">
                               <img src={selectedFeedback.screenshot} className="w-full object-contain" alt="" />
                            </a>
                          </div>
                        ) : (
                          <div className="h-full bg-white/5 rounded-2xl flex flex-col items-center justify-center p-10 text-center opacity-20">
                             <HiOutlinePhoto size={40} className="mb-2" />
                             <p className="text-xs font-bold">No Screenshot Provided</p>
                          </div>
                        )}
                     </div>
                  </div>

                  {/* Update Form */}
                  <div className="pt-10 border-t border-white/5 space-y-6">
                     <h4 className="text-xl font-bold text-white">Administrative Action</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Change Status</label>
                           <select 
                             value={updateData.status}
                             onChange={e => setUpdateData({...updateData, status: e.target.value})}
                             className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-orange transition-all font-bold"
                           >
                              {Object.entries(STATUSES).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Admin Note</label>
                           <textarea 
                             rows={3}
                             value={updateData.adminNote}
                             onChange={e => setUpdateData({...updateData, adminNote: e.target.value})}
                             placeholder="Internal note or message to customer..."
                             className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brand-orange transition-all font-medium resize-none text-sm"
                           />
                           <p className="text-[9px] text-white/20 ml-1 italic">* This note will be sent as a notification if status is 'Resolved'.</p>
                        </div>
                     </div>
                     <button
                       onClick={handleUpdateStatus}
                       disabled={updating}
                       className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                     >
                       {updating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'UPDATE FEEDBACK STATUS'}
                     </button>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackManager;
