import React from 'react';
import { motion } from 'motion/react';
import { HiStar } from 'react-icons/hi2';
import { BsInstagram, BsHeartFill } from 'react-icons/bs';
import PageWrapper from '../components/PageWrapper';
import { REVIEWS, GALLERY_IMAGES } from '../constants';
import { getImgUrl } from '../utils/image';

export default function ReviewsPage() {
  return (
    <PageWrapper>
      <div className="bg-brand-orange py-3 overflow-hidden flex whitespace-nowrap">
        <div className="animate-marquee-scroll flex font-bold uppercase text-xs tracking-tighter">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="mx-10">★ "The best Jollof in Accra" ★ "Authentic Nigerian taste" ★ "Professional service" ★ "Highly recommended" ★ </span>
          ))}
        </div>
      </div>

      <section className="py-24 bg-brand-black">
        <div className="container mx-auto px-6 text-center">
          <div className="flex flex-col items-center mb-32">
            <span className="text-[150px] font-display font-bold leading-none mb-4">4.8</span>
            <div className="flex text-brand-orange mb-6">
              {[...Array(5)].map((_, i) => <span key={i}><HiStar size={50} /></span>)}
            </div>
            <p className="text-white/40 font-bold uppercase tracking-[0.3em]">Community Rated Excellence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-40">
            {REVIEWS.map(r => (
              <motion.div
                key={r.id}
                whileHover={{ rotateX: 5, rotateY: 5 }}
                className="bg-white/5 p-16 rounded-[60px] text-left border border-white/5"
              >
                <div className="flex text-brand-orange mb-10">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className={j >= r.rating ? 'opacity-20' : ''}><HiStar size={24} /></span>
                  ))}
                </div>
                <p className="text-3xl font-display italic font-light leading-relaxed mb-12">"{r.comment}"</p>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full border-2 border-brand-orange flex items-center justify-center bg-brand-orange text-white font-bold text-xl">
                    {r.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">{r.author}</h4>
                    <p className="text-white/40">{r.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="py-24 border-t border-white/5 text-left">
            <h2 className="text-5xl font-display font-bold mb-12 flex items-center gap-4">
              Follow us <span className="text-brand-orange"><BsInstagram size={40} /></span>{' '}
              <span className="text-white/20">@cookersdelightgh</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {GALLERY_IMAGES.slice(0, 6).map((img, i) => (
                <div key={img.url} className="aspect-square bg-white/5 rounded-3xl overflow-hidden relative group">
                  <img src={getImgUrl(img.url)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-50" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-brand-orange/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                      <BsHeartFill size={16} />
                      <span className="text-[10px] font-bold uppercase">Follow</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
