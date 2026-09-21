import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Package, Phone, ShoppingBag } from 'lucide-react';

interface OrderItem {
    product_name: string;
    variant_name?: string | null;
    price: number;
    quantity: number;
    total: number;
    thumbnail?: string | null;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    total: number;
    delivery_area: string;
    delivery_charge: number;
    status: string;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    order: Order;
}

export default function OrderSuccess({ order }: Props) {
    const { t, language } = useLanguage();

    return (
        <>
            <Head title={`${t.orderSuccessTitle} — Bazar Ghor`} />

            <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                {/* Success Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-[#2d6a27] shadow-xs">
                        <CheckCircle size={48} />
                    </div>
                </div>

                <h1 className="mb-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
                    {t.orderSuccessTitle} 🎉
                </h1>
                <p className="mb-1 text-xs text-gray-500 uppercase tracking-wider font-semibold">{t.orderNumber}</p>
                <p className="mb-5 text-2xl font-extrabold text-[#2d6a27]">{order.order_number}</p>

                <p className="mb-8 text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
                    {language === 'en' ? (
                        <>
                            Thank you, <strong>{order.customer_name}</strong>! Your Cash on Delivery order has been registered. Our representative will contact you shortly at <strong>{order.customer_phone}</strong> to confirm dispatch.
                        </>
                    ) : (
                        <>
                            ধন্যবাদ <strong>{order.customer_name}</strong>! আপনার অর্ডারটি গ্রহণ করা হয়েছে। আমরা শীঘ্রই <strong>{order.customer_phone}</strong> নম্বরে যোগাযোগ করে ডেলিভারি কনফার্ম করব।
                        </>
                    )}
                </p>

                {/* Order Details Card */}
                <div className="mb-6 rounded-2xl bg-white p-6 shadow-xs border border-gray-100 text-left">
                    <h2 className="mb-4 text-base font-bold text-gray-800 border-b border-gray-100 pb-2.5 flex items-center gap-2">
                        <Package size={18} className="text-[#2d6a27]" />
                        {t.invoiceDetails}
                    </h2>

                    {/* Items */}
                    <div className="space-y-3 mb-4 divide-y divide-gray-50">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between pt-2.5 first:pt-0">
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">{item.product_name}</p>
                                    {item.variant_name && (
                                        <p className="text-[11px] text-[#2d6a27] font-medium">{item.variant_name}</p>
                                    )}
                                    <p className="text-xs text-gray-500">× {item.quantity}</p>
                                </div>
                                <span className="text-xs font-bold text-gray-900">৳{Number(item.total).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
                        <div className="flex justify-between text-gray-600">
                            <span>{t.deliveryCharge}</span>
                            <span>৳{order.delivery_charge}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>{t.paymentMethod}</span>
                            <span className="font-semibold text-gray-800">Cash on Delivery (ক্যাশ অন ডেলিভারি)</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-sm">
                            <span>{t.total}</span>
                            <span className="text-base text-[#2d6a27]">৳{Number(order.total).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="rounded-xl bg-[#2d6a27] px-8 py-3.5 font-bold text-xs text-white shadow-sm transition hover:bg-[#23531f]"
                    >
                        {t.backToHome}
                    </Link>
                    <a
                        href="tel:01613545166"
                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3.5 font-bold text-xs text-gray-700 transition hover:bg-gray-50"
                    >
                        <Phone size={15} />
                        01613-545166
                    </a>
                </div>
            </div>
        </>
    );
}
