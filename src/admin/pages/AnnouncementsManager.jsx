import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineCheckBadge,
  HiOutlineMegaphone, HiOutlineEye, HiOutlineEyeSlash
} from "react-icons/hi2";
import api from "../../api/axios";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";

const AnnouncementsManager = () => {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [activeAnn, setActiveAnn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    text: "", bgColor: "#EC4824", textColor: "#ffffff", link: "", active: false
  });
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/announcements/all");
      setAnnouncements(response.data);
      const active = response.data.find(a => a.active);
      setActiveAnn(active || null);
    } catch (err) {
      showToast("Failed to fetch announcements", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleToggle = async (ann) => {
    if (!ann.active && activeAnn) {
      // Trying to activate, but another is active
      setDeletingId(ann.id); // repurpose ID
      setShowConfirm(true);
      return;
    }

    try {
      const response = await api.patch(`/announcements/${ann.id}/toggle`);
      fetchAnnouncements();
      showToast(`Announcement ${response.data.active ? 'Activated' : 'Deactivated'}`);
    } catch (err) {
      showToast("Toggle failed", "error");
    }
  };

  const confirmActivation = async () => {
    try {
      const response = await api.patch(`/announcements/${deletingId}/toggle`);
      fetchAnnouncements();
      showToast("New announcement activated");
      setShowConfirm(false);
    } catch (err) {
      showToast("Activation failed", "error");
    }
  };

  const openModal = (ann = null) => {
    if (ann) {
      setEditingAnn(ann);
      setFormData({ ...ann });
    } else {
      setEditingAnn(null);
      setFormData({ text: "", bgColor: "#EC4824", textColor: "#ffffff", link: "", active: false });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAnn) {
        await api.put(`/announcements/${editingAnn.id}`, formData);
        showToast("Announcement updated");
      } else {
        await api.post("/announcements", formData);
        showToast("Announcement created");
      }
      fetchAnnouncements();
      setShowModal(false);
    } catch (err) {
      showToast("Failed to save announcement", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      if (activeAnn?.id === id) setActiveAnn(null);
      showToast("Announcement deleted");
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  return (
    <div className="space-y-12">
      {/* Live Preview Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
           <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest">Live Preview</h2>
           {activeAnn && <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase animate-pulse"><HiOutlineCheckBadge /> Live on Website</span>}
        </div>
        <div 
          className={`w-full p-3 rounded-xl flex items-center justify-center font-bold text-sm text-center min-h-[48px] transition-all duration-500 border border-white/5 ${!activeAnn ? 'border-dashed border-white/10 bg-white/5 text-white/20' : ''}`}
          style={activeAnn ? { backgroundColor: activeAnn.bgColor, color: activeAnn.textColor } : {}}
        >
           {activeAnn ? activeAnn.text : "No active announcement currently showing"}
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-display font-bold text-white">Announcements</h1>
          <button 
            onClick={() => openModal()}
            className="bg-[#EC4824] hover:bg-[#EC4824]/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <HiOutlinePlus size={18} /> New Banner
          </button>
        </div>

        {loading ? (
          <Skeleton height="80px" count={3} />
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <motion.div 
                layout
                key={ann.id}
                className={`bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 flex items-center gap-6 group transition-all ${ann.active ? 'ring-2 ring-[#EC4824]/50' : ''}`}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: ann.bgColor }}>
                   <HiOutlineMegaphone size={24} style={{ color: ann.textColor }} />
                </div>
                
                <div className="flex-1 min-w-0">
                   <p className="text-white font-medium truncate mb-1">{ann.text}</p>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Created {new Date(ann.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ann.bgColor }} />
                         <span className="text-[10px] text-white/40 font-bold uppercase">{ann.bgColor}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => handleToggle(ann)}
                     className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${ann.active ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                   >
                     {ann.active ? 'Active' : 'Activate'}
                   </button>
                   <div className="h-8 w-[1px] bg-white/5 mx-1" />
                   <button onClick={() => openModal(ann)} className="p-2.5 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-all"><HiOutlinePencilSquare size={18} /></button>
                   <button onClick={() => handleDelete(ann.id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"><HiOutlineTrash size={18} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingAnn ? "Edit Banner" : "Create Banner"} size="md">
         <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Banner Text</label>
               <textarea required rows={2} value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-brand-orange font-bold text-center" placeholder="e.g. 🔥 Now Delivering Across Accra!" />
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Background Color</label>
                  <div className="flex gap-3">
                     <input type="color" value={formData.bgColor} onChange={e => setFormData({ ...formData, bgColor: e.target.value })} className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0 overflow-hidden" />
                     <input type="text" value={formData.bgColor} onChange={e => setFormData({ ...formData, bgColor: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white uppercase font-mono" />
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Text Color</label>
                  <div className="flex gap-3">
                     <input type="color" value={formData.textColor} onChange={e => setFormData({ ...formData, textColor: e.target.value })} className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer p-0 overflow-hidden" />
                     <input type="text" value={formData.textColor} onChange={e => setFormData({ ...formData, textColor: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white uppercase font-mono" />
                  </div>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Optional Link</label>
               <input value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-brand-orange text-xs" placeholder="https://..." />
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1 text-center block">Real-time Preview</label>
               <div 
                 className="w-full p-3 rounded-xl flex items-center justify-center font-bold text-sm text-center border border-white/10"
                 style={{ backgroundColor: formData.bgColor, color: formData.textColor }}
               >
                 {formData.text || "Preview Text Goes Here"}
               </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
               <span className="text-[10px] font-bold text-white/40 uppercase">Set as Active</span>
               <button type="button" onClick={() => setFormData({ ...formData, active: !formData.active })} className={`w-10 h-5 rounded-full relative transition-all ${formData.active ? 'bg-green-500' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.active ? 'right-1' : 'left-1'}`} />
               </button>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 font-bold py-4 rounded-2xl">Cancel</button>
              <button disabled={saving} type="submit" className="flex-1 bg-[#EC4824] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (editingAnn ? "Update Banner" : "Create Banner")}
              </button>
            </div>
         </form>
      </Modal>

      <ConfirmDialog 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)} 
        onConfirm={confirmActivation} 
        title="Activate Announcement" 
        message="Activating this banner will automatically deactivate the currently live one. Continue?"
        confirmLabel="Activate New"
      />
    </div>
  );
};

export default AnnouncementsManager;
