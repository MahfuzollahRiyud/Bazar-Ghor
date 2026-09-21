import ProductCard from '@/components/store/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Tag, Truck, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Variant {
    id: number;
    name: string;
    options: { name: string; value: string }[];
    price: number;
    sale_price?: number | null;
    effective_price: number;
    stock_quantity: number;
    image?: string | null;
    sku?: string | null;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    short_description?: string | null;
    description?: string | null;
    price: number;
    sale_price?: number | null;
    effective_price: number;
    is_on_sale: boolean;
    thumbnail_url?: string | null;
    images?: string[];
    video_url?: string | null;
    has_variants: boolean;
    stock_quantity: number;
    in_stock: boolean;
    sku?: string | null;
    category?: { id: number; name: string; slug: string } | null;
    variants: Variant[];
}

function getYouTubeEmbedUrl(url?: string | null): string | null {
    if (!url) return null;
    try {
        let trimmed = url.trim();
        if (!trimmed) return null;

        // If iframe code was pasted
        if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
            const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
            if (srcMatch && srcMatch[1]) {
                trimmed = srcMatch[1].trim();
            }
        }

        // If already an embed link
        if (trimmed.includes('youtube.com/embed/') || trimmed.includes('youtube-nocookie.com/embed/')) {
            const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
            return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}?rel=0`;
        }

        // Parse with URL object
        let urlObj: URL | null = null;
        try {
            urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
        } catch {
            urlObj = null;
        }

        if (urlObj) {
            // ?v=... parameter (standard watch?v=...)
            const vParam = urlObj.searchParams.get('v');
            if (vParam) {
                return `https://www.youtube-nocookie.com/embed/${vParam}?rel=0`;
            }

            // youtu.be/ID or youtube.com/shorts/ID or youtube.com/live/ID
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            if (pathParts.length > 0) {
                const lastPart = pathParts[pathParts.length - 1];
                if (lastPart && lastPart.length >= 3) {
                    return `https://www.youtube-nocookie.com/embed/${lastPart}?rel=0`;
                }
            }
        }

        // Plain ID fallback (e.g. dQw4w9WgXcQ or pcKuH)
        if (trimmed.length >= 4 && !trimmed.includes('/') && !trimmed.includes(' ')) {
            return `https://www.youtube-nocookie.com/embed/${trimmed}?rel=0`;
        }
    } catch {
        return null;
    }
    return null;
}

interface Props {
    product: Product;
    related: Product[];
}

export default function ProductDetail({ product, related }: Props) {
    const { addItem } = useCart();
    const { t, language } = useLanguage();
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
        product.has_variants && product.variants.length > 0 ? product.variants[0] : null
    );
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [added, setAdded] = useState(false);

    const embedVideoUrl = getYouTubeEmbedUrl(product.video_url);

    const allImages = [
        ...(product.thumbnail_url ? [product.thumbnail_url] : []),
        ...(product.images ?? []),
    ].filter(Boolean);

    const currentPrice = selectedVariant
        ? Number(selectedVariant.effective_price)
        : Number(product.effective_price);

    const originalPrice = selectedVariant
        ? Number(selectedVariant.price)
        : Number(product.price);

    const isOnSale = selectedVariant
        ? !!selectedVariant.sale_price
        : product.is_on_sale;

    const inStock = selectedVariant
        ? selectedVariant.stock_quantity > 0
        : product.in_stock;

    const maxQty = selectedVariant
        ? selectedVariant.stock_quantity
        : product.stock_quantity;

    const handleAddToCart = () => {
        if (!inStock) return;

        addItem({
            product_id: product.id,
            variant_id: selectedVariant?.id ?? null,
            name: product.name,
            variant_name: selectedVariant?.name ?? null,
            price: currentPrice,
            thumbnail: selectedVariant?.image ?? product.thumbnail_url,
            quantity,
        });

        setAdded(true);
        toast.success(t.addedToCart, {
            description: `${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} × ${quantity}`,
            action: { label: t.viewCart, onClick: () => window.location.href = '/cart' },
        });

        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = () => {
        if (!inStock) return;

        addItem({
            product_id: product.id,
            variant_id: selectedVariant?.id ?? null,
            name: product.name,
            variant_name: selectedVariant?.name ?? null,
            price: currentPrice,
            thumbnail: selectedVariant?.image ?? product.thumbnail_url,
            quantity,
        });

        window.location.href = '/checkout';
    };

    const discountPct = isOnSale && originalPrice > 0
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0;

    return (
        <>
            <Head title={`${product.name} — Bazar Ghor`}>
                <meta name="description" content={product.short_description ?? `${product.name} কিনুন Bazar Ghor থেকে। সারাদেশে Cash on Delivery।`} />
            </Head>

            {/* Breadcrumb */}
            <div className="bg-white border-b py-3">
                <div className="mx-auto max-w-7xl px-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-[#2d6a27]">হোম</Link>
                    <ChevronRight size={14} />
                    <Link href="/shop" className="hover:text-[#2d6a27]">শপ</Link>
                    {product.category && (
                        <>
                            <ChevronRight size={14} />
                            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#2d6a27]">
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <ChevronRight size={14} />
                    <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    {/* Images */}
                    <div>
                        <div className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-square">
                            {allImages.length > 0 ? (
                                <>
                                    <img
                                        src={allImages[activeImage]}
                                        alt={product.name}
                                        className="h-full w-full object-contain p-4"
                                    />
                                    {allImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setActiveImage((i) => Math.max(0, i - 1))}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button
                                                onClick={() => setActiveImage((i) => Math.min(allImages.length - 1, i + 1))}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-300">
                                    <ShoppingCart size={64} />
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                                            activeImage === i ? 'border-[#2d6a27]' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <img src={img} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        {product.category && (
                            <Link
                                href={`/shop?category=${product.category.slug}`}
                                className="mb-2 inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-[#2d6a27] hover:bg-green-200"
                            >
                                {product.category.name}
                            </Link>
                        )}

                        <h1 className="mb-3 text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
                            {product.name}
                        </h1>

                        {product.short_description && (
                            <p className="mb-4 text-gray-600">{product.short_description}</p>
                        )}

                        {/* Price */}
                        <div className="mb-5 flex items-end gap-3">
                            <span className="text-3xl font-bold text-[#2d6a27]">
                                ৳{currentPrice.toLocaleString('bn-BD')}
                            </span>
                            {isOnSale && (
                                <>
                                    <span className="text-xl text-gray-400 line-through">
                                        ৳{originalPrice.toLocaleString('bn-BD')}
                                    </span>
                                    <span className="flex items-center gap-0.5 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
                                        <Tag size={12} /> {discountPct}% ছাড়
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Variants */}
                        {product.has_variants && product.variants.length > 0 && (
                            <div className="mb-5">
                                {/* Group options by attribute name */}
                                {(() => {
                                    const attrNames = [...new Set(product.variants.flatMap((v) => v.options.map((o) => o.name)))];
                                    return attrNames.map((attrName) => {
                                        const values = [...new Set(product.variants.flatMap((v) => v.options.filter((o) => o.name === attrName).map((o) => o.value)))];
                                        return (
                                            <div key={attrName} className="mb-3">
                                                <p className="mb-2 text-sm font-semibold text-gray-700">{attrName}:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {values.map((val) => {
                                                        const matchingVariant = product.variants.find((v) => v.options.some((o) => o.name === attrName && o.value === val));
                                                        const isSelected = selectedVariant?.options.some((o) => o.name === attrName && o.value === val);
                                                        return (
                                                            <button
                                                                key={val}
                                                                onClick={() => matchingVariant && setSelectedVariant(matchingVariant)}
                                                                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                                                                    isSelected
                                                                        ? 'border-[#2d6a27] bg-green-50 text-[#2d6a27]'
                                                                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                                } ${!matchingVariant || matchingVariant.stock_quantity === 0 ? 'opacity-50' : ''}`}
                                                            >
                                                                {val}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        )}

                        {/* Stock */}
                        <div className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            <span className={`h-2 w-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                            {inStock ? t.inStock : t.outOfStock}
                        </div>

                        {/* Quantity */}
                        {inStock && (
                            <div className="mb-5">
                                <p className="mb-2 text-sm font-semibold text-gray-700">{language === 'en' ? 'Quantity:' : 'পরিমাণ:'}</p>
                                <div className="inline-flex items-center rounded-xl border border-gray-200 overflow-hidden bg-white">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="px-4 py-2.5 text-gray-600 transition hover:bg-gray-50 active:bg-gray-100"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="min-w-[3rem] text-center font-semibold text-gray-800">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                                        className="px-4 py-2.5 text-gray-600 transition hover:bg-gray-50 active:bg-gray-100"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons: Add to Cart + Buy Now */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                type="button"
                                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-bold text-sm transition-all active:scale-95 shadow-xs ${
                                    inStock
                                        ? added
                                            ? 'bg-green-600 text-white'
                                            : 'border-2 border-[#2d6a27] bg-green-50 text-[#2d6a27] hover:bg-green-100'
                                        : 'cursor-not-allowed bg-gray-200 text-gray-500'
                                }`}
                            >
                                <ShoppingCart size={18} />
                                {added ? t.addedToCart : inStock ? t.addToCart : t.outOfStock}
                            </button>

                            <button
                                onClick={handleBuyNow}
                                disabled={!inStock}
                                type="button"
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2d6a27] py-3.5 px-6 font-bold text-sm text-white shadow-md transition-all hover:bg-[#23531f] active:scale-95"
                            >
                                <Zap size={18} className="fill-current text-yellow-300" />
                                {t.buyNow}
                            </button>
                        </div>

                        {/* WhatsApp Direct Order Button */}
                        <a
                            href={`https://wa.me/8801621270761?text=${encodeURIComponent(
                                `আসসালামু আলাইকুম, আমি Bazar Ghor থেকে "${product.name}"${selectedVariant ? ` (${selectedVariant.name})` : ''} অর্ডার করতে চাই। মূল্য: ৳${currentPrice}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white py-3 px-6 font-bold text-sm shadow-sm transition active:scale-95 mb-6"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                            </svg>
                            <span>WhatsApp এ সরাসরি অর্ডার করুন</span>
                        </a>

                        {/* Delivery Info */}
                        <div className="rounded-2xl bg-green-50 p-4 space-y-2 border border-green-100">
                            <div className="flex items-center gap-2 text-sm text-gray-800">
                                <Truck size={16} className="text-[#2d6a27]" />
                                <span><strong>{t.insideDhakaDelivery}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-800">
                                <Truck size={16} className="text-[#2d6a27]" />
                                <span><strong>{t.outsideDhakaDelivery}</strong></span>
                            </div>
                        </div>

                        {product.sku && (
                            <p className="mt-3 text-xs text-gray-400">SKU: {product.sku}</p>
                        )}
                    </div>
                </div>

                {/* Video Preview */}
                {embedVideoUrl && (
                    <div className="mt-12 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                        <h2 className="mb-4 text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </span>
                            ভিডিও রিভিউ ও আনবক্সিং
                        </h2>
                        <div className="overflow-hidden rounded-xl bg-black aspect-video max-w-3xl shadow-sm">
                            <iframe
                                src={embedVideoUrl}
                                title={`${product.name} Video Preview`}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}

                {/* Description */}
                {product.description && (
                    <div className="mt-12">
                        <h2 className="mb-4 text-xl font-bold text-gray-800 border-b pb-2">পণ্যের বিবরণ</h2>
                        <div
                            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>
                )}

                {/* Related Products */}
                {related.length > 0 && (
                    <div className="mt-12">
                        <h2 className="mb-6 text-xl font-bold text-gray-800">সম্পর্কিত পণ্য</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {related.map((p) => (
                                <ProductCard key={p.id} product={p as any} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
