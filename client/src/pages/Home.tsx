import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  MessageCircle,
  Stethoscope,
  ShieldCheck,
  HeartHandshake,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { Product, Service, Article, BeforeAfterCase } from '../types';
import { useSettings } from '../context/SettingsContext';
import { ProductCard } from '../components/ProductCard';
import { ServiceCard } from '../components/ServiceCard';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const Home: React.FC = () => {
  const { settings } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [cases, setCases] = useState<BeforeAfterCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, svcRes, artRes, caseRes] = await Promise.all([
          api.get('/products?featured=true&limit=4'),
          api.get('/services'),
          api.get('/articles?limit=3'),
          api.get('/before-after'),
        ]);

        if (prodRes.data.success) setFeaturedProducts(prodRes.data.data.products);
        if (svcRes.data.success) setServices(svcRes.data.data);
        if (artRes.data.success) setArticles(artRes.data.data.articles);
        if (caseRes.data.success) setCases(caseRes.data.data.slice(0, 2));
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const phone = settings.phone || '01643184368';
  const whatsapp = settings.whatsapp || '01643184368';
  const whatsappUrl = `https://wa.me/88${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'আসসালামু আলাইকুম, দেওয়ান হোমিও ক্লিনিক থেকে পরামর্শ পেতে যোগাযোগ করছি।'
  )}`;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-slate-50 pt-8 sm:pt-14 pb-12 sm:pb-20 border-b border-emerald-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>ব্যক্তিকেন্দ্রিক হোমিওপ্যাথিক পরামর্শ ও স্বাস্থ্যসেবা</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {settings.heroTitle || 'দেওয়ান হোমিও ক্লিনিকে স্বাগতম'}
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-800 leading-snug">
                "{settings.heroSubtitle || 'বিশ্বস্ত পরামর্শ, যত্ন ও সেবায় আপনার পাশে'}"
              </p>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {settings.heroDescription ||
                  'হোমিওপ্যাথিক চিকিৎসা ও স্বাস্থ্যসেবা সম্পর্কে পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন।'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link
                  to="/consultation"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                >
                  <CalendarCheck className="w-5 h-5" />
                  <span>অনলাইন পরামর্শ নিন</span>
                </Link>

                <Link
                  to="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all duration-200"
                >
                  <ShoppingBag className="w-5 h-5 text-emerald-700" />
                  <span>অর্ডার করুন</span>
                </Link>

                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-5 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>যোগাযোগ করুন</span>
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-3 text-left">
                <div className="bg-white/80 p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="block text-emerald-700 font-bold text-base sm:text-lg">১০০%</span>
                  <span className="text-[11px] sm:text-xs text-slate-600">আন্তরিক পরামর্শ</span>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="block text-emerald-700 font-bold text-base sm:text-lg">Follow-up</span>
                  <span className="text-[11px] sm:text-xs text-slate-600">নিয়মিত যত্ন</span>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="block text-emerald-700 font-bold text-base sm:text-lg">সারাদেশে</span>
                  <span className="text-[11px] sm:text-xs text-slate-600">হোম ডেলিভারি</span>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Banner */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-clinic-lg border border-emerald-100 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">জরুরি পরামর্শ ও তথ্য</h2>
                    <p className="text-xs text-emerald-700 font-medium">সরাসরি ক্লিনিকে কথা বলুন</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-600 text-xs sm:text-sm">📞 হেল্পলাইন:</span>
                    <a href={`tel:${phone}`} className="font-bold text-emerald-800 hover:underline">
                      {phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-600 text-xs sm:text-sm">💬 হোয়াটসঅ্যাপ:</span>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#128C7E] hover:underline"
                    >
                      {whatsapp}
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-600 text-xs sm:text-sm">⏰ সেবার সময়:</span>
                    <span className="font-medium text-slate-800 text-xs sm:text-sm">{settings.openingHours}</span>
                  </div>
                </div>

                <Link
                  to="/consultation"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm shadow transition active:scale-95"
                >
                  <span>অনলাইনে সমস্যার বিবরণ দিন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT CLINIC SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                আমাদের পরিচিতি
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                দেওয়ান হোমিও ক্লিনিক সম্পর্কে
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {settings.aboutText}
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-bold text-sm"
                >
                  <span>বিস্তারিত আমাদের সম্পর্কে জানুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                <HeartHandshake className="w-7 h-7 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">মনোযোগ সহকারে শোনা</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  আমরা রোগীর সমস্যার প্রতিটি দিক গুরুত্ব দিয়ে শুনে তথ্যের ভিত্তিতে ব্যক্তিকেন্দ্রিক পরামর্শ প্রদান করি।
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                <ShieldCheck className="w-7 h-7 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">দায়িত্বশীল স্বাস্থ্যসেবা</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  অতিরঞ্জিত কোনো অবৈজ্ঞানিক দাবি ছাড়াই সঠিক জীবনযাপন ও হোমিওপ্যাথিক দিকনির্দেশনা প্রদান।
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                <Clock className="w-7 h-7 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">নিয়মিত Follow-up</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  পরামর্শ ও যত্ন গ্রহণের পর প্রয়োজন অনুযায়ী নিয়মিত যোগাযোগ ও রোগীর অবস্থার আপডেট নেওয়া হয়।
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                <Sparkles className="w-7 h-7 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">স্বাস্থ্য ও ত্বকের সচেতনতা</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  বিভিন্ন সমস্যা সম্পর্কে রোগীদেরকে সচেতনতামূলক সঠিক তথ্য ও প্রতিরোধমূলক উপায় জানানো হয়।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR SERVICES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            আমাদের সেবাসমূহ
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            হোমিওপ্যাথিক পরামর্শ ও বিশেষায়িত সেবা
          </h2>
          <p className="text-sm text-slate-600">
            রোগীদের প্রয়োজন অনুযায়ী আন্তরিক ও দায়িত্বশীল সেবা প্রদানে আমরা অঙ্গীকারবদ্ধ।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow transition"
          >
            <span>সকল সেবা বিস্তারিত দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. ONLINE CONSULTATION TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl text-white p-8 sm:p-12 shadow-clinic-lg overflow-hidden relative">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="bg-emerald-700/80 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full border border-emerald-600/60">
              অনলাইন পরামর্শ সেবা
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              ঘরে বসেই আপনার সমস্যার বিবরণ দিয়ে পরামর্শের অনুরোধ পাঠান
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              ক্লিনিকে সরাসরি আসতে সমস্যা হলে আমাদের অনলাইন পরামর্শ ফর্মের মাধ্যমে বয়স, লক্ষণ ও সমস্যার স্থায়িত্ব জানিয়ে তথ্য পাঠান। প্রয়োজনীয় তথ্যের ভিত্তিতে আমাদের ক্লিনিক থেকে আপনার সাথে যোগাযোগ করা হবে।
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Link
                to="/consultation"
                className="bg-white text-emerald-900 hover:bg-emerald-50 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md transition active:scale-95"
              >
                অনলাইন পরামর্শ ফর্ম পূরণ করুন
              </Link>
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 text-white border border-emerald-400/40 hover:bg-emerald-800/60 px-5 py-3.5 rounded-xl font-bold text-sm transition"
              >
                <Phone className="w-4 h-4" /> সরাসরি কল করুন ({phone})
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS AVAILABLE FOR ORDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              অর্ডার করুন
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              স্বাস্থ্য ও ত্বকের যত্ন সহায়ক পণ্য
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধায় সরাসরি হোম ডেলিভারি।
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
          >
            <span>সকল পণ্য দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. BEFORE & AFTER GALLERY PREVIEW */}
      {cases.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                বাস্তব অভিজ্ঞতা
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                রোগীদের যত্ন ও উন্নতির কেস স্টাডি
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                রোগীর পূর্ণ সম্মতি ও গোপনীয়তা বজায় রেখে প্রকাশিত ফলাফল।
              </p>
            </div>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
            >
              <span>সকল কেস স্টাডি দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cases.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:border-emerald-300 transition"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-100">
                    <img src={c.beforeImage} alt="আগে" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                      আগে
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden aspect-square bg-slate-100">
                    <img src={c.afterImage} alt="পরে" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-emerald-700 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                      পরে {c.durationText && `(${c.durationText})`}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {c.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1.5">{c.titleBn}</h3>
                  {c.descriptionBn && (
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {c.descriptionBn}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. HEALTH ARTICLES (স্বাস্থ্য কথা) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              স্বাস্থ্য কথা
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              স্বাস্থ্য ও ত্বক সচেতনতামূলক নিবন্ধ
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              রোগ প্রতিরোধ ও সুস্থতায় সহায়ক বিজ্ঞানসম্মত তথ্য ও পরামর্শ।
            </p>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
          >
            <span>সকল নিবন্ধ পড়ুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <article
              key={art.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-emerald-300 hover:shadow-clinic-lg transition flex flex-col"
            >
              {art.coverImage && (
                <Link to={`/blog/${art.slug}`} className="aspect-video block overflow-hidden bg-slate-100">
                  <img
                    src={art.coverImage}
                    alt={art.titleBn}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <span className="text-[11px] font-semibold text-emerald-700 mb-1.5">
                  {art.category?.nameBn || 'স্বাস্থ্য পরামর্শ'}
                </span>
                <Link
                  to={`/blog/${art.slug}`}
                  className="font-bold text-slate-900 text-base leading-snug hover:text-emerald-700 transition line-clamp-2 mb-2"
                >
                  {art.titleBn}
                </Link>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed flex-1">
                  {art.excerptBn || art.excerpt}
                </p>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{art.author}</span>
                  <Link
                    to={`/blog/${art.slug}`}
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    পড়ুন <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 8. WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">আমাদের প্রতিশ্রুতি</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">কেন দেওয়ান হোমিও ক্লিনিক বেছে নেবেন?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                ০১
              </div>
              <h3 className="font-bold text-lg text-white">ব্যক্তিকেন্দ্রিক চিকিৎসা</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                প্রতিটি রোগীর লক্ষণ ও শারীরিক গঠন অনুযায়ী আলাদা বিবেচনা ও যত্ন নেওয়া হয়।
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                ০২
              </div>
              <h3 className="font-bold text-lg text-white">কোনো অবৈজ্ঞানিক বা চটকদার দাবি নেই</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                ১০০% গ্যারান্টি বা জাদুকরী কোনো দাবি না করে বাস্তবিক ও বিজ্ঞানসম্মত হোমিওপ্যাথি পরামর্শ প্রদান।
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                ০৩
              </div>
              <h3 className="font-bold text-lg text-white">সরাসরি যোগাযোগ ও Follow-up</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                ক্লিনিক বা অনলাইন উভয় মাধ্যমেই নিয়মিত যোগাযোগ বজায় রেখে রোগীকে পূর্ণ সহযোগিতা করা হয়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. LOCATION & CLINIC ADDRESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                চেম্বারের অবস্থান
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                সরাসরি ক্লিনিকে আসার ঠিকানা
              </h2>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">মূল ঠিকানা:</span>
                    <p className="text-sm text-slate-700 leading-relaxed">{settings.primaryAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">সহজ দিকনির্দেশনা:</span>
                    <p className="text-sm text-slate-700 leading-relaxed">{settings.additionalAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-emerald-900 text-sm">
                  <Phone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">আসার আগে অ্যাপয়েন্টমেন্ট বা যোগাযোগ:</span>
                    <a href={`tel:${phone}`} className="font-bold text-base hover:underline">
                      {phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              {settings.googleMapsEmbedUrl ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-video shadow-sm">
                  <iframe
                    src={settings.googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    title="Clinic Map"
                  />
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{settings.clinicName}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
                    {settings.primaryAddress}
                    <br />
                    {settings.additionalAddress}
                  </p>
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> 📞 হেল্পলাইনে দিকনির্দেশনা নিন
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10. MEDICAL DISCLAIMER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MedicalDisclaimer />
      </section>
    </div>
  );
};
