import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Package, Upload, Check, X, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { Product, ProductCategory } from '../../types';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/Badge';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameBn: '',
    description: '',
    descriptionBn: '',
    price: '',
    discountPrice: '',
    stock: '20',
    sku: '',
    brand: 'দেওয়ান হোমিও ক্লিনিক',
    weightSize: '',
    status: 'ACTIVE',
    isPublished: true,
    isFeatured: false,
    isSpecialOffer: false,
    categoryId: '',
    images: [''],
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/admin/products?page=${page}&limit=12`;
      if (searchTerm.trim()) url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      const res = await api.get(url);
      if (res.data.success) {
        setProducts(res.data.data.products);
        setTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page]);

  const handleOpenAdd = async () => {
    let currentCategories = categories;
    if (currentCategories.length === 0) {
      try {
        const res = await api.get('/products/categories');
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          currentCategories = res.data.data;
          setCategories(currentCategories);
        }
      } catch (e) {
        console.error(e);
      }
    }

    setEditingProduct(null);
    setFormData({
      name: '',
      nameBn: '',
      description: '',
      descriptionBn: '',
      price: '',
      discountPrice: '',
      stock: '20',
      sku: `DH-${Date.now().toString().slice(-5)}`,
      brand: 'দেওয়ান হোমিও ক্লিনিক',
      weightSize: '100 ml',
      status: 'ACTIVE',
      isPublished: true,
      isFeatured: false,
      isSpecialOffer: false,
      categoryId: currentCategories[0]?.id || '',
      images: [''],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      nameBn: p.nameBn,
      description: p.description,
      descriptionBn: p.descriptionBn || '',
      price: p.price.toString(),
      discountPrice: p.discountPrice?.toString() || '',
      stock: p.stock.toString(),
      sku: p.sku || '',
      brand: p.brand || 'দেওয়ান হোমিও ক্লিনিক',
      weightSize: p.weightSize || '',
      status: p.status,
      isPublished: p.isPublished,
      isFeatured: p.isFeatured,
      isSpecialOffer: p.isSpecialOffer,
      categoryId: p.categoryId,
      images: p.images && p.images.length > 0 ? p.images.map((img) => img.url) : [''],
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await api.post('/upload/admin-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const uploadedUrl = res.data.data.url;
        setFormData((prev) => ({
          ...prev,
          images: [uploadedUrl, ...prev.images.filter((u) => u && u !== uploadedUrl)],
        }));
        showToast('ছবি সফলভাবে আপলোড হয়েছে।', 'success');
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      const msg = err.response?.data?.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।';
      showToast(msg, 'error');
    } finally {
      setUploadingImage(false);
      // Reset input value
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nameBn.trim() || !formData.price || !formData.categoryId) {
      showToast('নাম (বাংলা ও ইংরেজি), মূল্য এবং ক্যাটাগরি পূরণ করা আবশ্যক।', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const validImages = formData.images.filter((u) => u.trim().length > 0);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock, 10) || 0,
        images: validImages,
      };

      if (editingProduct) {
        const res = await api.put(`/admin/products/${editingProduct.id}`, payload);
        if (res.data.success) {
          showToast('পণ্য সফলভাবে আপডেট করা হয়েছে।', 'success');
          setModalOpen(false);
          fetchProducts();
        }
      } else {
        const res = await api.post('/admin/products', payload);
        if (res.data.success) {
          showToast('নতুন পণ্য সফলভাবে তৈরি হয়েছে।', 'success');
          setModalOpen(false);
          fetchProducts();
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'পণ্য সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${name}" মুছে ফেলতে চান?`)) return;
    try {
      const res = await api.delete(`/admin/products/${id}`);
      if (res.data.success) {
        showToast('পণ্য সফলভাবে মুছে ফেলা হয়েছে।', 'success');
        fetchProducts();
      }
    } catch (err) {
      showToast('পণ্য মুছতে সমস্যা হয়েছে।', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">পণ্য ব্যবস্থাপনা (Products)</h1>
          <p className="text-xs text-slate-500 mt-0.5">ই-কমার্স ক্যাটালগ ও স্টক পরিচালনা</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> নতুন পণ্য যোগ করুন
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="পণ্য তালিকা লোড হচ্ছে..." />
      ) : products.length === 0 ? (
        <EmptyState title="কোনো পণ্য পাওয়া যায়নি" description="নতুন পণ্য যোগ করতে উপরের বাটনে ক্লিক করুন।" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">পণ্য</th>
                  <th className="p-4">ক্যাটাগরি</th>
                  <th className="p-4">মূল্য ও ছাড়</th>
                  <th className="p-4">স্টক</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const primaryImg = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 flex items-center gap-3">
                        <img src={primaryImg} alt="" className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900 block">{p.nameBn || p.name}</span>
                          <span className="text-slate-400 text-xs font-mono">{p.sku || '-'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{p.category?.nameBn || '-'}</td>
                      <td className="p-4">
                        <span className="font-bold text-emerald-800">৳{p.discountPrice || p.price}</span>
                        {p.discountPrice && <span className="text-xs text-slate-400 line-through block">৳{p.price}</span>}
                      </td>
                      <td className="p-4">
                        <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${
                          p.stock > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                          {p.stock} টি
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition"
                          title="সম্পাদনা"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.nameBn || p.name)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'পণ্য সম্পাদনা (Edit Product)' : 'নতুন পণ্য যোগ করুন (Add Product)'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পণ্যের বাংলা নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nameBn}
                onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                placeholder="যেমন: ক্যালেন্ডুলা স্কিন ক্রিম"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ইংরেজি নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Calendula Skin Cream"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ক্যাটাগরি <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- ক্যাটাগরি নির্বাচন করুন --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameBn} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                মূল্য (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="350"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ছাড় মূল্য (৳)
              </label>
              <input
                type="number"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                placeholder="300"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">স্টক পরিমাণ</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ওজন / পরিমাণ</label>
              <input
                type="text"
                value={formData.weightSize}
                onChange={(e) => setFormData({ ...formData, weightSize: e.target.value })}
                placeholder="100 ml / 50 gm"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">স্ট্যাটাস</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ACTIVE">ACTIVE (সক্রিয়)</option>
                <option value="INACTIVE">INACTIVE (নিষ্ক্রিয়)</option>
                <option value="OUT_OF_STOCK">OUT_OF_STOCK (স্টক শেষ)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">বাংলা বিবরণ</label>
            <textarea
              rows={3}
              value={formData.descriptionBn}
              onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
              placeholder="পণ্যের কার্যকারিতা ও ব্যবহারবিধি..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Image Upload / URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পণ্যের ছবি (URL বা আপলোড)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={formData.images[0] || ''}
                onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                placeholder="https://... বা ছবি আপলোড করুন"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <label className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 transition">
                {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{uploadingImage ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড'}</span>
                <input type="file" accept="image/*" disabled={uploadingImage} onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            {formData.images[0] && (
              <div className="flex items-center gap-3 mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
                <img
                  src={formData.images[0]}
                  alt="Product Preview"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                  onError={(e) => { (e.target as any).style.display = 'none'; }}
                />
                <div className="text-[11px] text-slate-600">
                  <p className="font-semibold text-emerald-700">ছবি সিলেক্ট করা হয়েছে</p>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, images: [''] })}
                    className="text-rose-500 hover:underline"
                  >
                    ছবি সরান
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feature toggles */}
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              ফিচার্ড পণ্য (Featured)
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              ওয়েবসাইটে দৃশ্যমান (Published)
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingProduct ? 'আপডেট করুন' : 'পণ্য তৈরি করুন'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
