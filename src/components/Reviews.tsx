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
    <section id="reviews" className="py-24 bg-brand-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="font-display text-4xl md:text-6xl font-bold text-brand-dark mb-4 leading-tight tracking-tight">
              What Our <br /><span className="text-brand-orange">People Say.</span>
            </h2>
            <p className="text-brand-dark/50 text-sm font-semibold tracking-wide">
              Real feedback from our valued customers across Accra.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-brand-orange text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-brand-orange/90 transition-all shadow-sm"
          >
            {showForm ? 'Cancel' : 'Share Your Experience'}
            {!showForm && <HiPlus size={15} />}
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 bg-white rounded-2xl p-10 shadow-sm border border-gray-100"
          >
            <h3 className="text-xs uppercase font-bold tracking-widest text-brand-dark/40 mb-6 border-b border-gray-100 pb-4">New Review</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-dark/50 mb-2 tracking-widest">Your Name</label>
                  <input
                    required
                    type="text"
                    value={newReview.author}
                    onChange={(e) => setNewReview({...newReview, author: e.target.value})}
                    placeholder="E.g. Ama Serwaa"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-brand-dark focus:outline-none focus:border-brand-olive transition-all placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-dark/50 mb-2 tracking-widest">Rating (1-5)</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-brand-dark focus:outline-none focus:border-brand-olive transition-all"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-brand-dark/50 mb-2 tracking-widest">Your Comment</label>
                <textarea
                  required
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="Tell us about the food and service..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-brand-dark focus:outline-none focus:border-brand-olive transition-all resize-none placeholder:text-gray-300"
                ></textarea>
              </div>
              <button type="submit" className="bg-brand-olive text-white py-3.5 px-10 rounded-full font-bold text-sm hover:bg-brand-olive-dark transition-all shadow-sm">
                Submit Review
              </button>
            </form>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-brand-olive relative flex flex-col h-full"
            >
              <span className="absolute top-5 right-5 text-gray-100">
                <BsQuote size={36} />
              </span>

              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <React.Fragment key={i}>
                    {i < msg.rating ? (
                      <HiStar size={13} color="#F5A623" />
                    ) : (
                      <HiOutlineStar size={13} color="#D1D5DB" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <p className="text-brand-dark/70 text-base italic mb-6 flex-grow leading-relaxed">
                "{msg.comment}"
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                {msg.avatar ? (
                  <img src={msg.avatar} alt={msg.author} className="w-10 h-10 rounded-full border border-gray-200" />
                ) : (
                  <HiUserCircle size={40} color="#D1D5DB" />
                )}
                <div>
                  <h4 className="text-brand-dark font-bold text-sm">{msg.author}</h4>
                  <p className="text-xs text-gray-400 font-semibold">{msg.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
