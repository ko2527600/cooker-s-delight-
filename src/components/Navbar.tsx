/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { HiBars3, HiXMark } from 'react-icons/hi2';
import { FiPhone } from 'react-icons/fi';
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
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <a href="#" className="font-display text-2xl font-bold text-brand-dark tracking-tight">
              Cookers<span className="text-brand-orange">Delight</span>
            </a>
          </motion.div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[13px] font-semibold text-brand-dark/70 hover:text-brand-orange transition-colors tracking-wide"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Right: Phone + CTA */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-brand-dark/60">
              <FiPhone size={14} className="text-brand-orange" />
              <span className="text-xs font-semibold">+233 24 337 9412</span>
            </div>
            <a
              href="https://wa.me/233243379412"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-orange text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-brand-orange/90 transition-all shadow-sm"
            >
              Order Now
            </a>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-brand-dark"
              aria-label="Toggle menu"
            >
              {isOpen ? <HiXMark size={24} /> : <HiBars3 size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Down Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-brand-cream border-b border-gray-100 px-6 py-8"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-display text-2xl font-semibold text-brand-dark hover:text-brand-orange transition-colors tracking-tight"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="https://wa.me/233243379412"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-orange text-white text-center py-4 rounded-full font-bold text-sm mt-2"
              >
                ORDER NOW
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
