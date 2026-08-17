import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, CheckCircle2, Clock, Truck, ShieldAlert, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';
import { StatusBadge } from '../components/Badge';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';

export const TrackOrder: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrder = async (ordNum: string, ph?: string) => {
    if (!ordNum.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      let url = `/orders/track/${encodeURIComponent(ordNum.trim())}`;
      if (ph?.trim()) url += `?phone=${encodeURIComponent(ph.trim())}`;

      const res = await api.get(url);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err: any) {
      setOrder(null);
      setErrorMsg(err.response?.data?.message || 'উক্ত নম্বর দিয়ে কোনো অর্ডার পাওয়া যায়নি।');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    const newParams = new URLSearchParams();
    newParams.set('orderNumber', orderNumber.trim());
    setSearchParams(newParams);
    fetchOrder(orderNumber, phone);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          অর্ডার ট্র্যাকিং
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          আপনার অর্ডার ট্র্যাক করুন
        </h1>
        <p className="text-sm text-slate-600">
          আপনার অর্ডার আইডি (যেমন: DH-2026-00001) দিয়ে বর্তমান ডেলিভারি স্ট্যাটাস দেখুন।
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              অর্ডার নম্বর (Order ID) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="যেমন: DH-2026-00001"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              মোবাইল নম্বর (ঐচ্ছিক)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-sm shadow transition"
        >
          <Search className="w-4 h-4" />
          <span>অর্ডার খুঁজুন ও স্ট্যাটাস দেখুন</span>
        </button>
      </form>

      {/* Result Display */}
      {loading ? (
        <LoadingSpinner text="অর্ডার তথ্য যাচাই হচ্ছে..." />
      ) : order ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <span className="text-xs text-slate-400 font-bold block uppercase">অর্ডার আইডি:</span>
              <span className="text-xl font-mono font-extrabold text-slate-900">{order.orderNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">বর্তমান স্ট্যাটাস:</span>
              <StatusBadge status={order.orderStatus} />
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="font-bold text-slate-900 block mb-1">গ্রাহকের তথ্য:</span>
              <p className="text-slate-700">নাম: {order.customerName}</p>
              <p className="text-slate-700">মোবাইল: {order.phone}</p>
            </div>
            <div>
              <span className="font-bold text-slate-900 block mb-1">ডেলিভারি ঠিকানা:</span>
              <p className="text-slate-700">{order.deliveryAddress}</p>
              {order.district && <p className="text-slate-700">জেলা: {order.district}</p>}
            </div>
          </div>

          {/* Items Summary */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                অর্ডারের পণ্যসমূহ ({order.items.length}টি):
              </h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {order.items.map((it, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs sm:text-sm bg-white">
                    <div>
                      <p className="font-bold text-slate-900">{it.productName}</p>
                      <span className="text-slate-500 text-xs">পরিমাণ: {it.quantity} × ৳{it.price}</span>
                    </div>
                    <span className="font-bold text-slate-800">৳{it.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Total */}
          <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline text-sm">
            <span className="text-slate-600">সর্বমোট পরিশোধযোগ্য (ক্যাশ অন ডেলিভারি):</span>
            <span className="text-xl font-bold text-emerald-800">৳{order.totalAmount}</span>
          </div>

          {/* Status Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                অর্ডার অগ্রগতি হিস্ট্রি:
              </h3>
              <div className="space-y-3">
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{h.status}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(h.createdAt).toLocaleDateString('bn-BD')} {new Date(h.createdAt).toLocaleTimeString('bn-BD')}
                        </span>
                      </div>
                      {h.note && <p className="text-slate-600 text-xs mt-0.5">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : searched ? (
        <EmptyState
          icon={<ShieldAlert className="w-12 h-12" />}
          title="অর্ডার পাওয়া যায়নি"
          description={errorMsg || 'সঠিক অর্ডার নম্বর লিখে পুনরায় চেষ্টা করুন।'}
        />
      ) : null}
    </div>
  );
};
