/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useState } from 'react';
import { MENU_ITEMS } from '../constants';
import { HiOutlineShoppingBag, HiPlus } from 'react-icons/hi2';

export function Menu() {
  const categories = ['All', 'Ghanaian', 'Nigerian', 'Fast Food', 'Continental', 'Snacks', 'Sides'];
  const [activeTab, setActiveTab] = useState('All');

  const filteredItems = activeTab === 'All' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === activeTab);

  return (
    <section id="menu" className="py-24 bg-[#111111] immersive-gradient relative border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-black text-white mb-4">
            Our Taste-Bud <span className="text-brand-orange">Heaven</span>
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto italic text-lg uppercase tracking-widest text-xs font-black">
            "A perfect blend of tradition and modern mastery."
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-8 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest transition-all duration-300 border ${
                activeTab === cat 
                  ? 'bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20 scale-105' 
                  : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <motion.div 
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={item.id}
              className="group glass-panel rounded-lg overflow-hidden border-white/5 hover:border-brand-orange transition-all h-full flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden relative group-hover:grayscale-0 transition-all duration-700">
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800&fm=webp'} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-4 left-4 bg-brand-orange px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest text-white">
                  {item.category}
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-serif text-2xl font-bold text-white leading-tight">{item.name}</h3>
                  <span className="text-brand-orange font-black text-lg">{item.price}</span>
                </div>
                <p className="text-white/40 text-sm mb-8 flex-grow leading-relaxed">{item.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-1 text-brand-orange/40 text-[10px]">
                    {'GH-AUTH'.repeat(1)}
                  </div>
                  <button className="flex items-center gap-2 bg-transparent border border-white/20 text-white px-5 py-2.5 rounded-sm text-[10px] uppercase font-black tracking-widest hover:bg-white hover:text-black transition-colors">
                    <HiPlus size={12} />
                    Quick Add
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
