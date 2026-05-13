/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FiInstagram, FiFacebook } from 'react-icons/fi';

export function Footer() {
  return (
    <footer className="bg-brand-olive-dark text-white py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 flex flex-col items-center text-center">
        <div className="mb-10">
          <div className="font-display text-4xl font-bold tracking-tight mb-3">
            Cookers<span className="text-brand-orange">Delight</span>
          </div>
          <p className="text-white/50 text-sm italic max-w-sm mx-auto">
            Great Foods. Great People.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mb-10 font-semibold text-sm text-white/60">
          <a href="#menu" className="hover:text-brand-gold transition-colors">Menu</a>
          <a href="#about" className="hover:text-brand-gold transition-colors">Story</a>
          <a href="#branches" className="hover:text-brand-gold transition-colors">Locations</a>
          <a href="#social" className="hover:text-brand-gold transition-colors">Social</a>
          <a href="#contact" className="hover:text-brand-gold transition-colors">Contact</a>
        </div>

        <div className="flex gap-4 mb-10">
          <a href="https://www.instagram.com/cookersdelightgh/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-full hover:bg-brand-orange transition-all text-white/70 hover:text-white">
            <FiInstagram size={20} />
          </a>
          <a href="https://www.facebook.com/cookersdelightgh/" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/10 rounded-full hover:bg-brand-orange transition-all text-white/70 hover:text-white">
            <FiFacebook size={20} />
          </a>
        </div>

        <div className="pt-8 border-t border-white/10 w-full flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30 font-semibold">
          <p>© 2026 Cookers Delight. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <span className="text-brand-gold">Professional Service Delivery</span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[15vw] font-black text-white/[0.03] select-none pointer-events-none whitespace-nowrap">
        COOKERS DELIGHT
      </div>
    </footer>
  );
}
