import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, BookOpen, Clock, ArrowRight, User, Tag, X } from 'lucide-react';
import api from '../services/api';
import { Article, ArticleCategory } from '../types';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';
import { Pagination } from '../components/Pagination';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const Blog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/articles/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load article categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        let url = `/articles?page=${page}&limit=9`;
        if (categoryParam) url += `&category=${categoryParam}`;
        if (searchParam) url += `&search=${encodeURIComponent(searchParam)}`;

        const res = await api.get(url);
        if (res.data.success) {
          setArticles(res.data.data.articles);
          setTotalPages(res.data.data.pagination.totalPages);
        }
      } catch (err) {
        console.error('Failed to load articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [categoryParam, searchParam, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set('search', searchTerm.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (slug: string) => {
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set('category', slug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          স্বাস্থ্য কথা ও সচেতনতা
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          স্বাস্থ্য ও ত্বক বিষয়ক পরামর্শ ও নিবন্ধ
        </h1>
        <p className="text-sm text-slate-600">
          প্রাত্যহিক স্বাস্থ্য সুরক্ষা, ত্বকের যত্ন ও সুস্থ জীবনযাপন সম্পর্কিত তথ্য জেনে সচেতন থাকুন।
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                !categoryParam
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              সকল নিবন্ধ
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition ${
                  categoryParam === cat.slug
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.nameBn}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নিবন্ধ অনুসন্ধান করুন..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('search');
                  setSearchParams(newParams);
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <LoadingSpinner text="নিবন্ধ লোড হচ্ছে..." />
      ) : articles.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-12 h-12" />}
          title="কোনো নিবন্ধ পাওয়া যায়নি"
          description="আপনার অনুসন্ধান অনুযায়ী কোনো নিবন্ধ খুঁজে পাওয়া যায়নি।"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {articles.map((art) => (
              <article
                key={art.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden hover:border-emerald-300 hover:shadow-clinic-lg transition-all flex flex-col group"
              >
                {art.coverImage && (
                  <Link to={`/blog/${art.slug}`} className="aspect-video block overflow-hidden bg-slate-100 relative">
                    <img
                      src={art.coverImage}
                      alt={art.titleBn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {art.category && (
                      <span className="absolute bottom-3 left-3 bg-emerald-800/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                        {art.category.nameBn}
                      </span>
                    )}
                  </Link>
                )}

                <div className="p-6 flex-1 flex flex-col space-y-3">
                  <Link
                    to={`/blog/${art.slug}`}
                    className="font-bold text-slate-900 text-lg leading-snug hover:text-emerald-700 transition line-clamp-2"
                  >
                    {art.titleBn}
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
                    {art.excerptBn || art.excerpt}
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-emerald-600" /> {art.author}
                    </span>
                    <Link
                      to={`/blog/${art.slug}`}
                      className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      পড়ুন <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
