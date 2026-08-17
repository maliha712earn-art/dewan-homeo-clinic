import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ArrowRight, ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Service } from '../types';
import { ServiceCard } from '../components/ServiceCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';
import { useSettings } from '../context/SettingsContext';

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const phone = settings.phone || '01643184368';

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        if (res.data.success) {
          setServices(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          আমাদের সেবাসমূহ
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
          হোমিওপ্যাথিক পরামর্শ ও বিশেষায়িত সেবা
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          আপনার সমস্যা মনোযোগ দিয়ে শুনে প্রয়োজনীয় তথ্যের ভিত্তিতে উপযুক্ত পরামর্শ ও নিয়মিত ফলো-আপ সেবা প্রদান করা হয়।
        </p>
      </div>

      {/* Services Grid */}
      {loading ? (
        <LoadingSpinner text="সেবাসমূহ লোড হচ্ছে..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {/* Consultation Banner */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold text-slate-900">
            ব্যক্তিগত পরামর্শের জন্য অনলাইনে তথ্য পাঠান
          </h3>
          <p className="text-sm text-slate-600 max-w-xl">
            অনলাইন ফর্ম পূরণ করে সহজেই আপনার শারীরিক ও ত্বকের সমস্যার কথা আমাদের জানাতে পারেন।
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/consultation"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow transition"
          >
            <span>পরামর্শের ফর্ম পূরণ করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-2 bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 px-5 py-3.5 rounded-xl font-bold text-sm transition"
          >
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>📞 কল করুন</span>
          </a>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
