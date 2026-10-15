import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Activity,
    Check,
    CheckCircle2,
    Copy,
    ExternalLink,
    Eye,
    EyeOff,
    HelpCircle,
    Info,
    Layers,
    Loader2,
    Save,
    Send,
    Server,
    ShieldCheck,
    Sparkles,
    XCircle,
    Zap,
} from 'lucide-react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { toast } from 'sonner';

interface SettingsData {
    meta_pixel_id: string;
    meta_pixel_enabled: boolean;
    meta_capi_token: string;
    meta_capi_enabled: boolean;
    meta_test_event_code: string;
}

interface Props {
    settings: SettingsData;
}

export default function MetaPixelSettings({ settings }: Props) {
    const { language } = useAdminLanguage();

    const [showToken, setShowToken] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    const { data, setData, post, processing, recentlySuccessful, errors } = useForm<{
        meta_pixel_id: string;
        meta_pixel_enabled: boolean;
        meta_capi_token: string;
        meta_capi_enabled: boolean;
        meta_test_event_code: string;
    }>({
        meta_pixel_id: settings.meta_pixel_id || '',
        meta_pixel_enabled: settings.meta_pixel_enabled ?? false,
        meta_capi_token: settings.meta_capi_token || '',
        meta_capi_enabled: settings.meta_capi_enabled ?? false,
        meta_test_event_code: settings.meta_test_event_code || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTestResult(null);
        post('/dashboard/settings/meta-pixel', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    language === 'en'
                        ? 'Meta Pixel & CAPI settings saved successfully!'
                        : 'মেটা পিক্সেল ও কনভার্সন এপিআই সেটিংস সংরক্ষিত হয়েছে!'
                );
            },
        });
    };

    const handleTestConnection = async () => {
        if (!data.meta_pixel_id.trim()) {
            toast.error(
                language === 'en' ? 'Please enter a Meta Pixel ID first' : 'প্রথমে মেটা পিক্সেল আইডি প্রদান করুন'
            );
            return;
        }
        if (!data.meta_capi_token.trim()) {
            toast.error(
                language === 'en'
                    ? 'Please enter your Conversions API Access Token'
                    : 'কনভার্সন এপিআই অ্যাক্সেস টোকেন প্রদান করুন'
            );
            return;
        }

        setTestingConnection(true);
        setTestResult(null);

        try {
            // Get CSRF cookie value
            const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'));
            const xsrfToken = match ? decodeURIComponent(match[2]) : '';

            const res = await fetch('/dashboard/settings/meta-pixel/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken,
                },
                body: JSON.stringify({
                    test_event_code: data.meta_test_event_code,
                }),
            });

            const json = await res.json();
            setTestResult(json);

            if (json.success) {
                toast.success(json.message);
            } else {
                toast.error(json.message);
            }
        } catch (err: any) {
            const msg = err?.message || 'সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে।';
            setTestResult({ success: false, message: msg });
            toast.error(msg);
        } finally {
            setTestingConnection(false);
        }
    };

    return (
        <>
            <Head
                title={
                    language === 'en'
                        ? 'Meta Pixel & Conversions API — Bazar Ghor'
                        : 'মেটা পিক্সেল ও কনভার্সন এপিআই — বাজার ঘর'
                }
            />

            <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {language === 'en' ? 'Meta Pixel & Conversions API (CAPI)' : 'মেটা পিক্সেল ও কনভার্সন এপিআই (CAPI)'}
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                <Zap size={11} />
                                In-Built Tracking
                            </span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                            {language === 'en'
                                ? 'Track standard eCommerce events (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase) with browser pixel and server-side CAPI deduplication.'
                                : 'গুগল ট্যাগ ম্যানেজার ছাড়াই ওয়েবসাইট এবং সার্ভার থেকে সরাসরি ফেসবুক ইভেন্টস ট্র্যাক করুন (event_id ডুপ্লিকেশন প্রতিরোধসহ)।'}
                        </p>
                    </div>

                    {recentlySuccessful && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 animate-in fade-in">
                            <Check size={14} />
                            {language === 'en' ? 'Settings saved' : 'সেটিংস সংরক্ষিত হয়েছে'}
                        </div>
                    )}
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-gray-200 pb-px overflow-x-auto">
                    <Link
                        href="/dashboard/settings/general"
                        className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent transition whitespace-nowrap"
                    >
                        {language === 'en' ? 'General Settings' : 'সাধারণ সেটিংস'}
                    </Link>
                    <Link
                        href="/dashboard/settings/payment"
                        className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent transition whitespace-nowrap"
                    >
                        {language === 'en' ? 'Payment Gateways' : 'পেমেন্ট গেটওয়ে'}
                    </Link>
                    <Link
                        href="/dashboard/settings/courier"
                        className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent transition whitespace-nowrap"
                    >
                        {language === 'en' ? 'Courier Services' : 'কুরিয়ার সার্ভিস'}
                    </Link>
                    <Link
                        href="/dashboard/settings/meta-pixel"
                        className="px-4 py-2.5 text-xs font-bold text-[#2d6a27] border-b-2 border-[#2d6a27] transition whitespace-nowrap flex items-center gap-1.5"
                    >
                        <Activity size={14} />
                        {language === 'en' ? 'Meta Pixel & CAPI' : 'মেটা পিক্সেল ও CAPI'}
                    </Link>
                </div>

                {/* Info Callout Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-emerald-50/60 p-5 border border-blue-100 shadow-2xs space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Sparkles size={18} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-gray-900">
                                {language === 'en'
                                    ? 'Zero-Maintenance In-Built Tracking Layer'
                                    : 'ট্যাগ ম্যানেজার ছাড়া সরাসরি ফুল-স্ট্যাক ট্র্যাকিং সিস্টেম'}
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                {language === 'en'
                                    ? 'No external GTM container needed! Standard eCommerce events (PageView, ViewContent, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase) are fired natively. Purchases are tracked simultaneously from the browser AND from the Laravel server using matching event_id to achieve 100% conversion capture and eliminate duplicates.'
                                    : 'কোনো থার্ড-পার্টি ট্যাগ ম্যানেজার ইনস্টল করতে হবে না। প্রতিটি পেজ ভিউ, প্রোডাক্ট ভিউ, কার্ট অ্যাড, চেকআউট এবং পারচেজ স্বয়ংক্রিয়ভাবে ট্র্যাক হয়। ক্যাশ অন ডেলিভারি এবং অনলাইন পেমেন্ট উভয় ক্ষেত্রেই সার্ভার-সাইড CAPI সরাসরি লারাভেল থেকে পাঠানো হয় যাতে কোনো AdBlocker ইভেন্ট মিস না করতে পারে।'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* SECTION 1: Meta Pixel (Browser Side) */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                                    f
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                        {language === 'en' ? 'Meta Pixel (Browser / Client-Side)' : 'মেটা পিক্সেল (ব্রাউজার ট্র্যাকিং)'}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {language === 'en'
                                            ? 'Runs via JavaScript in the visitor’s browser'
                                            : 'ভিজিটরের ব্রাউজার থেকে ফায়ার হওয়া ক্লায়েন্ট-সাইড পিক্সেল'}
                                    </p>
                                </div>
                            </div>

                            {/* Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.meta_pixel_enabled}
                                    onChange={(e) => setData('meta_pixel_enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d6a27]"></div>
                                <span className="ml-2.5 text-xs font-bold text-gray-700">
                                    {data.meta_pixel_enabled
                                        ? language === 'en' ? 'Active' : 'চালু আছে'
                                        : language === 'en' ? 'Disabled' : 'বন্ধ আছে'}
                                </span>
                            </label>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    {language === 'en' ? 'Meta Dataset / Pixel ID' : 'মেটা পিক্সেল আইডি / Dataset ID'} *
                                </label>
                                <a
                                    href="https://adsmanager.facebook.com/events_manager"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    {language === 'en' ? 'Open Events Manager' : 'ইভেন্টস ম্যানেজার খুলুন'}
                                    <ExternalLink size={11} />
                                </a>
                            </div>
                            <input
                                type="text"
                                value={data.meta_pixel_id}
                                onChange={(e) => setData('meta_pixel_id', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-mono text-gray-900 focus:border-[#2d6a27] focus:ring-2 focus:ring-[#2d6a27]/20 focus:outline-none transition shadow-2xs placeholder:font-sans"
                                placeholder="e.g. 123456789012345"
                            />
                            {errors.meta_pixel_id && (
                                <p className="text-xs text-red-500 mt-1">{errors.meta_pixel_id}</p>
                            )}
                            <p className="text-[11px] text-gray-400 mt-1.5">
                                {language === 'en'
                                    ? 'Found in Meta Events Manager > Data Sources > Settings > Dataset ID / Pixel ID.'
                                    : 'ফেসবুক ইভেন্টস ম্যানেজার > Data Sources > Settings-এ Dataset ID বা Pixel ID পাওয়া যাবে (১৬ সংখ্যার)।'}
                            </p>
                        </div>
                    </div>

                    {/* SECTION 2: Conversions API (CAPI) */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <Server size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                        {language === 'en'
                                            ? 'Meta Conversions API (CAPI - Server-Side)'
                                            : 'মেটা কনভার্সন এপিআই (CAPI - সার্ভার ট্র্যাকিং)'}
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        {language === 'en'
                                            ? 'Direct HTTP request from Laravel backend to Meta server'
                                            : 'লারাভেল সার্ভার থেকে সরাসরি ফেসবুক সার্ভারে নিরাপদ ডেটা আদান-প্রদান'}
                                    </p>
                                </div>
                            </div>

                            {/* Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.meta_capi_enabled}
                                    onChange={(e) => setData('meta_capi_enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d6a27]"></div>
                                <span className="ml-2.5 text-xs font-bold text-gray-700">
                                    {data.meta_capi_enabled
                                        ? language === 'en' ? 'Active' : 'চালু আছে'
                                        : language === 'en' ? 'Disabled' : 'বন্ধ আছে'}
                                </span>
                            </label>
                        </div>

                        {/* Access Token */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    {language === 'en' ? 'Conversions API Access Token' : 'কনভার্সন এপিআই অ্যাক্সেস টোকেন'} *
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="text-[11px] font-semibold text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
                                >
                                    {showToken ? <EyeOff size={12} /> : <Eye size={12} />}
                                    {showToken
                                        ? language === 'en' ? 'Hide Token' : 'লুকান'
                                        : language === 'en' ? 'Show Token' : 'দেখান'}
                                </button>
                            </div>
                            <div className="relative">
                                <textarea
                                    rows={showToken ? 4 : 2}
                                    value={data.meta_capi_token}
                                    onChange={(e) => setData('meta_capi_token', e.target.value)}
                                    className={`w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-mono text-gray-900 focus:border-[#2d6a27] focus:ring-2 focus:ring-[#2d6a27]/20 focus:outline-none transition shadow-2xs ${
                                        !showToken ? 'blur-[3px] select-none' : ''
                                    }`}
                                    placeholder="EAAB... (Paste System User or Direct Access Token from Meta Events Manager)"
                                />
                            </div>
                            {errors.meta_capi_token && (
                                <p className="text-xs text-red-500 mt-1">{errors.meta_capi_token}</p>
                            )}
                            <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-gray-500">
                                <HelpCircle size={13} className="text-gray-400 shrink-0 mt-0.5" />
                                <span>
                                    {language === 'en'
                                        ? 'How to generate: Meta Events Manager > Select Dataset > Settings > Conversions API > "Generate access token".'
                                        : 'যেভাবে পাবেন: ফেসবুক Events Manager > আপনার পিক্সেল সিলেক্ট করুন > Settings ট্যাবে গিয়ে Conversions API সেকশনে "Generate access token" বাটনে ক্লিক করুন।'}
                                </span>
                            </div>
                        </div>

                        {/* Test Event Code */}
                        <div className="pt-2 border-t border-gray-100">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                {language === 'en'
                                    ? 'Test Event Code (Optional - for Live Testing)'
                                    : 'টেস্ট ইভেন্ট কোড (ঐচ্ছিক - লাইভ টেস্টের জন্য)'}
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={data.meta_test_event_code}
                                    onChange={(e) => setData('meta_test_event_code', e.target.value.toUpperCase())}
                                    className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-mono uppercase text-gray-900 focus:border-[#2d6a27] focus:ring-2 focus:ring-[#2d6a27]/20 focus:outline-none transition shadow-2xs placeholder:normal-case placeholder:font-sans"
                                    placeholder="e.g. TEST12345"
                                />

                                <button
                                    type="button"
                                    onClick={handleTestConnection}
                                    disabled={testingConnection || processing}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition cursor-pointer disabled:opacity-50 shrink-0"
                                >
                                    {testingConnection ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Send size={14} />
                                    )}
                                    {language === 'en' ? 'Test CAPI Connection' : 'CAPI সংযোগ টেস্ট করুন'}
                                </button>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1.5">
                                {language === 'en'
                                    ? 'Meta Events Manager > Test Events > "Confirm your server events are set up correctly" > Copy code (e.g. TEST12345).'
                                    : 'ফেসবুক Events Manager-এর "Test Events" ট্যাবে গিয়ে টেস্ট কোড পাওয়া যায়। লাইভ বিজ্ঞাপনের সময় এটি ফাঁকা রাখতে পারেন।'}
                            </p>

                            {/* Test Result Message Box */}
                            {testResult && (
                                <div
                                    className={`mt-3 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                                        testResult.success
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : 'bg-red-50 text-red-800 border-red-200'
                                    }`}
                                >
                                    {testResult.success ? (
                                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                    ) : (
                                        <XCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                                    )}
                                    <div className="space-y-0.5">
                                        <p className="font-bold">
                                            {testResult.success
                                                ? language === 'en' ? 'Connection Verified!' : 'সংযোগ সফল ও পরীক্ষিত!'
                                                : language === 'en' ? 'Connection Error' : 'সংযোগ ত্রুটি'}
                                        </p>
                                        <p className="text-[11px] leading-relaxed">{testResult.message}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 3: Standard Events & Deduplication Info Card */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-gray-900 font-bold text-sm">
                            <Layers size={18} className="text-[#2d6a27]" />
                            {language === 'en' ? 'Standard Events & Deduplication Guide' : 'স্বয়ংক্রিয় ইভেন্ট ও ডুপ্লিকেশন গাইড'}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                                <span className="font-mono text-xs font-bold text-blue-600">PageView</span>
                                <p className="text-[11px] text-gray-500">
                                    {language === 'en' ? 'Fires on each page navigation' : 'প্রতিটি পেজ পরিদর্শনে ফায়ার হয়'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                                <span className="font-mono text-xs font-bold text-blue-600">ViewContent</span>
                                <p className="text-[11px] text-gray-500">
                                    {language === 'en' ? 'Product ID, title, category & BDT price' : 'প্রোডাক্ট ভিউয়ের সাথে মূল্য ও ক্যাটাগরি'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                                <span className="font-mono text-xs font-bold text-blue-600">AddToCart</span>
                                <p className="text-[11px] text-gray-500">
                                    {language === 'en' ? 'Product card & details add to cart' : 'কার্টে পণ্য যোগ করামাত্র ফায়ার হয়'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                                <span className="font-mono text-xs font-bold text-blue-600">InitiateCheckout</span>
                                <p className="text-[11px] text-gray-500">
                                    {language === 'en' ? 'Checkout page with all cart items' : 'চেকআউট পেজে কার্টের পণ্যসহ'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                                <span className="font-mono text-xs font-bold text-blue-600">AddPaymentInfo</span>
                                <p className="text-[11px] text-gray-500">
                                    {language === 'en' ? 'COD or Online payment selection' : 'পেমেন্ট মেথড বাছাই করার সময়'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold text-[#2d6a27]">Purchase (CAPI + Browser)</span>
                                    <ShieldCheck size={14} className="text-[#2d6a27]" />
                                </div>
                                <p className="text-[11px] text-gray-600">
                                    {language === 'en'
                                        ? 'Deduplicated via event_id = order_{order_number}'
                                        : 'লারাভেল সার্ভার ও ব্রাউজার উভয় দিক থেকে event_id দিয়ে মার্জ হয়'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-2 p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2">
                            <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed">
                                {language === 'en'
                                    ? 'Note: You do NOT need to insert Facebook Pixel code in the Code Snippets section anymore. Enabling Meta Pixel here will automatically inject and manage standard tracking across all storefront pages.'
                                    : 'পরামর্শ: আপনাকে আর কোড স্নিপেটস (Code Snippets) সেকশনে ফেসবুক পিক্সেলের স্ক্রিপ্ট কোড বসাতে হবে না। এখান থেকে চালু করলেই ওয়েবসাইট স্বয়ংক্রিয়ভাবে ব্রাউজার ও সার্ভার উভয় মাধ্যমে নিখুঁত ট্র্যাকিং পরিচালনা করবে।'}
                            </p>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2d6a27] hover:bg-[#23531f] text-white font-bold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
                        >
                            {processing ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {language === 'en' ? 'Save Settings' : 'সেটিংস সংরক্ষণ করুন'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
