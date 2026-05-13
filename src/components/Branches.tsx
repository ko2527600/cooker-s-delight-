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
    <section id="branches" className="py-24 bg-brand-cream relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-dark mb-3">
              Find Us Near <span className="text-brand-orange">You</span>
            </h2>
            <p className="text-brand-dark/50 text-sm font-semibold">
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
              className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:border-brand-olive/40 transition-all flex flex-col h-full"
            >
              <div className="bg-brand-olive/10 w-11 h-11 rounded-xl flex items-center justify-center mb-5">
                <HiMapPin size={22} color="#6B7A3A" />
              </div>
              <h3 className="font-display text-xl font-bold text-brand-dark mb-1">{branch.name}</h3>
              <p className="text-brand-olive font-bold text-xs uppercase tracking-widest mb-4">{branch.area}</p>

              <div className="space-y-2.5 mb-6 flex-grow">
                <div className="flex items-center gap-2.5 text-brand-dark/50 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-olive flex-shrink-0" />
                  {branch.landmark}
                </div>
                <div className="flex items-center gap-2.5 text-brand-dark/50 text-xs">
                  <FiPhone size={11} className="flex-shrink-0 text-brand-olive" />
                  {branch.phone}
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/Cookers+Delight+${branch.name}+Accra`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-cream text-brand-dark font-bold text-xs rounded-full border border-gray-200 hover:bg-brand-olive hover:text-white hover:border-brand-olive transition-all group"
              >
                Get Directions
                <FiExternalLink size={11} className="group-hover:scale-110 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Catering Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 bg-brand-olive-dark rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <h3 className="font-display text-3xl md:text-4xl font-bold mb-4 relative z-10">Hosting an Event?</h3>
          <p className="text-white/70 text-base mb-8 max-w-2xl mx-auto relative z-10 italic">
            "Professional service delivery for all your catering needs. Corporate events, weddings, and private parties."
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-10 py-3.5 rounded-full font-bold text-sm hover:bg-brand-orange/90 transition-all relative z-10 shadow-sm"
          >
            Enquire about Catering
          </a>
        </motion.div>
      </div>
    </section>
  );
}
