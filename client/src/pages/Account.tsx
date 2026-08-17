import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ShoppingBag, Stethoscope, Settings, LogOut, Package, Clock, ShieldCheck, Eye } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Order, Consultation } from '../types';
import { StatusBadge } from '../components/Badge';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';

export const Account: React.FC = () => {
  const { user, token, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'orders' | 'consultations' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingConsultations, setLoadingConsultations] = useState(false);

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    district: user?.district || '',
    upazila: user?.upazila || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        district: user.district || '',
        upazila: user.upazila || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const res = await api.get('/orders/my-orders');
          if (res.data.success) {
            setOrders(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load my orders:', err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    } else if (activeTab === 'consultations') {
      const fetchConsultations = async () => {
        setLoadingConsultations(true);
        try {
          const res = await api.get('/consultations/my-consultations');
          if (res.data.success) {
            setConsultations(res.data.data);
          }
        } catch (err) {
          console.error('Failed to load my consultations:', err);
        } finally {
          setLoadingConsultations(false);
        }
      };
      fetchConsultations();
    }
  }, [activeTab]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', profileForm);
      if (res.data.success) {
        updateUser(res.data.data);
        showToast('প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে।', 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।';
      showToast(msg, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('লগআউট সম্পন্ন হয়েছে।', 'info');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header Profile Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500 font-mono">মোবাইল: {user.phone}</p>
            {user.email && <p className="text-xs text-slate-400">{user.email}</p>}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" /> লগআউট করুন
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> আমার অর্ডারসমূহ ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('consultations')}
          className={`px-5 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'consultations'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" /> পরামর্শের ইতিহাস ({consultations.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" /> প্রোফাইল সেটিংস
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <LoadingSpinner text="অর্ডার লোড হচ্ছে..." />
            ) : orders.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="w-12 h-12" />}
                title="কোনো অর্ডার পাওয়া যায়নি"
                description="আপনি এখনও কোনো অর্ডার প্লেস করেননি।"
                action={
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow"
                  >
                    পণ্য দেখুন ও অর্ডার করুন
                  </Link>
                }
              />
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block">অর্ডার আইডি:</span>
                      <span className="text-base font-mono font-bold text-slate-900">{order.orderNumber}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.orderStatus} />
                      <Link
                        to={`/track-order?orderNumber=${order.orderNumber}`}
                        className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> ট্র্যাক করুন
                      </Link>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-600 space-y-1">
                    <p>ডেলিভারি ঠিকানা: {order.deliveryAddress} {order.district && `(${order.district})`}</p>
                    <p>তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm">
                    <span className="text-slate-500 text-xs">{order.items?.length || 0}টি আইটেম</span>
                    <span className="font-bold text-emerald-800">মোট: ৳{order.totalAmount} (COD)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="space-y-4">
            {loadingConsultations ? (
              <LoadingSpinner text="পরামর্শ ইতিহাস লোড হচ্ছে..." />
            ) : consultations.length === 0 ? (
              <EmptyState
                icon={<Stethoscope className="w-12 h-12" />}
                title="কোনো পরামর্শ অনুরোধ পাওয়া যায়নি"
                description="আপনি এখনও কোনো অনলাইন পরামর্শ ফর্ম পূরণ করেননি।"
                action={
                  <Link
                    to="/consultation"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow"
                  >
                    পরামর্শের জন্য অনুরোধ পাঠান
                  </Link>
                }
              />
            ) : (
              consultations.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs text-slate-400">
                      তারিখ: {new Date(c.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">বর্ণিত সমস্যা:</h3>
                    <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      {c.problem}
                    </p>
                  </div>
                  {c.duration && <p className="text-xs text-slate-500">স্থায়িত্ব: {c.duration}</p>}
                  {c.adminNotes && (
                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                      <strong>ক্লিনিক থেকে উত্তর/নোট:</strong> {c.adminNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <form
            onSubmit={handleProfileSave}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5 max-w-2xl"
          >
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              ব্যক্তিগত তথ্য ও ঠিকানা সম্পাদনা
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                পূর্ণ নাম
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ইমেইল
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  জেলা
                </label>
                <input
                  type="text"
                  value={profileForm.district}
                  onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  থানা / উপজেলা
                </label>
                <input
                  type="text"
                  value={profileForm.upazila}
                  onChange={(e) => setProfileForm({ ...profileForm, upazila: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ঠিকানা
              </label>
              <textarea
                rows={2}
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow transition"
            >
              {savingProfile ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
