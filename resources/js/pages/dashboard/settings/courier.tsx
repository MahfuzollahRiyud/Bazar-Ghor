import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Check,
    Save,
    Truck,
    ExternalLink,
    Info,
    Eye,
    EyeOff,
    PackageCheck,
    Navigation,
    ShieldCheck,
    Copy,
} from 'lucide-react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface CourierConfig {
    steadfast: {
        enabled: boolean;
        api_key: string;
        secret_key: string;
        base_url: string;
        delivery_note: string;
    };
    pathao: {
        enabled: boolean;
        client_id: string;
        client_secret: string;
        username: string;
        password: string;
        store_id: string;
        base_url: string;
        mode: 'sandbox' | 'live';
    };
}

interface Props {
    couriers: CourierConfig;
}

export default function CourierSettings({ couriers }: Props) {
    const { language } = useAdminLanguage();

    const [showSteadfastSecret, setShowSteadfastSecret] = useState(false);
    const [showPathaoSecret, setShowPathaoSecret] = useState(false);
    const [showPathaoPassword, setShowPathaoPassword] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState(false);

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        steadfast: couriers.steadfast,
        pathao: couriers.pathao,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/settings/courier', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={language === 'en' ? 'Courier Services — Bazar Ghor' : 'কুরিয়ার সার্ভিস সেটিংস — বাজার ঘর'} />

            <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {language === 'en' ? 'Courier & Shipping Services' : 'কুরিয়ার ও শিপিং সার্ভিস ব্যবস্থাপনা'}
                        </h1>
                        <p className="text-gray-500 text-xs mt-1">
                            {language === 'en'
                                ? 'Configure automated parcel booking with SteadFast and Pathao Courier APIs'
                                : 'স্টেডফাস্ট ও পাঠাও কুরিয়ার সার্ভিসের API ক্রেডেনশিয়ালস ও কনফিগারেশন সেটআপ করুন'}
                        </p>
                    </div>

                    {recentlySuccessful && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 animate-in fade-in">
                            <Check size={14} />
                            {language === 'en' ? 'Settings saved successfully' : 'কুরিয়ার সেটিংস সংরক্ষিত হয়েছে'}
                        </div>
                    )}
                </div>

                {/* Navigation Tabs (General vs Payment vs Courier) */}
                <div className="flex items-center gap-2 border-b border-gray-200 pb-px">
                    <Link
                        href="/dashboard/settings/general"
                        className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent transition"
                    >
                        {language === 'en' ? 'General Settings' : 'সাধারণ সেটিংস'}
                    </Link>
                    <Link
                        href="/dashboard/settings/payment"
                        className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent transition"
                    >
                        {language === 'en' ? 'Payment Gateways' : 'পেমেন্ট গেটওয়ে'}
                    </Link>
                    <Link
                        href="/dashboard/settings/courier"
                        className="px-4 py-2.5 text-xs font-bold text-[#2d6a27] border-b-2 border-[#2d6a27] transition"
                    >
                        {language === 'en' ? 'Courier Services' : 'কুরিয়ার সার্ভিস'}
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. SteadFast Courier */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-black text-sm border border-orange-100">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-bold text-gray-900 text-base">
                                            SteadFast Courier (স্টেডফাস্ট)
                                        </h2>
                                        <span className="text-[10px] bg-orange-100 text-orange-800 font-semibold px-2 py-0.5 rounded-full">
                                            BD Wide
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500">
                                        {language === 'en'
                                            ? 'Fastest delivery with real-time consignment creation and tracking'
                                            : 'সারা দেশে দ্রুততম ডেলিভারি ও রিয়েল-টাইম কনসাইনমেন্ট পার্সেল ট্র্যাকিং'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.steadfast.enabled}
                                    onChange={(e) =>
                                        setData('steadfast', {
                                            ...data.steadfast,
                                            enabled: e.target.checked,
                                        })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d6a27]"></div>
                            </label>
                        </div>

                        {data.steadfast.enabled && (
                            <div className="space-y-4 pt-1 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            API Key
                                        </label>
                                        <input
                                            type="text"
                                            value={data.steadfast.api_key}
                                            onChange={(e) =>
                                                setData('steadfast', {
                                                    ...data.steadfast,
                                                    api_key: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-[#2d6a27] focus:outline-none font-mono"
                                            placeholder="Steadfast API Key..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Secret Key
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showSteadfastSecret ? 'text' : 'password'}
                                                value={data.steadfast.secret_key}
                                                onChange={(e) =>
                                                    setData('steadfast', {
                                                        ...data.steadfast,
                                                        secret_key: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-[#2d6a27] focus:outline-none font-mono pr-9"
                                                placeholder="Steadfast Secret Key..."
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowSteadfastSecret(!showSteadfastSecret)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showSteadfastSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            API Base URL
                                        </label>
                                        <input
                                            type="text"
                                            value={data.steadfast.base_url}
                                            onChange={(e) =>
                                                setData('steadfast', {
                                                    ...data.steadfast,
                                                    base_url: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-[#2d6a27] focus:outline-none font-mono text-gray-600"
                                            placeholder="https://portal.packzy.com/api/v1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            {language === 'en' ? 'Default Delivery Note' : 'ডিফল্ট ডেলিভারি নোট'}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.steadfast.delivery_note}
                                            onChange={(e) =>
                                                setData('steadfast', {
                                                    ...data.steadfast,
                                                    delivery_note: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-[#2d6a27] focus:outline-none"
                                            placeholder="যেমন: Handle with care, fragile"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-xl bg-orange-50/60 p-3 border border-orange-100 flex items-start gap-2.5 text-xs text-orange-800">
                                    <Info size={16} className="shrink-0 mt-0.5 text-orange-600" />
                                    <div>
                                        {language === 'en'
                                            ? 'Find your Steadfast API Key & Secret Key in your Steadfast Merchant Portal > Settings > API.'
                                            : 'স্টেডফাস্ট মার্চেন্ট পোর্টালে (portal.packzy.com) লগইন করে Settings > API সেকশন থেকে আপনার API Key ও Secret Key সংগ্রহ করুন।'}
                                    </div>
                                </div>

                                {/* Steadfast Webhook URL */}
                                <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50/40 p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            {language === 'en' ? 'SteadFast Webhook URL' : 'স্টেডফাস্ট ওয়েবহুক (Webhook) URL'}
                                        </label>
                                        <span className="text-[10px] text-gray-500 font-medium">
                                            Auto Parcel Sync
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-600 leading-relaxed">
                                        {language === 'en'
                                            ? 'Paste this URL into SteadFast Merchant Portal > Settings > Webhook to automatically receive live parcel updates (Delivered, Return, Cancelled).'
                                            : 'স্টেডফাস্ট মার্চেন্ট পোর্টালে (Settings > Webhook) নিচের URL-টি পেস্ট করুন। এর ফলে পার্সেল ডেলিভারি, ক্যানসেল বা রিটার্ন হলে আপনার ড্যাশবোর্ডে স্বয়ংক্রিয়ভাবে স্ট্যাটাস আপডেট হবে।'}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/steadfast` : 'https://bazarghor.com/api/webhooks/steadfast'}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-mono text-gray-800 select-all cursor-text"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const url = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/steadfast` : 'https://bazarghor.com/api/webhooks/steadfast';
                                                navigator.clipboard.writeText(url);
                                                setCopiedWebhook(true);
                                                setTimeout(() => setCopiedWebhook(false), 2000);
                                            }}
                                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition cursor-pointer"
                                        >
                                            {copiedWebhook ? (
                                                <>
                                                    <Check size={13} />
                                                    {language === 'en' ? 'Copied' : 'কপি হয়েছে'}
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={13} />
                                                    {language === 'en' ? 'Copy URL' : 'কপি করুন'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. Pathao Courier */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-black text-sm border border-red-100">
                                    <Navigation size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-bold text-gray-900 text-base">
                                            Pathao Courier (পাঠাও)
                                        </h2>
                                        <span className="text-[10px] bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded-full">
                                            Nationwide
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500">
                                        {language === 'en'
                                            ? 'Nationwide on-demand parcel dispatch via Pathao Hermes API'
                                            : 'পাঠাও হার্মিস এপিআই এর মাধ্যমে দেশব্যাপী পার্সেল বুকিং ও ডেলিভারি'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.pathao.enabled}
                                    onChange={(e) =>
                                        setData('pathao', {
                                            ...data.pathao,
                                            enabled: e.target.checked,
                                        })
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d6a27]"></div>
                            </label>
                        </div>

                        {data.pathao.enabled && (
                            <div className="space-y-4 pt-1 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Environment / Mode
                                        </label>
                                        <select
                                            value={data.pathao.mode}
                                            onChange={(e) =>
                                                setData('pathao', {
                                                    ...data.pathao,
                                                    mode: e.target.value as 'sandbox' | 'live',
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-[#2d6a27] focus:outline-none bg-white font-medium"
                                        >
                                            <option value="sandbox">Sandbox (Testing / স্যান্ডবক্স)</option>
                                            <option value="live">Live (Production / লাইভ)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Client ID
                                        </label>
                                        <input
                                            type="text"
                                            value={data.pathao.client_id}
                                            onChange={(e) =>
                                                setData('pathao', {
                                                    ...data.pathao,
                                                    client_id: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-[#2d6a27] focus:outline-none font-mono"
                                            placeholder="Pathao Client ID..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Client Secret
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPathaoSecret ? 'text' : 'password'}
                                                value={data.pathao.client_secret}
                                                onChange={(e) =>
                                                    setData('pathao', {
                                                        ...data.pathao,
                                                        client_secret: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-[#2d6a27] focus:outline-none font-mono pr-9"
                                                placeholder="Pathao Client Secret..."
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPathaoSecret(!showPathaoSecret)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPathaoSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Merchant Username / Email
                                        </label>
                                        <input
                                            type="text"
                                            value={data.pathao.username}
                                            onChange={(e) =>
                                                setData('pathao', {
                                                    ...data.pathao,
                                                    username: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-[#2d6a27] focus:outline-none"
                                            placeholder="merchant@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Merchant Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPathaoPassword ? 'text' : 'password'}
                                                value={data.pathao.password}
                                                onChange={(e) =>
                                                    setData('pathao', {
                                                        ...data.pathao,
                                                        password: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-[#2d6a27] focus:outline-none pr-9"
                                                placeholder="Merchant account password..."
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPathaoPassword(!showPathaoPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPathaoPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Store ID (Store / Hub ID)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.pathao.store_id}
                                            onChange={(e) =>
                                                setData('pathao', {
                                                    ...data.pathao,
                                                    store_id: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:border-[#2d6a27] focus:outline-none font-mono"
                                            placeholder="যেমন: 12345"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-xl bg-red-50/60 p-3 border border-red-100 flex items-start gap-2.5 text-xs text-red-800">
                                    <Info size={16} className="shrink-0 mt-0.5 text-red-600" />
                                    <div>
                                        {language === 'en'
                                            ? 'Pathao API requires Client ID, Client Secret, your registered Pathao Merchant credentials, and your primary Store ID from merchant.pathao.com.'
                                            : 'পাঠাও মার্চেন্ট পোর্টাল (merchant.pathao.com) থেকে Developer API ক্রেডেনশিয়ালস (Client ID, Secret) এবং আপনার শপের Store ID সংগ্রহ করে এখানে দিন।'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 rounded-xl bg-[#2d6a27] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#23531f] disabled:opacity-50 transition cursor-pointer"
                        >
                            <Save size={16} />
                            {processing
                                ? (language === 'en' ? 'Saving...' : 'সংরক্ষণ হচ্ছে...')
                                : (language === 'en' ? 'Save Courier Settings' : 'কুরিয়ার সেটিংস সংরক্ষণ করুন')}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
