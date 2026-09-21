import { Head, Link } from '@inertiajs/react';
import { Package, ShoppingBag, ShoppingCart, Tag, TrendingUp, Users } from 'lucide-react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface Stats {
    total_orders: number;
    pending_orders: number;
    confirmed_orders: number;
    delivered_orders: number;
    total_revenue: number;
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
