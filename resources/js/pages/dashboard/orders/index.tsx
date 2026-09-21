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

interface StatusCounts { all: number; pending: number; confirmed: number; processing: number; shipped: number; delivered: number; cancelled: number; }
interface Filters { status?: string; search?: string; }
interface Props { orders: Paginated; filters: Filters; statusCounts: StatusCounts; }

const STATUS_STYLES: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
};

const STATUS_TABS = [
    { key: '', label: 'সব', countKey: 'all' },
    { key: 'pending', label: 'অপেক্ষায়', countKey: 'pending' },
    { key: 'confirmed', label: 'নিশ্চিত', countKey: 'confirmed' },
    { key: 'processing', label: 'প্রস্তুতি', countKey: 'processing' },
    { key: 'shipped', label: 'পাঠানো', countKey: 'shipped' },
    { key: 'delivered', label: 'পৌঁছেছে', countKey: 'delivered' },
    { key: 'cancelled', label: 'বাতিল', countKey: 'cancelled' },
];

export default function OrdersIndex({ orders, filters, statusCounts }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (newFilters: Partial<Filters>) => {
        router.get('/dashboard/orders', { ...filters, ...newFilters }, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search });
    };

    return (
        <>
            <Head title="অর্ডার — Bazar Ghor Admin" />
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">অর্ডার ব্যবস্থাপনা</h1>
                        <p className="text-gray-500 text-sm mt-1">মোট {orders.total}টি অর্ডার</p>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => applyFilter({ status: tab.key || undefined, search: undefined })}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                                (filters.status ?? '') === tab.key
                                    ? 'bg-[#2d6a27] text-white'
                                    : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'
                            }`}
                        >
                            {tab.label}
                            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${(filters.status ?? '') === tab.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                                {statusCounts[tab.countKey as keyof StatusCounts]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="অর্ডার নম্বর, নাম বা ফোন..."
                            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-[#2d6a27] focus:outline-none" />
                    </div>
                    <button type="submit" className="rounded-xl bg-[#2d6a27] px-4 py-2 text-sm font-medium text-white hover:bg-[#3d8f33]">খুঁজুন</button>
                    {filters.search && (
                        <button type="button" onClick={() => { setSearch(''); applyFilter({ search: undefined }); }} className="rounded-xl border border-gray-200 px-3 py-2 text-gray-500 hover:bg-gray-50"><X size={16} /></button>
                    )}
                </form>

                {/* Table */}
                <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">অর্ডার</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">গ্রাহক</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">জেলা</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">পণ্য</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">মোট</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">স্ট্যাটাস</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">তারিখ</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">কোনো অর্ডার পাওয়া যায়নি</td></tr>
                                ) : (
                                    orders.data.map((order) => (
                                        <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{order.order_number}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800 text-xs">{order.customer_name}</p>
                                                <p className="text-xs text-gray-400">{order.customer_phone}</p>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs">
                                                {order.district}
                                                <p className="text-gray-400">{order.delivery_area === 'inside_dhaka' ? '(ঢাকা)' : '(বাইরে)'}</p>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell text-gray-600 text-xs">{order.items_count}টি</td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-[#2d6a27] text-sm">৳{Number(order.total).toLocaleString()}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.status_color] ?? STATUS_STYLES.gray}`}>
                                                    {order.status_label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{order.created_at}</td>
                                            <td className="px-4 py-3">
                                                <Link href={`/dashboard/orders/${order.id}`} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 whitespace-nowrap">
                                                    বিস্তারিত
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {orders.last_page > 1 && (
                        <div className="border-t px-4 py-3 flex justify-center gap-2">
                            {orders.links.map((link, i) =>
                                link.url ? (
                                    <button key={i} onClick={() => router.get(link.url!)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${link.active ? 'bg-[#2d6a27] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <span key={i} className="rounded-lg px-3 py-1.5 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
