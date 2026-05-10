import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  HiOutlineShoppingBag, HiOutlineArrowLeft, HiOutlineClock,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineTruck,
  HiOutlineBuildingStorefront, HiOutlineStar, HiOutlineReceiptPercent
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import OrderStatusBadge from '../components/OrderStatusBadge';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/customers/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      toast.error('Failed to load order details');
      navigate('/portal/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Refresh status if active
    const interval = setInterval(() => {
      if (order && !['delivered', 'cancelled'].includes(order.status)) {
        fetchOrder();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [id, order?.status]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? This will also reverse any loyalty points earned.")) return;
    setCancelling(true);
    try {
      await api.patch(`/customers/orders/${id}/cancel`);
      toast.success('Order cancelled');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-48 bg-white/5 rounded-3xl" />
        <div className="h-96 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  const steps = ['pending', 'confirmed', 'preparing', 'delivered'];
  const currentStepIndex = steps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Top Nav */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/portal/orders')}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white"
        >
          <HiOutlineArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Order Details</h2>
      </div>

      {/* Tracker Section */}
      <section className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden relative">
         {/* Success Background Effect */}
         {order.status === 'delivered' && (
           <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
         )}

         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 relative z-10">
            <div>
               <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Order Number</p>
               <h3 className="text-3xl font-black text-white tracking-tight">{order.orderNumber}</h3>
               <p className="text-xs text-white/40 mt-1">{new Date(order.createdAt).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
               <OrderStatusBadge status={order.status} />
               {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                 <div className="flex items-center gap-2 text-green-400 text-xs font-bold animate-pulse">
                    <HiOutlineClock /> Est. Arrival in 25-30 mins
                 </div>
               )}
            </div>
         </div>

         {!isCancelled ? (
           <div className="relative pt-4 pb-12 px-4 sm:px-12 z-10">
              <div className="absolute top-[26px] left-[10%] right-[10%] h-1 bg-white/5">
                 <div 
                   className="h-full bg-brand-orange transition-all duration-1000 shadow-[0_0_15px_rgba(236,72,36,0.5)]" 
                   style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} 
                 />
              </div>
              <div className="flex justify-between items-center relative">
                 {steps.map((s, i) => (
                   <div key={s} className="flex flex-col items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                        i <= currentStepIndex ? 'bg-brand-orange border-brand-orange text-white scale-110 shadow-lg shadow-brand-orange/40' : 'bg-[#141414] border-white/10 text-white/20'
                      }`}>
                        {i < currentStepIndex ? <HiOutlineCheckCircle size={18} /> : <div className={`w-2 h-2 rounded-full ${i === currentStepIndex ? 'bg-white animate-ping' : 'bg-current'}`} />}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${i <= currentStepIndex ? 'text-white' : 'text-white/20'}`}>
                         {s}
                      </span>
                   </div>
                 ))}
              </div>
           </div>
         ) : (
           <div className="py-12 flex flex-col items-center gap-4 text-red-500">
              <HiOutlineXCircle size={48} className="animate-bounce" />
              <p className="font-black text-xl tracking-tighter uppercase">This order was cancelled</p>
              <p className="text-white/40 text-xs text-center max-w-xs leading-relaxed">If you have any questions about this cancellation, please contact our support team.</p>
           </div>
         )}
      </section>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Items & Bill */}
         <section className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
            <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
               <HiOutlineShoppingBag className="text-brand-orange" />
               Items Ordered
            </h4>
            
            <div className="space-y-4">
               {order.items.map(item => (
                 <div key={item.id} className="flex justify-between items-center group">
                    <div className="flex gap-4">
                       <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden shrink-0">
                          <img src={item.menuItem?.image} alt="" className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="font-bold text-white/80 text-sm">{item.menuItem?.name || item.name}</p>
                          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Qty: {item.quantity} x ₵{item.price}</p>
                       </div>
                    </div>
                    <span className="font-black text-white">₵{item.price * item.quantity}</span>
                 </div>
               ))}
            </div>

            <div className="pt-8 border-t border-white/5 space-y-3">
               <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40">
                  <span>Subtotal</span>
                  <span>₵{order.totalAmount - (order.type === 'delivery' ? 15 : 0)}</span>
               </div>
               {order.type === 'delivery' && (
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/40">
                    <span>Delivery Fee</span>
                    <span>₵15</span>
                 </div>
               )}
               <div className="flex justify-between text-2xl font-black uppercase tracking-tight text-brand-orange pt-2">
                  <span>Total</span>
                  <span>₵{order.totalAmount}</span>
               </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <HiOutlineStar className="text-yellow-400" />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Loyalty Earned</span>
               </div>
               <span className="font-black text-yellow-400 text-sm">+{Math.floor(order.totalAmount / 10)} Points</span>
            </div>
         </section>

         {/* Logistics & Support */}
         <div className="space-y-8">
            <section className="bg-[#141414] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
               <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                  {order.type === 'delivery' ? <HiOutlineTruck className="text-brand-orange" /> : <HiOutlineBuildingStorefront className="text-brand-orange" />}
                  {order.type === 'delivery' ? 'Delivery Details' : 'Pickup Details'}
               </h4>
               
               <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                     <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
                        {order.type === 'delivery' ? 'Shipping Address' : 'Branch Location'}
                     </p>
                     <p className="font-bold text-white text-sm">{order.deliveryAddress || order.branch}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                     <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Payment Method</p>
                     <p className="font-bold text-white text-sm capitalize">{order.paymentMethod} ({order.paymentStatus})</p>
                  </div>
                  {order.note && (
                    <div className="flex flex-col gap-1">
                       <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">Special Note</p>
                       <p className="text-xs text-white/40 italic leading-relaxed">"{order.note}"</p>
                    </div>
                  )}
               </div>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col gap-4">
               <h4 className="text-sm font-black text-white uppercase tracking-widest">Actions</h4>
               
               {order.status === 'pending' && (
                 <button 
                   onClick={handleCancel}
                   disabled={cancelling}
                   className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black py-4 rounded-2xl transition-all border border-red-500/20 text-xs uppercase tracking-widest"
                 >
                    {cancelling ? 'CANCELLING...' : 'CANCEL ORDER'}
                 </button>
               )}

               {order.status === 'delivered' && (
                 <button 
                    className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-orange/20 hover:scale-105 transition-all text-xs uppercase tracking-widest"
                 >
                    RATE THIS MEAL
                 </button>
               )}

               <button className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  <HiOutlineReceiptPercent size={18} className="text-brand-orange" />
                  NEED HELP? CONTACT SUPPORT
               </button>
            </section>
         </div>

      </div>

    </div>
  );
};

export default OrderDetail;
