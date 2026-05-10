import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlineEye, HiOutlineTrash,
  HiOutlineShoppingBag, HiOutlineDevicePhoneMobile, HiOutlineGlobeAlt,
  HiOutlineUserGroup, HiOutlineCalendar, HiOutlineArrowDownTray,
  HiOutlineCheckCircle, HiOutlineClock, HiOutlineTruck, HiOutlineNoSymbol
} from "react-icons/hi2";
import { BsWhatsapp } from "react-icons/bs";
import api from "../../api/axios";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Skeleton from "../components/Skeleton";
import { useToast } from "../components/Toast";

const STATUSES = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];
const BRANCHES = ['Accra Central', 'East Legon', 'Osu', 'Spintex'];
const SOURCES = ['whatsapp', 'phone', 'walk-in', 'website'];

const OrdersManager = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('WhatsApp');
  const [orders, setOrders] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modals
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Add Order State
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    branch: BRANCHES[0],
    source: "walk-in",
    note: "",
    status: "pending",
    items: [{ menuItem: "", quantity: 1, price: 0, name: "" }]
  });
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (branchFilter !== 'All') params.branch = branchFilter;
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;

      const response = await api.get("/orders", { params });
      setOrders(response.data);
    } catch (err) {
      showToast("Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, branchFilter, dateFrom, dateTo, showToast]);

  const fetchCustomerOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (branchFilter !== 'All') params.branch = branchFilter;
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;

      const response = await api.get("/admin/customer-orders", { params });
      setCustomerOrders(response.data);
    } catch (err) {
      showToast("Failed to fetch portal orders", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, branchFilter, dateFrom, dateTo, showToast]);

  const fetchMenu = useCallback(async () => {
    try {
      const response = await api.get("/menu");
      setMenuItems(response.data);
    } catch (err) {}
  }, []);

  useEffect(() => {
    if (activeTab === 'WhatsApp') fetchOrders();
    else fetchCustomerOrders();
  }, [activeTab, fetchOrders, fetchCustomerOrders]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const endpoint = activeTab === 'WhatsApp' ? `/orders/${id}/status` : `/admin/customer-orders/${id}/status`;
      const response = await api.patch(endpoint, { status: newStatus });
      
      if (activeTab === 'WhatsApp') {
        setOrders(prev => prev.map(o => o.id === id ? response.data : o));
      } else {
        setCustomerOrders(prev => prev.map(o => o.id === id ? response.data : o));
      }
      
      if (selectedOrder?.id === id) setSelectedOrder(response.data);
      showToast(`Order marked as ${newStatus}`);
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/orders/${deletingId}`);
      setOrders(prev => prev.filter(o => o.id !== deletingId));
      showToast("Order deleted");
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.customerName || newOrder.items.some(i => !i.menuItem)) {
      return showToast("Please fill all required fields", "warning");
    }

    setSaving(true);
    try {
      const payload = {
        ...newOrder,
        items: newOrder.items.map(i => ({
          menuItem: i.name, // The backend expects item name or ID? Looking at seed, it uses names.
          quantity: i.quantity,
          price: i.price
        }))
      };
      await api.post("/orders", payload);
      showToast("Order created successfully");
      fetchOrders();
      setShowAddModal(false);
    } catch (err) {
      showToast("Failed to create order", "error");
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Order ID", "Date", "Customer", "Phone", "Branch", "Status", "Total", "Items"];
    const rows = filteredOrders.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleString(),
      o.customerName,
      o.customerPhone,
      o.branch,
      o.status,
      o.totalAmount,
      o.items.map(i => `${i.quantity}x ${i.name}`).join('; ')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = useMemo(() => {
    const list = activeTab === 'WhatsApp' ? orders : customerOrders;
    return list.filter(o => {
      const name = activeTab === 'WhatsApp' ? o.customerName : (o.customer?.name || '');
      const phone = activeTab === 'WhatsApp' ? o.customerPhone : (o.customer?.phone || '');
      return name.toLowerCase().includes(search.toLowerCase()) || phone.includes(search);
    });
  }, [orders, customerOrders, search, activeTab]);

  const stats = useMemo(() => {
    const list = activeTab === 'WhatsApp' ? orders : customerOrders;
    const s = { pending: 0, confirmed: 0, preparing: 0, delivered: 0, cancelled: 0 };
    list.forEach(o => { if (s[o.status] !== undefined) s[o.status]++; });
    return s;
  }, [orders, customerOrders, activeTab]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/15 text-yellow-400';
      case 'confirmed': return 'bg-blue-500/15 text-blue-400';
      case 'preparing': return 'bg-orange-500/15 text-orange-400';
      case 'delivered': return 'bg-green-500/15 text-green-400';
      case 'cancelled': return 'bg-red-500/15 text-red-400';
      default: return 'bg-white/5 text-white/40';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'whatsapp': return <BsWhatsapp className="text-green-500" />;
      case 'phone': return <HiOutlineDevicePhoneMobile className="text-blue-400" />;
      case 'walk-in': return <HiOutlineUserGroup className="text-purple-400" />;
      case 'website': return <HiOutlineGlobeAlt className="text-orange-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-display font-bold text-white">Orders</h1>
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
              <button 
                onClick={() => setActiveTab('WhatsApp')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'WhatsApp' ? 'bg-[#EC4824] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                WhatsApp
              </button>
              <button 
                onClick={() => setActiveTab('Portal')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'Portal' ? 'bg-[#EC4824] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                Portal
              </button>
            </div>
          </div>
          {activeTab === 'WhatsApp' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#EC4824] hover:bg-[#EC4824]/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all transform active:scale-95"
            >
              <HiOutlinePlus size={18} /> Add Order
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative lg:col-span-2">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input 
              type="text" 
              placeholder="Search customer or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-brand-orange outline-none transition-all"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 focus:border-brand-orange outline-none"
          >
            <option value="All">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select 
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white/60 focus:border-brand-orange outline-none"
          >
            <option value="All">All Branches</option>
            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <div className="flex gap-2 lg:col-span-2">
            <div className="relative flex-1">
               <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
               <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-2 py-2.5 text-xs text-white/60 focus:border-brand-orange outline-none" />
            </div>
            <div className="relative flex-1">
               <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
               <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-2 py-2.5 text-xs text-white/60 focus:border-brand-orange outline-none" />
            </div>
            <button 
              onClick={exportCSV}
              className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all"
              title="Export CSV"
            >
              <HiOutlineArrowDownTray size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="flex flex-wrap gap-4">
        {STATUSES.map(status => (
          <div key={status} className="bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3 min-w-[140px]">
            <div className={`w-2 h-2 rounded-full ${
              status === 'pending' ? 'bg-yellow-500' : 
              status === 'confirmed' ? 'bg-blue-500' :
              status === 'preparing' ? 'bg-orange-500' :
              status === 'delivered' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{status}</span>
               <span className="text-lg font-bold text-white">{stats[status]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 text-left text-white/20 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                <th className="px-8 py-4 w-12">#</th>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Branch</th>
                <th className="px-8 py-4">Items Summary</th>
                <th className="px-8 py-4">Total</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="8" className="p-20"><Skeleton count={5} height="40px" /></td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-20 text-center text-white/20">
                    <div className="flex justify-center mb-4"><HiOutlineShoppingBag size={64} /></div>
                    <p className="font-bold">No orders yet</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => { setSelectedOrder(order); setShowDetail(true); }}>
                    <td className="px-8 py-5 text-xs text-white/20 font-bold">
                      {activeTab === 'WhatsApp' ? (idx + 1) : order.orderNumber.split('-').pop()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {activeTab === 'WhatsApp' ? getSourceIcon(order.source) : <HiOutlineGlobeAlt className="text-orange-400" />}
                        <p className="text-sm font-bold text-white">
                          {activeTab === 'WhatsApp' ? order.customerName : order.customer?.name}
                        </p>
                      </div>
                      <p className="text-[10px] text-white/40">
                        {activeTab === 'WhatsApp' ? order.customerPhone : order.customer?.phone}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-xs text-white/60">
                      {activeTab === 'WhatsApp' ? order.branch : (order.branch || 'Delivery')}
                      {activeTab === 'Portal' && (
                        <div className={`mt-1 text-[10px] uppercase font-bold ${order.type === 'delivery' ? 'text-blue-400' : 'text-orange-400'}`}>
                          {order.type}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-[10px] text-white/40 font-medium max-w-[200px] truncate">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'} — {order.items.map(i => i.name).join(', ')}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-brand-orange">₵{order.totalAmount}</td>
                    <td className="px-8 py-5" onClick={e => e.stopPropagation()}>
                       <select 
                         value={order.status}
                         onChange={(e) => handleStatusChange(order.id, e.target.value)}
                         className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase outline-none cursor-pointer ${getStatusStyle(order.status)}`}
                       >
                         {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </td>
                    <td className="px-8 py-5 text-[10px] text-white/40 font-bold uppercase tracking-widest whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-8 py-5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedOrder(order); setShowDetail(true); }} className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all"><HiOutlineEye size={18} /></button>
                        <button onClick={() => { setDeletingId(order.id); setShowConfirm(true); }} className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"><HiOutlineTrash size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Order #${selectedOrder?.id?.slice(-6).toUpperCase()}`} size="lg">
        {selectedOrder && (
          <div className="space-y-8">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Placed On</p>
                 <p className="text-white font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
               </div>
               <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${getStatusStyle(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-6 bg-white/5 rounded-2xl border border-white/5">
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Customer</p>
                <p className="text-white font-bold">{activeTab === 'WhatsApp' ? selectedOrder.customerName : selectedOrder.customer?.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Phone</p>
                <p className="text-white font-bold">{activeTab === 'WhatsApp' ? selectedOrder.customerPhone : selectedOrder.customer?.phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Address</p>
                <p className="text-white font-bold">{activeTab === 'WhatsApp' ? (selectedOrder.customerAddress || 'N/A') : (selectedOrder.deliveryAddress || 'Pickup')}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Branch</p>
                <p className="text-white font-bold">{selectedOrder.branch || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Source / Type</p>
                <div className="flex items-center gap-2 text-white font-bold">
                  {activeTab === 'WhatsApp' ? getSourceIcon(selectedOrder.source) : <HiOutlineGlobeAlt className="text-orange-400" />}
                  <span className="capitalize">{activeTab === 'WhatsApp' ? selectedOrder.source : selectedOrder.type}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Note</p>
                <p className="text-white text-xs italic">"{selectedOrder.note || 'No special instructions'}"</p>
              </div>
            </div>

            {selectedOrder.latitude && selectedOrder.longitude && (
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <HiOutlineGlobeAlt size={16} className="text-brand-orange" /> Delivery Location Map
                </h4>
                <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                   <iframe 
                     width="100%" 
                     height="100%" 
                     style={{ border: 0 }} 
                     loading="lazy" 
                     allowFullScreen 
                     src={`https://www.google.com/maps?q=${selectedOrder.latitude},${selectedOrder.longitude}&hl=es;z=15&output=embed`}
                   ></iframe>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Items Ordered</h4>
              <div className="bg-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 text-left text-white/20 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-6 py-3">Item</th>
                      <th className="px-6 py-3 text-center">Qty</th>
                      <th className="px-6 py-3 text-right">Unit</th>
                      <th className="px-6 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedOrder.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                        <td className="px-6 py-4 text-center text-white/60">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-white/60">₵{item.price}</td>
                        <td className="px-6 py-4 text-right text-brand-orange font-bold">₵{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-white/5">
                      <td colSpan="3" className="px-6 py-4 text-right font-bold text-white/40 uppercase tracking-widest">Total Amount</td>
                      <td className="px-6 py-4 text-right text-2xl font-display font-bold text-brand-orange">₵{selectedOrder.totalAmount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timeline */}
            <div>
               <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-8">Status Timeline</h4>
               <div className="flex items-center justify-between px-4 relative">
                  <div className="absolute left-8 right-8 top-4 h-[2px] bg-white/5 -z-0" />
                  {['pending', 'confirmed', 'preparing', 'delivered'].map((step, idx) => {
                    const steps = ['pending', 'confirmed', 'preparing', 'delivered'];
                    const currentIdx = steps.indexOf(selectedOrder.status);
                    const stepIdx = steps.indexOf(step);
                    const isCompleted = stepIdx <= currentIdx && selectedOrder.status !== 'cancelled';
                    
                    return (
                      <div key={step} className="flex flex-col items-center gap-3 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted ? 'bg-[#EC4824] border-[#EC4824] text-white' : 'bg-[#111] border-white/10 text-white/10'
                        }`}>
                          {isCompleted ? <HiOutlineCheckCircle size={18} /> : (idx + 1)}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted ? 'text-white' : 'text-white/20'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
               </div>
               {selectedOrder.status === 'cancelled' && (
                 <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
                    <HiOutlineNoSymbol size={24} />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest">Order Cancelled</p>
                      <p className="text-xs font-medium opacity-60">This order has been terminated and will not be processed.</p>
                    </div>
                 </div>
               )}
            </div>

            <div className="flex gap-4 pt-4">
               <div className="flex-1 space-y-2">
                 <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Update Status</label>
                 <div className="flex gap-2">
                   <select 
                     value={selectedOrder.status}
                     onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                     className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-brand-orange"
                   >
                     {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                 </div>
               </div>
               <a 
                 href={`https://wa.me/${selectedOrder.customerPhone.replace(/\D/g, '')}?text=Hello ${selectedOrder.customerName}, your Cookers Delight order is now ${selectedOrder.status}!`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex-[1.5] bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-3 self-end"
               >
                 <BsWhatsapp size={20} /> Message on WhatsApp
               </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Order Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Order" size="lg">
        <form onSubmit={handleAddOrder} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Customer Name</label>
              <input required value={newOrder.customerName} onChange={e => setNewOrder({...newOrder, customerName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-brand-orange" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Phone Number</label>
              <input required value={newOrder.customerPhone} onChange={e => setNewOrder({...newOrder, customerPhone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-brand-orange" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Delivery Address (Optional)</label>
            <input value={newOrder.customerAddress} onChange={e => setNewOrder({...newOrder, customerAddress: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-brand-orange" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Branch</label>
              <select value={newOrder.branch} onChange={e => setNewOrder({...newOrder, branch: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-brand-orange">
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Source</label>
              <select value={newOrder.source} onChange={e => setNewOrder({...newOrder, source: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-brand-orange">
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest ml-1">Initial Status</label>
              <select value={newOrder.status} onChange={e => setNewOrder({...newOrder, status: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-brand-orange">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Items Builder</h4>
             <div className="space-y-3">
                {newOrder.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-1">
                       <label className="text-[8px] font-bold text-white/20 uppercase">Menu Item</label>
                       <select 
                         value={item.menuItem} 
                         onChange={(e) => {
                           const found = menuItems.find(m => m.id === e.target.value);
                           const newItems = [...newOrder.items];
                           newItems[idx] = { 
                             ...item, 
                             menuItem: e.target.value, 
                             name: found ? found.name : "",
                             price: found ? parseFloat(found.price.replace('₵','')) : 0 
                           };
                           setNewOrder({...newOrder, items: newItems});
                         }}
                         className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                       >
                         <option value="">Select Item...</option>
                         {menuItems.map(m => <option key={m.id} value={m.id}>{m.name} ({m.price})</option>)}
                       </select>
                    </div>
                    <div className="w-20 space-y-1">
                       <label className="text-[8px] font-bold text-white/20 uppercase">Qty</label>
                       <input type="number" min="1" value={item.quantity} onChange={(e) => {
                         const newItems = [...newOrder.items];
                         newItems[idx].quantity = parseInt(e.target.value) || 1;
                         setNewOrder({...newOrder, items: newItems});
                       }} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                    </div>
                    <div className="w-24 space-y-1">
                       <label className="text-[8px] font-bold text-white/20 uppercase">Price (₵)</label>
                       <input type="number" value={item.price} onChange={(e) => {
                         const newItems = [...newOrder.items];
                         newItems[idx].price = parseFloat(e.target.value) || 0;
                         setNewOrder({...newOrder, items: newItems});
                       }} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                    </div>
                    <button type="button" onClick={() => setNewOrder({...newOrder, items: newOrder.items.filter((_, i) => i !== idx)})} className="p-2 mb-1 text-white/20 hover:text-red-500"><HiOutlineTrash size={18} /></button>
                  </div>
                ))}
             </div>
             <button 
               type="button"
               onClick={() => setNewOrder({...newOrder, items: [...newOrder.items, { menuItem: "", quantity: 1, price: 0, name: "" }]})}
               className="text-brand-orange text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
             >
               <HiOutlinePlus size={14} /> Add Item
             </button>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-between items-center">
             <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Estimated Total</p>
                <p className="text-3xl font-display font-bold text-brand-orange">
                  ₵{newOrder.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}
                </p>
             </div>
             <div className="flex gap-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all">Cancel</button>
                <button disabled={saving} type="submit" className="px-8 py-3 rounded-xl bg-[#EC4824] text-white font-bold hover:bg-[#EC4824]/90 transition-all flex items-center gap-2">
                  {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Create Order"}
                </button>
             </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order record? This cannot be undone."
        danger={true}
        confirmLabel="Delete Permanent"
      />
    </div>
  );
};

export default OrdersManager;
