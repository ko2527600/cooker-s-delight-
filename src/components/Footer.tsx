import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BsInstagram, BsFacebook } from 'react-icons/bs';
import { usePageContext } from '../pages/PublicLayout';

export default function Footer() {
  const { addToast } = usePageContext();
  const [email, setEmail] = useState('');

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    addToast('Subscribed! ✓');
    setEmail('');
  };

  return (
    <footer className="bg-[#050505] pt-32 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
        <div className="animate-marquee-drift whitespace-nowrap opacity-[0.02]">
          <span className="text-[25vw] font-display font-bold leading-none select-none px-20">COOKERS DELIGHT COOKERS DELIGHT COOKERS DELIGHT</span>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <span className="font-display text-4xl font-bold">Cookers <span className="text-brand-orange">Delight</span></span>
            <p className="text-white/40 font-body leading-relaxed max-w-xs">Great Foods. Great People. Delivering authentic West African flavours since 2016.</p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/cookersdelightgh/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-orange transition-all"><BsInstagram /></a>
              <a href="https://www.facebook.com/cookersdelightgh/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-orange transition-all"><BsFacebook /></a>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xl font-bold uppercase text-brand-orange tracking-widest text-xs">Navigation</h4>
            <ul className="space-y-4 font-body text-white/60">
              {[
                { label: 'Home', to: '/' },
                { label: 'Menu', to: '/menu' },
                { label: 'Gallery', to: '/gallery' },
                { label: 'Branches', to: '/branches' },
                { label: 'Reviews', to: '/reviews' },
                { label: 'Contact', to: '/contact' },
              ].map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-brand-orange transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-xl font-bold uppercase text-brand-orange tracking-widest text-xs">Opening Hours</h4>
            <div className="space-y-2 text-white/60 font-body">
              <p className="font-bold">Monday – Sunday</p>
              <p>7:00 AM – 10:00 PM</p>
              <div className="pt-6">
                <p className="text-brand-orange font-bold uppercase text-[10px] mb-2">Support Line</p>
                <a href="tel:+233243379412" className="text-2xl font-display font-bold">+233 24 337 9412</a>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xl font-bold uppercase text-brand-orange tracking-widest text-xs">Newsletter</h4>
            <p className="text-white/40 text-sm">Join for weekly specials & new dish alerts.</p>
            <form onSubmit={subscribe} className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="Your email"
                className="bg-transparent flex-1 px-4 py-3 outline-none text-sm"
              />
              <button type="submit" className="bg-brand-orange text-white px-6 py-3 rounded-xl font-bold text-sm">Join</button>
            </form>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-white/20 text-xs font-bold uppercase tracking-widest">
          <p>© 2026 Cookers Delight. Accra, Ghana.</p>
          <p className="text-brand-orange">Professional Service Delivery</p>
        </div>
      </div>
    </footer>
  );
}
