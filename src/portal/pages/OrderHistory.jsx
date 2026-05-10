import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineShoppingBag, HiOutlineArrowRight, HiOutlineMagnifyingGlass,
  HiOutlineFunnel, HiOutlineClock, HiOutlineChevronRight
} from 'react-icons/hi2';
import api from '../../api/axios';
import OrderStatusBadge from '../components/OrderStatusBadge';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/customers/orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchFilter = filter === 'All' || 
                       (filter === 'Active' && ['pending', 'confirmed', 'preparing'].includes(o.status)) ||
                       (filter === 'Delivered' && o.status === 'delivered') ||
                       (filter === 'Cancelled' && o.status === 'cancelled');
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-white/5 rounded-2xl w-full max-w-md" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white/5 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">My Orders</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Active', 'Delivered', 'Cancelled'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f ? 'bg-brand-orange text-white shadow-lg' : 'bg-white/5 text-white/40 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative w-full lg:w-72">
           <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
           <input 
              type="text" 
              placeholder="Search by order number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-brand-orange outline-none transition-all"
           />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, idx) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/portal/orders/${order.id}`)}
              className="bg-[#141414] border border-white/5 p-6 rounded-[2rem] hover:bg-white/[0.03] transition-all cursor-pointer group relative overflow-hidden"
            >
              {/* Subtle accent for active orders */}
              {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
              )}
              
              <div className="flex flex-col sm:flex-row gap-6 justify-between sm:items-center">
                 <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all duration-300">
                       <HiOutlineShoppingBag size={28} />
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-lg text-white tracking-tight">{order.orderNumber}</p>
                          <OrderStatusBadge status={order.status} />
                       </div>
                       <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} • {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                       </p>
                    </div>
                 </div>

                 <div className="flex items-center justify-between sm:justify-end gap-10 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                    <div className="flex flex-col sm:items-end gap-1">
                       <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Total Amount</p>
                       <p className="font-black text-2xl text-white">₵{order.totalAmount}</p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1">
                       <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Service</p>
                       <span className={`font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full ${order.type === 'delivery' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                          {order.type}
                       </span>
                    </div>
                    <HiOutlineChevronRight size={20} className="text-white/20 group-hover:text-brand-orange group-hover:translate-x-1 transition-all hidden sm:block" />
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-[#141414] border border-white/5 p-20 rounded-[3rem] text-center space-y-6">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                <HiOutlineShoppingBag size={40} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-white mb-2">No orders found</h3>
                <p className="text-white/40 text-sm max-w-xs mx-auto">Looks like you haven't placed any orders matching this filter yet.</p>
             </div>
             <Link to="/portal/order" className="inline-flex bg-brand-orange text-white font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-orange/20">
                Place New Order
             </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default OrderHistory;
