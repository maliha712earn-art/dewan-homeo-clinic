import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ShieldCheck, HeartHandshake, MapPin, Phone, MessageCircle, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const About: React.FC = () => {
  const { settings } = useSettings();
  const phone = settings.phone || '01643184368';
  const whatsapp = settings.whatsapp || '01643184368';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          আমাদের দর্শন ও পরিচিতি
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
          {settings.clinicName} সম্পর্কে
        </h1>
        <p className="text-base sm:text-lg text-emerald-800 font-semibold">
          "{settings.tagline}"
        </p>
      </div>

      {/* Main Philosophy Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-12 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">আমাদের লক্ষ্য ও সেবা দর্শন</h2>
            <p className="text-xs text-emerald-700 font-medium">{settings.clinicNameEn}</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 text-base leading-relaxed space-y-4">
          <p className="text-lg font-medium text-slate-800 leading-relaxed bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
            {settings.aboutText}
          </p>

          <h3 className="text-lg font-bold text-slate-900 pt-4">আমাদের মূল নীতিমালা:</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
            <li className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 text-sm">দায়িত্বশীল হোমিওপ্যাথিক যত্ন:</strong>
                <span className="text-xs text-slate-600 leading-relaxed">
                  রোগীর প্রতিটি লক্ষণ সতর্কতার সাথে মূল্যায়ন করে ব্যক্তিগত পরামর্শ প্রদান করা হয়।
                </span>
              </div>
            </li>

            <li className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <HeartHandshake className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 text-sm">কোনো অবাস্তব প্রতিশ্রুতি নয়:</strong>
                <span className="text-xs text-slate-600 leading-relaxed">
                  আমরা জাদুকরী কোনো দাবি করি না; রোগীর বাস্তবতা মেনে সঠিক দিকনির্দেশনা দিই।
                </span>
              </div>
            </li>

            <li className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Stethoscope className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 text-sm">সচেতনতা সৃষ্টি:</strong>
                <span className="text-xs text-slate-600 leading-relaxed">
                  রোগীদের রোগ ও ত্বকের সঠিক পরিচর্যা সম্পর্কে শিক্ষামূলক তথ্য জানানো আমাদের অগ্রাধিকার।
                </span>
              </div>
            </li>

            <li className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 text-sm">সহজ যোগাযোগ:</strong>
                <span className="text-xs text-slate-600 leading-relaxed">
                  চেম্বারে আগমন বা অনলাইনের মাধ্যমে রোগীর সাথে নিয়মিত যোগাযোগ বজায় রাখা হয়।
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Location Details Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-emerald-400" />
          <h3 className="text-xl font-bold">ক্লিনিকের বিস্তারিত অবস্থান</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
            <span className="font-bold text-emerald-400 text-sm block">মূল ঠিকানা:</span>
            <p className="leading-relaxed">{settings.primaryAddress}</p>
          </div>
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
            <span className="font-bold text-emerald-400 text-sm block">সহজ দিকনির্দেশনা:</span>
            <p className="leading-relaxed">{settings.additionalAddress}</p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center gap-4">
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow transition"
          >
            <Phone className="w-4 h-4" /> 📞 সরাসরি কল করুন ({phone})
          </a>
          <Link
            to="/consultation"
            className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-5 py-3 rounded-xl font-bold text-sm shadow transition"
          >
            <span>অনলাইন পরামর্শ অনুরোধ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
