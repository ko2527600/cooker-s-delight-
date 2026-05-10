/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { BRANCHES } from '../constants';
import { HiMapPin } from 'react-icons/hi2';
import { FiPhone, FiExternalLink } from 'react-icons/fi';

export function Branches() {
  return (
    <section id="branches" className="py-24 bg-[#111111] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="font-serif text-4xl md:text-5xl font-black text-white mb-4">
              Find Us Near <span className="text-brand-orange">You</span>
            </h2>
            <p className="text-white/40 text-lg uppercase tracking-widest text-[10px] font-black">
              Strategically located branches across Accra.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {BRANCHES.map((branch, i) => (
            <motion.div
              key={branch.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-panel p-8 rounded-lg border-white/5 hover:border-brand-orange/50 transition-all flex flex-col h-full"
            >
              <div className="bg-brand-orange/10 w-12 h-12 rounded-sm flex items-center justify-center mb-6">
                <HiMapPin size={24} color="#EC4824" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white mb-2">{branch.name}</h3>
              <p className="text-brand-orange font-black text-[10px] uppercase tracking-widest mb-4">{branch.area}</p>
              
              <div className="space-y-3 mb-8 flex-grow">
                <div className="flex items-center gap-3 text-white/40 text-xs">
                   <div className="w-1 h-1 rounded-full bg-brand-orange" />
                   {branch.landmark}
                </div>
                <div className="flex items-center gap-3 text-white/40 text-xs">
                   <FiPhone size={12} />
                   {branch.phone}
                </div>
              </div>

              <a 
                href={`https://www.google.com/maps/search/Cookers+Delight+${branch.name}+Accra`} 
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 text-white/70 font-black uppercase tracking-widest text-[10px] rounded-sm border border-white/10 hover:bg-white hover:text-black transition-all group"
              >
                Get Directions
                <span className="group-hover:scale-110 transition-transform">
                  <FiExternalLink size={12} />
                </span>
              </a>
            </motion.div>
          ))}
        </div>

        {/* Catering Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 bg-brand-black rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-burgundy rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/2" />
          <h3 className="font-serif text-3xl md:text-4xl font-bold mb-6 relative z-10">Hosting an Event?</h3>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto relative z-10 italic">
            "Professional service delivery for all your catering needs. Corporate events, weddings, and private parties."
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-3 bg-brand-orange text-white px-10 py-4 rounded-2xl font-bold hover:scale-105 transition-transform relative z-10"
          >
            Enquire about Catering
          </a>
        </motion.div>
      </div>
    </section>
  );
}
