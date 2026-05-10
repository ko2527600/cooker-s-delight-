import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  HiOutlineShoppingBag, HiOutlineArrowRight, HiOutlineClock, 
  HiOutlineStar, HiOutlineBanknotes, HiOutlineBell, HiOutlineArrowPath
} from 'react-icons/hi2';
import { useCustomer } from '../CustomerContext';
import OrderStatusBadge from '../components/OrderStatusBadge';
import api from '../../api/axios';

const StatCard = ({ title, value, icon: Icon, trend, trendColor }) => (
  <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
    <div className="relative z-10">
      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/40 group-hover:text-brand-orange transition-colors mb-4">
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
      {trend && (
        <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${trendColor}`}>
           {trend}
        </div>
      )}
    </div>
  </div>
);

const CustomerDashboard = () => {
  const { customer } = useCustomer();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, notifsRes] = await Promise.all([
          api.get('/customers/orders'),
          api.get('/customers/notifications')
        ]);
        
        const orders = ordersRes.data;
        const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const pendingCount = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
        
        setStats({
          totalOrders: orders.length,
          totalSpent: totalSpent,
          pendingCount: pendingCount
        });
        setRecentOrders(orders.slice(0, 3));
        setRecentNotifs((notifsRes.data.notifications || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-48 bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 h-96 bg-white/5 rounded-2xl" />
           <div className="h-96 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      
      {/* Welcome Banner */}
      <section className="relative bg-[#1a1a1a] rounded-[2.5rem] p-8 lg:p-12 overflow-hidden border border-white/5">
        <div className="absolute inset-0 z-0 overflow-hidden">
           <img 
            src="/assets/cookers delight1.webp" 
            alt="" 
            className="w-full h-full object-cover opacity-20 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-xl">
           <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
             {getTimeGreeting()}, <span className="text-brand-orange">{customer?.name?.split(' ')[0]}!</span> 👋
           </h1>
           <p className="text-white/60 font-medium mb-8">What would you like to eat today? Your favourite jollof and chicken is just a few taps away.</p>
           <Link to="/portal/order" className="inline-flex items-center gap-3 bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest transition-all hover:scale-105 shadow-2xl shadow-brand-orange/20 group">
              ORDER NOW
              <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={HiOutlineShoppingBag}
          trend={`${stats.totalOrders} lifetime orders`}
          trendColor="text-white/40"
        />
        <StatCard 
          title="Total Spent" 
          value={`₵${stats.totalSpent}`} 
          icon={HiOutlineBanknotes}
          trend="Lifetime spending"
          trendColor="text-white/40"
        />
        <StatCard 
          title="Loyalty Points" 
          value={customer?.loyaltyPoints || 0} 
          icon={HiOutlineStar}
          trend="Available to redeem"
          trendColor="text-yellow-400"
        />
        <StatCard 
          title="Active Orders" 
          value={stats.pendingCount} 
          icon={HiOutlineClock}
          trend={stats.pendingCount > 0 ? "Tracking live" : "No active orders"}
          trendColor={stats.pendingCount > 0 ? "text-brand-orange" : "text-white/40"}
        />
      </section>

      {/* Loyalty Progress Section */}
      <section className="bg-gradient-to-br from-[#872735] to-[#EC4824] rounded-3xl p-8 lg:p-10 shadow-2xl shadow-brand-orange/10 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110" />
        
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex items-center gap-3 text-white/80 mb-2">
            <HiOutlineStar size={28} className="text-yellow-400" />
            <span className="font-black text-2xl tracking-tight">⭐ {customer?.loyaltyPoints} Loyalty Points</span>
          </div>
          <p className="text-white/80 font-medium max-w-sm">You earn 1 point for every ₵10 spent. Keep ordering to unlock exclusive rewards and discounts!</p>
          
          <div className="mt-6 w-full max-w-md bg-black/20 rounded-full h-3 overflow-hidden p-0.5">
             <div 
               className="bg-white h-full rounded-full shadow-lg" 
               style={{ width: `${Math.min((customer?.loyaltyPoints % 100), 100)}%` }} 
             />
          </div>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-2">
            {100 - (customer?.loyaltyPoints % 100)} points until your next reward milestone
          </p>
        </div>

        <Link to="/portal/loyalty" className="bg-white text-brand-orange px-8 py-4 rounded-2xl font-black text-sm tracking-widest hover:bg-brand-orange hover:text-white transition-all shadow-xl active:scale-95 whitespace-nowrap relative z-10">
          VIEW HISTORY
        </Link>
      </section>

      {/* Main Grid: Orders & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Recent Orders List */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-black tracking-tight text-white uppercase">Recent Orders</h3>
            <Link to="/portal/orders" className="text-brand-orange text-xs font-bold hover:underline tracking-widest uppercase">View All</Link>
          </div>

          <div className="space-y-4">
            {recentOrders.length > 0 ? recentOrders.map(order => (
              <div key={order.id} className="bg-[#141414] border border-white/5 p-6 rounded-2xl hover:bg-white/5 transition-all group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-brand-orange shrink-0">
                    <HiOutlineShoppingBag size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-white mb-1">Order {order.orderNumber}</p>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="font-black text-white">₵{order.totalAmount}</p>
                    <div className="mt-1"><OrderStatusBadge status={order.status} /></div>
                  </div>
                  <Link to={`/portal/orders/${order.id}`} className="p-3 bg-white/5 hover:bg-brand-orange rounded-xl text-white/60 hover:text-white transition-all">
                    <HiOutlineArrowRight size={20} />
                  </Link>
                </div>
              </div>
            )) : (
              <div className="bg-[#141414] border border-white/5 p-12 rounded-2xl text-center">
                 <HiOutlineShoppingBag size={48} className="mx-auto text-white/10 mb-4" />
                 <p className="text-white/40 font-bold mb-6">No orders found.</p>
                 <Link to="/portal/order" className="text-brand-orange font-bold text-sm hover:underline uppercase tracking-widest">Place your first order</Link>
              </div>
            )}
          </div>
        </section>

        {/* Recent Notifications */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-black tracking-tight text-white uppercase">Activity</h3>
            <Link to="/portal/notifications" className="text-brand-orange text-xs font-bold hover:underline tracking-widest uppercase">View All</Link>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
             {recentNotifs.length > 0 ? recentNotifs.map(n => (
               <div key={n.id} className="p-6 hover:bg-white/[0.02] transition-all relative group">
                  {!n.read && <div className="absolute left-0 top-6 bottom-6 w-1 bg-brand-orange rounded-r-full" />}
                  <div className="flex gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.read ? 'bg-brand-orange/20 text-brand-orange' : 'bg-white/5 text-white/20'}`}>
                        <HiOutlineBell size={18} />
                     </div>
                     <div>
                        <p className={`text-sm font-bold mb-1 ${!n.read ? 'text-white' : 'text-white/60'}`}>{n.title}</p>
                        <p className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">{n.message}</p>
                     </div>
                  </div>
               </div>
             )) : (
               <div className="p-12 text-center text-white/10">
                  <HiOutlineBell size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">No Activity</p>
               </div>
             )}
          </div>
          
          <div className="bg-brand-orange/5 border border-brand-orange/10 p-6 rounded-3xl mt-6">
             <div className="flex items-center gap-3 mb-3">
                <HiOutlineStar className="text-yellow-400" size={20} />
                <span className="text-xs font-black text-white uppercase tracking-tight">Need Help?</span>
             </div>
             <p className="text-[10px] text-white/60 leading-relaxed mb-4">Our support team is available via WhatsApp for any order inquiries or complaints.</p>
             <a href="https://wa.me/233243379412" className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] hover:underline flex items-center gap-1">
                CONTACT SUPPORT <HiOutlineArrowRight size={10} />
             </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default CustomerDashboard;
