import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlineStar, HiStar,
  HiOutlinePencilSquare, HiOutlineTrash, HiOutlineCheckCircle, 
  HiOutlineNoSymbol, HiOutlineCheck
} from "react-icons/hi2";
import api from "../../api/axios";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";

const ReviewsManager = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [tab, setTab] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [search, setSearch] = useState("");
  
  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    author: "", rating: 5, comment: "", avatar: "", branch: "", approved: false, featured: false
  });
  const [saving, setSaving] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/reviews");
      setReviews(response.data);
    } catch (err) {
      showToast("Failed to fetch reviews", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggle = async (id, field) => {
    try {
      const endpoint = field === 'approved' ? 'approve' : 'feature';
      const response = await api.patch(`/reviews/${id}/${endpoint}`);
      setReviews(prev => prev.map(r => r.id === id ? response.data : r));
      showToast(`Review ${field} status updated`);
    } catch (err) {
      showToast("Toggle failed", "error");
    }
  };

  const handleBulkApprove = async () => {
    try {
      await Promise.all(selectedIds.map(id => api.patch(`/reviews/${id}/approve`)));
      showToast(`${selectedIds.length} reviews approved`);
      fetchReviews();
      setSelectedIds([]);
    } catch (err) {
      showToast("Bulk approval failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/reviews/${deletingId}`);
      setReviews(prev => prev.filter(r => r.id !== deletingId));
      showToast("Review deleted");
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchSearch = r.author.toLowerCase().includes(search.toLowerCase());
      const matchRating = ratingFilter === "All" || r.rating === parseInt(ratingFilter);
      const matchTab = tab === "All" || 
                       (tab === "Approved" ? r.approved : 
                        tab === "Pending" ? !r.approved : 
                        tab === "Featured" ? r.featured : true);
      return matchSearch && matchRating && matchTab;
    });
  }, [reviews, search, ratingFilter, tab]);

  const openModal = (review = null) => {
    if (review) {
      setEditingReview(review);
      setFormData({ ...review });
    } else {
      setEditingReview(null);
      setFormData({ author: "", rating: 5, comment: "", avatar: "", branch: "", approved: false, featured: false });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingReview) {
        await api.put(`/reviews/${editingReview.id}`, formData);
        showToast("Review updated");
      } else {
        await api.post("/reviews", formData);
        showToast("Review created");
      }
      fetchReviews();
      setShowModal(false);
    } catch (err) {
      showToast("Failed to save review", "error");
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setFormData({ ...formData, rating: star })}
          className={`${star <= (interactive ? formData.rating : rating) ? 'text-brand-orange' : 'text-white/10'} transition-colors`}
        >
          {star <= (interactive ? formData.rating : rating) ? <HiStar size={interactive ? 24 : 16} /> : <HiOutlineStar size={interactive ? 24 : 16} />}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-display font-bold text-white">Customer Reviews</h1>
          <button 
            onClick={() => openModal()}
            className="bg-[#EC4824] hover:bg-[#EC4824]/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <HiOutlinePlus size={18} /> Add Review
          </button>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex bg-white/5 p-1 rounded-xl">
             {['All', 'Approved', 'Pending', 'Featured'].map(t => (
               <button 
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${tab === t ? 'bg-[#EC4824] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
               >
                 {t}
               </button>
             ))}
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="relative flex-1 lg:w-64">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-brand-orange outline-none" placeholder="Search author..." />
             </div>
             <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 focus:border-brand-orange outline-none">
                <option value="All">All Ratings</option>
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
             </select>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-4 flex items-center justify-between">
           <span className="text-sm font-bold text-brand-orange">{selectedIds.length} items selected</span>
           <div className="flex gap-4">
              <button onClick={handleBulkApprove} className="text-xs font-bold uppercase tracking-widest text-green-500 hover:underline flex items-center gap-2">
                <HiOutlineCheckCircle size={18} /> Approve ({selectedIds.length})
              </button>
              <button onClick={() => setSelectedIds([])} className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
           </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Skeleton height="200px" count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {filteredReviews.map((review) => (
              <motion.div 
                layout
                key={review.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 relative group"
              >
                <div className="absolute top-6 left-6 z-10">
                   <input 
                    type="checkbox" 
                    checked={selectedIds.includes(review.id)} 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds([...selectedIds, review.id]);
                      else setSelectedIds(selectedIds.filter(id => id !== review.id));
                    }}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 accent-brand-orange"
                   />
                </div>

                <div className="pl-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-[#EC4824] flex items-center justify-center text-white font-bold">
                         {review.author.charAt(0)}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">{review.author}</p>
                          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       {review.featured && <HiStar className="text-yellow-500" size={16} />}
                       <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${review.approved ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                         {review.approved ? 'Approved' : 'Pending'}
                       </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    {renderStars(review.rating)}
                  </div>

                  <p className="text-white/80 font-display italic text-lg leading-relaxed mb-4">"{review.comment}"</p>
                  
                  {review.branch && (
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-6">Visited: {review.branch}</p>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                     <div className="flex gap-4">
                        <button 
                          onClick={() => handleToggle(review.id, 'approved')}
                          className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${review.approved ? 'text-white/20 hover:text-red-400' : 'text-green-500 hover:text-green-400'}`}
                        >
                          {review.approved ? <HiOutlineNoSymbol size={16} /> : <HiOutlineCheck size={16} />}
                          {review.approved ? 'Revoke' : 'Approve'}
                        </button>
                        <button 
                          onClick={() => handleToggle(review.id, 'featured')}
                          className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${review.featured ? 'text-yellow-500 hover:text-white/20' : 'text-white/20 hover:text-yellow-500'}`}
                        >
                          <HiStar size={16} />
                          {review.featured ? 'Featured' : 'Feature'}
                        </button>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => openModal(review)} className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all"><HiOutlinePencilSquare size={18} /></button>
                        <button onClick={() => { setDeletingId(review.id); setShowConfirm(true); }} className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"><HiOutlineTrash size={18} /></button>
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingReview ? "Edit Review" : "Add Review"} size="md">
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Author Name</label>
               <input required value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-brand-orange" />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Rating</label>
               <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  {renderStars(0, true)}
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Comment</label>
               <textarea required rows={4} value={formData.comment} onChange={e => setFormData({ ...formData, comment: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none resize-none focus:border-brand-orange font-display italic text-lg" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                 <span className="text-[10px] font-bold text-white/40 uppercase">Approved</span>
                 <button type="button" onClick={() => setFormData({ ...formData, approved: !formData.approved })} className={`w-10 h-5 rounded-full relative transition-all ${formData.approved ? 'bg-green-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.approved ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                 <span className="text-[10px] font-bold text-white/40 uppercase">Featured</span>
                 <button type="button" onClick={() => setFormData({ ...formData, featured: !formData.featured })} className={`w-10 h-5 rounded-full relative transition-all ${formData.featured ? 'bg-yellow-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.featured ? 'right-1' : 'left-1'}`} />
                 </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 font-bold py-4 rounded-2xl">Cancel</button>
              <button disabled={saving} type="submit" className="flex-1 bg-[#EC4824] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Save Review"}
              </button>
            </div>
         </form>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleDelete} title="Delete Review" message="Are you sure you want to delete this customer review? This cannot be undone." danger={true} />
    </div>
  );
};

export default ReviewsManager;
