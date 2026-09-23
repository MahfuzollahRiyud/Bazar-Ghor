import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link } from '@inertiajs/react';
import { Database, Eye, FileText, Lock, Mail, Phone, ShieldCheck, UserCheck } from 'lucide-react';

export default function PrivacyPolicy() {
    const { t, language } = useLanguage();

    const sections = language === 'en' ? [
        {
            icon: <UserCheck className="text-[#2d6a27]" size={22} />,
            title: '1. Information We Collect',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        When you place an order or interact with <strong>Bazar Ghor</strong>, we collect necessary personal details to process and fulfill your orders safely:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li><strong>Contact Information:</strong> Full name, active mobile phone number, and optional email address.</li>
                        <li><strong>Delivery Details:</strong> Complete shipping address including division, district, upazila/thana, and street/house landmarks.</li>
                        <li><strong>Order Records:</strong> Items purchased, total bill amount, chosen payment method (Cash on Delivery), and order notes.</li>
                        <li><strong>Device & Usage Data:</strong> Basic browser type, device information, and IP address collected automatically to optimize your browsing experience and prevent fraudulent activities.</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <Database className="text-[#2d6a27]" size={22} />,
            title: '2. How We Use Your Information',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>Your personal information is strictly used for legitimate business purposes:</p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>To verify and confirm your order through phone call or WhatsApp message.</li>
                        <li>To generate shipping labels and dispatch your parcel via authorized courier partners (e.g., Steadfast Courier, Pathao).</li>
                        <li>To send SMS or phone notifications regarding parcel tracking and estimated delivery time.</li>
                        <li>To provide responsive customer support and resolve product replacement or warranty inquiries.</li>
                        <li>To detect and prevent fraudulent, fake, or abusive orders.</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <ShieldCheck className="text-[#2d6a27]" size={22} />,
            title: '3. Data Security & Confidentiality',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        We implement industry-standard encryption, firewall protection, and secure server protocols to safeguard your personal data against unauthorized access, alteration, or disclosure.
                    </p>
                    <div className="rounded-xl bg-green-50 p-4 border border-green-200/60 text-green-900 text-sm">
                        <strong>Our Privacy Promise:</strong> Bazar Ghor will <em>NEVER</em> sell, rent, lease, or share your phone number, email, or personal details with any third-party advertisers or telemarketing companies.
                    </div>
                </div>
            ),
        },
        {
            icon: <Lock className="text-[#2d6a27]" size={22} />,
            title: '4. Third-Party Courier Services',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        To ensure fast nationwide doorstep delivery, we share only necessary contact info (Customer Name, Mobile Number, Delivery Address, and COD Amount) with our trusted licensed delivery partners. These courier companies are legally required to keep your data confidential and use it solely for the purpose of package delivery.
                    </p>
                </div>
            ),
        },
        {
            icon: <Eye className="text-[#2d6a27]" size={22} />,
            title: '5. Cookies & Browser Analytics',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        We use minimal, privacy-respecting cookies to maintain your shopping cart items, remember your language preference (English/Bengali), and keep you logged into your customer portal. You can disable cookies in your browser settings at any time, though it may affect shopping cart persistence.
                    </p>
                </div>
            ),
        },
        {
            icon: <Mail className="text-[#2d6a27]" size={22} />,
            title: '6. Your Rights & Contacting Us',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        You have the right to inspect, update, or request the deletion of your account details at any time by visiting your <Link href="/account" className="text-[#2d6a27] font-semibold underline">Account Profile</Link> or contacting our helpline:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <a href="tel:01613545166" className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-800 border border-gray-200 hover:border-[#2d6a27] hover:text-[#2d6a27] transition">
                            <Phone size={16} className="text-[#2d6a27]" />
                            <span>Helpline: 01613-545166</span>
                        </a>
                        <a href="https://wa.me/8801621270761" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-sm font-medium text-green-800 border border-green-200 hover:bg-green-100 transition">
                            <span>WhatsApp: +8801621-270761</span>
                        </a>
                    </div>
                </div>
            ),
        },
    ] : [
        {
            icon: <UserCheck className="text-[#2d6a27]" size={22} />,
            title: '১. আমরা যেসব তথ্য সংগ্রহ করি',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        <strong>Bazar Ghor</strong> থেকে অর্ডার করার সময় বা আমাদের ওয়েবসাইট ব্রাউজ করার সময় আমরা নিরাপদে আপনার অর্ডার সম্পন্ন করার জন্য প্রয়োজনীয় কিছু তথ্য গ্রহণ করি:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li><strong>যোগাযোগের তথ্য:</strong> আপনার পূর্ণ নাম, সক্রিয় মোবাইল ফোন নম্বর ও ইমেইল (ঐচ্ছিক)।</li>
                        <li><strong>ডেলিভারি ঠিকানা:</strong> আপনার ডেলিভারি বিভাগ, জেলা, থানা/উপজেলা এবং বাসা/রোডের বিস্তারিত ঠিকানা।</li>
                        <li><strong>অর্ডারের তথ্য:</strong> অর্ডাকৃত পণ্যের নাম, পরিমাণ, সর্বমোট মূল্য, ক্যাশ অন ডেলিভারি পেমেন্ট মোড এবং ডেলিভারি নোট।</li>
                        <li><strong>ব্রাউজিং ডাটা:</strong> ওয়েবসাইটের গতি ও পারফরম্যান্স নিশ্চিত করতে সাধারণ ব্রাউজার ও আইপি তথ্য।</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <Database className="text-[#2d6a27]" size={22} />,
            title: '২. তথ্যের ব্যবহার',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>আপনার প্রদত্ত তথ্য শুধুমাত্র নিম্নোক্ত উদ্দেশ্যে ব্যবহৃত হয়:</p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>ফোন কল বা হোয়াটসঅ্যাপের মাধ্যমে আপনার অর্ডার ভেরিফাই ও কনফার্ম করার জন্য।</li>
                        <li>নির্ধারিত কুরিয়ার সার্ভিসের মাধ্যমে আপনার ঠিকানায় সঠিক সময়ে পার্সেল পৌঁছে দেওয়ার জন্য।</li>
                        <li>অর্ডার ট্র্যাকিং এবং ডেলিভারি আপডেট এসএমএস বা কলের মাধ্যমে অবহিত করার জন্য।</li>
                        <li>প্রোডাক্ট সংক্রান্ত ওয়ারেন্টি, রিপ্লেসমেন্ট বা কাস্টমার সাপোর্ট সেবা প্রদানের জন্য।</li>
                        <li>ভুয়া বা ফেক অর্ডার প্রতিরোধে নিরাপত্তা বজায় রাখা।</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <ShieldCheck className="text-[#2d6a27]" size={22} />,
            title: '৩. তথ্য নিরাপত্তা ও গোপনীয়তা',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        আপনার তথ্যের সুরক্ষায় আমরা সর্বোচ্চ সতর্ক ব্যবস্থা ও এনক্রিপশন প্রযুক্তি ব্যবহার করি যাতে কোনো অননুমোদিত ব্যক্তি আপনার ডাটাতে প্রবেশ করতে না পারে।
                    </p>
                    <div className="rounded-xl bg-green-50 p-4 border border-green-200/60 text-green-900 text-sm">
                        <strong>আমাদের অঙ্গীকার:</strong> Bazar Ghor কখনোই আপনার নাম, ফোন নম্বর বা ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষ বা বিজ্ঞাপনদাতার কাছে বিক্রি, লিজ বা আদান-প্রদান করে না।
                    </div>
                </div>
            ),
        },
        {
            icon: <Lock className="text-[#2d6a27]" size={22} />,
            title: '৪. কুরিয়ার পার্টনারদের ভূমিকা',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        আপনার পার্সেলটি বাসায় পৌঁছে দেওয়ার জন্য শুধুমাত্র নাম, মোবাইল নম্বর, ঠিকানা ও ক্যাশ অন ডেলিভারি অ্যামাউন্ট অনুমোদিত কুরিয়ার পার্টনারের (যেমন স্টিডফাস্ট, পাঠাও) কাছে হস্তান্তর করা হয়। তারা এই তথ্য অন্য কোনো কাজে ব্যবহার করতে পারে না।
                    </p>
                </div>
            ),
        },
        {
            icon: <Eye className="text-[#2d6a27]" size={22} />,
            title: '৫. কুকিজ পলিসি',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        আপনার শপিং কার্টে পণ্য জমা রাখা, বাংলা ও ইংরেজি ভাষা মনে রাখা এবং লগইন সেশন সচল রাখার জন্য নিরাপদ কুকিজ ব্যবহৃত হয়। আপনি চাইলে ব্রাউজার সেটিংসে কুকিজ বন্ধ রাখতে পারেন।
                    </p>
                </div>
            ),
        },
        {
            icon: <Mail className="text-[#2d6a27]" size={22} />,
            title: '৬. আপনার অধিকার ও যোগাযোগ',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        যেকোনো সময় আপনার একাউন্টের তথ্য পরিবর্তন বা মুছে ফেলতে <Link href="/account" className="text-[#2d6a27] font-semibold underline">আমার একাউন্ট</Link> পেজে যান অথবা আমাদের সাথে সরাসরি যোগাযোগ করুন:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <a href="tel:01613545166" className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-800 border border-gray-200 hover:border-[#2d6a27] hover:text-[#2d6a27] transition">
                            <Phone size={16} className="text-[#2d6a27]" />
                            <span>হেল্পলাইন: ০১৬১৩-৫৪৫১৬৬</span>
                        </a>
                        <a href="https://wa.me/8801621270761" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-sm font-medium text-green-800 border border-green-200 hover:bg-green-100 transition">
                            <span>হোয়াটসঅ্যাপ: +8801621-270761</span>
                        </a>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title={`${t.privacyPolicy} — Bazar Ghor`}>
                <meta name="description" content="Privacy policy of Bazar Ghor. How we protect your data and privacy." />
            </Head>

            {/* Hero Header */}
            <div className="bg-gradient-to-r from-[#143312] to-[#2d6a27] py-14 text-white text-center">
                <div className="mx-auto max-w-4xl px-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-xs mb-3 text-yellow-300">
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">
                        {t.privacyPolicy}
                    </h1>
                    <p className="text-sm md:text-base text-green-200 max-w-2xl mx-auto">
                        {language === 'en'
                            ? 'Your trust and privacy are our top priorities. Learn how we handle your personal data securely.'
                            : 'আপনার বিশ্বাস ও তথ্যের নিরাপত্তা আমাদের প্রধান অগ্রাধিকার। জানুন কীভাবে আমরা আপনার তথ্যের গোপনীয়তা রক্ষা করি।'}
                    </p>
                    <p className="text-xs text-green-300/80 mt-3">
                        {language === 'en' ? 'Last Updated: September 2026' : 'সর্বশেষ আপডেট: সেপ্টেম্বর ২০২৬'}
                    </p>
                </div>
            </div>

            {/* Content Sections */}
            <div className="py-12 md:py-16 bg-[#faf9f6]">
                <div className="mx-auto max-w-4xl px-4">
                    <div className="space-y-6">
                        {sections.map((section, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 shadow-xs hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 border border-green-100">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                                        {section.title}
                                    </h2>
                                </div>
                                {section.content}
                            </div>
                        ))}
                    </div>

                    {/* Bottom CTA / Help Box */}
                    <div className="mt-10 rounded-2xl bg-gradient-to-r from-[#1f4e1b] to-[#2d6a27] p-6 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-base md:text-lg">
                                {language === 'en' ? 'Have questions regarding our privacy practices?' : 'প্রাইভেসি পলিসি নিয়ে কোনো প্রশ্ন আছে?'}
                            </h3>
                            <p className="text-xs text-green-200 mt-1">
                                {language === 'en' ? 'Our customer support team is available 24/7 to assist you.' : 'আমাদের সাপোর্ট টিম সার্বক্ষণিক আপনার সেবায় প্রস্তুত।'}
                            </p>
                        </div>
                        <Link
                            href="/contact"
                            className="shrink-0 rounded-full bg-yellow-400 px-5 py-2.5 text-xs md:text-sm font-bold text-gray-900 shadow-md hover:bg-yellow-300 transition active:scale-95"
                        >
                            {language === 'en' ? 'Contact Support' : 'সাপোর্টে যোগাযোগ'}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
