import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { HiBars3, HiXMark } from 'react-icons/hi2';

const NAV_LINKS = [
  { name: 'Home', to: '/' },
  { name: 'Menu', to: '/menu' },
  { name: 'Gallery', to: '/gallery' },
  { name: 'Branches', to: '/branches' },
  { name: 'Reviews', to: '/reviews' },
  { name: 'Bookings', to: '/bookings' },
  { name: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E8E0D8]'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center py-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/" className="flex items-center">
              <span className="font-display text-2xl font-bold text-[#1C1917] leading-none">
                Cookers<span className="text-[#1B5E20]">Delight</span>
              </span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.name}
                to={link.to}
                className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${
                  pathname === link.to
                    ? 'text-[#1B5E20]'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://wa.me/233243379412"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold uppercase tracking-widest text-[#1B5E20] hover:text-[#14532D] transition-colors"
            >
              WhatsApp
            </a>
            <Link
              to="/menu"
              className="bg-[#1B5E20] text-white px-6 py-2.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest hover:bg-[#2D6A4F] transition-all"
            >
              Order Online
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-[#1C1917] hover:bg-[#F5EFE8] transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <HiXMark size={24} /> : <HiBars3 size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white border-b border-[#E8E0D8]"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.name}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`text-base font-bold uppercase tracking-widest transition-colors ${
                    pathname === link.to ? 'text-[#1B5E20]' : 'text-[#78716C] hover:text-[#1B5E20]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/menu"
                onClick={() => setIsOpen(false)}
                className="mt-2 bg-[#1B5E20] text-white text-center py-4 rounded-full font-extrabold uppercase tracking-widest text-xs"
              >
                Order Online
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
