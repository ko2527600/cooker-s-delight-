import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  HiBars3, HiXMark, HiStar, HiOutlineStar, HiMapPin, HiChevronRight, 
  HiUsers, HiCheckBadge, HiChevronLeft, HiMagnifyingGlass,
  HiOutlineShoppingBag, HiPlus, HiMinus, HiTrash, HiArrowUp,
  HiCheckCircle, HiRocketLaunch, HiSparkles, HiEnvelope, HiOutlineBell,
  HiArrowRight, HiOutlineUser
} from 'react-icons/hi2';
import { FiPhone, FiInstagram, FiFacebook, FiTarget, FiSearch } from 'react-icons/fi';
import { BsWhatsapp, BsInstagram, BsFacebook, BsHeartFill } from 'react-icons/bs';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView, useReducedMotion } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './admin/AuthContext';
import ProtectedRoute from './admin/ProtectedRoute';
import Login from './admin/Login';
import Dashboard from './admin/pages/Dashboard';
import MenuManager from './admin/pages/MenuManager';
import OrdersManager from './admin/pages/OrdersManager';
import GalleryManager from './admin/pages/GalleryManager';
import BranchesManager from './admin/pages/BranchesManager';
import ReviewsManager from './admin/pages/ReviewsManager';
import AnnouncementsManager from './admin/pages/AnnouncementsManager';
import Settings from './admin/pages/Settings';
import CustomersManager from './admin/pages/CustomersManager';
import Layout from './admin/Layout';
import { ToastProvider } from './admin/components/Toast';
import useApi from './hooks/useApi';
import api from './api/axios';
import { MENU_DATA, GALLERY_IMAGES, BRANCHES, REVIEWS } from './constants';
import { getImgUrl } from './utils/image';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CustomerProvider } from './portal/CustomerContext';
import CustomerProtectedRoute from './portal/CustomerProtectedRoute';
import CustomerLayout from './portal/CustomerLayout';
import CustomerLogin from './portal/pages/CustomerLogin';
import CustomerRegister from './portal/pages/CustomerRegister';
import CustomerDashboard from './portal/pages/CustomerDashboard';
import PlaceOrder from './portal/pages/PlaceOrder';
import OrderHistory from './portal/pages/OrderHistory';
import OrderDetail from './portal/pages/OrderDetail';
import CustomerProfile from './portal/pages/CustomerProfile';
import SavedAddresses from './portal/pages/SavedAddresses';
import MyReviews from './portal/pages/MyReviews';
import Notifications from './portal/pages/Notifications';
import LoyaltyPoints from './portal/pages/LoyaltyPoints';
import PWAUpdateBanner from './components/PWAUpdateBanner';
import CDBoatDownloadSection from './components/CDBoatDownloadSection';
import AdminInstallGate from './admin/AdminInstallGate';
import FeedbackPage from './portal/pages/FeedbackPage';
import FeedbackManager from './admin/pages/FeedbackManager';

// --- Types ---
interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
}

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info';
}

// --- Helper: Count Up Hook ---
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, end, duration]);

  return { count, ref };
};

// --- Helper: Image URL Formatter ---
const formatImg = (url: string, w: number = 800) => {
  if (!url) return "";
  if (url.startsWith('/assets')) return url;
  if (url.startsWith('/uploads')) return getImgUrl(url);
  if (url.startsWith('http')) return url;
  return `${url}&auto=format&fit=crop&q=80&w=${w}&fm=webp`;
};

// --- Global Components ---

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isImageHover, setIsImageHover] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(target.closest('button, a, .hover-trigger') !== null);
      setIsImageHover(target.closest('img, .gallery-item') !== null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (typeof window !== 'undefined' && window.innerWidth < 1024) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference"
      animate={{
        x: position.x - (isHovering ? 20 : 6),
        y: position.y - (isHovering ? 20 : 6),
        width: isHovering ? 40 : 12,
        height: isHovering ? 40 : 12,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.5 }}
    >
      <div className="w-full h-full bg-brand-orange rounded-full flex items-center justify-center overflow-hidden">
        {isImageHover && !isHovering && (
          <span className="text-[8px] font-bold text-white uppercase tracking-tighter">View</span>
        )}
      </div>
    </motion.div>
  );
};

const Toast = ({ toasts, removeToast }: { toasts: ToastMessage[], removeToast: (id: number) => void }) => (
  <div className="fixed bottom-24 left-8 z-[200] flex flex-col gap-3 pointer-events-none">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          className="pointer-events-auto bg-brand-black/90 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[200px]"
        >
          <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center text-brand-orange">
            <HiCheckCircle size={20} />
          </div>
          <span className="font-body text-sm font-bold text-white">{toast.message}</span>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const AnnouncementBar = () => {
  const { data: announcement, loading } = useApi('/announcements');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!loading && announcement) {
      const dismissed = localStorage.getItem(`ann-dismissed-${announcement.id}`);
      if (!dismissed) setIsVisible(true);
    }
  }, [announcement, loading]);

  const dismiss = () => {
    if (announcement) localStorage.setItem(`ann-dismissed-${announcement.id}`, 'true');
    setIsVisible(false);
  };

  if (loading || !announcement || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="py-2 px-6 relative z-[60] overflow-hidden"
        style={{ backgroundColor: announcement.bgColor, color: announcement.textColor }}
      >
        <div className="container mx-auto text-center font-body text-xs md:text-sm font-bold tracking-wide">
          {announcement.link ? (
            <a href={announcement.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {announcement.text}
            </a>
          ) : (
            announcement.text
          )}
        </div>
        <button onClick={dismiss} className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
          <HiXMark size={20} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// --- Layout Components ---

const Navbar = ({ 
  currentPage, 
  setCurrentPage, 
  cartCount 
}: { 
  currentPage: string, 
  setCurrentPage: (p: string) => void,
  cartCount: number
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = ['Home', 'Menu', 'Gallery', 'Branches', 'Reviews', 'Contact'];

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-[70]">
        <motion.div 
          className="h-full bg-brand-orange origin-left"
          style={{ scaleX: useSpring(useScroll().scrollYProgress, { stiffness: 100, damping: 30 }) }}
        />
      </div>

      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center cursor-pointer gap-3" onClick={() => { setCurrentPage('Home'); window.scrollTo({ top: 0 }); }}>
            <img src="/assets/logo.jpg" className="w-10 h-10 rounded-full object-cover" alt="Logo" />
            <span className="font-display text-3xl font-bold text-white">Cookers <span className="text-brand-orange">Delight</span></span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {links.map(link => (
              <button
                key={link}
                onClick={() => { setCurrentPage(link); window.scrollTo({ top: 0 }); }}
                className={`font-body text-sm font-medium transition-colors hover:text-brand-orange ${currentPage === link ? 'text-brand-orange' : 'text-white/80'}`}
              >
                {link}
              </button>
            ))}
            
            {/* Customer Portal Link */}
            <Link 
              to={localStorage.getItem('cd_customer_token') ? "/portal/dashboard" : "/portal/login"}
              className="text-white/80 hover:text-brand-orange transition-colors font-body text-sm font-medium flex items-center gap-2"
            >
              <HiOutlineUser size={18} color="#EC4824" />
              {localStorage.getItem('cd_customer_token') ? 'My Account' : 'Sign In'}
            </Link>

            <a
              href="https://wa.me/233243379412"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white px-6 py-2.5 rounded-full font-body text-sm font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Order Now
            </a>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 lg:hidden">
             {currentPage === 'Menu' && cartCount > 0 && (
               <div className="relative">
                 <HiOutlineShoppingBag size={24} />
                 <span className="absolute -top-2 -right-2 bg-brand-orange text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
               </div>
             )}
            <button className="text-white" onClick={() => setMobileMenuOpen(true)}>
              <HiBars3 size={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-brand-black z-[101] p-10 flex flex-col lg:hidden border-l border-white/10"
            >
              <div className="flex justify-between items-center mb-16">
                 <span className="font-display text-2xl font-bold">Menu</span>
                 <button onClick={() => setMobileMenuOpen(false)} className="text-white/60"><HiXMark size={32} /></button>
              </div>
              <div className="flex flex-col space-y-8">
                {links.map(link => (
                  <button
                    key={link}
                    onClick={() => { setCurrentPage(link); setMobileMenuOpen(false); window.scrollTo({ top: 0 }); }}
                    className={`text-4xl font-display text-left font-bold ${currentPage === link ? 'text-brand-orange' : 'text-white'}`}
                  >
                    {link}
                  </button>
                ))}
                
                <Link 
                  to={localStorage.getItem('cd_customer_token') ? "/portal/dashboard" : "/portal/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl font-display text-left font-bold text-white hover:text-brand-orange transition-colors"
                >
                  {localStorage.getItem('cd_customer_token') ? 'Account' : 'Sign In'}
                </Link>
              </div>
              <div className="mt-auto pt-10 border-t border-white/5 space-y-6">
                <p className="text-white/40 text-sm font-body">Get in touch:</p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><BsInstagram /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><BsFacebook /></a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 py-4 px-8 z-50 flex justify-between items-center">
        {[
          { name: 'Home', icon: <FiTarget size={24} /> },
          { name: 'Menu', icon: <HiOutlineStar size={24} /> },
          { name: 'Gallery', icon: <HiSparkles size={24} /> },
          { name: 'Contact', icon: <FiPhone size={22} /> }
        ].map(item => (
          <button 
            key={item.name}
            onClick={() => { setCurrentPage(item.name); window.scrollTo({ top: 0 }); }}
            className={`flex flex-col items-center gap-1 ${currentPage === item.name ? 'text-brand-orange' : 'text-white/40'}`}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase">{item.name}</span>
          </button>
        ))}
      </div>
    </>
  );
};

// --- Page: Home ---

const Home = ({ setCurrentPage, addToast }: { setCurrentPage: (p: string) => void, addToast: (m: string) => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    "/assets/cookers delight1.webp",
    "/assets/forcourt2.jpg",
    "/assets/jollof.jpg",
    "/assets/cookers delight4.webp"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(s => (s + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 1000], [0, 400]);

  // Stat counters
  const years = useCountUp(10);
  const branches = useCountUp(4);
  const reviews = useCountUp(200);
  const dishes = useCountUp(50);

  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center overflow-hidden">
        <motion.div style={{ y: yParallax }} className="absolute inset-0 z-0 scale-110">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={formatImg(slides[currentSlide], 1920)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="w-full h-full object-cover"
              alt="Slideshow"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-br from-brand-burgundy/75 via-brand-black/90 to-brand-black/95"></div>
        </motion.div>

        {/* Indicators */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
          {slides.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${currentSlide === idx ? 'bg-brand-orange h-8' : 'bg-white/20'}`}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-brand-orange font-bold tracking-[0.2em] uppercase text-sm font-body block"
              >
                Ghana's Favourite Restaurant
              </motion.span>
              <h1 className="text-8xl md:text-[140px] leading-[0.9] font-light flex flex-col">
                <span className="overflow-hidden"><motion.span initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>Hot &</motion.span></span>
                <span className="overflow-hidden"><motion.span initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="italic font-normal">Tasty<span className="text-brand-orange">.</span></motion.span></span>
              </h1>
            </div>
            <p className="text-white/70 text-lg md:text-xl max-w-lg leading-relaxed font-body">
              Experience a world-class culinary journey through West Africa. Every dish is a masterpiece of spice, culture, and heritage.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => { setCurrentPage('Menu'); window.scrollTo({ top: 0 }); }}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95"
              >
                Explore Menu
              </button>
              <a
                href="https://wa.me/233243379412"
                className="border-2 border-white/20 hover:bg-white hover:text-brand-black px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105"
              >
                Order via WhatsApp
              </a>
            </div>
          </motion.div>

          <div className="relative hidden lg:flex justify-end">
             <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
               <div className="w-[500px] h-[500px] rounded-full overflow-hidden border-[15px] border-white/5 animate-spin-slow">
                  <img src={formatImg("/assets/jollof2.jpg", 900)} className="w-full h-full object-cover" alt="Spinning Disk" />
               </div>
               <motion.div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-2xl shadow-2xl animate-float max-w-[280px]">
                  <span className="inline-block bg-brand-orange/10 text-brand-orange text-xs font-bold px-2 py-1 rounded mb-2">Chef's Special</span>
                  <h3 className="text-brand-black font-bold text-lg mb-1 leading-tight">Gourmet Jollof with Grilled Tilapia</h3>
                  <p className="text-brand-orange font-bold text-xl">₵65.00</p>
               </motion.div>
             </motion.div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-xl border-t border-white/10 py-8">
          <div className="container mx-auto px-6 flex flex-nowrap overflow-x-auto lg:overflow-x-visible no-scrollbar lg:justify-around items-center gap-12 lg:gap-0">
             {[
               { label: 'Years Serving', val: years.count, ref: years.ref, suffix: '+' },
               { label: 'Branches', val: branches.count, ref: branches.ref, suffix: '' },
               { label: 'Happy Reviews', val: reviews.count, ref: reviews.ref, suffix: '+' },
               { label: 'Unique Dishes', val: dishes.count, ref: dishes.ref, suffix: '+' }
             ].map((stat, i) => (
               <div key={i} ref={stat.ref} className="flex flex-col items-center lg:items-start min-w-[150px]">
                 <span className="text-4xl font-display font-bold text-brand-orange">{stat.val}{stat.suffix}</span>
                 <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">{stat.label}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 bg-[#0e0e0e] relative overflow-hidden">
         <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-10">
               <span className="text-brand-orange font-bold uppercase tracking-widest text-sm">Our Story</span>
               <h2 className="text-6xl md:text-8xl font-bold leading-tight">Crafting <br/><span className="italic font-normal">Excellence.</span></h2>
               <p className="text-white/60 text-lg leading-relaxed font-body max-w-xl">
                  Cookers Delight is more than a restaurant; it's a celebration of West African culinary mastery. From our humble beginnings in Accra, we've remained dedicated to one mission: bringing you the soul of Ghana and Nigeria on a plate.
               </p>
               <button onClick={() => setCurrentPage('Menu')} className="bg-brand-burgundy hover:bg-brand-orange text-white px-10 py-5 rounded-full font-bold transition-all flex items-center gap-3">
                  View Full Menu <HiArrowRight />
               </button>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative">
               <div className="rounded-[50px] overflow-hidden shadow-2xl h-[700px]">
                  <img src={formatImg("/assets/forcourt.jpg", 1200)} className="w-full h-full object-cover" alt="Interior" />
               </div>
               <div className="absolute -bottom-10 -left-10 bg-brand-orange p-10 rounded-[40px] shadow-2xl">
                  <p className="text-6xl font-bold text-white mb-2">10+</p>
                  <p className="text-white/80 font-bold uppercase text-xs tracking-widest">Years of Taste</p>
               </div>
            </motion.div>
         </div>
      </section>

      {/* Horizontal Scroll Categories */}
      <section className="py-24 bg-brand-black overflow-hidden">
        <div className="container mx-auto px-6 mb-12 flex justify-between items-end">
           <h2 className="text-5xl font-display font-bold">Taste Our <span className="text-brand-orange">Heritage</span></h2>
           <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center"><HiChevronLeft /></div>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-brand-orange"><HiChevronRight /></div>
           </div>
        </div>
        <motion.div 
          drag="x" 
          dragConstraints={{ right: 0, left: -800 }}
          className="flex gap-8 px-6 lg:px-[10%] snap-x snap-mandatory no-scrollbar overflow-x-auto"
        >
          {['Ghanaian', 'Nigerian', 'Seafood', 'Snacks', 'Grilled', 'Desserts'].map((cat, i) => (
            <motion.div 
              key={i} 
              className="min-w-[300px] h-[400px] rounded-[40px] relative overflow-hidden group cursor-grab active:cursor-grabbing snap-center"
            >
              <img src={getImgUrl(slides[i % 4])} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={cat} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-3xl font-display font-bold mb-2">{cat}</h3>
                <span className="text-brand-orange text-xs font-bold uppercase tracking-widest">Explore Category</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Feature Section: Why Choose Us */}
      <section className="py-32 bg-[#0a0a0a]">
         <div className="container mx-auto px-6">
            <div className="text-center mb-24">
               <h2 className="text-5xl md:text-7xl font-bold">The Gold <span className="text-brand-orange italic font-normal">Standard</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { icon: <HiRocketLaunch />, title: 'Fast Delivery', desc: 'Hot food at your door in 30–45 mins' },
                 { icon: <HiSparkles />, title: 'Fresh Ingredients', desc: 'Sourced daily from local markets' },
                 { icon: <HiUsers />, title: 'Expert Chefs', desc: '10+ years of West African culinary mastery' },
                 { icon: <BsWhatsapp />, title: 'Easy Ordering', desc: 'One WhatsApp message and you\'re done' }
               ].map((item, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.1 }}
                   className="bg-white/5 p-10 rounded-[40px] border border-white/5 hover:border-brand-orange/40 transition-all group"
                 >
                    <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-8 group-hover:scale-110 transition-transform">
                       {item.icon}
                    </div>
                    <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                    <p className="text-white/40 leading-relaxed font-body">{item.desc}</p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Catering Section */}
      <section className="relative py-48 overflow-hidden">
         <img src={formatImg("/assets/flyer1.jpg", 1920)} className="absolute inset-0 w-full h-full object-cover opacity-35" alt="Catering" />
         <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-transparent to-brand-black"></div>
         <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
            <h2 className="text-6xl md:text-8xl font-bold mb-8">We Cater for <br/> <span className="text-brand-orange italic font-normal">Your Events</span></h2>
            <p className="text-xl text-white/70 mb-12 font-body leading-relaxed">
               Corporate events, weddings, funerals, parties — we bring the feast to you across Greater Accra. Professional service and authentic taste guaranteed.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-16">
               <button className="bg-brand-orange text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all">Get a Quote on WhatsApp</button>
               <button className="border-2 border-white/20 px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all">Call Us Now</button>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-white/40 font-bold uppercase text-xs tracking-widest">
               {['Weddings', 'Corporate', 'Parties', 'School Events'].map(e => <span key={e}>• {e}</span>)}
            </div>
         </div>
      </section>

      <CDBoatDownloadSection />

      {/* Footer Drift Marquee */}
      <div className="bg-brand-black py-4 border-y border-white/5 overflow-hidden flex items-center">
         <div className="animate-marquee-scroll whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-4xl md:text-6xl font-display font-bold text-white/5 uppercase mx-12">
                Ghana's Best Jollof • Authentic Nigerian Soups • Professional Catering • Hot Delivery 
              </span>
            ))}
         </div>
      </div>
    </PageWrapper>
  );
};

// --- Page: Menu ---

const MenuPage = ({ addToast, cart, setCart }: { addToast: (m: string) => void, cart: CartItem[], setCart: React.Dispatch<React.SetStateAction<CartItem[]>> }) => {
  const { data: items, loading, error, refetch } = useApi('/menu?available=true');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const categories = ['All', 'Ghanaian', 'Nigerian', 'Snacks', 'Sides', 'Fast Food', 'Continental'];

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter(item => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, activeCategory, search]);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
    addToast(`Added ${item.name} ✓`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    addToast("Item removed");
  };

  const total = cart.reduce((acc, item) => acc + (parseFloat(item.price.replace('₵', '')) * item.quantity), 0);

  const sendWhatsApp = () => {
    const message = `Hello Cookers Delight! I'd like to order:\n${cart.map(i => `- ${i.quantity}x ${i.name} (${i.price})`).join('\n')}\n\nTotal: ₵${total}\nPlease confirm delivery.`;
    window.open(`https://wa.me/233243379412?text=${encodeURIComponent(message)}`);
  };

  return (
    <PageWrapper>
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src={getImgUrl("/assets/flyer2.jpg")} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent"></div>
        <h1 className="relative z-10 text-7xl md:text-9xl font-bold">Our <span className="italic font-normal text-brand-orange">Menu</span></h1>
      </section>

      <section className="py-20 bg-brand-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-16">
             <div className="flex flex-wrap justify-center gap-2">
               {categories.map(cat => (
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
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40">
                   <FiSearch />
                </span>
                <input 
                  type="text" 
                  placeholder="Search dishes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-6 py-3.5 focus:border-brand-orange outline-none"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-[32px] h-[350px] animate-pulse" />
              ))
            ) : error ? (
              <div className="col-span-full py-20 text-center space-y-4">
                <p className="text-white/40">Failed to load menu</p>
                <button onClick={() => refetch()} className="text-brand-orange font-bold underline">Try Again</button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    key={item.id || `menu-${idx}`}
                    className="bg-white/5 rounded-[32px] overflow-hidden group hover:border-brand-orange/30 border border-transparent transition-all"
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img src={getImgUrl(item.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-display text-xl font-bold">{item.name}</h3>
                        <span className="text-brand-orange font-bold">{item.price}</span>
                      </div>
                      <p className="text-white/40 text-xs font-body mb-6 leading-relaxed h-8 overflow-hidden">{item.description}</p>
                      <button 
                        onClick={() => addToCart(item)}
                        className="w-full bg-white/5 hover:bg-brand-orange py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <HiPlus /> Add to Order
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      {/* Cart Icon */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-32 right-8 lg:top-32 lg:bottom-auto lg:right-10 z-[60] w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center text-white shadow-2xl shadow-brand-orange/40 group active:scale-95 transition-transform"
      >
         <HiOutlineShoppingBag size={28} />
         {cart.length > 0 && (
           <span className="absolute -top-1 -right-1 bg-white text-brand-orange w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-brand-orange">
             {cart.reduce((a, b) => a + b.quantity, 0)}
           </span>
         )}
      </button>

      {/* Cart Drawer */}
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
                       <div className="mx-auto mb-6">
                          <HiOutlineShoppingBag size={80} />
                       </div>
                       <p className="font-bold">Your cart is empty</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex gap-4 bg-white/5 p-4 rounded-2xl items-center">
                         <div className="flex-1">
                            <h4 className="font-bold mb-1">{item.name}</h4>
                            <p className="text-brand-orange font-bold">{item.price}</p>
                         </div>
                         <div className="flex items-center gap-3 bg-black/40 rounded-xl p-1">
                            <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg"><HiMinus /></button>
                            <span className="font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-lg"><HiPlus /></button>
                         </div>
                         <button onClick={() => removeFromCart(item.id)} className="text-white/20 hover:text-red-500 transition-colors"><HiTrash size={20} /></button>
                      </div>
                    ))
                  )}
               </div>

               <div className="mt-8 pt-8 border-t border-white/5">
                  <div className="flex justify-between items-center mb-8">
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
};

// --- Page: Gallery ---

const GalleryPage = () => {
  const { data: gallery, loading, error, refetch } = useApi('/gallery?visible=true');
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (index === null || !gallery) return;
      if (e.key === 'Escape') setIndex(null);
      if (e.key === 'ArrowRight') setIndex(i => (i! + 1) % gallery.length);
      if (e.key === 'ArrowLeft') setIndex(i => (i! - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [index, gallery]);

  return (
    <PageWrapper>
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src={gallery?.[0]?.url || "/assets/flyer2.jpg"} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent"></div>
        <h1 className="relative z-10 text-7xl md:text-9xl font-bold">Gal<span className="italic font-normal text-brand-orange">lery</span></h1>
      </section>

      <section className="py-20 bg-brand-black">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 rounded-[32px] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-white/40">Failed to load gallery</p>
              <button onClick={() => refetch()} className="text-brand-orange font-bold underline">Try Again</button>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {gallery.map((img, i) => (
                <motion.div
                  key={img.id || `gall-${i}`}
                  whileHover={{ rotateX: 5, rotateY: 5, scale: 1.02 }}
                  onClick={() => setIndex(i)}
                  className="relative group overflow-hidden rounded-[32px] cursor-pointer break-inside-avoid gallery-item shadow-2xl"
                >
                  <img src={getImgUrl(img.url)} className="w-full h-auto object-cover" alt={img.title} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-10">
                     <h3 className="text-white font-display text-4xl font-bold text-center translate-y-8 group-hover:translate-y-0 transition-all duration-500">{img.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {index !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 lg:p-20"
          >
            <button onClick={() => setIndex(null)} className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors z-30"><HiXMark size={40} /></button>
            
            <button onClick={() => setIndex((index - 1 + gallery.length) % gallery.length)} className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-white/40 hover:text-white z-30"><HiChevronLeft size={32} /></button>
            <button onClick={() => setIndex((index + 1) % gallery.length)} className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-white/40 hover:text-white z-30"><HiChevronRight size={32} /></button>

            <motion.div
              key={index}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center gap-8"
            >
              <img src={gallery[index].url} className="max-w-full max-h-[75vh] object-contain rounded-3xl shadow-[0_0_100px_rgba(236,72,36,0.2)]" alt="" />
              <div className="text-center">
                 <h3 className="text-4xl font-display font-bold mb-2">{gallery[index].title}</h3>
                 <p className="text-white/40 font-bold uppercase tracking-widest text-sm">{index + 1} / {gallery.length}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
};

// --- Page: Branches, Reviews, Contact --- (Upgraded)

const BranchesPage = () => {
  const { data: branches, loading, error, refetch } = useApi('/branches');

  return (
    <PageWrapper>
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src={formatImg("/assets/forcourt2.jpg", 1920)} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent"></div>
        <h1 className="relative z-10 text-7xl md:text-9xl font-bold text-center">Our <span className="italic font-normal text-brand-orange">Locations</span></h1>
      </section>
      <section className="py-24 bg-brand-black">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white/5 h-[400px] rounded-[50px] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-white/40">Failed to load branches</p>
              <button onClick={() => refetch()} className="text-brand-orange font-bold underline">Try Again</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {branches.map((branch, i) => (
                <motion.div key={branch.id || `branch-${i}`} whileHover={{ y: -10 }} className="bg-white/5 p-12 rounded-[50px] border border-white/5 flex flex-col justify-between group h-full">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-6xl font-display font-bold group-hover:text-brand-orange transition-colors">{branch.name}</h3>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${branch.isOpen ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${branch.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        {branch.isOpen ? 'Open Now' : 'Closed'}
                      </div>
                    </div>
                    <div className="space-y-2 mb-12 text-white/40 text-lg">
                      <p className="text-brand-orange font-bold uppercase text-xs tracking-widest mb-6">Branch Hub</p>
                      <p>{branch.landmark}</p>
                      <p>{branch.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                      <a href={`tel:${branch.phone}`} className="bg-white/5 hover:bg-white/10 px-8 py-4 rounded-full font-bold flex items-center gap-2 text-sm"><FiPhone /> Call Now</a>
                      <a href="https://wa.me/233243379412" className="bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange px-8 py-4 rounded-full font-bold flex items-center gap-2 text-sm"><BsWhatsapp /> WhatsApp</a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
};

const ReviewsPage = () => {
  const { data: reviews, loading, error, refetch } = useApi('/reviews?approved=true');
  const { data: gallery } = useApi('/gallery?visible=true');

  return (
    <PageWrapper>
      <div className="bg-brand-orange py-3 overflow-hidden flex whitespace-nowrap">
         <div className="animate-marquee-scroll flex font-bold uppercase text-xs tracking-tighter">
            {[...Array(20)].map((_, i) => <span key={i} className="mx-10">★ "The best Jollof in Accra" ★ "Authentic Nigerian taste" ★ "Professional service" ★ "Highly recommended" ★ </span>)}
         </div>
      </div>
      <section className="py-24 bg-brand-black">
        <div className="container mx-auto px-6 text-center">
           <div className="flex flex-col items-center mb-32">
              <span className="text-[150px] font-display font-bold leading-none mb-4">4.8</span>
              <div className="flex text-brand-orange mb-6">
                 {[...Array(5)].map((_, i) => <span key={i}><HiStar size={50} /></span>)}
              </div>
              <p className="text-white/40 font-bold uppercase tracking-[0.3em]">Community Rated Excellence</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-40">
             {loading ? (
               Array(4).fill(0).map((_, i) => (
                 <div key={i} className="bg-white/5 h-[300px] rounded-[60px] animate-pulse" />
               ))
             ) : error ? (
               <div className="col-span-full py-20">
                 <p className="text-white/40">Failed to load reviews</p>
                 <button onClick={() => refetch()} className="text-brand-orange font-bold underline">Try Again</button>
               </div>
             ) : (
               reviews.map((r, i) => (
                 <motion.div key={r.id || `rev-${i}`} whileHover={{ rotateX: 5, rotateY: 5 }} className="bg-white/5 p-16 rounded-[60px] text-left border border-white/5">
                    <div className="flex text-brand-orange mb-10">
                       {[...Array(5)].map((_, j) => <span key={j} className={j >= r.rating ? 'opacity-20' : ''}><HiStar size={24} /></span>)}
                    </div>
                    <p className="text-3xl font-display italic font-light leading-relaxed mb-12">"{r.comment}"</p>
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-full border-2 border-brand-orange flex items-center justify-center bg-brand-orange text-white font-bold text-xl">
                         {r.author.charAt(0)}
                       </div>
                       <div><h4 className="font-bold text-xl">{r.author}</h4><p className="text-white/40">{new Date(r.createdAt).toLocaleDateString()}</p></div>
                    </div>
                 </motion.div>
               ))
             )}
           </div>

           <div className="py-24 border-t border-white/5 text-left">
              <h2 className="text-5xl font-display font-bold mb-12 flex items-center gap-4">Follow us <span className="text-brand-orange"><BsInstagram size={40} /></span> <span className="text-white/20">@cookersdelightgh</span></h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                 {gallery?.slice(0, 6).map((img, i) => (
                   <div key={img.id || `inst-${i}`} className="aspect-square bg-white/5 rounded-3xl overflow-hidden relative group">
                      <img src={getImgUrl(img.url)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-50" alt="" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-brand-orange/60 backdrop-blur-sm">
                         <div className="flex flex-col items-center gap-2"><BsHeartFill size={16} /><span className="text-[10px] font-bold uppercase">Follow</span></div>
                      </div>
                   </div>
                 )) || [...Array(6)].map((_, i) => (
                   <div key={i} className="aspect-square bg-white/5 rounded-3xl animate-pulse" />
                 ))}
              </div>
           </div>
      </div>
    </section>
    </PageWrapper>
  );
};

const ContactPage = ({ addToast }: { addToast: (m: string) => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("Message sent! Opening WhatsApp... ✓");
    setTimeout(() => {
      const formData = new FormData(e.target as HTMLFormElement);
      const message = `Hello! New Contact Request:\nName: ${formData.get('name')}\nEmail: ${formData.get('email')}\nMessage: ${formData.get('message')}`;
      window.open(`https://wa.me/233243379412?text=${encodeURIComponent(message)}`);
    }, 1000);
  };

  return (
    <PageWrapper>
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src={formatImg("/assets/fried rice and kelewala and chicken.jpg", 1920)} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent"></div>
        <h1 className="relative z-10 text-7xl md:text-9xl font-bold">Con<span className="italic font-normal text-brand-orange">tact</span></h1>
      </section>
      <section className="py-24 bg-brand-black">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-12">
            <h2 className="text-8xl font-display font-bold leading-none">Let's <br/><span className="text-brand-orange italic font-normal">Connect.</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: 'WhatsApp', val: 'Chat Online', icon: <BsWhatsapp />, href: 'https://wa.me/233243379412' },
                { label: 'Phone', val: '+233 24 337 9412', icon: <FiPhone />, href: 'tel:+233243379412' },
                { label: 'Instagram', val: '@cookersdelightgh', icon: <BsInstagram />, href: 'https://instagram.com/cookersdelightgh' },
                { label: 'Facebook', val: 'Cookers Delight', icon: <BsFacebook />, href: 'https://facebook.com/cookersdelightgh' }
              ].map(c => (
                <a key={c.label} href={c.href} className="bg-white/5 p-8 rounded-[40px] border border-white/5 hover:border-brand-orange/40 transition-all">
                  <div className="text-brand-orange mb-6">{c.icon}</div>
                  <p className="text-white/40 uppercase text-xs font-bold tracking-widest mb-1">{c.label}</p>
                  <p className="text-xl font-bold">{c.val}</p>
                </a>
              ))}
            </div>
          </div>
          <div className="bg-white/5 p-16 rounded-[60px] border border-white/5">
             <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                   <label className="text-xs uppercase font-bold text-white/40 tracking-widest">Full Name</label>
                   <input required name="name" type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 focus:border-brand-orange outline-none" placeholder="Your Name" />
                </div>
                <div className="space-y-3">
                   <label className="text-xs uppercase font-bold text-white/40 tracking-widest">Email Address</label>
                   <input required name="email" type="email" className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 focus:border-brand-orange outline-none" placeholder="you@example.com" />
                </div>
                <div className="space-y-3">
                   <label className="text-xs uppercase font-bold text-white/40 tracking-widest">Message</label>
                   <textarea required name="message" rows={5} className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 focus:border-brand-orange outline-none resize-none" placeholder="How can we help?"></textarea>
                </div>
                <button type="submit" className="w-full bg-brand-orange text-white py-6 rounded-2xl font-bold text-xl hover:scale-105 transition-all">Send Message</button>
             </form>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

// --- Footer & Global ---

const Footer = ({ setCurrentPage, addToast }: { setCurrentPage: (p: string) => void, addToast: (m: string) => void }) => {
  const [email, setEmail] = useState('');
  
  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    addToast("Subscribed! ✓");
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
              <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-orange transition-all"><BsInstagram /></a>
              <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-orange transition-all"><BsFacebook /></a>
            </div>
          </div>

          <div className="space-y-8">
             <h4 className="text-xl font-bold uppercase text-brand-orange tracking-widest text-xs">Navigation</h4>
             <ul className="space-y-4 font-body text-white/60">
                {['Home', 'Menu', 'Gallery', 'Branches', 'Reviews', 'Contact'].map(l => (
                  <li key={l}><button onClick={() => { setCurrentPage(l); window.scrollTo({ top: 0 }); }} className="hover:text-brand-orange transition-colors">{l}</button></li>
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
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Your email" className="bg-transparent flex-1 px-4 py-3 outline-none text-sm" />
                <button type="submit" className="bg-brand-orange text-white px-6 py-3 rounded-xl font-bold text-sm">Join</button>
             </form>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:row-reverse md:flex-row justify-between items-center gap-6 text-white/20 text-xs font-bold uppercase tracking-widest">
           <p>© 2026 Cookers Delight. Accra, Ghana.</p>
           <p className="text-brand-orange">Professional Service Delivery</p>
        </div>
      </div>
    </footer>
  );
};

// --- Main Public Website Component ---

function PublicWebsite() {
  const [currentPage, setCurrentPage] = useState('Home');
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => { clearTimeout(timer); window.removeEventListener('scroll', handleScroll); };
  }, []);

  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type: 'success' }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Home': return <Home setCurrentPage={setCurrentPage} addToast={addToast} />;
      case 'Menu': return <MenuPage addToast={addToast} cart={cart} setCart={setCart} />;
      case 'Gallery': return <GalleryPage />;
      case 'Branches': return <BranchesPage />;
      case 'Reviews': return <ReviewsPage />;
      case 'Contact': return <ContactPage addToast={addToast} />;
      default: return <Home setCurrentPage={setCurrentPage} addToast={addToast} />;
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-brand-black text-white selection:bg-brand-orange/30">
      <PWAUpdateBanner />
      <CustomCursor />
      <AnnouncementBar />
      
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loader"
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-brand-black flex flex-col items-center justify-center p-10"
          >
            <motion.h1 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl md:text-8xl font-bold mb-12">
              Cookers <span className="text-brand-orange">Delight</span>
            </motion.h1>
            <div className="w-full max-w-md h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.8 }} className="h-full bg-brand-orange" />
            </div>
          </motion.div>
        ) : (
          <div key="main" className="relative">
            <div className="grain-overlay" />
            
            <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} cartCount={cartCount} />
            
            <AnimatePresence mode="wait">
              <div key={currentPage}>
                {renderPage()}
              </div>
            </AnimatePresence>

            <Footer setCurrentPage={setCurrentPage} addToast={addToast} />

            {/* Global CTA Buttons */}
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

            <Toast toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main App Router ---

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <CustomerProvider>
            <ToastProvider>
              <Toaster position="top-right" />
              <Routes>
                {/* Public Website */}
                <Route path="/" element={<PublicWebsite />} />

                {/* Customer Portal */}
                <Route path="/portal/login" element={<CustomerLogin />} />
                <Route path="/portal/register" element={<CustomerRegister />} />
                <Route element={<CustomerProtectedRoute />}>
                  <Route element={<CustomerLayout />}>
                    <Route path="/portal/dashboard" element={<CustomerDashboard />} />
                    <Route path="/portal/order" element={<PlaceOrder />} />
                    <Route path="/portal/orders" element={<OrderHistory />} />
                    <Route path="/portal/orders/:id" element={<OrderDetail />} />
                    <Route path="/portal/profile" element={<CustomerProfile />} />
                    <Route path="/portal/addresses" element={<SavedAddresses />} />
                    <Route path="/portal/reviews" element={<MyReviews />} />
                    <Route path="/portal/notifications" element={<Notifications />} />
                    <Route path="/portal/loyalty" element={<LoyaltyPoints />} />
                    <Route path="/portal/feedback" element={<FeedbackPage />} />
                    <Route path="/portal/*" element={<CustomerDashboard />} />
                  </Route>
                </Route>

                {/* Admin Portal */}
                <Route path="/admin/login" element={<AdminInstallGate />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/menu" element={<MenuManager />} />
                    <Route path="/admin/orders" element={<OrdersManager />} />
                    <Route path="/admin/gallery" element={<GalleryManager />} />
                    <Route path="/admin/branches" element={<BranchesManager />} />
                    <Route path="/admin/reviews" element={<ReviewsManager />} />
                    <Route path="/admin/announcements" element={<AnnouncementsManager />} />
                    <Route path="/admin/settings" element={<Settings />} />
                    <Route path="/admin/customers" element={<CustomersManager />} />
                    <Route path="/admin/feedback" element={<FeedbackManager />} />
                    <Route path="/admin/*" element={<Dashboard />} />
                  </Route>
                </Route>

                {/* Optional: Global 404 redirect to home */}
                <Route path="*" element={<PublicWebsite />} />
              </Routes>
            </ToastProvider>
          </CustomerProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}
