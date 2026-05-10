/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { HiBars3, HiXMark } from 'react-icons/hi2';
import { useState } from 'react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'About', href: '#about' },
    { name: 'Menu', href: '#menu' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Branches', href: '#branches' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Social', href: '#social' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="font-serif text-3xl font-bold text-white uppercase tracking-tighter">
              Cookers<span className="text-brand-orange">Delight</span>
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[11px] font-bold text-white/70 hover:text-white uppercase tracking-[0.2em] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <a
              href="https://wa.me/233243379412"
              className="bg-brand-orange text-white px-8 py-2.5 rounded-sm text-[11px] font-extrabold uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Order Online
            </a>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-white">
              {isOpen ? <HiXMark size={24} /> : <HiBars3 size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-panel border-b border-white/5 px-6 py-10"
        >
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-white/70 hover:text-brand-orange uppercase tracking-widest"
              >
                {link.name}
              </a>
            ))}
            <a
              href="https://wa.me/233243379412"
              className="bg-brand-orange text-white text-center py-4 rounded-sm font-black uppercase tracking-widest text-xs"
            >
              Order via WhatsApp
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
