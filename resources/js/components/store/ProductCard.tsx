import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from '@inertiajs/react';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Play,
    ShoppingCart,
    Star,
    Tag,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price?: number | null;
    effective_price: number;
    is_on_sale: boolean;
    thumbnail_url?: string | null;
    gallery_urls?: string[];
    video_url?: string | null;
    in_stock: boolean;
    has_variants: boolean;
    short_description?: string | null;
    is_featured?: boolean;
}

interface ProductCardProps {
    product: Product;
}

function getEmbedVideoUrl(url?: string | null): string | null {
    if (!url) return null;
    const ytMatch = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
    );
    if (ytMatch && ytMatch[1]) {
        return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    return url;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const { t, language } = useLanguage();
    const [justAdded, setJustAdded] = useState(false);

    // Interactive multi-image gallery & video playback
    const [activeIdx, setActiveIdx] = useState(0);
    const [isCardHovered, setIsCardHovered] = useState(false);
    const [hasInteractedWithArrows, setHasInteractedWithArrows] = useState(false);
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);

    // Image list (thumbnail + gallery images)
    const images: string[] =
        product.gallery_urls && product.gallery_urls.length > 0
            ? product.gallery_urls
            : product.thumbnail_url
              ? [product.thumbnail_url]
              : [];

    // Determine which image index to display:
    // If user explicitly clicked arrows, show activeIdx.
    // If hovered and user hasn't clicked arrows, show second image (if available).
    const displayedIndex =
        !hasInteractedWithArrows && isCardHovered && images.length > 1
            ? 1
            : activeIdx % (images.length || 1);

    const currentImage = images[displayedIndex] || product.thumbnail_url;
    const embedVideoUrl = getEmbedVideoUrl(product.video_url);

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setHasInteractedWithArrows(true);
        setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setHasInteractedWithArrows(true);
        setActiveIdx((prev) => (prev + 1) % images.length);
    };

    const handlePlayVideo = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPlayingVideo(true);
    };

    const handleCloseVideo = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPlayingVideo(false);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.has_variants) {
            window.location.href = `/product/${product.slug}`;
            return;
        }

        addItem({
            product_id: product.id,
            name: product.name,
            price: Number(product.effective_price),
            thumbnail: product.thumbnail_url,
        });

        setJustAdded(true);
        toast.success(t.addedToCart, {
            description: `${product.name} (৳${Number(product.effective_price).toLocaleString()})`,
            duration: 2500,
        });

        setTimeout(() => setJustAdded(false), 1500);
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.has_variants) {
            window.location.href = `/product/${product.slug}`;
            return;
        }

        addItem({
            product_id: product.id,
            name: product.name,
            price: Number(product.effective_price),
            thumbnail: product.thumbnail_url,
        });

        // Directly navigate to checkout as requested!
        window.location.href = '/checkout';
    };

    const discountPercent =
        product.is_on_sale && product.sale_price
            ? Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)
            : 0;

    return (
        <div
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => {
                setIsCardHovered(false);
                setHasInteractedWithArrows(false);
            }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
            <Link href={`/product/${product.slug}`} className="block">
                {/* Media Container: Image with Gallery & In-Card Video Player */}
                <div className="relative overflow-hidden bg-gray-50 aspect-square select-none">
                    {/* In-Card Video Player */}
                    {isPlayingVideo && embedVideoUrl ? (
                        <div
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            className="absolute inset-0 z-30 bg-black flex items-center justify-center animate-in fade-in duration-200"
                        >
                            <iframe
                                src={embedVideoUrl}
                                title={product.name}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                            <button
                                type="button"
                                onClick={handleCloseVideo}
                                className="absolute top-2 right-2 z-40 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white hover:bg-red-600 transition shadow-lg"
                                title={language === 'bn' ? 'ভিডিও বন্ধ করুন' : 'Close Video'}
                            >
                                <X size={15} />
                            </button>
                        </div>
                    ) : (
                        <>
                            {currentImage ? (
                                <img
                                    src={currentImage}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-300">
                                    <ShoppingCart size={40} />
                                </div>
                            )}

                            {/* Arrow Navigation (Previous / Next) */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 active:scale-95"
                                        title="Previous image"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 active:scale-95"
                                        title="Next image"
                                    >
                                        <ChevronRight size={16} />
                                    </button>

                                    {/* Gallery Dots Indicator */}
                                    <div className="absolute bottom-2 inset-x-0 z-20 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {images.slice(0, 5).map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setHasInteractedWithArrows(true);
                                                    setActiveIdx(i);
                                                }}
                                                className={`h-1.5 rounded-full transition-all ${
                                                    displayedIndex === i
                                                        ? 'w-4 bg-[#2d6a27]'
                                                        : 'w-1.5 bg-black/30 hover:bg-black/60'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Video Play Button Badge */}
                            {product.video_url && (
                                <button
                                    type="button"
                                    onClick={handlePlayVideo}
                                    className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1 rounded-full bg-red-600/90 hover:bg-red-600 text-white px-2.5 py-1 text-[11px] font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                                    title={language === 'bn' ? 'ভিডিও দেখুন' : 'Watch Video'}
                                >
                                    <Play size={11} className="fill-current" />
                                    <span>{language === 'bn' ? 'ভিডিও' : 'Video'}</span>
                                </button>
                            )}
                        </>
                    )}

                    {/* Discount & Featured Badges */}
                    <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
                        {product.is_on_sale && discountPercent > 0 && (
                            <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                                <Tag size={10} />
                                {discountPercent}% {t.off}
                            </span>
                        )}
                        {product.is_featured && (
                            <span className="flex items-center gap-1 rounded-full bg-[#f5a623] px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                                <Star size={10} />
                                {t.featured}
                            </span>
                        )}
                    </div>

                    {!product.in_stock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-10 pointer-events-none">
                            <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-red-600 shadow-sm">
                                {t.outOfStock}
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-3.5 sm:p-4">
                    <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-800 transition-colors group-hover:text-[#2d6a27]">
                        {product.name}
                    </h3>

                    {product.short_description && (
                        <p className="mb-2 line-clamp-1 text-xs text-gray-500">{product.short_description}</p>
                    )}

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-base sm:text-lg font-bold text-[#2d6a27]">
                            ৳{Number(product.effective_price).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                        </span>
                        {product.is_on_sale && product.sale_price && (
                            <span className="text-xs text-gray-400 line-through">
                                ৳{Number(product.price).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            {/* Action Buttons: Add to Cart + Buy Now */}
            <div className="p-3.5 sm:p-4 pt-0">
                {product.in_stock ? (
                    <div className="flex flex-col gap-2">
                        {/* Buy Now (Direct to Checkout) — Primary CTA on Top */}
                        <button
                            onClick={handleBuyNow}
                            type="button"
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#2d6a27] py-2.5 px-3 text-xs sm:text-sm font-bold text-white shadow-xs transition-all hover:bg-[#23531f] hover:shadow-md active:scale-[0.98]"
                            title={t.buyNow}
                        >
                            <Zap size={14} className="fill-current text-yellow-300" />
                            <span>{t.buyNow}</span>
                        </button>

                        {/* Add to Cart — Secondary Action on Bottom */}
                        <button
                            onClick={handleAddToCart}
                            type="button"
                            className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold border transition-all active:scale-[0.98] ${
                                justAdded
                                    ? 'border-emerald-600 bg-emerald-50 text-[#2d6a27]'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#2d6a27] hover:bg-emerald-50/50 hover:text-[#2d6a27]'
                            }`}
                            title={t.addToCart}
                        >
                            {justAdded ? (
                                <>
                                    <Check size={14} className="text-[#2d6a27]" />
                                    <span>{t.addedToCart}</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={14} />
                                    <span>{product.has_variants ? t.viewOptions : t.addToCart}</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <button
                        disabled
                        className="w-full rounded-xl bg-gray-100 py-2 text-center text-xs font-semibold text-gray-400 cursor-not-allowed"
                    >
                        {t.outOfStock}
                    </button>
                )}
            </div>
        </div>
    );
}
