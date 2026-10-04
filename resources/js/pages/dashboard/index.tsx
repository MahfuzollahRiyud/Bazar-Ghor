import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Package,
    ShoppingBag,
    ShoppingCart,
    Tag,
    TrendingUp,
    Users,
    DollarSign,
    Calendar,
    Filter,
    Plus,
    Trash2,
    Megaphone,
    Edit3,
    Check,
    X,
    HelpCircle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
} from 'lucide-react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface Stats {
    total_orders: number;
    pending_orders: number;
    confirmed_orders: number;
    delivered_orders: number;
    total_revenue: number;
    total_cogs: number;
    gross_profit: number;
    marketing_cost: number;
    net_profit: number;
    total_products: number;
    active_products: number;
    total_categories: number;
}

interface ExpenseItem {
    id: number;
    expense_date: string;
    amount: number;
    title?: string | null;
    notes?: string | null;
}

interface Analytics {
    period: string;
    start_date: string;
    end_date: string;
    total_orders: number;
    pending_orders: number;
    confirmed_orders: number;
    delivered_orders: number;
    revenue: number;
    cogs: number;
    gross_profit: number;
    marketing_cost: number;
    net_profit: number;
    expenses: ExpenseItem[];
}

interface RecentOrder {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    total: number;
    status: string;
    status_label: string;
    status_color: string;
    items_count: number;
    created_at: string;
}

interface Props {
    stats: Stats;
    analytics?: Analytics;
    recentOrders: RecentOrder[];
}

const STATUS_STYLES: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
};

export default function DashboardIndex({ stats, analytics, recentOrders }: Props) {
    const { t, language } = useAdminLanguage();

    // Active period state
    const currentPeriod = analytics?.period || 'this_month';
    const [customStart, setCustomStart] = useState(analytics?.start_date || '');
    const [customEnd, setCustomEnd] = useState(analytics?.end_date || '');
    const [showCustomRange, setShowCustomRange] = useState(currentPeriod === 'custom');

    // Expense Modal & Drawer states
    const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
    const [showExpenseList, setShowExpenseList] = useState(false);

    // Form for adding ad expense
    const { data: expenseData, setData: setExpenseData, post: postExpense, processing: expenseProcessing, reset: resetExpense, errors: expenseErrors } = useForm({
        expense_date: new Date().toISOString().split('T')[0],
        amount: '',
        title: 'Facebook Ads',
        notes: '',
    });

    const handlePeriodChange = (periodKey: string) => {
        if (periodKey === 'custom') {
            setShowCustomRange(true);
            return;
        }
        setShowCustomRange(false);
        router.get(
            '/dashboard',
            { period: periodKey },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleApplyCustomRange = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customStart) return;
        router.get(
            '/dashboard',
            { period: 'custom', start_date: customStart, end_date: customEnd },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleAddExpenseSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postExpense('/dashboard/marketing-expenses', {
            preserveScroll: true,
            onSuccess: () => {
                resetExpense();
                setIsAddExpenseModalOpen(false);
            },
        });
    };

    const handleDeleteExpense = (id: number) => {
        if (confirm(language === 'en' ? 'Delete this ad expense record?' : 'এই বিজ্ঞাপনী খরচ রেকর্ডটি মুছে ফেলতে চান?')) {
            router.delete(`/dashboard/marketing-expenses/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const activeAnalytics = analytics || {
        period: 'all',
        start_date: '',
        end_date: '',
        total_orders: stats.total_orders,
        pending_orders: stats.pending_orders,
        confirmed_orders: stats.confirmed_orders,
        delivered_orders: stats.delivered_orders,
        revenue: stats.total_revenue,
        cogs: stats.total_cogs,
        gross_profit: stats.gross_profit,
        marketing_cost: stats.marketing_cost,
        net_profit: stats.net_profit,
        expenses: [],
    };

    const isProfitPositive = (activeAnalytics.net_profit ?? 0) >= 0;

    const PERIOD_LABELS: Record<string, { en: string; bn: string }> = {
        today: { en: 'Today', bn: 'আজকে' },
        yesterday: { en: 'Yesterday', bn: 'গতকাল' },
        last_7_days: { en: 'Last 7 Days', bn: 'গত ৭ দিন' },
        this_month: { en: 'This Month', bn: 'চলতি মাস' },
        last_month: { en: 'Last Month', bn: 'গত মাস' },
        this_year: { en: 'This Year', bn: 'চলতি বছর' },
        all: { en: 'All Time', bn: 'সর্বমোট' },
        custom: { en: 'Custom Range', bn: 'কাস্টম তারিখ' },
    };

    return (
        <>
            <Head title={`${t.dashboard} — Bazar Ghor Admin`} />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t.dashboard}</h1>
                        <p className="text-gray-500 text-xs mt-0.5">Bazar Ghor Admin Management Portal</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsAddExpenseModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2d6a27] hover:bg-[#23531e] text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
                    >
                        <Plus size={15} />
                        {language === 'en' ? '+ Add Ad Spend' : '+ অ্যাড খরচ যোগ করুন'}
                    </button>
                </div>

                {/* Profit & Financial Analytics with Date Filter */}
                <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-gray-900 to-gray-950 p-5 sm:p-6 text-white shadow-xl border border-emerald-800/30">
                    {/* Top Bar of Section: Title & Date Filter Pills */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-sm">
                                    ৳
                                </span>
                                <div>
                                    <h2 className="text-lg font-bold text-white tracking-wide">
                                        {language === 'en' ? 'Profit & Financial Analytics' : 'লাভ ও আর্থিক হিসাব এনালাইটিক্স'}
                                    </h2>
                                    <span className="text-[11px] text-emerald-300 font-medium">
                                        {PERIOD_LABELS[currentPeriod]?.[language === 'en' ? 'en' : 'bn'] || currentPeriod}
                                        {activeAnalytics.start_date && activeAnalytics.end_date && (
                                            <span className="ml-1 text-gray-400">
                                                ({activeAnalytics.start_date} হতে {activeAnalytics.end_date})
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Date Filter Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10">
                            {[
                                { key: 'today', label: language === 'en' ? 'Today' : 'আজকে' },
                                { key: 'yesterday', label: language === 'en' ? 'Yesterday' : 'গতকাল' },
                                { key: 'last_7_days', label: language === 'en' ? '7 Days' : '৭ দিন' },
                                { key: 'this_month', label: language === 'en' ? 'This Month' : 'চলতি মাস' },
                                { key: 'last_month', label: language === 'en' ? 'Last Month' : 'গত মাস' },
                                { key: 'all', label: language === 'en' ? 'All' : 'সর্বমোট' },
                                { key: 'custom', label: language === 'en' ? 'Custom' : 'কাস্টম' },
                            ].map((p) => (
                                <button
                                    key={p.key}
                                    type="button"
                                    onClick={() => handlePeriodChange(p.key)}
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                                        currentPeriod === p.key
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Date Range Picker Bar (if toggled) */}
                    {showCustomRange && (
                        <form
                            onSubmit={handleApplyCustomRange}
                            className="mt-4 p-3.5 rounded-xl bg-black/50 border border-emerald-500/30 flex flex-wrap items-center gap-3 animate-in fade-in duration-150"
                        >
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-emerald-400" />
                                <span className="text-xs font-semibold text-emerald-200">
                                    {language === 'en' ? 'Select Date Range:' : 'তারিখ পরিসীমা নির্বাচন:'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    required
                                />
                                <span className="text-gray-400 text-xs">-</span>
                                <input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                            >
                                {language === 'en' ? 'Filter' : 'ফিল্টার করুন'}
                            </button>
                        </form>
                    )}

                    {/* Metric Cards Grid for Selected Period */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                        {/* 1. Delivered Revenue */}
                        <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                                {language === 'en' ? 'Delivered Revenue' : 'ডেলিভারি বিক্রয়'}
                            </span>
                            <p className="text-2xl font-black text-emerald-400 mt-1">
                                ৳{Number(activeAnalytics.revenue || 0).toLocaleString()}
                            </p>
                            <span className="text-[11px] text-gray-400 mt-1 block">
                                {activeAnalytics.delivered_orders} {language === 'en' ? 'delivered' : 'টি সফল ডেলিভারি'}
                                {activeAnalytics.total_orders > 0 && ` (${activeAnalytics.total_orders} টি অর্ডারের মধ্যে)`}
                            </span>
                        </div>

                        {/* 2. Product Cost (COGS) */}
                        <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                                {language === 'en' ? 'Wholesale Cost (COGS)' : 'পণ্যের ক্রয়/পাইকারি খরচ'}
                            </span>
                            <p className="text-2xl font-black text-amber-300 mt-1">
                                ৳{Number(activeAnalytics.cogs || 0).toLocaleString()}
                            </p>
                            <span className="text-[11px] text-gray-400 mt-1 block">
                                {language === 'en' ? 'Delivered items wholesale cost' : 'ডেলিভারি হওয়া পণ্যের ক্রয়মূল্য'}
                            </span>
                        </div>

                        {/* 3. Marketing / Ad Spend */}
                        <div className="rounded-xl bg-white/5 p-4 border border-white/5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                                        {language === 'en' ? 'Ad / Marketing Spend' : 'বিজ্ঞাপন / মার্কেটিং খরচ'}
                                    </span>
                                </div>
                                <p className="text-2xl font-black text-blue-300 mt-1">
                                    ৳{Number(activeAnalytics.marketing_cost || 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowExpenseList(!showExpenseList)}
                                    className="text-[11px] text-blue-300 hover:underline font-medium"
                                >
                                    {showExpenseList
                                        ? (language === 'en' ? 'Hide list ▲' : 'তালিকা লুকান ▲')
                                        : (language === 'en' ? 'View list ▼' : 'খরচের তালিকা ▼')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAddExpenseModalOpen(true)}
                                    className="text-[11px] text-emerald-300 hover:underline font-bold"
                                >
                                    {language === 'en' ? '+ Add' : '+ খরচ যোগ'}
                                </button>
                            </div>
                        </div>

                        {/* 4. Net Profit */}
                        <div className={`rounded-xl p-4 border ${isProfitPositive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold uppercase tracking-wider block ${isProfitPositive ? 'text-emerald-300' : 'text-red-300'}`}>
                                    {language === 'en' ? 'Net Profit' : 'চূড়ান্ত নিট লাভ'}
                                </span>
                                {isProfitPositive ? (
                                    <ArrowUpRight size={16} className="text-emerald-400" />
                                ) : (
                                    <ArrowDownRight size={16} className="text-red-400" />
                                )}
                            </div>
                            <p className={`text-2xl font-black mt-1 ${isProfitPositive ? 'text-emerald-300' : 'text-red-300'}`}>
                                ৳{Number(activeAnalytics.net_profit || 0).toLocaleString()}
                            </p>
                            <span className="text-[11px] text-gray-400 mt-1 block">
                                {language === 'en' ? `Gross: ৳${Number(activeAnalytics.gross_profit || 0).toLocaleString()}` : `গ্রস লাভ: ৳${Number(activeAnalytics.gross_profit || 0).toLocaleString()}`}
                            </span>
                        </div>
                    </div>

                    {/* Breakdown Drawer of Ad Expenses in this period */}
                    {showExpenseList && (
                        <div className="mt-5 p-4 rounded-xl bg-black/40 border border-white/10 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                                    {language === 'en' ? 'Ad Spend Entries in this Period' : 'এই সময়সীমার বিজ্ঞাপনী খরচ তালিকা'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsAddExpenseModalOpen(true)}
                                    className="text-xs text-emerald-400 font-semibold hover:underline"
                                >
                                    + {language === 'en' ? 'Add New' : 'নতুন যোগ করুন'}
                                </button>
                            </div>

                            {activeAnalytics.expenses && activeAnalytics.expenses.length > 0 ? (
                                <div className="divide-y divide-white/5 max-h-56 overflow-y-auto pr-1">
                                    {activeAnalytics.expenses.map((exp) => (
                                        <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                                            <div>
                                                <span className="font-semibold text-white">{exp.title || 'Marketing'}</span>
                                                <span className="text-gray-400 text-[11px] ml-2 font-mono">{exp.expense_date}</span>
                                                {exp.notes && <p className="text-[11px] text-gray-400 mt-0.5">{exp.notes}</p>}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold font-mono text-blue-300">
                                                    ৳{Number(exp.amount).toLocaleString()}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExpense(exp.id)}
                                                    className="p-1 rounded text-red-400 hover:bg-red-500/20 transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 py-2">
                                    {language === 'en' ? 'No ad spend recorded for this period.' : 'এই সময়ে কোনো বিজ্ঞাপন খরচ এন্ট্রি নেই।'}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Primary All-Time Stats Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard
                        icon={<ShoppingCart size={24} />}
                        label={language === 'en' ? 'Total Orders' : 'মোট অর্ডার'}
                        value={stats.total_orders}
                        color="blue"
                        href="/dashboard/orders"
                    />
                    <StatCard
                        icon={<TrendingUp size={24} />}
                        label={language === 'en' ? 'Pending Orders' : 'পেন্ডিং অর্ডার'}
                        value={stats.pending_orders}
                        color="yellow"
                        href="/dashboard/orders?status=pending"
                    />
                    <StatCard
                        icon={<Package size={24} />}
                        label={language === 'en' ? 'Delivered Orders' : 'ডেলিভারি সম্পন্ন'}
                        value={stats.delivered_orders}
                        color="green"
                        href="/dashboard/orders?status=delivered"
                    />
                    <StatCard
                        icon={<span className="text-xl font-bold">৳</span>}
                        label={language === 'en' ? 'All-Time Revenue' : 'সর্বমোট আয়'}
                        value={`৳${Number(stats.total_revenue).toLocaleString()}`}
                        color="emerald"
                        href="/dashboard/orders"
                    />
                </div>

                {/* Secondary Stats Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <StatCard
                        icon={<ShoppingBag size={24} />}
                        label={language === 'en' ? 'Total Products' : 'মোট পণ্য'}
                        value={stats.total_products}
                        color="purple"
                        href="/dashboard/products"
                    />
                    <StatCard
                        icon={<ShoppingBag size={24} />}
                        label={language === 'en' ? 'Active Products' : 'সক্রিয় পণ্য'}
                        value={stats.active_products}
                        color="indigo"
                        href="/dashboard/products"
                    />
                    <StatCard
                        icon={<Tag size={24} />}
                        label={language === 'en' ? 'Categories' : 'ক্যাটাগরি'}
                        value={stats.total_categories}
                        color="pink"
                        href="/dashboard/categories"
                    />
                </div>

                {/* Quick Action Shortcuts */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                    {[
                        {
                            label: language === 'en' ? '+ Add Product' : '+ নতুন পণ্য যোগ',
                            href: '/dashboard/products/create',
                            color: 'bg-[#2d6a27] hover:bg-[#23531f]',
                        },
                        {
                            label: language === 'en' ? 'View Orders' : 'অর্ডার দেখুন',
                            href: '/dashboard/orders',
                            color: 'bg-[#8b4513] hover:bg-[#70360e]',
                        },
                        {
                            label: language === 'en' ? 'Customers' : 'কাস্টমার তালিকা',
                            href: '/dashboard/customers',
                            color: 'bg-blue-600 hover:bg-blue-700',
                        },
                        {
                            label: language === 'en' ? 'Site Settings' : 'সাইট সেটিংস',
                            href: '/dashboard/settings/general',
                            color: 'bg-gray-800 hover:bg-gray-900',
                        },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${link.color} flex items-center justify-center rounded-xl py-3 text-sm font-bold text-white transition shadow-xs active:scale-95 text-center px-2`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Recent Orders Table */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-xs overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
                        <h2 className="font-bold text-gray-900">
                            {language === 'en' ? 'Recent Orders' : 'সাম্প্রতিক অর্ডার'}
                        </h2>
                        <Link href="/dashboard/orders" className="text-xs font-bold text-[#2d6a27] hover:underline">
                            {language === 'en' ? 'View All Orders →' : 'সব দেখুন →'}
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-5 py-3.5">{language === 'en' ? 'Order Number' : 'অর্ডার নম্বর'}</th>
                                    <th className="px-5 py-3.5">{language === 'en' ? 'Customer' : 'গ্রাহক'}</th>
                                    <th className="px-5 py-3.5 hidden md:table-cell">{language === 'en' ? 'Items' : 'পণ্য'}</th>
                                    <th className="px-5 py-3.5">{t.total}</th>
                                    <th className="px-5 py-3.5">{t.status}</th>
                                    <th className="px-5 py-3.5 hidden lg:table-cell">{t.date}</th>
                                    <th className="px-5 py-3.5 text-right">{t.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                                            {language === 'en' ? 'No orders placed yet.' : 'এখনো কোনো অর্ডার নেই।'}
                                        </td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/70 transition">
                                            <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#2d6a27]">
                                                {order.order_number}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="font-semibold text-gray-900">{order.customer_name}</p>
                                                <p className="text-xs text-gray-400">{order.customer_phone}</p>
                                            </td>
                                            <td className="px-5 py-3.5 hidden md:table-cell text-gray-600 text-xs">
                                                {order.items_count} {language === 'en' ? 'items' : 'টি'}
                                            </td>
                                            <td className="px-5 py-3.5 font-bold text-gray-900">
                                                ৳{Number(order.total).toLocaleString()}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                        STATUS_STYLES[order.status_color] ?? STATUS_STYLES.gray
                                                    }`}
                                                >
                                                    {order.status_label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 hidden lg:table-cell text-gray-500 text-xs">
                                                {order.created_at}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <Link
                                                    href={`/dashboard/orders/${order.id}`}
                                                    className="inline-block rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-[#2d6a27] hover:text-white transition shadow-2xs"
                                                >
                                                    {language === 'en' ? 'View' : 'দেখুন'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Ad Expense Modal */}
            {isAddExpenseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Megaphone className="text-[#2d6a27]" size={20} />
                                <h3 className="font-bold text-gray-900 text-base">
                                    {language === 'en' ? 'Add Ad / Marketing Expense' : 'বিজ্ঞাপনী খরচ যোগ করুন'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddExpenseModalOpen(false)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    {language === 'en' ? 'Date' : 'তারিখ'} *
                                </label>
                                <input
                                    type="date"
                                    value={expenseData.expense_date}
                                    onChange={(e) => setExpenseData('expense_date', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#2d6a27] focus:ring-2 focus:ring-[#2d6a27]/20"
                                    required
                                />
                                {expenseErrors.expense_date && (
                                    <p className="text-xs text-red-500 mt-1">{expenseErrors.expense_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    {language === 'en' ? 'Amount (BDT)' : 'টাকার পরিমাণ'} *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">৳</span>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0.01"
                                        value={expenseData.amount}
                                        onChange={(e) => setExpenseData('amount', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full rounded-xl border border-gray-200 pl-8 pr-3.5 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-[#2d6a27] focus:ring-2 focus:ring-[#2d6a27]/20"
                                        required
                                    />
                                </div>
                                {expenseErrors.amount && (
                                    <p className="text-xs text-red-500 mt-1">{expenseErrors.amount}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    {language === 'en' ? 'Campaign / Platform' : 'ক্যাম্পেইন বা প্ল্যাটফর্ম'}
                                </label>
                                <input
                                    type="text"
                                    value={expenseData.title}
                                    onChange={(e) => setExpenseData('title', e.target.value)}
                                    placeholder="Facebook Ads / TikTok / Google"
                                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#2d6a27] focus:ring-2 focus:ring-[#2d6a27]/20"
                                />
                                {expenseErrors.title && (
                                    <p className="text-xs text-red-500 mt-1">{expenseErrors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    {language === 'en' ? 'Notes (Optional)' : 'নোট (ঐচ্ছিক)'}
                                </label>
                                <textarea
                                    value={expenseData.notes}
                                    onChange={(e) => setExpenseData('notes', e.target.value)}
                                    rows={2}
                                    placeholder="ক্যাম্পেইন ডিটেইলস..."
                                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#2d6a27] focus:ring-2 focus:ring-[#2d6a27]/20"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddExpenseModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
                                >
                                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={expenseProcessing}
                                    className="px-5 py-2 bg-[#2d6a27] hover:bg-[#23531e] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                                >
                                    {expenseProcessing
                                        ? (language === 'en' ? 'Saving...' : 'সেভ হচ্ছে...')
                                        : (language === 'en' ? 'Save Expense' : 'খরচ সেভ করুন')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    color: string;
    href: string;
}) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        green: 'bg-green-50 text-green-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        pink: 'bg-pink-50 text-pink-600',
    };

    return (
        <Link
            href={href}
            className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs transition hover:shadow-md hover:border-gray-200 block"
        >
            <div
                className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                    colorMap[color] ?? 'bg-gray-50 text-gray-600'
                }`}
            >
                {icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wider">{label}</p>
        </Link>
    );
}
