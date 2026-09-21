import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Loader2 } from 'lucide-react';
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

interface Props { order: Order; }

const STATUS_OPTIONS = [
    { value: 'pending', label: 'অপেক্ষায়' },
    { value: 'confirmed', label: 'নিশ্চিত' },
    { value: 'processing', label: 'প্রস্তুতি' },
    { value: 'shipped', label: 'পাঠানো হয়েছে' },
    { value: 'delivered', label: 'পৌঁছেছে' },
    { value: 'cancelled', label: 'বাতিল' },
];

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
    const [status, setStatus] = useState(order.status);
    const [updating, setUpdating] = useState(false);

    const handleStatusUpdate = () => {
        if (status === order.status) return;
        setUpdating(true);
        router.patch(`/dashboard/orders/${order.id}/status`, { status }, {
            onSuccess: () => toast.success('স্ট্যাটাস আপডেট হয়েছে!'),
            onError: () => toast.error('সমস্যা হয়েছে।'),
            onFinish: () => setUpdating(false),
        });
    };

    const handleDelete = () => {
        if (!confirm('এই অর্ডার মুছে ফেলবেন?')) return;
        router.delete(`/dashboard/orders/${order.id}`, {
            onSuccess: () => toast.success('অর্ডার মুছে ফেলা হয়েছে।'),
        });
    };

    return (
        <>
            <Head title={`অর্ডার ${order.order_number}`} />
            <div className="p-6 max-w-5xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/dashboard/orders" className="flex items-center gap-1 text-gray-400 hover:text-gray-600">
                        <ChevronLeft size={18} /> অর্ডার তালিকা
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{order.order_number}</h1>
                        <p className="text-xs text-gray-400">{order.created_at}</p>
                    </div>
                    <span className={`ml-auto rounded-full border px-3 py-1 text-sm font-semibold ${STATUS_STYLES[order.status_color] ?? STATUS_STYLES.gray}`}>
                        {order.status_label}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Items */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 font-bold text-gray-800">অর্ডারকৃত পণ্য</h2>
                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                                            {item.thumbnail ? <img src={item.thumbnail} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gray-100 flex items-center justify-center text-xl">📦</div>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 text-sm">{item.product_name}</p>
                                            {item.variant_name && <p className="text-xs text-gray-400">{item.variant_name}</p>}
                                            <p className="text-xs text-gray-500">৳{Number(item.price).toLocaleString()} × {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-gray-800">৳{Number(item.total).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 border-t pt-4 space-y-1.5 text-sm">
                                <div className="flex justify-between text-gray-600"><span>পণ্যের মূল্য</span><span>৳{Number(order.subtotal).toLocaleString()}</span></div>
                                {Number(order.discount) > 0 && <div className="flex justify-between text-green-600"><span>ছাড় {order.coupon_code ? `(${order.coupon_code})` : ''}</span><span>-৳{Number(order.discount).toLocaleString()}</span></div>}
                                <div className="flex justify-between text-gray-600"><span>ডেলিভারি ({order.delivery_area === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'})</span><span>৳{Number(order.delivery_charge).toLocaleString()}</span></div>
                                <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-1.5"><span>সর্বমোট</span><span className="text-[#2d6a27]">৳{Number(order.total).toLocaleString()}</span></div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 font-bold text-gray-800">গ্রাহকের তথ্য</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-gray-400 text-xs mb-0.5">নাম</p><p className="font-medium text-gray-800">{order.customer_name}</p></div>
                                <div><p className="text-gray-400 text-xs mb-0.5">ফোন</p><a href={`tel:${order.customer_phone}`} className="font-medium text-[#2d6a27] hover:underline">{order.customer_phone}</a></div>
                                {order.customer_email && <div><p className="text-gray-400 text-xs mb-0.5">ইমেইল</p><p className="font-medium text-gray-800">{order.customer_email}</p></div>}
                                <div><p className="text-gray-400 text-xs mb-0.5">বিভাগ</p><p className="font-medium text-gray-800">{order.division}</p></div>
                                <div><p className="text-gray-400 text-xs mb-0.5">জেলা</p><p className="font-medium text-gray-800">{order.district}</p></div>
                                {order.upazila && <div><p className="text-gray-400 text-xs mb-0.5">উপজেলা</p><p className="font-medium text-gray-800">{order.upazila}</p></div>}
                                <div className="col-span-2"><p className="text-gray-400 text-xs mb-0.5">ঠিকানা</p><p className="font-medium text-gray-800">{order.address}</p></div>
                                {order.notes && <div className="col-span-2"><p className="text-gray-400 text-xs mb-0.5">নোট</p><p className="text-gray-700 italic">{order.notes}</p></div>}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-6">
                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="mb-4 font-bold text-gray-800">স্ট্যাটাস আপডেট</h2>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}
                                className="mb-3 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#2d6a27] focus:outline-none">
                                {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                            <button onClick={handleStatusUpdate} disabled={updating || status === order.status}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d6a27] py-2.5 font-semibold text-white hover:bg-[#3d8f33] disabled:opacity-50">
                                {updating ? <><Loader2 size={16} className="animate-spin" /> আপডেট হচ্ছে...</> : 'স্ট্যাটাস আপডেট'}
                            </button>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm text-sm space-y-2">
                            <h2 className="font-bold text-gray-800 mb-3">পেমেন্ট</h2>
                            <div className="flex justify-between"><span className="text-gray-500">পদ্ধতি</span><span className="font-medium text-gray-700">Cash on Delivery</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">মোট</span><span className="font-bold text-[#2d6a27]">৳{Number(order.total).toLocaleString()}</span></div>
                        </div>

                        <button onClick={handleDelete} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50">
                            অর্ডার মুছুন
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
