import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, Eye, EyeOff, Loader2, Tag, Truck, User as UserIcon } from 'lucide-react';
import { useState } from 'react';

const DIVISIONS = [
    { en: 'Dhaka', bn: 'ঢাকা' },
    { en: 'Chattogram', bn: 'চট্টগ্রাম' },
    { en: 'Rajshahi', bn: 'রাজশাহী' },
    { en: 'Khulna', bn: 'খুলনা' },
    { en: 'Barishal', bn: 'বরিশাল' },
    { en: 'Sylhet', bn: 'সিলেট' },
    { en: 'Rangpur', bn: 'রংপুর' },
    { en: 'Mymensingh', bn: 'ময়মনসিংহ' },
];

interface CheckoutProps {
    currentUser?: {
        name?: string;
        email?: string;
        phone?: string;
        division?: string;
        district?: string;
        upazila?: string;
        address?: string;
    } | null;
}

export default function Checkout({ currentUser }: CheckoutProps) {
    const { items, subtotal, clearCart } = useCart();
    const { t, language } = useLanguage();

    const [createAccount, setCreateAccount] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        customer_name: currentUser?.name || '',
        customer_phone: currentUser?.phone || '',
        customer_email: currentUser?.email || '',
        division: currentUser?.division || '',
        district: currentUser?.district || '',
        upazila: currentUser?.upazila || '',
        address: currentUser?.address || '',
        delivery_area: 'inside_dhaka' as 'inside_dhaka' | 'outside_dhaka',
        notes: '',
        coupon_code: '',
        create_account: false,
        password: '',
    });

    const [couponInput, setCouponInput] = useState('');
    const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const deliveryCharge = form.delivery_area === 'inside_dhaka' ? 60 : 120;
    const discount = couponApplied?.discount ?? 0;
    const total = subtotal + deliveryCharge - discount;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    };

    const applyCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponLoading(true);
        setCouponError('');

        try {
            const res = await fetch('/checkout/apply-coupon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') ?? '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ code: couponInput, subtotal }),
            });

            const data = await res.json();
            if (res.ok) {
                setCouponApplied({ code: data.coupon.code, discount: data.discount });
                setForm((p) => ({ ...p, coupon_code: data.coupon.code }));
            } else {
                setCouponError(data.message ?? (language === 'en' ? 'Invalid coupon code.' : 'অবৈধ কুপন কোড।'));
            }
        } catch {
            setCouponError(language === 'en' ? 'Connection error. Please try again.' : 'সংযোগ সমস্যা। আবার চেষ্টা করুন।');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) return;

        // Validation
        const newErrors: Record<string, string> = {};
        if (!form.customer_name.trim()) {
            newErrors.customer_name = language === 'en' ? 'Please enter your full name' : 'নাম দিন';
        }
        if (!form.customer_phone.trim()) {
            newErrors.customer_phone = language === 'en' ? 'Please enter phone number' : 'ফোন নম্বর দিন';
        }
        if (!form.division) {
            newErrors.division = language === 'en' ? 'Select division' : 'বিভাগ নির্বাচন করুন';
        }
        if (!form.district.trim()) {
            newErrors.district = language === 'en' ? 'Enter district' : 'জেলা লিখুন';
        }
        if (!form.address.trim()) {
            newErrors.address = language === 'en' ? 'Enter complete delivery address' : 'সম্পূর্ণ ঠিকানা লিখুন';
        }

        if (!currentUser && createAccount) {
            if (!form.customer_email.trim()) {
                newErrors.customer_email = language === 'en' ? 'Email is required to create an account' : 'অ্যাকাউন্ট তৈরি করতে ইমেইল আবশ্যক';
            }
            if (!form.password || form.password.length < 6) {
                newErrors.password = language === 'en' ? 'Password must be at least 6 characters' : 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);

        router.post('/checkout', {
            ...form,
            items: items.map((i) => ({
                product_id: i.product_id,
                variant_id: i.variant_id,
                quantity: i.quantity,
            })),
        }, {
            onSuccess: () => clearCart(),
            onError: (errs) => {
                setErrors(errs);
                setSubmitting(false);
            },
            onFinish: () => setSubmitting(false),
        });
    };

    if (items.length === 0) {
        return (
            <>
                <Head title={`${t.checkout} — Bazar Ghor`} />
                <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
                    <p className="mb-4 text-lg font-semibold text-gray-700">{t.emptyCartTitle}</p>
                    <p className="mb-6 text-sm text-gray-500">{t.emptyCartDesc}</p>
                    <Link
                        href="/shop"
                        className="rounded-xl bg-[#2d6a27] px-8 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#245420]"
                    >
                        {t.shopNow}
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`${t.checkout} — Bazar Ghor`} />

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#143312] to-[#2d6a27] py-8 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{t.checkout}</h1>
                    <div className="flex items-center gap-2 text-green-200 text-sm">
                        <Link href="/" className="hover:text-white">{t.home}</Link>
                        <span>/</span>
                        <Link href="/cart" className="hover:text-white">{t.cart}</Link>
                        <span>/</span>
                        <span className="text-white font-medium">{t.checkout}</span>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Form Fields Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 1. Customer Information */}
                            <div className="rounded-2xl bg-white p-6 shadow-xs border border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2d6a27] text-xs text-white font-bold">1</span>
                                        {t.customerInfo}
                                    </h2>
                                    {!currentUser && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d6a27] bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                            <CheckCircle size={13} />
                                            {t.guestCheckoutNotice}
                                        </span>
                                    )}
                                </div>

                                {currentUser ? (
                                    <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs sm:text-sm text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <UserIcon size={16} className="text-blue-600 shrink-0" />
                                            <span>
                                                {language === 'en' ? 'Logged in as: ' : 'লগইন আছেন: '}
                                                <strong className="font-semibold">{currentUser.name}</strong> ({currentUser.email})
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                                            {language === 'en' ? 'Linked to My Account' : 'অ্যাকাউন্টে যুক্ত হবে'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900 flex items-start gap-2.5">
                                        <CheckCircle className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold">
                                                {language === 'en' ? 'Direct Order (No Account Required): ' : 'অ্যাকাউন্ট না খুলেও সরাসরি অর্ডার: '}
                                            </span>
                                            <span>
                                                {language === 'en'
                                                    ? 'You can order directly with your name and address. No registration or password required.'
                                                    : 'অ্যাকাউন্ট না খুলেই শুধুমাত্র নাম, মোবাইল ও ডেলিভারি ঠিকানা দিয়ে সরাসরি অর্ডার সম্পন্ন করতে পারবেন।'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t.fullName} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="customer_name"
                                            type="text"
                                            value={form.customer_name}
                                            onChange={handleChange}
                                            placeholder={language === 'en' ? 'e.g. John Doe' : 'আপনার নাম লিখুন'}
                                            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none ${
                                                errors.customer_name ? 'border-red-400' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.customer_name && <p className="mt-1 text-xs text-red-500">{errors.customer_name}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t.phoneNumber} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="customer_phone"
                                            type="tel"
                                            value={form.customer_phone}
                                            onChange={handleChange}
                                            placeholder="01XXXXXXXXX"
                                            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none ${
                                                errors.customer_phone ? 'border-red-400' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.customer_phone && <p className="mt-1 text-xs text-red-500">{errors.customer_phone}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {createAccount && !currentUser ? (
                                                <span>
                                                    {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'} <span className="text-red-500">*</span>
                                                </span>
                                            ) : (
                                                t.emailOptional
                                            )}
                                        </label>
                                        <input
                                            name="customer_email"
                                            type="email"
                                            value={form.customer_email}
                                            onChange={handleChange}
                                            placeholder="example@gmail.com"
                                            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none ${
                                                errors.customer_email ? 'border-red-400' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.customer_email && <p className="mt-1 text-xs text-red-500">{errors.customer_email}</p>}
                                    </div>
                                </div>

                                {/* Optional Account Creation for Guests */}
                                {!currentUser && (
                                    <div className="mt-5 pt-4 border-t border-gray-100">
                                        <label className="flex items-start gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={createAccount}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setCreateAccount(checked);
                                                    setForm((p) => ({ ...p, create_account: checked }));
                                                }}
                                                className="size-4 mt-0.5 rounded border-gray-300 accent-[#2d6a27]"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {t.createAccountWithOrder}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {language === 'en'
                                                        ? 'Optionally create an account to view tracking & order history anytime.'
                                                        : 'অ্যাকাউন্ট তৈরি করলে ভবিষ্যতে যেকোনো সময় অর্ডার ট্র্যাক ও হিস্ট্রি দেখতে পারবেন।'}
                                                </p>
                                            </div>
                                        </label>

                                        {createAccount && (
                                            <div className="mt-3.5 rounded-xl bg-gray-50 p-4 border border-gray-200">
                                                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                                                    {t.setPassword} <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={form.password}
                                                        onChange={handleChange}
                                                        placeholder={language === 'en' ? 'Minimum 6 characters' : 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন'}
                                                        className={`w-full rounded-xl border bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none ${
                                                            errors.password ? 'border-red-400' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword((prev) => !prev)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition p-1"
                                                        title={showPassword ? (language === 'en' ? 'Hide password' : 'পাসওয়ার্ড লুকান') : (language === 'en' ? 'Show password' : 'পাসওয়ার্ড দেখুন')}
                                                        aria-label="Toggle password visibility"
                                                    >
                                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 2. Delivery Address */}
                            <div className="rounded-2xl bg-white p-6 shadow-xs border border-gray-100">
                                <h2 className="mb-5 text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2d6a27] text-xs text-white font-bold">2</span>
                                    {t.deliveryAddress}
                                </h2>

                                {/* Delivery Area Radio */}
                                <div className="mb-5">
                                    <p className="mb-2 text-sm font-semibold text-gray-700">
                                        {t.deliveryArea} <span className="text-red-500">*</span>
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { value: 'inside_dhaka', label: t.insideDhaka, charge: '৳60' },
                                            { value: 'outside_dhaka', label: t.outsideDhaka, charge: '৳120' },
                                        ].map((opt) => (
                                            <label
                                                key={opt.value}
                                                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                                                    form.delivery_area === opt.value
                                                        ? 'border-[#2d6a27] bg-green-50/70 shadow-xs'
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="delivery_area"
                                                    value={opt.value}
                                                    checked={form.delivery_area === opt.value}
                                                    onChange={handleChange}
                                                    className="size-4 accent-[#2d6a27]"
                                                />
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{opt.label}</p>
                                                    <p className="text-xs text-[#2d6a27] font-semibold">{opt.charge}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t.division} <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="division"
                                            value={form.division}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 shadow-xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none ${
                                                errors.division ? 'border-red-400' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">{language === 'en' ? '-- Select Division --' : '-- বিভাগ নির্বাচন করুন --'}</option>
                                            {DIVISIONS.map((d) => (
                                                <option key={d.en} value={language === 'en' ? d.en : d.bn}>
                                                    {language === 'en' ? d.en : d.bn}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.division && <p className="mt-1 text-xs text-red-500">{errors.division}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t.district} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="district"
                                            type="text"
                                            value={form.district}
                                            onChange={handleChange}
                                            placeholder={language === 'en' ? 'e.g. Dhaka, Gazipur, Cumilla' : 'জেলার নাম লিখুন'}
                                            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none ${
                                                errors.district ? 'border-red-400' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.district && <p className="mt-1 text-xs text-red-500">{errors.district}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">{t.upazila}</label>
                                        <input
                                            name="upazila"
                                            type="text"
                                            value={form.upazila}
                                            onChange={handleChange}
                                            placeholder={language === 'en' ? 'e.g. Mirpur, Dhanmondi, Savar' : 'উপজেলা / থানা লিখুন'}
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                                            {t.fullAddress} <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder={language === 'en' ? 'House number, Road number, Area/Village...' : 'বাড়ি নম্বর, রোড নম্বর, এলাকা...'}
                                            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none resize-none ${
                                                errors.address ? 'border-red-400' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">{t.notesOptional}</label>
                                        <textarea
                                            name="notes"
                                            value={form.notes}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder={language === 'en' ? 'Any special instructions for delivery...' : 'ডেলিভারি সম্পর্কে কিছু জানাতে চাইলে লিখুন...'}
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Payment Method */}
                            <div className="rounded-2xl bg-white p-6 shadow-xs border border-gray-100">
                                <h2 className="mb-4 text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2d6a27] text-xs text-white font-bold">3</span>
                                    {t.paymentMethod}
                                </h2>
                                <div className="flex items-center gap-3 rounded-xl border-2 border-[#2d6a27] bg-green-50/70 p-4 shadow-xs">
                                    <Truck className="text-[#2d6a27] shrink-0" size={26} />
                                    <div>
                                        <p className="font-bold text-gray-900">Cash on Delivery (COD)</p>
                                        <p className="text-xs text-gray-600 font-medium">
                                            {language === 'en' ? 'Pay with cash upon receiving your delivery at doorstep.' : 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।'}
                                        </p>
                                    </div>
                                    <CheckCircle className="ml-auto text-[#2d6a27] shrink-0" size={22} />
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Column */}
                        <div>
                            <div className="rounded-2xl bg-white p-6 shadow-xs border border-gray-100 sticky top-24">
                                <h2 className="mb-4 text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">
                                    {t.orderSummary}
                                </h2>

                                {/* Cart Items Preview */}
                                <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1 divide-y divide-gray-50">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 pt-2 first:pt-0">
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                                                {item.thumbnail ? (
                                                    <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full bg-gray-100" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                                                {item.variant_name && (
                                                    <p className="text-[11px] text-[#2d6a27] font-medium">{item.variant_name}</p>
                                                )}
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-xs font-bold text-gray-900 shrink-0">
                                                ৳{(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Coupon Section */}
                                <div className="mb-5 border-t border-gray-100 pt-4">
                                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                                        <Tag size={13} className="text-[#2d6a27]" />
                                        {t.couponCode}
                                    </p>
                                    {couponApplied ? (
                                        <div className="flex items-center justify-between rounded-xl bg-green-50 px-3.5 py-2.5 border border-green-200">
                                            <span className="text-sm font-bold text-green-800">{couponApplied.code}</span>
                                            <span className="text-sm font-bold text-green-700">-৳{couponApplied.discount.toLocaleString()}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponInput}
                                                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                    placeholder={language === 'en' ? 'Enter coupon code' : 'কুপন কোড লিখুন'}
                                                    className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={applyCoupon}
                                                    disabled={couponLoading}
                                                    className="rounded-xl bg-[#2d6a27] px-4 py-2 text-xs font-bold text-white hover:bg-[#22501e] transition-colors disabled:opacity-50"
                                                >
                                                    {couponLoading ? <Loader2 size={14} className="animate-spin" /> : t.apply}
                                                </button>
                                            </div>
                                            {couponError && <p className="mt-1.5 text-xs text-red-500 font-medium">{couponError}</p>}
                                        </>
                                    )}
                                </div>

                                {/* Price Breakdown */}
                                <div className="border-t border-gray-100 pt-3 space-y-2.5 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t.subtotal}</span>
                                        <span className="font-semibold text-gray-800">৳{subtotal.toLocaleString()}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>{t.discount}</span>
                                            <span>-৳{discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t.deliveryCharge}</span>
                                        <span className="font-semibold text-gray-800">৳{deliveryCharge}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
                                        <span className="text-base">{t.total}</span>
                                        <span className="text-xl text-[#2d6a27]">৳{total.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Submit Order Button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d6a27] py-4 font-bold text-white shadow-md transition hover:bg-[#23531f] active:scale-95 disabled:opacity-60"
                                >
                                    {submitting ? (
                                        <><Loader2 size={18} className="animate-spin" /> {t.processing}</>
                                    ) : (
                                        <>{language === 'en' ? `Place Order • ৳${total.toLocaleString()}` : `অর্ডার নিশ্চিত করুন ৳${total.toLocaleString()}`}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
}
