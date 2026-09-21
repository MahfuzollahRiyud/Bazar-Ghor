import { Check, Image as ImageIcon, Loader2, Search, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export interface MediaItem {
    id: number;
    filename: string;
    file_path: string;
    url: string;
    file_size_kb: number;
    width?: number | null;
    height?: number | null;
}

interface MediaPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (selected: MediaItem[]) => void;
    multiple?: boolean;
    title?: string;
}

export default function MediaPickerModal({
    isOpen,
    onClose,
    onSelect,
    multiple = false,
    title = 'ছবি নির্বাচন করুন (WordPress Media Library)',
}: MediaPickerModalProps) {
    const [tab, setTab] = useState<'library' | 'upload'>('library');
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch media list from API
    const fetchMedia = async (query = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/dashboard/media/list?search=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setMediaItems(data.data ?? []);
            }
        } catch (e) {
            console.error('Failed to fetch media:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMedia(search);
            setSelectedIds([]);
        }
    }, [isOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchMedia(search);
    };

    const toggleSelect = (item: MediaItem) => {
        if (multiple) {
            setSelectedIds((prev) =>
                prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
            );
        } else {
            setSelectedIds([item.id]);
        }
    };

    const handleUploadFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        Array.from(files).forEach((f) => formData.append('images[]', f));

        try {
            // Get CSRF token
            const csrfToken = document.cookie
                .split('; ')
                .find((row) => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];

            const res = await fetch('/dashboard/media', {
                method: 'POST',
                headers: {
                    'X-XSRF-TOKEN': csrfToken ? decodeURIComponent(csrfToken) : '',
                    'Accept': 'application/json',
                },
                body: formData,
            });

            if (res.ok) {
                const json = await res.json();
                toast.success('ছবি সফলভাবে WebP অপ্টিমাইজড হয়ে আপলোড হয়েছে!');
                await fetchMedia();
                setTab('library');

                // Auto-select uploaded items
                if (json.items && json.items.length > 0) {
                    const uploadedIds = json.items.map((it: any) => it.id);
                    setSelectedIds(multiple ? uploadedIds : [uploadedIds[0]]);
                }
            } else {
                toast.error('ছবি আপলোডে সমস্যা হয়েছে।');
            }
        } catch (e) {
            toast.error('আপলোড ব্যাহত হয়েছে।');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleConfirm = () => {
        const chosen = mediaItems.filter((m) => selectedIds.includes(m.id));
        if (chosen.length === 0) {
            toast.error('অনুগ্রহ করে অন্তত একটি ছবি নির্বাচন করুন।');
            return;
        }
        onSelect(chosen);
        onClose();
    };

    if (!isOpen) return null;

    const selectedDetails = mediaItems.find((m) => selectedIds[selectedIds.length - 1] === m.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="flex h-[88vh] w-full max-w-5xl flex-col rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50/70">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-gray-900">{title}</h2>
                        <p className="text-xs text-gray-500">ওয়ার্ডপ্রেস স্টাইলে ছবি পছন্দ করুন বা সরাসরি আপলোড করুন</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-4 border-b border-gray-200 px-6 pt-3 bg-white text-sm font-semibold">
                    <button
                        type="button"
                        onClick={() => setTab('library')}
                        className={`pb-3 transition border-b-2 ${
                            tab === 'library'
                                ? 'border-[#2d6a27] text-[#2d6a27]'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        মিডিয়া লাইব্রেরি ({mediaItems.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setTab('upload')}
                        className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${
                            tab === 'upload'
                                ? 'border-[#2d6a27] text-[#2d6a27]'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <UploadCloud size={16} />
                        নতুন আপলোড
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-hidden p-6 bg-[#fafafa]">
                    {tab === 'library' ? (
                        <div className="flex h-full flex-col md:flex-row gap-6">
                            {/* Main Grid Section */}
                            <div className="flex-1 flex flex-col min-w-0">
                                {/* Search Bar & Actions */}
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                    <form onSubmit={handleSearch} className="flex-1 min-w-[240px] flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="ছবির নাম লিখে খুঁজুন..."
                                                className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs text-gray-900 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="rounded-xl bg-[#2d6a27] px-4 py-2 text-xs font-bold text-white hover:bg-[#23531f] transition"
                                        >
                                            খুঁজুন
                                        </button>
                                    </form>

                                    {multiple && mediaItems.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (selectedIds.length === mediaItems.length) {
                                                        setSelectedIds([]);
                                                    } else {
                                                        setSelectedIds(mediaItems.map((m) => m.id));
                                                    }
                                                }}
                                                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                                            >
                                                {selectedIds.length === mediaItems.length ? 'সব আনচেক করুন' : 'সব সিলেক্ট করুন'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Images Grid */}
                                <div className="flex-1 overflow-y-auto pr-1">
                                    {loading ? (
                                        <div className="flex h-64 items-center justify-center">
                                            <Loader2 className="animate-spin text-[#2d6a27]" size={32} />
                                        </div>
                                    ) : mediaItems.length > 0 ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                            {mediaItems.map((item) => {
                                                const isSelected = selectedIds.includes(item.id);
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => toggleSelect(item)}
                                                        className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border bg-white transition hover:shadow-md ${
                                                            isSelected
                                                                ? 'ring-3 ring-[#2d6a27] border-[#2d6a27]'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <img
                                                            src={item.url}
                                                            alt={item.filename}
                                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                            loading="lazy"
                                                        />
                                                        {isSelected && (
                                                            <div className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#2d6a27] text-white shadow-md text-xs font-bold">
                                                                {multiple && selectedIds.length > 1 ? (
                                                                    selectedIds.indexOf(item.id) + 1
                                                                ) : (
                                                                    <Check size={14} strokeWidth={3} />
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-[10px] text-white truncate">
                                                            {item.file_size_kb} KB • WebP
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex h-64 flex-col items-center justify-center text-center text-gray-400">
                                            <ImageIcon size={40} className="mb-2 text-gray-300" />
                                            <p className="text-sm font-semibold">কোনো ছবি পাওয়া যায়নি</p>
                                            <button
                                                type="button"
                                                onClick={() => setTab('upload')}
                                                className="mt-3 text-xs font-bold text-[#2d6a27] hover:underline"
                                            >
                                                + নতুন ছবি আপলোড করুন
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar Preview (WordPress Attachment Details style) */}
                            {selectedDetails && (
                                <div className="hidden md:flex w-64 shrink-0 flex-col rounded-2xl border border-gray-200 bg-white p-4 text-xs space-y-3 shadow-xs">
                                    <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">ছবির বিবরণ</h4>
                                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                                        <img src={selectedDetails.url} alt={selectedDetails.filename} className="max-h-full max-w-full object-contain" />
                                    </div>
                                    <div className="space-y-1.5 text-gray-600">
                                        <p className="font-semibold text-gray-800 break-all">{selectedDetails.filename}</p>
                                        <p>ফরম্যাট: <span className="font-bold text-emerald-700">WebP (অপ্টিমাইজড)</span></p>
                                        <p>সাইজ: <span className="font-bold">{selectedDetails.file_size_kb} KB</span></p>
                                        {selectedDetails.width && selectedDetails.height && (
                                            <p>ডাইমেনশন: <span className="font-mono">{selectedDetails.width}×{selectedDetails.height}</span></p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Upload New Tab */
                        <div className="flex h-full flex-col items-center justify-center">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple={multiple}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleUploadFiles(e.target.files)}
                            />

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    handleUploadFiles(e.dataTransfer.files);
                                }}
                                className="flex flex-col items-center justify-center w-full max-w-lg cursor-pointer rounded-3xl border-2 border-dashed border-gray-300 bg-white p-12 text-center transition hover:border-[#2d6a27] hover:bg-emerald-50/20 shadow-xs"
                            >
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#2d6a27]">
                                    {uploading ? <Loader2 className="animate-spin" size={32} /> : <UploadCloud size={32} />}
                                </div>
                                <h3 className="text-base font-bold text-gray-900">
                                    {uploading ? 'ছবি WebP ফরম্যাটে অপ্টিমাইজ হচ্ছে...' : 'পিসি থেকে ছবি আপলোড করুন'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                    ছবি এখানে টেনে এনে ছেড়ে দিন অথবা ক্লিক করে আপনার কম্পিউটার থেকে নির্বাচন করুন। স্বয়ংক্রিয়ভাবে WebP (<span className="text-emerald-700 font-bold">৫০-১০০KB</span>)-এ কমপ্রেস হবে।
                                </p>

                                <button
                                    type="button"
                                    disabled={uploading}
                                    className="mt-6 rounded-xl bg-[#2d6a27] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#23531f] transition disabled:opacity-50"
                                >
                                    {uploading ? 'প্রসেসিং...' : 'ফাইল বাছাই করুন'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3.5 bg-gray-50">
                    <div className="text-xs text-gray-600">
                        {selectedIds.length > 0 ? (
                            <span>
                                <strong>{selectedIds.length}</strong>টি ছবি নির্বাচিত
                            </span>
                        ) : (
                            <span className="text-gray-400">কোনো ছবি নির্বাচিত নেই</span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            বাতিল
                        </button>

                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={selectedIds.length === 0}
                            className="rounded-xl bg-[#2d6a27] px-6 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#23531f] transition disabled:opacity-40"
                        >
                            {multiple
                                ? (selectedIds.length > 0 ? `${selectedIds.length}টি ছবি যোগ করুন` : 'ছবি নির্বাচন করুন')
                                : 'ছবি নির্বাচন করুন'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
