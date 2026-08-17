import React, { useEffect, useState } from 'react';
import { Plus, ShieldCheck, UserCheck, Trash2, Edit, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { AdminUser } from '../../types';
import { Modal } from '../../components/Modal';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminUsers: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'ADMIN',
    password: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setAdmins(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenAdd = () => {
    setEditingAdmin(null);
    setFormData({
      name: '',
      email: '',
      role: 'ADMIN',
      password: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password: '',
      isActive: admin.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('নাম ও ইমেইল আবশ্যক।', 'error');
      return;
    }
    if (!editingAdmin && (!formData.password || formData.password.length < 6)) {
      showToast('নতুন অ্যাকাউন্টের জন্য কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন।', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingAdmin) {
        const payload: any = {
          name: formData.name.trim(),
          role: formData.role,
          isActive: formData.isActive,
        };
        if (formData.password.trim()) payload.password = formData.password.trim();

        const res = await api.put(`/admin/users/${editingAdmin.id}`, payload);
        if (res.data.success) {
          showToast('অ্যাডমিন তথ্য আপডেট হয়েছে।', 'success');
          setModalOpen(false);
          fetchAdmins();
        }
      } else {
        const res = await api.post('/admin/users', formData);
        if (res.data.success) {
          showToast('নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি হয়েছে।', 'success');
          setModalOpen(false);
          fetchAdmins();
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`আপনি কি "${name}" অ্যাকাউন্টটি মুছে ফেলতে চান?`)) return;
    try {
      const res = await api.delete(`/admin/users/${id}`);
      if (res.data.success) {
        showToast('অ্যাকাউন্ট মুছে ফেলা হয়েছে।', 'success');
        fetchAdmins();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'মুছতে সমস্যা হয়েছে।', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">অ্যাডমিন ব্যবহারকারী (Admin Accounts)</h1>
          <p className="text-xs text-slate-500 mt-0.5">ক্লিনিক অ্যাডমিন ও স্টাফ অ্যাকাউন্ট পরিচালনা</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> নতুন অ্যাডমিন যোগ করুন
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="অ্যাডমিন তালিকা লোড হচ্ছে..." />
      ) : admins.length === 0 ? (
        <EmptyState title="কোনো অ্যাডমিন নেই" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">নাম</th>
                  <th className="p-4">ইমেইল</th>
                  <th className="p-4">ভূমিকা (Role)</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4">সর্বশেষ লগইন</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900">{adm.name}</td>
                    <td className="p-4 text-slate-600 font-mono">{adm.email}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                        {adm.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        adm.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {adm.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {adm.lastLoginAt ? new Date(adm.lastLoginAt).toLocaleString('bn-BD') : 'কখনও নয়'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(adm)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(adm.id, adm.name)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAdmin ? 'অ্যাডমিন তথ্য পরিবর্তন' : 'নতুন অ্যাডমিন অ্যাকাউন্ট'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">পূর্ণ নাম <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="যেমন: ডাঃ মোঃ কামরুল ইসলাম"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল <span className="text-rose-500">*</span></label>
            <input
              type="email"
              required
              disabled={!!editingAdmin}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@dewanhomeo.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              পাসওয়ার্ড {editingAdmin ? '(পরিবর্তন করতে চাইলে লিখুন)' : '<span className="text-rose-500">*</span>'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="কমপক্ষে ৬ অক্ষর"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ভূমিকা (Role)</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="STAFF">STAFF</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">স্ট্যাটাস</label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="true">সক্রিয় (Active)</option>
                <option value="false">নিষ্ক্রিয় (Inactive)</option>
              </select>
            </div>
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
