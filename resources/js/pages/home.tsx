import ProductCard from '@/components/store/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Headphones, Package, Shield, ShoppingBag, Sparkles, Star, Truck, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    image_url?: string | null;
    products_count: number;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price?: number | null;
    effective_price: number;
    is_on_sale: boolean;
    thumbnail_url?: string | null;
    in_stock: boolean;
    has_variants: boolean;
    short_description?: string | null;
    is_featured?: boolean;
    category?: { id: number; name: string; slug: string } | null;
}

interface HeroSlideData {
    id: number;
    title?: string | null;
    subtitle?: string | null;
    link_url?: string | null;
    image_url: string;
}

interface Props {
    categories: Category[];
    featuredProducts: Product[];
    newArrivals: Product[];
    heroMode?: 'single' | 'slider';
    heroSlides?: HeroSlideData[];
}

const CATEGORY_ICONS: Record<string, string> = {
    airbuds: '🎧',
    headphone: '🎵',
    trimmer: '✂️',
    'smart-watch': '⌚',
    speaker: '🔊',
    'charger-cable': '⚡',
    'phone-case': '📱',
    others: '🛒',
};

export default function Home({
    categories,
    featuredProducts,
    newArrivals,
    heroMode = 'single',
    heroSlides = [],
}: Props) {
    const { t, language } = useLanguage();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const safeSlides = heroSlides.length > 0 ? heroSlides : [
        { id: 1, title: 'Bazar Ghor', link_url: '/shop', image_url: '/images/banner.jpg' },
    ];

    const isSlider = heroMode === 'slider' && safeSlides.length > 1;

    // Autoplay for Slider mode
    useEffect(() => {
        if (!isSlider || isHovered) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % safeSlides.length);
        }, 4500);
        return () => clearInterval(timer);
    }, [isSlider, isHovered, safeSlides.length]);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + safeSlides.length) % safeSlides.length);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % safeSlides.length);
    };

    const features = [
        { icon: <Shield size={24} />, title: t.feat1Title, desc: t.feat1Desc },
        { icon: <Truck size={24} />, title: t.feat2Title, desc: t.feat2Desc },
        { icon: <Headphones size={24} />, title: t.feat3Title, desc: t.feat3Desc },
        { icon: <Star size={24} />, title: t.feat4Title, desc: t.feat4Desc },
    ];

    const whyUs = [
        { emoji: '🛡️', title: t.why1Title, desc: t.why1Desc },
        { emoji: '💰', title: t.why2Title, desc: t.why2Desc },
        { emoji: '🤝', title: t.why3Title, desc: t.why3Desc },
    ];

    return (
        <>
            <Head title={`Bazar Ghor — ${language === 'en' ? 'Your Trusted Online Gadget Store' : 'আপনার বিশ্বস্ত অনলাইন গ্যাজেট স্টোর'}`}>
                <meta
                    name="description"
                    content="Bazar Ghor — Online Gadget Shop in Bangladesh. Buy Airbuds, Headphones, Trimmers, Smart Watches, Speakers with Cash on Delivery nationwide."
                />
            </Head>

            {/* ── Dynamic Hero Section (Single Banner or Multi-Slide Carousel) ── */}
            <section
                className="relative overflow-hidden bg-white border-b border-gray-100"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative w-full max-w-[1920px] mx-auto overflow-hidden">
                    {isSlider ? (
                        /* Slider Carousel Mode */
                        <div className="relative w-full aspect-[1024/381] sm:aspect-auto sm:h-[360px] md:h-[440px] lg:h-[500px] overflow-hidden bg-gray-50">
                            {safeSlides.map((slide, index) => {
                                const isActive = index === currentSlide;
                                const content = (
                                    <img
                                        src={slide.image_url}
                                        alt={slide.title || 'Bazar Ghor Hero Banner'}
                                        className="w-full h-full object-contain sm:object-cover object-center bg-white"
                                    />
                                );

                                return (
                                    <div
                                        key={slide.id}
                                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                            isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                                        }`}
                                    >
                                        {slide.link_url ? (
                                            <Link href={slide.link_url} className="block w-full h-full">
                                                {content}
                                            </Link>
                                        ) : (
                                            content
                                        )}
                                    </div>
                                );
                            })}

                            {/* Carousel Arrows */}
                            <button
                                onClick={prevSlide}
                                aria-label="Previous Slide"
                                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs transition hover:bg-black/70 hover:scale-105 active:scale-95 shadow-md"
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <button
                                onClick={nextSlide}
                                aria-label="Next Slide"
                                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-xs transition hover:bg-black/70 hover:scale-105 active:scale-95 shadow-md"
                            >
                                <ChevronRight size={22} />
                            </button>

                            {/* Carousel Dots Indicators */}
                            <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 rounded-full bg-black/30 backdrop-blur-xs px-3 py-1.5">
                                {safeSlides.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        aria-label={`Go to slide ${i + 1}`}
                                        className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                                            i === currentSlide ? 'w-6 sm:w-7 bg-white shadow-xs' : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/80'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Single Banner Mode */
                        (() => {
                            const single = safeSlides[0];
                            const bannerImg = (
                                <img
                                    src={single.image_url}
                                    alt={single.title || 'Bazar Ghor — Shop Smart, Live Better'}
                                    className="w-full h-auto aspect-[1024/381] sm:aspect-auto sm:h-[360px] md:h-[440px] lg:h-[500px] object-contain sm:object-cover object-center bg-white"
                                    onError={(e) => {
                                        const el = e.currentTarget;
                                        el.style.display = 'none';
                                        const fb = el.nextElementSibling as HTMLElement;
                                        if (fb) fb.classList.remove('hidden');
                                    }}
                                />
                            );

                            return single.link_url ? (
                                <Link href={single.link_url} className="block w-full">
                                    {bannerImg}
                                </Link>
                            ) : (
                                bannerImg
                            );
                        })()
                    )}

                    {/* Fallback Hero if image missing */}
                    <div className="hidden absolute inset-0 bg-gradient-to-br from-[#143312] via-[#2d6a27] to-[#3d8f33]">
                        <div className="flex h-full flex-col items-center justify-center text-center px-4">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-white text-xs font-semibold">
                                <Sparkles size={14} /> {t.specialOffer}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                                Shop Smart, <span className="text-[#f5a623]">Live Better</span>
                            </h1>
                            <p className="text-base text-green-100 mb-6 max-w-lg">
                                {t.footerBrandDesc}
                            </p>
                            <div className="flex gap-3">
                                <Link
                                    href="/shop"
                                    className="rounded-full bg-white px-7 py-3 font-bold text-sm text-[#2d6a27] transition hover:bg-green-50 shadow-sm"
                                >
                                    {t.shopNow}
                                </Link>
                                <Link
                                    href="/about"
                                    className="rounded-full border-2 border-white px-7 py-3 font-bold text-sm text-white transition hover:bg-white/10"
                                >
                                    {t.aboutUs}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features Bar ─────────────────────────────────────── */}
            <section className="bg-white border-b border-gray-100 py-6">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 group">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#2d6a27] transition-all group-hover:bg-[#2d6a27] group-hover:text-white group-hover:scale-105">
                                    {f.icon}
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-gray-800">{f.title}</p>
                                    <p className="text-[11px] text-gray-500 hidden sm:block">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Categories ───────────────────────────────────────── */}
            <section className="py-12 bg-[#faf9f6]">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <p className="mb-1 text-xs font-bold text-[#8b4513] uppercase tracking-wider">Browse</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t.categories}</h2>
                        </div>
                        <Link href="/shop" className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#2d6a27] hover:text-[#1f4e1b]">
                            {t.viewAll} <ChevronRight size={15} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/shop?category=${cat.slug}`}
                                className="group flex flex-col items-center rounded-2xl bg-white p-4 shadow-xs border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#2d6a27]"
                            >
                                <div className="mb-2.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50/80 text-2xl transition-all group-hover:bg-[#2d6a27] group-hover:scale-105">
                                    {cat.image_url ? (
                                        <img src={cat.image_url} alt={cat.name} className="h-10 w-10 object-cover rounded-xl" />
                                    ) : (
                                        <span>{CATEGORY_ICONS[cat.slug] ?? '🛒'}</span>
                                    )}
                                </div>
                                <p className="text-center text-xs font-semibold text-gray-800 group-hover:text-[#2d6a27] line-clamp-1">{cat.name}</p>
                                <p className="text-center text-[10px] text-gray-400 mt-0.5">
                                    {cat.products_count} {language === 'en' ? 'items' : 'পণ্য'}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Products ─────────────────────────────────── */}
            {featuredProducts.length > 0 && (
                <section className="py-12 bg-white">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="mb-8 flex items-end justify-between">
                            <div>
                                <p className="mb-1 text-xs font-bold text-[#8b4513] uppercase tracking-wider flex items-center gap-1">
                                    <Zap size={13} className="text-[#f5a623]" /> Hot Deals
                                </p>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t.featured}</h2>
                            </div>
                            <Link href="/shop" className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#2d6a27] hover:text-[#1f4e1b]">
                                {t.viewAll} <ChevronRight size={15} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Promo Banner ──────────────────────────────────────── */}
            <section className="py-12 bg-[#faf9f6]">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#143312] via-[#23531f] to-[#2d6a27] p-8 md:p-14 text-white shadow-md">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-green-200">
                                    {t.specialOffer}
                                </span>
                                <h2 className="text-2xl md:text-4xl font-extrabold mb-3">
                                    {t.cashOnDelivery}
                                </h2>
                                <p className="text-green-100 max-w-md text-sm leading-relaxed">
                                    {language === 'en'
                                        ? 'Get your favorite gadgets delivered right to your doorstep anywhere in Bangladesh with Cash on Delivery.'
                                        : 'ঢাকার ভেতরে মাত্র ৳৬০ ও ঢাকার বাইরে মাত্র ৳১২০ ডেলিভারি চার্জে পৌঁছে যাবে আপনার পছন্দের পণ্য।'}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2.5 text-xs">
                                    <div className="rounded-full bg-white/15 px-3.5 py-1 font-semibold">🏠 {t.insideDhakaDelivery}</div>
                                    <div className="rounded-full bg-white/15 px-3.5 py-1 font-semibold">🚚 {t.outsideDhakaDelivery}</div>
                                </div>
                            </div>
                            <Link
                                href="/shop"
                                className="shrink-0 rounded-xl bg-[#f5a623] px-8 py-3.5 font-bold text-gray-900 shadow-md transition-all hover:bg-yellow-400 active:scale-95 text-sm"
                            >
                                {t.shopNow} →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── New Arrivals ──────────────────────────────────────── */}
            {newArrivals.length > 0 && (
                <section className="py-12 bg-white">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="mb-8 flex items-end justify-between">
                            <div>
                                <p className="mb-1 text-xs font-bold text-[#8b4513] uppercase tracking-wider">{t.latest}</p>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t.newArrivals}</h2>
                            </div>
                            <Link href="/shop?sort=newest" className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#2d6a27] hover:text-[#1f4e1b]">
                                {t.viewAll} <ChevronRight size={15} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 lg:grid-cols-4">
                            {newArrivals.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Why Choose Us ─────────────────────────────────────── */}
            <section className="py-12 bg-gradient-to-b from-[#faf9f6] to-white border-t border-gray-100">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-10 text-center">
                        <p className="mb-1 text-xs font-bold text-[#8b4513] uppercase tracking-wider">Quality First</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t.whyChooseUs}</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {whyUs.map((item, i) => (
                            <div key={i} className="rounded-2xl bg-white p-6 shadow-xs border border-gray-100 text-center hover:shadow-md transition-shadow">
                                <div className="mb-3 text-4xl">{item.emoji}</div>
                                <h3 className="mb-2 text-base font-bold text-gray-900">{item.title}</h3>
                                <p className="text-xs leading-relaxed text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
