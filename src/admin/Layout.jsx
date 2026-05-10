import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  HiOutlineSquares2X2, HiOutlineRectangleGroup, HiOutlinePhoto, 
  HiOutlineMapPin, HiOutlineMegaphone, HiOutlineShoppingBag, 
  HiOutlineStar, HiOutlineCog6Tooth, HiBars3, HiXMark, HiBell,
  HiOutlineArrowRightOnRectangle, HiOutlineUsers, HiOutlineChatBubbleLeftRight
} from "react-icons/hi2";
import { useAuth } from "./AuthContext";
import api from "../api/axios";

const SidebarItem = ({ icon: Icon, label, path, active, badge, badgeColor, onClick }) => (
  <motion.div
    initial={{ x: -10, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ type: "spring", damping: 20, stiffness: 100 }}
  >
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all ${
        active 
          ? 'text-[#EC4824] bg-[#EC4824]/10 border-l-[3px] border-[#EC4824] pl-[21px]' 
          : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
      {badge > 0 && (
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
          badgeColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {badge}
        </span>
      )}
    </Link>
  </motion.div>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Stats placeholders (real implementation would fetch these)
  const [pendingOrders, setPendingOrders] = useState(3);
  const [unapprovedReviews, setUnapprovedReviews] = useState(5);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [newFeedback, setNewFeedback] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/analytics/summary");
      setPendingOrders(res.data.pendingOrders || 0);
      setUnapprovedReviews(res.data.unapprovedReviews || 0);
      setTotalCustomers(res.data.totalCustomers || 0);
      setNewFeedback(res.data.newFeedback || 0);
    } catch (err) {
      console.error("Failed to fetch sidebar stats");
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Switch manifest for admin PWA
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      manifestLink.href = "/admin-manifest.json";
    }
    return () => {
      // Restore customer manifest when leaving admin
      if (manifestLink) {
        manifestLink.href = "/manifest.json";
      }
    };
  }, []);

  const formatTime = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} · ${date.toLocaleTimeString([], { hour12: false })}`;
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('menu')) return 'Menu Manager';
    if (path.includes('gallery')) return 'Gallery Assets';
    if (path.includes('branches')) return 'Branch Locations';
    if (path.includes('orders')) return 'Order Management';
    if (path.includes('reviews')) return 'Customer Reviews';
    if (path.includes('announcements')) return 'Global Announcements';
    if (path.includes('settings')) return 'System Settings';
    return 'Admin Panel';
  };

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Dashboard", path: "/admin/dashboard", icon: HiOutlineSquares2X2 }
      ]
    },
    {
      title: "CONTENT",
      items: [
        { label: "Menu Manager", path: "/admin/menu", icon: HiOutlineRectangleGroup },
        { label: "Gallery", path: "/admin/gallery", icon: HiOutlinePhoto },
        { label: "Branches", path: "/admin/branches", icon: HiOutlineMapPin },
        { label: "Announcements", path: "/admin/announcements", icon: HiOutlineMegaphone }
      ]
    },
    {
      title: "BUSINESS",
      items: [
        { label: "Orders", path: "/admin/orders", icon: HiOutlineShoppingBag, badge: pendingOrders, badgeColor: 'yellow' },
        { label: "Reviews", path: "/admin/reviews", icon: HiOutlineStar, badge: unapprovedReviews, badgeColor: 'red' },
        { label: "Customers", path: "/admin/customers", icon: HiOutlineUsers, badge: totalCustomers, badgeColor: 'yellow' },
        { label: "Feedback", path: "/admin/feedback", icon: HiOutlineChatBubbleLeftRight, badge: newFeedback, badgeColor: 'red' }
      ]
    },
    {
      title: "SETTINGS",
      items: [
        { label: "Settings", path: "/admin/settings", icon: HiOutlineCog6Tooth }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] font-body selection:bg-[#EC4824]/20">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isMobileMenuOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0) }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-[280px] bg-[#111] border-r border-white/5 z-[101] flex flex-col"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-[#EC4824] flex items-center justify-center text-white font-bold font-display">C</div>
             <h1 className="font-display text-2xl font-bold text-white">Cookers <span className="text-[#EC4824]">Delight</span></h1>
          </div>
          <span className="inline-block bg-[#EC4824]/15 text-[#EC4824] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Admin Portal</span>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-4">
          {navSections.map((section, idx) => (
            <div key={section.title} className="mb-6">
              <p className="text-[10px] uppercase tracking-widest text-white/20 px-6 mb-2 mt-6">{section.title}</p>
              <div className="space-y-1">
                {section.items.map((item, i) => (
                  <SidebarItem 
                    key={item.label} 
                    {...item} 
                    active={location.pathname === item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#EC4824] flex items-center justify-center text-white font-bold">
               {user?.name?.charAt(0) || 'A'}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin'}</p>
               <p className="text-[10px] text-white/40 truncate">{user?.email || 'admin@cookersdelight.com'}</p>
             </div>
             <button 
               onClick={logout}
               className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
               title="Logout"
             >
               <HiOutlineArrowRightOnRectangle size={20} />
             </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="lg:ml-[280px]">
        {/* Header */}
        <header className="fixed top-0 lg:left-[280px] right-0 h-16 bg-[#111]/95 backdrop-blur-xl border-b border-white/5 z-50 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-white/60 hover:text-white"
            >
              <HiBars3 size={24} />
            </button>
            <h2 className="font-semibold text-white text-lg hidden sm:block">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block text-white/30 text-xs font-mono">
              {formatTime(time)}
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-white/40 hover:text-white transition-colors"
              >
                <HiBell size={22} />
                {pendingOrders > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#EC4824] rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-12 right-0 w-80 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 bg-white/5">
                        <p className="text-xs font-bold text-white uppercase tracking-widest">Recent Orders</p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-sm font-bold text-white">Order #882{i}</p>
                              <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full font-bold uppercase">Pending</span>
                            </div>
                            <p className="text-[10px] text-white/40 font-medium">Customer: John Doe · 10 mins ago</p>
                          </div>
                        ))}
                      </div>
                      <Link to="/admin/orders" onClick={() => setShowNotifications(false)} className="block p-4 text-center text-[10px] font-bold text-[#EC4824] hover:bg-[#EC4824]/5 transition-colors uppercase tracking-widest">
                        View All Orders
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-8 h-8 rounded-full bg-[#EC4824] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/5 hover:ring-[#EC4824]/50 transition-all"
              >
                {user?.name?.charAt(0) || 'A'}
              </button>

              <AnimatePresence>
                {showUserDropdown && (
                  <>
                    <div className="fixed inset-0 z-0" onClick={() => setShowUserDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-12 right-0 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-10 overflow-hidden"
                    >
                      <button 
                        onClick={() => { navigate('/admin/settings'); setShowUserDropdown(false); }}
                        className="w-full px-4 py-3 text-left text-sm text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                      >
                        <HiOutlineCog6Tooth size={18} /> Settings
                      </button>
                      <button 
                        onClick={() => { logout(); setShowUserDropdown(false); }}
                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2 transition-colors border-t border-white/5"
                      >
                        <HiOutlineArrowRightOnRectangle size={18} /> Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="pt-24 p-8 min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
