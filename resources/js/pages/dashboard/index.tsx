import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Package, ShoppingBag, ShoppingCart, Tag, TrendingUp, Users, DollarSign, Wallet, Megaphone, Edit3, Check, X, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

export default function DashboardIndex({ stats, recentOrders }: Props) {
    const { t, language } = useAdminLanguage();
    const [isEditingMarketing, setIsEditingMarketing] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        marketing_cost: stats.marketing_cost || 0,
    });

    const handleUpdateMarketingCost = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dashboard/settings/marketing-cost', {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingMarketing(false);
            },
        });
    };

    const isProfitPositive = (stats.net_profit ?? 0) >= 0;

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
                </div>

                {/* Profit & Financial Analytics Banner */}
                <div className="rounded-2xl bg-gradient-to-br from-emerald-900 via-gray-900 to-gray-950 p-6 text-white shadow-lg border border-emerald-800/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                                    ৳
                                </span>
                                <h2 className="text-lg font-bold text-white tracking-wide">
                                    {language === 'en' ? 'Financial & Profit Analytics' : 'আর্থিক হিসাব ও নিট লাভ এনালাইটিক্স'}
                                </h2>
                            </div>
                            <p className="text-xs text-emerald-200/70 mt-1">
                                {language === 'en'
                                    ? 'Calculated based on delivered orders, product wholesale cost (COGS), and marketing expense.'
                                    : 'ডেলিভারি সম্পন্ন হওয়া অর্ডার, পণ্যের পাইকারি খরচ (COGS) এবং মার্কেটিং ব্যয়ের ভিত্তিতে প্রস্তুতকৃত।'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setData('marketing_cost', stats.marketing_cost || 0);
                                    setIsEditingMarketing(!isEditingMarketing);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-100 transition border border-white/10"
                            >
                                <Edit3 size={13} />
                                {language === 'en' ? 'Set Marketing Cost' : 'মার্কেটিং খরচ আপডেট'}
                            </button>
                        </div>
                    </div>

                    {/* Marketing Cost Edit Form (if toggled) */}
                    {isEditingMarketing && (
                        <form
                            onSubmit={handleUpdateMarketingCost}
                            className="mt-4 p-4 rounded-xl bg-black/40 border border-emerald-500/30 flex flex-wrap items-center gap-3 animate-in fade-in duration-200"
                        >
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-medium text-emerald-200 mb-1">
                                    {language === 'en' ? 'Total Marketing / Ad Spend (BDT)' : 'মোট মার্কেটিং বা বিজ্ঞাপন খরচ (টাকা)'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">৳</span>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        value={data.marketing_cost}
                                        onChange={(e) => setData('marketing_cost', parseFloat(e.target.value) || 0)}
                                        className="w-full bg-gray-900 border border-emerald-500/50 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                {errors.marketing_cost && (
                                    <p className="text-xs text-red-400 mt-1">{errors.marketing_cost}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 pt-5">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                                >
                                    {processing ? (language === 'en' ? 'Saving...' : 'সেভ হচ্ছে...') : (language === 'en' ? 'Save Cost' : 'খরচ সেভ করুন')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        reset();
                                        setIsEditingMarketing(false);
                                    }}
                                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition"
                                >
                                    {language === 'en' ? 'Cancel' : 'বাতিল'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Financial Metric Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                        {/* Delivered Revenue */}
                        <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                                {language === 'en' ? 'Delivered Revenue' : 'ডেলিভারি রাজস্ব'}
                            </span>
                            <p className="text-2xl font-black text-emerald-400 mt-1">
                                ৳{Number(stats.total_revenue || 0).toLocaleString()}
                            </p>
                            <span className="text-[11px] text-gray-400 mt-1 block">
                                {stats.delivered_orders} {language === 'en' ? 'delivered orders' : 'টি সফল ডেলিভারি'}
                            </span>
                        </div>

                        {/* Cost of Goods Sold */}
                        <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                                {language === 'en' ? 'Product Cost (COGS)' : 'পণ্যের ক্রয়/পাইকারি খরচ'}
                            </span>
                            <p className="text-2xl font-black text-amber-300 mt-1">
                                ৳{Number(stats.total_cogs || 0).toLocaleString()}
                            </p>
                            <span className="text-[11px] text-gray-400 mt-1 block">
                                {language === 'en' ? 'Based on product cost price' : 'পণ্যের কস্ট প্রাইস থেকে'}
                            </span>
                        </div>

                        {/* Marketing Spend */}
                        <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                                {language === 'en' ? 'Marketing Cost' : 'মার্কেটিং খরচ'}
                            </span>
                            <p className="text-2xl font-black text-blue-300 mt-1">
                                ৳{Number(stats.marketing_cost || 0).toLocaleString()}
                            </p>
                            <span className="text-[11px] text-gray-400 mt-1 block">
                                {language === 'en' ? 'Ad campaigns & promotion' : 'বিজ্ঞাপন ও প্রচারণা'}
                            </span>
                        </div>

                        {/* Net Profit */}
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
                                ৳{Number(stats.net_profit || 0).toLocaleString()}
                            </p>
                            <span className="text-[11px] text-gray-400 mt-1 block">
                                {language === 'en' ? `Gross: ৳${Number(stats.gross_profit || 0).toLocaleString()}` : `গ্রস লাভ: ৳${Number(stats.gross_profit || 0).toLocaleString()}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Primary Stats Grid */}
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
                        label={language === 'en' ? 'Total Revenue' : 'মোট আয়'}
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
                            label: language === 'en' ? 'Coupons' : 'কুপন ব্যবস্থাপনা',
                            href: '/dashboard/coupons',
                            color: 'bg-orange-500 hover:bg-orange-600',
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
