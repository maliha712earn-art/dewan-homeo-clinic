import React, { useEffect, useState } from 'react';
import { Stethoscope, Search, Eye, Phone, CheckCircle2, Clock, ShieldCheck, User } from 'lucide-react';
import api from '../../services/api';
import { Consultation } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminConsultations: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedItem, setSelectedItem] = useState<Consultation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const { showToast } = useToast();

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      let url = `/admin/consultations?page=${page}&limit=12`;
      if (selectedStatus !== 'ALL') url += `&status=${selectedStatus}`;
      if (searchTerm.trim()) url += `&search=${encodeURIComponent(searchTerm.trim())}`;

      const res = await api.get(url);
      if (res.data.success) {
        setConsultations(res.data.data.consultations);
        setTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to load consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [page, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchConsultations();
  };

  const handleOpenDetail = (item: Consultation) => {
    setSelectedItem(item);
    setAdminNotes(item.adminNotes || '');
    setModalOpen(true);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedItem) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/admin/consultations/${selectedItem.id}`, {
        status: newStatus,
        adminNotes: adminNotes.trim(),
      });
      if (res.data.success) {
        setSelectedItem(res.data.data);
        showToast(`পরামর্শ স্ট্যাটাস পরিবর্তিত হয়েছে: ${newStatus}`, 'success');
        fetchConsultations();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'আপডেট ব্যর্থ হয়েছে।', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const statuses = ['ALL', 'NEW', 'REVIEWED', 'CONTACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">অনলাইন পরামর্শ অনুরোধ</h1>
        <p className="text-xs text-slate-500 mt-0.5">রোগীদের পাঠানো স্বাস্থ্য ও ত্বকের সমস্যা সংক্রান্ত অনুরোধসমূহ</p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSelectedStatus(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedStatus === st
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'সকল অনুরোধ' : st}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, ফোন বা সমস্যা খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          </form>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="পরামর্শ তালিকা লোড হচ্ছে..." />
      ) : consultations.length === 0 ? (
        <EmptyState title="কোনো অনুরোধ পাওয়া যায়নি" description="আপনার ফিল্টার অনুযায়ী কোনো পরামর্শ তালিকাভুক্ত নেই।" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">রোগীর নাম ও ফোন</th>
                  <th className="p-4">বয়স ও লিঙ্গ</th>
                  <th className="p-4">বর্ণিত সমস্যা</th>
                  <th className="p-4">ছবি</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4">তারিখ</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consultations.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{c.name}</span>
                      <a href={`tel:${c.phone}`} className="text-emerald-700 font-mono text-xs hover:underline">
                        {c.phone}
                      </a>
                    </td>
                    <td className="p-4 text-slate-600">
                      {c.age ? `${c.age} বছর` : '-'} | {c.gender === 'Male' ? 'পুরুষ' : c.gender === 'Female' ? 'মহিলা' : '-'}
                    </td>
                    <td className="p-4 text-slate-700 max-w-xs">
                      <p className="line-clamp-1">{c.problem}</p>
                    </td>
                    <td className="p-4">
                      {c.images && c.images.length > 0 ? (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded font-medium">
                          {c.images.length}টি ছবি
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(c.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(c)}
                        className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> পর্যালোচনা
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`পরামর্শ অনুরোধ: ${selectedItem.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Quick Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">স্ট্যাটাস:</span>
                <select
                  value={selectedItem.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updating}
                  className="px-3 py-1 rounded-xl border border-slate-300 font-bold text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="NEW">NEW (নতুন)</option>
                  <option value="REVIEWED">REVIEWED (যাচাইকৃত)</option>
                  <option value="CONTACTED">CONTACTED (যোগাযোগ সম্পন্ন)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (চলমান)</option>
                  <option value="COMPLETED">COMPLETED (সম্পন্ন)</option>
                  <option value="CANCELLED">CANCELLED (বাতিল)</option>
                </select>
              </div>

              <a
                href={`tel:${selectedItem.phone}`}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" /> সরাসরি কল ({selectedItem.phone})
              </a>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <p><strong>নাম:</strong> {selectedItem.name}</p>
                <p><strong>মোবাইল:</strong> {selectedItem.phone}</p>
                <p><strong>বয়স ও লিঙ্গ:</strong> {selectedItem.age ? `${selectedItem.age} বছর` : 'উদ্বোধনহীন'} | {selectedItem.gender}</p>
              </div>
              <div>
                <p><strong>ঠিকানা:</strong> {selectedItem.address || '-'}</p>
                <p><strong>স্থায়িত্ব:</strong> {selectedItem.duration || '-'}</p>
                <p><strong>তারিখ:</strong> {new Date(selectedItem.createdAt).toLocaleString('bn-BD')}</p>
              </div>
            </div>

            {/* Complaint */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">সমস্যার বিবরণ:</h4>
              <p className="text-xs sm:text-sm text-slate-700 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 leading-relaxed whitespace-pre-line">
                {selectedItem.problem}
              </p>
            </div>

            {/* Prior Treatment */}
            {selectedItem.previousTreatment && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">পূর্ববর্তী চিকিৎসা:</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedItem.previousTreatment}
                </p>
              </div>
            )}

            {/* Uploaded Photos */}
            {selectedItem.images && selectedItem.images.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  সংযুক্ত ছবি ({selectedItem.images.length}টি):
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedItem.images.map((img, i) => (
                    <a
                      key={i}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 block group"
                    >
                      <img
                        src={img.url}
                        alt="Medical photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Response / Internal Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                ক্লিনিকের নোট / উত্তর (Admin Response Notes):
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="রোগীর সাথে যোগাযোগের ফলাফল বা প্রেসক্রিপশন সংক্রান্ত নোট লিখুন..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleStatusUpdate(selectedItem.status)}
                disabled={updating}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                নোট সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
