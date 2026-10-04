import { Head, router } from '@inertiajs/react';
import {
    Check,
    CheckSquare,
    Copy,
    Download,
    ExternalLink,
    HardDrive,
    Image as ImageIcon,
    Loader2,
    Plus,
    Search,
    Square,
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
    const [uploadProgress, setUploadProgress] = useState<{
        uploading: boolean;
        current: number;
        total: number;
        percent: number;
        currentFileName?: string;
    }>({
        uploading: false,
        current: 0,
        total: 0,
        percent: 0,
    });

    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [copied, setCopied] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [bulkDownloading, setBulkDownloading] = useState(false);

    const safeMediaList = Array.isArray(media?.data) ? media.data : [];
    const paginationLinks = Array.isArray(media?.links) ? media.links : [];

    const getCsrfToken = () => {
        return document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
    };

    // Batch / Chunked Multi-image Upload
    const handleUploadFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const totalFiles = fileArray.length;
        setUploading(true);
        setUploadProgress({
            uploading: true,
            current: 0,
            total: totalFiles,
            percent: 0,
            currentFileName: fileArray[0].name,
        });

        const CHUNK_SIZE = 2; // 2 files per request to stay well under PHP upload size & execution time limits
        let processed = 0;
        let errorCount = 0;
        const csrfToken = getCsrfToken();

        for (let i = 0; i < totalFiles; i += CHUNK_SIZE) {
            const chunk = fileArray.slice(i, i + CHUNK_SIZE);
            const chunkNames = chunk.map((f) => f.name).join(', ');

            setUploadProgress({
                uploading: true,
                current: processed,
                total: totalFiles,
                percent: Math.round((processed / totalFiles) * 100),
                currentFileName: chunkNames,
            });

            const formData = new FormData();
            chunk.forEach((file) => {
                formData.append('images[]', file);
            });

            try {
                const res = await fetch('/dashboard/media', {
                    method: 'POST',
                    headers: {
                        'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
                        'Accept': 'application/json',
                    },
                    body: formData,
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => null);
                    errorCount += chunk.length;
                    const msg = errData?.message || `${chunkNames} আপলোডে সমস্যা হয়েছে।`;
                    toast.error(msg);
                }
            } catch (err) {
                errorCount += chunk.length;
                toast.error(`${chunkNames} আপলোডে নেটওয়ার্ক সমস্যা হয়েছে।`);
            }

            processed += chunk.length;
            setUploadProgress({
                uploading: true,
                current: processed,
                total: totalFiles,
                percent: Math.round((processed / totalFiles) * 100),
                currentFileName: i + CHUNK_SIZE < totalFiles ? fileArray[i + CHUNK_SIZE].name : 'সম্পূর্ণ হচ্ছে...',
            });
        }

        if (fileInputRef.current) fileInputRef.current.value = '';

        if (errorCount === 0) {
            toast.success(`সবগুলো ছবি (${totalFiles}টি) সফলভাবে WebP অপ্টিমাইজড হয়ে আপলোড হয়েছে!`);
        } else if (errorCount < totalFiles) {
            toast.warning(`${totalFiles - errorCount}টি ছবি আপলোড হয়েছে, ${errorCount}টিতে সমস্যা হয়েছে।`);
        } else {
            toast.error('ছবিগুলো আপলোড করা সম্ভব হয়নি।');
        }

        setUploading(false);
        setUploadProgress({ uploading: false, current: totalFiles, total: totalFiles, percent: 100 });
        router.reload();
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dashboard/media', { search }, { preserveState: true, replace: true });
    };

    const handleDelete = (item: MediaItem) => {
        if (!confirm(`"${item.filename}" ছবিটি স্থায়ীভাবে মুছে ফেলতে চান?`)) return;

        setDeletingId(item.id);
        router.delete(`/dashboard/media/${item.id}`, {
            onSuccess: () => {
                toast.success('ছবিটি মুছে ফেলা হয়েছে।');
                if (selectedItem?.id === item.id) setSelectedItem(null);
                setSelectedIds((prev) => prev.filter((id) => id !== item.id));
            },
            onError: () => toast.error('মুছতে সমস্যা হয়েছে।'),
            onFinish: () => setDeletingId(null),
        });
    };

    // Bulk selection handlers
    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const isAllPageSelected =
        safeMediaList.length > 0 && safeMediaList.every((item) => selectedIds.includes(item.id));

    const toggleSelectAllPage = () => {
        if (isAllPageSelected) {
            setSelectedIds((prev) => prev.filter((id) => !safeMediaList.some((m) => m.id === id)));
        } else {
            const pageIds = safeMediaList.map((m) => m.id);
            setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (
            !confirm(
                `আপনি কি নিশ্চিত যে নির্বাচিত ${selectedIds.length}টি মিডিয়া স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।`
            )
        ) {
            return;
        }

        setBulkDeleting(true);
        try {
            const csrfToken = getCsrfToken();
            const res = await fetch('/dashboard/media/bulk-destroy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ ids: selectedIds }),
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message || `${selectedIds.length}টি মিডিয়া সফলভাবে মুছে ফেলা হয়েছে।`);
                if (selectedItem && selectedIds.includes(selectedItem.id)) {
                    setSelectedItem(null);
                }
                setSelectedIds([]);
                router.reload();
            } else {
                toast.error('নির্বাচিত ছবিগুলো মুছতে সমস্যা হয়েছে।');
            }
        } catch (e) {
            toast.error('অনুরোধ ব্যর্থ হয়েছে।');
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleBulkDownload = () => {
        if (selectedIds.length === 0) return;
        setBulkDownloading(true);
        window.location.href = `/dashboard/media/bulk-download?ids=${selectedIds.join(',')}`;
        setTimeout(() => setBulkDownloading(false), 2500);
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
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                অপ্টিমাইজড স্টোরেজ
                            </span>
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                            মোট {stats.total}টি ছবি ({stats.total_size_mb} MB) — সব ছবি স্বয়ংক্রিয়ভাবে দ্রুতগতির WebP ফরম্যাটে সংরক্ষিত
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
                    className="cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/70 p-6 text-center transition hover:border-[#2d6a27] hover:bg-emerald-50/20"
                >
                    <UploadCloud className="mx-auto text-[#2d6a27] mb-2" size={36} />
                    <p className="font-bold text-sm text-gray-800">
                        একসাথে একাধিক ছবি আপলোড করতে ক্লিক করুন বা টেনে আনুন (Drag & Drop)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        যেকোনো সাইজের JPG, PNG, GIF নির্বাচন করুন — ব্যাকএন্ডে স্বয়ংক্রিয়ভাবে মান অক্ষুণ্ণ রেখে সংকুচিত WebP ফরম্যাটে (<span className="font-semibold text-emerald-700">৫০KB-১০০KB</span>) কনভার্ট হবে
                    </p>
                </div>

                {/* Live Upload Progress Bar */}
                {uploadProgress.uploading && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                            <span className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-emerald-700" />
                                ছবি আপলোড ও WebP অপ্টিমাইজেশন চলছে... ({uploadProgress.current}/{uploadProgress.total})
                            </span>
                            <span>{uploadProgress.percent}%</span>
                        </div>
                        <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-[#2d6a27] h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress.percent}%` }}
                            />
                        </div>
                        {uploadProgress.currentFileName && (
                            <p className="text-[11px] text-emerald-700 font-mono truncate">
                                প্রক্রিয়াকরণ হচ্ছে: {uploadProgress.currentFileName}
                            </p>
                        )}
                    </div>
                )}

                {/* Bulk Actions Sticky Toolbar */}
                {selectedIds.length > 0 && (
                    <div className="sticky top-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white/95 p-3 sm:p-4 shadow-lg backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#2d6a27] text-xs font-bold text-white shadow-xs">
                                {selectedIds.length}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-gray-800">
                                {selectedIds.length}টি ছবি নির্বাচিত
                            </span>
                            <button
                                type="button"
                                onClick={toggleSelectAllPage}
                                className="text-xs font-semibold text-[#2d6a27] hover:underline"
                            >
                                {isAllPageSelected ? 'বর্তমান পেজ আনসিলেক্ট করুন' : 'বর্তমান পেজের সব সিলেক্ট করুন'}
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Download Selected as ZIP */}
                            <button
                                type="button"
                                onClick={handleBulkDownload}
                                disabled={bulkDownloading || bulkDeleting}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition active:scale-95 disabled:opacity-50"
                                title="নির্বাচিত ছবিগুলোর ZIP ডাউনলোড করুন"
                            >
                                {bulkDownloading ? (
                                    <Loader2 size={14} className="animate-spin text-gray-500" />
                                ) : (
                                    <Download size={14} />
                                )}
                                ZIP ডাউনলোড ({selectedIds.length})
                            </button>

                            {/* Bulk Delete */}
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                disabled={bulkDeleting || bulkDownloading}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition active:scale-95 disabled:opacity-50"
                            >
                                {bulkDeleting ? (
                                    <Loader2 size={14} className="animate-spin text-white" />
                                ) : (
                                    <Trash2 size={14} />
                                )}
                                নির্বাচিতগুলো মুছুন ({selectedIds.length})
                            </button>

                            {/* Clear Selection */}
                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                                title="সিলেকশন বাতিল করুন"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Filter & Search Bar */}
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

                    <div className="flex items-center gap-3">
                        {safeMediaList.length > 0 && (
                            <button
                                type="button"
                                onClick={toggleSelectAllPage}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#2d6a27] transition"
                            >
                                {isAllPageSelected ? (
                                    <CheckSquare size={16} className="text-[#2d6a27]" />
                                ) : (
                                    <Square size={16} className="text-gray-400" />
                                )}
                                {isAllPageSelected ? 'সব আনসিলেক্ট' : 'পেজের সব সিলেক্ট'}
                            </button>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <HardDrive size={14} className="text-gray-400" />
                            <span>মোট ফাইল সাইজ: <strong>{stats.total_size_mb} MB</strong></span>
                        </div>
                    </div>
                </div>

                {/* Media Grid */}
                {safeMediaList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {safeMediaList.map((item) => {
                            const isSelected = selectedIds.includes(item.id);
                            const isInspected = selectedItem?.id === item.id;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-xs transition hover:shadow-md ${
                                        isSelected
                                            ? 'ring-2 ring-[#2d6a27] border-[#2d6a27] bg-emerald-50/10'
                                            : isInspected
                                                ? 'ring-2 ring-emerald-500 border-emerald-500'
                                                : 'border-gray-200'
                                    }`}
                                >
                                    {/* Selection Checkbox */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelect(item.id);
                                        }}
                                        className={`absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                                            isSelected
                                                ? 'bg-[#2d6a27] border-[#2d6a27] text-white shadow-xs'
                                                : 'bg-white/80 border-gray-300 text-transparent hover:border-gray-400 group-hover:bg-white backdrop-blur-xs'
                                        }`}
                                        title={isSelected ? 'সিলেকশন বাতিল করুন' : 'সিলেক্ট করুন'}
                                    >
                                        <Check
                                            size={14}
                                            className={
                                                isSelected
                                                    ? 'opacity-100 stroke-[3]'
                                                    : 'opacity-0 group-hover:opacity-30 group-hover:text-gray-500'
                                            }
                                        />
                                    </button>

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
                            );
                        })}
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
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-bold text-gray-900 text-sm break-all">{selectedItem.filename}</h3>
                                        <button
                                            type="button"
                                            onClick={() => toggleSelect(selectedItem.id)}
                                            className={`rounded-lg px-2.5 py-1 text-xs font-bold border transition ${
                                                selectedIds.includes(selectedItem.id)
                                                    ? 'bg-[#2d6a27] text-white border-[#2d6a27]'
                                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {selectedIds.includes(selectedItem.id) ? 'নির্বাচিত ✓' : 'সিলেক্ট করুন'}
                                        </button>
                                    </div>
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
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={selectedItem.url}
                                            download={selectedItem.filename}
                                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                                        >
                                            <Download size={13} />
                                            ডাউনলোড
                                        </a>
                                        <a
                                            href={selectedItem.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-[#2d6a27] hover:underline font-semibold"
                                        >
                                            <ExternalLink size={12} />
                                            নতুন ট্যাবে
                                        </a>
                                    </div>

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
