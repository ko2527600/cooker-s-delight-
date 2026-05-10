import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlineSquares2X2, 
  HiOutlineListBullet, HiOutlinePencilSquare, HiOutlineTrash,
  HiOutlineStar, HiStar, HiOutlinePhoto, HiOutlineCloudArrowUp,
  HiOutlineChevronUpDown
} from "react-icons/hi2";
import api from "../../api/axios";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { getImgUrl } from "../../utils/image";

const CATEGORIES = ['Ghanaian', 'Nigerian', 'Snacks', 'Sides', 'Fast Food', 'Continental', 'Desserts'];

const MenuManager = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availableFilter, setAvailableFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Ghanaian",
    available: true,
    featured: false,
    imageType: "url",
    image: "",
    imageFile: null
  });
  const [saving, setSaving] = useState(false);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/menu");
      setItems(response.data);
    } catch (err) {
      showToast("Failed to fetch menu items", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleToggle = async (id, field) => {
    try {
      const item = items.find(i => i.id === id);
      const endpoint = field === 'available' ? 'toggle' : 'feature';
      const response = await api.patch(`/menu/${id}/${endpoint}`);
      setItems(prev => prev.map(i => i.id === id ? response.data : i));
      showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.replace('₵', '').trim(),
        category: item.category,
        available: item.available,
        featured: item.featured || false,
        imageType: "url",
        image: item.image,
        imageFile: null
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "Ghanaian",
        available: true,
        featured: false,
        imageType: "url",
        image: "",
        imageFile: null
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return showToast("Name and Price are required", "warning");

    setSaving(true);
    try {
      let payload;
      let headers = {};

      if (formData.imageType === 'upload' && formData.imageFile) {
        payload = new FormData();
        payload.append('name', formData.name);
        payload.append('description', formData.description);
        payload.append('price', `₵${formData.price}`);
        payload.append('category', formData.category);
        payload.append('available', formData.available);
        payload.append('featured', formData.featured);
        payload.append('image', formData.imageFile);
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        payload = {
          ...formData,
          price: `₵${formData.price}`
        };
      }

      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, payload, { headers });
        showToast("Item updated successfully");
      } else {
        await api.post("/menu", payload, { headers });
        showToast("Item created successfully");
      }
      
      fetchMenu();
      setShowModal(false);
    } catch (err) {
      showToast("Failed to save item", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/menu/${deletingId}`);
      setItems(prev => prev.filter(i => i.id !== deletingId));
      showToast("Item deleted");
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredItems = items
    .filter(i => {
      const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "All" || i.category === categoryFilter;
      const matchAvail = availableFilter === "All" || 
                        (availableFilter === "Available" ? i.available : !i.available);
      return matchSearch && matchCat && matchAvail;
    })
    .sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'price') {
        aVal = parseFloat(aVal.replace('₵', ''));
        bVal = parseFloat(bVal.replace('₵', ''));
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            Menu Manager
            <span className="bg-white/5 text-white/40 px-3 py-1 rounded-full text-xs font-bold">{items.length} items</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input 
              type="text" 
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-brand-orange outline-none transition-all"
            />
          </div>

          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 focus:border-brand-orange outline-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            value={availableFilter}
            onChange={(e) => setAvailableFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 focus:border-brand-orange outline-none"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>

          <div className="flex bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'}`}
            >
              <HiOutlineSquares2X2 size={20} />
            </button>
            <button 
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-all ${viewMode === "table" ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'}`}
            >
              <HiOutlineListBullet size={20} />
            </button>
          </div>

          <button 
            onClick={() => openModal()}
            className="bg-[#EC4824] hover:bg-[#EC4824]/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all transform active:scale-95"
          >
            <HiOutlinePlus size={18} /> Add Item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton height="350px" count={6} />
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id}
                className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden group relative"
              >
                <div className="h-48 relative overflow-hidden bg-white/5 flex items-center justify-center">
                  {item.image ? (
                    <img src={getImgUrl(item.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                  ) : (
                    <div className="text-4xl">🥘</div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                    <button 
                      onClick={() => openModal(item)}
                      className="w-10 h-10 rounded-full bg-white text-brand-black flex items-center justify-center hover:scale-110 transition-all"
                    >
                      <HiOutlinePencilSquare size={20} />
                    </button>
                    <button 
                      onClick={() => { setDeletingId(item.id); setShowConfirm(true); }}
                      className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-all"
                    >
                      <HiOutlineTrash size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-bold text-white truncate max-w-[150px]">{item.name}</h3>
                      <span className="inline-block bg-[#EC4824]/10 text-[#EC4824] text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-brand-orange font-bold">{item.price}</span>
                  </div>

                  <p className="text-xs text-white/40 line-clamp-2 h-8">{item.description}</p>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-white/20 uppercase">Available</span>
                      <button 
                        onClick={() => handleToggle(item.id, 'available')}
                        className={`w-10 h-5 rounded-full relative transition-all ${item.available ? 'bg-green-500' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.available ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <button 
                      onClick={() => handleToggle(item.id, 'featured')}
                      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase transition-colors ${item.featured ? 'text-brand-orange' : 'text-white/20 hover:text-white'}`}
                    >
                      {item.featured ? <HiStar size={14} /> : <HiOutlineStar size={14} />}
                      Featured
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 text-left text-white/20 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                <th className="px-8 py-4">Image</th>
                <th className="px-8 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">Name <HiOutlineChevronUpDown /></div>
                </th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-2">Price <HiOutlineChevronUpDown /></div>
                </th>
                <th className="px-8 py-4 text-center">Available</th>
                <th className="px-8 py-4 text-center">Featured</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                      {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : "🥘"}
                    </div>
                  </td>
                  <td className="px-8 py-4 font-bold text-white">{item.name}</td>
                  <td className="px-8 py-4">
                    <span className="bg-white/5 text-white/40 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-white/10">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-brand-orange font-bold">{item.price}</td>
                  <td className="px-8 py-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => handleToggle(item.id, 'available')}
                        className={`w-10 h-5 rounded-full relative transition-all ${item.available ? 'bg-green-500' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.available ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => handleToggle(item.id, 'featured')}
                        className={`transition-colors ${item.featured ? 'text-brand-orange' : 'text-white/20'}`}
                      >
                        {item.featured ? <HiStar size={20} /> : <HiOutlineStar size={20} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(item)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"><HiOutlinePencilSquare size={18} /></button>
                      <button onClick={() => { setDeletingId(item.id); setShowConfirm(true); }} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all"><HiOutlineTrash size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Item Name</label>
            <input 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-brand-orange outline-none transition-all"
              placeholder="e.g. Gourmet Jollof Rice"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Description</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-brand-orange outline-none transition-all resize-none"
              placeholder="Tell customers about this dish..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Price (₵)</label>
              <input 
                required
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-brand-orange outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-brand-orange outline-none transition-all"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-white/40 uppercase">Available</span>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, available: !formData.available })}
                className={`w-10 h-5 rounded-full relative transition-all ${formData.available ? 'bg-green-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.available ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-white/40 uppercase">Featured Item</span>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                className={`w-10 h-5 rounded-full relative transition-all ${formData.featured ? 'bg-[#EC4824]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.featured ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex bg-white/5 p-1 rounded-xl w-fit">
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, imageType: 'url' })}
                className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${formData.imageType === 'url' ? 'bg-white/10 text-white' : 'text-white/20'}`}
              >
                URL
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, imageType: 'upload' })}
                className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${formData.imageType === 'upload' ? 'bg-white/10 text-white' : 'text-white/20'}`}
              >
                Upload
              </button>
            </div>

            {formData.imageType === 'url' ? (
              <input 
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-brand-orange outline-none transition-all"
                placeholder="https://images.unsplash.com/..."
              />
            ) : (
              <div 
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-brand-orange', 'bg-brand-orange/5'); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-brand-orange', 'bg-brand-orange/5'); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) setFormData({ ...formData, imageFile: file, image: URL.createObjectURL(file) });
                }}
                onClick={() => document.getElementById('fileInput').click()}
                className="w-full border-2 border-dashed border-white/10 rounded-2xl py-12 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-orange/40 hover:bg-white/5 transition-all"
              >
                <HiOutlineCloudArrowUp size={32} className="text-white/20" />
                <p className="text-sm font-medium text-white/40">Drop image here or <span className="text-[#EC4824]">click to browse</span></p>
                <input 
                  id="fileInput" 
                  type="file" 
                  hidden 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setFormData({ ...formData, imageFile: file, image: URL.createObjectURL(file) });
                  }}
                />
              </div>
            )}

            {formData.image && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                   <p className="text-[10px] font-bold text-white uppercase tracking-widest">Image Preview</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#EC4824] hover:bg-[#EC4824]/90 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Menu Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        danger={true}
        confirmLabel="Delete Item"
      />
    </div>
  );
};

export default MenuManager;
