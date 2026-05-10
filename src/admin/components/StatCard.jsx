import React from "react";
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";

const StatCard = ({ title, value, icon, trend, trendUp = true }) => {
  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-brand-orange/30 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-display font-bold text-white">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${trendUp ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trendUp ? <HiArrowTrendingUp size={10} /> : <HiArrowTrendingDown size={10} />}
            {trend}
          </div>
          <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
