import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'motion/react';
import {
  HiArrowRight, HiStar, HiChevronLeft, HiChevronRight,
  HiRocketLaunch, HiSparkles, HiUsers,
} from 'react-icons/hi2';
import { BsWhatsapp, BsQuote } from 'react-icons/bs';
import PageWrapper from '../components/PageWrapper';
import CDBoatDownloadSection from '../components/CDBoatDownloadSection';
import { useCountUp } from '../hooks/useCountUp';
import { formatImg } from '../utils/image';
import { getImgUrl } from '../utils/image.js';
import { useApi } from '../hooks/useApi';
import { menuApi, locationApi } from '../lib/api';
import { usePageContext } from './PublicLayout';
import type { TIMenuItem } from '../types';

const slides = [
  '/assets/cookers delight1.webp',
  '/assets/forcourt2.jpg',
  '/assets/jollof.jpg',
  '/assets/cookers delight4.webp',
];

export default function HomePage() {
  const { navigate, addToast } = usePageContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 1000], [0, 400]);

  const { data: menuItems } = useApi<TIMenuItem[]>(() => menuApi.getItems());
  const featured = menuItems?.slice(0, 3) ?? [];

  const years    = useCountUp(10);
  const branches = useCountUp(4);
  const reviews  = useCountUp(200);
  const dishes   = useCountUp(50);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <PageWrapper>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative h-screen w-full flex items-center overflow-hidden">
        <motion.div style={{ y: yParallax }} className="absolute inset-0 z-0 scale-110">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={formatImg(slides[currentSlide], 1920)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="w-full h-full object-cover"
              alt=""
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-br from-brand-burgundy/75 via-brand-black/90 to-brand-black/95" />
        </motion.div>

        {/* Slide indicators */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 rounded-full transition-all duration-500 ${currentSlide === idx ? 'bg-brand-orange h-8' : 'bg-white/20 h-2'}`}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-brand-orange font-bold tracking-[0.2em] uppercase text-sm font-body block"
              >
                Ghana's Favourite Restaurant
              </motion.span>
              <h1 className="text-8xl md:text-[140px] leading-[0.9] font-light flex flex-col">
                <span className="overflow-hidden">
                  <motion.span initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>Hot &</motion.span>
                </span>
                <span className="overflow-hidden">
                  <motion.span initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="italic font-normal">
                    Tasty<span className="text-brand-orange">.</span>
                  </motion.span>
                </span>
              </h1>
            </div>
            <p className="text-white/70 text-lg md:text-xl max-w-lg leading-relaxed font-body">
              Experience a world-class culinary journey through West Africa. Every dish is a masterpiece of spice, culture, and heritage.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('menu')}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95"
              >
                Explore Menu
              </button>
              <a
                href="https://wa.me/233243379412"
                className="border-2 border-white/20 hover:bg-white hover:text-brand-black px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105"
              >
                Order via WhatsApp
              </a>
            </div>
          </motion.div>

          <div className="relative hidden lg:flex justify-end">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
              <div className="w-[500px] h-[500px] rounded-full overflow-hidden border-[15px] border-white/5 animate-spin-slow">
                <img src={formatImg('/assets/jollof2.jpg', 900)} className="w-full h-full object-cover" alt="" />
              </div>
              <motion.div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-2xl shadow-2xl animate-float max-w-[280px]">
                <span className="inline-block bg-brand-orange/10 text-brand-orange text-xs font-bold px-2 py-1 rounded mb-2">Chef's Special</span>
                <h3 className="text-brand-black font-bold text-lg mb-1 leading-tight">Gourmet Jollof with Grilled Tilapia</h3>
                <p className="text-brand-orange font-bold text-xl">₵65.00</p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-xl border-t border-white/10 py-8">
          <div className="container mx-auto px-6 flex flex-nowrap overflow-x-auto lg:overflow-x-visible no-scrollbar lg:justify-around items-center gap-12">
            {[
              { label: 'Years Serving', val: years.count, ref: years.ref, suffix: '+' },
              { label: 'Branches',      val: branches.count, ref: branches.ref, suffix: '' },
              { label: 'Happy Reviews', val: reviews.count, ref: reviews.ref, suffix: '+' },
              { label: 'Unique Dishes', val: dishes.count, ref: dishes.ref, suffix: '+' },
            ].map((stat, i) => (
              <div key={i} ref={stat.ref} className="flex flex-col items-center lg:items-start min-w-[150px]">
                <span className="text-4xl font-display font-bold text-brand-orange">{stat.val}{stat.suffix}</span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────── */}
      <section className="py-32 bg-[#0e0e0e] relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-10">
            <span className="text-brand-orange font-bold uppercase tracking-widest text-sm">Our Story</span>
            <h2 className="text-6xl md:text-8xl font-bold leading-tight">Crafting <br /><span className="italic font-normal">Excellence.</span></h2>
            <p className="text-white/60 text-lg leading-relaxed font-body max-w-xl">
              Cookers Delight is more than a restaurant; it's a celebration of West African culinary mastery. From our humble beginnings in Accra, we've remained dedicated to one mission: bringing you the soul of Ghana and Nigeria on a plate.
            </p>
            <button
              onClick={() => navigate('menu')}
              className="bg-brand-burgundy hover:bg-brand-orange text-white px-10 py-5 rounded-full font-bold transition-all flex items-center gap-3"
            >
              View Full Menu <HiArrowRight />
            </button>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
            <div className="rounded-[50px] overflow-hidden shadow-2xl h-[700px]">
              <img src={formatImg('/assets/forcourt.jpg', 1200)} className="w-full h-full object-cover" alt="Interior" />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-brand-orange p-10 rounded-[40px] shadow-2xl">
              <p className="text-6xl font-bold text-white mb-2">10+</p>
              <p className="text-white/80 font-bold uppercase text-xs tracking-widest">Years of Taste</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Menu Preview ────────────────────────────────── */}
      <section className="py-32 bg-brand-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div>
              <span className="text-brand-orange font-bold uppercase tracking-widest text-sm mb-4 block">Chef's Selection</span>
              <h2 className="text-6xl md:text-8xl font-bold leading-tight">Featured <br /><span className="italic font-normal">Delicacies.</span></h2>
            </div>
            <button
              onClick={() => navigate('menu')}
              className="border-2 border-white/20 hover:bg-white hover:text-black px-10 py-5 rounded-full font-bold transition-all"
            >
              View Full Menu
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featured.map((item, i) => (
              <motion.div
                key={item.menu_id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white/5 rounded-[40px] overflow-hidden border border-white/5 hover:border-brand-orange/30 transition-all"
              >
                <div className="h-72 overflow-hidden">
                  <img
                    src={item.thumb ?? getImgUrl('/assets/jollof.jpg')}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={item.menu_name}
                  />
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold">{item.menu_name}</h3>
                    <span className="text-brand-orange font-bold text-xl">₵{item.menu_price}</span>
                  </div>
                  <p className="text-white/40 mb-8 line-clamp-2">{item.menu_description}</p>
                  <button
                    onClick={() => navigate('menu')}
                    className="w-full bg-white/5 group-hover:bg-brand-orange py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    Order Now <HiArrowRight />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────────── */}
      <section className="py-32 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-bold">The Gold <span className="text-brand-orange italic font-normal">Standard</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <HiRocketLaunch />, title: 'Fast Delivery',       desc: 'Hot food at your door in 30–45 mins' },
              { icon: <HiSparkles />,     title: 'Fresh Ingredients',   desc: 'Sourced daily from local markets' },
              { icon: <HiUsers />,        title: 'Expert Chefs',        desc: '10+ years of West African culinary mastery' },
              { icon: <BsWhatsapp />,     title: 'Easy Ordering',       desc: "One WhatsApp message and you're done" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 p-10 rounded-[40px] border border-white/5 hover:border-brand-orange/40 transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-8 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                <p className="text-white/40 leading-relaxed font-body">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catering CTA ─────────────────────────────────────────── */}
      <section className="relative py-48 overflow-hidden">
        <img src={formatImg('/assets/flyer1.jpg', 1920)} className="absolute inset-0 w-full h-full object-cover opacity-35" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-transparent to-brand-black" />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <h2 className="text-6xl md:text-8xl font-bold mb-8">
            We Cater for <br /><span className="text-brand-orange italic font-normal">Your Events</span>
          </h2>
          <p className="text-xl text-white/70 mb-12 font-body leading-relaxed">
            Corporate events, weddings, funerals, parties — we bring the feast to you across Greater Accra.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <a
              href="https://wa.me/233243379412?text=Hi, I'd like a catering quote"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-orange text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all"
            >
              Get a Quote on WhatsApp
            </a>
            <a href="tel:+233243379412" className="border-2 border-white/20 px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all">
              Call Us Now
            </a>
          </div>
        </div>
      </section>

      {/* ── Quote banner ─────────────────────────────────────────── */}
      <section className="py-40 bg-[#0e0e0e] relative overflow-hidden flex items-center justify-center border-y border-white/5">
        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="space-y-12">
            <div className="flex justify-center text-brand-orange mb-8 opacity-20">
              <BsQuote size={80} />
            </div>
            <h2 className="text-4xl md:text-7xl font-display italic font-light leading-tight text-white/90">
              "Food is not just fuel, it's <span className="text-brand-orange font-normal not-italic">information</span>. It talks to your DNA and tells it what to do."
            </h2>
            <p className="uppercase tracking-[0.4em] text-xs font-bold text-white/40">The Cookers Delight Philosophy</p>
          </motion.div>
        </div>
      </section>

      <CDBoatDownloadSection />

      {/* Marquee */}
      <div className="bg-brand-black py-4 border-y border-white/5 overflow-hidden flex items-center">
        <div className="animate-marquee-scroll whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-4xl md:text-6xl font-display font-bold text-white/5 uppercase mx-12">
              Ghana's Best Jollof • Authentic Nigerian Soups • Professional Catering • Hot Delivery
            </span>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
