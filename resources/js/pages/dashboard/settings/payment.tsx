import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    CreditCard,
    Check,
    Save,
    Settings,
    ShieldCheck,
    Building2,
    Truck,
    Smartphone,
    Globe,
    ExternalLink,
    Info,
    Eye,
    EyeOff,
} from 'lucide-react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface GatewayConfig {
    enabled: boolean;
    [key: string]: any;
}

interface Props {
    gateways: {
        cod: {
            enabled: boolean;
            title: string;
            instructions: string;
        };
        uddoktapay: {
            enabled: boolean;
            api_key: string;
            base_url: string;
            mode: 'sandbox' | 'live';
            title: string;
        };
        bkash: {
            enabled: boolean;
            app_key: string;
            app_secret: string;
            username: string;
            password: string;
            mode: 'sandbox' | 'live';
        };
        nagad: {
            enabled: boolean;
            merchant_id: string;
            public_key: string;
            private_key: string;
            mode: 'sandbox' | 'live';
        };
        sslcommerz: {
            enabled: boolean;
            store_id: string;
            store_password: string;
            mode: 'sandbox' | 'live';
        };
    };
}

export default function PaymentSettings({ gateways }: Props) {
    const { language } = useAdminLanguage();

    const [showApiKey, setShowApiKey] = useState(false);
    const [showBkashSecret, setShowBkashSecret] = useState(false);
    const [showSslPassword, setShowSslPassword] = useState(false);

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        cod: gateways.cod,
        uddoktapay: gateways.uddoktapay,
        bkash: gateways.bkash,
        nagad: gateways.nagad,
        sslcommerz: gateways.sslcommerz,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/settings/payment', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={language === 'en' ? 'Payment Gateways — Bazar Ghor' : 'পেমেন্ট গেটওয়ে সেটিংস — বাজার ঘর'} />

            <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {language === 'en' ? 'Payment Gateway Settings' : 'পেমেন্ট গেটওয়ে ব্যবস্থাপনা'}
                        </h1>
                        <p className="text-gray-500 text-xs mt-1">
                            {language === 'en'
                                ? 'Configure Cash on Delivery and online payment gateways (UddoktaPay, bKash, Nagad, SSLCommerz)'
                                : 'ক্যাশ অন ডেলিভারি এবং অনলাইন পেমেন্ট গেটওয়ে (উদ্যোক্তাপে, বিকাশ, নগদ, এসএসএলকমার্জ) সেটআপ করুন'}
                        </p>
                    </div>

                    {recentlySuccessful && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 animate-in fade-in">
                            <Check size={14} />
                            {language === 'en' ? 'Settings saved successfully' : 'পেমেন্ট সেটিংস সংরক্ষিত হয়েছে'}
                        </div>
                    )}
                </div>

                {/* Navigation Tabs (General vs Payment) */}
                <div className="flex items-center gap-2 border-b border-gray-200 pb-px">
                    <Link
                        href="/dashboard/settings/general"
                        className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent transition"
                    >
                        {language === 'en' ? 'General Settings' : 'সাধারণ সেটিংস'}
                    </Link>
                    <Link
                        href="/dashboard/settings/payment"
                        className="px-4 py-2.5 text-xs font-bold text-[#2d6a27] border-b-2 border-[#2d6a27] transition"
                    >
                        {language === 'en' ? 'Payment Gateways' : 'পেমেন্ট গেটওয়ে'}
                    </Link>
                    <Link
                        href="/dashboard/settings/courier"
                        className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent transition"
                    >
                        {language === 'en' ? 'Courier Services' : 'কুরিয়ার সার্ভিস'}
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. Cash on Delivery (COD) */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2d6a27]">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 text-base">
                                        {language === 'en' ? 'Cash on Delivery (COD)' : 'ক্যাশ অন ডেলিভারি (COD)'}
                                    </h2>
                                    <p className="text-[11px] text-gray-500">
                                        {language === 'en' ? 'Accept payments in cash when order is delivered' : 'পণ্য ডেলিভারি হওয়ার পর নগদ টাকায় মূল্য গ্রহণ করুন'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.cod.enabled}
                                    onChange={(e) => setData('cod', { ...data.cod, enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d6a27]"></div>
                            </label>
                        </div>

                        {data.cod.enabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 animate-in fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        {language === 'en' ? 'Checkout Title' : 'চেকআউটে প্রদর্শিত নাম'}
                                    </label>
                                    <input
                                        type="text"
                                        value={data.cod.title}
                                        onChange={(e) => setData('cod', { ...data.cod, title: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#2d6a27]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        {language === 'en' ? 'Instructions for Customer' : 'গ্রাহকের জন্য নির্দেশনা'}
                                    </label>
                                    <input
                                        type="text"
                                        value={data.cod.instructions}
                                        onChange={(e) => setData('cod', { ...data.cod, instructions: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#2d6a27]"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. UddoktaPay (Recommended Aggregator: bKash, Nagad, Rocket, Cards) */}
                    <div className="rounded-2xl bg-white p-6 border-2 border-emerald-500/40 shadow-xs space-y-4 relative overflow-hidden">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-black text-sm">
                                    UP
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-bold text-gray-900 text-base">
                                            UddoktaPay (উদ্যোক্তা পে)
                                        </h2>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                            {language === 'en' ? 'All-in-One: bKash, Nagad, Rocket' : 'বিকাশ, নগদ, রকেট, কার্ড এক সাথে'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500">
                                        {language === 'en'
                                            ? 'Instant automated checkout with bKash, Nagad, Rocket, and Visa/Mastercard without trade license.'
                                            : 'ট্রেড লাইসেন্স ছাড়া বা সহজে অটোমেটেড বিকাশ, নগদ, রকেট পেমেন্ট গ্রহণের সেরা মাধ্যম।'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.uddoktapay.enabled}
                                    onChange={(e) => setData('uddoktapay', { ...data.uddoktapay, enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d6a27]"></div>
                            </label>
                        </div>

                        {data.uddoktapay.enabled && (
                            <div className="space-y-4 pt-1 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            {language === 'en' ? 'Environment Mode' : 'পরিবেশ মোড'}
                                        </label>
                                        <select
                                            value={data.uddoktapay.mode}
                                            onChange={(e) => setData('uddoktapay', { ...data.uddoktapay, mode: e.target.value as any })}
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#2d6a27]"
                                        >
                                            <option value="live">Live (লাইভ মোড - রিয়েল পেমেন্ট)</option>
                                            <option value="sandbox">Sandbox (টেস্টিং মোড)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            {language === 'en' ? 'Display Title at Checkout' : 'চেকআউটে প্রদর্শিত নাম'}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.uddoktapay.title}
                                            onChange={(e) => setData('uddoktapay', { ...data.uddoktapay, title: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#2d6a27]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            UddoktaPay API Key *
                                        </label>
                                        <a
                                            href="https://uddoktapay.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] text-[#2d6a27] hover:underline inline-flex items-center gap-1 font-semibold"
                                        >
                                            Get API Key from UddoktaPay <ExternalLink size={11} />
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={data.uddoktapay.api_key}
                                            onChange={(e) => setData('uddoktapay', { ...data.uddoktapay, api_key: e.target.value })}
                                            placeholder="e.g. 982d9e02dda0f78f1199e407b1b0f5cd"
                                            className="w-full rounded-xl border border-gray-200 pl-3.5 pr-10 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-[#2d6a27]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        API Base URL
                                    </label>
                                    <input
                                        type="text"
                                        value={data.uddoktapay.base_url}
                                        onChange={(e) => setData('uddoktapay', { ...data.uddoktapay, base_url: e.target.value })}
                                        placeholder="https://bazarghor.paymently.io/api/checkout-v2"
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-[#2d6a27]"
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        {language === 'en'
                                            ? 'Enter your UddoktaPay or Paymently checkout URL (e.g. https://bazarghor.paymently.io/api/checkout-v2 or https://checkout.uddoktapay.com/api/checkout-v2). The system will automatically normalize it.'
                                            : 'আপনার উদ্যোক্তাপে বা পেমেন্টলি প্যানেলের URL দিন (যেমন: https://bazarghor.paymently.io/api/checkout-v2 বা https://bazarghor.paymently.io)। সিস্টেম একা একাই সঠিক এন্ডপয়েন্ট তৈরি করে নেবে।'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. bKash Direct Merchant */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 font-black text-sm">
                                    bK
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 text-base">
                                        bKash Merchant PGW (বিকাশ মার্চেন্ট গেটওয়ে)
                                    </h2>
                                    <p className="text-[11px] text-gray-500">
                                        {language === 'en' ? 'Official direct bKash Checkout URL with App Key & Secret' : 'বিকাশ সরাসরি মার্চেন্ট এপিআই (ট্রেড লাইসেন্স ও এগ্রিমেন্ট প্রয়োজন)'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.bkash.enabled}
                                    onChange={(e) => setData('bkash', { ...data.bkash, enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d6a27]"></div>
                            </label>
                        </div>

                        {data.bkash.enabled && (
                            <div className="space-y-4 pt-1 animate-in fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            App Key *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.bkash.app_key}
                                            onChange={(e) => setData('bkash', { ...data.bkash, app_key: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-[#2d6a27]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            App Secret *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showBkashSecret ? 'text' : 'password'}
                                                value={data.bkash.app_secret}
                                                onChange={(e) => setData('bkash', { ...data.bkash, app_secret: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 pl-3.5 pr-10 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-[#2d6a27]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowBkashSecret(!showBkashSecret)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showBkashSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Username *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.bkash.username}
                                            onChange={(e) => setData('bkash', { ...data.bkash, username: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-[#2d6a27]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={data.bkash.password}
                                            onChange={(e) => setData('bkash', { ...data.bkash, password: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-[#2d6a27]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 4. Nagad Merchant */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-black text-sm">
                                    NG
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 text-base">
                                        Nagad Merchant PGW (নগদ মার্চেন্ট গেটওয়ে)
                                    </h2>
                                    <p className="text-[11px] text-gray-500">
                                        {language === 'en' ? 'Direct Nagad Merchant integration with public and private keys' : 'নগদ সরাসরি মার্চেন্ট এপিআই'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.nagad.enabled}
                                    onChange={(e) => setData('nagad', { ...data.nagad, enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d6a27]"></div>
                            </label>
                        </div>

                        {data.nagad.enabled && (
                            <div className="space-y-4 pt-1 animate-in fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Merchant ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nagad.merchant_id}
                                        onChange={(e) => setData('nagad', { ...data.nagad, merchant_id: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-[#2d6a27]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Nagad Public Key *
                                    </label>
                                    <textarea
                                        value={data.nagad.public_key}
                                        onChange={(e) => setData('nagad', { ...data.nagad, public_key: e.target.value })}
                                        rows={2}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-900 font-mono focus:outline-none focus:border-[#2d6a27]"
                                        placeholder="-----BEGIN PUBLIC KEY-----..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Merchant Private Key *
                                    </label>
                                    <textarea
                                        value={data.nagad.private_key}
                                        onChange={(e) => setData('nagad', { ...data.nagad, private_key: e.target.value })}
                                        rows={2}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs text-gray-900 font-mono focus:outline-none focus:border-[#2d6a27]"
                                        placeholder="-----BEGIN RSA PRIVATE KEY-----..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 5. SSLCommerz */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">
                                    SSL
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 text-base">
                                        SSLCommerz (এসএসএল কমার্স)
                                    </h2>
                                    <p className="text-[11px] text-gray-500">
                                        {language === 'en' ? 'Leading Bangladesh payment gateway with Store ID and Password' : 'বাংলাদেশের প্রতিষ্ঠিত পেমেন্ট গেটওয়ে (কার্ড, নেট ব্যাংকিং)'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.sslcommerz.enabled}
                                    onChange={(e) => setData('sslcommerz', { ...data.sslcommerz, enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d6a27]"></div>
                            </label>
                        </div>

                        {data.sslcommerz.enabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 animate-in fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Store ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.sslcommerz.store_id}
                                        onChange={(e) => setData('sslcommerz', { ...data.sslcommerz, store_id: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-[#2d6a27]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Store Password *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showSslPassword ? 'text' : 'password'}
                                            value={data.sslcommerz.store_password}
                                            onChange={(e) => setData('sslcommerz', { ...data.sslcommerz, store_password: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 pl-3.5 pr-10 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-[#2d6a27]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSslPassword(!showSslPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showSslPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a27] px-6 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#23531e] active:scale-95 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {processing
                                ? (language === 'en' ? 'Saving...' : 'সংরক্ষণ করা হচ্ছে...')
                                : (language === 'en' ? 'Save Gateway Settings' : 'গেটওয়ে সেটিংস সংরক্ষণ করুন')}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
