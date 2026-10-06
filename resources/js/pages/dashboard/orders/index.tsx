import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, Loader2, Search, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

const STATUS_COLOR_MAP: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-800 border-yellow-300 focus:ring-yellow-400',
    confirmed: 'bg-orange-50 text-orange-800 border-orange-300 focus:ring-orange-400',
    processing: 'bg-purple-50 text-purple-800 border-purple-300 focus:ring-purple-400',
    shipped: 'bg-blue-50 text-blue-800 border-blue-300 focus:ring-blue-400',
    delivered: 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-400',
    cancelled: 'bg-rose-50 text-rose-800 border-rose-300 focus:ring-rose-400',
};

export default function OrdersIndex({ orders, filters, statusCounts }: Props) {
    const { t, language } = useAdminLanguage();
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkStatus, setBulkStatus] = useState<string>('');
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

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

    const handleToggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const isAllSelected = orders.data.length > 0 && selectedIds.length === orders.data.length;

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(orders.data.map((o) => o.id));
        }
    };

    const handleInlineStatusChange = (orderId: number, newStatus: string) => {
        setUpdatingOrderId(orderId);
        router.patch(`/dashboard/orders/${orderId}/status`, { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(language === 'en' ? 'Order status updated' : 'অর্ডার স্ট্যাটাস সফলভাবে আপডেট হয়েছে');
            },
            onError: () => {
                toast.error(language === 'en' ? 'Failed to update order status' : 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
            },
            onFinish: () => setUpdatingOrderId(null),
        });
    };

    const handleBulkSubmit = () => {
        if (!bulkStatus || selectedIds.length === 0) return;
        setIsBulkSubmitting(true);
        router.post('/dashboard/orders/bulk-status', {
            order_ids: selectedIds,
            status: bulkStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                const count = selectedIds.length;
                setSelectedIds([]);
                setBulkStatus('');
                toast.success(
                    language === 'en'
                        ? `${count} orders updated successfully`
                        : `${count}টি অর্ডারের স্ট্যাটাস সফলভাবে আপডেট হয়েছে`
                );
            },
            onError: () => {
                toast.error(language === 'en' ? 'Bulk update failed' : 'বাল্ক আপডেট করতে সমস্যা হয়েছে');
            },
            onFinish: () => setIsBulkSubmitting(false),
        });
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

                {/* Bulk Action Bar (Visible when orders selected) */}
                {selectedIds.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#2d6a27]/10 border border-[#2d6a27]/30 p-3 sm:p-4 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d6a27] text-white text-xs font-bold shadow-xs">
                                {selectedIds.length}
                            </span>
                            <span className="font-bold text-gray-900">
                                {language === 'en'
                                    ? `${selectedIds.length} orders selected`
                                    : `${selectedIds.length}টি অর্ডার সিলেক্ট করা হয়েছে`}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <select
                                value={bulkStatus}
                                onChange={(e) => setBulkStatus(e.target.value)}
                                className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-2xs focus:border-[#2d6a27] focus:outline-none"
                            >
                                <option value="">{language === 'en' ? '-- Select Status --' : '-- স্ট্যাটাস নির্বাচন করুন --'}</option>
                                <option value="pending">Pending (পেন্ডিং)</option>
                                <option value="confirmed">Confirmed (কনফার্মড)</option>
                                <option value="processing">Processing (প্রসেসিং)</option>
                                <option value="shipped">Shipped (শিপিং/কুরিয়ার)</option>
                                <option value="delivered">Delivered (ডেলিভার্ড)</option>
                                <option value="cancelled">Cancelled (বাতিল)</option>
                            </select>

                            <button
                                type="button"
                                onClick={handleBulkSubmit}
                                disabled={!bulkStatus || isBulkSubmitting}
                                className="flex items-center gap-1.5 rounded-xl bg-[#2d6a27] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#23531f] disabled:opacity-50 transition cursor-pointer"
                            >
                                {isBulkSubmitting && <Loader2 size={13} className="animate-spin" />}
                                {language === 'en' ? 'Update Selected' : 'বাল্ক স্ট্যাটাস আপডেট করুন'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 shadow-2xs transition cursor-pointer"
                            >
                                {language === 'en' ? 'Deselect All' : 'বাতিল'}
                            </button>
                        </div>
                    </div>
                )}

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
                                    <th className="w-10 px-4 py-3.5 text-center">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 rounded border-gray-300 accent-[#2d6a27] cursor-pointer"
                                            title={language === 'en' ? 'Select All on this page' : 'সবগুলো সিলেক্ট করুন'}
                                        />
                                    </th>
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
                                        <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                                            {language === 'en' ? 'No orders found matching your filters.' : 'কোনো অর্ডার পাওয়া যায়নি।'}
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((order) => {
                                        const isSelected = selectedIds.includes(order.id);
                                        const isUpdating = updatingOrderId === order.id;

                                        return (
                                            <tr
                                                key={order.id}
                                                className={`transition-colors ${
                                                    isSelected ? 'bg-[#2d6a27]/5' : 'hover:bg-gray-50/60'
                                                }`}
                                            >
                                                <td className="w-10 px-4 py-3.5 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleSelect(order.id)}
                                                        className="h-4 w-4 rounded border-gray-300 accent-[#2d6a27] cursor-pointer"
                                                    />
                                                </td>
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

                                                {/* Interactive Inline Status Dropdown */}
                                                <td className="px-4 py-3.5">
                                                    <div className="relative inline-flex items-center">
                                                        <select
                                                            value={order.status}
                                                            disabled={isUpdating}
                                                            onChange={(e) => handleInlineStatusChange(order.id, e.target.value)}
                                                            className={`cursor-pointer rounded-full pl-3 pr-7 py-1 text-xs font-bold capitalize border transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-offset-1 appearance-none ${
                                                                STATUS_COLOR_MAP[order.status] ?? 'bg-gray-100 text-gray-700 border-gray-200'
                                                            } ${isUpdating ? 'opacity-50 cursor-wait' : 'hover:opacity-90'}`}
                                                            title={language === 'en' ? 'Change status directly' : 'সরাসরি স্ট্যাটাস পরিবর্তন করুন'}
                                                        >
                                                            <option value="pending" className="bg-white text-gray-800 font-normal">Pending (পেন্ডিং)</option>
                                                            <option value="confirmed" className="bg-white text-gray-800 font-normal">Confirmed (কনফার্মড)</option>
                                                            <option value="processing" className="bg-white text-gray-800 font-normal">Processing (প্রসেসিং)</option>
                                                            <option value="shipped" className="bg-white text-gray-800 font-normal">Shipped (শিপিং/কুরিয়ার)</option>
                                                            <option value="delivered" className="bg-white text-gray-800 font-normal">Delivered (ডেলিভার্ড)</option>
                                                            <option value="cancelled" className="bg-white text-gray-800 font-normal">Cancelled (বাতিল)</option>
                                                        </select>
                                                        <span className="pointer-events-none absolute right-2 text-current opacity-70">
                                                            {isUpdating ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : (
                                                                <ChevronDown size={12} />
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3.5 hidden lg:table-cell text-gray-500 text-xs">
                                                    {order.created_at}
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <Link
                                                        href={`/dashboard/orders/${order.id}`}
                                                        className="inline-block rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-[#2d6a27] hover:text-white transition whitespace-nowrap shadow-2xs"
                                                    >
                                                        {language === 'en' ? 'View Details' : 'বিস্তারিত'}
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
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

