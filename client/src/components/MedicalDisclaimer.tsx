import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface Props {
  className?: string;
}

export const MedicalDisclaimer: React.FC<Props> = ({ className = '' }) => {
  const { settings } = useSettings();

  return (
    <div className={`bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-900 ${className}`}>
      <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0 mt-0.5" />
      <div className="text-xs sm:text-sm leading-relaxed">
        <span className="font-semibold block mb-0.5 text-amber-950">চিকিৎসা সংক্রান্ত সতর্কতা ও ডিসক্লেইমার:</span>
        {settings.medicalDisclaimer}
      </div>
    </div>
  );
};
