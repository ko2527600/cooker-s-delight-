import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HiOutlineShoppingBag, HiPlus, HiMinus, HiTrash, HiXMark, HiClock,
} from 'react-icons/hi2';
import { FiSearch } from 'react-icons/fi';
import { BsWhatsapp } from 'react-icons/bs';
import PageWrapper from '../components/PageWrapper';
import { useApi } from '../hooks/useApi';
import { menuApi, prepTimeApi } from '../lib/api';
import { getImgUrl } from '../utils/image';
import { usePageContext } from './PublicLayout';
import type { TIMenuItem } from '../types';

interface CartItem {
  menu_id: number;
  menu_name: string;
  menu_price: number;
  prep_time_minutes: number;
  thumb?: string;
  quantity: number;
}

const CATEGORIES = ['All', 'Ghanaian', 'Nigerian', 'Snacks', 'Sides', 'Fast Food', 'Continental'];

export default function MenuPage() {
  const { addToast } = usePageContext();
  const { data: items, loading, error, refetch } = useApi<TIMenuItem[]>(() => menuApi.getItems());
  const { data: prepTimes } = useApi<Record<string, number>>(() => prepTimeApi.getAll());

  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch]                 = useState('');
  const [isCartOpen, setIsCartOpen]         = useState(false);
  const [cart, setCart]                     = useState<CartItem[]>([]);

  // Merge prep times into items
  const enrichedItems = useMemo<TIMenuItem[]>(() => {
    if (!items) return [];
    if (!prepTimes) return items;
    return items.map(item => ({
      ...item,
      prep_time_minutes: prepTimes[String(item.menu_id)] ?? item.prep_time_minutes ?? 15,
    }));
  }, [items, prepTimes]);

  const filteredItems = useMemo(() => {
    return enrichedItems.filter(item => {
      const cat = item.categories?.[0]?.name ?? '';
      const matchCat = activeCategory === 'All' || cat === activeCategory;
      const matchSearch =
        item.menu_name.toLowerCase().includes(search.toLowerCase()) ||
        (item.menu_description ?? '').toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [enrichedItems, activeCategory, search]);

  const addToCart = (item: TIMenuItem) => {
    const prepTime = item.prep_time_minutes ?? 15;
    setCart(prev => {
      const existing = prev.find(i => i.menu_id === item.menu_id);
      if (existing) return prev.map(i => i.menu_id === item.menu_id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, {
        menu_id: item.menu_id,
        menu_name: item.menu_name,
        menu_price: item.menu_price,
        prep_time_minutes: prepTime,
        thumb: item.thumb,
        quantity: 1,
      }];
    });
    addToast(`Added ${item.menu_name} ✓`);
  };

  const updateQty = (id: number, delta: number) =>
    setCart(prev => prev.map(i => i.menu_id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.menu_id !== id));
    addToast('Item removed');
  };

  const total = cart.reduce((acc, i) => acc + i.menu_price * i.quantity, 0);

  // Dishes cook in parallel — estimated wait = max prep time + 5 min buffer
  const estimatedWait = cart.length > 0
    ? Math.max(...cart.map(i => i.prep_time_minutes)) + 5
    : 0;

  const sendWhatsApp = () => {
    const msg = `Hello Cookers Delight! I'd like to order:\n${cart.map(i => `- ${i.quantity}x ${i.menu_name} (₵${i.menu_price.toFixed(2)})`).join('\n')}\n\nTotal: ₵${total.toFixed(2)}\nEstimated wait: ~${estimatedWait} min\nPlease confirm.`;
    window.open(`https://wa.me/233243379412?text=${encodeURIComponent(msg)}`);
  };

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src={getImgUrl('/assets/flyer2.jpg')} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent" />
        <h1 className="relative z-10 text-7xl md:text-9xl font-bold">Our <span className="italic font-normal text-brand-orange">Menu</span></h1>
      </section>

      <section className="py-20 bg-brand-black">
        <div className="container mx-auto px-6">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-16">
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeCategory === cat ? 'bg-brand-orange text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-96">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40"><FiSearch /></span>
              <input
                type="text"
                placeholder="Search dishes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-3.5 focus:border-brand-orange outline-none"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array(8).fill(0).map((_, i) => <div key={i} className="bg-white/5 rounded-[32px] h-[380px] animate-pulse" />)
            ) : error ? (
              <div className="col-span-full py-20 text-center space-y-4">
                <p className="text-white/40">Failed to load menu</p>
                <button onClick={refetch} className="text-brand-orange font-bold underline">Try Again</button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, idx) => (
                  <motion.div
                    layout
                    key={item.menu_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/5 rounded-[32px] overflow-hidden group hover:border-brand-orange/30 border border-transparent transition-all"
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={getImgUrl(item.thumb ?? '/assets/jollof.jpg')}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={item.menu_name}
                      />
                      {/* Prep time badge */}
                      {item.prep_time_minutes && (
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <HiClock size={10} />
                          ~{item.prep_time_minutes} min
                        </div>
                      )}
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-display text-xl font-bold">{item.menu_name}</h3>
                        <span className="text-brand-orange font-bold">₵{item.menu_price.toFixed(2)}</span>
                      </div>
                      <p className="text-white/40 text-xs font-body mb-6 leading-relaxed h-8 overflow-hidden">{item.menu_description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCart(item)}
                          className="flex-1 bg-white/5 hover:bg-brand-orange py-3 rounded-2xl text-[10px] font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <HiPlus /> Add to Order
                        </button>
                        <button
                          onClick={() => window.open(`https://wa.me/233243379412?text=${encodeURIComponent(`Hello! I'd like to order: ${item.menu_name} (₵${item.menu_price.toFixed(2)})`)}`)}
                          className="px-4 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white py-3 rounded-2xl transition-all"
                        >
                          <BsWhatsapp size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      {/* Floating cart button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-32 right-8 lg:top-32 lg:bottom-auto lg:right-10 z-[60] w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center text-white shadow-2xl shadow-brand-orange/40 active:scale-95 transition-transform"
      >
        <HiOutlineShoppingBag size={28} />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-brand-orange w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-brand-orange">
            {cart.reduce((a, b) => a + b.quantity, 0)}
          </span>
        )}
      </button>

      {/* Cart drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full lg:w-[450px] bg-brand-black z-[201] p-10 flex flex-col border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-display font-bold">Your Order</h2>
                <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><HiXMark size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                {cart.length === 0 ? (
                  <div className="text-center py-20 opacity-20">
                    <HiOutlineShoppingBag size={80} className="mx-auto mb-6" />
                    <p className="font-bold">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.menu_id} className="flex gap-4 bg-white/5 p-4 rounded-2xl items-center">
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{item.menu_name}</h4>
                        <p className="text-brand-orange font-bold">₵{item.menu_price.toFixed(2)}</p>
                        <p className="text-white/30 text-[10px] flex items-center gap-1 mt-0.5">
                          <HiClock size={10} /> ~{item.prep_time_minutes} min
                        </p>
                      </div>
                      <div className="flex items-center gap-3 bg-black/40 rounded-xl p-1">
                        <button onClick={() => updateQty(item.menu_id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg"><HiMinus /></button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.menu_id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg"><HiPlus /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.menu_id)} className="text-white/20 hover:text-red-500 transition-colors"><HiTrash size={20} /></button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                {/* Estimated wait */}
                {cart.length > 0 && (
                  <div className="flex items-center justify-between bg-white/5 rounded-xl px-5 py-3">
                    <span className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
                      <HiClock size={14} /> Estimated Wait
                    </span>
                    <span className="text-brand-orange font-bold">~{estimatedWait} min</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-bold uppercase text-xs">Total Amount</span>
                  <span className="text-3xl font-display font-bold text-brand-orange">₵{total.toFixed(2)}</span>
                </div>
                <button
                  disabled={cart.length === 0}
                  onClick={sendWhatsApp}
                  className="w-full bg-brand-orange text-white py-5 rounded-2xl font-bold text-lg disabled:opacity-20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <BsWhatsapp size={24} /> Send via WhatsApp
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
