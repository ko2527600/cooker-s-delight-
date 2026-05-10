import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineBell, HiOutlineCheckCircle, HiOutlineExclamationCircle, 
  HiOutlineGift, HiOutlineShoppingBag, HiOutlineStar, HiOutlineTrash,
  HiOutlineChatBubbleLeftRight, HiOutlinePaperAirplane, HiOutlineHandThumbUp
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'order_placed': return { icon: HiOutlineShoppingBag, color: 'text-orange-400', bg: 'bg-orange-400/10' };
      case 'order_confirmed': return { icon: HiOutlineCheckCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' };
      case 'order_preparing': return { icon: HiOutlinePaperAirplane, color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
      case 'order_delivered': return { icon: HiOutlineHandThumbUp, color: 'text-green-400', bg: 'bg-green-400/10' };
      case 'order_cancelled': return { icon: HiOutlineExclamationCircle, color: 'text-red-400', bg: 'bg-red-400/10' };
      case 'review_approved': return { icon: HiOutlineStar, color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
      case 'promotion': return { icon: HiOutlineGift, color: 'text-purple-400', bg: 'bg-purple-400/10' };
      default: return { icon: HiOutlineBell, color: 'text-white/40', bg: 'bg-white/5' };
    }
  };

  const { icon: Icon, color, bg } = getIcon(notification.type);
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => !notification.read && onRead(notification.id)}
      className={`p-6 bg-[#141414] border-2 rounded-[2rem] transition-all relative group cursor-pointer ${
        !notification.read ? 'border-brand-orange bg-brand-orange/[0.02]' : 'border-white/5 hover:border-white/10'
      }`}
    >
       {!notification.read && (
         <div className="absolute top-6 right-6 w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
       )}
       
       <div className="flex gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${bg} ${color}`}>
             <Icon size={28} />
          </div>
          <div className="flex-1 space-y-1 pr-6">
             <div className="flex justify-between items-start">
                <h4 className={`font-black text-lg tracking-tight ${!notification.read ? 'text-white' : 'text-white/60'}`}>{notification.title}</h4>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{timeAgo(notification.createdAt)}</span>
             </div>
             <p className={`text-sm leading-relaxed ${!notification.read ? 'text-white/80' : 'text-white/40'}`}>{notification.message}</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
            className="absolute bottom-6 right-6 p-2 text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <HiOutlineTrash size={18} />
          </button>
       </div>
    </motion.div>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/customers/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/customers/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      await api.patch('/customers/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (err) {}
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/customers/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification removed');
    } catch (err) {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-3xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
           <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-brand-orange text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{unreadCount} New</span>
              )}
           </div>
           <p className="text-white/40 text-sm font-medium">Updates on your orders and account activity.</p>
        </div>
        <button 
          onClick={markAllRead}
          className="text-brand-orange text-[10px] font-black uppercase tracking-widest hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        <AnimatePresence>
          {notifications.length > 0 ? notifications.map(n => (
            <NotificationItem 
              key={n.id} 
              notification={n} 
              onRead={markAsRead} 
              onDelete={deleteNotif} 
            />
          )) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#141414] border border-white/5 p-24 rounded-[3rem] text-center space-y-4"
            >
               <HiOutlineBell size={48} className="mx-auto text-white/5" />
               <p className="text-white/20 font-black uppercase tracking-[0.2em] text-sm">No notifications yet</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Notifications;
