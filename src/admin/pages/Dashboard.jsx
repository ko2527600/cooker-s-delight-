import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart as RechartsBarChart
} from "recharts";
import { 
  HiOutlineBanknotes, HiOutlineShoppingBag, HiOutlineStar, 
  HiOutlineRectangleGroup, HiOutlineArrowPath, HiOutlineExclamationTriangle,
  HiOutlineUser, HiOutlineTruck, HiOutlineClock, HiOutlineCheckCircle
} from "react-icons/hi2";
import api from "../../api/axios";
import StatCard from "../components/StatCard";
import Skeleton from "../components/Skeleton";

const formatCurrency = (val) => `₵${val?.toLocaleString()}`;

const relativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartRange, setChartRange] = useState("30D");

  const fetchSummary = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const response = await api.get("/analytics/summary");
      setData(response.data);
      setError(null);
    } catch (err) {
      if (!isSilent) setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(() => fetchSummary(true), 30000);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Skeleton height="140px" count={4} />
        </div>
        <Skeleton height="400px" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton height="400px" />
          <Skeleton height="400px" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
          <HiOutlineExclamationTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold text-white">Oops! Something went wrong</h3>
        <p className="text-white/40 max-w-md">{error}</p>
        <button 
          onClick={() => fetchSummary()}
          className="flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
        >
          <HiOutlineArrowPath size={20} /> Try Again
        </button>
      </div>
    );
  }

  const {
    totalRevenue, totalOrders, totalMenuItems, totalReviews,
    averageRating, ordersToday, revenueToday, revenueByDay,
    topItems, ordersByBranch, ordersByStatus, recentOrders,
    totalCustomers, newCustomersToday, recentCustomerOrders
  } = data;

  // Chart data filtering (mocking range for now)
  const filteredRevenueByDay = chartRange === "7D" ? revenueByDay.slice(-7) : revenueByDay;

  const statusColors = {
    pending: "#F59E0B",
    confirmed: "#3B82F6",
    preparing: "#EC4824",
    delivered: "#10B981",
    cancelled: "#EF4444"
  };

  const statusBadges = {
    pending: "bg-yellow-500/15 text-yellow-400",
    confirmed: "bg-blue-500/15 text-blue-400",
    preparing: "bg-orange-500/15 text-orange-400",
    delivered: "bg-green-500/15 text-green-400",
    cancelled: "bg-red-500/15 text-red-400"
  };

  const pieData = Object.keys(ordersByStatus).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: ordersByStatus[key],
    color: statusColors[key] || "#8884d8"
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-10">
      {/* Row 1 - Stats */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(totalRevenue)} 
            icon={<HiOutlineBanknotes size={24} />}
            trend={revenueToday > 0 ? `₵${revenueToday} today` : "No sales today"}
            trendUp={revenueToday > 0}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Total Orders" 
            value={totalOrders} 
            icon={<HiOutlineShoppingBag size={24} />}
            trend={ordersToday > 0 ? `${ordersToday} new today` : "No orders today"}
            trendUp={ordersToday > 0}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Average Rating" 
            value={`${averageRating}★`} 
            icon={<HiOutlineStar size={24} />}
            trend={`${totalReviews} reviews`}
            trendUp={true}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Menu Items" 
            value={totalMenuItems} 
            icon={<HiOutlineRectangleGroup size={24} />}
            trend="All available"
            trendUp={true}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard 
            title="Total Customers" 
            value={totalCustomers} 
            icon={<HiOutlineUser size={24} />}
            trend={newCustomersToday > 0 ? `${newCustomersToday} new today` : "No new today"}
            trendUp={newCustomersToday > 0}
          />
        </motion.div>
      </motion.div>

      {/* Row 2 - Revenue Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Revenue Overview</h3>
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Performance metrics for last {chartRange === "7D" ? '7 days' : '30 days'}</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl">
            {["7D", "30D"].map(range => (
              <button
                key={range}
                onClick={() => setChartRange(range)}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${chartRange === range ? 'bg-[#EC4824] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <ComposedChart data={filteredRevenueByDay}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4824" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EC4824" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis 
                yAxisId="left" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} 
                tickFormatter={(val) => `₵${val}`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                hide 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px" }}
                itemStyle={{ fontWeight: "bold" }}
                labelStyle={{ marginBottom: "8px", color: "rgba(255,255,255,0.4)" }}
              />
              <Bar 
                yAxisId="right" 
                dataKey="orders" 
                fill="rgba(135,39,53,0.3)" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
                name="Orders"
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="revenue" 
                stroke="#EC4824" 
                strokeWidth={3} 
                dot={false}
                name="Revenue ₵"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Row 3 - Recent Orders & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden"
        >
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Recent Orders</h3>
            <Link to="/admin/orders" className="text-[#EC4824] text-xs font-bold uppercase tracking-widest hover:underline">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 text-left text-white/20 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Items</th>
                  <th className="px-8 py-4">Total</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-white/20">
                      <div className="mb-2 flex justify-center"><HiOutlineShoppingBag size={48} /></div>
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-white">{order.customerName}</p>
                        <p className="text-[10px] text-white/40">{order.branch}</p>
                      </td>
                      <td className="px-8 py-5 text-xs text-white/60 font-medium">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        <span className="block text-[10px] text-white/20 truncate max-w-[120px]">{order.items[0]?.menuItem}...</span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-brand-orange">
                        ₵{order.totalAmount}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadges[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs text-white/40 font-medium">
                        {relativeTime(order.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[#1a1a1a] border border-white/5 rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold text-white mb-8">Top Selling Items</h3>
          <div className="space-y-8">
            {topItems.map((item, idx) => {
              const maxCount = topItems[0].count;
              const percentage = (item.count / maxCount) * 100;
              return (
                <div key={item.name} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#EC4824]/20 text-[#EC4824] flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-bold text-white">{item.name}</p>
                    </div>
                    <span className="text-[10px] font-bold text-white/40">{item.count} orders</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                      className="h-full bg-[#EC4824] rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Row 4 - 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-bold text-white mb-4">Orders by Status</h3>
          <div className="flex-1 w-full relative" style={{ minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <p className="text-3xl font-display font-bold text-white">{totalOrders}</p>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Total</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-bold text-white/40 uppercase">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Branch Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 h-[400px]"
        >
          <h3 className="text-lg font-bold text-white mb-8">Orders by Branch</h3>
          <div className="h-[250px] w-full" style={{ minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <RechartsBarChart data={ordersByBranch} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="branch" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px" }}
                />
                <Bar dataKey="count" fill="#EC4824" opacity={0.8} radius={[0, 4, 4, 0]} barSize={20} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 h-[400px] flex flex-col"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            <p className="text-[10px] text-[#EC4824] font-bold uppercase tracking-widest mt-1">Live Updates</p>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            {recentOrders.map((order, i) => (
              <div key={order.id} className="flex gap-4 relative">
                {i !== recentOrders.length - 1 && (
                  <div className="absolute left-4 top-10 bottom-[-24px] w-[1px] bg-white/5" />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 
                  order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {order.status === 'delivered' ? <HiOutlineCheckCircle size={14} /> : 
                   order.status === 'pending' ? <HiOutlineClock size={14} /> : <HiOutlineTruck size={14} />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">
                    {order.status === 'pending' ? 'New order received' : `Order ${order.status}`} from {order.customerName.split(' ')[0]}
                    <span className="text-brand-orange ml-1">₵{order.totalAmount}</span>
                  </p>
                  <p className="text-[10px] text-white/20 font-bold mt-1 uppercase tracking-tighter">{relativeTime(order.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Customer Orders Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 overflow-hidden"
      >
        <h3 className="text-lg font-bold text-white mb-6">Recent Customer Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-white/60 text-xs uppercase font-medium">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentCustomerOrders && recentCustomerOrders.length > 0 ? (
                recentCustomerOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-brand-orange">{order.orderNumber}</td>
                    <td className="px-4 py-3 font-bold text-white">{order.customer?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${order.type === 'delivery' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">₵{order.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusBadges[order.status] || 'bg-white/5 text-white/40'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-white/40">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-white/40">No recent customer orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
