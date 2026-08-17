import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Phone, ShoppingCart, User, Menu, X, Stethoscope } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { settings } = useSettings();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phone = settings.phone || '01643184368';

  const navLinks = [
    { name: 'হোম', path: '/' },
    { name: 'আমাদের সম্পর্কে', path: '/about' },
    { name: 'সেবা', path: '/services' },
    { name: 'অনলাইন পরামর্শ', path: '/consultation' },
    { name: 'অর্ডার', path: '/shop' },
    { name: 'কেস স্টাডি', path: '/gallery' },
    { name: 'স্বাস্থ্য কথা', path: '/blog' },
    { name: 'যোগাযোগ', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Notification / Hotline Bar */}
      <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{settings.tagline || 'বিশ্বস্ত পরামর্শ, যত্ন ও সেবায় আপনার পাশে'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>ক্লিনিক সময়: {settings.openingHours}</span>
            <a href={`tel:${phone}`} className="font-bold hover:underline flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> {phone}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo / Brand Name */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-bold text-slate-900 leading-tight">
                {settings.clinicName}
              </span>
              <span className="text-[11px] sm:text-xs text-emerald-700 font-medium">
                {settings.clinicNameEn || 'Deowan Homeo Clinic'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50 font-bold'
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Action Buttons: Call, Cart, Account */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Prominent Call Button */}
            <a
              href={`tel:${phone}`}
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow transition active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>📞 কল করুন</span>
            </a>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition"
              title="শপিং কার্ট"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Customer Account / Login */}
            {user ? (
              <Link
                to="/account"
                className="flex items-center gap-1.5 p-2 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-xl text-sm font-medium transition"
                title="আমার একাউন্ট"
              >
                <User className="w-5 h-5 text-emerald-700" />
                <span className="hidden md:inline font-bold">{user.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
              >
                <User className="w-4 h-4" />
                <span>লগইন</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-xl animate-fade-in">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-base font-medium ${
                  isActive ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2">
            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm"
            >
              <Phone className="w-4 h-4" /> 📞 সরাসরি কল করুন ({phone})
            </a>
            {!user ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full border border-slate-200 text-slate-800 py-2.5 rounded-xl font-bold text-sm"
              >
                <User className="w-4 h-4" /> অ্যাকাউন্ট লগইন / রেজিস্টার
              </Link>
            ) : (
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-800 py-2.5 rounded-xl font-bold text-sm"
              >
                <User className="w-4 h-4" /> আমার ড্যাশবোর্ড ও অর্ডার
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
