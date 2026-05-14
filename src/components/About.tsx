/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { HiUsers, HiCheckBadge } from 'react-icons/hi2';
import { FiTarget } from 'react-icons/fi';

export function About() {
  const values = [
    {
      icon: <FiTarget size={32} color="#872735" />,
      title: "Our Mission",
      desc: "Every plate we send out should taste like it was made for someone who matters. That has been the only rule since day one."
    },
    {
      icon: <HiUsers size={32} color="#872735" />,
      title: "Great People",
      desc: "The people behind the counter know your order by the third visit. That kind of familiarity is something we hire for."
    },
    {
      icon: <HiCheckBadge size={32} color="#872735" />,
      title: "Quality First",
      desc: "We source from Accra markets every morning, so the tomatoes in your soup were on a market stall this morning. You taste the difference."
    }
  ];

  return (
    <section id="about" className="py-24 bg-[#111111] text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-3 py-1.5 bg-brand-orange text-white text-[11px] font-black uppercase tracking-widest mb-6 rounded-sm">
              Our Story
            </span>
            <h2 className="font-serif text-5xl md:text-7xl font-normal mb-8 leading-[0.9] tracking-tighter">
              Started in <br />Accra<span>.</span>
            </h2>
            <p className="text-white/50 text-lg mb-12 leading-relaxed font-medium">
              We opened our first kitchen in Accra in 2016 with one goal: cook food the way it should taste. No shortcuts, no frozen bases. A decade later, four locations and 200+ five-star reviews haven't changed that.
            </p>
            
            <div className="grid gap-4">
              {values.map((v, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-lg glass-panel border-white/5 hover:border-brand-orange/30 transition-all">
                  <div className="bg-brand-orange/20 p-3 rounded-sm h-fit">
                    {v.icon}
                  </div>
                  <div>
                    <h5 className="font-bold text-lg mb-1 text-white uppercase tracking-tight">{v.title}</h5>
                    <p className="text-white/40 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative"
          >
            <div className="relative z-10 rounded-sm overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1550966842-28c4601939ef?auto=format&fit=crop&q=80&w=1200&fm=webp" 
                alt="Chefs Cooking"
                className="w-full h-full object-cover transition-all duration-1000"
                loading="lazy"
                decoding="async"
              />
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-20 bg-brand-orange/10 blur-[120px] rounded-full -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
