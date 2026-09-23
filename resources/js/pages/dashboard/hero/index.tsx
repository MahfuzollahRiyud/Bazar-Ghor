import MediaPickerModal, { type MediaItem } from '@/components/dashboard/MediaPickerModal';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    Edit,
    ExternalLink,
    Image as ImageIcon,
    LayoutTemplate,
    Plus,
    RefreshCw,
    Sliders,
    Sparkles,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Slide {
    id: number;
    image_path: string;
    image_url: string;
    title?: string | null;
    subtitle?: string | null;
    link_url?: string | null;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    heroMode: 'single' | 'slider';
    slides: Slide[];
}

export default function HeroIndex({ heroMode, slides }: Props) {
    const { t, language } = useAdminLanguage();

    const [currentMode, setCurrentMode] = useState<'single' | 'slider'>(heroMode);
    const [updatingMode, setUpdatingMode] = useState(false);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [mediaImagePath, setMediaImagePath] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const handleModeChange = (newMode: 'single' | 'slider') => {
        setCurrentMode(newMode);
        setUpdatingMode(true);
        router.post(
            '/dashboard/hero/settings',
            { hero_mode: newMode },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setUpdatingMode(false);
                    toast.success(
                        newMode === 'slider'
                            ? (language === 'en' ? 'Switched to Slider Carousel mode.' : 'স্লাইডার মোড সক্রিয় করা হয়েছে।')
                            : (language === 'en' ? 'Switched to Single Banner mode.' : 'সিঙ্গেল ব্যানার মোড সক্রিয় করা হয়েছে।')
                    );
                },
                onError: () => {
                    setUpdatingMode(false);
                    toast.error(language === 'en' ? 'Failed to update mode.' : 'মোড পরিবর্তন ব্যর্থ হয়েছে।');
                },
            }
        );
    };

    const openAddModal = () => {
        setEditingSlide(null);
        setTitle('');
        setSubtitle('');
        setLinkUrl('/shop');
        setIsActive(true);
        setImageFile(null);
        setMediaImagePath('');
        setImagePreview('');
        setModalOpen(true);
    };

    const openEditModal = (slide: Slide) => {
        setEditingSlide(slide);
        setTitle(slide.title ?? '');
        setSubtitle(slide.subtitle ?? '');
        setLinkUrl(slide.link_url ?? '');
        setIsActive(slide.is_active);
        setImageFile(null);
        setMediaImagePath('');
        setImagePreview(slide.image_url);
        setModalOpen(true);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setMediaImagePath('');
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleMediaSelect = (items: MediaItem[]) => {
        if (items.length > 0) {
            const item = items[0];
            setMediaImagePath(item.file_path);
            setImageFile(null);
            setImagePreview(item.url);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingSlide && !imageFile && !mediaImagePath) {
            toast.error(language === 'en' ? 'Please select a banner image.' : 'অনুগ্রহ করে ব্যানার ছবি নির্বাচন করুন।');
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('link_url', linkUrl);
        formData.append('is_active', isActive ? '1' : '0');

        if (imageFile) {
            formData.append('image', imageFile);
        }
        if (mediaImagePath) {
            formData.append('media_image_path', mediaImagePath);
        }

        const url = editingSlide ? `/dashboard/hero/slides/${editingSlide.id}` : '/dashboard/hero/slides';

        router.post(url, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSubmitting(false);
                setModalOpen(false);
                toast.success(
                    editingSlide
                        ? (language === 'en' ? 'Slide updated successfully!' : 'স্লাইড আপডেট সম্পন্ন হয়েছে!')
                        : (language === 'en' ? 'New slide added successfully!' : 'নতুন স্লাইড সফলভাবে যোগ হয়েছে!')
                );
            },
            onError: (errors) => {
                setSubmitting(false);
                const first = Object.values(errors)[0];
                toast.error(typeof first === 'string' ? first : (language === 'en' ? 'Operation failed.' : 'সমস্যা হয়েছে।'));
            },
        });
    };

    const handleDelete = (slide: Slide) => {
        if (slides.length <= 1) {
            toast.error(language === 'en' ? 'At least one slide is required.' : 'কমপক্ষে একটি ব্যানার থাকা আবশ্যক।');
            return;
        }

        if (!confirm(language === 'en' ? 'Are you sure you want to delete this slide?' : 'আপনি কি নিশ্চিত এই স্লাইডটি মুছে ফেলতে চান?')) {
            return;
        }

        router.delete(`/dashboard/hero/slides/${slide.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success(language === 'en' ? 'Slide deleted.' : 'স্লাইড মুছে ফেলা হয়েছে।'),
            onError: () => toast.error(language === 'en' ? 'Failed to delete.' : 'মুছতে সমস্যা হয়েছে।'),
        });
    };

    const handleToggleStatus = (slide: Slide) => {
        router.patch(`/dashboard/hero/slides/${slide.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(language === 'en' ? 'Status updated.' : 'স্ট্যাটাস পরিবর্তিত হয়েছে।'),
        });
    };

    const moveSlide = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= slides.length) return;

        const newOrder = [...slides];
        const [moved] = newOrder.splice(index, 1);
        newOrder.splice(targetIndex, 0, moved);

        const slideIds = newOrder.map((s) => s.id);

        router.post(
            '/dashboard/hero/reorder',
            { slide_ids: slideIds },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(t.reorderSuccess),
            }
        );
    };

    return (
        <>
            <Head title={`${t.heroManagement} — Bazar Ghor Admin`} />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{t.heroManagement}</h1>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                {currentMode === 'slider' ? t.sliderCarousel : t.singleBanner}
                            </span>
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                            {t.heroNotice}
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d6a27] px-5 py-2.5 font-bold text-sm text-white shadow-sm transition hover:bg-[#23531f] active:scale-95"
                    >
                        <Plus size={18} />
                        {t.addSlide}
                    </button>
                </div>

                {/* Mode Selector Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 mb-1">{t.displayMode}</h2>
                            <p className="text-xs text-gray-500">
                                {language === 'en'
                                    ? 'Choose between displaying a single static banner or an automated multi-banner slider.'
                                    : 'সিঙ্গেল স্ট্যাটিক ব্যানার নাকি একাধিক ছবির স্লাইডার ক্যারোসেল চালাবেন তা নির্বাচন করুন।'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-1.5 self-start md:self-center">
                            <button
                                type="button"
                                disabled={updatingMode}
                                onClick={() => handleModeChange('single')}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                                    currentMode === 'single'
                                        ? 'bg-white text-[#2d6a27] shadow-xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <LayoutTemplate size={16} />
                                <span>{t.singleBanner}</span>
                            </button>

                            <button
                                type="button"
                                disabled={updatingMode}
                                onClick={() => handleModeChange('slider')}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                                    currentMode === 'slider'
                                        ? 'bg-[#2d6a27] text-white shadow-xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Sliders size={16} />
                                <span>{t.sliderCarousel}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quality Notice Callout */}
                <div className="rounded-xl border border-green-200 bg-green-50/70 p-4 flex items-start gap-3 text-green-900">
                    <Sparkles className="text-[#2d6a27] shrink-0 mt-0.5" size={18} />
                    <div className="text-xs sm:text-sm">
                        <strong className="font-bold">{language === 'en' ? 'Zero Compression Blur:' : 'জিরো কম্প্রেশন কোয়ালিটি:'}</strong>{' '}
                        {t.originalQualityNotice}
                    </div>
                </div>

                {/* Slides List Table */}
                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                    <div className="border-b border-gray-200 bg-gray-50/70 px-6 py-4 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-sm">
                            {language === 'en' ? 'Banner Slides List' : 'ব্যানার স্লাইড তালিকা'} ({slides.length})
                        </h3>
                        <span className="text-xs text-gray-500">
                            {language === 'en' ? 'Ordered by appearance on homepage' : 'হোমপেজে প্রদর্শনের ক্রম অনুযায়ী সাজানো'}
                        </span>
                    </div>

                    {slides.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <ImageIcon className="mx-auto mb-3 opacity-40" size={40} />
                            <p className="text-sm">{t.noSlidesFound}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50/50 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3.5 w-16 text-center">{t.order}</th>
                                        <th className="px-6 py-3.5 w-44">{language === 'en' ? 'Banner Preview' : 'ব্যানার প্রিভিউ'}</th>
                                        <th className="px-6 py-3.5">{language === 'en' ? 'Title & Link' : 'শিরোনাম ও লিংক'}</th>
                                        <th className="px-6 py-3.5 w-28">{t.status}</th>
                                        <th className="px-6 py-3.5 w-32 text-center">{language === 'en' ? 'Reorder' : 'ক্রম বদল'}</th>
                                        <th className="px-6 py-3.5 w-28 text-right">{t.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {slides.map((slide, index) => (
                                        <tr key={slide.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-6 py-4 text-center font-bold text-gray-900">
                                                #{index + 1}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="relative h-16 w-36 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-2xs">
                                                    <img
                                                        src={slide.image_url}
                                                        alt={slide.title || 'Slide'}
                                                        className="h-full w-full object-cover object-center"
                                                    />
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">
                                                    {slide.title || (language === 'en' ? 'Untitled Banner' : 'শিরোনামহীন ব্যানার')}
                                                </p>
                                                {slide.subtitle && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{slide.subtitle}</p>
                                                )}
                                                {slide.link_url && (
                                                    <a
                                                        href={slide.link_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-[#2d6a27] hover:underline mt-1 font-mono"
                                                    >
                                                        <span>{slide.link_url}</span>
                                                        <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(slide)}
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition ${
                                                        slide.is_active
                                                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${slide.is_active ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                                                    {slide.is_active ? t.active : t.inactive}
                                                </button>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        disabled={index === 0}
                                                        onClick={() => moveSlide(index, 'up')}
                                                        className="p-1 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-30 disabled:pointer-events-none transition"
                                                        title={t.moveUp}
                                                    >
                                                        <ArrowUp size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={index === slides.length - 1}
                                                        onClick={() => moveSlide(index, 'down')}
                                                        className="p-1 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-30 disabled:pointer-events-none transition"
                                                        title={t.moveDown}
                                                    >
                                                        <ArrowDown size={16} />
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(slide)}
                                                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
                                                        title={t.edit}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(slide)}
                                                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                                                        title={t.delete}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add / Edit Slide Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingSlide ? t.editSlide : t.addSlide}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Banner Image Picker */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    {language === 'en' ? 'Banner Image (HD 1024x381 or 1920x600 recommended)' : 'ব্যানার ছবি (এইচডি রেজোলিউশন)'} *
                                </label>

                                {imagePreview ? (
                                    <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-full w-full object-contain sm:object-cover bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setMediaImagePath(''); setImagePreview(''); }}
                                            className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white shadow-md hover:bg-red-700 transition"
                                            title={t.remove}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {/* Option A: Upload file */}
                                        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-[#2d6a27] hover:bg-green-50/50 transition">
                                            <Upload size={22} className="text-[#2d6a27]" />
                                            <span className="text-xs font-semibold text-gray-700">
                                                {language === 'en' ? 'Upload from PC' : 'কম্পিউটার থেকে আপলোড'}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </label>

                                        {/* Option B: Media Library */}
                                        <button
                                            type="button"
                                            onClick={() => setMediaPickerOpen(true)}
                                            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-center hover:border-[#2d6a27] hover:bg-green-50/50 transition"
                                        >
                                            <ImageIcon size={22} className="text-[#2d6a27]" />
                                            <span className="text-xs font-semibold text-gray-700">
                                                {t.chooseFromMedia}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    {t.slideTitle}
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={language === 'en' ? 'e.g. Mega Gadget Sale' : 'যেমন: মেগা গ্যাজেট সেল'}
                                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                />
                            </div>

                            {/* Link URL */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    {t.slideLink}
                                </label>
                                <input
                                    type="text"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    placeholder="/shop or /shop?category=airbuds"
                                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 font-mono focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                />
                            </div>

                            {/* Active Switch */}
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    {language === 'en' ? 'Active on Homepage' : 'হোমপেজে সক্রিয় থাকবে'}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-4 w-4 rounded text-[#2d6a27] focus:ring-[#2d6a27]"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-xl bg-[#2d6a27] px-6 py-2 text-sm font-bold text-white hover:bg-[#23531f] shadow-sm transition disabled:opacity-50"
                                >
                                    {submitting ? t.processing : t.save}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Media Picker Modal */}
            <MediaPickerModal
                isOpen={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                multiple={false}
                title={t.chooseFromMedia}
            />
        </>
    );
}
