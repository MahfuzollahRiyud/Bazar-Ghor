import { useLanguage } from '@/contexts/LanguageContext';
import { trackAddPaymentInfo, setCustomerData } from '@/lib/tracking';
import { router } from '@inertiajs/react';
import { CheckCircle, CheckCircle2, CreditCard, Loader2, Lock, Minus, Plus, ShieldCheck, ShoppingBag, Truck, User, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Variant {
    id: number;
    name: string;
    price: number;
    effective_price: number;
    stock_quantity: number;
    image?: string | null;
}

interface Product {
    id: number;
    name: string;
    price: number;
    effective_price: number;
    thumbnail_url?: string | null;
    in_stock: boolean;
    stock_quantity: number;
    variants: Variant[];
}

export interface PaymentGatewayItem {
    id: string;
    name: string;
    description?: string;
    type: 'cod' | 'online';
    badge?: string;
}

interface LandingCheckoutFormProps {
    product: Product;
    selectedVariant: Variant | null;
    onSelectVariant?: (variant: Variant) => void;
    quantity: number;
    onQuantityChange: (qty: number) => void;
    shippingRates?: {
        inside_dhaka: number;
        outside_dhaka: number;
    };
    paymentGateways?: PaymentGatewayItem[];
}

export default function LandingCheckoutForm({
    product,
    selectedVariant,
    onSelectVariant,
    quantity,
    onQuantityChange,
    shippingRates,
    paymentGateways = [],
}: LandingCheckoutFormProps) {
    const { language } = useLanguage();

    const rates = {
        inside_dhaka: Number(shippingRates?.inside_dhaka ?? 60),
        outside_dhaka: Number(shippingRates?.outside_dhaka ?? 120),
    };

    const gateways: PaymentGatewayItem[] = paymentGateways.length > 0 ? paymentGateways : [
        {
            id: 'cash_on_delivery',
            name: language === 'bn' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : 'Cash on Delivery (COD)',
            description: language === 'bn' ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।' : 'Pay with cash upon receiving your delivery at doorstep.',
            type: 'cod' as const,
        }
    ];

    const [form, setForm] = useState({
        customer_name: '',
        customer_phone: '',
        address: '',
        delivery_area: 'inside_dhaka' as 'inside_dhaka' | 'outside_dhaka',
        payment_method: gateways[0]?.id || 'cash_on_delivery',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const currentPrice = selectedVariant ? Number(selectedVariant.effective_price) : Number(product.effective_price);
    const subtotal = currentPrice * quantity;
    const deliveryCharge = form.delivery_area === 'inside_dhaka' ? rates.inside_dhaka : rates.outside_dhaka;
    const total = subtotal + deliveryCharge;

    const selectedGateway = gateways.find((g) => g.id === form.payment_method) || gateways[0];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleCustomerBlur = () => {
        if (form.customer_phone || form.customer_name) {
            setCustomerData({
                name: form.customer_name,
                phone: form.customer_phone,
                district: form.delivery_area === 'inside_dhaka' ? 'Dhaka' : undefined,
            });
        }
    };

    const handleSubmitOrder = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        const trimmedName = form.customer_name.trim();
        const trimmedPhone = form.customer_phone.trim();
        const trimmedAddress = form.address.trim();

        if (!trimmedName) {
            newErrors.customer_name = language === 'bn' ? 'আপনার নাম লিখুন' : 'Please enter your full name';
        }

        // Validate 11-digit Bangladesh phone number
        const cleanPhone = trimmedPhone.replace(/[^0-9]/g, '');
        if (!cleanPhone) {
            newErrors.customer_phone = language === 'bn' ? 'ফোন নম্বর দিন' : 'Phone number is required';
        } else if (cleanPhone.length < 11) {
            newErrors.customer_phone = language === 'bn' ? '১১ ডিজিটের সঠিক মোবাইল নম্বর দিন' : 'Please enter valid 11-digit phone number';
        }

        if (!trimmedAddress) {
            newErrors.customer_address = language === 'bn' ? 'সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন' : 'Please enter full delivery address';
        } else if (trimmedAddress.length < 6) {
            newErrors.customer_address = language === 'bn' ? 'বিস্তারিত ঠিকানা দিন (বাসা, এলাকা, থানা, জেলা)' : 'Please enter complete address details';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            const firstErr = Object.values(newErrors)[0];
            toast.error(firstErr);
            return;
        }

        // Advanced Matching sync
        setCustomerData({
            name: trimmedName,
            phone: cleanPhone,
            district: form.delivery_area === 'inside_dhaka' ? 'Dhaka' : undefined,
        });

        // Meta Pixel tracking
        trackAddPaymentInfo({
            payment_method: form.payment_method,
            value: total,
            currency: 'BDT',
        });

        setSubmitting(true);

        router.post('/checkout', {
            customer_name: trimmedName,
            customer_phone: cleanPhone,
            address: trimmedAddress,
            delivery_area: form.delivery_area,
            payment_method: form.payment_method,
            notes: form.notes.trim() || undefined,
            items: [
                {
                    product_id: product.id,
                    variant_id: selectedVariant?.id ?? null,
                    quantity: quantity,
                },
            ],
        }, {
            onError: (errs) => {
                setErrors(errs);
                setSubmitting(false);
                const firstErr = Object.values(errs)[0];
                toast.error(typeof firstErr === 'string' ? firstErr : 'অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।');
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <section
            id="direct-checkout-section"
            className="mt-14 scroll-mt-20 rounded-3xl border-2 border-[#2d6a27]/30 bg-gradient-to-b from-green-50/60 via-white to-white p-5 sm:p-8 md:p-10 shadow-xl"
        >
            {/* Header Badge & Title */}
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-[#2d6a27] text-white shadow-sm mb-3">
                    <Truck size={16} />
                    <span>
                        {language === 'bn'
                            ? 'নিরাপদ হোম ডেলিভারি ও সহজ পেমেন্ট সুবিধা'
                            : 'Secure Home Delivery & Easy Payment Options'}
                    </span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {language === 'bn' ? 'অর্ডার করতে নিচের ফর্মটি পূরণ করুন' : 'Fill Out The Form Below To Place Order'}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-gray-600">
                    {language === 'bn'
                        ? 'আপনার সঠিক তথ্য দিন এবং পছন্দের পেমেন্ট মেথড (ক্যাশ অন ডেলিভারি অথবা অনলাইন পেমেন্ট) সিলেক্ট করে অর্ডার কনফার্ম করুন।'
                        : 'Provide your details and choose your preferred payment method to confirm your order instantly.'}
                </p>
            </div>

            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Customer Details & Payment Gateways (col-span-7) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* 1. Customer & Delivery Information */}
                    <div className="space-y-5 bg-white p-5 sm:p-7 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                            <User size={18} className="text-[#2d6a27]" />
                            <span>{language === 'bn' ? '১. কাস্টমার ও ডেলিভারি তথ্য' : '1. Customer & Delivery Information'}</span>
                        </h3>

                        {/* Name */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                                {language === 'bn' ? 'আপনার নাম' : 'Your Full Name'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="customer_name"
                                value={form.customer_name}
                                onChange={handleInputChange}
                                onBlur={handleCustomerBlur}
                                placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ রহিম' : 'e.g. John Doe'}
                                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none transition ${
                                    errors.customer_name ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                                }`}
                            />
                            {errors.customer_name && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{errors.customer_name}</p>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                                {language === 'bn' ? 'মোবাইল নম্বর (১১ ডিজিট)' : 'Mobile Number (11 Digits)'} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="customer_phone"
                                value={form.customer_phone}
                                onChange={handleInputChange}
                                onBlur={handleCustomerBlur}
                                placeholder="01XXXXXXXXX"
                                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none transition ${
                                    errors.customer_phone ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                                }`}
                            />
                            {errors.customer_phone ? (
                                <p className="mt-1 text-xs text-red-500 font-medium">{errors.customer_phone}</p>
                            ) : (
                                <p className="mt-1 text-[11px] text-gray-400">
                                    {language === 'bn' ? 'অর্ডার কনফার্ম করার জন্য এই নম্বরে যোগাযোগ করা হবে' : 'We will reach this number for delivery confirmation'}
                                </p>
                            )}
                        </div>

                        {/* Full Address */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                                {language === 'bn' ? 'সম্পূর্ণ ডেলিভারি ঠিকানা' : 'Complete Delivery Address'} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                name="address"
                                value={form.address}
                                onChange={handleInputChange}
                                placeholder={language === 'bn' ? 'বাসা নং, রোড নং, এলাকা/গ্রাম, থানা ও জেলার নাম লিখুন...' : 'House no, Road no, Area, Thana and District...'}
                                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none transition resize-none ${
                                    errors.customer_address ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                                }`}
                            />
                            {errors.customer_address && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{errors.customer_address}</p>
                            )}
                        </div>

                        {/* Delivery Area Radio Selection */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                                {language === 'bn' ? 'ডেলিভারি এরিয়া নির্বাচন করুন' : 'Select Delivery Area'} <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    {
                                        value: 'inside_dhaka' as const,
                                        label: language === 'bn' ? 'ঢাকার ভেতরে' : 'Inside Dhaka',
                                        charge: rates.inside_dhaka,
                                        sub: language === 'bn' ? 'হোম ডেলিভারি (৳' + rates.inside_dhaka + ')' : 'Home Delivery (৳' + rates.inside_dhaka + ')',
                                    },
                                    {
                                        value: 'outside_dhaka' as const,
                                        label: language === 'bn' ? 'ঢাকার বাইরে' : 'Outside Dhaka',
                                        charge: rates.outside_dhaka,
                                        sub: language === 'bn' ? 'সারাদেশে হোম ডেলিভারি (৳' + rates.outside_dhaka + ')' : 'Nationwide Delivery (৳' + rates.outside_dhaka + ')',
                                    },
                                ].map((area) => {
                                    const isSelected = form.delivery_area === area.value;
                                    return (
                                        <label
                                            key={area.value}
                                            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-3.5 transition ${
                                                isSelected
                                                    ? 'border-[#2d6a27] bg-green-50/70 shadow-xs'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="delivery_area"
                                                    value={area.value}
                                                    checked={isSelected}
                                                    onChange={() => setForm((p) => ({ ...p, delivery_area: area.value }))}
                                                    className="size-4 accent-[#2d6a27]"
                                                />
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{area.label}</p>
                                                    <p className="text-[11px] text-gray-500">{area.sub}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-black text-[#2d6a27]">৳{area.charge}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Notes (Optional) */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                {language === 'bn' ? 'অতিরিক্ত কোনো নির্দেশ থাকলে লিখুন (ঐচ্ছিক)' : 'Order Note / Special Instructions (Optional)'}
                            </label>
                            <input
                                type="text"
                                name="notes"
                                value={form.notes}
                                onChange={handleInputChange}
                                placeholder={language === 'bn' ? 'যেমন: বিকেলে ডেলিভারি করবেন বা নির্দিষ্ট কালার' : 'e.g. Deliver in the evening'}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#2d6a27] focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* 2. Payment Method Selection (COD, UddoktaPay, bKash, etc.) */}
                    <div className="space-y-4 bg-white p-5 sm:p-7 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard size={18} className="text-[#2d6a27]" />
                                <span>{language === 'bn' ? '২. পেমেন্ট মেথড নির্বাচন করুন' : '2. Select Payment Method'}</span>
                            </h3>
                            <span className="text-[11px] font-semibold text-[#2d6a27] bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                                {language === 'bn' ? 'নিরাপদ পেমেন্ট' : '100% Secure'}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {gateways.map((gw) => {
                                const isSelected = form.payment_method === gw.id;
                                return (
                                    <label
                                        key={gw.id}
                                        onClick={() => setForm((p) => ({ ...p, payment_method: gw.id }))}
                                        className={`flex items-start sm:items-center gap-3.5 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                                            isSelected
                                                ? 'border-[#2d6a27] bg-green-50/70 shadow-xs ring-1 ring-[#2d6a27]'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value={gw.id}
                                            checked={isSelected}
                                            onChange={() => setForm((p) => ({ ...p, payment_method: gw.id }))}
                                            className="mt-1 sm:mt-0 h-4 w-4 accent-[#2d6a27]"
                                        />
                                        <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-[#2d6a27]/15 text-[#2d6a27]' : 'bg-gray-100 text-gray-500'}`}>
                                            {gw.type === 'cod' ? (
                                                <Truck size={20} />
                                            ) : gw.id === 'uddoktapay' ? (
                                                <Wallet size={20} />
                                            ) : (
                                                <CreditCard size={20} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-sm text-gray-900">{gw.name}</span>
                                                {gw.badge && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        {gw.badge}
                                                    </span>
                                                )}
                                            </div>
                                            {gw.description && (
                                                <p className="text-xs text-gray-500 mt-0.5 font-medium leading-relaxed">
                                                    {gw.description}
                                                </p>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <CheckCircle className="text-[#2d6a27] shrink-0 ml-auto hidden sm:block" size={20} />
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary & Confirm (col-span-5) */}
                <div className="lg:col-span-5 bg-white p-5 sm:p-7 rounded-2xl border border-gray-100 shadow-sm sticky top-20">
                    <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                        <ShoppingBag size={18} className="text-[#2d6a27]" />
                        <span>{language === 'bn' ? 'অর্ডার সামারি' : 'Order Summary'}</span>
                    </h3>

                    {/* Product Preview Card */}
                    <div className="mt-4 flex items-center gap-3.5 pb-4 border-b border-gray-100">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-200">
                            <img
                                src={selectedVariant?.image || product.thumbnail_url || '/placeholder.png'}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">{product.name}</h4>
                            {selectedVariant && (
                                <p className="text-xs font-semibold text-[#2d6a27] mt-0.5">
                                    {language === 'bn' ? 'ভ্যারিয়েন্ট: ' : 'Variant: '}{selectedVariant.name}
                                </p>
                            )}
                            <p className="text-xs text-gray-600 mt-1 font-semibold">
                                ৳{Number(currentPrice).toLocaleString()} × {quantity}
                            </p>
                        </div>
                    </div>

                    {/* Variants Switcher if available */}
                    {product.variants && product.variants.length > 0 && onSelectVariant && (
                        <div className="py-3 border-b border-gray-100">
                            <label className="block text-xs font-bold text-gray-700 mb-2">
                                {language === 'bn' ? 'ভ্যারিয়েন্ট পরিবর্তন করুন:' : 'Change Variant:'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map((v) => {
                                    const isSel = selectedVariant?.id === v.id;
                                    return (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => onSelectVariant(v)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                                                isSel
                                                    ? 'border-[#2d6a27] bg-green-50 text-[#2d6a27] ring-1 ring-[#2d6a27]'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            {v.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="py-3.5 flex items-center justify-between border-b border-gray-100">
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">
                            {language === 'bn' ? 'পরিমাণ (Quantity):' : 'Quantity:'}
                        </span>
                        <div className="inline-flex items-center rounded-xl border border-gray-200 overflow-hidden bg-white shadow-2xs">
                            <button
                                type="button"
                                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition cursor-pointer"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="min-w-[2.5rem] text-center font-bold text-xs sm:text-sm text-gray-800">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() => onQuantityChange(quantity + 1)}
                                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition cursor-pointer"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Subtotal, Delivery and Total Calculation */}
                    <div className="py-3.5 space-y-2 border-b border-gray-100 text-xs sm:text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>{language === 'bn' ? 'পণ্যের মোট মূল্য' : 'Subtotal'}</span>
                            <span className="font-semibold text-gray-900">৳{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>{language === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Charge'}</span>
                            <span className="font-semibold text-gray-900">৳{deliveryCharge}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                            <span>{language === 'bn' ? 'নির্বাচিত পেমেন্ট' : 'Payment Method'}</span>
                            <span className="font-bold text-[#2d6a27] text-right truncate max-w-[180px]">
                                {selectedGateway.name}
                            </span>
                        </div>
                    </div>

                    <div className="py-3.5 flex items-center justify-between">
                        <span className="text-sm sm:text-base font-bold text-gray-900">
                            {language === 'bn' ? 'সর্বমোট প্রদেয় বিল:' : 'Total Payable:'}
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-[#2d6a27]">
                            ৳{total.toLocaleString()}
                        </span>
                    </div>

                    {/* Big Pulsing Action Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="group/btn relative overflow-hidden w-full rounded-2xl bg-[#2d6a27] hover:bg-[#23531f] py-4 px-6 text-white font-extrabold text-base sm:text-lg shadow-lg active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
                    >
                        {/* Shimmer sweep animation */}
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 -top-2 -bottom-2 w-2/3 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-sweep"
                        />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {submitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>{language === 'bn' ? 'অর্ডার প্রসেস হচ্ছে...' : 'Processing Order...'}</span>
                                </>
                            ) : selectedGateway.type === 'online' ? (
                                <>
                                    <Wallet size={22} className="text-yellow-300" />
                                    <span>
                                        {language === 'bn'
                                            ? `পেমেন্ট করে অর্ডার কনফার্ম করুন — ৳${total.toLocaleString()}`
                                            : `Pay & Confirm Order — ৳${total.toLocaleString()}`}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={22} className="text-yellow-300" />
                                    <span>
                                        {language === 'bn'
                                            ? `অর্ডার কনফার্ম করুন — ৳${total.toLocaleString()}`
                                            : `Confirm Order Now — ৳${total.toLocaleString()}`}
                                    </span>
                                </>
                            )}
                        </span>
                    </button>

                    {/* Trust Badges */}
                    <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                        <div className="flex flex-col items-center">
                            <Truck size={18} className="text-[#2d6a27] mb-1" />
                            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-700 leading-tight">
                                {language === 'bn' ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'}
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <ShieldCheck size={18} className="text-[#2d6a27] mb-1" />
                            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-700 leading-tight">
                                {language === 'bn' ? '১০০% অরিজিনাল' : '100% Genuine'}
                            </span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Lock size={18} className="text-[#2d6a27] mb-1" />
                            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-700 leading-tight">
                                {selectedGateway.type === 'online'
                                    ? (language === 'bn' ? 'নিরাপদ গেটওয়ে' : 'Secure Gateway')
                                    : (language === 'bn' ? 'হাতে পেয়ে মূল্য' : 'Pay On Delivery')}
                            </span>
                        </div>
                    </div>
                </div>
            </form>
        </section>
    );
}
