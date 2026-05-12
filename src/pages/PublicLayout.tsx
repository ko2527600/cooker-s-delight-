import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { BsWhatsapp } from 'react-icons/bs';
import { HiArrowUp } from 'react-icons/hi2';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnnouncementBar from '../components/AnnouncementBar';
import Toast, { type ToastMessage } from '../components/Toast';
import PWAUpdateBanner from '../components/PWAUpdateBanner';

// Shared page context — avoids prop-drilling navigation and toast down every page.
interface PageContextValue {
  navigate: (page: string) => void;
  addToast: (msg: string) => void;
}

export const PageContext = createContext<PageContextValue>({
  navigate: () => {},
  addToast: () => {},
});

export function usePageContext() {
  return useContext(PageContext);
}

export default function PublicLayout() {
  const [loading, setLoading]           = useState(true);
  const [toasts, setToasts]             = useState<ToastMessage[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    const onScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, []);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type: 'success' }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // navigate() scrolls to top and is passed via context to pages
  const navigate = (page: string) => {
    window.history.pushState({}, '', `/${page.toLowerCase()}`);
    window.scrollTo({ top: 0 });
  };

  return (
    <PageContext.Provider value={{ navigate, addToast }}>
      <div className="min-h-screen bg-brand-black text-white selection:bg-brand-orange/30">
        <PWAUpdateBanner />
        <AnnouncementBar />

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-brand-black flex flex-col items-center justify-center p-10"
            >
              <motion.h1
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl md:text-8xl font-bold mb-12"
              >
                Cookers <span className="text-brand-orange">Delight</span>
              </motion.h1>
              <div className="w-full max-w-md h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8 }}
                  className="h-full bg-brand-orange"
                />
              </div>
            </motion.div>
          ) : (
            <div key="main" className="relative">
              <div className="grain-overlay" />
              <Navbar />
              <Outlet />
              <Footer />

              {/* Floating actions */}
              <div className="fixed bottom-32 lg:bottom-10 right-8 z-[60] flex flex-col gap-4">
                <AnimatePresence>
                  {showScrollTop && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-brand-orange transition-all"
                    >
                      <HiArrowUp size={24} />
                    </motion.button>
                  )}
                </AnimatePresence>
                <a
                  href="https://wa.me/233243379412"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform animate-pulse-glow"
                >
                  <BsWhatsapp size={32} />
                </a>
              </div>

              <Toast toasts={toasts} removeToast={id => setToasts(prev => prev.filter(t => t.id !== id))} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageContext.Provider>
  );
}
