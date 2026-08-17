import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ text?: string; className?: string }> = ({
  text = 'লোড হচ্ছে...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 text-slate-500 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200">
      {icon && <div className="mb-4 text-slate-400 p-4 bg-slate-50 rounded-full">{icon}</div>}
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-md mb-5 leading-relaxed">{description}</p>}
      {action}
    </div>
  );
};
