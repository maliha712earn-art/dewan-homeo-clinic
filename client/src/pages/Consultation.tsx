import React, { useState } from 'react';
import { Stethoscope, ShieldCheck, Upload, CheckCircle2, Phone, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const Consultation: React.FC = () => {
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    address: '',
    problem: '',
    duration: '',
    previousTreatment: '',
    notes: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const phone = settings.phone || '01643184368';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 4);
      setSelectedFiles(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.problem.trim()) {
      showToast('নাম, মোবাইল নম্বর এবং সমস্যার বিবরণ অবশ্যই পূরণ করতে হবে।', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('phone', formData.phone.trim());
      if (formData.age) data.append('age', formData.age);
      if (formData.gender) data.append('gender', formData.gender);
      if (formData.address) data.append('address', formData.address.trim());
      data.append('problem', formData.problem.trim());
      if (formData.duration) data.append('duration', formData.duration.trim());
      if (formData.previousTreatment) data.append('previousTreatment', formData.previousTreatment.trim());
      if (formData.notes) data.append('notes', formData.notes.trim());

      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      const res = await api.post('/consultations', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSubmitted(true);
        showToast('আপনার পরামর্শ অনুরোধ সফলভাবে জমা হয়েছে।', 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'পরামর্শ অনুরোধ জমা দিতে সমস্যা হয়েছে।';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          আপনার পরামর্শ অনুরোধ সফলভাবে জমা হয়েছে!
        </h1>
        <p className="text-base text-slate-600 leading-relaxed bg-emerald-50 p-6 rounded-2xl border border-emerald-200">
          "আপনার তথ্য দেওয়ার পর প্রয়োজন অনুযায়ী ক্লিনিক থেকে যোগাযোগ করা হবে।"
        </p>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
          <span className="font-semibold block mb-1">জরুরি প্রয়োজনে সরাসরি যোগাযোগ করতে পারেন:</span>
          <a href={`tel:${phone}`} className="font-bold text-emerald-800 text-base hover:underline">
            📞 {phone}
          </a>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              name: '',
              phone: '',
              age: '',
              gender: 'Male',
              address: '',
              problem: '',
              duration: '',
              previousTreatment: '',
              notes: '',
            });
            setSelectedFiles([]);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow transition"
        >
          নতুন আরেকটি অনুরোধ পাঠান
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          অনলাইন সেবা
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          অনলাইন পরামর্শ ফর্ম
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          আপনার সমস্যা ও লক্ষণ সম্পর্কে প্রয়োজনীয় তথ্য দিন। তথ্যের ভিত্তিতে উপযুক্ত পরামর্শ প্রদানের চেষ্টা করা হবে।
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-emerald-950 text-xs sm:text-sm">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5">গোপনীয়তা সুরক্ষা:</strong>
          আপনার দেওয়া সকল তথ্য ও ছবি সম্পূর্ণ গোপন রাখা হবে এবং শুধুমাত্র ক্লিনিকের চিকিৎসকের মূল্যায়নের কাজে ব্যবহার করা হবে।
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              আপনার নাম <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="আপনার পূর্ণ নাম লিখুন"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              মোবাইল নম্বর <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="যেমন: 017XXXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              বয়স
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="যেমন: 28"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              লিঙ্গ
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="Male">পুরুষ</option>
              <option value="Female">মহিলা</option>
              <option value="Other">অন্যান্য</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            ঠিকানা / জেলা
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="আপনার বর্তমান ঠিকানা বা জেলা লিখুন"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        {/* Chief Complaint / Problem */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            সমস্যার বিবরণ ও শারীরিক লক্ষণ <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={formData.problem}
            onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
            placeholder="আপনার ত্বকের সমস্যা বা শারীরিক সমস্যার বিস্তারিত লক্ষণ বর্ণনা করুন..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm leading-relaxed"
          />
        </div>

        {/* Duration & Previous treatment in 2 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              সমস্যার স্থায়িত্ব / কতদিন ধরে?
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="যেমন: ৩ মাস, ১ বছর"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              পূর্বে কোনো চিকিৎসা নিয়ে থাকলে বিবরণ
            </label>
            <input
              type="text"
              value={formData.previousTreatment}
              onChange={(e) => setFormData({ ...formData, previousTreatment: e.target.value })}
              placeholder="যেমন: কোনো মলম বা ওষুধের নাম"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        {/* Additional notes */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            অন্য কোনো মন্তব্য বা তথ্য (ঐচ্ছিক)
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="অতিরিক্ত কোনো তথ্য জানাতে চাইলে লিখুন"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        {/* Image Attachment (Optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            আক্রান্ত অংশের ছবি সংযুক্ত করুন (ঐচ্ছিক, সর্বোচ্চ ৪টি)
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-400 transition bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <input
              type="file"
              multiple
              accept="image/*"
              id="consultation-images"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="consultation-images"
              className="cursor-pointer text-sm font-bold text-emerald-700 hover:text-emerald-800"
            >
              ছবি নির্বাচন করুন
            </label>
            <p className="text-xs text-slate-400 mt-1">JPEG, PNG বা WEBP (সর্বোচ্চ 5MB প্রতি ছবি)</p>
            {selectedFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {selectedFiles.map((f, i) => (
                  <span
                    key={i}
                    className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-medium"
                  >
                    {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Notice */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
          "আপনার তথ্য দেওয়ার পর প্রয়োজন অনুযায়ী ক্লিনিক থেকে যোগাযোগ করা হবে।"
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>পরামর্শ অনুরোধ জমা দিন</span>
        </button>
      </form>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
