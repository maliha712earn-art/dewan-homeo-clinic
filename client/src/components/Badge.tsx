import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (st: string) => {
    switch (st.toUpperCase()) {
      case 'PENDING':
      case 'NEW':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONFIRMED':
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROCESSING':
      case 'IN_PROGRESS':
      case 'CONTACTED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED':
      case 'COMPLETED':
      case 'PAID':
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
      case 'FAILED':
      case 'INACTIVE':
      case 'OUT_OF_STOCK':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabelBn = (st: string) => {
    switch (st) {
      case 'Pending':
      case 'NEW':
        return 'পেন্ডিং (অপেক্ষমান)';
      case 'Confirmed':
      case 'REVIEWED':
        return 'কনফার্মড (যাচাইকৃত)';
      case 'Processing':
      case 'IN_PROGRESS':
        return 'প্রসেসিং';
      case 'Contacted':
      case 'CONTACTED':
        return 'যোগাযোগ সম্পন্ন';
      case 'Shipped':
        return 'ডেলিভারিতে প্রেরিত';
      case 'Delivered':
      case 'COMPLETED':
        return 'সম্পন্ন (ডেলিভার্ড)';
      case 'Cancelled':
      case 'CANCELLED':
        return 'বাতিল';
      case 'ACTIVE':
        return 'সক্রিয়';
      case 'INACTIVE':
        return 'নিষ্ক্রিয়';
      case 'OUT_OF_STOCK':
        return 'স্টক আউট';
      default:
        return st;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(status)} ${className}`}>
      {getStatusLabelBn(status)}
    </span>
  );
};
