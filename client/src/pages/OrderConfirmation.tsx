import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, Printer, Phone, MessageCircle, ArrowRight, Truck } from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';
import { useSettings } from '../context/SettingsContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const { settings } = useSettings();

  const [order, setOrder] = useState<Order | null>(location.state?.orderData || null);
  const [loading, setLoading] = useState(!order);

  const phone = settings.phone || '01643184368';
  const whatsapp = settings.whatsapp || '01643184368';

  useEffect(() => {
    if (!order && orderNumber) {
      const fetchOrder = async () => {
        try {
          const res = await api.get(`/orders/track/${orderNumber}`);
          if (res.data.success) {
            setOrder(res.data.data);
          }
        } catch (err) {
          console.error('Failed to fetch confirmed order:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [order, orderNumber]);

  if (loading) {
    return <LoadingSpinner text="অর্ডার বিবরণ লোড হচ্ছে..." className="min-h-[50vh]" />;
  }

  const handlePrint = () => {
    window.print();
  };

  const whatsappMsgUrl = `https://wa.me/88${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `আসসালামু আলাইকুম, আমি অর্ডার করেছি। আমার অর্ডার আইডি: ${orderNumber}`
  )}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে
        </h1>
        <p className="text-sm text-slate-600">
          আপনার অর্ডার নিশ্চিতকরণ তথ্য নিচে প্রদর্শিত হলো।
        </p>
      </div>

      {/* Printable Invoice Container */}
      <div id="printable-invoice" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        {/* Invoice Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              অর্ডার নম্বর (Order ID):
            </span>
            <span className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-800">
              {order?.orderNumber || orderNumber}
            </span>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              ক্লিনিক নাম:
            </span>
            <span className="text-sm font-bold text-slate-900">{settings.clinicName}</span>
            <p className="text-xs text-slate-500">ফোন: {phone}</p>
          </div>
        </div>

        {/* Customer & Delivery Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <span className="font-bold text-slate-900 block mb-1">গ্রাহকের বিবরণ:</span>
            <p className="text-slate-700">নাম: {order?.customerName}</p>
            <p className="text-slate-700">মোবাইল: {order?.phone}</p>
          </div>
          <div>
            <span className="font-bold text-slate-900 block mb-1">ডেলিভারি ঠিকানা:</span>
            <p className="text-slate-700">{order?.deliveryAddress}</p>
            {order?.district && <p className="text-slate-700">জেলা: {order.district}</p>}
          </div>
        </div>

        {/* Ordered Items Table */}
        {order?.items && order.items.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              অর্ডারকৃত পণ্যসমূহ:
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-3">পণ্য</th>
                    <th className="p-3 text-center">পরিমাণ</th>
                    <th className="p-3 text-right">মূল্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium text-slate-900">{it.productName}</td>
                      <td className="p-3 text-center">{it.quantity}</td>
                      <td className="p-3 text-right font-bold text-slate-900">৳{it.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pricing Summary */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-700">
          {order?.subtotal !== undefined && (
            <div className="flex justify-between">
              <span>সাবটোটাল:</span>
              <span className="font-medium">৳{order.subtotal}</span>
            </div>
          )}
          {order?.deliveryCharge !== undefined && (
            <div className="flex justify-between">
              <span>ডেলিভারি ফি:</span>
              <span className="font-medium">৳{order.deliveryCharge}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-slate-200 text-base font-extrabold text-slate-900">
            <span>সর্বমোট বিল (COD):</span>
            <span className="text-emerald-800 text-xl font-bold">৳{order?.totalAmount}</span>
          </div>
        </div>

        {/* Payment & Status */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-700" />
            <span className="text-slate-700">
              পেমেন্ট পদ্ধতি: <strong>ক্যাশ অন ডেলিভারি</strong>
            </span>
          </div>
          <span className="font-bold text-emerald-800">স্ট্যাটাস: অপেক্ষমান (Pending)</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 px-5 py-3 rounded-xl font-bold text-sm shadow-xs transition"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>চালান প্রিন্ট করুন (Print Invoice)</span>
        </button>

        <a
          href={whatsappMsgUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-5 py-3 rounded-xl font-bold text-sm shadow transition"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>হোয়াটসঅ্যাপে জানান</span>
        </a>

        <Link
          to={`/track-order?orderNumber=${order?.orderNumber || orderNumber}`}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow transition"
        >
          <span>অর্ডার ট্র্যাক করুন</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
