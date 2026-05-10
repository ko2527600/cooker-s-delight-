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
      desc: "To deliver authentic, hot, and tasty meals that celebrate the rich culinary heritage of Ghana and Nigeria."
    },
    {
      icon: <HiUsers size={32} color="#872735" />,
      title: "Great People",
      desc: "Our team is built on professionalism and a passion for service excellence, making every guest feel at home."
    },
    {
      icon: <HiCheckBadge size={32} color="#872735" />,
      title: "Quality First",
      desc: "We prioritize hygiene and fresh local ingredients to ensure the highest standards of food safety."
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
              Crafting <br />Excellence<span>.</span>
            </h2>
            <p className="text-white/50 text-lg mb-12 leading-relaxed font-medium">
              At Cookers Delight, we believe that food is a celebration of culture. 
              Starting in Accra, we have grown into a legacy known for our signature dishes and professional delivery.
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
