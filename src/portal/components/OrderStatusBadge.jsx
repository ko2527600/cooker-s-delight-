import React from 'react';

const OrderStatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    preparing: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    delivered: 'bg-green-500/15 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[status] || 'bg-white/5 text-white/40 border-white/10'}`}>
      {status}
    </span>
  );
};

export default OrderStatusBadge;
