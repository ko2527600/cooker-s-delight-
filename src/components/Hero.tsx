/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { HiStar } from 'react-icons/hi2';
import { MENU_DATA } from '../constants';

export function Hero() {
  const featuredCards = MENU_DATA.slice(0, 3);
  const cardBgs = ['card-olive', 'card-olive-dark', 'card-olive'];

  return (
    <section className="bg-brand-cream min-h-screen pt-20 overflow-hidden">

      {/* Hero Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT: Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10 flex flex-col gap-6"
          >
            {/* Green pill label */}
            <div className="inline-flex w-fit">
              <span className="bg-brand-olive text-white rounded-full px-4 py-1 text-xs font-semibold tracking-wide">
                Ghana's Favourite Restaurant
              </span>
            </div>

            {/* Heading: large Cormorant Garamond */}
            <h1 className="font-display leading-[0.88] tracking-tight">
              <span className="block text-[72px] md:text-[100px] lg:text-[110px] font-light italic text-brand-dark">
                Hot &amp;
              </span>
              <span className="block text-[72px] md:text-[100px] lg:text-[110px] font-bold text-brand-dark">
                Tasty<span className="text-brand-orange">.</span>
              </span>
            </h1>

            {/* Stars row */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <HiStar key={i} size={18} color="#F5A623" />
                ))}
              </div>
              <span className="font-bold text-brand-dark text-sm">4.8</span>
              <span className="text-gray-400 text-sm">(4,800+ Reviews)</span>
            </div>

            {/* Description */}
            <p className="text-brand-dark/70 text-base leading-relaxed max-w-md">
              Aromatic, tender Ghanaian and Nigerian dishes crafted with spices, love, and professional service.
            </p>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="https://wa.me/233243379412"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-orange text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-brand-orange/90 transition-all text-center shadow-sm"
              >
                Order Now
              </a>
              <a
                href="#menu"
                className="border-2 border-brand-dark text-brand-dark px-8 py-3.5 rounded-full font-bold text-sm hover:bg-brand-dark hover:text-white transition-all text-center"
              >
                Explore Menu
              </a>
            </div>
          </motion.div>

          {/* RIGHT: Image Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="relative flex justify-center items-center lg:justify-end"
          >
            <div className="relative">
              {/* Circular food image */}
              <div className="w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] lg:w-[420px] lg:h-[420px] rounded-full overflow-hidden border-4 border-brand-olive/20 shadow-2xl">
                <img
                  src="/assets/jollof.jpg"
                  alt="Jollof Rice Special"
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>

              {/* Floating price badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-8 right-0 lg:-right-4 w-20 h-20 bg-white rounded-full shadow-xl flex flex-col items-center justify-center border-2 border-brand-cream z-20"
              >
                <span className="font-display text-brand-dark font-bold text-lg leading-tight">₵45</span>
                <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">from</span>
              </motion.div>

              {/* Floating garnish element */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 right-8 lg:right-4 w-12 h-12 rounded-full opacity-80 shadow-lg"
                style={{ background: 'radial-gradient(circle at 40% 40%, #F5A623, #E84C1E)' }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Strip: 3 Featured Cards */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16 pt-8">
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-stretch">
          {featuredCards.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.15 }}
              className={`${cardBgs[idx]} rounded-2xl overflow-hidden flex-1 max-w-[300px] mx-auto sm:mx-0 flex flex-col`}
            >
              {/* Card Image */}
              <div className="relative h-40 overflow-hidden rounded-t-2xl flex-shrink-0">
                <img
                  src={item.image || '/assets/jollof.jpg'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {/* Best Seller pill */}
                <div className="absolute top-3 left-3 bg-brand-olive text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  Best Seller
                </div>
                {/* Price circle */}
                <div className="absolute top-3 right-3 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="font-display font-bold text-brand-dark text-sm">{item.price}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col gap-2 flex-grow">
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <HiStar key={i} size={12} color="#F5A623" />
                  ))}
                </div>
                {/* Dish name */}
                <h3 className="font-display font-bold text-white text-lg leading-tight">{item.name}</h3>
                {/* Description */}
                <p className="text-white/60 text-xs leading-relaxed flex-grow">{item.description}</p>
                {/* Order button */}
                <a
                  href="https://wa.me/233243379412"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 bg-brand-orange text-white text-center py-2.5 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-brand-orange/90 transition-all"
                >
                  ORDER NOW
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* WhatsApp Float Button */}
      <a
        href="https://wa.me/233243379412"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-10 right-10 z-[100] bg-[#25D366] text-white px-8 py-4 rounded-full flex flex-col items-center gap-0.5 shadow-[0_10px_30px_rgba(37,211,102,0.3)] hover:scale-105 transition-transform"
      >
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Order via WhatsApp</span>
        <span className="text-sm font-black">+233 24 337 9412</span>
      </a>
    </section>
  );
}
