import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';

export default function Cart() {
    const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
    const { t, language } = useLanguage();

    return (
        <>
            <Head title={`${t.cart} — Bazar Ghor`} />

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#143312] to-[#2d6a27] py-8 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{t.shoppingCart}</h1>
                    <div className="flex items-center gap-2 text-green-200 text-sm">
                        <Link href="/" className="hover:text-white">{t.home}</Link>
                        <span>/</span>
                        <span className="text-white font-medium">{t.cart}</span>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 px-4 text-center border border-gray-100 shadow-xs max-w-lg mx-auto">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#2d6a27]">
                            <ShoppingBag size={32} />
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-gray-800">{t.emptyCartTitle}</h2>
                        <p className="mb-6 text-sm text-gray-500 max-w-xs">{t.emptyCartDesc}</p>
                        <Link
                            href="/shop"
                            className="rounded-xl bg-[#2d6a27] px-8 py-3.5 font-bold text-sm text-white shadow-xs transition hover:bg-[#23531f] active:scale-95"
                        >
                            {t.shopNow}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between pb-1">
                                <h2 className="font-bold text-gray-800 text-base">
                                    {items.length} {language === 'en' ? 'Items in Cart' : 'টি পণ্য কার্টে আছে'}
                                </h2>
                                <button
                                    onClick={clearCart}
                                    className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition"
                                >
                                    <Trash2 size={13} />
                                    {t.clearCart}
                                </button>
                            </div>

                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 rounded-2xl bg-white p-4.5 border border-gray-100 shadow-xs">
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                                        {item.thumbnail ? (
                                            <img src={item.thumbnail} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-300">
                                                <ShoppingBag size={24} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">{item.name}</h3>
                                        {item.variant_name && (
                                            <p className="text-xs text-[#2d6a27] font-medium mt-0.5">{item.variant_name}</p>
                                        )}
                                        <p className="mt-1 font-bold text-[#2d6a27]">
                                            ৳{item.price.toLocaleString()}
                                        </p>

                                        <div className="mt-2.5 flex items-center gap-3">
                                            <div className="inline-flex items-center rounded-xl border border-gray-200 overflow-hidden bg-gray-50/50">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition active:scale-95"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={13} />
                                                </button>
                                                <span className="min-w-[2.2rem] text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition active:scale-95"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={13} />
                                                </button>
                                            </div>

                                            <span className="text-xs font-bold text-gray-800">
                                                = ৳{(item.price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="shrink-0 self-start rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                                        aria-label="Remove item"
                                    >
                                        <X size={17} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary Column */}
                        <div>
                            <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-xs sticky top-24">
                                <h2 className="mb-4 text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">
                                    {t.orderSummary}
                                </h2>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t.subtotal}</span>
                                        <span className="font-semibold text-gray-900">৳{subtotal.toLocaleString()}</span>
                                    </div>

                                    <div className="border-t border-gray-100 pt-3">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>{t.deliveryCharge}</span>
                                            <span className="text-gray-400">{language === 'en' ? 'Calculated at checkout' : 'চেকআউটে নির্ধারিত হবে'}</span>
                                        </div>
                                        <p className="text-[11px] text-green-700 bg-green-50 rounded-lg p-2 mt-1">
                                            🚚 {t.insideDhakaDelivery} | {t.outsideDhakaDelivery}
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
                                        <span className="text-base">{t.subtotal}</span>
                                        <span className="text-xl text-[#2d6a27]">৳{subtotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d6a27] py-4 font-bold text-sm text-white shadow-md transition hover:bg-[#23531f] active:scale-95"
                                >
                                    <span>{t.proceedToCheckout}</span>
                                    <ArrowRight size={16} />
                                </Link>

                                <div className="mt-4 text-center">
                                    <Link
                                        href="/shop"
                                        className="text-xs font-semibold text-gray-500 hover:text-[#2d6a27] hover:underline"
                                    >
                                        ← {language === 'en' ? 'Continue Shopping' : 'আরও কেনাকাটা করুন'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
