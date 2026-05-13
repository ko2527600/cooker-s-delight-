import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  HiChartBarSquare, HiClipboardDocumentList, HiQrCode,
  HiMapPin, HiBars3, HiXMark, HiCog6Tooth, HiMegaphone,
  HiArrowRightOnRectangle, HiSquares2X2, HiUser, HiTag,
} from 'react-icons/hi2';
import { useAdminAuth } from './AdminAuthContext';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard', icon: <HiChartBarSquare size={18} />, label: 'Dashboard' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/orders',    icon: <HiClipboardDocumentList size={18} />, label: 'Orders' },
      { to: '/admin/tables',    icon: <HiQrCode size={18} />,              label: 'Tables & QR' },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/menu',       icon: <HiSquares2X2 size={18} />,  label: 'Menu Items' },
      { to: '/admin/categories', icon: <HiTag size={18} />,          label: 'Categories' },
    ],
  },
  {
    label: 'Customer',
    items: [
      { to: '/admin/announcements', icon: <HiMegaphone size={18} />, label: 'Announcements' },
      { to: '/admin/locations',     icon: <HiMapPin size={18} />,    label: 'Locations' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/settings', icon: <HiCog6Tooth size={18} />, label: 'Settings' },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-[#EC4824]/15 text-[#EC4824]'
        : 'text-white/45 hover:text-white hover:bg-white/5'
    }`;

  const Sidebar = () => (
    <aside className="w-60 flex-shrink-0 bg-[#0a0a0a] border-r border-white/8 flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/8">
        <span className="text-xl font-black tracking-tight">
          Cookers<span className="text-[#EC4824]">Delight</span>
        </span>
        <p className="text-[10px] text-white/25 uppercase tracking-widest mt-0.5">Admin Console</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map(section => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.15em] px-3 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setSidebarOpen(false)}>
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-[#EC4824]/20 flex items-center justify-center text-[#EC4824]">
            <HiUser size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <HiArrowRightOnRectangle size={18} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-60">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-white/8 flex items-center px-6 gap-4 flex-shrink-0 bg-[#0a0a0a]">
          <button
            className="lg:hidden text-white/50 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <HiBars3 size={22} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs text-white/30 font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
