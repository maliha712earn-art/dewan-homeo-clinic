import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/LoadingSpinner';

export const Cart: React.FC = () => {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12" />}
          title="আপনার শপিং কার্ট খালি"
          description="আপনি এখনও কোনো পণ্য কার্টে যুক্ত করেননি। আমাদের শপ থেকে প্রয়োজনীয় পণ্য বেছে নিন।"
          action={
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>শপে যান ও পণ্য অর্ডার করুন</span>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">শপিং কার্ট</h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
        >
          কার্ট খালি করুন
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const price = item.product.discountPrice && item.product.discountPrice > 0
              ? item.product.discountPrice
              : item.product.price;
            const lineTotal = price * item.quantity;
            const primaryImage =
              item.product.images?.find((i) => i.isPrimary)?.url ||
              item.product.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80';

            return (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-xs"
              >
                {/* Image */}
                <img
                  src={primaryImage}
                  alt={item.product.nameBn || item.product.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                />

                {/* Details */}
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="font-bold text-slate-900 text-sm sm:text-base hover:text-emerald-700 transition"
                  >
                    {item.product.nameBn || item.product.name}
                  </Link>
                  <p className="text-xs text-slate-400">একক মূল্য: ৳{price}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-2 text-slate-600 hover:text-slate-900"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-xs sm:text-sm text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-2 text-slate-600 hover:text-slate-900"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-right font-bold text-emerald-800 text-base sm:text-lg min-w-[70px]">
                  ৳{lineTotal}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline pt-2"
          >
            <ArrowLeft className="w-4 h-4" /> আরও পণ্য যোগ করুন
          </Link>
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            অর্ডার সারাংশ
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>মোট পণ্যের মূল্য (Subtotal):</span>
              <span className="font-bold text-slate-900">৳{subtotal}</span>
            </div>

            <div className="flex justify-between text-slate-600 text-xs">
              <span>ডেলিভারি চার্জ:</span>
              <span className="text-slate-500">চেকআউটে এলাকা অনুযায়ী হিসাব হবে</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-extrabold text-slate-900 text-base">আনুমানিক মোট:</span>
              <span className="font-extrabold text-emerald-800 text-2xl">৳{subtotal}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-sm shadow-md transition active:scale-95"
          >
            <span>চেকআউট করুন (Proceed to Checkout)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>সারা দেশে ক্যাশ অন ডেলিভারিতে পণ্য পৌঁছানো হয়।</span>
          </div>
        </div>
      </div>
    </div>
  );
};
