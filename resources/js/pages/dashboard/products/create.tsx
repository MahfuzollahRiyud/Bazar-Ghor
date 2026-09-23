import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Head, Link, router } from '@inertiajs/react';
import { Film, ImageIcon, Loader2, Plus, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import MediaPickerModal, { MediaItem } from '@/components/dashboard/MediaPickerModal';

interface Category {
    id: number;
    name: string;
}

interface Variant {
    name: string;
    options: { name: string; value: string }[];
    price: string;
    sale_price: string;
    stock_quantity: string;
    sku: string;
}

interface GalleryItem {
    id: string;
    previewUrl: string;
    file?: File;
    mediaPath?: string;
}

interface Props {
    categories: Category[];
}

const DEFAULT_VARIANT: Variant = {
    name: '',
    options: [{ name: 'Color', value: '' }],
    price: '',
    sale_price: '',
    stock_quantity: '',
    sku: '',
};

export default function ProductCreate({ categories }: Props) {
    const { t, language } = useAdminLanguage();
    const thumbnailRef = useRef<HTMLInputElement>(null);
    const imagesRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        name: '',
        category_id: '',
        short_description: '',
        description: '',
        sku: '',
        price: '',
        sale_price: '',
        stock_quantity: '',
        video_url: '',
        has_variants: false,
        is_featured: false,
        is_active: true,
    });

    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [mediaThumbnailPath, setMediaThumbnailPath] = useState<string | null>(null);
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<'thumbnail' | 'gallery'>('thumbnail');
    const [variants, setVariants] = useState<Variant[]>([{ ...DEFAULT_VARIANT }]);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    };

    const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(file);
            setMediaThumbnailPath(null);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const newItems: GalleryItem[] = files.map((f) => ({
            id: Math.random().toString(36).substring(2, 9),
            previewUrl: URL.createObjectURL(f),
            file: f,
        }));
        setGalleryItems((prev) => [...prev, ...newItems]);
    };

    const removeGalleryItem = (id: string) => {
        setGalleryItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleMediaSelect = (selected: MediaItem[]) => {
        if (!selected || selected.length === 0) return;

        if (pickerTarget === 'thumbnail') {
            const first = selected[0];
            setThumbnail(null);
            setMediaThumbnailPath(first.file_path);
            setThumbnailPreview(first.url);
        } else {
            const newItems: GalleryItem[] = selected.map((item) => ({
                id: Math.random().toString(36).substring(2, 9),
                previewUrl: item.url,
                mediaPath: item.file_path,
            }));
            setGalleryItems((prev) => [...prev, ...newItems]);
            toast.success(
                language === 'bn'
                    ? `${selected.length}টি ছবি গ্যালারিতে যোগ করা হয়েছে!`
                    : `${selected.length} image(s) added to gallery!`
            );
        }
        setPickerOpen(false);
    };

    const addVariant = () => setVariants((prev) => [...prev, { ...DEFAULT_VARIANT }]);
    const removeVariant = (i: number) => setVariants((prev) => prev.filter((_, idx) => idx !== i));

    const updateVariant = (i: number, key: keyof Variant, value: string) => {
        setVariants((prev) => prev.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)));
    };

    const addVariantOption = (vi: number) => {
        setVariants((prev) =>
            prev.map((v, idx) => (idx === vi ? { ...v, options: [...v.options, { name: '', value: '' }] } : v))
        );
    };

    const updateVariantOption = (vi: number, oi: number, key: 'name' | 'value', val: string) => {
        setVariants((prev) =>
            prev.map((v, idx) =>
                idx === vi
                    ? {
                          ...v,
                          options: v.options.map((o, oidx) => (oidx === oi ? { ...o, [key]: val } : o)),
                      }
                    : v
            )
        );
    };

    const buildVariantName = (options: { name: string; value: string }[]) => {
        return options
            .filter((o) => o.value)
            .map((o) => o.value)
            .join(' / ');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        // Client-side quick checks
        if (!form.name.trim()) {
            toast.error(language === 'bn' ? 'পণ্যের নাম দিন' : 'Product name is required');
            setErrors({ name: language === 'bn' ? 'পণ্যের নাম দেওয়া আবশ্যক।' : 'Product name is required.' });
            setSubmitting(false);
            return;
        }
        if (!form.category_id) {
            toast.error(language === 'bn' ? 'ক্যাটাগরি নির্বাচন করুন' : 'Please select a category');
            setErrors({ category_id: language === 'bn' ? 'একটি ক্যাটাগরি নির্বাচন করুন।' : 'Please select a category.' });
            setSubmitting(false);
            return;
        }
        if (!form.price || Number(form.price) < 0) {
            toast.error(language === 'bn' ? 'পণ্যের দাম দিন' : 'Please set a regular price');
            setErrors({ price: language === 'bn' ? 'পণ্যের দাম নির্ধারণ করুন।' : 'Product price is required.' });
            setSubmitting(false);
            return;
        }

        const data = new FormData();
        data.append('name', form.name);
        data.append('category_id', String(form.category_id));
        data.append('short_description', form.short_description || '');
        data.append('description', form.description || '');
        if (form.sku.trim()) data.append('sku', form.sku.trim());
        data.append('price', String(form.price));
        if (form.sale_price) data.append('sale_price', String(form.sale_price));
        data.append('stock_quantity', String(form.has_variants ? 0 : form.stock_quantity || 0));
        if (form.video_url.trim()) data.append('video_url', form.video_url.trim());
        data.append('has_variants', form.has_variants ? '1' : '0');
        data.append('is_featured', form.is_featured ? '1' : '0');
        data.append('is_active', form.is_active ? '1' : '0');

        if (thumbnail) {
            data.append('thumbnail', thumbnail);
        } else if (mediaThumbnailPath) {
            data.append('media_thumbnail_path', mediaThumbnailPath);
        }

        galleryItems.forEach((item) => {
            if (item.file) {
                data.append('images[]', item.file);
            } else if (item.mediaPath) {
                data.append('media_image_paths[]', item.mediaPath);
            }
        });

        if (form.has_variants) {
            variants.forEach((v, i) => {
                const name = v.name || buildVariantName(v.options);
                data.append(`variants[${i}][name]`, name);
                data.append(`variants[${i}][price]`, v.price || String(form.price));
                if (v.sale_price) data.append(`variants[${i}][sale_price]`, v.sale_price);
                data.append(`variants[${i}][stock_quantity]`, v.stock_quantity || '0');
                if (v.sku) data.append(`variants[${i}][sku]`, v.sku);
                v.options.forEach((o, oi) => {
                    data.append(`variants[${i}][options][${oi}][name]`, o.name);
                    data.append(`variants[${i}][options][${oi}][value]`, o.value);
                });
            });
        }

        router.post('/dashboard/products', data, {
            forceFormData: true,
            onSuccess: () =>
                toast.success(language === 'bn' ? 'পণ্য সফলভাবে যোগ হয়েছে!' : 'Product added successfully!'),
            onError: (errs) => {
                setErrors(errs);
                const firstError = Object.values(errs)[0];
                toast.error(
                    typeof firstError === 'string'
                        ? firstError
                        : (language === 'bn'
                              ? 'সমস্যা হয়েছে। লাল চিহ্নিত ফর্ম ফিল্ডগুলো চেক করুন।'
                              : 'Please check the highlighted fields for errors.')
                );
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <>
            <Head title={language === 'bn' ? 'নতুন পণ্য — Bazar Ghor Admin' : 'Add New Product — Bazar Ghor Admin'} />

            <div className="p-6 max-w-5xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/dashboard/products" className="text-gray-400 hover:text-gray-600">
                        ← {t.allProducts}
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">{t.addProduct}</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <h2 className="mb-4 font-bold text-gray-800">
                                    {language === 'bn' ? 'মূল তথ্য' : 'Basic Information'}
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.name} *
                                        </label>
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:border-[#2d6a27] focus:outline-none ${
                                                errors.name ? 'border-red-400' : 'border-gray-200'
                                            }`}
                                            placeholder={language === 'bn' ? 'পণ্যের নাম লিখুন' : 'Enter product name'}
                                        />
                                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.category} *
                                        </label>
                                        <select
                                            name="category_id"
                                            value={form.category_id}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:border-[#2d6a27] focus:outline-none bg-white ${
                                                errors.category_id ? 'border-red-400' : 'border-gray-200'
                                            }`}
                                        >
                                            <option value="">{t.select} {t.category}</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {language === 'bn' ? 'সংক্ষিপ্ত বিবরণ' : 'Short Description'}
                                        </label>
                                        <textarea
                                            name="short_description"
                                            value={form.short_description}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#2d6a27] focus:outline-none resize-none"
                                            placeholder={language === 'bn' ? 'সংক্ষিপ্ত বিবরণ...' : 'A brief highlight of the product...'}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.description}
                                        </label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            rows={5}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#2d6a27] focus:outline-none resize-none"
                                            placeholder={
                                                language === 'bn'
                                                    ? 'পণ্যের বিস্তারিত বিবরণ (HTML সাপোর্টেড)...'
                                                    : 'Detailed product specifications and details...'
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <h2 className="mb-4 font-bold text-gray-800">
                                    {language === 'bn' ? 'মূল্য ও স্টক' : 'Pricing & Inventory'}
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.regularPrice} (৳) *
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={form.price}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:border-[#2d6a27] focus:outline-none ${
                                                errors.price ? 'border-red-400' : 'border-gray-200'
                                            }`}
                                            placeholder="0"
                                            min="0"
                                        />
                                        {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.salePrice} (৳)
                                        </label>
                                        <input
                                            type="number"
                                            name="sale_price"
                                            value={form.sale_price}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#2d6a27] focus:outline-none"
                                            placeholder={language === 'bn' ? 'ছাড়ের দাম' : 'Discounted price'}
                                            min="0"
                                        />
                                    </div>
                                    {!form.has_variants && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t.stockQuantity}
                                            </label>
                                            <input
                                                type="number"
                                                name="stock_quantity"
                                                value={form.stock_quantity}
                                                onChange={handleChange}
                                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#2d6a27] focus:outline-none"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.sku} ({language === 'bn' ? 'ঐচ্ছিক' : 'Optional'})
                                        </label>
                                        <input
                                            name="sku"
                                            value={form.sku}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#2d6a27] focus:outline-none uppercase"
                                            placeholder="PRD-001"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* YouTube Video URL */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <h2 className="mb-2 font-bold text-gray-800 flex items-center gap-2">
                                    <Film size={18} className="text-[#2d6a27]" />
                                    {language === 'bn' ? 'ভিডিও প্রিভিউ লিংক (ঐচ্ছিক)' : 'Video Preview URL (Optional)'}
                                </h2>
                                <p className="text-xs text-gray-500 mb-3">
                                    {language === 'bn'
                                        ? 'পণ্যের ইউটিউব রিভিউ বা আনবক্সিং ভিডিও লিংক দিন (YouTube / Shorts)'
                                        : 'Link to a YouTube review or showcase video (YouTube / Shorts)'}
                                </p>
                                <input
                                    type="url"
                                    name="video_url"
                                    value={form.video_url}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#2d6a27] focus:outline-none"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>

                            {/* Variants */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="font-bold text-gray-800">{language === 'bn' ? 'ভেরিয়েন্ট' : 'Variants'}</h2>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="has_variants"
                                            checked={form.has_variants}
                                            onChange={handleChange}
                                            className="h-4 w-4 rounded accent-[#2d6a27]"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            {language === 'bn' ? 'ভেরিয়েন্ট আছে' : 'Has Product Variants'}
                                        </span>
                                    </label>
                                </div>

                                {form.has_variants && (
                                    <div className="space-y-4">
                                        {variants.map((variant, vi) => (
                                            <div key={vi} className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-gray-700">
                                                        {language === 'bn' ? `ভেরিয়েন্ট ${vi + 1}` : `Variant ${vi + 1}`}
                                                    </p>
                                                    {variants.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariant(vi)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Options */}
                                                <div className="mb-3">
                                                    <p className="text-xs font-medium text-gray-500 mb-2">
                                                        {language === 'bn'
                                                            ? 'অপশন (যেমন: Color, Size)'
                                                            : 'Options (e.g., Color, Size)'}
                                                    </p>
                                                    {variant.options.map((opt, oi) => (
                                                        <div key={oi} className="mb-2 flex gap-2">
                                                            <input
                                                                value={opt.name}
                                                                onChange={(e) => updateVariantOption(vi, oi, 'name', e.target.value)}
                                                                placeholder={language === 'bn' ? 'অপশন নাম (Color)' : 'Option Name (e.g. Color)'}
                                                                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-[#2d6a27] focus:outline-none bg-white"
                                                            />
                                                            <input
                                                                value={opt.value}
                                                                onChange={(e) => updateVariantOption(vi, oi, 'value', e.target.value)}
                                                                placeholder={language === 'bn' ? 'মান (Red)' : 'Value (e.g. Red)'}
                                                                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-[#2d6a27] focus:outline-none bg-white"
                                                            />
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => addVariantOption(vi)}
                                                        className="text-xs text-[#2d6a27] hover:underline"
                                                    >
                                                        + {language === 'bn' ? 'আরো অপশন' : 'Add Option'}
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label className="text-xs text-gray-500">{t.price} *</label>
                                                        <input
                                                            type="number"
                                                            value={variant.price}
                                                            onChange={(e) => updateVariant(vi, 'price', e.target.value)}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-[#2d6a27] focus:outline-none bg-white"
                                                            placeholder="৳"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">{t.salePrice}</label>
                                                        <input
                                                            type="number"
                                                            value={variant.sale_price}
                                                            onChange={(e) => updateVariant(vi, 'sale_price', e.target.value)}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-[#2d6a27] focus:outline-none bg-white"
                                                            placeholder="৳"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">{t.stock}</label>
                                                        <input
                                                            type="number"
                                                            value={variant.stock_quantity}
                                                            onChange={(e) => updateVariant(vi, 'stock_quantity', e.target.value)}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-[#2d6a27] focus:outline-none bg-white"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addVariant}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm text-gray-500 hover:border-[#2d6a27] hover:text-[#2d6a27] transition"
                                        >
                                            <Plus size={16} />
                                            {language === 'bn' ? 'ভেরিয়েন্ট যোগ করুন' : 'Add Variant'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Thumbnail */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <h2 className="mb-4 font-bold text-gray-800">{t.thumbnail}</h2>
                                {thumbnailPreview ? (
                                    <div className="relative mb-3">
                                        <img
                                            src={thumbnailPreview}
                                            className="w-full rounded-xl object-cover aspect-square"
                                            alt=""
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setThumbnail(null);
                                                setMediaThumbnailPath(null);
                                                setThumbnailPreview(null);
                                            }}
                                            className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => thumbnailRef.current?.click()}
                                            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-6 text-gray-400 hover:border-[#2d6a27] hover:text-[#2d6a27] transition"
                                        >
                                            <Upload size={24} className="mb-1" />
                                            <span className="text-sm font-medium">
                                                {language === 'bn' ? 'কম্পিউটার থেকে আপলোড' : 'Upload from Device'}
                                            </span>
                                            <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP</span>
                                        </button>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPickerTarget('thumbnail');
                                            setPickerOpen(true);
                                        }}
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition"
                                    >
                                        <ImageIcon size={14} className="text-[#2d6a27]" />
                                        {t.chooseFromMedia}
                                    </button>
                                    {thumbnailPreview && (
                                        <button
                                            type="button"
                                            onClick={() => thumbnailRef.current?.click()}
                                            className="rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:border-[#2d6a27] transition"
                                        >
                                            {t.change}
                                        </button>
                                    )}
                                </div>
                                <input
                                    ref={thumbnailRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnail}
                                    className="hidden"
                                />
                            </div>

                            {/* Additional Images */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <h2 className="mb-4 font-bold text-gray-800">{t.gallery}</h2>
                                {galleryItems.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {galleryItems.map((item) => (
                                            <div key={item.id} className="relative">
                                                <img
                                                    src={item.previewUrl}
                                                    className="w-full rounded-lg object-cover aspect-square border border-gray-100"
                                                    alt=""
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryItem(item.id)}
                                                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600 transition"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => imagesRef.current?.click()}
                                        className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:border-[#2d6a27] hover:text-[#2d6a27] transition"
                                    >
                                        <Upload size={14} />
                                        {t.upload}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPickerTarget('gallery');
                                            setPickerOpen(true);
                                        }}
                                        className="flex items-center justify-center gap-1.5 rounded-xl border border-[#2d6a27]/20 bg-green-50/50 py-2.5 text-xs font-semibold text-[#2d6a27] hover:bg-green-100/50 transition"
                                    >
                                        <ImageIcon size={14} />
                                        {t.media}
                                    </button>
                                </div>
                                <input
                                    ref={imagesRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImages}
                                    className="hidden"
                                />
                            </div>

                            {/* Settings */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                                <h2 className="mb-4 font-bold text-gray-800">
                                    {language === 'bn' ? 'স্ট্যাটাস ও সেটিংস' : 'Status & Visibility'}
                                </h2>
                                <div className="space-y-3">
                                    {[
                                        {
                                            name: 'is_active',
                                            label: language === 'bn' ? 'সক্রিয় করুন' : 'Active (Show in Store)',
                                            desc: language === 'bn' ? 'পণ্যটি দোকানে দেখাবে' : 'Visible to customers in storefront',
                                        },
                                        {
                                            name: 'is_featured',
                                            label: language === 'bn' ? 'ফিচার্ড পণ্য' : 'Featured Product',
                                            desc: language === 'bn' ? 'হোমপেজে ফিচার্ড লিস্টে দেখাবে' : 'Highlights on the homepage',
                                        },
                                    ].map((setting) => (
                                        <label key={setting.name} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name={setting.name}
                                                checked={form[setting.name as keyof typeof form] as boolean}
                                                onChange={handleChange}
                                                className="h-4 w-4 rounded accent-[#2d6a27]"
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{setting.label}</p>
                                                <p className="text-xs text-gray-400">{setting.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d6a27] py-3.5 font-bold text-white transition hover:bg-[#3d8f33] disabled:opacity-60"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" /> {t.processing}
                                    </>
                                ) : (
                                    language === 'bn' ? 'পণ্য সংরক্ষণ করুন' : 'Save Product'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Media Picker Modal */}
            <MediaPickerModal
                isOpen={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handleMediaSelect}
                multiple={pickerTarget === 'gallery'}
                title={
                    pickerTarget === 'thumbnail'
                        ? (language === 'bn' ? 'মূল ছবি নির্বাচন করুন' : 'Select Thumbnail Image')
                        : (language === 'bn' ? 'অতিরিক্ত ছবি নির্বাচন করুন' : 'Select Gallery Images')
                }
            />
        </>
    );
}
