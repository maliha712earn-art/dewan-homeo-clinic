import React, { useEffect, useState } from 'react';
import {
  Shield,
  Clock,
  Search,
  RotateCcw,
  AlertCircle,
  X,
  User,
  Activity,
  Layers,
  Globe,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import { AuditLog } from '../../types';
import { Pagination } from '../../components/Pagination';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/admin/audit-logs?page=${page}&limit=15`;
      if (actionFilter !== 'ALL') {
        url += `&action=${encodeURIComponent(actionFilter)}`;
      }
      if (moduleFilter !== 'ALL') {
        url += `&module=${encodeURIComponent(moduleFilter)}`;
      }
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        const payload = res.data.data;
        setLogs(payload.logs || []);
        if (payload.pagination) {
          setTotalPages(payload.pagination.totalPages || 1);
        }
        if (payload.counts) {
          setTotalCount(payload.counts.total || 0);
        }
      } else {
        setError(res.data.message || 'অডিট লগ লোড করা যায়নি।');
      }
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err.response?.data?.message || 'সার্ভার থেকে অডিট লগ আনতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, moduleFilter, debouncedSearch]);

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('LOGIN')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (act.includes('DELETE')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (act.includes('CREATE') || act.includes('ADD')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (act.includes('UPDATE') || act.includes('STATUS') || act.includes('SETTING')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getModuleBadge = (targetType?: string | null) => {
    const mod = (targetType || 'GENERAL').toUpperCase();
    switch (mod) {
      case 'ORDER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PRODUCT':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'SERVICE':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'SETTING':
      case 'SETTINGS':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'CONTACT_MESSAGE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ARTICLE':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'ADMIN':
      case 'AUTH':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-emerald-600" />
            <span>অডিট ট্রেইল (Security Audit Logs)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            অ্যাডমিন প্যানেলের কার্যকলাপ, কনফিগারেশন পরিবর্তন ও নিরাপত্তা সংক্রান্ত পূর্ণাঙ্গ রেকর্ড
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition self-start sm:self-auto disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>রিফ্রেশ করুন</span>
        </button>
      </div>

      {/* Control Bar: Search & Multi-Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="অ্যাকশন, ইমেইল, বিবরণ বা আইপি..."
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

          {/* Action Filter */}
          <div className="relative">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white appearance-none cursor-pointer"
            >
              <option value="ALL">সকল অ্যাকশন (All Actions)</option>
              <option value="LOGIN">লগইন (LOGIN)</option>
              <option value="UPDATE_ORDER_STATUS">অর্ডার স্ট্যাটাস পরিবর্তন</option>
              <option value="UPDATE_MESSAGE_STATUS">বার্তা স্ট্যাটাস পরিবর্তন</option>
              <option value="DELETE_MESSAGE">বার্তা মুছে ফেলা</option>
              <option value="UPDATE_SETTINGS">সেটিংস পরিবর্তন</option>
              <option value="CREATE_PRODUCT">নতুন পণ্য যুক্ত</option>
              <option value="UPDATE_PRODUCT">পণ্য আপডেট</option>
              <option value="DELETE_PRODUCT">পণ্য মুছে ফেলা</option>
            </select>
            <Activity className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Module Filter */}
          <div className="relative">
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white appearance-none cursor-pointer"
            >
              <option value="ALL">সকল মডিউল (All Modules)</option>
              <option value="ORDER">অর্ডার (ORDER)</option>
              <option value="PRODUCT">পণ্য (PRODUCT)</option>
              <option value="SERVICE">সেবা (SERVICE)</option>
              <option value="SETTING">সেটিংস (SETTING)</option>
              <option value="CONTACT_MESSAGE">যোগাযোগ বার্তা (MESSAGE)</option>
              <option value="ARTICLE">ব্লগ ও আর্টিকেল (ARTICLE)</option>
              <option value="ADMIN">প্রশাসক (ADMIN)</option>
            </select>
            <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Active Filter Badges */}
        {(actionFilter !== 'ALL' || moduleFilter !== 'ALL' || debouncedSearch) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">সক্রিয় ফিল্টার:</span>
            {actionFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg">
                অ্যাকশন: {actionFilter}
                <button onClick={() => setActionFilter('ALL')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {moduleFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg">
                মডিউল: {moduleFilter}
                <button onClick={() => setModuleFilter('ALL')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg">
                অনুসন্ধান: "{debouncedSearch}"
                <button onClick={() => setSearchTerm('')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setActionFilter('ALL');
                setModuleFilter('ALL');
                setSearchTerm('');
              }}
              className="text-emerald-700 hover:underline font-bold ml-1 text-xs"
            >
              সব রিসেট করুন
            </button>
          </div>
        )}
      </div>

      {/* Main Table / State View */}
      {loading ? (
        <LoadingSpinner text="অডিট লগ লোড হচ্ছে..." className="min-h-[40vh]" />
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-rose-900">লগ লোড করতে ত্রুটি হয়েছে</h3>
          <p className="text-xs text-rose-700">{error}</p>
          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> পুনরায় চেষ্টা করুন
          </button>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<Shield className="w-12 h-12" />}
          title={
            actionFilter !== 'ALL' || moduleFilter !== 'ALL' || searchTerm
              ? 'ফিল্টার অনুযায়ী কোনো অডিট লগ পাওয়া যায়নি'
              : 'কোনো অডিট লগ রেকর্ড পাওয়া যায়নি'
          }
          description="অ্যাডমিন প্যানেলে যেকোনো কার্যক্রম সম্পন্ন হলে এখানে স্বয়ংক্রিয়ভাবে অডিট রেকর্ড সংরক্ষিত হবে।"
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">তারিখ ও সময়</th>
                  <th className="p-4">অ্যাডমিন / ব্যবহারকারী</th>
                  <th className="p-4">অ্যাকশন (Action)</th>
                  <th className="p-4">মডিউল / রিসোর্স</th>
                  <th className="p-4">বিবরণ (Details)</th>
                  <th className="p-4 text-right">আইপি অ্যাড্রেস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    {/* Timestamp */}
                    <td className="p-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <span className="font-medium block text-slate-900">
                            {new Date(log.createdAt).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            {new Date(log.createdAt).toLocaleTimeString('bn-BD', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Admin User */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {log.admin?.name ? log.admin.name.charAt(0) : 'A'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {log.admin?.name || log.adminEmail || 'প্রধান অ্যাডমিন'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            {log.admin?.email || log.adminEmail || 'admin@dewanhomeo.com'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Module / Target Type */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getModuleBadge(
                          log.targetType || log.resource
                        )}`}
                      >
                        {log.targetType || log.resource || 'GENERAL'}
                      </span>
                    </td>

                    {/* Details / Description */}
                    <td className="p-4 text-slate-700 max-w-xs sm:max-w-md">
                      <p className="leading-relaxed font-normal line-clamp-2">
                        {log.details || 'কোনো অতিরিক্ত বিবরণ নেই'}
                      </p>
                      {log.targetId && (
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          ID: {log.targetId}
                        </span>
                      )}
                    </td>

                    {/* IP Address */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                        <Globe className="w-3 h-3 text-slate-400" />
                        {log.ipAddress || '127.0.0.1'}
                      </span>
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
    </div>
  );
};
