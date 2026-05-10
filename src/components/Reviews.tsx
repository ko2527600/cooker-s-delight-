/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { HiStar, HiOutlineStar, HiUserCircle, HiPlus } from 'react-icons/hi2';
import { BsQuote } from 'react-icons/bs';
import { REVIEWS } from '../constants';
import React, { useState } from 'react';
import { Review } from '../types';

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ author: '', comment: '', rating: 5 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const review: Review = {
      id: `rev-${Date.now()}`,
      author: newReview.author,
      comment: newReview.comment,
      rating: newReview.rating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      avatar: `https://i.pravatar.cc/150?u=${newReview.author}`
    };
    setReviews([review, ...reviews]);
    setNewReview({ author: '', comment: '', rating: 5 });
    setShowForm(false);
  };

  return (
    <section id="reviews" className="py-24 bg-[#111111] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="font-serif text-4xl md:text-6xl font-normal text-white mb-6 leading-tight tracking-tighter">
              What Our <br /><span className="text-brand-orange">People Say.</span>
            </h2>
            <p className="text-white/40 text-lg uppercase tracking-widest text-[10px] font-black">
              Real feedback from our valued customers across Accra.
            </p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="group flex items-center gap-3 bg-brand-orange text-white px-8 py-4 rounded-sm font-black uppercase tracking-widest text-[11px] hover:opacity-90 transition-all shadow-xl shadow-brand-orange/10"
          >
            {showForm ? 'Cancel' : 'Share Your Experience'}
            {!showForm && <HiPlus size={16} />}
          </button>
        </div>

        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 glass-panel p-10 rounded-sm border-brand-orange/20"
          >
            <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 mb-8 border-b border-white/5 pb-4">New Review Submission</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/30 mb-2 tracking-widest">Your Name</label>
                  <input 
                    required
                    type="text" 
                    value={newReview.author}
                    onChange={(e) => setNewReview({...newReview, author: e.target.value})}
                    placeholder="E.g. Ama Serwaa"
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-5 py-3 text-white focus:outline-none focus:border-brand-orange transition-all placeholder:text-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/30 mb-2 tracking-widest">Rating (1-5)</label>
                  <select 
                    value={newReview.rating}
                    onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-5 py-3 text-white focus:outline-none focus:border-brand-orange transition-all"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n} className="bg-[#111]">{n} Stars</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-white/30 mb-2 tracking-widest">Your Comment</label>
                <textarea 
                  required
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="Tell us about the food and service..."
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-5 py-3 text-white focus:outline-none focus:border-brand-orange transition-all resize-none placeholder:text-white/10"
                ></textarea>
              </div>
              <button type="submit" className="bg-white text-black py-4 px-10 rounded-sm font-black uppercase tracking-widest text-[11px] hover:bg-brand-orange hover:text-white transition-all shadow-xl">
                Submit Review
              </button>
            </form>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-panel p-8 rounded-lg relative border-white/5 flex flex-col h-full"
            >
              <span className="absolute top-6 right-6 text-white/5">
                <BsQuote size={40} />
              </span>
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <React.Fragment key={i}>
                    {i < msg.rating ? (
                      <HiStar size={12} color="#EC4824" />
                    ) : (
                      <HiOutlineStar size={12} color="rgba(255,255,255,0.1)" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <p className="text-white/70 text-lg italic mb-8 flex-grow leading-relaxed">
                "{msg.comment}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                {msg.avatar ? (
                  <img src={msg.avatar} alt={msg.author} className="w-10 h-10 rounded-full border border-white/10" />
                ) : (
                  <HiUserCircle size={40} color="rgba(255,255,255,0.2)" />
                )}
                <div>
                  <h4 className="text-white font-bold text-sm tracking-tight">{msg.author}</h4>
                  <p className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em]">{msg.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Background large decorative quote */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[30vw] font-black text-white/[0.01] select-none pointer-events-none -ml-[10vw]">
        &rdquo;
      </div>
    </section>
  );
}
