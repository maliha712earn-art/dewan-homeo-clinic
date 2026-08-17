import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <div className="text-7xl font-extrabold text-emerald-600 font-mono">404</div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</h1>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed">
        আপনি যে লিংকটিতে প্রবেশ করার চেষ্টা করছেন তা হয়তো সরানো হয়েছে বা টাইপে ভুল হয়েছে।
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow transition"
        >
          <Home className="w-4 h-4" /> হোমপেজে যান
        </Link>
      </div>
    </div>
  );
};
