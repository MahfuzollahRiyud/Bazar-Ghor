import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    ChevronRight,
    Clock,
    Eye,
    Newspaper,
    Search,
    Sparkles,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface BlogPostItem {
    id: number;
    title: string;
    slug: string;
    category?: string | null;
    featured_image?: string | null;
    image_url?: string | null;
    excerpt?: string | null;
    author_name?: string | null;
    is_published: boolean;
    published_at?: string | null;
    views_count: number;
    reading_time: number;
    created_at: string;
}

interface CategoryCount {
    category: string;
    count: number;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    posts: Paginated<BlogPostItem>;
    categories: CategoryCount[];
    featuredPost?: BlogPostItem | null;
    filters: {
        search: string;
        category: string;
    };
}

export default function BlogIndex({ posts, categories, featuredPost, filters }: Props) {
    const { t, language } = useLanguage();
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/blog',
            { search: search.trim(), category: filters.category },
            { preserveState: true, replace: true }
        );
    };

    const handleCategoryClick = (catSlug: string) => {
        router.get(
            '/blog',
            { category: catSlug === filters.category ? '' : catSlug, search: filters.search },
            { preserveState: true, replace: true }
        );
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (language === 'bn') {
            return d.toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Filter out featured post from regular grid if shown as hero to avoid duplicate card
    const gridPosts = featuredPost
        ? posts.data.filter((p) => p.id !== featuredPost.id)
        : posts.data;

    return (
        <>
            <Head>
                <title>{language === 'bn' ? 'গ্যাজেট ব্লগ ও টেক টিপস — Bazar Ghor' : 'Gadget Blog & Buying Guides — Bazar Ghor'}</title>
                <meta
                    name="description"
                    content={language === 'bn'
                        ? 'স্মার্ট গ্যাজেটস, এয়ারবাডস, স্মার্টওয়াচ ও চার্জারের রিভিউ, সঠিক গাইড এবং টেক টিপস পড়ুন বাজার ঘর ব্লগে।'
                        : 'Explore gadget reviews, buying guides, and technical tips on Bazar Ghor Blog.'}
                />
            </Head>

            <div className="min-h-screen bg-gray-50/60 pb-16">
                {/* Header Banner */}
                <div className="relative bg-[#194315] text-white py-12 md:py-16 overflow-hidden">
                    {/* Decorative subtle pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-green-200 backdrop-blur-xs mb-3 border border-white/15">
                            <Sparkles size={14} className="text-yellow-300" />
                            <span>{language === 'bn' ? 'বাজার ঘর গ্যাজেট জার্নাল' : 'Bazar Ghor Gadget Journal'}</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                            {language === 'bn' ? 'টেক জ্ঞান ও গ্যাজেট গাইড' : 'Tech Insights & Gadget Guides'}
                        </h1>
                        <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base text-green-100 font-normal leading-relaxed">
                            {language === 'bn'
                                ? 'আপনার পছন্দের গ্যাজেটের সঠিক ব্যবহার, সেরা রিভিউ এবং ব্যাটারি সুরক্ষার প্রয়োজনীয় সব পরামর্শ এক জায়গায়।'
                                : 'Expert reviews, setup guides, and smart maintenance tips for genuine electronics and audio gear.'}
                        </p>

                        {/* Search Bar */}
                        <div className="mt-6 max-w-lg mx-auto">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={language === 'bn' ? 'আর্টিকেল বা গ্যাজেট সার্চ করুন...' : 'Search articles, earbuds, tips...'}
                                    className="w-full rounded-full border border-green-700/60 bg-white/95 text-gray-900 placeholder:text-gray-400 pl-5 pr-12 py-3 text-sm focus:bg-white focus:outline-none focus:ring-3 focus:ring-green-400 shadow-md"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-[#2d6a27] text-white hover:bg-[#23531f] transition shadow-xs"
                                    aria-label="Search articles"
                                >
                                    <Search size={16} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
                    {/* Category Filter Pills */}
                    {categories.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
                            <button
                                onClick={() => handleCategoryClick('')}
                                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                    !filters.category
                                        ? 'bg-[#2d6a27] text-white shadow-xs'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                {language === 'bn' ? 'সকল পোস্ট' : 'All Articles'}
                            </button>
                            {categories.map((c) => (
                                <button
                                    key={c.category}
                                    onClick={() => handleCategoryClick(c.category)}
                                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                                        filters.category === c.category
                                            ? 'bg-[#2d6a27] text-white shadow-xs'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    <span>{c.category}</span>
                                    <span
                                        className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                                            filters.category === c.category
                                                ? 'bg-white/25 text-white'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {c.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Featured Top Post (Only on 1st page without active search/category filter) */}
                    {featuredPost && (
                        <div className="mb-10 rounded-3xl overflow-hidden bg-white border border-gray-200/80 shadow-sm transition hover:shadow-md">
                            <div className="grid grid-cols-1 lg:grid-cols-12">
                                <Link
                                    href={`/blog/${featuredPost.slug}`}
                                    className="lg:col-span-7 relative aspect-video lg:aspect-auto overflow-hidden bg-gray-100 block group"
                                >
                                    {featuredPost.image_url ? (
                                        <img
                                            src={featuredPost.image_url}
                                            alt={featuredPost.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-green-50 text-green-700">
                                            <Newspaper size={48} />
                                        </div>
                                    )}
                                    {featuredPost.category && (
                                        <span className="absolute top-4 left-4 rounded-full bg-[#194315]/90 backdrop-blur-xs px-3 py-1 text-xs font-bold text-white shadow-xs">
                                            {featuredPost.category}
                                        </span>
                                    )}
                                </Link>

                                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={13} className="text-[#2d6a27]" />
                                                <span>{formatDate(featuredPost.published_at)}</span>
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={13} className="text-[#2d6a27]" />
                                                <span>{featuredPost.reading_time || 2} {t.readTime}</span>
                                            </span>
                                        </div>

                                        <Link href={`/blog/${featuredPost.slug}`}>
                                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-[#2d6a27] transition-colors leading-snug line-clamp-3">
                                                {featuredPost.title}
                                            </h2>
                                        </Link>

                                        {featuredPost.excerpt && (
                                            <p className="mt-3 text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                                {featuredPost.excerpt}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                            <User size={13} className="text-gray-400" />
                                            <span>{featuredPost.author_name || 'Bazar Ghor'}</span>
                                        </span>

                                        <Link
                                            href={`/blog/${featuredPost.slug}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2d6a27] hover:text-[#23531f] transition group"
                                        >
                                            <span>{t.readMore}</span>
                                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section Title */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen size={20} className="text-[#2d6a27]" />
                            <span>{t.latestPosts}</span>
                        </h2>
                        <span className="text-xs text-gray-500 font-medium">
                            {posts.total} {language === 'bn' ? 'টি আর্টিকেল' : 'Articles'}
                        </span>
                    </div>

                    {/* Articles Grid */}
                    {gridPosts.length === 0 && !featuredPost ? (
                        <div className="rounded-3xl border border-gray-200 bg-white py-16 px-4 text-center shadow-xs">
                            <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900">{t.noPostsFound}</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                                {language === 'bn'
                                    ? 'আপনার অনুসন্ধানের সাথে মিল রেখে কোনো ব্লগ পোস্ট পাওয়া যায়নি। অন্য কিওয়ার্ড দিয়ে আবার চেষ্টা করুন।'
                                    : 'No articles match your search criteria. Try different search terms or categories.'}
                            </p>
                            {(filters.search || filters.category) && (
                                <Link
                                    href="/blog"
                                    className="mt-5 inline-flex items-center rounded-full bg-[#2d6a27] px-5 py-2 text-xs font-semibold text-white hover:bg-[#23531f] transition"
                                >
                                    {language === 'bn' ? 'সব আর্টিকেল দেখুন' : 'View all articles'}
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                            {gridPosts.map((post) => (
                                <article
                                    key={post.id}
                                    className="group flex flex-col rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden"
                                >
                                    {/* Cover Image */}
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="relative aspect-16/10 overflow-hidden bg-gray-100 block"
                                    >
                                        {post.image_url ? (
                                            <img
                                                src={post.image_url}
                                                alt={post.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = '/images/logo.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-green-50/60 text-green-700">
                                                <Newspaper size={32} />
                                            </div>
                                        )}

                                        {post.category && (
                                            <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-2xs">
                                                {post.category}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Card Content */}
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-2">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} className="text-gray-400" />
                                                    <span>{formatDate(post.published_at)}</span>
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} className="text-gray-400" />
                                                    <span>{post.reading_time || 2} {t.readTime}</span>
                                                </span>
                                            </div>

                                            <Link href={`/blog/${post.slug}`}>
                                                <h3 className="font-bold text-gray-900 group-hover:text-[#2d6a27] transition-colors leading-snug line-clamp-2 text-base">
                                                    {post.title}
                                                </h3>
                                            </Link>

                                            {post.excerpt && (
                                                <p className="mt-2 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                    {post.excerpt}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
                                            <span className="text-gray-500 flex items-center gap-1 font-medium truncate max-w-[130px]">
                                                <User size={12} className="text-gray-400 shrink-0" />
                                                <span className="truncate">{post.author_name || 'Bazar Ghor'}</span>
                                            </span>

                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="inline-flex items-center gap-1 font-bold text-[#2d6a27] hover:text-[#23531f] transition"
                                            >
                                                <span>{t.readMore}</span>
                                                <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {posts.links && posts.links.length > 3 && (
                        <div className="mt-12 flex items-center justify-center gap-1.5">
                            {posts.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                                        link.active
                                            ? 'bg-[#2d6a27] text-white shadow-xs'
                                            : link.url
                                            ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                            : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
