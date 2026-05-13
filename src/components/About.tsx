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
      icon: <FiTarget size={28} color="#6B7A3A" />,
      title: "Our Mission",
      desc: "To deliver authentic, hot, and tasty meals that celebrate the rich culinary heritage of Ghana and Nigeria."
    },
    {
      icon: <HiUsers size={28} color="#6B7A3A" />,
      title: "Great People",
      desc: "Our team is built on professionalism and a passion for service excellence, making every guest feel at home."
    },
    {
      icon: <HiCheckBadge size={28} color="#6B7A3A" />,
      title: "Quality First",
      desc: "We prioritize hygiene and fresh local ingredients to ensure the highest standards of food safety."
    }
  ];

  return (
    <section id="about" className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex px-4 py-1.5 bg-brand-olive text-white text-xs font-semibold rounded-full mb-6">
              Our Story
            </span>
            <h2 className="font-display text-5xl md:text-7xl font-bold text-brand-dark mb-8 leading-[0.9] tracking-tight">
              Crafting <br />Excellence<span className="text-brand-orange">.</span>
            </h2>
            <p className="text-brand-dark/60 text-lg mb-10 leading-relaxed">
              At Cookers Delight, we believe that food is a celebration of culture.
              Starting in Accra, we have grown into a legacy known for our signature dishes and professional delivery.
            </p>

            <div className="grid gap-4">
              {values.map((v, i) => (
                <div key={i} className="flex gap-5 p-6 rounded-2xl bg-brand-cream border border-gray-100 hover:border-brand-olive/40 transition-all">
                  <div className="bg-brand-olive/10 p-3 rounded-xl h-fit flex-shrink-0">
                    {v.icon}
                  </div>
                  <div>
                    <h5 className="font-bold text-base mb-1 text-brand-dark tracking-tight">{v.title}</h5>
                    <p className="text-brand-dark/50 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-xl border-4 border-brand-olive/10">
              <img
                src="https://images.unsplash.com/photo-1550966842-28c4601939ef?auto=format&fit=crop&q=80&w=1200&fm=webp"
                alt="Chefs Cooking"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="absolute -inset-8 bg-brand-olive/5 blur-[60px] rounded-full -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
