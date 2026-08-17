import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Tag, Share2, BookOpen, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Article } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/articles/${slug}`);
        if (res.data.success) {
          setArticle(res.data.data.article);
          setRelatedArticles(res.data.data.relatedArticles || []);
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchArticle();
  }, [slug]);

  if (loading) {
    return <LoadingSpinner text="নিবন্ধ লোড হচ্ছে..." className="min-h-[50vh]" />;
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">নিবন্ধ পাওয়া যায়নি</h2>
        <Link to="/blog" className="inline-block bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">
          ব্লগে ফিরে যান
        </Link>
      </div>
    );
  }

  const tagsList = article.tags?.split(',').map((t) => t.trim()).filter(Boolean) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8">
      {/* Back Link */}
      <Link
        to="/blog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="w-4 h-4" /> সকল নিবন্ধে ফিরে যান
      </Link>

      <article className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6">
        {/* Article Meta Header */}
        <div className="space-y-3">
          {article.category && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              {article.category.nameBn}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            {article.titleBn}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-100 pb-4">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <User className="w-3.5 h-3.5 text-emerald-600" /> {article.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />{' '}
              {new Date(article.createdAt).toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-100">
            <img src={article.coverImage} alt={article.titleBn} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Excerpt */}
        {article.excerptBn && (
          <div className="p-4 bg-emerald-50/50 rounded-2xl border-l-4 border-emerald-600 text-sm font-medium text-emerald-950 leading-relaxed italic">
            "{article.excerptBn}"
          </div>
        )}

        {/* Full Markdown / Content */}
        <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
          {article.contentBn || article.content}
        </div>

        {/* Tags */}
        {tagsList.length > 0 && (
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> ট্যাগ:
            </span>
            {tagsList.map((tag, idx) => (
              <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-bold text-slate-900">অন্যান্য সম্পর্কিত নিবন্ধ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.id}
                to={`/blog/${rel.slug}`}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition space-y-2 block"
              >
                <span className="text-[11px] font-semibold text-emerald-700 block">
                  {rel.category?.nameBn || 'স্বাস্থ্য পরামর্শ'}
                </span>
                <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                  {rel.titleBn}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
