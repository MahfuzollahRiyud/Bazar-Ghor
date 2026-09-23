import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Head, Link, router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    district: string;
    delivery_area: string;
    subtotal: number;
    discount: number;
    delivery_charge: number;
    total: number;
    status: string;
    status_label: string;
    status_color: string;
    items_count: number;
    created_at: string;
}

interface Paginated {
    data: Order[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface StatusCounts {
    all: number;
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
}

interface Filters {
    status?: string;
    search?: string;
}

interface Props {
    orders: Paginated;
    filters: Filters;
    statusCounts: StatusCounts;
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

export default function OrdersIndex({ orders, filters, statusCounts }: Props) {
    const { t, language } = useAdminLanguage();
    const [search, setSearch] = useState(filters.search ?? '');

    const statusTabs = [
        { key: '', label: t.all, countKey: 'all' },
        { key: 'pending', label: t.pending, countKey: 'pending' },
        { key: 'confirmed', label: t.confirmed, countKey: 'confirmed' },
        { key: 'processing', label: t.processingOrders, countKey: 'processing' },
        { key: 'shipped', label: t.shipped, countKey: 'shipped' },
        { key: 'delivered', label: t.delivered, countKey: 'delivered' },
        { key: 'cancelled', label: t.cancelled, countKey: 'cancelled' },
    ];

    const applyFilter = (newFilters: Partial<Filters>) => {
        router.get('/dashboard/orders', { ...filters, ...newFilters }, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search });
    };

    return (
        <>
            <Head title={`${t.orders} — Bazar Ghor Admin`} />
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t.ordersManagement}</h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                            {language === 'en'
                                ? `Showing ${orders.total} total orders`
                                : `মোট ${orders.total}টি অর্ডার পাওয়া গেছে`}
                        </p>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap gap-2">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => applyFilter({ status: tab.key || undefined, search: undefined })}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition ${
                                (filters.status ?? '') === tab.key
                                    ? 'bg-[#2d6a27] text-white font-bold'
                                    : 'bg-white text-gray-600 shadow-2xs border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                    (filters.status ?? '') === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                {statusCounts[tab.countKey as keyof StatusCounts] ?? 0}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={language === 'en' ? 'Search order #, customer name, phone...' : 'অর্ডার নম্বর, নাম বা ফোন...'}
                            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-xs sm:text-sm focus:border-[#2d6a27] focus:outline-none bg-white"
                        />
                    </div>
                    <button
                        type="submit"
                        className="rounded-xl bg-[#2d6a27] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#23531f] transition"
                    >
                        {t.search}
                    </button>
                    {filters.search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                applyFilter({ search: undefined });
                            }}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-gray-500 hover:bg-gray-50 bg-white"
                        >
                            <X size={16} />
                        </button>
                    )}
                </form>

                {/* Table */}
                <div className="rounded-2xl bg-white shadow-xs border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead>
                                <tr className="border-b bg-gray-50/70 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <th className="px-4 py-3.5">{t.order}</th>
                                    <th className="px-4 py-3.5">{t.customer}</th>
                                    <th className="px-4 py-3.5 hidden md:table-cell">{t.district}</th>
                                    <th className="px-4 py-3.5 hidden md:table-cell">{t.items}</th>
                                    <th className="px-4 py-3.5">{t.total}</th>
                                    <th className="px-4 py-3.5">{t.status}</th>
                                    <th className="px-4 py-3.5 hidden lg:table-cell">{t.date}</th>
                                    <th className="px-4 py-3.5 text-right">{t.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                                            {language === 'en' ? 'No orders found matching your filters.' : 'কোনো অর্ডার পাওয়া যায়নি।'}
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-900">
                                                {order.order_number}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="font-semibold text-gray-900 text-xs">{order.customer_name}</p>
                                                <p className="text-xs text-gray-500 font-mono">{order.customer_phone}</p>
                                            </td>
                                            <td className="px-4 py-3.5 hidden md:table-cell text-gray-700 text-xs">
                                                {order.district}
                                                <span className="text-gray-400 ml-1">
                                                    {order.delivery_area === 'inside_dhaka'
                                                        ? (language === 'en' ? '(Dhaka)' : '(ঢাকা)')
                                                        : (language === 'en' ? '(Outside)' : '(বাইরে)')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 hidden md:table-cell text-gray-700 text-xs">
                                                {order.items_count} {language === 'en' ? 'pcs' : 'টি'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="font-bold text-[#2d6a27] text-xs sm:text-sm">
                                                    ৳{Number(order.total).toLocaleString()}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLES[order.status_color] ?? STATUS_STYLES.gray}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 hidden lg:table-cell text-gray-500 text-xs">
                                                {order.created_at}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <Link
                                                    href={`/dashboard/orders/${order.id}`}
                                                    className="inline-block rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-[#2d6a27] hover:text-white transition whitespace-nowrap"
                                                >
                                                    {language === 'en' ? 'View Details' : 'বিস্তারিত'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {orders.last_page > 1 && (
                        <div className="border-t border-gray-100 px-4 py-3 flex justify-center gap-2">
                            {orders.links.map((link, i) =>
                                link.url ? (
                                    <button
                                        key={i}
                                        onClick={() => router.get(link.url!)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                                            link.active ? 'bg-[#2d6a27] text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="rounded-lg px-3 py-1.5 text-xs text-gray-400"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

