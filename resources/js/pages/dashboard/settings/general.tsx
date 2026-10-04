import MediaPickerModal, { type MediaItem } from '@/components/dashboard/MediaPickerModal';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Head, useForm } from '@inertiajs/react';
import {
    Building2,
    Check,
    Globe,
    Image as ImageIcon,
    Save,
    Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';

interface SettingsData {
    site_title: string;
    site_tagline: string;
    site_logo: string | null;
    site_logo_url: string;
    site_favicon: string | null;
    site_favicon_url: string;
}

interface Props {
    settings: SettingsData;
}

export default function GeneralSettings({ settings }: Props) {
    const { language } = useAdminLanguage();

    const [logoPreview, setLogoPreview] = useState<string>(settings.site_logo_url);
    const [faviconPreview, setFaviconPreview] = useState<string>(settings.site_favicon_url);

    const [mediaPickerMode, setMediaPickerMode] = useState<'logo' | 'favicon' | null>(null);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<{
        site_title: string;
        site_tagline: string;
        logo: File | null;
        media_logo_path: string;
        favicon: File | null;
        media_favicon_path: string;
    }>({
        site_title: settings.site_title || 'Bazar Ghor',
        site_tagline: settings.site_tagline || '',
        logo: null,
        media_logo_path: '',
        favicon: null,
        media_favicon_path: '',
    });

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setData('media_logo_path', '');
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('favicon', file);
            setData('media_favicon_path', '');
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const handleMediaSelect = (items: MediaItem[]) => {
        const item = items[0];
        if (!item) return;

        if (mediaPickerMode === 'logo') {
            setData('media_logo_path', item.file_path);
            setData('logo', null);
            setLogoPreview(item.url);
        } else if (mediaPickerMode === 'favicon') {
            setData('media_favicon_path', item.file_path);
            setData('favicon', null);
            setFaviconPreview(item.url);
        }
        setMediaPickerMode(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/settings/general', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={language === 'en' ? 'Site Settings — Bazar Ghor' : 'ওয়েবসাইট সেটিংস — বাজার ঘর'} />

            <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {language === 'en' ? 'General Site Settings' : 'ওয়েবসাইট সাধারণ সেটিংস'}
                        </h1>
                        <p className="text-gray-500 text-xs mt-1">
                            {language === 'en'
                                ? 'Manage website title, brand logo, favicon icon, and financial marketing budget'
                                : 'ওয়েবসাইটের নাম, ব্র্যন্ড লোগো, ফেভিকন এবং সামগ্রিক মার্কেটিং ব্যয়ের সেটিংস'}
                        </p>
                    </div>

                    {recentlySuccessful && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 animate-in fade-in">
                            <Check size={14} />
                            {language === 'en' ? 'Saved successfully' : 'সফলভাবে সংরক্ষিত হয়েছে'}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info Section */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs space-y-5">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <Building2 className="text-[#2d6a27]" size={20} />
                            <h2 className="font-bold text-gray-900 text-base">
                                {language === 'en' ? 'Brand & Identity' : 'ব্র্যান্ড ও পরিচিতি'}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    {language === 'en' ? 'Site Title / Brand Name' : 'ওয়েবসাইট টাইটেল / ব্র্যান্ড নাম'} *
                                </label>
                                <input
                                    type="text"
                                    value={data.site_title}
                                    onChange={(e) => setData('site_title', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#2d6a27] focus:ring-2 focus:ring-[#2d6a27]/20 focus:outline-none transition shadow-2xs"
                                    placeholder="Bazar Ghor"
                                    required
                                />
                                {errors.site_title && (
                                    <p className="text-xs text-red-500 mt-1">{errors.site_title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    {language === 'en' ? 'Site Tagline / Slogan' : 'ট্যাগলাইন বা স্লোগান'}
                                </label>
                                <input
                                    type="text"
                                    value={data.site_tagline}
                                    onChange={(e) => setData('site_tagline', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#2d6a27] focus:ring-2 focus:ring-[#2d6a27]/20 focus:outline-none transition shadow-2xs"
                                    placeholder="স্মার্ট গ্যাজেট শপ"
                                />
                                {errors.site_tagline && (
                                    <p className="text-xs text-red-500 mt-1">{errors.site_tagline}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Logo & Favicon Section */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs space-y-6">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                            <ImageIcon className="text-[#2d6a27]" size={20} />
                            <h2 className="font-bold text-gray-900 text-base">
                                {language === 'en' ? 'Store Logo & Favicon' : 'স্টোর লোগো ও ফেভিকন'}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Logo */}
                            <div className="space-y-3 p-4 rounded-xl bg-gray-50/60 border border-gray-100">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {language === 'en' ? 'Store Logo' : 'স্টোর লোগো'}
                                    </h3>
                                    <p className="text-[11px] text-gray-500">
                                        {language === 'en' ? 'Shown in navbar and footer. PNG or SVG recommended.' : 'ওয়েবসাইটের হেডার ও ফুটারে প্রদর্শিত হবে।'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-xl border border-gray-200 bg-white p-2 flex items-center justify-center overflow-hidden shadow-2xs">
                                        <img
                                            src={logoPreview}
                                            alt="Logo Preview"
                                            className="h-full w-full object-contain"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = '/images/logo.png';
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                ref={logoInputRef}
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleLogoFileChange}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => logoInputRef.current?.click()}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition shadow-2xs"
                                            >
                                                <Upload size={13} />
                                                {language === 'en' ? 'Upload New' : 'নতুন আপলোড'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMediaPickerMode('logo')}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d6a27]/10 text-[#2d6a27] hover:bg-[#2d6a27]/20 text-xs font-semibold transition"
                                            >
                                                <ImageIcon size={13} />
                                                {language === 'en' ? 'Media Library' : 'মিডিয়া গ্যালারি'}
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-gray-400">Max size: 5MB</span>
                                    </div>
                                </div>
                                {errors.logo && <p className="text-xs text-red-500">{errors.logo}</p>}
                            </div>

                            {/* Favicon */}
                            <div className="space-y-3 p-4 rounded-xl bg-gray-50/60 border border-gray-100">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {language === 'en' ? 'Browser Favicon' : 'ব্রাউজার ফেভিকন'}
                                    </h3>
                                    <p className="text-[11px] text-gray-500">
                                        {language === 'en' ? 'Tab icon. 32x32 or 64x64 square image recommended.' : 'ব্রাউজারের ট্যাবে প্রদর্শিত আইকন (বর্গাকার PNG বা ICO)।'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-xl border border-gray-200 bg-white p-3 flex items-center justify-center overflow-hidden shadow-2xs">
                                        <img
                                            src={faviconPreview}
                                            alt="Favicon Preview"
                                            className="h-10 w-10 object-contain"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = '/favicon.ico';
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                ref={faviconInputRef}
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFaviconFileChange}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => faviconInputRef.current?.click()}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition shadow-2xs"
                                            >
                                                <Upload size={13} />
                                                {language === 'en' ? 'Upload New' : 'নতুন আপলোড'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMediaPickerMode('favicon')}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d6a27]/10 text-[#2d6a27] hover:bg-[#2d6a27]/20 text-xs font-semibold transition"
                                            >
                                                <ImageIcon size={13} />
                                                {language === 'en' ? 'Media Library' : 'মিডিয়া গ্যালারি'}
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-gray-400">Max size: 2MB</span>
                                    </div>
                                </div>
                                {errors.favicon && <p className="text-xs text-red-500">{errors.favicon}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a27] px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#23531e] active:scale-95 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {processing
                                ? (language === 'en' ? 'Saving...' : 'সংরক্ষণ করা হচ্ছে...')
                                : (language === 'en' ? 'Save Settings' : 'সেটিংস সংরক্ষণ করুন')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Media Picker Modal */}
            {mediaPickerMode && (
                <MediaPickerModal
                    isOpen={true}
                    onClose={() => setMediaPickerMode(null)}
                    onSelect={handleMediaSelect}
                    title={
                        mediaPickerMode === 'logo'
                            ? (language === 'en' ? 'Select Logo from Media Library' : 'মিডিয়া গ্যালারি থেকে লোগো নির্বাচন')
                            : (language === 'en' ? 'Select Favicon from Media Library' : 'মিডিয়া গ্যালারি থেকে ফেভিকন নির্বাচন')
                    }
                />
            )}
        </>
    );
}
