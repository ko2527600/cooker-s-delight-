import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineUsers, HiMagnifyingGlass, HiEye, HiNoSymbol,
  HiOutlineXMark, HiOutlineCheckCircle, HiStar, HiOutlineShoppingBag,
  HiOutlineCurrencyDollar, HiOutlineChatBubbleLeftRight, HiOutlineBell,
  HiOutlinePaperAirplane, HiOutlineMapPin
} from 'react-icons/hi2';
import api from '../../api/axios';
import { useToast } from '../components/Toast';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
};

export default function CustomersManager() {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Stats
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newToday: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });

  // Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '' });
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterStatus, sortBy]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/customers', {
        params: {
          search: search || undefined,
          status: filterStatus === 'All' ? undefined : filterStatus,
          sort: sortBy
        }
      });
      setCustomers(res.data);
      calculateStats(res.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const today = new Date();
    today.setHours(0,0,0,0);
    const newToday = data.filter(c => new Date(c.createdAt) >= today).length;
    const rev = data.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const orders = data.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
    
    setStats({
      totalCustomers: total,
      newToday: newToday,
      totalRevenue: rev,
      avgOrderValue: orders > 0 ? rev / orders : 0
    });
  };

  const openCustomerModal = async (id) => {
    try {
      const res = await api.get(`/admin/customers/${id}`);
      setSelectedCustomer(res.data);
      setActiveTab('Profile');
      setIsModalOpen(true);
    } catch (err) {
      addToast('Failed to load customer details', 'error');
    }
  };

  const toggleStatus = async (id) => {
    if (!window.confirm("Are you sure you want to toggle this customer's status?")) return;
    try {
      await api.patch(`/admin/customers/${id}/status`);
      addToast('Customer status updated', 'success');
      fetchCustomers();
      if (selectedCustomer && selectedCustomer.id === id) {
        openCustomerModal(id);
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.message) return;
    setIsSendingNotif(true);
    try {
      await api.post(`/admin/customers/${selectedCustomer.id}/notify`, notificationForm);
      addToast('Notification sent', 'success');
      setNotificationForm({ title: '', message: '' });
      openCustomerModal(selectedCustomer.id); // refresh
    } catch (err) {
      addToast('Failed to send notification', 'error');
    } finally {
      setIsSendingNotif(false);
    }
  };

  const handleReviewAction = async (reviewId, action) => {
    try {
      if (action === 'approve') {
        await api.patch(`/admin/reviews/${reviewId}/approve`);
        addToast('Review approved', 'success');
      } else if (action === 'delete') {
        if (!window.confirm("Delete this review?")) return;
        await api.delete(`/admin/reviews/${reviewId}`);
        addToast('Review deleted', 'success');
      }
      openCustomerModal(selectedCustomer.id); // refresh
    } catch (err) {
      addToast(`Failed to ${action} review`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Stats */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-white/60 text-sm mt-1">Manage your registered portal customers</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: stats.totalCustomers, icon: HiOutlineUsers, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'New Today', value: stats.newToday, icon: HiOutlineCheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: HiOutlineCurrencyDollar, color: 'text-[#EC4824]', bg: 'bg-[#EC4824]/10' },
          { label: 'Avg Order Value', value: formatCurrency(stats.avgOrderValue), icon: HiOutlineShoppingBag, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#EC4824]"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 md:w-40 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#EC4824]"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 md:w-48 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#EC4824]"
          >
            <option value="Newest">Newest First</option>
            <option value="Most Orders">Most Orders</option>
            <option value="Most Spent">Highest Spent</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-white/60 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Loyalty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-white/60">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-white/60">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {customer.avatar ? (
                          <img src={customer.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold text-lg">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white">{customer.name}</div>
                          <div className="text-xs text-white/40">Joined {new Date(customer.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{customer.email}</div>
                      <div className="text-xs text-white/60">{customer.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-brand-orange/20 text-brand-orange px-2.5 py-1 rounded-full text-xs font-bold">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-green-400">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <HiStar size={16} />
                        <span className="font-bold">{customer.loyaltyPoints}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        customer.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openCustomerModal(customer.id)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-blue-400 transition-colors tooltip-trigger relative group"
                        >
                          <HiEye size={18} />
                        </button>
                        <button
                          onClick={() => toggleStatus(customer.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            customer.isActive 
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' 
                              : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                          }`}
                        >
                          {customer.isActive ? <HiNoSymbol size={18} /> : <HiOutlineCheckCircle size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-4">
                  {selectedCustomer.avatar ? (
                    <img src={selectedCustomer.avatar} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-brand-orange" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      {selectedCustomer.name}
                      {!selectedCustomer.isActive && (
                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full font-medium">Suspended</span>
                      )}
                    </h2>
                    <p className="text-white/60">{selectedCustomer.email} • {selectedCustomer.phone || 'No phone'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                >
                  <HiOutlineXMark size={24} />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-white/10 bg-white/5 px-6 overflow-x-auto">
                {['Profile', 'Orders', 'Addresses', 'Reviews', 'Notifications', 'Loyalty History'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab 
                        ? 'text-brand-orange border-brand-orange' 
                        : 'text-white/60 border-transparent hover:text-white'
                    }`}
                  >
                    {tab}
                    {tab === 'Orders' && selectedCustomer.orders?.length > 0 && ` (${selectedCustomer.orders.length})`}
                    {tab === 'Reviews' && selectedCustomer.reviews?.length > 0 && ` (${selectedCustomer.reviews.length})`}
                  </button>
                ))}
              </div>

              {/* Modal Content Area */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                
                {/* TAB: Profile */}
                {activeTab === 'Profile' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-white mb-4">Customer Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-white/60">Joined:</div>
                        <div className="text-white font-medium">{new Date(selectedCustomer.createdAt).toLocaleString()}</div>
                        <div className="text-white/60">Last Login:</div>
                        <div className="text-white font-medium">{selectedCustomer.lastLoginAt ? new Date(selectedCustomer.lastLoginAt).toLocaleString() : 'Never'}</div>
                        <div className="text-white/60">Verified:</div>
                        <div className="text-white font-medium">{selectedCustomer.isVerified ? 'Yes' : 'No'}</div>
                        <div className="text-white/60">Google Auth:</div>
                        <div className="text-white font-medium">{selectedCustomer.googleId ? 'Yes' : 'No'}</div>
                      </div>
                      
                      <div className="pt-4 mt-4 border-t border-white/10">
                         <button 
                           onClick={() => toggleStatus(selectedCustomer.id)}
                           className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                             selectedCustomer.isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                           }`}
                         >
                           {selectedCustomer.isActive ? 'Suspend Customer Account' : 'Activate Customer Account'}
                         </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Lifetime Stats</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-white/80">
                            <HiOutlineShoppingBag className="text-brand-orange" size={24} />
                            <span className="font-medium">Total Orders</span>
                          </div>
                          <span className="text-xl font-bold text-white">{selectedCustomer.totalOrders}</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-white/80">
                            <HiOutlineCurrencyDollar className="text-green-400" size={24} />
                            <span className="font-medium">Total Spent</span>
                          </div>
                          <span className="text-xl font-bold text-white">{formatCurrency(selectedCustomer.totalSpent)}</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-white/80">
                            <HiStar className="text-yellow-400" size={24} />
                            <span className="font-medium">Loyalty Points</span>
                          </div>
                          <span className="text-xl font-bold text-white">{selectedCustomer.loyaltyPoints}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: Orders */}
                {activeTab === 'Orders' && (
                  <div>
                    {selectedCustomer.orders?.length === 0 ? (
                      <div className="text-center py-8 text-white/60">No orders placed yet.</div>
                    ) : (
                      <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                        <table className="w-full text-left text-sm text-white/80">
                          <thead className="bg-white/5 text-white/60 text-xs uppercase font-medium">
                            <tr>
                              <th className="px-4 py-3">Order #</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Items</th>
                              <th className="px-4 py-3">Total</th>
                              <th className="px-4 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {selectedCustomer.orders.map(order => (
                              <tr key={order.id} className="hover:bg-white/5">
                                <td className="px-4 py-3 font-mono text-brand-orange">{order.orderNumber}</td>
                                <td className="px-4 py-3 capitalize">
                                  <span className={`px-2 py-0.5 rounded text-xs ${order.type === 'delivery' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                    {order.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3">{order.items?.length || 0} items</td>
                                <td className="px-4 py-3 font-medium">{formatCurrency(order.totalAmount)}</td>
                                <td className="px-4 py-3 capitalize">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                    order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Addresses */}
                {activeTab === 'Addresses' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCustomer.addresses?.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-white/60">No addresses saved.</div>
                    ) : (
                      selectedCustomer.addresses.map(addr => (
                        <div key={addr.id} className="bg-white/5 border border-white/10 p-4 rounded-xl relative">
                          {addr.isDefault && (
                            <span className="absolute top-4 right-4 text-[10px] bg-brand-orange/20 text-brand-orange px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                              Default
                            </span>
                          )}
                          <div className="flex items-center gap-2 text-white font-medium mb-2">
                            <HiOutlineMapPin className="text-white/40" />
                            {addr.label}
                          </div>
                          <p className="text-sm text-white/60 mt-1">{addr.address}</p>
                          {(addr.area || addr.landmark) && (
                            <p className="text-xs text-white/40 mt-2">
                              {addr.area && `Area: ${addr.area} `}
                              {addr.landmark && `| Landmark: ${addr.landmark}`}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB: Reviews */}
                {activeTab === 'Reviews' && (
                  <div className="space-y-4">
                    {selectedCustomer.reviews?.length === 0 ? (
                      <div className="text-center py-8 text-white/60">No reviews submitted.</div>
                    ) : (
                      selectedCustomer.reviews.map(review => (
                        <div key={review.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  i < review.rating ? <HiStar key={i} size={14} /> : <HiOutlineStar key={i} size={14} />
                                ))}
                              </div>
                              <span className="text-xs text-white/40">{new Date(review.createdAt).toLocaleDateString()}</span>
                              {review.approved ? (
                                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase font-bold">Approved</span>
                              ) : (
                                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full uppercase font-bold">Pending</span>
                              )}
                            </div>
                            <h4 className="text-white font-medium text-sm">{review.menuItemName || 'General Review'}</h4>
                            <p className="text-white/80 text-sm mt-1">{review.comment}</p>
                          </div>
                          <div className="flex gap-2 items-start shrink-0">
                            {!review.approved && (
                              <button onClick={() => handleReviewAction(review.id, 'approve')} className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-xs font-medium transition-colors">
                                Approve
                              </button>
                            )}
                            <button onClick={() => handleReviewAction(review.id, 'delete')} className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-medium transition-colors">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB: Notifications */}
                {activeTab === 'Notifications' && (
                  <div className="space-y-6">
                    {/* Send Notif Form */}
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                      <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <HiOutlinePaperAirplane /> Send Custom Notification
                      </h4>
                      <form onSubmit={handleSendNotification} className="flex flex-col gap-3">
                        <input
                          type="text"
                          placeholder="Notification Title"
                          value={notificationForm.title}
                          onChange={e => setNotificationForm({...notificationForm, title: e.target.value})}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-orange"
                          required
                        />
                        <textarea
                          placeholder="Notification Message"
                          value={notificationForm.message}
                          onChange={e => setNotificationForm({...notificationForm, message: e.target.value})}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-orange min-h-[80px]"
                          required
                        />
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSendingNotif}
                            className="px-6 py-2 bg-brand-orange text-white text-sm font-bold rounded-lg hover:bg-[#d43d1c] disabled:opacity-50 transition-colors"
                          >
                            {isSendingNotif ? 'Sending...' : 'Send Notification'}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Notifs List */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-white mb-3">Notification History</h4>
                      {selectedCustomer.notifications?.length === 0 ? (
                        <div className="text-center py-4 text-white/60 text-sm">No notifications sent.</div>
                      ) : (
                        selectedCustomer.notifications.map(notif => (
                          <div key={notif.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex gap-4 items-start">
                            <div className={`p-2 rounded-full mt-1 ${notif.read ? 'bg-white/10 text-white/40' : 'bg-brand-orange/20 text-brand-orange'}`}>
                              <HiOutlineBell size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h5 className="text-sm font-bold text-white">{notif.title}</h5>
                                <span className="text-[10px] text-white/40">{new Date(notif.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-white/70 mt-1">{notif.message}</p>
                              <div className="mt-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
                                Status: {notif.read ? 'Read' : 'Unread'}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: Loyalty History */}
                {activeTab === 'Loyalty History' && (
                  <div>
                    <div className="bg-white/5 border border-brand-orange/30 p-4 rounded-xl mb-6 flex items-center justify-between">
                      <div>
                        <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider">Current Balance</h4>
                        <div className="text-3xl font-bold text-white mt-1 flex items-center gap-2">
                          <HiStar className="text-yellow-400" /> {selectedCustomer.loyaltyPoints}
                        </div>
                      </div>
                    </div>
                    
                    {selectedCustomer.loyaltyHistory?.length === 0 ? (
                      <div className="text-center py-8 text-white/60">No loyalty history available.</div>
                    ) : (
                      <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                        <table className="w-full text-left text-sm text-white/80">
                          <thead className="bg-white/5 text-white/60 text-xs uppercase font-medium">
                            <tr>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Description</th>
                              <th className="px-4 py-3 text-right">Points</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {selectedCustomer.loyaltyHistory.map(entry => (
                              <tr key={entry.id} className="hover:bg-white/5">
                                <td className="px-4 py-3">{new Date(entry.createdAt).toLocaleString()}</td>
                                <td className="px-4 py-3">{entry.description}</td>
                                <td className={`px-4 py-3 text-right font-bold ${entry.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                  {entry.type === 'credit' ? '+' : ''}{entry.points}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
