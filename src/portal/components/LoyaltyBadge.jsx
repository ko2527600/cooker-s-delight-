import React from 'react';
import { HiStar } from 'react-icons/hi2';

const LoyaltyBadge = ({ points, className = "" }) => {
  return (
    <div className={`flex items-center gap-1.5 bg-yellow-400/10 text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-400/20 shadow-sm ${className}`}>
      <HiStar size={16} className="animate-pulse" />
      <span className="font-bold text-xs uppercase tracking-tight">{points} Points</span>
    </div>
  );
};

export default LoyaltyBadge;
