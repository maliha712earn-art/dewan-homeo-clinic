import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, ShieldCheck, Truck, RefreshCw, ArrowLeft, Plus, Minus, Phone } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { ProductCard } from '../components/ProductCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { settings } = useSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const phone = settings.phone || '01643184368';

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.data.success) {
          const prod: Product = res.data.data.product;
          setProduct(prod);
          setRelatedProducts(res.data.data.relatedProducts || []);
          const primary = prod.images?.find((img) => img.isPrimary)?.url || prod.images?.[0]?.url || '';
          setSelectedImage(primary);
          setQuantity(1);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return <LoadingSpinner text="পণ্যের তথ্য লোড হচ্ছে..." className="min-h-[50vh]" />;
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">পণ্যটি পাওয়া যায়নি</h2>
        <p className="text-sm text-slate-500">আপনার অনুরোধকৃত পণ্যটি সরানো হয়েছে বা সক্রিয় নেই।</p>
        <Link to="/shop" className="inline-block bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">
          শপে ফিরে যান
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price;
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stock <= 0;
  const isInCart = items.some((i) => i.product.id === product.id);

  const handleInstantBuy = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Back Button */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="w-4 h-4" /> সকল পণ্যে ফিরে যান
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
        {/* Left: Images */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'}
              alt={product.nameBn || product.name}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                ছাড়
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                    selectedImage === img.url ? 'border-emerald-600 ring-2 ring-emerald-100' : 'border-slate-200 opacity-70'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          <div>
            {product.category && (
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full inline-block mb-2">
                {product.category.nameBn}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.nameBn || product.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">{product.name} {product.sku && `| SKU: ${product.sku}`}</p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-3xl font-extrabold text-emerald-800">
              ৳{hasDiscount ? product.discountPrice : product.price}
            </span>
            {hasDiscount && (
              <span className="text-base text-slate-400 line-through">৳{product.price}</span>
            )}
            <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
              isOutOfStock ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isOutOfStock ? 'স্টক শেষ' : `স্টক উপলব্ধ (${product.stock} টি)`}
            </span>
          </div>

          {/* Bengali Description */}
          <div className="space-y-2 text-sm text-slate-700 leading-relaxed border-t border-b border-slate-100 py-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">পণ্যের বিবরণ:</h3>
            <p>{product.descriptionBn || product.description}</p>
            {product.weightSize && (
              <p className="text-xs text-slate-500 font-medium">পরিমাণ / ওজন: {product.weightSize}</p>
            )}
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            {!isOutOfStock && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">পরিমাণ:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-slate-500 hover:text-slate-800"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2.5 text-slate-500 hover:text-slate-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>কার্টে যোগ করুন</span>
              </button>

              <button
                onClick={handleInstantBuy}
                disabled={isOutOfStock}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>সরাসরি অর্ডার করুন</span>
              </button>
            </div>
          </div>

          {/* Highlights & Helpline */}
          <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-slate-600">
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>ক্যাশ অন ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>মানসম্মত যত্ন পণ্য</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="text-xl font-bold text-slate-900">সম্পর্কিত অন্যান্য পণ্য</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
