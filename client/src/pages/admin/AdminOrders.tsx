import React, { useEffect, useState } from 'react';
import { Search, Eye, Filter, Printer, CheckCircle2, XCircle, Clock, Truck, ChevronRight, FileText } from 'lucide-react';
import api from '../../services/api';
import { Order } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [adminInternalNote, setAdminInternalNote] = useState('');

  const { showToast } = useToast();
  const { settings } = useSettings();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/admin/orders?page=${page}&limit=12`;
      if (selectedStatus !== 'ALL') url += `&status=${selectedStatus}`;
      if (searchTerm.trim()) url += `&search=${encodeURIComponent(searchTerm.trim())}`;

      const res = await api.get(url);
      if (res.data.success) {
        setOrders(res.data.data.orders);
        setTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleOpenDetail = async (orderId: string) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      if (res.data.success) {
        setSelectedOrder(res.data.data);
        setAdminInternalNote(res.data.data.adminNotes || '');
        setStatusNote('');
        setModalOpen(true);
      }
    } catch (err) {
      showToast('অর্ডারের বিবরণ লোড করা যায়নি।', 'error');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/admin/orders/${selectedOrder.id}/status`, {
        status: newStatus,
        note: statusNote.trim() || undefined,
      });

      if (res.data.success) {
        setSelectedOrder(res.data.data);
        showToast(`স্ট্যাটাস পরিবর্তিত হয়েছে: ${newStatus}`, 'success');
        fetchOrders();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveInternalNotes = async () => {
    if (!selectedOrder) return;
    try {
      const res = await api.patch(`/admin/orders/${selectedOrder.id}/notes`, {
        adminNotes: adminInternalNote,
      });
      if (res.data.success) {
        showToast('অভ্যন্তরীণ নোট সংরক্ষিত হয়েছে।', 'success');
      }
    } catch (err) {
      showToast('নোট সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
    }
  };

  const handlePrintModal = () => {
    window.print();
  };

  const statuses = ['ALL', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">অর্ডার ব্যবস্থাপনা</h1>
          <p className="text-xs text-slate-500 mt-0.5">সকল গ্রাহক অর্ডার পর্যবেক্ষণ, ভেরিফিকেশন ও স্ট্যাটাস আপডেট</p>
        </div>
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
                {st === 'ALL' ? 'সকল অর্ডার' : st}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="অর্ডার নম্বর, নাম বা মোবাইল..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          </form>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <LoadingSpinner text="অর্ডার তালিকা লোড হচ্ছে..." />
      ) : orders.length === 0 ? (
        <EmptyState title="কোনো অর্ডার পাওয়া যায়নি" description="আপনার ফিল্টার অনুযায়ী কোনো অর্ডার তালিকাভুক্ত নেই।" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">অর্ডার আইডি</th>
                  <th className="p-4">গ্রাহকের নাম ও ফোন</th>
                  <th className="p-4">ঠিকানা ও জেলা</th>
                  <th className="p-4">মোট বিল</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4">তারিখ</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                      <span className="text-slate-500 text-xs font-mono">{ord.phone}</span>
                    </td>
                    <td className="p-4 text-slate-600">
                      <span className="line-clamp-1">{ord.deliveryAddress}</span>
                      {ord.district && <span className="text-xs text-slate-400 font-medium">({ord.district})</span>}
                    </td>
                    <td className="p-4 font-bold text-emerald-800">৳{ord.totalAmount}</td>
                    <td className="p-4">
                      <StatusBadge status={ord.orderStatus} />
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(ord.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(ord.id)}
                        className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> বিস্তারিত
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

      {/* Order Detail & Invoicing Modal */}
      {selectedOrder && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`অর্ডার বিবরণ: #${selectedOrder.orderNumber}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 no-print">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">স্ট্যাটাস পরিবর্তন:</span>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-xs bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Pending">Pending (অপেক্ষমান)</option>
                  <option value="Confirmed">Confirmed (যাচাইকৃত)</option>
                  <option value="Processing">Processing (প্রস্তুত হচ্ছে)</option>
                  <option value="Shipped">Shipped (ডেলিভারিতে প্রেরিত)</option>
                  <option value="Delivered">Delivered (সম্পন্ন)</option>
                  <option value="Cancelled">Cancelled (বাতিল)</option>
                </select>
              </div>

              <button
                onClick={handlePrintModal}
                className="inline-flex items-center gap-1.5 bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Printer className="w-3.5 h-3.5" /> চালান প্রিন্ট (Print Invoice)
              </button>
            </div>

            {/* Printable Invoice View */}
            <div id="printable-invoice" className="space-y-5 bg-white p-2">
              <div className="flex justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{settings.clinicName}</h3>
                  <p className="text-xs text-slate-500">{settings.clinicNameEn}</p>
                  <p className="text-xs text-slate-600 mt-1">ঠিকানা: {settings.primaryAddress}</p>
                  <p className="text-xs text-slate-600">ফোন: {settings.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block">ইনভয়েস / অর্ডার আইডি:</span>
                  <span className="text-lg font-mono font-extrabold text-emerald-800">{selectedOrder.orderNumber}</span>
                  <p className="text-xs text-slate-500 mt-1">
                    তারিখ: {new Date(selectedOrder.createdAt).toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm">
                <div>
                  <strong className="block text-slate-900 mb-1">গ্রাহকের বিবরণ:</strong>
                  <p>নাম: {selectedOrder.customerName}</p>
                  <p>মোবাইল: {selectedOrder.phone}</p>
                </div>
                <div>
                  <strong className="block text-slate-900 mb-1">ডেলিভারি ঠিকানা:</strong>
                  <p>{selectedOrder.deliveryAddress}</p>
                  {selectedOrder.district && <p>জেলা: {selectedOrder.district}</p>}
                </div>
              </div>

              {/* Ordered Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs sm:text-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <tr>
                      <th className="p-3">পণ্য</th>
                      <th className="p-3 text-center">পরিমাণ</th>
                      <th className="p-3 text-right">মূল্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-slate-900">{it.productName}</td>
                        <td className="p-3 text-center">{it.quantity}</td>
                        <td className="p-3 text-right font-bold text-slate-900">৳{it.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-xs sm:text-sm text-right pt-2">
                <p className="text-slate-600">সাবটোটাল: <strong>৳{selectedOrder.subtotal}</strong></p>
                <p className="text-slate-600">ডেলিভারি ফি: <strong>৳{selectedOrder.deliveryCharge}</strong></p>
                <p className="text-base font-extrabold text-emerald-800 pt-1 border-t border-slate-200">
                  সর্বমোট (COD): ৳{selectedOrder.totalAmount}
                </p>
              </div>
            </div>

            {/* Internal Notes Section (No-Print) */}
            <div className="space-y-3 pt-4 border-t border-slate-100 no-print">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                অভ্যন্তরীণ নোট (Internal Admin Notes):
              </label>
              <textarea
                rows={2}
                value={adminInternalNote}
                onChange={(e) => setAdminInternalNote(e.target.value)}
                placeholder="অর্ডারের ডেলিভারি বা কল ভেরিফিকেশন সংক্রান্ত নোট..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSaveInternalNotes}
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
