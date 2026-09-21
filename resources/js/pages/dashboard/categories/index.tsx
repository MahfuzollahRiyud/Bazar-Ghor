import { Head, router } from '@inertiajs/react';
import {
    Edit,
    FolderOpen,
    Image as ImageIcon,
    Loader2,
    Plus,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import MediaPickerModal, { type MediaItem } from '@/components/dashboard/MediaPickerModal';

interface Category {
    id: number;
    name: string;
    slug: string;
    image_url?: string | null;
    is_active: boolean;
    sort_order: number;
    products_count: number;
    created_at: string;
}

interface Props {
    categories: Category[];
}

const BLANK_FORM = {
    name: '',
    description: '',
    sort_order: '0',
    is_active: true,
};

export default function CategoriesIndex({ categories }: Props) {
    const { t, language } = useAdminLanguage();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ ...BLANK_FORM });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [mediaImagePath, setMediaImagePath] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm((p) => ({
            ...p,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const startEdit = (cat: Category) => {
        setEditingId(cat.id);
        setForm({
            name: cat.name,
            description: '',
            sort_order: String(cat.sort_order),
            is_active: cat.is_active,
        });
        setImagePreview(cat.image_url ?? null);
        setImageFile(null);
        setMediaImagePath(null);
        setRemoveImage(false);
        setShowAdd(false);
        setErrors({});
    };

    const resetForm = () => {
        setShowAdd(false);
        setEditingId(null);
        setForm({ ...BLANK_FORM });
        setImageFile(null);
        setImagePreview(null);
        setMediaImagePath(null);
        setRemoveImage(false);
        setErrors({});
    };

    const handleMediaSelect = (selected: MediaItem[]) => {
        if (selected.length > 0) {
            const first = selected[0];
            setImageFile(null);
            setMediaImagePath(first.file_path);
            setImagePreview(first.url);
            setRemoveImage(false);
            if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
            toast.success(language === 'en' ? 'Image selected from Media Library!' : 'মিডিয়া লাইব্রেরি থেকে ছবি নির্বাচন করা হয়েছে!');
        }
        setMediaPickerOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setMediaImagePath(null);
            setRemoveImage(false);
            if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setMediaImagePath(null);
        setRemoveImage(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const buildData = () => {
        const data = new FormData();
        data.append('name', form.name);
        data.append('description', form.description || '');
        data.append('sort_order', String(form.sort_order || 0));
        data.append('is_active', form.is_active ? '1' : '0');

        if (removeImage) {
            data.append('remove_image', '1');
        }

        if (imageFile) {
            data.append('image', imageFile);
        } else if (mediaImagePath) {
            data.append('media_image_path', mediaImagePath);
        }

        return data;
    };

    const handleStore = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const data = buildData();
        router.post('/dashboard/categories', data, {
            forceFormData: true,
            onSuccess: () => {
                toast.success(t.categoryAddedSuccess);
                resetForm();
            },
            onError: (errs) => {
                setErrors(errs);
                const firstErr = Object.values(errs)[0];
                toast.error(typeof firstErr === 'string' ? firstErr : (language === 'en' ? 'Please check the form.' : 'সমস্যা হয়েছে। ফর্ম চেক করুন।'));
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        setSubmitting(true);
        const data = buildData();
        router.post(`/dashboard/categories/${editingId}`, data, {
            forceFormData: true,
            onSuccess: () => {
                toast.success(t.categoryUpdatedSuccess);
                resetForm();
            },
            onError: (errs) => {
                setErrors(errs);
                const firstErr = Object.values(errs)[0];
                toast.error(typeof firstErr === 'string' ? firstErr : (language === 'en' ? 'Please check the form.' : 'সমস্যা হয়েছে। ফর্ম চেক করুন।'));
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: number, name: string) => {
        if (!confirm(t.deleteCategoryConfirm)) return;
        router.delete(`/dashboard/categories/${id}`, {
            onSuccess: () => toast.success(t.categoryDeletedSuccess),
        });
    };

    const isOpen = showAdd || editingId !== null;
    const isEditing = editingId !== null;

    return (
        <>
            <Head title={`${t.categoryManagement} — Bazar Ghor Admin`} />

            <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                            <FolderOpen className="text-[#2d6a27]" size={26} />
                            {t.categoryManagement}
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                            {language === 'en'
                                ? 'Organize your store products into clear categories with images.'
                                : 'ছবি ও বিবরণ সহ স্টোরের পণ্যগুলোকে বিভিন্ন ক্যাটাগরিতে সাজান।'}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setShowAdd(true);
                            setEditingId(null);
                            setForm({ ...BLANK_FORM });
                            setImageFile(null);
                            setImagePreview(null);
                            setMediaImagePath(null);
                            setRemoveImage(false);
                            setErrors({});
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a27] px-5 py-2.5 font-bold text-white hover:bg-[#23531f] transition shadow-xs self-start sm:self-auto"
                    >
                        <Plus size={18} />
                        <span>{t.newCategory}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Categories List */}
                    <div className={isOpen ? 'lg:col-span-2' : 'lg:col-span-3'}>
                        <div className="rounded-2xl bg-white border border-gray-100 shadow-xs overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="px-5 py-3.5">{t.categories}</th>
                                        <th className="px-5 py-3.5 hidden md:table-cell">{t.products}</th>
                                        <th className="px-5 py-3.5">{t.status}</th>
                                        <th className="px-5 py-3.5 text-right">{t.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                                                {language === 'en' ? 'No categories found.' : 'কোনো ক্যাটাগরি তৈরি করা হয়নি।'}
                                            </td>
                                        </tr>
                                    ) : (
                                        categories.map((cat) => (
                                            <tr
                                                key={cat.id}
                                                className={`hover:bg-gray-50/70 transition ${
                                                    editingId === cat.id ? 'bg-green-50/60' : ''
                                                }`}
                                            >
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                            {cat.image_url ? (
                                                                <img
                                                                    src={cat.image_url}
                                                                    alt=""
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-xl">📦</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{cat.name}</p>
                                                            <p className="text-xs text-gray-400 font-mono">/{cat.slug}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5 hidden md:table-cell text-gray-600 text-xs font-semibold">
                                                    {cat.products_count} {language === 'en' ? 'items' : 'টি পণ্য'}
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <span
                                                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                            cat.is_active
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {cat.is_active ? t.active : t.inactive}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => startEdit(cat)}
                                                            className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition shadow-2xs"
                                                            title={t.edit}
                                                        >
                                                            <Edit size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(cat.id, cat.name)}
                                                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 transition shadow-2xs"
                                                            title={t.delete}
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Form Panel (Create & Edit) */}
                    {isOpen && (
                        <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs h-fit animate-in fade-in-50 duration-200">
                            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                                <h2 className="font-bold text-gray-900">
                                    {isEditing ? t.editCategory : t.newCategory}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={isEditing ? handleUpdate : handleStore} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                        {t.categoryName} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 shadow-2xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none ${
                                            errors.name ? 'border-red-400' : 'border-gray-300'
                                        }`}
                                        placeholder={language === 'en' ? 'e.g. Smart Watch, Airbuds' : 'ক্যাটাগরির নাম লিখুন'}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                        {t.description}
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange as any}
                                        rows={2}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-2xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none resize-none"
                                        placeholder={language === 'en' ? 'Optional brief description...' : 'ঐচ্ছিক বিবরণ...'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                        {t.sortOrder}
                                    </label>
                                    <input
                                        type="number"
                                        name="sort_order"
                                        value={form.sort_order}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-2xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                        min="0"
                                    />
                                </div>

                                {/* Category Image Section */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                        {t.categoryImage}
                                    </label>

                                    {imagePreview ? (
                                        <div className="relative mb-3 inline-block">
                                            <img
                                                src={imagePreview}
                                                className="h-24 w-24 rounded-xl object-cover border border-gray-200 shadow-xs"
                                                alt="Category preview"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white shadow-xs hover:bg-red-700 transition"
                                                title={t.remove}
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ) : null}

                                    {/* Action buttons: Media Library & Direct Upload */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setMediaPickerOpen(true)}
                                            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[#2d6a27] hover:bg-green-50 hover:text-[#2d6a27] transition shadow-2xs"
                                        >
                                            <ImageIcon size={14} className="text-[#2d6a27]" />
                                            <span>{t.chooseFromMedia}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[#2d6a27] hover:text-[#2d6a27] transition shadow-2xs"
                                        >
                                            <Upload size={14} />
                                            <span>{imagePreview ? t.change : t.uploadNewImage}</span>
                                        </button>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onClick={(e) => {
                                            (e.target as HTMLInputElement).value = '';
                                        }}
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer pt-1">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={Boolean(form.is_active)}
                                        onChange={handleChange}
                                        className="h-4 w-4 accent-[#2d6a27] rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{t.active}</span>
                                </label>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d6a27] py-3 font-bold text-white hover:bg-[#23531f] transition shadow-xs disabled:opacity-60"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" /> {t.processing}
                                            </>
                                        ) : isEditing ? (
                                            t.update
                                        ) : (
                                            t.save
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Media Library Picker Modal */}
            <MediaPickerModal
                isOpen={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                multiple={false}
                title={language === 'en' ? 'Select Category Image' : 'ক্যাটাগরির ছবি নির্বাচন করুন'}
            />
        </>
    );
}
