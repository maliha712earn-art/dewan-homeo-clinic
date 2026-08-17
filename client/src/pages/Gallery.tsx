import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Filter, ArrowRight, RotateCcw, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BeforeAfterCase } from '../types';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const Gallery: React.FC = () => {
  const [cases, setCases] = useState<BeforeAfterCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/before-after';
      if (selectedCategory !== 'ALL') {
        url += `?category=${encodeURIComponent(selectedCategory)}`;
      }
      const res = await api.get(url);
      if (res.data.success) {
        setCases(res.data.data || []);
      } else {
        setError(res.data.message || 'কেস স্টাডি লোড করা যায়নি।');
      }
    } catch (err: any) {
      console.error('Failed to load before/after cases:', err);
      setError(err.response?.data?.message || 'সার্ভার থেকে কেস স্টাডি তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [selectedCategory]);

  const categories = ['ALL', 'ত্বকের সমস্যা', 'চুলের যত্ন', 'সাধারণ স্বাস্থ্য'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
          বাস্তব অভিজ্ঞতা ও ফলাফল
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          রোগীদের যত্ন ও উন্নতির কেস স্টাডি (গ্যালারি)
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          হোমিওপ্যাথিক পরামর্শ ও নিয়মিত যত্নের মাধ্যমে রোগীদের শারীরিক ও ত্বকের উন্নতির নির্ভরযোগ্য দৃষ্টান্ত।
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-emerald-50/90 border border-emerald-200 rounded-3xl p-4 sm:p-5 flex items-start gap-3.5 text-emerald-950 text-xs sm:text-sm shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5 text-emerald-900">রোগীর সম্মতি ও তথ্যের সুরক্ষা:</strong>
          <span className="text-emerald-800 leading-relaxed">
            সকল ছবি ও তথ্য সংশ্লিষ্ট রোগীদের লিখিত/মৌখিক সম্মতিক্রমে এবং পরিচয় অপ্রকাশ্য রেখে শুধুমাত্র সচেতনতা ও শিক্ষামূলক উদ্দেশ্যে প্রদর্শিত হচ্ছে। কোনো অবাস্তব বা শতভাগ নিশ্চয়তামূলক দাবি করা হয় না।
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'সকল কেস স্টাডি' : cat}
          </button>
        ))}
      </div>

      {/* Cases Grid / State Views */}
      {loading ? (
        <LoadingSpinner text="কেস স্টাডি লোড হচ্ছে..." className="min-h-[40vh]" />
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-rose-900">তথ্য লোড করতে সমস্যা হয়েছে</h3>
          <p className="text-xs text-rose-700">{error}</p>
          <button
            onClick={fetchCases}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> পুনরায় চেষ্টা করুন
          </button>
        </div>
      ) : cases.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-12 h-12" />}
          title="বর্তমানে কোনো কেস স্টাডি প্রদর্শিত নেই"
          description="এই ক্যাটাগরিতে নতুন কেস স্টাডি যুক্ত হলে এখানে প্রদর্শিত হবে।"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cases.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-5">
                {/* Images Side-by-Side Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-100 border border-slate-200 shadow-2xs">
                      <img
                        src={c.beforeImage}
                        alt="চিকিৎসার পূর্বে"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                        পূর্বে (Before)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-100 border border-slate-200 shadow-2xs">
                      <img
                        src={c.afterImage}
                        alt="চিকিৎসার পরে"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2.5 left-2.5 bg-emerald-700/90 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
                        পরে (After)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Case Details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      {c.category}
                    </span>
                    {c.durationText && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" /> সময়কাল: {c.durationText}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {c.titleBn}
                  </h3>

                  {c.descriptionBn && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {c.descriptionBn}
                    </p>
                  )}
                </div>
              </div>

              {/* Consultation CTA Link */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">আপনারও কি এই ধরণের সমস্যা?</span>
                <Link
                  to="/consultation"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  পরামর্শ নিন <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <h3 className="text-xl sm:text-2xl font-extrabold">আপনার শারীরিক সমস্যা নিয়ে দ্বিধায় আছেন?</h3>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            দেওয়ান হোমিও ক্লিনিকে আপনার শারীরিক বা ত্বকের সমস্যা বিস্তারিত লিখে জানান। আমাদের অভিজ্ঞ চিকিৎসক আপনার অবস্থা পর্যালোচনা করে উপযুক্ত পরামর্শ প্রদান করবেন।
          </p>
        </div>
        <Link
          to="/consultation"
          className="mt-5 sm:mt-0 inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-900 px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-md transition whitespace-nowrap"
        >
          অনলাইন পরামর্শ শুরু করুন
        </Link>
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
