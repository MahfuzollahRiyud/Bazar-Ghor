import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link } from '@inertiajs/react';
import { Facebook, Headphones, Package, Phone, Shield, Star, Truck } from 'lucide-react';

export default function About() {
    const { t, language } = useLanguage();

    const perks = [
        { icon: <Shield size={18} />, label: t.feat1Title },
        { icon: <Truck size={18} />, label: t.feat2Title },
        { icon: <Headphones size={18} />, label: t.feat3Title },
        { icon: <Star size={18} />, label: t.feat4Title },
    ];

    return (
        <>
            <Head title={`${t.aboutUs} — Bazar Ghor`}>
                <meta name="description" content="Learn more about Bazar Ghor. Your trusted gadget destination in Bangladesh." />
            </Head>

            {/* Hero */}
            <div className="bg-gradient-to-r from-[#143312] to-[#2d6a27] py-14 text-white text-center">
                <div className="mx-auto max-w-3xl px-4">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{t.aboutUs}</h1>
                    <p className="text-base md:text-lg text-green-200">
                        {language === 'en' ? 'Your Trusted Online Gadget Destination' : 'আপনার বিশ্বস্ত অনলাইন গ্যাজেট স্টোর'}
                    </p>
                </div>
            </div>

            {/* About Content */}
            <section className="py-16">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
                        <div className="overflow-hidden rounded-3xl shadow-xl border border-gray-100 bg-white">
                            <img
                                src="/images/banner.jpg"
                                alt="Bazar Ghor Team"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-bold text-[#8b4513] uppercase tracking-wider">Our Story</p>
                            <h2 className="mb-4 text-3xl font-extrabold text-gray-900">{t.whyChooseUs}</h2>
                            <p className="mb-4 text-sm text-gray-600 leading-relaxed">
                                {language === 'en'
                                    ? 'Bazar Ghor is one of the most reliable and customer-centric gadget stores in Bangladesh. We believe that everyone deserves access to top-notch smart technology and electronics at affordable, competitive prices.'
                                    : 'Bazar Ghor হলো বাংলাদেশের একটি বিশ্বস্ত অনলাইন গ্যাজেট স্টোর। আমরা বিশ্বাস করি প্রতিটি মানুষ সেরা মানের টেকনোলজি পণ্য সাশ্রয়ী মূল্যে পাওয়ার অধিকার রাখে।'}
                            </p>
                            <p className="mb-6 text-sm text-gray-600 leading-relaxed">
                                {language === 'en'
                                    ? 'Our mission is "Better Tech, Better Life". From wireless airbuds and studio headphones to precision trimmers, smart watches, and high-speed chargers, we handpick and test every device to ensure lasting satisfaction.'
                                    : 'আমাদের লক্ষ্য হলো — "Better Tech, Better Life"। এয়ারবাডস থেকে শুরু করে ট্রিমার, হেডফোন থেকে স্মার্টওয়াচ — আমরা সব ধরনের আসল গ্যাজেট সরবরাহ করি।'}
                            </p>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {perks.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2.5 rounded-xl bg-green-50 p-3 border border-green-100/60">
                                        <span className="text-[#2d6a27]">{item.icon}</span>
                                        <span className="text-xs font-bold text-gray-800">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <Link
                                    href="/shop"
                                    className="rounded-xl bg-[#2d6a27] px-7 py-3.5 font-bold text-xs text-white shadow-md transition hover:bg-[#23531f] active:scale-95"
                                >
                                    {t.shopNow} →
                                </Link>
                                <Link
                                    href="/contact"
                                    className="rounded-xl border border-gray-300 bg-white px-7 py-3.5 font-bold text-xs text-gray-700 transition hover:bg-gray-50"
                                >
                                    {t.contactUs}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
