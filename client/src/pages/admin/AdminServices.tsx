import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Layers, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { Service } from '../../types';
import { Modal } from '../../components/Modal';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleBn: '',
    description: '',
    descriptionBn: '',
    price: '',
    sortOrder: 0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/services');
      if (res.data.success) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      title: '',
      titleBn: '',
      description: '',
      descriptionBn: '',
      price: '300',
      sortOrder: services.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (svc: Service) => {
    setEditingService(svc);
    setFormData({
      title: svc.title,
      titleBn: svc.titleBn,
      description: svc.description,
      descriptionBn: svc.descriptionBn,
      price: svc.price?.toString() || '',
      sortOrder: svc.sortOrder,
      isActive: svc.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleBn.trim() || !formData.descriptionBn.trim()) {
      showToast('সেবার বাংলা নাম ও বিবরণ আবশ্যক।', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        title: formData.title || formData.titleBn,
        price: formData.price ? parseFloat(formData.price) : null,
      };

      if (editingService) {
        const res = await api.put(`/admin/services/${editingService.id}`, payload);
        if (res.data.success) {
          showToast('সেবা সফলভাবে আপডেট হয়েছে।', 'success');
          setModalOpen(false);
          fetchServices();
        }
      } else {
        const res = await api.post('/admin/services', payload);
        if (res.data.success) {
          showToast('নতুন সেবা যোগ করা হয়েছে।', 'success');
          setModalOpen(false);
          fetchServices();
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'সেবা সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি "${name}" মুছে ফেলতে চান?`)) return;
    try {
      const res = await api.delete(`/admin/services/${id}`);
      if (res.data.success) {
        showToast('সেবা সফলভাবে মুছে ফেলা হয়েছে।', 'success');
        fetchServices();
      }
    } catch (err) {
      showToast('সেবা মুছতে সমস্যা হয়েছে।', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">সেবাসমূহ (Services)</h1>
          <p className="text-xs text-slate-500 mt-0.5">ক্লিনিকের চিকিৎসাসেবা ও পরামর্শ তালিকা ব্যবস্থাপনা</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> নতুন সেবা যোগ করুন
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="সেবা লোড হচ্ছে..." />
      ) : services.length === 0 ? (
        <EmptyState title="কোনো সেবা তালিকাভুক্ত নেই" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-base">{svc.titleBn}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    svc.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {svc.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{svc.descriptionBn}</p>
                {svc.price !== null && svc.price !== undefined && (
                  <p className="text-xs font-bold text-emerald-800 mt-2">ফি: ৳{svc.price}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>ক্রম (Order): {svc.sortOrder}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleOpenEdit(svc)}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(svc.id, svc.titleBn)}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'সেবা সম্পাদনা' : 'নতুন সেবা যোগ'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              সেবার নাম (বাংলা) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.titleBn}
              onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
              placeholder="যেমন: হোমিওপ্যাথিক পরামর্শ"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ইংরেজি নাম (ঐচ্ছিক)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Homeopathic Consultation"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              সেবার বিবরণ (বাংলা) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.descriptionBn}
              onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
              placeholder="সেবাটির বিস্তারিত ও প্রক্রিয়া..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">পরামর্শ ফি (৳)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="300 (০ দিলে ফ্রি)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">প্রদর্শন ক্রম (Order)</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            সেবাটি সক্রিয় ও দৃশ্যমান রাখুন (Active)
          </label>

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
