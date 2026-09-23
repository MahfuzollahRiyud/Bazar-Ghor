import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link } from '@inertiajs/react';
import { Award, CheckSquare, CreditCard, FileText, Gavel, HelpCircle, PhoneCall, ShieldAlert, Truck } from 'lucide-react';

export default function TermsAndConditions() {
    const { t, language } = useLanguage();

    const sections = language === 'en' ? [
        {
            icon: <CheckSquare className="text-[#2d6a27]" size={22} />,
            title: '1. Acceptance of Terms & Order Placement',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        By visiting, browsing, or placing an order on <strong>Bazar Ghor</strong>, you agree to be bound by these Terms and Conditions. Please review them carefully before placing an order.
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>You confirm that all personal details (full name, phone number, and delivery address) provided during checkout are true, accurate, and current.</li>
                        <li>An order placed on the website represents an offer to purchase. The order is officially confirmed once our support team contacts you via phone or WhatsApp verification.</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <CreditCard className="text-[#2d6a27]" size={22} />,
            title: '2. Pricing, Currency & Payments',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>All product prices displayed on the store are denominated in <strong>Bangladeshi Taka (৳ / BDT)</strong> and are inclusive of standard local taxes.</li>
                        <li><strong>Cash on Delivery (COD):</strong> Customers can pay in cash directly to the delivery person upon receiving the parcel at their doorstep.</li>
                        <li>Prices are subject to change without prior notice; however, any confirmed order will strictly honor the price stated at the time of order placement.</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <Truck className="text-[#2d6a27]" size={22} />,
            title: '3. Shipping Charges & Delivery Timeline',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li><strong>Inside Dhaka City:</strong> Delivery charge is ৳60 (Standard delivery timeline: 24 to 48 hours).</li>
                        <li><strong>Outside Dhaka (Nationwide):</strong> Delivery charge is ৳120 (Standard delivery timeline: 3 to 5 business days).</li>
                        <li>Delivery times may occasionally vary due to inclement weather, political strikes, or remote courier hub logistics. We keep you updated via SMS or phone tracking.</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <Award className="text-[#2d6a27]" size={22} />,
            title: '4. Product Authenticity & Warranty Terms',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        We guarantee that all smart gadgets, airbuds, headphones, and chargers sold on Bazar Ghor are 100% authentic and sourced from authorized channels.
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>Items are covered under our <strong>7-Day Replacement Policy</strong> for any verified factory defects.</li>
                        <li>Brand warranty (where applicable) is fulfilled by the respective brand's authorized service centers in Bangladesh.</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <ShieldAlert className="text-[#2d6a27]" size={22} />,
            title: '5. Order Cancellation & Misuse Prevention',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        Bazar Ghor reserves the right to refuse or cancel any order under circumstances including:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>Inability to reach the customer via phone call for verification within 48 hours.</li>
                        <li>Incomplete or fraudulent delivery address/contact details.</li>
                        <li>Sudden manufacturer stock unavailability (customer will be immediately informed).</li>
                    </ul>
                    <div className="rounded-xl bg-gray-50 p-4 border border-gray-200 text-xs sm:text-sm text-gray-700">
                        Customers may cancel their order free of charge before the parcel is dispatched by our courier department by calling <strong>01613-545166</strong>.
                    </div>
                </div>
            ),
        },
        {
            icon: <Gavel className="text-[#2d6a27]" size={22} />,
            title: '6. Governing Law & Consumer Protection',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        These terms and conditions are governed by and construed in accordance with the applicable laws of the People's Republic of Bangladesh, including the Consumers' Right Protection Act, 2009.
                    </p>
                </div>
            ),
        },
    ] : [
        {
            icon: <CheckSquare className="text-[#2d6a27]" size={22} />,
            title: '১. শর্তাবলীর গ্রহণযোগ্যতা ও অর্ডার প্রক্রিয়া',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        <strong>Bazar Ghor</strong> ওয়েবসাইট ব্রাউজ বা অর্ডার করার মাধ্যমে আপনি এই নিয়মাবলী ও শর্তাবলীতে সম্মত হচ্ছেন। অর্ডার করার পূর্বে দয়া করে শর্তাবলী মনোযোগ সহকারে পড়ে নিন।
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>অর্ডারের সময় আপনার নাম, সচল মোবাইল নম্বর এবং সঠিক ডেলিভারি ঠিকানা প্রদান করা আবশ্যক।</li>
                        <li>ওয়েবসাইটে অর্ডার করার পর আমাদের কাস্টমার সাপোর্ট টিম কল বা হোয়াটসঅ্যাপের মাধ্যমে যোগাযোগ করে অর্ডার চূড়ান্তভাবে নিশ্চিত করবেন।</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <CreditCard className="text-[#2d6a27]" size={22} />,
            title: '২. পণ্যের মূল্য ও পেমেন্ট পদ্ধতি',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>আমাদের ওয়েবসাইটে প্রদর্শিত সকল পণ্যের মূল্য <strong>বাংলাদেশি টাকায় (৳)</strong> নির্ধারিত।</li>
                        <li><strong>ক্যাশ অন ডেলিভারি (COD):</strong> গ্রাহক পণ্য হাতে পেয়ে ডেলিভারি ম্যানের কাছে সরাসরি নগদ টাকা পরিশোধ করতে পারবেন।</li>
                        <li>একবার অর্ডার কনফার্ম হয়ে গেলে পণ্য ডেলিভারির সময় কোনো অতিরিক্ত বা লুকায়িত চার্জ নেওয়া হবে না।</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <Truck className="text-[#2d6a27]" size={22} />,
            title: '৩. ডেলিভারি চার্জ ও সময়সীমা',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li><strong>ঢাকা সিটির ভেতরে:</strong> ডেলিভারি চার্জ ৳৬০ (ডেলিভারি সময়: ১ থেকে ২ দিন)।</li>
                        <li><strong>ঢাকার বাইরে (সারাদেশে):</strong> ডেলিভারি চার্জ ৳১২০ (ডেলিভারি সময়: ৩ থেকে ৫ দিন)।</li>
                        <li>প্রাকৃতিক দুর্যোগ, পরিবহন ধর্মঘট বা অনিবার্য কোনো কারণে ডেলিভারিতে বিলম্ব হলে গ্রাহককে সার্বক্ষণিক আপডেট দেওয়া হবে।</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <Award className="text-[#2d6a27]" size={22} />,
            title: '৪. পণ্যের গুণমান ও ওয়ারেন্টি নীতিমালা',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        Bazar Ghor প্রতিটি পণ্যের ১০০% মান ও অরিজিনাল হওয়ার নিশ্চয়তা দেয়:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>প্রস্তুতজনিত কোনো ত্রুটি থাকলে আমাদের <strong>৭ দিনের সহজ রিপ্লেসমেন্ট পলিসি</strong> প্রযোজ্য হবে।</li>
                        <li>ব্র্যান্ড ওয়ারেন্টি সম্বলিত পণ্যের ক্ষেত্রে ব্র্যান্ডের নির্ধারিত সার্ভিস সেন্টার থেকে সহায়তা প্রদান করা হবে।</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <ShieldAlert className="text-[#2d6a27]" size={22} />,
            title: '৫. অর্ডার বাতিল ও ভুয়া অর্ডার প্রতিরোধ',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        নিম্নোক্ত পরিস্থিতিতে Bazar Ghor যেকোনো অর্ডার বাতিল করার অধিকার সংরক্ষণ করে:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>টানা ৪৮ ঘণ্টার মধ্যে ফোনে গ্রাহকের কোনো সাড়া না পাওয়া গেলে।</li>
                        <li>ভুল বা উদ্দেশ্যমূলকভাবে বিভ্রান্তিকর ঠিকানা বা ফোন নম্বর প্রদান করলে।</li>
                        <li>আকস্মিক স্টক শেষ হয়ে গেলে (গ্রাহককে অবহিত করে তাৎক্ষণিক বিকল্প বা রিফান্ড দেওয়া হয়)।</li>
                    </ul>
                    <div className="rounded-xl bg-gray-50 p-4 border border-gray-200 text-xs sm:text-sm text-gray-700">
                        পার্সেল কুরিয়ারে পাঠানোর পূর্বে গ্রাহক চাইলে আমাদের হেল্পলাইনে <strong>০১৬১৩-৫৪৫১৬৬</strong> কল করে যেকোনো সময় বিনা খরচে অর্ডার বাতিল করতে পারবেন।
                    </div>
                </div>
            ),
        },
        {
            icon: <Gavel className="text-[#2d6a27]" size={22} />,
            title: '৬. আইনগত বাধ্যবাধকতা ও ক্রেতা অধিকার',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        এই নিয়মাবলী ও শর্তাবলী বাংলাদেশ সরকারের প্রচলিত আইন এবং ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯ অনুযায়ী পরিচালিত ও সুরক্ষিত।
                    </p>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title={`${t.termsConditions} — Bazar Ghor`}>
                <meta name="description" content="Terms and conditions of Bazar Ghor. Transparent rules, fair pricing, and customer rights." />
            </Head>

            {/* Hero Header */}
            <div className="bg-gradient-to-r from-[#143312] to-[#2d6a27] py-14 text-white text-center">
                <div className="mx-auto max-w-4xl px-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-xs mb-3 text-yellow-300">
                        <FileText size={28} />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">
                        {t.termsConditions}
                    </h1>
                    <p className="text-sm md:text-base text-green-200 max-w-2xl mx-auto">
                        {language === 'en'
                            ? 'Clear, fair, and transparent guidelines for shopping on Bazar Ghor.'
                            : 'স্বচ্ছ, নিরাপদ ও নির্ভরযোগ্য কেনাকাটার জন্য আমাদের শর্তাবলী ও দিকনির্দেশনা।'}
                    </p>
                    <p className="text-xs text-green-300/80 mt-3">
                        {language === 'en' ? 'Effective Date: September 2026' : 'কার্যকরী তারিখ: সেপ্টেম্বর ২০২৬'}
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

                    {/* Contact box */}
                    <div className="mt-10 rounded-2xl bg-white border border-gray-100 p-6 md:p-8 shadow-xs text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {language === 'en' ? 'Need Further Clarification?' : 'শর্তাবলী সংক্রান্ত কোনো স্পষ্টতা প্রয়োজন?'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-5">
                            {language === 'en'
                                ? 'Feel free to reach out to our team via phone or WhatsApp.'
                                : 'আমাদের সাপোর্ট টিম যেকোনো বিষয়ে আপনাকে তথ্য দিতে সর্বদা প্রস্তুত।'}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <a
                                href="tel:01613545166"
                                className="flex items-center gap-2 rounded-full bg-[#2d6a27] px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#23531e] shadow-sm transition"
                            >
                                <span>📞 01613-545166</span>
                            </a>
                            <a
                                href="https://wa.me/8801621270761"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 shadow-sm transition"
                            >
                                <span>💬 WhatsApp: +8801621-270761</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
