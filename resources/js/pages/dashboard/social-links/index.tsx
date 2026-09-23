import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Head, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    Check,
    CheckCircle2,
    Edit3,
    ExternalLink,
    Globe,
    Info,
    Loader2,
    Plus,
    Share2,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import SocialIcon from '@/components/store/SocialIcon';

interface SocialLink {
    id: number;
    platform: string;
    title: string;
    url: string;
    icon?: string | null;
    color?: string | null;
    is_active: boolean;
    show_in_header: boolean;
    show_in_footer: boolean;
    sort_order: number;
    created_at?: string;
}

interface Stats {
    total: number;
    active: number;
    header: number;
    footer: number;
}

interface Props {
    links: SocialLink[];
    stats: Stats;
}

const PLATFORM_PRESETS = [
    {
        platform: 'facebook',
        label: 'Facebook',
        defaultTitle: 'Facebook Page',
        placeholder: 'https://www.facebook.com/yourpage',
        color: '#1877F2',
        icon: 'facebook',
    },
    {
        platform: 'instagram',
        label: 'Instagram',
        defaultTitle: 'Instagram Profile',
        placeholder: 'https://www.instagram.com/yourusername',
        color: '#E4405F',
        icon: 'instagram',
    },
    {
        platform: 'youtube',
        label: 'YouTube',
        defaultTitle: 'YouTube Channel',
        placeholder: 'https://www.youtube.com/@yourchannel',
        color: '#FF0000',
        icon: 'youtube',
    },
    {
        platform: 'tiktok',
        label: 'TikTok',
        defaultTitle: 'TikTok Profile',
        placeholder: 'https://www.tiktok.com/@yourusername',
        color: '#000000',
        icon: 'tiktok',
    },
    {
        platform: 'whatsapp',
        label: 'WhatsApp',
        defaultTitle: 'WhatsApp Support',
        placeholder: 'https://wa.me/8801XXXXXXXXX',
        color: '#25D366',
        icon: 'whatsapp',
    },
    {
        platform: 'twitter',
        label: 'X (Twitter)',
        defaultTitle: 'X Profile',
        placeholder: 'https://x.com/yourusername',
        color: '#000000',
        icon: 'twitter',
    },
    {
        platform: 'linkedin',
        label: 'LinkedIn',
        defaultTitle: 'LinkedIn Company',
        placeholder: 'https://www.linkedin.com/company/yourpage',
        color: '#0A66C2',
        icon: 'linkedin',
    },
    {
        platform: 'telegram',
        label: 'Telegram',
        defaultTitle: 'Telegram Channel',
        placeholder: 'https://t.me/yourchannel',
        color: '#24A1DE',
        icon: 'telegram',
    },
    {
        platform: 'custom',
        label: 'Custom / Other',
        defaultTitle: 'Website',
        placeholder: 'https://example.com',
        color: '#2d6a27',
        icon: 'globe',
    },
];

export default function SocialLinksIndex({ links, stats }: Props) {
    const { t, language } = useAdminLanguage();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<SocialLink | null>(null);

    // Form state
    const [platform, setPlatform] = useState('facebook');
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [icon, setIcon] = useState('facebook');
    const [color, setColor] = useState('#1877F2');
    const [isActive, setIsActive] = useState(true);
    const [showInHeader, setShowInHeader] = useState(true);
    const [showInFooter, setShowInFooter] = useState(true);
    const [sortOrder, setSortOrder] = useState('0');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const openCreateModal = (preset?: (typeof PLATFORM_PRESETS)[0]) => {
        setEditingLink(null);
        setErrors({});

        if (preset) {
            setPlatform(preset.platform);
            setTitle(preset.defaultTitle);
            setUrl('');
            setIcon(preset.icon);
            setColor(preset.color);
        } else {
            setPlatform('facebook');
            setTitle('Facebook Page');
            setUrl('');
            setIcon('facebook');
            setColor('#1877F2');
        }

        setIsActive(true);
        setShowInHeader(true);
        setShowInFooter(true);
        setSortOrder(String(links.length + 1));
        setModalOpen(true);
    };

    const openEditModal = (link: SocialLink) => {
        setEditingLink(link);
        setErrors({});
        setPlatform(link.platform);
        setTitle(link.title);
        setUrl(link.url);
        setIcon(link.icon || link.platform);
        setColor(link.color || '#2d6a27');
        setIsActive(link.is_active);
        setShowInHeader(link.show_in_header);
        setShowInFooter(link.show_in_footer);
        setSortOrder(String(link.sort_order));
        setModalOpen(true);
    };

    const handlePlatformChange = (p: string) => {
        setPlatform(p);
        const preset = PLATFORM_PRESETS.find((item) => item.platform === p);
        if (preset) {
            setIcon(preset.icon);
            setColor(preset.color);
            if (!editingLink) {
                setTitle(preset.defaultTitle);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const payload = {
            platform,
            title,
            url,
            icon,
            color,
            is_active: isActive,
            show_in_header: showInHeader,
            show_in_footer: showInFooter,
            sort_order: parseInt(sortOrder) || 0,
        };

        if (editingLink) {
            router.put(`/dashboard/social-links/${editingLink.id}`, payload, {
                onSuccess: () => {
                    setModalOpen(false);
                    toast.success(
                        language === 'bn'
                            ? 'সোশ্যাল মিডিয়া লিংক সফলভাবে আপডেট করা হয়েছে।'
                            : 'Social media link updated successfully.'
                    );
                },
                onError: (errs) => {
                    setErrors(errs);
                    toast.error(language === 'bn' ? 'ফরমটি সঠিকভাবে পূরণ করুন।' : 'Please check the form for errors.');
                },
                onFinish: () => setSubmitting(false),
            });
        } else {
            router.post('/dashboard/social-links', payload, {
                onSuccess: () => {
                    setModalOpen(false);
                    toast.success(
                        language === 'bn'
                            ? 'নতুন সোশ্যাল লিংক সফলভাবে যোগ করা হয়েছে।'
                            : 'Social media link added successfully.'
                    );
                },
                onError: (errs) => {
                    setErrors(errs);
                    toast.error(language === 'bn' ? 'ফরমটি সঠিকভাবে পূরণ করুন।' : 'Please check the form for errors.');
                },
                onFinish: () => setSubmitting(false),
            });
        }
    };

    const handleDelete = (link: SocialLink) => {
        if (!confirm(`${t.deleteSocialLinkConfirm} ("${link.title}")?`)) return;

        router.delete(`/dashboard/social-links/${link.id}`, {
            onSuccess: () =>
                toast.success(
                    language === 'bn' ? 'সোশ্যাল লিংকটি মুছে ফেলা হয়েছে।' : 'Social link deleted successfully.'
                ),
        });
    };

    const handleToggle = (link: SocialLink, field: 'is_active' | 'show_in_header' | 'show_in_footer') => {
        router.patch(
            `/dashboard/social-links/${link.id}/toggle`,
            { field },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(language === 'bn' ? 'স্ট্যাটাস আপডেট হয়েছে।' : 'Status updated successfully.');
                },
            }
        );
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= links.length) return;

        const newLinks = [...links];
        const temp = newLinks[index];
        newLinks[index] = newLinks[targetIndex];
        newLinks[targetIndex] = temp;

        const orders = newLinks.map((item, idx) => ({
            id: item.id,
            sort_order: idx + 1,
        }));

        router.post(
            '/dashboard/social-links/reorder',
            { orders },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(language === 'bn' ? 'ক্রম পরিবর্তন করা হয়েছে।' : 'Order updated.');
                },
            }
        );
    };

    return (
        <>
            <Head title={language === 'bn' ? 'সোশ্যাল মিডিয়া — Bazar Ghor Admin' : 'Social Links — Bazar Ghor Admin'} />

            <div className="p-6 max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-[#2d6a27] shadow-xs">
                                <Share2 size={22} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                    {t.socialMediaManagement}
                                </h1>
                                <p className="text-sm text-gray-500">{t.socialMediaNotice}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => openCreateModal()}
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d6a27] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#23531f] hover:shadow-md active:scale-98 shrink-0"
                    >
                        <Plus size={16} />
                        <span>{t.addSocialLink}</span>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {language === 'bn' ? 'মোট লিংক' : 'Total Links'}
                        </span>
                        <p className="mt-1 text-2xl font-extrabold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
                        <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                            {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </span>
                        <p className="mt-1 text-2xl font-extrabold text-emerald-700">{stats.active}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                            {language === 'bn' ? 'হেডারে প্রদর্শিত' : 'In Header'}
                        </span>
                        <p className="mt-1 text-2xl font-extrabold text-blue-700">{stats.header}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
                        <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">
                            {language === 'bn' ? 'ফুটারে প্রদর্শিত' : 'In Footer'}
                        </span>
                        <p className="mt-1 text-2xl font-extrabold text-purple-700">{stats.footer}</p>
                    </div>
                </div>

                {/* Quick Add Presets */}
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                        <Info size={16} className="text-[#2d6a27]" />
                        <h2 className="text-sm font-semibold text-gray-800">
                            {language === 'bn' ? 'জনপ্রিয় প্ল্যাটফর্ম কুইক-অ্যাড' : 'Quick Add Popular Platforms'}
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {PLATFORM_PRESETS.map((preset) => (
                            <button
                                key={preset.platform}
                                onClick={() => openCreateModal(preset)}
                                type="button"
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-emerald-50 hover:border-emerald-300 hover:text-[#2d6a27]"
                            >
                                <SocialIcon platform={preset.platform} icon={preset.icon} size={14} />
                                <span>{preset.label}</span>
                                <Plus size={12} className="opacity-50" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Live Preview Bar */}
                <div className="rounded-2xl border border-green-200/80 bg-emerald-50/40 p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1f4e1b] uppercase tracking-wider">
                            {language === 'bn' ? 'লাইভ প্রিভিউ (ওয়েবসাইটে যেমন দেখাবে)' : 'Live Storefront Preview'}
                        </span>
                        <span className="text-xs text-emerald-700">
                            {language === 'bn' ? 'অ্যাক্টিভ লিংকগুলো সরাসরি সিঙ্ক হয়' : 'Auto-synced from active items'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Header Bar Preview */}
                        <div className="rounded-xl bg-[#1f4e1b] p-3 text-white">
                            <span className="text-[10px] text-green-300 font-semibold uppercase tracking-wider block mb-1.5">
                                Header Top Bar (Desktop)
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-green-200">01613-545166</span>
                                <span className="text-green-500">|</span>
                                <span className="text-xs text-yellow-300 font-medium">My Account</span>
                                <span className="text-green-600">|</span>
                                <div className="flex items-center gap-1.5">
                                    {links.filter((l) => l.is_active && l.show_in_header).length > 0 ? (
                                        links
                                            .filter((l) => l.is_active && l.show_in_header)
                                            .map((l) => (
                                                <div
                                                    key={l.id}
                                                    className="flex h-5 w-5 items-center justify-center rounded-full bg-green-900/80 text-green-200 shadow-xs"
                                                    title={l.title}
                                                >
                                                    <SocialIcon platform={l.platform} icon={l.icon} size={11} />
                                                </div>
                                            ))
                                    ) : (
                                        <span className="text-[11px] text-green-400 italic">
                                            {language === 'bn' ? 'কোনো লিংক সক্রিয় নেই' : 'No header links active'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Bar Preview */}
                        <div className="rounded-xl bg-[#143312] p-3 text-white">
                            <span className="text-[10px] text-green-300 font-semibold uppercase tracking-wider block mb-1.5">
                                Footer Brand Block
                            </span>
                            <div className="flex items-center gap-2">
                                {links.filter((l) => l.is_active && l.show_in_footer).length > 0 ? (
                                    links
                                        .filter((l) => l.is_active && l.show_in_footer)
                                        .map((l) => (
                                            <div
                                                key={l.id}
                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2d6a27] text-white shadow-xs"
                                                title={l.title}
                                            >
                                                <SocialIcon platform={l.platform} icon={l.icon} size={15} />
                                            </div>
                                        ))
                                ) : (
                                    <span className="text-[11px] text-green-400 italic">
                                        {language === 'bn' ? 'কোনো লিংক সক্রিয় নেই' : 'No footer links active'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Links Table / Cards */}
                <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-900">
                            {language === 'bn' ? 'সোশ্যাল লিংক তালিকা' : 'Configured Social Links'} ({links.length})
                        </h2>
                    </div>

                    {links.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                <Share2 size={24} />
                            </div>
                            <h3 className="mt-3 text-sm font-semibold text-gray-900">
                                {language === 'bn' ? 'কোনো সোশ্যাল লিংক পাওয়া যায়নি' : 'No social links configured yet'}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                                {language === 'bn'
                                    ? 'উপরের কুইক-অ্যাড বাটন বা "Add Social Link" এ ক্লিক করে লিংক যুক্ত করুন।'
                                    : 'Click quick-add presets above or "Add Social Link" to add your first profile.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-12 text-center">
                                            {language === 'bn' ? 'ক্রম' : 'Order'}
                                        </th>
                                        <th className="py-3 px-4">{t.platform}</th>
                                        <th className="py-3 px-4">{t.linkTitle}</th>
                                        <th className="py-3 px-4">{t.targetUrl}</th>
                                        <th className="py-3 px-4 text-center">{t.showInHeader}</th>
                                        <th className="py-3 px-4 text-center">{t.showInFooter}</th>
                                        <th className="py-3 px-4 text-center">{t.status}</th>
                                        <th className="py-3 px-4 text-right">{t.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {links.map((link, index) => (
                                        <tr key={link.id} className="hover:bg-gray-50/60 transition-colors">
                                            {/* Reorder Buttons */}
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-0.5">
                                                    <button
                                                        onClick={() => handleMove(index, 'up')}
                                                        disabled={index === 0}
                                                        type="button"
                                                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title="Move Up"
                                                    >
                                                        <ArrowUp size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleMove(index, 'down')}
                                                        disabled={index === links.length - 1}
                                                        type="button"
                                                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title="Move Down"
                                                    >
                                                        <ArrowDown size={14} />
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Platform & Icon */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-xs"
                                                        style={{ backgroundColor: link.color || '#2d6a27' }}
                                                    >
                                                        <SocialIcon platform={link.platform} icon={link.icon} size={16} />
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-900 capitalize block text-xs sm:text-sm">
                                                            {link.platform}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400 font-mono">
                                                            #{link.sort_order}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Title */}
                                            <td className="py-3.5 px-4 font-medium text-gray-900">
                                                {link.title}
                                            </td>

                                            {/* URL */}
                                            <td className="py-3.5 px-4">
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline max-w-[220px] truncate"
                                                    title={link.url}
                                                >
                                                    <span className="truncate">{link.url}</span>
                                                    <ExternalLink size={12} className="shrink-0 opacity-70" />
                                                </a>
                                            </td>

                                            {/* Header Toggle */}
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggle(link, 'show_in_header')}
                                                    type="button"
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition ${
                                                        link.show_in_header
                                                            ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                            : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {link.show_in_header ? (
                                                        <Check size={11} className="stroke-[3]" />
                                                    ) : (
                                                        <X size={11} />
                                                    )}
                                                    <span>{link.show_in_header ? 'Header' : 'Hidden'}</span>
                                                </button>
                                            </td>

                                            {/* Footer Toggle */}
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggle(link, 'show_in_footer')}
                                                    type="button"
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition ${
                                                        link.show_in_footer
                                                            ? 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                                                            : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {link.show_in_footer ? (
                                                        <Check size={11} className="stroke-[3]" />
                                                    ) : (
                                                        <X size={11} />
                                                    )}
                                                    <span>{link.show_in_footer ? 'Footer' : 'Hidden'}</span>
                                                </button>
                                            </td>

                                            {/* Active Toggle */}
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggle(link, 'is_active')}
                                                    type="button"
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition ${
                                                        link.is_active
                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {link.is_active ? (
                                                        <CheckCircle2 size={12} />
                                                    ) : (
                                                        <XCircle size={12} />
                                                    )}
                                                    <span>{link.is_active ? t.active : t.inactive}</span>
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(link)}
                                                        type="button"
                                                        className="p-1.5 text-gray-500 hover:text-[#2d6a27] hover:bg-emerald-50 rounded-lg transition"
                                                        title={t.edit}
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(link)}
                                                        type="button"
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title={t.delete}
                                                    >
                                                        <Trash2 size={15} />
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

            {/* Create / Edit Modal Dialog */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-xs"
                                    style={{ backgroundColor: color }}
                                >
                                    <SocialIcon platform={platform} icon={icon} size={18} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {editingLink ? t.editSocialLink : t.addSocialLink}
                                </h3>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                type="button"
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            {/* Platform Select */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    {t.platform} *
                                </label>
                                <select
                                    value={platform}
                                    onChange={(e) => handlePlatformChange(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#2d6a27] focus:outline-none focus:ring-1 focus:ring-[#2d6a27]"
                                >
                                    {PLATFORM_PRESETS.map((p) => (
                                        <option key={p.platform} value={p.platform}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Title / Label */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    {t.linkTitle} *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Facebook Page, Instagram Support"
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#2d6a27] focus:outline-none focus:ring-1 focus:ring-[#2d6a27]"
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                            </div>

                            {/* Target URL */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    {t.targetUrl} *
                                </label>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder={
                                        PLATFORM_PRESETS.find((p) => p.platform === platform)?.placeholder ||
                                        'https://...'
                                    }
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#2d6a27] focus:outline-none focus:ring-1 focus:ring-[#2d6a27]"
                                />
                                {errors.url && <p className="mt-1 text-xs text-red-600">{errors.url}</p>}
                            </div>

                            {/* Color & Sort Order */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        {language === 'bn' ? 'ব্র্যান্ড কালার' : 'Brand Accent Color'}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="h-10 w-12 rounded-xl border border-gray-200 cursor-pointer p-1"
                                        />
                                        <input
                                            type="text"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        {language === 'bn' ? 'ক্রম (Sort Order)' : 'Sort Order'}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#2d6a27] focus:outline-none focus:ring-1 focus:ring-[#2d6a27]"
                                    />
                                </div>
                            </div>

                            {/* Placement & Status Toggles */}
                            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-2.5">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-medium text-gray-700">
                                        {t.showInHeader} (Top Bar Desktop)
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={showInHeader}
                                        onChange={(e) => setShowInHeader(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-[#2d6a27] focus:ring-[#2d6a27]"
                                    />
                                </label>

                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-medium text-gray-700">
                                        {t.showInFooter} (Footer Brand Area)
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={showInFooter}
                                        onChange={(e) => setShowInFooter(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-[#2d6a27] focus:ring-[#2d6a27]"
                                    />
                                </label>

                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-medium text-gray-700">
                                        {language === 'bn' ? 'ওয়েবসাইটে সক্রিয় রাখুন' : 'Is Active'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-[#2d6a27] focus:ring-[#2d6a27]"
                                    />
                                </label>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    type="button"
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2d6a27] px-5 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-[#23531f] disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" /> {t.processing}
                                        </>
                                    ) : editingLink ? (
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
