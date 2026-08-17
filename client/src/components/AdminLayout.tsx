import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Stethoscope,
  Package,
  Layers,
  Sparkles,
  BookOpen,
  MessageSquare,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserCog,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useSettings } from '../context/SettingsContext';

interface Props {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<Props> = ({ children }) => {
  const { admin, logout, isSuperAdmin } = useAdminAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'ড্যাশবোর্ড (Dashboard)', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'অর্ডারসমূহ (Orders)', path: '/admin/orders', icon: ShoppingBag },
    { name: 'অনলাইন পরামর্শ (Consultations)', path: '/admin/consultations', icon: Stethoscope },
    { name: 'পণ্য ব্যবস্থাপনা (Products)', path: '/admin/products', icon: Package },
    { name: 'সেবাসমূহ (Services)', path: '/admin/services', icon: Layers },
    { name: 'কেস স্টাডি (Before/After)', path: '/admin/before-after', icon: Sparkles },
    { name: 'স্বাস্থ্য কথা (Blog)', path: '/admin/blog', icon: BookOpen },
    { name: 'গ্রাহক তালিকা (Customers)', path: '/admin/customers', icon: Users },
    { name: 'মেসেজসমূহ (Messages)', path: '/admin/messages', icon: MessageSquare },
    { name: 'ওয়েবসাইট সেটিংস (Settings)', path: '/admin/settings', icon: Settings },
    ...(isSuperAdmin
      ? [
          { name: 'অ্যাডমিন ইউজার (Admin Users)', path: '/admin/users', icon: UserCog },
          { name: 'অডিট লগ (Audit Logs)', path: '/admin/audit-logs', icon: ShieldAlert },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm">অ্যাডমিন প্যানেল | {settings.clinicName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs bg-rose-600/80 hover:bg-rose-600 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium"
        >
          <LogOut className="w-3.5 h-3.5" /> লগআউট
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand header */}
          <div className="h-16 flex items-center justify-between px-6 bg-slate-950/60 border-b border-slate-800">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                DH
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm leading-tight">দেওয়ান হোমিও ক্লিনিক</span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                  অ্যাডমিন কন্ট্রোল
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Admin Badge */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-700/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-xs">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{admin?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{admin?.email}</p>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                {admin?.role}
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="flex-1 truncate">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 shrink-0 opacity-80" />}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col gap-2">
            <Link
              to="/"
              target="_blank"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
              🌐 ওয়েবসাইট দেখুন (Visit Site)
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> লগআউট করুন
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
