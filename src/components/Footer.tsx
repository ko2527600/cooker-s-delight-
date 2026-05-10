/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FiInstagram, FiFacebook } from 'react-icons/fi';

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white py-12 border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 flex flex-col items-center text-center">
        <div className="mb-12">
          <div className="font-serif text-4xl font-bold tracking-tighter uppercase mb-4">
            Cookers<span className="text-brand-orange">Delight</span>
          </div>
          <p className="text-white/30 text-xs uppercase tracking-[0.4em] font-black italic max-w-sm mx-auto">
            Great Foods. Great People.
          </p>
        </div>

        <div className="flex gap-12 mb-12 font-bold text-[10px] uppercase tracking-widest text-white/40">
          <a href="#menu" className="hover:text-brand-orange transition-colors">Menu</a>
          <a href="#about" className="hover:text-brand-orange transition-colors">Story</a>
          <a href="#branches" className="hover:text-brand-orange transition-colors">Locations</a>
          <a href="#social" className="hover:text-brand-orange transition-colors">Social</a>
          <a href="#contact" className="hover:text-brand-orange transition-colors">Contact</a>
        </div>

        <div className="flex gap-6 mb-12">
          <a href="https://www.instagram.com/cookersdelightgh/" target="_blank" rel="noopener noreferrer" className="p-3 glass-panel border-white/10 rounded-full hover:bg-brand-orange hover:border-brand-orange transition-all text-white/60 hover:text-white">
            <FiInstagram size={20} />
          </a>
          <a href="https://www.facebook.com/cookersdelightgh/" target="_blank" rel="noopener noreferrer" className="p-3 glass-panel border-white/10 rounded-full hover:bg-brand-orange hover:border-brand-orange transition-all text-white/60 hover:text-white">
            <FiFacebook size={20} />
          </a>
        </div>

        <div className="pt-12 border-t border-white/5 w-full flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase font-black tracking-widest text-white/20">
          <p>© 2026 Cookers Delight. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <span className="text-brand-orange">Professional Service Delivery</span>
          </div>
        </div>
      </div>
      
      {/* Background large text */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[15vw] font-black text-white/[0.02] select-none pointer-events-none whitespace-nowrap">
        COOKERS DELIGHT
      </div>
    </footer>
  );
}
