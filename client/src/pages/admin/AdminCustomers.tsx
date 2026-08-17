import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Stethoscope,
  Eye,
  RotateCcw,
  AlertCircle,
  X,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Customer } from '../../types';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/Badge';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [counts, setCounts] = useState({ total: 0, withOrders: 0, withConsultations: 0 });

  // View Details Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [customerDetail, setCustomerDetail] = useState<{
    customer: Customer;
    orders: any[];
    consultations: any[];
  } | null>(null);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/admin/customers?page=${page}&limit=12`;
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        const payload = res.data.data;
        setCustomers(payload.customers || []);
        if (payload.pagination) {
          setTotalPages(payload.pagination.totalPages || 1);
        }
        if (payload.counts) {
          setCounts(payload.counts);
        }
      } else {
        setError(res.data.message || 'গ্রাহক তালিকা লোড করা যায়নি।');
      }
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setError(err.response?.data?.message || 'সার্ভার থেকে গ্রাহক তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, debouncedSearch]);

  const handleOpenDetail = async (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setModalOpen(true);
    setDetailLoading(true);

    try {
      const res = await api.get(`/admin/customers/${customer.id}`);
      if (res.data.success) {
        setCustomerDetail(res.data.data);
      } else {
        // Fallback with basic customer info if detail fetch fails
        setCustomerDetail({
          customer,
          orders: [],
          consultations: [],
        });
      }
    } catch (err) {
      console.error('Failed to load customer details:', err);
      setCustomerDetail({
        customer,
        orders: [],
        consultations: [],
      });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">গ্রাহক ডিরেক্টরি (Customers)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            নিবন্ধিত রোগী ও গ্রাহকদের সামগ্রিক তথ্য, অর্ডার ও পরামর্শের ইতিহাস
          </p>
        </div>
      </div>

      {/* Metric Cards & Live Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Quick Metrics */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-none">
            <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600 font-medium">মোট গ্রাহক:</span>
              <span className="font-bold text-slate-900">{counts.total}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <ShoppingBag className="w-4 h-4 text-teal-600" />
              <span className="text-slate-600 font-medium">অর্ডারকারী:</span>
              <span className="font-bold text-slate-900">{counts.withOrders}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <span className="text-slate-600 font-medium">পরামর্শ গ্রহণকারী:</span>
              <span className="font-bold text-slate-900">{counts.withConsultations}</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, ফোন, ইমেইল বা জেলা দিয়ে খুঁজুন..."
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
        <LoadingSpinner text="গ্রাহক তালিকা লোড হচ্ছে..." className="min-h-[40vh]" />
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-rose-900">ত্রুটি দেখা দিয়েছে</h3>
          <p className="text-xs text-rose-700">{error}</p>
          <button
            onClick={fetchCustomers}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> পুনরায় চেষ্টা করুন
          </button>
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title={searchTerm ? 'অনুসন্ধান অনুযায়ী কোনো গ্রাহক পাওয়া যায়নি' : 'কোনো গ্রাহক পাওয়া যায়নি'}
          description="গ্রাহকরা ওয়েবসাইটে অ্যাকাউন্ট খুললে বা অর্ডার/পরামর্শ জমা দিলে এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">গ্রাহকের নাম ও যোগাযোগ</th>
                  <th className="p-4">ঠিকানা ও জেলা</th>
                  <th className="p-4 text-center">মোট অর্ডার</th>
                  <th className="p-4 text-center">পরামর্শ ফর্ম</th>
                  <th className="p-4">মোট ক্রয় (৳)</th>
                  <th className="p-4">নিবন্ধন তারিখ</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => handleOpenDetail(c)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    {/* Name & Contact */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {c.name ? c.name.charAt(0) : 'গ'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{c.name}</span>
                          <a
                            href={`tel:${c.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-emerald-700 font-mono text-xs hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {c.phone}
                          </a>
                          {c.email && (
                            <span className="text-[11px] text-slate-400 block font-normal truncate max-w-[160px]">
                              {c.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="p-4 text-slate-600">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-slate-800 block">
                            {c.district || 'চাঁদপুর'}
                            {c.upazila ? `, ${c.upazila}` : ''}
                          </span>
                          <span className="text-[11px] text-slate-400 block line-clamp-1">
                            {c.address || 'ঠিকানা পাওয়া যায়নি'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Total Orders */}
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                        <ShoppingBag className="w-3 h-3 text-slate-500" />
                        {c.ordersCount || 0}
                      </span>
                    </td>

                    {/* Consultations */}
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                        <Stethoscope className="w-3 h-3 text-slate-500" />
                        {c.consultationsCount || 0}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                      ৳{(c.totalSpent || 0).toLocaleString('bn-BD')}
                    </td>

                    {/* Registration Date */}
                    <td className="p-4 text-slate-500 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString('bn-BD', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'পূর্ববর্তী'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        সক্রিয় (Active)
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(c);
                        }}
                        className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> বিবরণ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCustomerDetail(null);
        }}
        title="গ্রাহকের সম্পূর্ণ বিবরণ ও ইতিহাস"
        maxWidth="xl"
      >
        {detailLoading || !customerDetail ? (
          <div className="py-12 text-center">
            <LoadingSpinner text="গ্রাহকের বিস্তারিত তথ্য লোড হচ্ছে..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer Profile Header Card */}
            <div className="p-4 sm:p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg shadow-xs">
                  {customerDetail.customer.name ? customerDetail.customer.name.charAt(0) : 'গ'}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {customerDetail.customer.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <a
                      href={`tel:${customerDetail.customer.phone}`}
                      className="text-xs font-mono font-bold text-emerald-800 hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      {customerDetail.customer.phone}
                    </a>
                    {customerDetail.customer.email && (
                      <a
                        href={`mailto:${customerDetail.customer.email}`}
                        className="text-xs text-slate-700 hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200"
                      >
                        <Mail className="w-3 h-3 text-slate-500" />
                        {customerDetail.customer.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`tel:${customerDetail.customer.phone}`}
                  className="flex-1 sm:flex-none text-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
                >
                  সরাসরি কল
                </a>
                <a
                  href={`https://wa.me/880${customerDetail.customer.phone.replace(/^0+/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none text-center bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
                >
                  হোয়াটসঅ্যাপ
                </a>
              </div>
            </div>

            {/* Profile Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 block">মোট অর্ডার</span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                  {customerDetail.orders.length || customerDetail.customer.ordersCount || 0} টি
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 block">পরামর্শ ফর্ম</span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                  {customerDetail.consultations.length ||
                    customerDetail.customer.consultationsCount ||
                    0}{' '}
                  টি
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 block">মোট ক্রয়</span>
                <span className="text-base font-extrabold text-emerald-700 mt-0.5 block">
                  ৳{(customerDetail.customer.totalSpent || 0).toLocaleString('bn-BD')}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 block">জেলা</span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                  {customerDetail.customer.district || 'চাঁদপুর'}
                </span>
              </div>
            </div>

            {/* Address Info */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <span className="font-bold text-slate-700 block mb-1">গ্রাহকের পূর্ণ ঠিকানা:</span>
              <p className="text-slate-600 leading-relaxed">
                {customerDetail.customer.address || 'পূর্ণ ঠিকানা প্রদান করা হয়নি'}
                {customerDetail.customer.upazila ? `, উপজেলা: ${customerDetail.customer.upazila}` : ''}
                {customerDetail.customer.district ? `, জেলা: ${customerDetail.customer.district}` : ''}
              </p>
            </div>

            {/* Customer Orders History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>অর্ডারের ইতিহাস ({customerDetail.orders.length})</span>
                <Link
                  to="/admin/orders"
                  className="text-emerald-700 hover:underline flex items-center gap-1 font-bold text-xs lowercase"
                >
                  সব অর্ডার দেখুন <ChevronRight className="w-3 h-3" />
                </Link>
              </h4>

              {customerDetail.orders.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-slate-100">
                  গ্রাহকের কোনো অর্ডারের ইতিহাস পাওয়া যায়নি
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customerDetail.orders.map((o) => (
                    <div
                      key={o.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            #{o.orderNumber}
                          </span>
                          <StatusBadge status={o.orderStatus} />
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          তারিখ: {new Date(o.createdAt).toLocaleDateString('bn-BD')} | আইটেম:{' '}
                          {o.items ? o.items.length : 1} টি
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        ৳{o.totalAmount.toLocaleString('bn-BD')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Consultations History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>অনলাইন পরামর্শের ইতিহাস ({customerDetail.consultations.length})</span>
                <Link
                  to="/admin/consultations"
                  className="text-emerald-700 hover:underline flex items-center gap-1 font-bold text-xs lowercase"
                >
                  সব পরামর্শ দেখুন <ChevronRight className="w-3 h-3" />
                </Link>
              </h4>

              {customerDetail.consultations.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-slate-100">
                  গ্রাহকের কোনো পরামর্শের আবেদন পাওয়া যায়নি
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customerDetail.consultations.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {c.problem ? c.problem.substring(0, 45) + '...' : 'পরামর্শ আবেদন'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {c.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          আবেদনের তারিখ: {new Date(c.createdAt).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
