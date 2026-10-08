import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import {
    Activity,
    Calendar,
    Clock,
    CreditCard,
    Eye,
    Globe,
    Layers,
    Monitor,
    Smartphone,
    Tablet,
    Users,
    TrendingUp,
    ExternalLink,
    Filter,
} from 'lucide-react';

interface MetricStats {
    total_views: number;
    unique_visitors: number;
    total_sessions: number;
    avg_duration_seconds: number;
    active_now: number;
}

interface TrendPoint {
    label: string;
    views: number;
    visitors: number;
}

interface TopPage {
    page_path: string;
    page_title: string | null;
    views_count: number;
    unique_visitors: number;
    avg_duration: number;
}

interface RecentVisitor {
    id: number;
    page_path: string;
    page_title: string;
    device_type: string;
    browser: string;
    platform: string;
    duration_seconds: number;
    time_ago: string;
}

interface Props {
    metrics: MetricStats;
    trafficTrend: TrendPoint[];
    topPages: TopPage[];
    devices: {
        mobile: number;
        desktop: number;
        tablet: number;
    };
    topBrowsers: { browser: string; count: number }[];
    recentVisitors: RecentVisitor[];
    currentPeriod: string;
    dateRange: {
        start: string | null;
        end: string | null;
    };
}

function formatDuration(seconds: number, lang: string): string {
    if (!seconds || seconds <= 0) {
        return lang === 'en' ? '< 5s' : '< ৫ সে.';
    }
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) {
        return lang === 'en' ? `${m}m ${s}s` : `${m} মি. ${s} সে.`;
    }
    return lang === 'en' ? `${s}s` : `${s} সেকেন্ড`;
}

export default function VisitorAnalyticsIndex({
    metrics,
    trafficTrend = [],
    topPages = [],
    devices,
    topBrowsers = [],
    recentVisitors = [],
    currentPeriod,
    dateRange,
}: Props) {
    const { language } = useAdminLanguage();

    const [period, setPeriod] = useState(currentPeriod);
    const [startDate, setStartDate] = useState(dateRange.start || '');
    const [endDate, setEndDate] = useState(dateRange.end || '');
    const [showCustomPicker, setShowCustomPicker] = useState(currentPeriod === 'custom');

    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod);
        if (newPeriod === 'custom') {
            setShowCustomPicker(true);
            return;
        }
        setShowCustomPicker(false);
        router.get('/dashboard/analytics', { period: newPeriod }, { preserveState: true, replace: true });
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate) return;
        router.get('/dashboard/analytics', {
            period: 'custom',
            start_date: startDate,
            end_date: endDate,
        }, { preserveState: true, replace: true });
    };

    const totalDeviceVisits = (devices.mobile + devices.desktop + devices.tablet) || 1;
    const mobilePct = Math.round((devices.mobile / totalDeviceVisits) * 100);
    const desktopPct = Math.round((devices.desktop / totalDeviceVisits) * 100);
    const tabletPct = Math.round((devices.tablet / totalDeviceVisits) * 100);

    const maxTrendViews = Math.max(...trafficTrend.map((t) => t.views), 1);

    return (
        <>
            <Head title={language === 'en' ? 'Visitor Analytics — Bazar Ghor' : 'ভিজিটর অ্যানালাইটিক্স — বাজার ঘর'} />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header & Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {language === 'en' ? 'Visitor Analytics & Activity' : 'ভিজিটর অ্যানালাইটিক্স ও ট্র্যাকিং'}
                            </h1>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {language === 'en' ? 'Real-Time' : 'রিয়েল-টাইম'}
                            </span>
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                            {language === 'en'
                                ? 'Track unique visitors, popular pages, and customer engagement time across your store.'
                                : 'আপনার ওয়েবসাইটে কতজন ভিজিটর ঢুকছে, কোন পেইজে বেশি সময় দিচ্ছে ও কোন ডিভাইস ব্যবহার করছে তা পর্যবেক্ষণ করুন।'}
                        </p>
                    </div>

                    {/* Filter Presets */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            <select
                                value={period}
                                onChange={(e) => handlePeriodChange(e.target.value)}
                                className="rounded-xl border border-gray-200 bg-white py-2 pl-8 pr-8 text-xs sm:text-sm font-semibold text-gray-800 shadow-2xs focus:border-[#2d6a27] focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="today">{language === 'en' ? 'Today (আজকে)' : 'আজকের ভিজিটর'}</option>
                                <option value="yesterday">{language === 'en' ? 'Yesterday (গতকাল)' : 'গতকালের ভিজিটর'}</option>
                                <option value="last_7_days">{language === 'en' ? 'Last 7 Days (গত ৭ দিন)' : 'গত ৭ দিন'}</option>
                                <option value="this_month">{language === 'en' ? 'This Month (এই মাস)' : 'চলতি মাস'}</option>
                                <option value="last_month">{language === 'en' ? 'Last Month (গত মাস)' : 'গত মাস'}</option>
                                <option value="this_year">{language === 'en' ? 'This Year (এই বছর)' : 'চলতি বছর'}</option>
                                <option value="all_time">{language === 'en' ? 'All Time (সব সময়)' : 'সব সময়'}</option>
                                <option value="custom">{language === 'en' ? 'Custom Range...' : 'কাস্টম তারিখ...'}</option>
                            </select>
                        </div>

                        {/* Live Counter Badge */}
                        <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs font-bold text-emerald-800 shadow-2xs">
                            <Activity size={14} className="text-emerald-600 animate-pulse" />
                            <span>
                                {language === 'en' ? 'Active now:' : 'এখন লাইভ:'} <strong>{metrics.active_now}</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Custom Date Form */}
                {showCustomPicker && (
                    <form onSubmit={handleCustomSubmit} className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 border border-gray-100 shadow-2xs animate-in fade-in">
                        <span className="text-xs font-semibold text-gray-600">
                            {language === 'en' ? 'Date Range:' : 'তারিখ রেঞ্জ:'}
                        </span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs bg-gray-50 focus:border-[#2d6a27] focus:outline-none"
                            required
                        />
                        <span className="text-xs text-gray-400">থেকে</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs bg-gray-50 focus:border-[#2d6a27] focus:outline-none"
                            required
                        />
                        <button
                            type="submit"
                            className="rounded-xl bg-[#2d6a27] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#23531f] transition cursor-pointer"
                        >
                            {language === 'en' ? 'Apply Filter' : 'প্রয়োগ করুন'}
                        </button>
                    </form>
                )}

                {/* 4 Primary Metric Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Total Page Views */}
                    <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? 'Total Page Views' : 'মোট পেইজ ভিউ'}
                            </p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">
                                {metrics.total_views.toLocaleString()}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-1">
                                {language === 'en' ? 'Total visits recorded' : 'মোট পরিদর্শনের সংখ্যা'}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                            <Eye size={22} />
                        </div>
                    </div>

                    {/* 2. Unique Visitors */}
                    <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? 'Unique Visitors' : 'ইউনিক ভিজিটর'}
                            </p>
                            <h3 className="text-2xl font-black text-[#2d6a27] mt-1">
                                {metrics.unique_visitors.toLocaleString()}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-1">
                                {language === 'en'
                                    ? `${metrics.total_sessions} user sessions`
                                    : `${metrics.total_sessions}টি ভিজিটর সেশন`}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-[#2d6a27] flex items-center justify-center border border-emerald-100">
                            <Users size={22} />
                        </div>
                    </div>

                    {/* 3. Average Engagement Time */}
                    <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? 'Avg. Time on Page' : 'গড়ে সময় ব্যয়'}
                            </p>
                            <h3 className="text-2xl font-black text-purple-700 mt-1">
                                {formatDuration(metrics.avg_duration_seconds, language)}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-1">
                                {language === 'en' ? 'Engagement per page' : 'প্রতি পেইজে কাটানো সময়'}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                            <Clock size={22} />
                        </div>
                    </div>

                    {/* 4. Active Live Visitors */}
                    <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {language === 'en' ? 'Live Right Now' : 'বর্তমানে সাইটে আছেন'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <h3 className="text-2xl font-black text-emerald-600">
                                    {metrics.active_now}
                                </h3>
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">
                                {language === 'en' ? 'Active in last 5 mins' : 'বিগত ৫ মিনিটে সক্রিয়'}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                            <Activity size={22} />
                        </div>
                    </div>
                </div>

                {/* Section 1: Traffic Trend Visual Bar Chart */}
                <div className="rounded-2xl bg-white p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-[#2d6a27]/10 flex items-center justify-center text-[#2d6a27]">
                                <TrendingUp size={16} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                                    {language === 'en' ? 'Visitor Traffic Trend' : 'ভিজিটর ও পেইজভিউ এর ট্রেন্ড'}
                                </h2>
                                <p className="text-[11px] text-gray-400">
                                    {language === 'en'
                                        ? 'Comparison of total page views and unique visitors over time'
                                        : 'সময় অনুযায়ী পেইজ ভিউ এবং ইউনিক ভিজিটরের তুলনামূলক চিত্র'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-semibold">
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <span className="h-3 w-3 rounded-md bg-[#2d6a27]"></span>
                                {language === 'en' ? 'Page Views' : 'পেইজ ভিউ'}
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <span className="h-3 w-3 rounded-md bg-blue-400"></span>
                                {language === 'en' ? 'Visitors' : 'ইউনিক ভিজিটর'}
                            </span>
                        </div>
                    </div>

                    {trafficTrend.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-xs">
                            {language === 'en' ? 'No traffic data available for this range.' : 'এই সময়ে কোনো ভিজিট রেকর্ড পাওয়া যায়নি।'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto pt-2 pb-1">
                            <div className="min-w-[600px] h-48 flex items-end gap-2 sm:gap-3 px-2">
                                {trafficTrend.map((pt, idx) => {
                                    const heightPct = Math.max(8, Math.round((pt.views / maxTrendViews) * 100));
                                    const visitorHeightPct = Math.max(6, Math.round((pt.visitors / maxTrendViews) * 100));

                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                                            {/* Tooltip */}
                                            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1 shadow-md pointer-events-none z-10 whitespace-nowrap">
                                                <p className="font-bold">{pt.label}</p>
                                                <p>Views: {pt.views} | Visitors: {pt.visitors}</p>
                                            </div>

                                            {/* Bars */}
                                            <div className="w-full flex items-end justify-center gap-1 h-36">
                                                <div
                                                    style={{ height: `${heightPct}%` }}
                                                    className="w-full max-w-[14px] rounded-t-md bg-[#2d6a27] transition-all hover:bg-[#23531f]"
                                                ></div>
                                                <div
                                                    style={{ height: `${visitorHeightPct}%` }}
                                                    className="w-full max-w-[14px] rounded-t-md bg-blue-400 transition-all hover:bg-blue-500"
                                                ></div>
                                            </div>

                                            {/* Label */}
                                            <span className="text-[10px] text-gray-400 font-medium truncate max-w-[45px] block text-center">
                                                {pt.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 2: Top Visited Pages & Engagement Time Table */}
                <div className="rounded-2xl bg-white p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <Clock size={16} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                                    {language === 'en' ? 'Top Visited Pages & Engagement Time' : 'সবচেয়ে বেশি ভিজিট হওয়া পেইজ ও ব্যয় করা সময়'}
                                </h2>
                                <p className="text-[11px] text-gray-400">
                                    {language === 'en'
                                        ? 'Discover which pages capture the most interest and keep visitors engaged'
                                        : 'ভিজিটররা কোন পেইজ বা প্রোডাক্ট বেশি দেখছে এবং সেখানে গড়ে কতক্ষণ সময় দিচ্ছে'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm text-gray-600">
                            <thead>
                                <tr className="border-b bg-gray-50/70 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <th className="px-4 py-3">{language === 'en' ? 'Page Path & Title' : 'পেইজ লিংক ও নাম'}</th>
                                    <th className="px-4 py-3 text-right">{language === 'en' ? 'Views' : 'মোট ভিউ'}</th>
                                    <th className="px-4 py-3 text-right">{language === 'en' ? 'Unique Visitors' : 'ইউনিক ভিজিটর'}</th>
                                    <th className="px-4 py-3 text-right">{language === 'en' ? 'Avg. Time Spent' : 'গড়ে সময়'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {topPages.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-xs">
                                            {language === 'en' ? 'No page visits recorded yet.' : 'এখনও কোনো পেইজ ভিজিট রেকর্ড হয়নি।'}
                                        </td>
                                    </tr>
                                ) : (
                                    topPages.map((page, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/60 transition">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-gray-400">
                                                        #{idx + 1}
                                                    </span>
                                                    <div>
                                                        <a
                                                            href={page.page_path}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-semibold text-gray-900 hover:text-[#2d6a27] transition flex items-center gap-1"
                                                        >
                                                            <span>{page.page_path}</span>
                                                            <ExternalLink size={11} className="opacity-40" />
                                                        </a>
                                                        {page.page_title && (
                                                            <p className="text-[11px] text-gray-400 truncate max-w-md">
                                                                {page.page_title}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900">
                                                {page.views_count.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-blue-600">
                                                {page.unique_visitors.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-purple-700">
                                                <span className="inline-block bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-100 font-mono text-xs">
                                                    {formatDuration(page.avg_duration, language)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 3: Devices Breakdown + Top Browsers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Device Breakdown */}
                    <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-[#2d6a27] flex items-center justify-center">
                                <Smartphone size={16} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">
                                    {language === 'en' ? 'Visitor Devices' : 'ডিভাইস অনুপাত (মোবাইল / ডেক্সটপ)'}
                                </h3>
                                <p className="text-[11px] text-gray-400">
                                    {language === 'en' ? 'Types of devices used by visitors' : 'ভিজিটররা কোন ডিভাইস থেকে ঢুকছে'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-1">
                            {/* Mobile */}
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="flex items-center gap-1.5 text-gray-700">
                                        <Smartphone size={14} className="text-emerald-600" />
                                        {language === 'en' ? 'Mobile Phones' : 'মোবাইল ফোন'}
                                    </span>
                                    <span className="text-gray-900 font-bold">{mobilePct}% ({devices.mobile})</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div style={{ width: `${mobilePct}%` }} className="h-full bg-emerald-500 rounded-full transition-all"></div>
                                </div>
                            </div>

                            {/* Desktop */}
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="flex items-center gap-1.5 text-gray-700">
                                        <Monitor size={14} className="text-blue-600" />
                                        {language === 'en' ? 'Desktop / Laptop' : 'ডেস্কটপ / ল্যাপটপ'}
                                    </span>
                                    <span className="text-gray-900 font-bold">{desktopPct}% ({devices.desktop})</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div style={{ width: `${desktopPct}%` }} className="h-full bg-blue-500 rounded-full transition-all"></div>
                                </div>
                            </div>

                            {/* Tablet */}
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span className="flex items-center gap-1.5 text-gray-700">
                                        <Tablet size={14} className="text-amber-600" />
                                        {language === 'en' ? 'Tablets' : 'ট্যাবলেট'}
                                    </span>
                                    <span className="text-gray-900 font-bold">{tabletPct}% ({devices.tablet})</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <div style={{ width: `${tabletPct}%` }} className="h-full bg-amber-500 rounded-full transition-all"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Browsers */}
                    <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Globe size={16} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">
                                    {language === 'en' ? 'Top Browsers' : 'জনপ্রিয় ব্রাউজারসমূহ'}
                                </h3>
                                <p className="text-[11px] text-gray-400">
                                    {language === 'en' ? 'Browsers utilized by customers' : 'কাস্টমারদের ব্যবহৃত ব্রাউজার তালিকা'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-1">
                            {topBrowsers.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-6">
                                    {language === 'en' ? 'No browser data yet.' : 'ব্রাউজার ডেটা পাওয়া যায়নি।'}
                                </p>
                            ) : (
                                topBrowsers.map((b, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 text-xs font-semibold">
                                        <span className="text-gray-800">{b.browser}</span>
                                        <span className="text-gray-500 font-bold">{b.count} visits</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 4: Recent Live Visitor Activity Stream */}
                <div className="rounded-2xl bg-white p-5 sm:p-6 border border-gray-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <Activity size={16} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                                    {language === 'en' ? 'Recent Visitor Stream' : 'সাম্প্রতিক ভিজিটর কার্যকলাপ'}
                                </h2>
                                <p className="text-[11px] text-gray-400">
                                    {language === 'en' ? 'Live incoming visitor logs' : 'সাম্প্রতিক আগত ভিজিটরদের লাইভ রেকর্ড'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-600">
                            <thead>
                                <tr className="border-b bg-gray-50/70 text-xs font-semibold text-gray-700">
                                    <th className="px-3 py-2.5">{language === 'en' ? 'Page' : 'পেইজ'}</th>
                                    <th className="px-3 py-2.5">{language === 'en' ? 'Device & OS' : 'ডিভাইস ও সিস্টেম'}</th>
                                    <th className="px-3 py-2.5">{language === 'en' ? 'Browser' : 'ব্রাউজার'}</th>
                                    <th className="px-3 py-2.5 text-right">{language === 'en' ? 'Time Spent' : 'সময়'}</th>
                                    <th className="px-3 py-2.5 text-right">{language === 'en' ? 'When' : 'কখন'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentVisitors.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-6 text-center text-gray-400">
                                            {language === 'en' ? 'No recent logs yet.' : 'এখনও কোনো ভিজিটর লগ নেই।'}
                                        </td>
                                    </tr>
                                ) : (
                                    recentVisitors.map((v) => (
                                        <tr key={v.id} className="hover:bg-gray-50/50">
                                            <td className="px-3 py-2.5 font-semibold text-gray-900">
                                                <span className="font-mono">{v.page_path}</span>
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-700 capitalize">
                                                {v.device_type} • {v.platform}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-600">
                                                {v.browser}
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-mono font-bold text-purple-700">
                                                {formatDuration(v.duration_seconds, language)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right text-gray-400">
                                                {v.time_ago}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
