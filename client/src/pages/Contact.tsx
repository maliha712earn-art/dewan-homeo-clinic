import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, Send, CheckCircle2, Clock, Mail, Stethoscope, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const Contact: React.FC = () => {
  const { settings } = useSettings();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const phone = settings.phone || '01643184368';
  const whatsapp = settings.whatsapp || '01643184368';
  const whatsappUrl = `https://wa.me/88${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'আসসালামু আলাইকুম, দেওয়ান হোমিও ক্লিনিক সম্পর্কে জানতে যোগাযোগ করছি।'
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      showToast('নাম, মোবাইল নম্বর এবং বার্তা পূরণ করা আবশ্যক।', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        setSubmitted(true);
        showToast('আপনার বার্তা সফলভাবে গৃহীত হয়েছে!', 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'বার্তা পাঠাতে সমস্যা হয়েছে।';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          যোগাযোগ ও অবস্থান
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          আমাদের সাথে যোগাযোগ করুন
        </h1>
        <p className="text-sm text-slate-600">
          যেকোনো অনুসন্ধান বা পরামর্শের জন্য আমাদের হেল্পলাইনে সরাসরি কল করুন অথবা বার্তা পাঠান।
        </p>
      </div>

      {/* Quick Reach Buttons Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Call Now */}
        <a
          href={`tel:${phone}`}
          className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white p-5 rounded-2xl font-bold shadow-md hover:shadow-lg transition active:scale-95"
        >
          <Phone className="w-5 h-5" />
          <div className="text-left">
            <span className="text-xs block font-normal opacity-90">সরাসরি কল করুন</span>
            <span className="text-base sm:text-lg">{phone}</span>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-5 rounded-2xl font-bold shadow-md hover:shadow-lg transition active:scale-95"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
          <div className="text-left">
            <span className="text-xs block font-normal opacity-90">হোয়াটসঅ্যাপ মেসেজ</span>
            <span className="text-base sm:text-lg">{whatsapp}</span>
          </div>
        </a>

        {/* Online Consultation CTA */}
        <Link
          to="/consultation"
          className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white p-5 rounded-2xl font-bold shadow-md hover:shadow-lg transition active:scale-95"
        >
          <Stethoscope className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <span className="text-xs block font-normal opacity-90">অনলাইন সেবা</span>
            <span className="text-base sm:text-lg">পরামর্শ ফর্ম</span>
          </div>
        </Link>
      </div>

      {/* Main Grid: Form + Address Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">বার্তা বা প্রশ্ন পাঠান</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              নিচের ফর্মটি পূরণ করে আপনার বার্তা পাঠালে আমরা দ্রুত যোগাযোগ করব।
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে</h3>
              <p className="text-xs text-slate-600">আমাদের ক্লিনিক প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।</p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
                }}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                আরেকটি বার্তা পাঠান
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  আপনার নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    মোবাইল নম্বর <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    ইমেইল (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  বিষয় (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="যেমন: পরামর্শ ফি বা অ্যাপয়েন্টমেন্ট অনুসন্ধান"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  বার্তা / প্রশ্ন <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="আপনার প্রশ্ন বিস্তারিত লিখুন..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm shadow transition active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>বার্তা প্রেরণ করুন</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Clinic Address & Hours */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
              ক্লিনিকের ঠিকানা ও সময়
            </h3>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-xs block mb-0.5 text-emerald-400">
                    মূল ঠিকানা:
                  </span>
                  <p className="leading-relaxed">{settings.primaryAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-xs block mb-0.5 text-emerald-400">
                    দিকনির্দেশনা:
                  </span>
                  <p className="leading-relaxed">{settings.additionalAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-xs block mb-0.5 text-emerald-400">
                    সেবার সময়সূচি:
                  </span>
                  <p className="leading-relaxed">{settings.openingHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-xs block mb-0.5 text-emerald-400">
                    হেল্পলাইন নম্বর:
                  </span>
                  <a href={`tel:${phone}`} className="text-white font-bold text-base hover:underline">
                    {phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
