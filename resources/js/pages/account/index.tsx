import { useLanguage } from '@/contexts/LanguageContext';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Clock,
    Eye,
    KeyRound,
    Lock,
    LogOut,
    MapPin,
    Package,
    Phone,
    ShieldCheck,
    ShoppingBag,
    Truck,
    User as UserIcon,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface OrderItemData {
    id: number;
    product_name: string;
    product_slug?: string;
    product_image?: string;
    price: number;
    quantity: number;
    total: number;
    options?: Record<string, string>;
}

interface OrderData {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    division: string;
    district: string;
    upazila?: string;
    address: string;
    delivery_area: string;
    delivery_charge: number;
    subtotal: number;
    coupon_code?: string;
    discount: number;
    total: number;
    status: string;
    status_label: string;
    status_color: string;
    payment_method: string;
    notes?: string;
    created_at: string;
    items: OrderItemData[];
}

interface UserData {
    id: number;
    name: string;
    email: string;
    phone?: string;
    division?: string;
    district?: string;
    upazila?: string;
    address?: string;
    role: string;
    created_at?: string;
}

interface AccountProps {
    orders: OrderData[];
    user: UserData;
}

const STATUS_STEPS = [
    { key: 'pending', labelEn: 'Pending', labelBn: 'অপেক্ষায়' },
    { key: 'confirmed', labelEn: 'Confirmed', labelBn: 'নিশ্চিত' },
    { key: 'processing', labelEn: 'Processing', labelBn: 'প্রস্তুতি' },
    { key: 'shipped', labelEn: 'Shipped', labelBn: 'পাঠানো হয়েছে' },
    { key: 'delivered', labelEn: 'Delivered', labelBn: 'পৌঁছেছে' },
];

export default function CustomerAccount({ orders, user }: AccountProps) {
    const { language, t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'security'>('orders');
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

    // Profile form
    const {
        data: profileData,
        setData: setProfileData,
        patch: updateProfile,
        processing: profileProcessing,
        recentlySuccessful: profileSuccess,
        errors: profileErrors,
    } = useForm({
        name: user.name || '',
        phone: user.phone || '',
        division: user.division || '',
        district: user.district || '',
        upazila: user.upazila || '',
        address: user.address || '',
    });

    // Password form
    const {
        data: passwordData,
        setData: setPasswordData,
        put: updatePassword,
        processing: passwordProcessing,
        recentlySuccessful: passwordSuccess,
        errors: passwordErrors,
        reset: resetPassword,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile('/account/profile', {
            preserveScroll: true,
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updatePassword('/account/password', {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        });
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const totalOrdersCount = orders.length;
    const pendingOrdersCount = orders.filter((o) => ['pending', 'confirmed', 'processing'].includes(o.status)).length;
    const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered').length;

    return (
        <div className="bg-[#f8faf9] pb-12">
            <Head title={`${t.myAccount} — Bazar Ghor`} />

            {/* Account Header Banner */}
            <div className="bg-gradient-to-r from-[#143312] to-[#2d6a27] text-white py-10">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-2xl font-bold text-yellow-300 shadow-inner">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">
                                    {language === 'en' ? `Welcome, ${user.name}` : `স্বাগতম, ${user.name}`}
                                </h1>
                                <p className="text-sm text-green-200 mt-0.5">
                                    {user.email} • {language === 'en' ? `Member since ${user.created_at || 'Recently'}` : `যোগদান: ${user.created_at || 'সম্প্রতি'}`}
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white/10 backdrop-blur-xs px-4 py-2.5 border border-white/15 text-center">
                                <p className="text-xs text-green-200">{language === 'en' ? 'Total Orders' : 'মোট অর্ডার'}</p>
                                <p className="text-xl font-bold text-white">{totalOrdersCount}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 backdrop-blur-xs px-4 py-2.5 border border-white/15 text-center">
                                <p className="text-xs text-green-200">{language === 'en' ? 'Active' : 'চলমান'}</p>
                                <p className="text-xl font-bold text-yellow-300">{pendingOrdersCount}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 backdrop-blur-xs px-4 py-2.5 border border-white/15 text-center">
                                <p className="text-xs text-green-200">{language === 'en' ? 'Delivered' : 'পৌঁছেছে'}</p>
                                <p className="text-xl font-bold text-emerald-300">{deliveredOrdersCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="mx-auto max-w-7xl px-4 py-8 flex-1 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1 space-y-3">
                        <div className="rounded-2xl bg-white p-3 border border-gray-100 shadow-xs">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                                    activeTab === 'orders'
                                        ? 'bg-[#2d6a27] text-white shadow-xs'
                                        : 'text-gray-700 hover:bg-green-50/70 hover:text-[#2d6a27]'
                                }`}
                            >
                                <ShoppingBag size={18} />
                                <span className="flex-1 text-left">{t.myOrders}</span>
                                {totalOrdersCount > 0 && (
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                            activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-green-100 text-[#2d6a27]'
                                        }`}
                                    >
                                        {totalOrdersCount}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition mt-1 ${
                                    activeTab === 'profile'
                                        ? 'bg-[#2d6a27] text-white shadow-xs'
                                        : 'text-gray-700 hover:bg-green-50/70 hover:text-[#2d6a27]'
                                }`}
                            >
                                <MapPin size={18} />
                                <span className="flex-1 text-left">
                                    {language === 'en' ? 'Profile & Address' : 'প্রোফাইল ও ঠিকানা'}
                                </span>
                            </button>

                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition mt-1 ${
                                    activeTab === 'security'
                                        ? 'bg-[#2d6a27] text-white shadow-xs'
                                        : 'text-gray-700 hover:bg-green-50/70 hover:text-[#2d6a27]'
                                }`}
                            >
                                <KeyRound size={18} />
                                <span className="flex-1 text-left">
                                    {language === 'en' ? 'Change Password' : 'পাসওয়ার্ড পরিবর্তন'}
                                </span>
                            </button>

                            <div className="pt-2 mt-2 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                                >
                                    <LogOut size={18} />
                                    <span className="flex-1 text-left">{t.logout}</span>
                                </button>
                            </div>
                        </div>

                        {/* Customer Support Card */}
                        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs">
                            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2">
                                <ShieldCheck className="text-[#2d6a27]" size={18} />
                                {language === 'en' ? 'Need Help with Orders?' : 'অর্ডার সংক্রান্ত সহায়তা?'}
                            </h3>
                            <p className="text-xs text-gray-500 mb-3">
                                {language === 'en'
                                    ? 'Reach out to our customer care anytime for delivery questions or updates.'
                                    : 'যেকোনো জিজ্ঞাসা বা ডেলিভারি আপডেটের জন্য আমাদের কল করুন।'}
                            </p>
                            <a
                                href="tel:01613545166"
                                className="flex items-center justify-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-xs font-bold text-[#2d6a27] hover:bg-green-100 transition"
                            >
                                <Phone size={14} />
                                <span>01613-545166</span>
                            </a>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        {/* Tab 1: Orders */}
                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <Package className="text-[#2d6a27]" size={22} />
                                        {t.myOrders}
                                    </h2>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {language === 'en' ? `Showing ${orders.length} orders` : `${orders.length} টি অর্ডার পাওয়া গেছে`}
                                    </span>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="rounded-2xl bg-white p-12 text-center border border-gray-100 shadow-xs">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#2d6a27] mb-4">
                                            <ShoppingBag size={28} />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-800 mb-1">
                                            {language === 'en' ? 'No orders yet' : 'এখনও কোনো অর্ডার করেননি'}
                                        </h3>
                                        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                                            {language === 'en'
                                                ? 'Browse our gadget catalog to find original airbuds, smart accessories, and order with Cash on Delivery.'
                                                : 'আমাদের শপ থেকে আসল গ্যাজেট, হেডফোন বা ট্রিমার পছন্দ করে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।'}
                                        </p>
                                        <a
                                            href="/shop"
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#2d6a27] px-6 py-3 text-sm font-bold text-white hover:bg-[#245620] transition shadow-xs"
                                        >
                                            <ShoppingBag size={16} />
                                            <span>{t.shopNow}</span>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs hover:border-gray-200 transition"
                                            >
                                                {/* Order Top Bar */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                                                    <div>
                                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                            {language === 'en' ? 'Order Number' : 'অর্ডার নম্বর'}
                                                        </span>
                                                        <p className="text-sm font-bold text-[#2d6a27] font-mono">{order.order_number}</p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">{order.created_at}</span>
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                                order.status === 'delivered'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : order.status === 'shipped'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : order.status === 'processing'
                                                                    ? 'bg-purple-100 text-purple-800'
                                                                    : order.status === 'confirmed'
                                                                    ? 'bg-cyan-100 text-cyan-800'
                                                                    : order.status === 'cancelled'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}
                                                        >
                                                            {order.status_label}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Items Preview */}
                                                <div className="py-4 divide-y divide-gray-50">
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                                                            <div className="h-12 w-12 shrink-0 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
                                                                {item.product_image ? (
                                                                    <img src={item.product_image} alt="" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="h-full w-full bg-gray-100" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-800 truncate">{item.product_name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    ৳{item.price.toLocaleString()} × {item.quantity}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-900">৳{item.total.toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Order Footer */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 bg-gray-50/50 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
                                                    <div className="text-xs text-gray-600">
                                                        <span>{language === 'en' ? 'Delivery to: ' : 'ডেলিভারি: '}</span>
                                                        <span className="font-medium text-gray-800">{order.division}, {order.district}</span>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <span className="text-xs text-gray-500">{t.total}: </span>
                                                            <span className="text-base font-bold text-[#2d6a27]">৳{order.total.toLocaleString()}</span>
                                                        </div>

                                                        <button
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:border-[#2d6a27] hover:text-[#2d6a27] transition shadow-2xs"
                                                        >
                                                            <Eye size={13} />
                                                            <span>{language === 'en' ? 'View Details' : 'বিস্তারিত দেখুন'}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 2: Profile & Saved Address */}
                        {activeTab === 'profile' && (
                            <div className="rounded-2xl bg-white p-6 md:p-8 border border-gray-100 shadow-xs">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-1">
                                    <MapPin className="text-[#2d6a27]" size={22} />
                                    {language === 'en' ? 'Profile & Delivery Details' : 'প্রোফাইল ও ডেলিভারি ঠিকানা'}
                                </h2>
                                <p className="text-xs text-gray-500 mb-6">
                                    {language === 'en'
                                        ? 'Save your contact and delivery address to speed up checkout on future orders.'
                                        : 'আপনার ঠিকানা সংরক্ষণ করে রাখলে ভবিষ্যতে চেকআউট করার সময় স্বয়ংক্রিয়ভাবে পূরণ হবে।'}
                                </p>

                                {profileSuccess && (
                                    <div className="mb-6 rounded-xl bg-green-50 p-4 border border-green-200 text-xs font-semibold text-green-800 flex items-center gap-2">
                                        <CheckCircle2 size={16} />
                                        <span>{language === 'en' ? 'Profile updated successfully!' : 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!'}</span>
                                    </div>
                                )}

                                <form onSubmit={handleProfileSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                {t.fullName}
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData('name', e.target.value)}
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-2xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                            />
                                            {profileErrors.name && <p className="mt-1 text-xs text-red-500">{profileErrors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                {language === 'en' ? 'Email (Cannot be changed)' : 'ইমেইল (পরিবর্তনযোগ্য নয়)'}
                                            </label>
                                            <input
                                                type="email"
                                                disabled
                                                value={user.email}
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                {t.phoneNumber}
                                            </label>
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData('phone', e.target.value)}
                                                placeholder="01XXXXXXXXX"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-2xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                            />
                                            {profileErrors.phone && <p className="mt-1 text-xs text-red-500">{profileErrors.phone}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                {t.division}
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.division}
                                                onChange={(e) => setProfileData('division', e.target.value)}
                                                placeholder="e.g. Dhaka"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-2xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                {t.district}
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.district}
                                                onChange={(e) => setProfileData('district', e.target.value)}
                                                placeholder="e.g. Dhaka, Gazipur"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-2xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                {t.upazila}
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.upazila}
                                                onChange={(e) => setProfileData('upazila', e.target.value)}
                                                placeholder="e.g. Mirpur, Uttara"
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-2xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                {t.fullAddress}
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={profileData.address}
                                                onChange={(e) => setProfileData('address', e.target.value)}
                                                placeholder={language === 'en' ? 'House number, Road number, Area...' : 'বাসা নং, রোড নং, এলাকা...'}
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-2xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={profileProcessing}
                                            className="rounded-xl bg-[#2d6a27] px-6 py-3 text-sm font-bold text-white hover:bg-[#23531f] transition shadow-xs disabled:opacity-50"
                                        >
                                            {profileProcessing ? t.processing : language === 'en' ? 'Save Profile' : 'তথ্য সংরক্ষণ করুন'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Tab 3: Security / Change Password */}
                        {activeTab === 'security' && (
                            <div className="rounded-2xl bg-white p-6 md:p-8 border border-gray-100 shadow-xs max-w-xl">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-1">
                                    <Lock className="text-[#2d6a27]" size={22} />
                                    {language === 'en' ? 'Change Password' : 'পাসওয়ার্ড পরিবর্তন'}
                                </h2>
                                <p className="text-xs text-gray-500 mb-6">
                                    {language === 'en'
                                        ? 'Ensure your account is using a long, secure password.'
                                        : 'আপনার অ্যাকাউন্টের সুরক্ষার জন্য একটি শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।'}
                                </p>

                                {passwordSuccess && (
                                    <div className="mb-6 rounded-xl bg-green-50 p-4 border border-green-200 text-xs font-semibold text-green-800 flex items-center gap-2">
                                        <CheckCircle2 size={16} />
                                        <span>{language === 'en' ? 'Password updated successfully!' : 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!'}</span>
                                    </div>
                                )}

                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            {language === 'en' ? 'Current Password' : 'বর্তমান পাসওয়ার্ড'}
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData('current_password', e.target.value)}
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-2xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                        />
                                        {passwordErrors.current_password && (
                                            <p className="mt-1 text-xs text-red-500">{passwordErrors.current_password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            {language === 'en' ? 'New Password' : 'নতুন পাসওয়ার্ড'}
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData('password', e.target.value)}
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-2xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                        />
                                        {passwordErrors.password && (
                                            <p className="mt-1 text-xs text-red-500">{passwordErrors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            {language === 'en' ? 'Confirm New Password' : 'নতুন পাসওয়ার্ড পুনরায় লিখুন'}
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordData.password_confirmation}
                                            onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-2xs focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={passwordProcessing}
                                            className="rounded-xl bg-[#2d6a27] px-6 py-3 text-sm font-bold text-white hover:bg-[#23531f] transition shadow-xs disabled:opacity-50"
                                        >
                                            {passwordProcessing ? t.processing : language === 'en' ? 'Update Password' : 'পাসওয়ার্ড আপডেট করুন'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-50 duration-200">
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f8faf9]">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    {language === 'en' ? 'Order Tracking & Details' : 'অর্ডার ট্র্যাকিং ও বিবরণ'}
                                </h3>
                                <p className="text-xs text-[#2d6a27] font-mono font-bold">{selectedOrder.order_number}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Tracking Timeline */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                                    {language === 'en' ? 'Order Status Tracking' : 'অর্ডার স্ট্যাটাস ট্র্যাকিং'}
                                </h4>

                                {selectedOrder.status === 'cancelled' ? (
                                    <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        <span>{language === 'en' ? 'This order was cancelled.' : 'এই অর্ডারটি বাতিল করা হয়েছে।'}</span>
                                    </div>
                                ) : (
                                    <div className="relative flex justify-between items-center px-2">
                                        {/* Progress Bar Background */}
                                        <div className="absolute left-6 right-6 top-4 h-1 bg-gray-200 -z-0" />
                                        {STATUS_STEPS.map((step, idx) => {
                                            const stepIdx = STATUS_STEPS.findIndex((s) => s.key === selectedOrder.status);
                                            const isDone = idx <= stepIdx;
                                            const isCurrent = idx === stepIdx;

                                            return (
                                                <div key={step.key} className="flex flex-col items-center z-10">
                                                    <div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                                                            isCurrent
                                                                ? 'bg-[#2d6a27] text-white ring-4 ring-green-100'
                                                                : isDone
                                                                ? 'bg-[#2d6a27] text-white'
                                                                : 'bg-white border-2 border-gray-300 text-gray-400'
                                                        }`}
                                                    >
                                                        {isDone ? '✓' : idx + 1}
                                                    </div>
                                                    <span
                                                        className={`mt-2 text-[11px] text-center font-medium ${
                                                            isCurrent
                                                                ? 'font-bold text-[#2d6a27]'
                                                                : isDone
                                                                ? 'text-gray-800'
                                                                : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {language === 'en' ? step.labelEn : step.labelBn}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Items List */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                                    {language === 'en' ? 'Ordered Items' : 'অর্ডারের পণ্যসমূহ'}
                                </h4>
                                <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                                            <div className="h-12 w-12 shrink-0 rounded-lg bg-white border border-gray-200 overflow-hidden">
                                                {item.product_image ? (
                                                    <img src={item.product_image} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full bg-gray-100" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{item.product_name}</p>
                                                <p className="text-xs text-gray-500">
                                                    ৳{item.price.toLocaleString()} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">৳{item.total.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery & Financial Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        {language === 'en' ? 'Delivery Address' : 'ডেলিভারি ঠিকানা'}
                                    </h5>
                                    <p className="text-xs font-bold text-gray-800">{selectedOrder.customer_name}</p>
                                    <p className="text-xs text-gray-600">{selectedOrder.customer_phone}</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {selectedOrder.address}, {selectedOrder.upazila ? `${selectedOrder.upazila}, ` : ''}
                                        {selectedOrder.district}, {selectedOrder.division}
                                    </p>
                                    <p className="text-[11px] text-[#2d6a27] font-semibold mt-1">
                                        {selectedOrder.delivery_area === 'inside_dhaka'
                                            ? language === 'en' ? 'Inside Dhaka (৳60)' : 'ঢাকার ভেতরে (৳৬০)'
                                            : language === 'en' ? 'Outside Dhaka (৳120)' : 'ঢাকার বাইরে (৳১২০)'}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/50 space-y-1.5 text-xs">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        {language === 'en' ? 'Payment Summary' : 'পেমেন্ট সামারি'}
                                    </h5>
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t.subtotal}</span>
                                        <span className="font-semibold text-gray-800">৳{selectedOrder.subtotal.toLocaleString()}</span>
                                    </div>
                                    {selectedOrder.discount > 0 && (
                                        <div className="flex justify-between text-green-700">
                                            <span>{t.discount} {selectedOrder.coupon_code ? `(${selectedOrder.coupon_code})` : ''}</span>
                                            <span className="font-semibold">-৳{selectedOrder.discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t.deliveryCharge}</span>
                                        <span className="font-semibold text-gray-800">৳{selectedOrder.delivery_charge.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-gray-900">
                                        <span>{t.total}</span>
                                        <span className="text-[#2d6a27]">৳{selectedOrder.total.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 pt-1">
                                        {language === 'en' ? 'Payment: Cash on Delivery' : 'পদ্ধতি: ক্যাশ অন ডেলিভারি'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 border-t border-gray-100 bg-[#f8faf9] flex justify-end">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="rounded-xl bg-gray-200 px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-300 transition"
                            >
                                {language === 'en' ? 'Close' : 'বন্ধ করুন'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
