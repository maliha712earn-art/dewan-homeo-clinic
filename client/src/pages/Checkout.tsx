import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

export const Checkout: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { settings, deliverySettings } = useSettings();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    phone: user?.phone || '',
    deliveryAddress: user?.address || '',
    district: user?.district || 'চাঁদপুর',
    upazila: user?.upazila || 'কচুয়া',
    email: user?.email || '',
    customerNote: '',
    paymentMethod: 'COD',
  });

  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deliverySettings.length > 0) {
      const defaultZone = deliverySettings.find((d) => d.isDefault) || deliverySettings[0];
      setSelectedDeliveryId(defaultZone.id);
    }
  }, [deliverySettings]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const selectedDelivery = deliverySettings.find((d) => d.id === selectedDeliveryId) || {
    charge: 120,
    areaNameBn: 'সারাদেশে হোম ডেলিভারি',
    estimatedDays: '২-৪ দিন',
  };

  const deliveryCharge = selectedDelivery.charge;
  const totalAmount = subtotal + deliveryCharge;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.deliveryAddress.trim()) {
      showToast('নাম, মোবাইল নম্বর এবং পূর্ণ ডেলিভারি ঠিকানা পূরণ করা আবশ্যক।', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        deliveryAddress: formData.deliveryAddress.trim(),
        district: formData.district.trim(),
        upazila: formData.upazila.trim(),
        email: formData.email.trim() || undefined,
        customerNote: formData.customerNote.trim() || undefined,
        paymentMethod: formData.paymentMethod,
        deliveryCharge,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        clearCart();
        showToast('অর্ডার সফলভাবে গ্রহণ করা হয়েছে!', 'success');
        navigate(`/order-confirmation/${res.data.data.orderNumber}`, {
          state: { orderData: res.data.data },
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে।';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> কার্টে ফিরে যান
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          চেকআউট ও ডেলিভারি তথ্য
        </h1>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer Information Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            গ্রাহকের নাম ও ডেলিভারি ঠিকানা
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                আপনার পূর্ণ নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="যেমন: মোঃ কামরুল ইসলাম"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                মোবাইল নম্বর <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="যেমন: 017XXXXXXXX"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* District & Upazila */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                জেলা <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="যেমন: চাঁদপুর"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                থানা / উপজেলা
              </label>
              <input
                type="text"
                value={formData.upazila}
                onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                placeholder="যেমন: কচুয়া / হাজীগঞ্জ"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              পূর্ণ ডেলিভারি ঠিকানা (গ্রাম/রোড/বাসা নম্বর) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              placeholder="যেমন: গোলবাহার রোড, কচুয়া, চাঁদপুর"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm leading-relaxed"
            />
          </div>

          {/* Optional Email & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                ইমেইল ঠিকানা (ঐচ্ছিক)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                অর্ডার সংক্রান্ত বিশেষ নোট (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={formData.customerNote}
                onChange={(e) => setFormData({ ...formData, customerNote: e.target.value })}
                placeholder="যেমন: সন্ধ্যার পর ডেলিভারি দিলে ভালো হয়"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Delivery Zone Selection */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              ডেলিভারি এলাকা নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deliverySettings.map((zone) => (
                <label
                  key={zone.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                    selectedDeliveryId === zone.id
                      ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="deliveryZone"
                      checked={selectedDeliveryId === zone.id}
                      onChange={() => setSelectedDeliveryId(zone.id)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-sm block text-slate-900">{zone.areaNameBn}</span>
                      <span className="text-[11px] text-slate-500">সময়: {zone.estimatedDays}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-800">৳{zone.charge}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              পেমেন্ট পদ্ধতি:
            </label>
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-emerald-700" />
                <div>
                  <strong className="block text-sm">ক্যাশ অন ডেলিভারি (Cash on Delivery)</strong>
                  <span className="text-xs text-slate-600">পণ্য হাতে পেয়ে মূল্য পরিশোধ করবেন।</span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                সক্রিয়
              </span>
            </div>
          </div>
        </div>

        {/* Right: Order Items & Place Order Summary */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            আপনার অর্ডার ({items.length}টি পণ্য)
          </h2>

          {/* Items Mini List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => {
              const price = item.product.discountPrice && item.product.discountPrice > 0
                ? item.product.discountPrice
                : item.product.price;
              return (
                <div key={item.product.id} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-slate-900 line-clamp-1">{item.product.nameBn || item.product.name}</p>
                    <span className="text-slate-500">পরিমাণ: {item.quantity} × ৳{price}</span>
                  </div>
                  <span className="font-bold text-slate-800">৳{price * item.quantity}</span>
                </div>
              );
            })}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-slate-100 pt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>পণ্যের মোট মূল্য:</span>
              <span className="font-bold text-slate-900">৳{subtotal}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>ডেলিভারি চার্জ ({selectedDelivery.areaNameBn}):</span>
              <span className="font-bold text-slate-900">৳{deliveryCharge}</span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="font-extrabold text-slate-900 text-base">সর্বমোট পরিশোধযোগ্য:</span>
              <span className="font-extrabold text-emerald-800 text-2xl">৳{totalAmount}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            <span>অর্ডার নিশ্চিত করুন (Confirm Order)</span>
          </button>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed text-center">
            অর্ডার নিশ্চিত করার পর আমরা ফোন বা মেসেজের মাধ্যমে আপডেট জানাব।
          </div>
        </div>
      </form>
    </div>
  );
};
