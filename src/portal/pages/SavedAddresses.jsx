import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineMapPin, HiOutlinePlus, HiOutlineTrash, 
  HiOutlinePencil, HiOutlineCheckCircle, HiOutlineHome,
  HiOutlineBriefcase, HiOutlineEllipsisHorizontal
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { useCustomer } from '../CustomerContext';
import api from '../../api/axios';

const SavedAddresses = () => {
  const { customer, refreshCustomer } = useCustomer();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    label: 'Home',
    address: '',
    area: '',
    landmark: '',
    isDefault: false,
    latitude: null,
    longitude: null
  });

  const handleOpenModal = (addr = null) => {
    if (addr) {
      setFormData({
        label: addr.label,
        address: addr.address,
        area: addr.area,
        landmark: addr.landmark || '',
        isDefault: addr.isDefault,
        latitude: addr.latitude,
        longitude: addr.longitude
      });
      setEditingId(addr.id);
    } else {
      setFormData({ label: 'Home', address: '', area: '', landmark: '', isDefault: false, latitude: null, longitude: null });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/customers/profile/addresses/${editingId}`, formData);
        toast.success('Address updated');
      } else {
        await api.post('/customers/profile/addresses', formData);
        toast.success('Address added');
      }
      refreshCustomer();
      setShowModal(false);
    } catch (err) {
      toast.error('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await api.delete(`/customers/profile/addresses/${id}`);
      toast.success('Address deleted');
      refreshCustomer();
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.patch(`/customers/profile/addresses/${id}/default`);
      toast.success('Default address updated');
      refreshCustomer();
    } catch (err) {
      toast.error('Failed to update default address');
    }
  };

  const getLabelIcon = (label) => {
    switch (label) {
      case 'Home': return HiOutlineHome;
      case 'Work': return HiOutlineBriefcase;
      default: return HiOutlineMapPin;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Saved Addresses</h2>
          <p className="text-white/40 text-sm font-medium mt-1">Manage your delivery locations for faster checkout.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-orange text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-brand-orange/20"
        >
           <HiOutlinePlus size={20} /> Add New
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customer?.addresses?.length > 0 ? customer.addresses.map((addr) => {
          const Icon = getLabelIcon(addr.label);
          return (
            <motion.div 
              key={addr.id}
              layout
              className={`bg-[#141414] border-2 rounded-[2rem] p-8 space-y-6 relative group transition-all ${
                addr.isDefault ? 'border-brand-orange' : 'border-white/5 hover:border-white/10'
              }`}
            >
               <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${addr.isDefault ? 'bg-brand-orange text-white' : 'bg-white/5 text-white/40'}`}>
                     <Icon size={24} />
                  </div>
                  {addr.isDefault && (
                    <span className="text-[8px] bg-brand-orange/20 text-brand-orange px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] shadow-sm">Default</span>
                  )}
               </div>

               <div>
                  <h4 className="font-black text-white text-lg tracking-tight mb-2 uppercase">{addr.label}</h4>
                  <p className="text-sm text-white/60 leading-relaxed min-h-[48px]">{addr.address}</p>
                  <p className="text-xs text-white/30 mt-4 font-bold uppercase tracking-widest">{addr.area} {addr.landmark && `• ${addr.landmark}`}</p>
               </div>

               <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                  <button onClick={() => handleOpenModal(addr)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all flex-1 flex justify-center">
                    <HiOutlinePencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="p-3 bg-white/5 hover:bg-red-500/20 rounded-xl text-white/40 hover:text-red-500 transition-all flex-1 flex justify-center">
                    <HiOutlineTrash size={18} />
                  </button>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)} className="p-3 bg-white/5 hover:bg-green-500/20 rounded-xl text-white/40 hover:text-green-400 transition-all flex-1 flex justify-center" title="Set as default">
                      <HiOutlineCheckCircle size={18} />
                    </button>
                  )}
               </div>
            </motion.div>
          );
        }) : (
          <div className="col-span-full bg-[#141414] border border-white/5 p-20 rounded-[3rem] text-center space-y-6">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                <HiOutlineMapPin size={40} />
             </div>
             <p className="text-white/40 font-bold max-w-xs mx-auto">No saved addresses found. Add one to make your next checkout a breeze!</p>
             <button onClick={() => handleOpenModal()} className="text-brand-orange font-bold text-xs hover:underline uppercase tracking-widest">Add your first address</button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                
                <h3 className="text-2xl font-black text-white uppercase mb-8 relative z-10">{editingId ? 'Edit Address' : 'New Address'}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                   <div className="grid grid-cols-4 gap-2">
                      {['Home', 'Work', 'School', 'Other'].map(l => (
                        <button 
                          key={l}
                          type="button"
                          onClick={() => setFormData({...formData, label: l})}
                          className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            formData.label === l ? 'bg-brand-orange border-brand-orange text-white' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Street Address</label>
                      <textarea 
                        required
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm focus:border-brand-orange outline-none h-24"
                        placeholder="e.g. 15th Street, Apartment 4B"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Area / Neighborhood</label>
                         <input 
                            required
                            type="text"
                            value={formData.area}
                            onChange={e => setFormData({...formData, area: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm focus:border-brand-orange outline-none"
                            placeholder="e.g. Osu"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Landmark</label>
                         <input 
                            type="text"
                            value={formData.landmark}
                            onChange={e => setFormData({...formData, landmark: e.target.value})}
                            className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm focus:border-brand-orange outline-none"
                            placeholder="e.g. Near Big Garden"
                         />
                      </div>
                   </div>

                   <div className="flex items-center gap-3 py-2">
                      <input 
                        type="checkbox" 
                        id="isDefault" 
                        checked={formData.isDefault}
                        onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                        className="w-5 h-5 rounded accent-brand-orange" 
                      />
                      <label htmlFor="isDefault" className="text-xs font-bold text-white/60 uppercase tracking-widest cursor-pointer">Set as default address</label>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-xs text-white/40 uppercase tracking-widest">Cancel</button>
                      <button type="submit" disabled={loading} className="flex-[2] bg-brand-orange text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-orange/20 disabled:opacity-50">
                        {loading ? 'SAVING...' : 'SAVE ADDRESS'}
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

export default SavedAddresses;
