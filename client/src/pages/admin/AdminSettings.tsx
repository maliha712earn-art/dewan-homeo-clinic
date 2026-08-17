import React, { useEffect, useState } from 'react';
import { Settings, Save, RefreshCw, Truck, ShieldCheck, MapPin, Phone, Globe, Info } from 'lucide-react';
import api from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const AdminSettings: React.FC = () => {
  const { settings, deliverySettings, refetchSettings } = useSettings();
  const { showToast } = useToast();

  const [formSettings, setFormSettings] = useState({
    CLINIC_NAME: '',
    CLINIC_NAME_EN: '',
    TAGLINE: '',
    PHONE: '',
    WHATSAPP: '',
    EMAIL: '',
    PRIMARY_ADDRESS: '',
    ADDITIONAL_ADDRESS: '',
    OPENING_HOURS: '',
    HERO_TITLE: '',
    HERO_SUBTITLE: '',
    DISCLAIMER_TEXT: '',
    GUEST_CHECKOUT_ENABLED: 'true',
    ALLOW_ONLINE_ORDERS: 'true',
  });

  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success) {
          setFormSettings(res.data.data.settings);
          setDeliveryZones(res.data.data.deliverySettings || []);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/admin/settings', { settings: formSettings });
      if (res.data.success) {
        showToast('ওয়েবসাইট সেটিংস সফলভাবে আপডেট হয়েছে।', 'success');
        refetchSettings();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'সেটিংস আপডেট ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeliveryChargeChange = (id: string, newCharge: number) => {
    setDeliveryZones((prev) =>
      prev.map((d) => (d.id === id ? { ...d, charge: newCharge } : d))
    );
  };

  const handleSaveDeliverySettings = async (zone: any) => {
    setSavingDelivery(true);
    try {
      const res = await api.put(`/admin/settings/delivery/${zone.id}`, {
        charge: Number(zone.charge),
        areaNameBn: zone.areaNameBn,
        estimatedDays: zone.estimatedDays,
        isActive: zone.isActive,
      });
      if (res.data.success) {
        showToast(`"${zone.areaNameBn}" ডেলিভারি চার্জ আপডেট হয়েছে।`, 'success');
        refetchSettings();
      }
    } catch (err) {
      showToast('ডেলিভারি সেটিংস আপডেট ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSavingDelivery(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="সেটিংস লোড হচ্ছে..." className="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">ওয়েবসাইট সেটিংস ও কনফিগারেশন</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          ক্লিনিকের তথ্য, ঠিকানা, যোগাযোগের নম্বর, হিরো ব্যানার এবং ডেলিভারি চার্জ পরিবর্তন করুন।
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Basic Clinic Identity */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" /> ক্লিনিকের পরিচিতি ও যোগাযোগ
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                ক্লিনিকের নাম (বাংলা)
              </label>
              <input
                type="text"
                value={formSettings.CLINIC_NAME}
                onChange={(e) => setFormSettings({ ...formSettings, CLINIC_NAME: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                ক্লিনিকের নাম (English)
              </label>
              <input
                type="text"
                value={formSettings.CLINIC_NAME_EN}
                onChange={(e) => setFormSettings({ ...formSettings, CLINIC_NAME_EN: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              ট্যাগলাইন (Tagline)
            </label>
            <input
              type="text"
              value={formSettings.TAGLINE}
              onChange={(e) => setFormSettings({ ...formSettings, TAGLINE: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                প্রধান মোবাইল নম্বর
              </label>
              <input
                type="text"
                value={formSettings.PHONE}
                onChange={(e) => setFormSettings({ ...formSettings, PHONE: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                হোয়াটসঅ্যাপ নম্বর
              </label>
              <input
                type="text"
                value={formSettings.WHATSAPP}
                onChange={(e) => setFormSettings({ ...formSettings, WHATSAPP: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                ক্লিনিক ইমেইল
              </label>
              <input
                type="email"
                value={formSettings.EMAIL}
                onChange={(e) => setFormSettings({ ...formSettings, EMAIL: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Address & Hours */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" /> অবস্থান ও সময়সূচি
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              মূল ক্লিনিক ঠিকানা (Primary Address)
            </label>
            <input
              type="text"
              value={formSettings.PRIMARY_ADDRESS}
              onChange={(e) => setFormSettings({ ...formSettings, PRIMARY_ADDRESS: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              অতিরিক্ত দিকনির্দেশনা (Additional Address / Landmark)
            </label>
            <textarea
              rows={2}
              value={formSettings.ADDITIONAL_ADDRESS}
              onChange={(e) => setFormSettings({ ...formSettings, ADDITIONAL_ADDRESS: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              সেবার সময়সূচি (Opening Hours)
            </label>
            <input
              type="text"
              value={formSettings.OPENING_HOURS}
              onChange={(e) => setFormSettings({ ...formSettings, OPENING_HOURS: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Hero Section & Disclaimer */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600" /> হোম ব্যানার ও ডিসক্লেইমার
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              হিরো সেকশন বড় শিরোনাম
            </label>
            <input
              type="text"
              value={formSettings.HERO_TITLE}
              onChange={(e) => setFormSettings({ ...formSettings, HERO_TITLE: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              হিরো সেকশন উপ-শিরোনাম / বিবরণ
            </label>
            <textarea
              rows={2}
              value={formSettings.HERO_SUBTITLE}
              onChange={(e) => setFormSettings({ ...formSettings, HERO_SUBTITLE: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              মেডিকেল ডিসক্লেইমার লেখা (Mandatory Disclaimer)
            </label>
            <textarea
              rows={2}
              value={formSettings.DISCLAIMER_TEXT}
              onChange={(e) => setFormSettings({ ...formSettings, DISCLAIMER_TEXT: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.GUEST_CHECKOUT_ENABLED === 'true'}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    GUEST_CHECKOUT_ENABLED: e.target.checked ? 'true' : 'false',
                  })
                }
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              গেস্ট চেকআউট সক্রিয় রাখুন (Guest Checkout Enabled)
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন (Save Settings)'}</span>
        </button>
      </form>

      {/* Delivery Zones Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600" /> ডেলিভারি এলাকা ও চার্জ কনফিগারেশন
        </h2>

        <div className="divide-y divide-slate-100">
          {deliveryZones.map((zone) => (
            <div key={zone.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{zone.areaNameBn}</span>
                <span className="text-slate-500 text-xs">আনুমানিক সময়: {zone.estimatedDays}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">চার্জ (৳):</span>
                <input
                  type="number"
                  value={zone.charge}
                  onChange={(e) => handleDeliveryChargeChange(zone.id, parseInt(e.target.value, 10) || 0)}
                  className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-center"
                />
                <button
                  type="button"
                  onClick={() => handleSaveDeliverySettings(zone)}
                  disabled={savingDelivery}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition"
                >
                  আপডেট
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
