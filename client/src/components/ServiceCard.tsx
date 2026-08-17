import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { Service } from '../types';

interface Props {
  service: Service;
}

export const ServiceCard: React.FC<Props> = ({ service }) => {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/80 p-6 hover:border-emerald-300 hover:shadow-clinic-lg transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100/80">
        <Stethoscope className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
        {service.titleBn}
      </h3>

      <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">
        {service.descriptionBn}
      </p>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
        {service.price !== null && service.price !== undefined && service.price > 0 ? (
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            ফি: ৳{service.price}
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
            পরামর্শ সেবা
          </span>
        )}

        <Link
          to="/consultation"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          অনুরোধ পাঠান <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
