import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link } from '@inertiajs/react';
import { Facebook, MapPin, MessageCircle, Phone } from 'lucide-react';

export default function Contact() {
    const { t, language } = useLanguage();

    return (
        <>
            <Head title={`${t.contactUs} — Bazar Ghor`}>
                <meta name="description" content="Contact Bazar Ghor. Phone: 01613-545166, Facebook: onlinebazarghor." />
            </Head>

            <div className="bg-gradient-to-r from-[#143312] to-[#2d6a27] py-12 text-white text-center">
                <div className="mx-auto max-w-3xl px-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{t.contactUs}</h1>
                    <p className="text-green-200 text-sm md:text-base">
                        {language === 'en' ? 'We are always ready to assist you' : 'আমরা সবসময় আপনার সেবায় প্রস্তুত'}
                    </p>
                </div>
            </div>

            <section className="py-16">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Phone */}
                        <a
                            href="tel:01613545166"
                            className="group flex flex-col items-center rounded-2xl bg-white p-8 shadow-xs border border-gray-100 text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[#2d6a27]"
                        >
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#2d6a27] transition-all group-hover:bg-[#2d6a27] group-hover:text-white group-hover:scale-105">
                                <Phone size={26} />
                            </div>
                            <h3 className="mb-1 text-base font-bold text-gray-900">{language === 'en' ? 'Phone / WhatsApp' : 'ফোন / WhatsApp'}</h3>
                            <p className="text-[#2d6a27] font-bold text-lg">01613-545166</p>
                            <p className="mt-1 text-xs text-gray-400">{language === 'en' ? '9:00 AM — 10:00 PM' : 'সকাল ৯টা — রাত ১০টা'}</p>
                        </a>

                        {/* Facebook */}
                        <a
                            href="https://www.facebook.com/onlinebazarghor"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center rounded-2xl bg-white p-8 shadow-xs border border-gray-100 text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:border-blue-500"
                        >
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105">
                                <Facebook size={26} />
                            </div>
                            <h3 className="mb-1 text-base font-bold text-gray-900">Facebook Page</h3>
                            <p className="text-blue-600 font-bold">Bazar Ghor</p>
                            <p className="mt-1 text-xs text-gray-400">{language === 'en' ? 'Message us anytime' : 'Message করুন যেকোনো সময়'}</p>
                        </a>

                        {/* Messenger */}
                        <a
                            href="https://m.me/onlinebazarghor"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center rounded-2xl bg-white p-8 shadow-xs border border-gray-100 text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:border-purple-500"
                        >
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-all group-hover:bg-purple-600 group-hover:text-white group-hover:scale-105">
                                <MessageCircle size={26} />
                            </div>
                            <h3 className="mb-1 text-base font-bold text-gray-900">Messenger</h3>
                            <p className="text-purple-600 font-bold">{language === 'en' ? 'Send Message' : 'মেসেজ পাঠান'}</p>
                            <p className="mt-1 text-xs text-gray-400">{language === 'en' ? 'Instant Reply' : 'দ্রুত সাড়া পাবেন'}</p>
                        </a>
                    </div>

                    {/* Delivery Info */}
                    <div className="mt-12 rounded-3xl bg-gradient-to-r from-[#143312] via-[#23531f] to-[#2d6a27] p-8 md:p-10 text-white shadow-md">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-center">
                            <div>
                                <h2 className="mb-3 text-2xl font-bold flex items-center gap-2">
                                    <MapPin size={22} className="text-yellow-300" />
                                    {language === 'en' ? 'Nationwide Delivery Coverage' : 'ডেলিভারি তথ্য'}
                                </h2>
                                <p className="text-green-100 text-sm mb-4 leading-relaxed">
                                    {language === 'en'
                                        ? 'We deliver all over Bangladesh with Cash on Delivery so you can inspect your products with complete confidence.'
                                        : 'আমরা সারা বাংলাদেশে Cash on Delivery-তে পণ্য পৌঁছে দিই।'}
                                </p>
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-sm">
                                        <span>🏠 {t.insideDhaka}</span>
                                        <span className="font-bold text-[#f5a623]">৳60</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-sm">
                                        <span>🚚 {t.outsideDhaka}</span>
                                        <span className="font-bold text-[#f5a623]">৳120</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center md:border-l md:border-green-700/60 md:pl-8">
                                <p className="text-green-200 text-xs mb-3">
                                    {language === 'en' ? 'Call now to place order or inquire about any product' : 'অর্ডার করতে এখনই ফোন করুন বা আমাদের শপ থেকে কিনুন'}
                                </p>
                                <a
                                    href="tel:01613545166"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#f5a623] px-7 py-3.5 font-bold text-gray-900 shadow-md transition hover:bg-yellow-400 active:scale-95 text-sm"
                                >
                                    <Phone size={18} />
                                    01613-545166
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
