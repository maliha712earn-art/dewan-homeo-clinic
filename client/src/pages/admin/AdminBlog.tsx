import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, Upload, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { Article, ArticleCategory } from '../../types';
import { Modal } from '../../components/Modal';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminBlog: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const [formData, setFormData] = useState({
    titleBn: '',
    title: '',
    slug: '',
    contentBn: '',
    excerptBn: '',
    coverImage: '',
    author: 'দেওয়ান হোমিও ক্লিনিক',
    tags: 'ত্বকের যত্ন, হোমিওপ্যাথি, পরামর্শ',
    seoTitle: '',
    seoDescription: '',
    isPublished: true,
    categoryId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const [artRes, catRes] = await Promise.all([
        api.get('/admin/articles'),
        api.get('/articles/categories'),
      ]);
      if (artRes.data.success) setArticles(artRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setFormData({
      titleBn: '',
      title: '',
      slug: '',
      contentBn: '',
      excerptBn: '',
      coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      author: 'দেওয়ান হোমিও ক্লিনিক',
      tags: 'ত্বকের যত্ন, হোমিওপ্যাথি, পরামর্শ',
      seoTitle: '',
      seoDescription: '',
      isPublished: true,
      categoryId: categories[0]?.id || '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (art: Article) => {
    setEditingArticle(art);
    setFormData({
      titleBn: art.titleBn,
      title: art.title,
      slug: art.slug,
      contentBn: art.contentBn,
      excerptBn: art.excerptBn || '',
      coverImage: art.coverImage || '',
      author: art.author,
      tags: art.tags || '',
      seoTitle: art.seoTitle || '',
      seoDescription: art.seoDescription || '',
      isPublished: art.isPublished,
      categoryId: art.categoryId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleBn.trim() || !formData.contentBn.trim() || !formData.categoryId) {
      showToast('শিরোনাম, মূল কনটেন্ট এবং ক্যাটাগরি পূরণ করা আবশ্যক।', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingArticle) {
        const res = await api.put(`/admin/articles/${editingArticle.id}`, formData);
        if (res.data.success) {
          showToast('আর্টিকেল সফলভাবে আপডেট করা হয়েছে।', 'success');
          setModalOpen(false);
          fetchArticles();
        }
      } else {
        const res = await api.post('/admin/articles', formData);
        if (res.data.success) {
          showToast('নতুন আর্টিকেল তৈরি হয়েছে।', 'success');
          setModalOpen(false);
          fetchArticles();
        }
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'আর্টিকেল সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`আপনি কি "${title}" মুছে ফেলতে চান?`)) return;
    try {
      const res = await api.delete(`/admin/articles/${id}`);
      if (res.data.success) {
        showToast('আর্টিকেল মুছে ফেলা হয়েছে।', 'success');
        fetchArticles();
      }
    } catch (err) {
      showToast('মুছতে সমস্যা হয়েছে।', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">স্বাস্থ্য কথা (Health Articles)</h1>
          <p className="text-xs text-slate-500 mt-0.5">স্বাস্থ্য ও ত্বক সচেতনতামূলক ব্লগ কনটেন্ট ব্যবস্থাপনা</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> নতুন নিবন্ধ লিখুন
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="নিবন্ধ তালিকা লোড হচ্ছে..." />
      ) : articles.length === 0 ? (
        <EmptyState title="কোনো আর্টিকেল পাওয়া যায়নি" />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-4">শিরোনাম</th>
                  <th className="p-4">ক্যাটাগরি</th>
                  <th className="p-4">লেখক</th>
                  <th className="p-4">ভিউ</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900 max-w-sm">
                      <span className="line-clamp-1">{art.titleBn}</span>
                      <span className="text-xs text-slate-400 font-normal font-mono">{art.slug}</span>
                    </td>
                    <td className="p-4 text-slate-600">{art.category?.nameBn || '-'}</td>
                    <td className="p-4 text-slate-600">{art.author}</td>
                    <td className="p-4 text-slate-600">{art.viewCount} বার</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        art.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {art.isPublished ? 'প্রকাশিত' : 'ড্রাফট'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(art)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(art.id, art.titleBn)}
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
        title={editingArticle ? 'নিবন্ধ সম্পাদনা' : 'নতুন নিবন্ধ প্রকাশ'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              নিবন্ধের শিরোনাম (বাংলা) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.titleBn}
              onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
              placeholder="যেমন: ত্বকের যত্নে দৈনন্দিন করণীয়"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ক্যাটাগরি <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameBn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">লেখক</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">কভার ছবি (Image URL)</label>
            <input
              type="text"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">সংক্ষিপ্ত সারাংশ (Excerpt)</label>
            <textarea
              rows={2}
              value={formData.excerptBn}
              onChange={(e) => setFormData({ ...formData, excerptBn: e.target.value })}
              placeholder="নিবন্ধের ২ লাইনের সারসংক্ষেপ..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              সম্পূর্ণ বিষয়বস্তু (Content) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={formData.contentBn}
              onChange={(e) => setFormData({ ...formData, contentBn: e.target.value })}
              placeholder="বিস্তারিত নিবন্ধ লিখুন..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ট্যাগ (কমা দিয়ে আলাদা করুন)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="ত্বকের যত্ন, হোমিওপ্যাথি, পরামর্শ"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            প্রকাশিত রাখুন (Published)
          </label>

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
