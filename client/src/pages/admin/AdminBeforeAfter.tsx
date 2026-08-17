import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Sparkles, Upload, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { BeforeAfterCase } from '../../types';
import { Modal } from '../../components/Modal';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminBeforeAfter: React.FC = () => {
  const [cases, setCases] = useState<BeforeAfterCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<BeforeAfterCase | null>(null);

  const [formData, setFormData] = useState({
    titleBn: '',
    descriptionBn: '',
    category: 'ত্বকের সমস্যা',
    beforeImage: '',
    afterImage: '',
    durationText: '৩ মাস',
    hasConsent: true,
    isPublished: true,
    sortOrder: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/before-after');
      if (res.data.success) {
        setCases(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load before/after cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleOpenAdd = () => {
    setEditingCase(null);
    setFormData({
      titleBn: '',
      descriptionBn: '',
      category: 'ত্বকের সমস্যা',
      beforeImage: '',
      afterImage: '',
      durationText: '৩ মাস',
      hasConsent: true,
      isPublished: true,
      sortOrder: cases.length + 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: BeforeAfterCase) => {
    setEditingCase(c);
    setFormData({
      titleBn: c.titleBn,
      descriptionBn: c.descriptionBn || '',
      category: c.category,
      beforeImage: c.beforeImage,
      afterImage: c.afterImage,
      durationText: c.durationText || '',
      hasConsent: c.hasConsent,
      isPublished: c.isPublished,
      sortOrder: c.sortOrder,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'beforeImage' | 'afterImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append('image', file);
      const res = await api.post('/upload/admin-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, [field]: res.data.data.url }));
        showToast('ছবি আপলোড সম্পন্ন হয়েছে।', 'success');
      }
    } catch (err) {
      showToast('ছবি আপলোড ব্যর্থ হয়েছে।', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleBn.trim() || !formData.beforeImage.trim() || !formData.afterImage.trim()) {
      showToast('শিরোনাম, আগের ছবি এবং পরের ছবি দেওয়া আবশ্যক।', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCase) {
        const res = await api.put(`/admin/before-after/${editingCase.id}`, formData);
        if (res.data.success) {
          showToast('কেস স্টাডি আপডেট হয়েছে।', 'success');
          setModalOpen(false);
          fetchCases();
        }
      } else {
        const res = await api.post('/admin/before-after', formData);
        if (res.data.success) {
          showToast('নতুন কেস স্টাডি যুক্ত হয়েছে।', 'success');
          setModalOpen(false);
          fetchCases();
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`আপনি কি "${title}" মুছে ফেলতে চান?`)) return;
    try {
      const res = await api.delete(`/admin/before-after/${id}`);
      if (res.data.success) {
        showToast('কেস মুছে ফেলা হয়েছে।', 'success');
        fetchCases();
      }
    } catch (err) {
      showToast('মুছতে সমস্যা হয়েছে।', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">কেস স্টাডি (Before & After)</h1>
          <p className="text-xs text-slate-500 mt-0.5">রোগীদের উন্নতির ফলাফল ও ফটো গ্যালারি</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> নতুন কেস যোগ করুন
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="কেস লোড হচ্ছে..." />
      ) : cases.length === 0 ? (
        <EmptyState title="কোনো কেস স্টাডি নেই" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative">
                    <img src={c.beforeImage} alt="Before" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">আগে</span>
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative">
                    <img src={c.afterImage} alt="After" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-emerald-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">পরে ({c.durationText})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">{c.category}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.isPublished ? 'প্রকাশিত' : 'ড্রাফট'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-2">{c.titleBn}</h3>
                {c.descriptionBn && <p className="text-xs text-slate-600 mt-1">{c.descriptionBn}</p>}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>সম্মতি: {c.hasConsent ? 'হ্যাঁ' : 'না'}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.titleBn)}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCase ? 'কেস সম্পাদনা' : 'নতুন কেস যোগ'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              কেসের শিরোনাম (বাংলা) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.titleBn}
              onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
              placeholder="যেমন: মুখের কালচে দাগ দূরীকরণের ফলাফল"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ত্বকের সমস্যা">ত্বকের সমস্যা</option>
                <option value="চুলের যত্ন">চুলের যত্ন</option>
                <option value="সাধারণ স্বাস্থ্য">সাধারণ স্বাস্থ্য</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">সময়কাল</label>
              <input
                type="text"
                value={formData.durationText}
                onChange={(e) => setFormData({ ...formData, durationText: e.target.value })}
                placeholder="যেমন: ৩ মাস"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Image Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">আগের ছবি (Before Image URL / File) <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={formData.beforeImage}
                onChange={(e) => setFormData({ ...formData, beforeImage: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs mb-1 focus:ring-2 focus:ring-emerald-500"
              />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'beforeImage')} className="text-xs" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">পরের ছবি (After Image URL / File) <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={formData.afterImage}
                onChange={(e) => setFormData({ ...formData, afterImage: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs mb-1 focus:ring-2 focus:ring-emerald-500"
              />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'afterImage')} className="text-xs" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">বিবরণ (বাংলা)</label>
            <textarea
              rows={2}
              value={formData.descriptionBn}
              onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
              placeholder="চিকিৎসার প্রক্রিয়া ও ফলাফলের সংক্ষিপ্ত বিবরণ..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasConsent}
                onChange={(e) => setFormData({ ...formData, hasConsent: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              রোগীর সম্মতি রয়েছে (Consent Verified)
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              ওয়েবসাইটে প্রকাশিত (Published)
            </label>
          </div>

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
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold"
            >
              {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
