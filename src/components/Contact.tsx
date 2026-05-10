/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { HiChatBubbleLeftRight, HiPaperAirplane } from 'react-icons/hi2';
import { FiPhone, FiInstagram } from 'react-icons/fi';
import { CONTACT_INFO } from '../constants';

export function Contact() {
  return (
    <section id="contact" className="py-24 bg-[#111111] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-5xl md:text-6xl font-normal text-white mb-8 border-l-4 border-brand-orange pl-8 leading-tight tracking-tighter">
              Let's Talk <br /><span className="text-brand-orange">Food.</span>
            </h2>
            <p className="text-white/50 text-lg mb-12 max-w-md">
              Have questions about our menu, delivery, or catering services? 
              Reach out and our friendly team will get back to you shortly.
            </p>

            <div className="space-y-6">
              <div className="flex gap-6 p-6 glass-panel rounded-lg hover:border-brand-orange/40 transition-all border-white/5">
                <div className="bg-brand-orange/20 p-4 rounded-sm text-brand-orange">
                  <FiPhone size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-1">Call Us Anywhere</p>
                  <p className="text-xl font-bold text-white">{CONTACT_INFO.phone}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="glass-panel p-10 rounded-sm border-white/10"
          >
            <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 mb-8 border-b border-white/5 pb-4">Secure Message Portal</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/30 mb-2 tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-5 py-3 text-white focus:outline-none focus:border-brand-orange transition-all placeholder:text-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/30 mb-2 tracking-widest">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+233 XXX XXX XXX"
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-5 py-3 text-white focus:outline-none focus:border-brand-orange transition-all placeholder:text-white/10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase text-white/30 mb-2 tracking-widest">Service Type</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-sm px-5 py-3 text-white focus:outline-none focus:border-brand-orange transition-all appearance-none cursor-pointer">
                  <option className="bg-[#111]">Dine-in Information</option>
                  <option className="bg-[#111]">Home/Office Delivery</option>
                  <option className="bg-[#111]">Catering Enquiry</option>
                  <option className="bg-[#111]">Feedback & Suggestions</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-white/30 mb-2 tracking-widest">Your Message</label>
                <textarea 
                  rows={5}
                  placeholder="Tell us what you're thinking..."
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-5 py-3 text-white focus:outline-none focus:border-brand-orange transition-all resize-none placeholder:text-white/10"
                ></textarea>
              </div>

              <button className="w-full bg-brand-orange text-white py-5 rounded-sm font-black uppercase tracking-widest text-[11px] hover:opacity-90 transition-all shadow-xl shadow-brand-orange/10">
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
