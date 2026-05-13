/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useState } from 'react';
import { HiStar } from 'react-icons/hi2';
import { MENU_DATA } from '../constants';

export function Menu() {
  const categories = ['All', 'Ghanaian', 'Nigerian', 'Fast Food', 'Continental', 'Snacks', 'Sides'];
  const [activeTab, setActiveTab] = useState('All');

  const filteredItems = activeTab === 'All'
    ? MENU_DATA
    : MENU_DATA.filter(item => item.category === activeTab);

  // Alternate card backgrounds: olive and olive-dark
  const cardBgs = ['card-olive', 'card-olive-dark'];

  return (
    <section id="menu" className="py-24 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-dark mb-4">
            Our <span className="text-brand-orange">Menu</span>
          </h2>
          <p className="text-brand-dark/50 max-w-2xl mx-auto italic text-sm font-semibold tracking-wide">
            A perfect blend of tradition and modern mastery.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 border ${
                activeTab === cat
                  ? 'bg-brand-olive text-white border-brand-olive shadow-sm scale-105'
                  : 'bg-white border-gray-200 text-brand-dark/60 hover:border-brand-olive hover:text-brand-olive'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Card Grid (3 columns) */}
        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredItems.map((item, idx) => {
            const bgClass = cardBgs[idx % 2];
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.id}
                className={`${bgClass} rounded-2xl overflow-hidden flex flex-col group`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden rounded-t-2xl flex-shrink-0">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800&fm=webp'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Best Seller pill */}
                  <div className="absolute top-3 left-3 bg-white/90 text-brand-olive px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    Best Seller
                  </div>
                  {/* Price circle */}
                  <div className="absolute top-3 right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="font-display font-bold text-brand-dark text-sm">{item.price}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col gap-2 flex-grow">
                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <HiStar key={i} size={13} color="#F5A623" />
                    ))}
                  </div>
                  {/* Dish name */}
                  <h3 className="font-display font-bold text-white text-xl leading-tight">{item.name}</h3>
                  {/* Description */}
                  <p className="text-white/60 text-sm leading-relaxed flex-grow">{item.description}</p>
                  {/* ORDER NOW button */}
                  <a
                    href="https://wa.me/233243379412"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 bg-brand-orange text-white text-center py-3 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-brand-orange/90 transition-all"
                  >
                    ORDER NOW
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
