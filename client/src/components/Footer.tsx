import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Stethoscope, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();
  const phone = settings.phone || '01643184368';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          {/* Clinic Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold text-white block">
                  {settings.clinicName}
                </span>
                <span className="text-xs text-emerald-400 font-medium">
                  {settings.clinicNameEn || 'Deowan Homeo Clinic'}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {settings.tagline}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>দায়িত্বশীল হোমিওপ্যাথিক পরামর্শ ও স্বাস্থ্যসেবা</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              গুরুত্বপূর্ণ লিংক
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" /> আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" /> সকল সেবাসমূহ
                </Link>
              </li>
              <li>
                <Link to="/consultation" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" /> অনলাইন পরামর্শ ফর্ম
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" /> স্বাস্থ্য ও কেয়ার পণ্য অর্ডার
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" /> কেস স্টাডি ও ফলাফল
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" /> স্বাস্থ্য কথা ও সচেতনতামূলক টিপস
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" /> অর্ডার ট্র্যাকিং
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">যোগাযোগ</h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">হেল্পলাইন ও পরামর্শ:</span>
                  <a href={`tel:${phone}`} className="text-white font-bold hover:text-emerald-400 transition">
                    {phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">সেবার সময়:</span>
                  <span className="text-slate-300">{settings.openingHours}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Location Information */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> চেম্বারের ঠিকানা
            </h4>
            <div className="text-sm space-y-2.5 text-slate-300 leading-relaxed">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="font-bold text-white text-xs block text-emerald-400 mb-1">প্রধান অবস্থান:</span>
                <p className="text-xs">{settings.primaryAddress}</p>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="font-bold text-white text-xs block text-emerald-400 mb-1">অতিরিক্ত অবস্থান বিবরণ:</span>
                <p className="text-xs">{settings.additionalAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer in Footer */}
        <div className="py-6 border-b border-slate-800 text-xs text-slate-400 leading-relaxed">
          <p className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-semibold block mb-1">সতর্কতামূলক বার্তা:</span>
            {settings.medicalDisclaimer}
          </p>
        </div>

        {/* Copyright & Admin Link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {settings.clinicName}। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-slate-400 transition">গোপনীয়তা ও শর্তাবলী</Link>
            <Link to="/admin" className="hover:text-emerald-400 transition font-medium">অ্যাডমিন লগইন</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
