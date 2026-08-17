import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart, items } = useCart();
  const isInCart = items.some((i) => i.product.id === product.id);

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80';

  const hasDiscount = product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price;
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock <= 0;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-clinic-lg transition-all duration-300 overflow-hidden">
      {/* Image & Badges */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square bg-slate-50 overflow-hidden">
        <img
          src={primaryImage}
          alt={product.nameBn || product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              ছাড়
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              নতুন
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              স্টক শেষ
            </span>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-col flex-1 p-4">
        {product.category && (
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            {product.category.nameBn}
          </span>
        )}

        <Link
          to={`/product/${product.slug}`}
          className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 hover:text-emerald-700 transition mb-2"
        >
          {product.nameBn || product.name}
        </Link>

        {product.weightSize && (
          <span className="text-xs text-slate-500 mb-2">{product.weightSize}</span>
        )}

        {/* Pricing */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-emerald-800">
                ৳{hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">৳{product.price}</span>
              )}
            </div>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              isInCart
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow active:scale-95'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={isInCart ? 'কার্টে যুক্ত করা হয়েছে' : 'কার্টে যোগ করুন'}
          >
            {isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
