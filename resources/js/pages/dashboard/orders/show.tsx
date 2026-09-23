import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrderItem {
    id: number;
    product_name: string;
    variant_name?: string | null;
    thumbnail?: string | null;
    price: number;
    quantity: number;
    total: number;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string | null;
    division: string;
    district: string;
    upazila?: string | null;
    address: string;
    delivery_area: string;
    delivery_charge: number;
    subtotal: number;
    coupon_code?: string | null;
    discount: number;
    total: number;
    status: string;
    status_label: string;
    status_color: string;
    payment_method: string;
    notes?: string | null;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    order: Order;
}

const STATUS_STYLES: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function OrderShow({ order }: Props) {
    const { t, language } = useAdminLanguage();
    const [status, setStatus] = useState(order.status);
    const [updating, setUpdating] = useState(false);

    const statusOptions = [
        { value: 'pending', label: t.pending },
        { value: 'confirmed', label: t.confirmed },
        { value: 'processing', label: t.processingOrders },
        { value: 'shipped', label: t.shipped },
        { value: 'delivered', label: t.delivered },
        { value: 'cancelled', label: t.cancelled },
    ];

    const handleStatusUpdate = () => {
        if (status === order.status) return;
        setUpdating(true);
        router.patch(`/dashboard/orders/${order.id}/status`, { status }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(language === 'en' ? 'Order status updated successfully!' : 'স্ট্যাটাস আপডেট হয়েছে!');
                setUpdating(false);
            },
            onError: () => {
                toast.error(language === 'en' ? 'Failed to update order status.' : 'সমস্যা হয়েছে।');
                setUpdating(false);
            },
        });
    };

    const handleDelete = () => {
        if (!confirm(language === 'en' ? 'Are you sure you want to delete this order?' : 'এই অর্ডার মুছে ফেলবেন?')) return;
        router.delete(`/dashboard/orders/${order.id}`, {
            onSuccess: () => toast.success(language === 'en' ? 'Order deleted successfully.' : 'অর্ডার মুছে ফেলা হয়েছে।'),
        });
    };

    return (
        <>
            <Head title={`${order.order_number} — ${t.orderDetails}`} />
            <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/orders"
                            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition"
                        >
                            <ChevronLeft size={16} />
                            <span>{language === 'en' ? 'Back to Orders' : 'অর্ডার তালিকা'}</span>
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">
                                {order.order_number}
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">{order.created_at}</p>
                        </div>
                    </div>

                    <span className={`self-start sm:self-auto rounded-full border px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLES[order.status_color] ?? STATUS_STYLES.gray}`}>
                        {order.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Items */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs">
                            <h2 className="mb-4 font-bold text-gray-900 text-base">{t.orderItems}</h2>
                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                                            {item.thumbnail ? (
                                                <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full bg-gray-100 flex items-center justify-center text-xl">📦</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">{item.product_name}</p>
                                            {item.variant_name && <p className="text-xs text-gray-500">{item.variant_name}</p>}
                                            <p className="text-xs text-gray-500 mt-0.5">৳{Number(item.price).toLocaleString()} × {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-gray-900 text-sm">৳{Number(item.total).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 border-t border-gray-100 pt-4 space-y-2 text-xs sm:text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>{t.subtotal}</span>
                                    <span>৳{Number(order.subtotal).toLocaleString()}</span>
                                </div>
                                {Number(order.discount) > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-semibold">
                                        <span>{t.discount} {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                                        <span>-৳{Number(order.discount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>
                                        {t.deliveryCharge} (
                                        {order.delivery_area === 'inside_dhaka'
                                            ? (language === 'en' ? 'Inside Dhaka' : 'ঢাকার ভেতরে')
                                            : (language === 'en' ? 'Outside Dhaka' : 'ঢাকার বাইরে')}
                                        )
                                    </span>
                                    <span>৳{Number(order.delivery_charge).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                                    <span>{t.total}</span>
                                    <span className="text-[#2d6a27]">৳{Number(order.total).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs">
                            <h2 className="mb-4 font-bold text-gray-900 text-base">{t.customerInfo}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase font-bold mb-0.5">{t.name}</p>
                                    <p className="font-semibold text-gray-900">{order.customer_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase font-bold mb-0.5">{t.phone}</p>
                                    <a href={`tel:${order.customer_phone}`} className="font-semibold text-[#2d6a27] hover:underline font-mono">
                                        {order.customer_phone}
                                    </a>
                                </div>
                                {order.customer_email && (
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase font-bold mb-0.5">{t.email}</p>
                                        <p className="font-semibold text-gray-900">{order.customer_email}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-400 text-xs uppercase font-bold mb-0.5">{t.division}</p>
                                    <p className="font-semibold text-gray-900">{order.division}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase font-bold mb-0.5">{t.district}</p>
                                    <p className="font-semibold text-gray-900">{order.district}</p>
                                </div>
                                {order.upazila && (
                                    <div>
                                        <p className="text-gray-400 text-xs uppercase font-bold mb-0.5">{t.upazila}</p>
                                        <p className="font-semibold text-gray-900">{order.upazila}</p>
                                    </div>
                                )}
                                <div className="sm:col-span-2">
                                    <p className="text-gray-400 text-xs uppercase font-bold mb-0.5">{t.address}</p>
                                    <p className="font-medium text-gray-800">{order.address}</p>
                                </div>
                                {order.notes && (
                                    <div className="sm:col-span-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <p className="text-gray-400 text-xs uppercase font-bold mb-0.5">{t.notes}</p>
                                        <p className="text-gray-700 italic">{order.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions Side Column */}
                    <div className="space-y-6">
                        {/* Status Update Card */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
                            <h2 className="mb-3 font-bold text-gray-900 text-sm uppercase tracking-wider">
                                {t.updateStatus}
                            </h2>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="mb-3 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:border-[#2d6a27] focus:outline-none bg-white"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={updating || status === order.status}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d6a27] py-2.5 font-bold text-xs sm:text-sm text-white hover:bg-[#23531f] disabled:opacity-50 transition shadow-xs"
                            >
                                {updating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" /> {t.processing}
                                    </>
                                ) : (
                                    t.updateStatus
                                )}
                            </button>
                        </div>

                        {/* Payment Card */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs text-xs sm:text-sm space-y-2">
                            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-2">
                                {t.paymentMethod}
                            </h2>
                            <div className="flex justify-between text-gray-600">
                                <span>{language === 'en' ? 'Method' : 'পদ্ধতি'}</span>
                                <span className="font-semibold text-gray-900">Cash on Delivery (COD)</span>
                            </div>
                            <div className="flex justify-between text-gray-600 border-t border-gray-100 pt-2 font-bold">
                                <span>{t.total}</span>
                                <span className="text-[#2d6a27] text-sm">৳{Number(order.total).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Delete Order Button */}
                        <button
                            onClick={handleDelete}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                        >
                            <Trash2 size={15} />
                            <span>{language === 'en' ? 'Delete Order' : 'অর্ডার মুছুন'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

