import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Head, router } from '@inertiajs/react';
import {
    Code2,
    Edit3,
    FileCode,
    Loader2,
    Plus,
    Trash2,
    X,
    CheckCircle2,
    XCircle,
    Copy,
    Info,
    Check,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Snippet {
    id: number;
    title: string;
    location: 'header' | 'body' | 'footer';
    code: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

interface Counts {
    all: number;
    active: number;
    header: number;
    body: number;
    footer: number;
}

interface Props {
    snippets: Snippet[];
    counts: Counts;
}

const PRESETS = [
    { title: 'Facebook Pixel (Meta)', location: 'header' as const },
    { title: 'Google Tag Manager (GTM - Head)', location: 'header' as const },
    { title: 'Google Tag Manager (GTM - NoScript Body)', location: 'body' as const },
    { title: 'TikTok Pixel', location: 'header' as const },
    { title: 'Google Analytics 4 (gtag.js)', location: 'header' as const },
    { title: 'Live Chat / WhatsApp Widget', location: 'footer' as const },
    { title: 'Microsoft Clarity', location: 'header' as const },
];

export default function SnippetsIndex({ snippets, counts }: Props) {
    const { t, language } = useAdminLanguage();

    const [activeTab, setActiveTab] = useState<'all' | 'header' | 'body' | 'footer'>('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const [form, setForm] = useState({
        title: '',
        location: 'header' as 'header' | 'body' | 'footer',
        code: '',
        is_active: true,
        sort_order: 0,
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const filteredSnippets = snippets.filter((s) => {
        if (activeTab === 'all') return true;
        return s.location === activeTab;
    });

    const openAddModal = (defaultLocation: 'header' | 'body' | 'footer' = 'header') => {
        setEditingSnippet(null);
        setForm({
            title: '',
            location: defaultLocation,
            code: '',
            is_active: true,
            sort_order: snippets.length,
        });
        setErrors({});
        setModalOpen(true);
    };

    const openEditModal = (snippet: Snippet) => {
        setEditingSnippet(snippet);
        setForm({
            title: snippet.title,
            location: snippet.location,
            code: snippet.code,
            is_active: snippet.is_active,
            sort_order: snippet.sort_order,
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        if (!form.title.trim()) {
            setErrors({ title: language === 'bn' ? 'টাইটেল দেওয়া আবশ্যক' : 'Title is required' });
            setSubmitting(false);
            return;
        }

        if (!form.code.trim()) {
            setErrors({ code: language === 'bn' ? 'কোড পেস্ট বা লিখুন' : 'Code content is required' });
            setSubmitting(false);
            return;
        }

        if (editingSnippet) {
            router.put(`/dashboard/snippets/${editingSnippet.id}`, form, {
                onSuccess: () => {
                    toast.success(
                        language === 'bn'
                            ? 'কোড স্নিপেট সফলভাবে আপডেট হয়েছে!'
                            : 'Code snippet updated successfully!'
                    );
                    setModalOpen(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    toast.error(language === 'bn' ? 'সমস্যা হয়েছে।' : 'Please check the form for errors.');
                },
                onFinish: () => setSubmitting(false),
            });
        } else {
            router.post('/dashboard/snippets', form, {
                onSuccess: () => {
                    toast.success(
                        language === 'bn'
                            ? 'কোড স্নিপেট সফলভাবে যোগ হয়েছে!'
                            : 'Code snippet added successfully!'
                    );
                    setModalOpen(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    toast.error(language === 'bn' ? 'সমস্যা হয়েছে।' : 'Please check the form for errors.');
                },
                onFinish: () => setSubmitting(false),
            });
        }
    };

    const handleDelete = (snippet: Snippet) => {
        if (!confirm(`${t.deleteSnippetConfirm} ("${snippet.title}")`)) return;

        router.delete(`/dashboard/snippets/${snippet.id}`, {
            onSuccess: () =>
                toast.success(
                    language === 'bn' ? 'কোড স্নিপেট মুছে ফেলা হয়েছে।' : 'Code snippet deleted successfully.'
                ),
        });
    };

    const handleToggle = (snippet: Snippet) => {
        router.patch(
            `/dashboard/snippets/${snippet.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        snippet.is_active
                            ? (language === 'bn' ? 'কোড নিষ্ক্রিয় করা হয়েছে।' : 'Snippet disabled.')
                            : (language === 'bn' ? 'কোড সক্রিয় করা হয়েছে।' : 'Snippet activated on storefront.')
                    );
                },
            }
        );
    };

    const copyCode = (snippet: Snippet) => {
        navigator.clipboard.writeText(snippet.code);
        setCopiedId(snippet.id);
        toast.success(language === 'bn' ? 'কোড কপি করা হয়েছে!' : 'Code copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getLocationBadge = (location: 'header' | 'body' | 'footer') => {
        switch (location) {
            case 'header':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/60">
                        {t.headerLocation}
                    </span>
                );
            case 'body':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200/60">
                        {t.bodyLocation}
                    </span>
                );
            case 'footer':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
                        {t.footerLocation}
                    </span>
                );
        }
    };

    return (
        <>
            <Head title={language === 'bn' ? 'কোড স্নিপেটস — Bazar Ghor Admin' : 'Code Snippets — Bazar Ghor Admin'} />

            <div className="p-6 max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Code2 className="text-[#2d6a27]" size={26} />
                                {t.snippetsManagement}
                            </h1>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 max-w-2xl">{t.snippetsNotice}</p>
                    </div>

                    <button
                        onClick={() => openAddModal(activeTab === 'all' ? 'header' : activeTab)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#2d6a27] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3d8f33] transition"
                    >
                        <Plus size={18} />
                        {t.addSnippet}
                    </button>
                </div>

                {/* Info Card */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-xs text-emerald-900 flex items-start gap-3">
                    <Info size={18} className="text-[#2d6a27] shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">
                            {language === 'bn'
                                ? 'কীভাবে কোড কাজ করে:'
                                : 'How code snippets are loaded:'}
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-emerald-800">
                            <li>
                                <strong>Header (&lt;head&gt;):</strong>{' '}
                                {language === 'bn'
                                    ? 'ফেসবুক পিক্সেল বেস কোড, গুগল ট্যাগ ম্যানেজার (GTM), মেটা ভেরিফিকেশন কোড ইত্যাদির জন্য।'
                                    : 'Ideal for Facebook Pixel base code, Google Tag Manager (GTM), Meta verification tags.'}
                            </li>
                            <li>
                                <strong>Body (&lt;body&gt;):</strong>{' '}
                                {language === 'bn'
                                    ? 'জিটিএম বা ফেসবুক পিক্সেলের <noscript> ট্র্যাকিং ট্যাগ ইত্যাদির জন্য।'
                                    : 'Ideal for GTM or Facebook Pixel <noscript> fallback tags.'}
                            </li>
                            <li>
                                <strong>Footer (&lt;/body&gt;):</strong>{' '}
                                {language === 'bn'
                                    ? 'লাইভ চ্যাট উইজেট, হোয়াটসঅ্যাপ ফ্লোটিং বাটন, অন্যান্য কনভার্সন স্ক্রিপ্টের জন্য।'
                                    : 'Ideal for live chat widgets, WhatsApp float buttons, or conversion tracking.'}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">
                            {language === 'bn' ? 'মোট কোড স্নিপেট' : 'Total Snippets'}
                        </p>
                        <div className="flex items-baseline justify-between mt-1">
                            <span className="text-2xl font-bold text-gray-800">{counts.all}</span>
                            <span className="text-xs text-green-600 font-semibold">
                                {counts.active} {language === 'bn' ? 'সক্রিয়' : 'Active'}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">{t.headerCount}</p>
                        <div className="flex items-baseline justify-between mt-1">
                            <span className="text-2xl font-bold text-blue-600">{counts.header}</span>
                            <span className="text-xs text-gray-400 font-mono">&lt;head&gt;</span>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">{t.bodyCount}</p>
                        <div className="flex items-baseline justify-between mt-1">
                            <span className="text-2xl font-bold text-purple-600">{counts.body}</span>
                            <span className="text-xs text-gray-400 font-mono">&lt;body&gt;</span>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium">{t.footerCount}</p>
                        <div className="flex items-baseline justify-between mt-1">
                            <span className="text-2xl font-bold text-amber-600">{counts.footer}</span>
                            <span className="text-xs text-gray-400 font-mono">&lt;/body&gt;</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                    {[
                        { key: 'all' as const, label: `${t.all} (${counts.all})` },
                        { key: 'header' as const, label: `${t.headerLocation} (${counts.header})` },
                        { key: 'body' as const, label: `${t.bodyLocation} (${counts.body})` },
                        { key: 'footer' as const, label: `${t.footerLocation} (${counts.footer})` },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                                activeTab === tab.key
                                    ? 'bg-[#2d6a27] text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Snippets List */}
                {filteredSnippets.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                        <FileCode className="mx-auto text-gray-300 mb-3" size={48} />
                        <h3 className="font-semibold text-gray-700 text-base">{t.noSnippetsFound}</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            {language === 'bn'
                                ? 'নতুন কোড যোগ করতে উপরের "নতুন কোড যোগ করুন" বাটনে ক্লিক করুন।'
                                : 'Click "+ Add New Snippet" to paste Facebook Pixel or Google Tag Manager.'}
                        </p>
                        <button
                            onClick={() => openAddModal(activeTab === 'all' ? 'header' : activeTab)}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#2d6a27] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3d8f33] transition"
                        >
                            <Plus size={16} />
                            {t.addSnippet}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSnippets.map((snippet) => (
                            <div
                                key={snippet.id}
                                className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                                    snippet.is_active ? 'border-gray-200' : 'border-gray-200/60 opacity-70 bg-gray-50/50'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleToggle(snippet)}
                                            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                                                snippet.is_active
                                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                            title={
                                                snippet.is_active
                                                    ? 'Click to turn OFF'
                                                    : 'Click to turn ON'
                                            }
                                        >
                                            {snippet.is_active ? (
                                                <>
                                                    <CheckCircle2 size={13} className="text-emerald-700" />
                                                    {t.active}
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={13} className="text-gray-500" />
                                                    {t.inactive}
                                                </>
                                            )}
                                        </button>

                                        <h3 className="font-bold text-gray-800 text-base">{snippet.title}</h3>

                                        {getLocationBadge(snippet.location)}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <button
                                            onClick={() => copyCode(snippet)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 transition"
                                            title="Copy Code"
                                        >
                                            {copiedId === snippet.id ? (
                                                <>
                                                    <Check size={14} className="text-green-600" />
                                                    <span className="text-green-600">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={14} />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => openEditModal(snippet)}
                                            className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition"
                                            title={t.edit}
                                        >
                                            <Edit3 size={15} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(snippet)}
                                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 transition"
                                            title={t.delete}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                {/* Code Preview */}
                                <div className="mt-3">
                                    <div className="relative rounded-xl bg-slate-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-36 shadow-inner">
                                        <pre className="whitespace-pre leading-relaxed select-all">
                                            {snippet.code}
                                        </pre>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                                        <span>
                                            {language === 'bn' ? 'আইডি:' : 'ID:'} #{snippet.id}
                                        </span>
                                        <span>
                                            {language === 'bn' ? 'তারিখ:' : 'Added:'}{' '}
                                            {new Date(snippet.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div>
                                <h2 className="font-bold text-gray-800 text-lg">
                                    {editingSnippet ? t.editSnippet : t.addSnippet}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {language === 'bn'
                                        ? 'কোডের বিবরণ দিন এবং প্লেসমেন্ট লোকেশন সিলেক্ট করুন।'
                                        : 'Specify placement location and paste your script content.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Quick Presets for New Snippet */}
                        {!editingSnippet && (
                            <div className="bg-gray-50/70 border-b border-gray-100 px-6 py-2.5">
                                <p className="text-[11px] text-gray-500 font-medium mb-1.5">
                                    {language === 'bn' ? 'কুইক টেমপ্লেট / সাজেশন:' : 'Quick Presets:'}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {PRESETS.map((p) => (
                                        <button
                                            key={p.title}
                                            type="button"
                                            onClick={() =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    title: p.title,
                                                    location: p.location,
                                                }))
                                            }
                                            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:border-[#2d6a27] hover:text-[#2d6a27] transition"
                                        >
                                            {p.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {t.snippetTitle} *
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder={
                                        language === 'bn'
                                            ? 'যেমন: Facebook Pixel Base Code'
                                            : 'e.g. Facebook Pixel Base Code, Google Tag Manager'
                                    }
                                    className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:border-[#2d6a27] focus:outline-none ${
                                        errors.title ? 'border-red-400' : 'border-gray-200'
                                    }`}
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {t.placement} *
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        {
                                            key: 'header' as const,
                                            label: t.headerLocation,
                                            desc: '<head> tag',
                                        },
                                        {
                                            key: 'body' as const,
                                            label: t.bodyLocation,
                                            desc: 'After <body>',
                                        },
                                        {
                                            key: 'footer' as const,
                                            label: t.footerLocation,
                                            desc: 'Before </body>',
                                        },
                                    ].map((loc) => (
                                        <button
                                            key={loc.key}
                                            type="button"
                                            onClick={() => setForm({ ...form, location: loc.key })}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                                                form.location === loc.key
                                                    ? 'border-[#2d6a27] bg-green-50/50 text-[#2d6a27] ring-1 ring-[#2d6a27]'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-xs font-bold">{loc.label}</span>
                                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                {loc.desc}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-semibold text-gray-700">
                                        {t.codeContent} *
                                    </label>
                                    <span className="text-[11px] text-gray-400">
                                        {language === 'bn' ? 'HTML, <script> বা <noscript>' : 'HTML, <script>, or <noscript>'}
                                    </span>
                                </div>
                                <textarea
                                    rows={8}
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                                    placeholder={t.snippetPlaceholder}
                                    className={`w-full rounded-xl border bg-slate-900 font-mono text-xs text-emerald-400 p-4 focus:border-[#2d6a27] focus:outline-none resize-y ${
                                        errors.code ? 'border-red-400' : 'border-gray-800'
                                    }`}
                                />
                                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                        className="h-4 w-4 rounded accent-[#2d6a27]"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{t.snippetActive}</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 rounded-xl bg-[#2d6a27] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#3d8f33] disabled:opacity-60 transition"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" /> {t.processing}
                                        </>
                                    ) : editingSnippet ? (
                                        t.update
                                    ) : (
                                        t.save
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
