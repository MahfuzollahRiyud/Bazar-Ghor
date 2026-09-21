import { Head, router } from '@inertiajs/react';
import {
    Check,
    Copy,
    ExternalLink,
    HardDrive,
    Image as ImageIcon,
    Loader2,
    Plus,
    Search,
    Trash2,
    UploadCloud,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface MediaItem {
    id: number;
    filename: string;
    file_path: string;
    url: string;
    mime_type?: string | null;
    file_size_kb: number;
    width?: number | null;
    height?: number | null;
    created_at: string;
}

interface PaginatedMedia {
    data: MediaItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    media?: PaginatedMedia;
    stats?: { total: number; total_size_mb: number };
    filters?: { search?: string };
}

export default function MediaIndex({
    media = { data: [], current_page: 1, last_page: 1, total: 0, links: [] },
    stats = { total: 0, total_size_mb: 0 },
    filters = {},
}: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [copied, setCopied] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const safeMediaList = Array.isArray(media?.data) ? media.data : [];
    const paginationLinks = Array.isArray(media?.links) ? media.links : [];

    const handleUploadFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('images[]', file);
        });

        router.post('/dashboard/media', formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('ছবিগুলো সফলভাবে WebP ফরম্যাটে অপ্টিমাইজ ও আপলোড হয়েছে!');
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: (errs) => {
                const msg = Object.values(errs)[0] || 'ছবি আপলোডে সমস্যা হয়েছে।';
                toast.error(String(msg));
            },
            onFinish: () => setUploading(false),
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dashboard/media', { search }, { preserveState: true, replace: true });
    };

    const handleDelete = (item: MediaItem) => {
        if (!confirm(`"${item.filename}" ছবিটি মুছে ফেলতে চান?`)) return;

        setDeletingId(item.id);
        router.delete(`/dashboard/media/${item.id}`, {
            onSuccess: () => {
                toast.success('ছবিটি মুছে ফেলা হয়েছে।');
                if (selectedItem?.id === item.id) setSelectedItem(null);
            },
            onError: () => toast.error('মুছতে সমস্যা হয়েছে।'),
            onFinish: () => setDeletingId(null),
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('ছবির লিঙ্ক কপি করা হয়েছে!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <Head title="মিডিয়া লাইব্রেরি — Bazar Ghor Admin" />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">মিডিয়া লাইব্রেরি</h1>
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                                WordPress স্টাইল
                            </span>
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                            মোট {stats.total}টি ছবি ({stats.total_size_mb} MB) — সব ছবি স্বয়ংক্রিয়ভাবে WebP অপ্টিমাইজড
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadFiles(e.target.files)}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d6a27] px-5 py-2.5 font-bold text-sm text-white shadow-sm transition hover:bg-[#23531f] active:scale-95 disabled:opacity-50"
                        >
                            {uploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            {uploading ? 'অপ্টিমাইজ হচ্ছে...' : 'নতুন ছবি আপলোড'}
                        </button>
                    </div>
                </div>

                {/* Upload Banner / Dropzone */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        handleUploadFiles(e.dataTransfer.files);
                    }}
                    className="cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/60 p-6 text-center transition hover:border-[#2d6a27] hover:bg-emerald-50/20"
                >
                    <UploadCloud className="mx-auto text-[#2d6a27] mb-2" size={36} />
                    <p className="font-bold text-sm text-gray-800">ছবি আপলোড করতে ক্লিক করুন বা টেনে আনুন (Drag & Drop)</p>
                    <p className="text-xs text-gray-500 mt-1">
                        যেকোনো JPG, PNG, GIF আপলোড করলে স্বয়ংক্রিয়ভাবে সর্বোচ্চ মান ঠিক রেখে WebP ফরম্যাটে অপ্টিমাইজ (<span className="font-semibold text-emerald-700">৫০KB-১০০KB</span>) হবে
                    </p>
                </div>

                {/* Filter & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ছবির নাম লিখে খুঁজুন..."
                            className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs text-gray-900 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                        />
                    </form>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <HardDrive size={14} className="text-gray-400" />
                        <span>মোট ফাইল সাইজ: <strong>{stats.total_size_mb} MB</strong></span>
                    </div>
                </div>

                {/* Media Grid */}
                {safeMediaList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {safeMediaList.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-xs transition hover:shadow-md ${
                                    selectedItem?.id === item.id ? 'ring-2 ring-[#2d6a27] border-[#2d6a27]' : 'border-gray-200'
                                }`}
                            >
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    <img
                                        src={item.url}
                                        alt={item.filename}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <span className="absolute top-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                                        WebP
                                    </span>
                                </div>

                                <div className="p-2.5 space-y-1">
                                    <p className="truncate text-xs font-semibold text-gray-800" title={item.filename}>
                                        {item.filename}
                                    </p>
                                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                                        <span className="font-mono text-emerald-700 font-bold">{item.file_size_kb} KB</span>
                                        <span>{item.width && item.height ? `${item.width}×${item.height}` : ''}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-400">
                        <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="font-semibold text-gray-700">কোনো মিডিয়া পাওয়া যায়নি</p>
                        <p className="text-xs text-gray-400 mt-1">উপরে ক্লিক করে নতুন ছবি আপলোড করুন</p>
                    </div>
                )}

                {/* Pagination */}
                {media?.last_page && media.last_page > 1 && paginationLinks.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs text-gray-500">
                            পেজ {media.current_page} এর {media.last_page} (মোট {stats.total}টি ছবি)
                        </span>

                        <div className="flex items-center gap-1.5">
                            {paginationLinks.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`min-w-8 h-8 rounded-lg px-2 text-xs font-bold transition flex items-center justify-center ${
                                        link.active
                                            ? 'bg-[#2d6a27] text-white shadow-xs'
                                            : link.url
                                                ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                                : 'text-gray-300 bg-gray-100 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Inspect / Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                        >
                            <X size={18} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Preview */}
                            <div className="flex flex-col items-center justify-center rounded-xl bg-gray-100 p-2 border border-gray-200">
                                <img
                                    src={selectedItem.url}
                                    alt={selectedItem.filename}
                                    className="max-h-64 w-full object-contain rounded-lg"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex flex-col justify-between space-y-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm break-all">{selectedItem.filename}</h3>
                                    <p className="text-xs text-gray-500 mt-1">আপলোড: {selectedItem.created_at}</p>

                                    <div className="mt-4 space-y-2 text-xs text-gray-600">
                                        <div className="flex justify-between border-b border-gray-100 pb-1">
                                            <span>ফরম্যাট:</span>
                                            <span className="font-bold text-emerald-700">WebP (অপ্টিমাইজড)</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-1">
                                            <span>ফাইলের সাইজ:</span>
                                            <span className="font-bold text-gray-800">{selectedItem.file_size_kb} KB</span>
                                        </div>
                                        {selectedItem.width && selectedItem.height && (
                                            <div className="flex justify-between border-b border-gray-100 pb-1">
                                                <span>ডাইমেনশন:</span>
                                                <span className="font-mono">{selectedItem.width} × {selectedItem.height} px</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-b border-gray-100 pb-1">
                                            <span>স্টোরেজ পাথ:</span>
                                            <span className="font-mono text-[10px] truncate max-w-[150px]">{selectedItem.file_path}</span>
                                        </div>
                                    </div>

                                    {/* Direct URL Box */}
                                    <div className="mt-4">
                                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">সরাসরি লিঙ্ক:</label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="text"
                                                readOnly
                                                value={selectedItem.url}
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 font-mono"
                                            />
                                            <button
                                                onClick={() => copyToClipboard(selectedItem.url)}
                                                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-gray-700 hover:bg-gray-50 hover:text-[#2d6a27] transition"
                                                title="কপি করুন"
                                            >
                                                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <a
                                        href={selectedItem.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-[#2d6a27] hover:underline font-semibold"
                                    >
                                        <ExternalLink size={12} />
                                        নতুন ট্যাবে দেখুন
                                    </a>

                                    <button
                                        onClick={() => handleDelete(selectedItem)}
                                        disabled={deletingId === selectedItem.id}
                                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                                    >
                                        <Trash2 size={13} />
                                        মুছে ফেলুন
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
