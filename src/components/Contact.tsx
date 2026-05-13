/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { HiPaperAirplane } from 'react-icons/hi2';
import { FiPhone } from 'react-icons/fi';
import { CONTACT_INFO } from '../constants';

export function Contact() {
  return (
    <section id="contact" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-5xl md:text-6xl font-bold text-brand-dark mb-6 border-l-4 border-brand-olive pl-6 leading-tight tracking-tight">
              Let's Talk <br /><span className="text-brand-orange">Food.</span>
            </h2>
            <p className="text-brand-dark/60 text-lg mb-10 max-w-md leading-relaxed">
              Have questions about our menu, delivery, or catering services?
              Reach out and our friendly team will get back to you shortly.
            </p>

            <div className="space-y-4">
              <div className="flex gap-5 p-6 bg-brand-cream rounded-2xl border border-gray-100 hover:border-brand-olive/30 transition-all">
                <div className="bg-brand-olive/10 p-3.5 rounded-xl text-brand-olive flex-shrink-0">
                  <FiPhone size={22} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-brand-dark/40 tracking-widest mb-1">Call Us Anywhere</p>
                  <p className="text-xl font-bold text-brand-dark">{CONTACT_INFO.phone}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-brand-cream rounded-3xl p-10 border border-gray-100"
          >
            <h3 className="text-xs uppercase font-bold tracking-widest text-brand-dark/40 mb-6 border-b border-gray-200 pb-4">Send a Message</h3>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-dark/50 mb-2 tracking-widest">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-brand-dark focus:outline-none focus:border-brand-olive transition-all placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-dark/50 mb-2 tracking-widest">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+233 XXX XXX XXX"
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-brand-dark focus:outline-none focus:border-brand-olive transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-dark/50 mb-2 tracking-widest">Service Type</label>
                <select className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-brand-dark focus:outline-none focus:border-brand-olive transition-all appearance-none">
                  <option>Dine-in Information</option>
                  <option>Home/Office Delivery</option>
                  <option>Catering Enquiry</option>
                  <option>Feedback & Suggestions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-brand-dark/50 mb-2 tracking-widest">Your Message</label>
                <textarea
                  rows={5}
                  placeholder="Tell us what you're thinking..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 text-brand-dark focus:outline-none focus:border-brand-olive transition-all resize-none placeholder:text-gray-300"
                ></textarea>
              </div>

              <button className="w-full bg-brand-orange text-white py-4 rounded-full font-bold text-sm hover:bg-brand-orange/90 transition-all shadow-sm flex items-center justify-center gap-2">
                Send Message
                <HiPaperAirplane size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
