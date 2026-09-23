import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Check,
    Clock,
    Copy,
    Eye,
    Facebook,
    MessageCircle,
    Newspaper,
    Share2,
    ShoppingBag,
    Twitter,
    User,
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
    content: string;
    author_name?: string | null;
    is_published: boolean;
    published_at?: string | null;
    views_count: number;
    reading_time: number;
    meta_title?: string | null;
    meta_description?: string | null;
    tags?: string[] | null;
}

interface ProductItem {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price?: number | null;
    thumbnail?: string | null;
}

interface Props {
    post: BlogPostItem;
    recentPosts: BlogPostItem[];
    recommendedProducts: ProductItem[];
}

export default function BlogShow({ post, recentPosts, recommendedProducts }: Props) {
    const { t, language } = useLanguage();
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

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
            month: 'long',
            day: 'numeric',
        });
    };

    const handleCopy = () => {
        if (!shareUrl) return;
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success(language === 'bn' ? 'লিংক কপি করা হয়েছে!' : 'Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`;
    const twShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`;

    return (
        <>
            <Head>
                <title>{post.meta_title || `${post.title} — Bazar Ghor`}</title>
                <meta name="description" content={post.meta_description || post.excerpt || post.title} />
                <meta property="og:title" content={post.meta_title || post.title} />
                <meta property="og:description" content={post.meta_description || post.excerpt || ''} />
                {post.image_url && <meta property="og:image" content={post.image_url} />}
                <meta property="og:type" content="article" />
            </Head>

            <div className="min-h-screen bg-gray-50/50 pb-20">
                {/* Breadcrumbs */}
                <div className="border-b border-gray-200/80 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                        <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto no-scrollbar">
                            <Link href="/" className="hover:text-[#2d6a27] transition shrink-0">
                                {t.home}
                            </Link>
                            <span>/</span>
                            <Link href="/blog" className="hover:text-[#2d6a27] transition shrink-0">
                                {t.blog}
                            </Link>
                            {post.category && (
                                <>
                                    <span>/</span>
                                    <Link
                                        href={`/blog?category=${encodeURIComponent(post.category)}`}
                                        className="hover:text-[#2d6a27] transition shrink-0"
                                    >
                                        {post.category}
                                    </Link>
                                </>
                            )}
                            <span>/</span>
                            <span className="text-gray-800 font-medium truncate max-w-xs">{post.title}</span>
                        </nav>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                        {/* Main Article Content (8 cols) */}
                        <main className="lg:col-span-8">
                            <article className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-10 shadow-xs">
                                {/* Back link */}
                                <Link
                                    href="/blog"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#2d6a27] mb-6 transition"
                                >
                                    <ArrowLeft size={14} />
                                    <span>{language === 'bn' ? 'সব ব্লগে ফিরে যান' : 'Back to all articles'}</span>
                                </Link>

                                {/* Category Badge */}
                                {post.category && (
                                    <div className="mb-3">
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#2d6a27] border border-green-200/70">
                                            {post.category}
                                        </span>
                                    </div>
                                )}

                                {/* Article Heading */}
                                <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
                                    {post.title}
                                </h1>

                                {/* Meta Info Bar */}
                                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-gray-500 pb-6 border-b border-gray-100">
                                    <span className="flex items-center gap-1.5 font-medium text-gray-800">
                                        <User size={14} className="text-[#2d6a27]" />
                                        <span>{post.author_name || 'Bazar Ghor'}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-[#2d6a27]" />
                                        <span>{formatDate(post.published_at)}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-[#2d6a27]" />
                                        <span>{post.reading_time || 2} {t.readTime}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5">
                                        <Eye size={14} className="text-[#2d6a27]" />
                                        <span>{post.views_count} {language === 'bn' ? 'ভিউস' : 'views'}</span>
                                    </span>
                                </div>

                                {/* Featured Cover Image */}
                                {post.image_url && (
                                    <div className="my-8 rounded-2xl overflow-hidden border border-gray-100 shadow-xs bg-gray-100 aspect-video">
                                        <img
                                            src={post.image_url}
                                            alt={post.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Excerpt Highlight Box */}
                                {post.excerpt && (
                                    <div className="mb-8 rounded-2xl bg-green-50/70 border-l-4 border-[#2d6a27] p-4 sm:p-5 text-sm sm:text-base text-gray-800 font-medium leading-relaxed italic">
                                        "{post.excerpt}"
                                    </div>
                                )}

                                {/* Article Body HTML Content */}
                                <div
                                    className="prose prose-green max-w-none text-gray-800 text-sm sm:text-base leading-relaxed space-y-4 font-normal"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />

                                {/* Tags */}
                                {post.tags && post.tags.length > 0 && (
                                    <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-500">
                                            {language === 'bn' ? 'ট্যাগস:' : 'Tags:'}
                                        </span>
                                        {post.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Social Sharing Bar */}
                                <div className="mt-8 rounded-2xl bg-gray-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-gray-200/70">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                                        <Share2 size={16} className="text-[#2d6a27]" />
                                        <span>{t.sharePost}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <a
                                            href={fbShareUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition shadow-2xs"
                                            title="Share on Facebook"
                                        >
                                            <Facebook size={14} />
                                        </a>

                                        <a
                                            href={waShareUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90 transition shadow-2xs"
                                            title="Share on WhatsApp"
                                        >
                                            <MessageCircle size={14} />
                                        </a>

                                        <a
                                            href={twShareUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white hover:opacity-90 transition shadow-2xs"
                                            title="Share on X"
                                        >
                                            <Twitter size={14} />
                                        </a>

                                        <button
                                            type="button"
                                            onClick={handleCopy}
                                            className="flex h-8 px-3 items-center gap-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-100 transition shadow-2xs"
                                            title="Copy article link"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check size={12} className="text-emerald-600" />
                                                    <span className="text-emerald-600 font-semibold">{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={12} />
                                                    <span>{language === 'bn' ? 'লিংক কপি' : 'Copy'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        </main>

                        {/* Sidebar (4 cols) */}
                        <aside className="lg:col-span-4 space-y-6">
                            {/* Promotional Shop Callout Widget */}
                            <div className="rounded-3xl bg-linear-to-br from-[#194315] to-[#2d6a27] text-white p-6 shadow-sm">
                                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-yellow-300 mb-3">
                                    <ShoppingBag size={18} />
                                </div>
                                <h3 className="font-bold text-lg leading-snug">
                                    {language === 'bn' ? 'অরিজিনাল গ্যাজেট সংগ্রহ' : 'Original Gadget Collection'}
                                </h3>
                                <p className="mt-2 text-xs text-green-100 leading-relaxed font-normal">
                                    {language === 'bn'
                                        ? '১০০% অথেনটিক গ্যাজেট, ব্লুটুথ এয়ারবাডস ও প্রিমিয়াম অ্যাক্সেসরিজ পান সেরা দামে ও ক্যাশ অন ডেলিভারিতে।'
                                        : 'Find 100% authentic airbuds, fast chargers, and smart accessories at unbeatable prices with nationwide Cash on Delivery.'}
                                </p>
                                <Link
                                    href="/shop"
                                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#194315] hover:bg-green-50 transition shadow-xs"
                                >
                                    <span>{t.shopNow}</span>
                                    →
                                </Link>
                            </div>

                            {/* Recommended Gadgets Cross-sell */}
                            {recommendedProducts.length > 0 && (
                                <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs">
                                    <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center justify-between">
                                        <span>{language === 'bn' ? 'জনপ্রিয় গ্যাজেটস' : 'Featured Products'}</span>
                                        <Link href="/shop" className="text-xs text-[#2d6a27] hover:underline font-semibold">
                                            {t.viewAll}
                                        </Link>
                                    </h3>

                                    <div className="space-y-3">
                                        {recommendedProducts.map((prod) => (
                                            <Link
                                                key={prod.id}
                                                href={`/product/${prod.slug}`}
                                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition group"
                                            >
                                                <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200/60">
                                                    {prod.thumbnail ? (
                                                        <img
                                                            src={prod.thumbnail}
                                                            alt={prod.name}
                                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                            <ShoppingBag size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-xs font-semibold text-gray-900 group-hover:text-[#2d6a27] transition-colors truncate">
                                                        {prod.name}
                                                    </h4>
                                                    <div className="mt-1 flex items-baseline gap-1.5">
                                                        <span className="text-xs font-bold text-[#2d6a27]">
                                                            ৳{prod.sale_price ?? prod.price}
                                                        </span>
                                                        {prod.sale_price && prod.sale_price < prod.price && (
                                                            <span className="text-[10px] text-gray-400 line-through">
                                                                ৳{prod.price}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Articles */}
                            {recentPosts.length > 0 && (
                                <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs">
                                    <h3 className="font-bold text-gray-900 text-sm mb-4">
                                        {t.relatedArticles}
                                    </h3>

                                    <div className="space-y-4">
                                        {recentPosts.map((rec) => (
                                            <Link
                                                key={rec.id}
                                                href={`/blog/${rec.slug}`}
                                                className="flex items-start gap-3 group"
                                            >
                                                <div className="h-14 w-18 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200/60">
                                                    {rec.image_url ? (
                                                        <img
                                                            src={rec.image_url}
                                                            alt={rec.title}
                                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                            <Newspaper size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-xs font-semibold text-gray-900 group-hover:text-[#2d6a27] transition-colors line-clamp-2 leading-snug">
                                                        {rec.title}
                                                    </h4>
                                                    <span className="mt-1 block text-[10px] text-gray-400">
                                                        {formatDate(rec.published_at)}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}
