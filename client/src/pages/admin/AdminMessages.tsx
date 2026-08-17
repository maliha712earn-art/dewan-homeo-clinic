import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Eye,
  CheckCircle2,
  Phone,
  Mail,
  Trash2,
  Clock,
  Search,
  Check,
  RotateCcw,
  AlertCircle,
  X,
  User,
  Send,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';
import { ContactMessage } from '../../types';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [counts, setCounts] = useState({ total: 0, unread: 0, read: 0 });

  // Modal & Actions state
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { showToast } = useToast();

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/admin/messages?page=${page}&limit=12`;
      if (statusFilter !== 'ALL') {
        url += `&status=${statusFilter}`;
      }
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        const payload = res.data.data;
        setMessages(payload.messages || []);
        if (payload.pagination) {
          setTotalPages(payload.pagination.totalPages || 1);
        }
        if (payload.counts) {
          setCounts(payload.counts);
        }
      } else {
        setError(res.data.message || 'বার্তা তালিকা লোড করা যায়নি।');
      }
    } catch (err: any) {
      console.error('Failed to load contact messages:', err);
      setError(err.response?.data?.message || 'সার্ভার থেকে বার্তা আনতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, statusFilter, debouncedSearch]);

  const handleOpenDetail = async (msg: ContactMessage) => {
    setSelectedMsg(msg);
    setAdminNotes(msg.adminNotes || '');
    setModalOpen(true);

    // Auto mark as READ if it was NEW
    if (msg.status === 'NEW') {
      try {
        await api.patch(`/admin/messages/${msg.id}`, { status: 'READ' });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: 'READ' } : m))
        );
        setSelectedMsg((prev) => (prev ? { ...prev, status: 'READ' } : null));
        setCounts((prev) => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          read: prev.read + 1,
        }));
      } catch (err) {
        // silent
      }
    }
  };

  const handleToggleReadStatus = async (msg: ContactMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = msg.status === 'NEW' ? 'READ' : 'NEW';
    setUpdatingId(msg.id);

    try {
      const res = await api.patch(`/admin/messages/${msg.id}`, { status: newStatus });
      if (res.data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: newStatus } : m))
        );
        if (selectedMsg && selectedMsg.id === msg.id) {
          setSelectedMsg((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        showToast(
          newStatus === 'READ' ? 'বার্তাকে "পঠিত" চিহ্নিত করা হয়েছে।' : 'বার্তাকে "অপঠিত" চিহ্নিত করা হয়েছে।',
          'success'
        );
        setCounts((prev) => ({
          ...prev,
          unread: newStatus === 'NEW' ? prev.unread + 1 : Math.max(0, prev.unread - 1),
          read: newStatus === 'READ' ? prev.read + 1 : Math.max(0, prev.read - 1),
        }));
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMsg) return;
    setUpdatingId(selectedMsg.id);
    try {
      const res = await api.patch(`/admin/messages/${selectedMsg.id}`, {
        adminNotes: adminNotes.trim(),
      });
      if (res.data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === selectedMsg.id ? { ...m, adminNotes: adminNotes.trim() } : m))
        );
        setSelectedMsg((prev) => (prev ? { ...prev, adminNotes: adminNotes.trim() } : null));
        showToast('অ্যাডমিন নোট সফলভাবে সংরক্ষিত হয়েছে।', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'নোট সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteMessage = async (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${name}"-এর পাঠানো বার্তাটি মুছে ফেলতে চান?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await api.delete(`/admin/messages/${id}`);
      if (res.data.success) {
        showToast('বার্তাটি সফলভাবে মুছে ফেলা হয়েছে।', 'success');
        if (selectedMsg && selectedMsg.id === id) {
          setModalOpen(false);
          setSelectedMsg(null);
        }
        fetchMessages();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'বার্তা মুছতে সমস্যা হয়েছে।', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">যোগাযোগ বার্তা (Messages)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ওয়েবসাইটের যোগাযোগ ফর্ম থেকে প্রাপ্ত গ্রাহক বার্তা ও সাধারণ অনুসন্ধান
          </p>
        </div>
      </div>

      {/* Control Bar: Filter Tabs & Live Search */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Status Filter Tabs with Counts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-none">
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>সকল বার্তা</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === 'ALL' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {counts.total}
              </span>
            </button>

            <button
              onClick={() => {
                setStatusFilter('UNREAD');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'UNREAD'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <span>অপঠিত (Unread)</span>
              {counts.unread > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === 'UNREAD' ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {counts.unread}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setStatusFilter('READ');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'READ'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>পঠিত (Read)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === 'READ' ? 'bg-slate-600 text-slate-200' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {counts.read}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, ফোন বা বার্তা অনুসন্ধান..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table / State View */}
      {loading ? (
        <LoadingSpinner text="বার্তা তালিকা লোড হচ্ছে..." className="min-h-[40vh]" />
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-rose-900">ত্রুটি দেখা দিয়েছে</h3>
          <p className="text-xs text-rose-700">{error}</p>
          <button
            onClick={fetchMessages}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> পুনরায় চেষ্টা করুন
          </button>
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-12 h-12" />}
          title={
            statusFilter === 'UNREAD'
              ? 'কোনো অপঠিত বার্তা নেই'
              : statusFilter === 'READ'
              ? 'কোনো পঠিত বার্তা নেই'
              : searchTerm
              ? 'অনুসন্ধান অনুযায়ী কোনো বার্তা পাওয়া যায়নি'
              : 'কোনো যোগাযোগ বার্তা পাওয়া যায়নি'
          }
          description="গ্রাহক ওয়েবসাইট থেকে মেসেজ পাঠালে এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">প্রেরক (নাম ও মোবাইল)</th>
                  <th className="p-4">বিষয়</th>
                  <th className="p-4">বার্তার মূল অংশ</th>
                  <th className="p-4">তারিখ ও সময়</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.map((m) => {
                  const isUnread = m.status === 'NEW';
                  return (
                    <tr
                      key={m.id}
                      onClick={() => handleOpenDetail(m)}
                      className={`cursor-pointer transition ${
                        isUnread ? 'bg-emerald-50/40 hover:bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Sender Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isUnread
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-slate-900 block font-bold">{m.name}</span>
                            <a
                              href={`tel:${m.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-700 font-mono text-xs hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {m.phone}
                            </a>
                            {m.email && (
                              <span className="text-[11px] text-slate-400 block font-normal truncate max-w-[150px]">
                                {m.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="p-4 text-slate-800 font-medium">
                        <span className="line-clamp-1">{m.subject || 'সাধারণ অনুসন্ধান'}</span>
                      </td>

                      {/* Message Excerpt */}
                      <td className="p-4 text-slate-600 max-w-xs sm:max-w-md">
                        <p className="line-clamp-2 leading-relaxed font-normal">{m.message}</p>
                      </td>

                      {/* Date & Time */}
                      <td className="p-4 text-slate-500 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(m.createdAt).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {new Date(m.createdAt).toLocaleTimeString('bn-BD', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            isUnread
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isUnread ? 'bg-emerald-600' : 'bg-slate-400'}`}
                          />
                          {isUnread ? 'নতুন (Unread)' : 'পঠিত (Read)'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(m);
                            }}
                            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" /> দেখুন
                          </button>

                          <button
                            onClick={(e) => handleToggleReadStatus(m, e)}
                            disabled={updatingId === m.id}
                            className={`p-1.5 rounded-lg transition border ${
                              isUnread
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                            }`}
                            title={isUnread ? 'পঠিত চিহ্নিত করুন' : 'অপঠিত চিহ্নিত করুন'}
                          >
                            {updatingId === m.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={(e) => handleDeleteMessage(m.id, m.name, e)}
                            disabled={deletingId === m.id}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition border border-transparent hover:border-rose-200"
                            title="বার্তাটি মুছে ফেলুন"
                          >
                            {deletingId === m.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedMsg && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedMsg(null);
          }}
          title={`বার্তার বিবরণ: ${selectedMsg.name}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Header Status & Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">স্ট্যাটাস:</span>
                <button
                  onClick={() => handleToggleReadStatus(selectedMsg)}
                  disabled={updatingId === selectedMsg.id}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                    selectedMsg.status === 'NEW'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {selectedMsg.status === 'NEW'
                      ? 'অপঠিত (Mark as Read)'
                      : 'পঠিত (Mark as Unread)'}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedMsg.phone}`}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <Phone className="w-3.5 h-3.5" /> সরাসরি কল ({selectedMsg.phone})
                </a>

                {selectedMsg.email && (
                  <a
                    href={`mailto:${selectedMsg.email}?subject=${encodeURIComponent(
                      `Re: ${selectedMsg.subject || 'দেওয়ান হোমিও ক্লিনিক থেকে উত্তর'}`
                    )}`}
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <Mail className="w-3.5 h-3.5" /> ইমেইল
                  </a>
                )}
              </div>
            </div>

            {/* Sender Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">
                  প্রেরকের তথ্য:
                </span>
                <p className="font-bold text-slate-900 text-sm">{selectedMsg.name}</p>
                <p className="text-slate-700">ফোন: <span className="font-mono font-bold">{selectedMsg.phone}</span></p>
                {selectedMsg.email && <p className="text-slate-600">ইমেইল: {selectedMsg.email}</p>}
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">
                  বার্তা তথ্য:
                </span>
                <p className="text-slate-700">বিষয়: <strong>{selectedMsg.subject || 'সাধারণ অনুসন্ধান'}</strong></p>
                <p className="text-slate-500 text-xs">
                  তারিখ: {new Date(selectedMsg.createdAt).toLocaleDateString('bn-BD', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  - {new Date(selectedMsg.createdAt).toLocaleTimeString('bn-BD')}
                </p>
              </div>
            </div>

            {/* Full Message Text */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                বার্তার পূর্ণ বিবরণ:
              </h4>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs">
                {selectedMsg.message}
              </div>
            </div>

            {/* Admin Internal Reply/Follow-up Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                অ্যাডমিন ফলো-আপ নোট (Internal Admin Notes):
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="যেমন: রোগীর সাথে ফোনে কথা বলা হয়েছে, আগামী সপ্তাহে চেম্বারে আসবেন..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(selectedMsg.id, selectedMsg.name)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" /> এই বার্তাটি মুছে ফেলুন
                </button>

                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={updatingId === selectedMsg.id}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
                >
                  {updatingId === selectedMsg.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>নোট সংরক্ষণ করুন</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
