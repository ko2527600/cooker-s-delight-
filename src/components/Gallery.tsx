/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { 
  HiChevronLeft, HiChevronRight, HiCamera, HiXMark, 
  HiMagnifyingGlassPlus, HiMagnifyingGlassMinus, HiArrowPath, 
  HiArrowsPointingOut 
} from 'react-icons/hi2';
import { GALLERY_IMAGES } from '../constants';

export function Gallery() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
  };

  const prev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  };

  useEffect(() => {
    if (isAutoPlaying && !isLightboxOpen) {
      const timer = setInterval(next, 5000);
      return () => clearInterval(timer);
    }
  }, [isAutoPlaying, isLightboxOpen]);

  useEffect(() => {
    // Preload next image in the background
    const nextIndex = (index + 1) % GALLERY_IMAGES.length;
    const img = new Image();
    img.src = GALLERY_IMAGES[nextIndex].url;
  }, [index]);

  const toggleLightbox = () => {
    setIsLightboxOpen(!isLightboxOpen);
    setZoom(1);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <>
      <section id="gallery" className="py-24 bg-[#111111] border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* ... existing section content ... */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="font-serif text-4xl md:text-6xl font-normal text-white mb-6 leading-tight tracking-tighter">
                Visual <br /><span className="text-brand-orange">Heritage.</span>
              </h2>
              <p className="text-white/40 text-lg uppercase tracking-widest text-[10px] font-black">
                A feast for your eyes. Our culinary craftsmanship captured in high definition.
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={prev} className="p-4 rounded-sm border border-white/10 text-white hover:bg-brand-orange hover:border-brand-orange transition-all">
                <HiChevronLeft size={24} />
              </button>
              <button onClick={next} className="p-4 rounded-sm border border-white/10 text-white hover:bg-brand-orange hover:border-brand-orange transition-all">
                <HiChevronRight size={24} />
              </button>
            </div>
          </div>

          <div 
            className="relative h-[400px] md:h-[600px] rounded-sm overflow-hidden glass-panel border-white/10 shadow-2xl cursor-pointer group/container"
            onClick={toggleLightbox}
          >
            <div className="absolute top-6 right-6 z-20 opacity-0 group-hover/container:opacity-100 transition-opacity">
              <div className="bg-brand-orange p-3 rounded-sm text-white">
                <HiArrowsPointingOut size={20} />
              </div>
            </div>
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 }
                }}
                className="absolute inset-0"
              >
                <img
                  src={GALLERY_IMAGES[index].url}
                  alt={GALLERY_IMAGES[index].title}
                  className="w-full h-full object-cover transition-all duration-700"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/container:opacity-100 transition-opacity" />
                <div className="absolute bottom-12 left-12 z-10 drop-shadow-lg">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="flex items-center gap-2 text-brand-orange text-[10px] uppercase font-black tracking-widest mb-2 drop-shadow-md">
                      <HiCamera size={16} />
                      Gallery Selection
                    </span>
                    <h3 className="text-white text-4xl md:text-5xl font-serif font-bold mb-2 drop-shadow-xl">{GALLERY_IMAGES[index].title}</h3>
                    <p className="text-white text-lg drop-shadow-md font-medium">{GALLERY_IMAGES[index].desc}</p>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="absolute bottom-12 right-12 flex gap-2">
              {GALLERY_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={`h-1 transition-all duration-300 rounded-full ${i === index ? 'w-12 bg-brand-orange' : 'w-4 bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Decorative text */}
        <div className="absolute bottom-0 right-0 py-4 px-12 text-[8vw] font-black text-white/[0.02] whitespace-nowrap select-none pointer-events-none translate-y-1/2">
          TASTE THE TRADITION
        </div>
      </section>

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 sm:p-12"
          >
            {/* Controls ... */}
            <div className="absolute top-6 right-6 flex gap-4 z-50">
              <div className="flex gap-2 glass-panel border-white/10 p-2 rounded-sm">
                <button 
                  onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.min(prev + 0.5, 4)); }}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                >
                  <HiMagnifyingGlassPlus size={20} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.max(prev - 0.5, 1)); }}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                  disabled={zoom === 1}
                >
                  <HiMagnifyingGlassMinus size={20} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setZoom(1); }}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                >
                  <HiArrowPath size={20} />
                </button>
              </div>
              <button 
                onClick={toggleLightbox}
                className="p-4 bg-brand-orange text-white rounded-sm hover:opacity-90 transition-all font-black"
              >
                <HiXMark size={24} />
              </button>
            </div>

            <div className="absolute top-6 left-6 hidden md:block">
              <h4 className="text-brand-orange text-[10px] uppercase font-black tracking-widest mb-1">Lightbox View</h4>
              <p className="text-white text-2xl font-serif">{GALLERY_IMAGES[index].title}</p>
            </div>

            {/* Navigation ... */}
            <button 
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-6 glass-panel border-white/5 text-white hover:bg-brand-orange transition-all rounded-sm z-50"
            >
              <HiChevronLeft size={32} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-6 glass-panel border-white/5 text-white hover:bg-brand-orange transition-all rounded-sm z-50"
            >
              <HiChevronRight size={32} />
            </button>

            {/* Main Image ... */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <motion.img
                  key={`${index}-${zoom}`}
                  initial={{ opacity: 0, scale: zoom * 0.95 }}
                  animate={{ opacity: 1, scale: zoom }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  src={GALLERY_IMAGES[index].url}
                  alt={GALLERY_IMAGES[index].title}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                  decoding="async"
                />
            </div>

            {/* Thumbnail Strip ... */}
            <div className="absolute bottom-12 flex gap-4 overflow-x-auto pb-4 max-w-full px-12 scrollbar-hide">
              {GALLERY_IMAGES.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setIndex(i); setZoom(1); }}
                  className={`relative w-20 h-20 rounded-sm overflow-hidden flex-shrink-0 border-2 transition-all ${i === index ? 'border-brand-orange scale-110' : 'border-transparent opacity-40 hover:opacity-100'}`}
                >
                  <img 
                    src={img.thumb || img.url} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
