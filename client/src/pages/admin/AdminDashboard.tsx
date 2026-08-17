import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Stethoscope,
  Users,
  Package,
  Layers,
  MessageSquare,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Eye,
} from 'lucide-react';
import api from '../../services/api';
import { DashboardStats } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="ড্যাশবোর্ড তথ্য লোড হচ্ছে..." className="min-h-[60vh]" />;
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            দেওয়ান হোমিও ক্লিনিক ওভারভিউ ও রিয়েল-টাইম তথ্য
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/orders"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
          >
            অর্ডারসমূহ দেখুন
          </Link>
          <Link
            to="/admin/consultations"
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
          >
            পরামর্শ রিকোয়েস্ট ({stats.consultations.new})
          </Link>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Revenue */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">মোট রাজস্ব (Revenue)</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ৳{stats.orders.totalRevenue.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-700 font-medium block">
            {stats.orders.delivered} টি সফল ডেলিভারি
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">মোট অর্ডার (Orders)</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.orders.total}
          </div>
          <span className="text-xs text-amber-600 font-medium block">
            পেন্ডিং: {stats.orders.pending} টি
          </span>
        </div>

        {/* Consultations */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">পরামর্শ অনুরোধ</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.consultations.total}
          </div>
          <span className="text-xs text-purple-700 font-medium block">
            নতুন অনুরোধ: {stats.consultations.new} টি
          </span>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">নিবন্ধিত গ্রাহক</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.customers.total}
          </div>
          <span className="text-xs text-slate-500 font-medium block">
            মেসেজ: {stats.messages.total} (নতুন: {stats.messages.new})
          </span>
        </div>
      </div>

      {/* Orders Status Breakdown Row */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">অর্ডার স্ট্যাটাস বিভাজন</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-center">
            <span className="text-xs text-amber-800 block">Pending</span>
            <span className="text-xl font-extrabold text-amber-900">{stats.orders.pending}</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-center">
            <span className="text-xs text-blue-800 block">Confirmed</span>
            <span className="text-xl font-extrabold text-blue-900">{stats.orders.confirmed}</span>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-center">
            <span className="text-xs text-purple-800 block">Processing</span>
            <span className="text-xl font-extrabold text-purple-900">{stats.orders.processing}</span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
            <span className="text-xs text-indigo-800 block">Shipped</span>
            <span className="text-xl font-extrabold text-indigo-900">{stats.orders.shipped}</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
            <span className="text-xs text-emerald-800 block">Delivered</span>
            <span className="text-xl font-extrabold text-emerald-900">{stats.orders.delivered}</span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-center">
            <span className="text-xs text-rose-800 block">Cancelled</span>
            <span className="text-xl font-extrabold text-rose-900">{stats.orders.cancelled}</span>
          </div>
        </div>
      </div>

      {/* Recent Orders & Consultations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">সাম্প্রতিক ৫টি অর্ডার</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-emerald-700 hover:underline">
              সকল দেখুন
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">কোনো অর্ডার নেই।</p>
            ) : (
              stats.recentOrders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <span className="font-mono font-bold text-slate-900 block">{ord.orderNumber}</span>
                    <span className="text-slate-500 text-xs">{ord.customerName} ({ord.phone})</span>
                  </div>
                  <div className="text-right space-y-1">
                    <StatusBadge status={ord.orderStatus} />
                    <span className="font-bold text-emerald-800 block text-xs">৳{ord.totalAmount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">সাম্প্রতিক পরামর্শ অনুরোধ</h3>
            <Link to="/admin/consultations" className="text-xs font-bold text-emerald-700 hover:underline">
              সকল দেখুন
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentConsultations.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">কোনো অনুরোধ নেই।</p>
            ) : (
              stats.recentConsultations.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                  <div className="max-w-[70%]">
                    <span className="font-bold text-slate-900 block">{c.name}</span>
                    <span className="text-slate-500 text-xs truncate block">{c.problem}</span>
                  </div>
                  <div className="text-right space-y-1">
                    <StatusBadge status={c.status} />
                    <span className="text-[11px] text-slate-400 block font-mono">{c.phone}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
