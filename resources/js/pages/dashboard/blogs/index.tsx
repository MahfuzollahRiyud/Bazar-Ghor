import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    Clock,
    Edit3,
    ExternalLink,
    Eye,
    Filter,
    Newspaper,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    posts: Paginated<BlogPostItem>;
    categories: string[];
    filters: {
        search: string;
        status: string;
        category: string;
    };
}

export default function BlogIndex({ posts, categories, filters }: Props) {
    const { t, language } = useAdminLanguage();

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [category, setCategory] = useState(filters.category || '');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/dashboard/blogs',
            { search, status, category },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setCategory('');
        router.get('/dashboard/blogs', {}, { preserveState: true, replace: true });
    };

    const handleToggle = (id: number) => {
        router.patch(
            `/dashboard/blogs/${id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(language === 'bn' ? 'স্ট্যাটাস আপডেট করা হয়েছে।' : 'Status updated.');
                },
            }
        );
    };

    const handleDelete = (post: BlogPostItem) => {
        const confirmMsg = `${t.deleteBlogConfirm}: "${post.title}"?`;
        if (!window.confirm(confirmMsg)) return;

        setDeletingId(post.id);
        router.delete(`/dashboard/blogs/${post.id}`, {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
            onSuccess: () => {
                toast.success(language === 'bn' ? 'ব্লগ পোস্ট মুছে ফেলা হয়েছে।' : 'Blog post deleted.');
            },
        });
    };

    // Calculate quick stats from current page
    const totalPosts = posts.total;
    const publishedCount = posts.data.filter((p) => p.is_published).length;
    const totalViews = posts.data.reduce((acc, curr) => acc + (curr.views_count || 0), 0);

    return (
        <>
            <Head title={language === 'bn' ? 'ব্লগ পোস্টসমূহ — Bazar Ghor Admin' : 'Blog Posts — Bazar Ghor Admin'} />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#2d6a27] shadow-xs">
                                <Newspaper size={22} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                    {t.blogManagement}
                                </h1>
                                <p className="text-sm text-gray-500">{t.blogNotice}</p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/blogs/create"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d6a27] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#23531f] hover:shadow-md active:scale-98 shrink-0"
                    >
                        <Plus size={16} />
                        <span>{t.addBlog}</span>
                    </Link>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                            <span>{language === 'bn' ? 'মোট ব্লগ' : 'Total Articles'}</span>
                            <BookOpen size={16} className="text-green-600" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{totalPosts}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                            <span>{language === 'bn' ? 'প্রকাশিত' : 'Published'}</span>
                            <CheckCircle2 size={16} className="text-emerald-600" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-emerald-600">{publishedCount}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                            <span>{language === 'bn' ? 'ক্যাটাগরি' : 'Categories'}</span>
                            <Filter size={16} className="text-blue-600" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-blue-600">{categories.length}</p>
                    </div>

                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                            <span>{language === 'bn' ? 'মোট ভিউস' : 'Total Views'}</span>
                            <Eye size={16} className="text-purple-600" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-purple-600">{totalViews}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
                    <form onSubmit={handleFilter} className="flex flex-col md:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={language === 'bn' ? 'শিরোনাম বা কন্টেন্ট দিয়ে সার্চ করুন...' : 'Search by title, excerpt, content...'}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a27]/20"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 focus:border-[#2d6a27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a27]/20"
                            >
                                <option value="">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 focus:border-[#2d6a27] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a27]/20"
                            >
                                <option value="">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Status'}</option>
                                <option value="published">{t.published}</option>
                                <option value="draft">{t.draft}</option>
                            </select>

                            <button
                                type="submit"
                                className="rounded-xl bg-[#2d6a27] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#23531f] transition"
                            >
                                {t.filter}
                            </button>

                            {(search || status || category) && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="flex items-center gap-1 rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 transition"
                                    title="Reset filters"
                                >
                                    <RotateCcw size={16} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Blog Posts Table */}
                <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
                    {posts.data.length === 0 ? (
                        <div className="py-16 text-center">
                            <BookOpen size={42} className="mx-auto text-gray-300 mb-3" />
                            <h3 className="text-base font-semibold text-gray-800">{t.noBlogsFound}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {language === 'bn' ? 'নতুন পোস্ট তৈরি করতে উপরের বাটনে ক্লিক করুন।' : 'Click the button above to write your first blog post.'}
                            </p>
                            <Link
                                href="/dashboard/blogs/create"
                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#2d6a27] px-4 py-2 text-sm font-medium text-white hover:bg-[#23531f]"
                            >
                                <Plus size={16} />
                                <span>{t.addBlog}</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50/75 text-xs uppercase tracking-wider text-gray-600">
                                    <tr>
                                        <th className="px-5 py-3.5">{language === 'bn' ? 'আর্টিকেল' : 'Article'}</th>
                                        <th className="px-4 py-3.5">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                                        <th className="px-4 py-3.5">{language === 'bn' ? 'লেখক ও রিডিং টাইম' : 'Author & Read'}</th>
                                        <th className="px-4 py-3.5">{t.views}</th>
                                        <th className="px-4 py-3.5">{t.status}</th>
                                        <th className="px-5 py-3.5 text-right">{t.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {posts.data.map((post) => (
                                        <tr key={post.id} className="hover:bg-gray-50/60 transition-colors">
                                            {/* Article Title & Cover Image */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200/60">
                                                        {post.image_url ? (
                                                            <img
                                                                src={post.image_url}
                                                                alt={post.title}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    (e.currentTarget as HTMLImageElement).src =
                                                                        '/images/logo.png';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                                <Newspaper size={18} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 max-w-md">
                                                        <h4 className="font-semibold text-gray-900 truncate">
                                                            {post.title}
                                                        </h4>
                                                        <p className="text-xs text-gray-400 font-mono truncate">
                                                            /{post.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                {post.category ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-[#2d6a27] border border-green-200/60">
                                                        {post.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>

                                            {/* Author & Read Time */}
                                            <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-600">
                                                <div className="font-medium text-gray-900">{post.author_name || 'Admin'}</div>
                                                <div className="flex items-center gap-1 text-gray-400 mt-0.5">
                                                    <Clock size={11} />
                                                    <span>{post.reading_time || 2} {language === 'bn' ? 'মিনিট' : 'min'}</span>
                                                </div>
                                            </td>

                                            {/* Views */}
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                                                    <Eye size={12} className="text-gray-400" />
                                                    {post.views_count}
                                                </span>
                                            </td>

                                            {/* Status Switch */}
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggle(post.id)}
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                                                        post.is_published
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100'
                                                    }`}
                                                >
                                                    {post.is_published ? (
                                                        <>
                                                            <CheckCircle2 size={12} className="text-emerald-600" />
                                                            <span>{t.published}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle size={12} className="text-amber-600" />
                                                            <span>{t.draft}</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {post.is_published && (
                                                        <a
                                                            href={`/blog/${post.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-green-600 hover:text-[#2d6a27] transition"
                                                            title={language === 'bn' ? 'লাইভ প্রিভিউ দেখুন' : 'View live post'}
                                                        >
                                                            <ExternalLink size={14} />
                                                        </a>
                                                    )}

                                                    <Link
                                                        href={`/dashboard/blogs/${post.id}/edit`}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-blue-600 hover:text-blue-600 transition"
                                                        title={t.edit}
                                                    >
                                                        <Edit3 size={14} />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(post)}
                                                        disabled={deletingId === post.id}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-red-600 hover:text-red-600 transition disabled:opacity-50"
                                                        title={t.delete}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {posts.links && posts.links.length > 3 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-5 py-3">
                            <div className="text-xs text-gray-500">
                                {language === 'bn' ? 'মোট ফলাফল:' : 'Showing'} {posts.data.length} {language === 'bn' ? 'টি' : 'of'} {posts.total}
                            </div>
                            <div className="flex items-center gap-1">
                                {posts.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                            link.active
                                                ? 'bg-[#2d6a27] text-white shadow-xs'
                                                : link.url
                                                ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                                : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
