import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
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
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <Link to="/" className="font-serif text-3xl font-bold text-white uppercase tracking-tighter">
              Cookers<span className="text-brand-orange">Delight</span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map(link => (
              <Link
                key={link.name}
                to={link.to}
                className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${pathname === link.to ? 'text-brand-orange' : 'text-white/70 hover:text-white'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Link
              to="/menu"
              className="bg-brand-orange text-white px-8 py-2.5 rounded-sm text-[11px] font-extrabold uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Order Online
            </Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-white">
              {isOpen ? <HiXMark size={24} /> : <HiBars3 size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-panel border-b border-white/5 px-6 py-10"
        >
          <div className="flex flex-col gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.name}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`text-lg font-bold uppercase tracking-widest ${pathname === link.to ? 'text-brand-orange' : 'text-white/70 hover:text-brand-orange'}`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/menu"
              onClick={() => setIsOpen(false)}
              className="bg-brand-orange text-white text-center py-4 rounded-sm font-black uppercase tracking-widest text-xs"
            >
              Order Online
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
