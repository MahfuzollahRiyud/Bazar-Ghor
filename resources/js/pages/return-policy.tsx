import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock, HelpCircle, PackageCheck, PhoneCall, RefreshCw, Truck } from 'lucide-react';

export default function ReturnPolicy() {
    const { t, language } = useLanguage();

    const sections = language === 'en' ? [
        {
            icon: <PackageCheck className="text-[#2d6a27]" size={22} />,
            title: '1. Checking Parcels in Front of Delivery Agent',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        We always encourage customers to inspect their parcel when the delivery agent delivers it:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>Ensure the outer box is untampered and undamaged.</li>
                        <li>Open the parcel and verify the correct product model, color, and included accessories.</li>
                        <li>
                            If the product is broken, cracked, or noticeably incorrect, hand it back to the delivery agent immediately and call our helpline at <strong>01613-545166</strong>.
                        </li>
                    </ul>
                    <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-amber-900 text-xs sm:text-sm">
                        <strong>Important Tip:</strong> Making a quick unboxing video while opening your parcel acts as absolute proof for instant claims and fast replacement processing.
                    </div>
                </div>
            ),
        },
        {
            icon: <RefreshCw className="text-[#2d6a27]" size={22} />,
            title: '2. 7-Day Easy Replacement Guarantee',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        At <strong>Bazar Ghor</strong>, every gadget comes with our 7-Day Replacement Guarantee covering manufacturing defects:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>If the device has internal functional defects (e.g., sound failure, charging issue, buttons not responding).</li>
                        <li>If the product received does not match the specifications on our website.</li>
                        <li>Replacement will be processed with a brand-new identical product as soon as the defective item is received at our hub.</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <AlertTriangle className="text-[#2d6a27]" size={22} />,
            title: '3. Return & Replacement Conditions',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>To qualify for a valid return or replacement, the product must satisfy the following:</p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>The product must be packed in its original retail box with all included manuals, cables, and ear tips.</li>
                        <li>The product must be free from external physical drops, scratches, liquid damages, or unauthorized repair attempts.</li>
                        <li>The return request must be submitted within 7 calendar days of receipt.</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <Clock className="text-[#2d6a27]" size={22} />,
            title: '4. Refund Policy & Timelines',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        If an item is eligible for return and a replacement is out of stock, or if your order is canceled according to our policy:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li><strong>Cash on Delivery (COD) Orders:</strong> The refund will be credited directly to your personal <strong>bKash or Nagad</strong> account within <strong>3 to 7 working days</strong> upon parcel inspection.</li>
                        <li><strong>Courier Charges:</strong> If the error is ours (defective or wrong item), Bazar Ghor bears 100% of return shipping charges. For voluntary changes of mind where product has no defects, standard courier charges apply.</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <Truck className="text-[#2d6a27]" size={22} />,
            title: '5. How to Initiate a Return Step-by-Step',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                        <li>
                            <strong>Step 1:</strong> Contact our support team via phone (<strong>01613-545166</strong>) or WhatsApp (<strong>+8801621-270761</strong>).
                        </li>
                        <li>
                            <strong>Step 2:</strong> Provide your Order Number (e.g., #ORD-...) and attach a short video or photos demonstrating the issue.
                        </li>
                        <li>
                            <strong>Step 3:</strong> Once verified, our courier partner will pick up the parcel from your doorstep, or you can send it to our Dhaka office hub.
                        </li>
                        <li>
                            <strong>Step 4:</strong> Upon receiving and verifying the product at our testing desk, your replacement or refund is dispatched within 24–48 hours.
                        </li>
                    </ol>
                </div>
            ),
        },
    ] : [
        {
            icon: <PackageCheck className="text-[#2d6a27]" size={22} />,
            title: '১. ডেলিভারি ম্যানের সামনে পার্সেল চেক করা',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        ডেলিভারি ম্যান পার্সেল নিয়ে পৌঁছালে অবশ্যই তার সামনেই পার্সেলটি চেক করার জন্য আমরা অনুরোধ করি:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>বাইরের প্যাকেজিং ঠিক আছে কিনা দেখে নিন।</li>
                        <li>প্যাকেট খুলে আপনার অর্ডারকৃত মডেল, রঙ এবং সকল আনুষঙ্গিক জিনিস ঠিক আছে কিনা মিলিয়ে নিন।</li>
                        <li>
                            যদি প্রোডাক্টে কোনো ভাঙা, ফাটা বা বড় কোনো ত্রুটি থাকে, তবে ডেলিভারি ম্যানের কাছেই পার্সেলটি ফেরত দিন এবং সাথে সাথে আমাদের হেল্পলাইনে <strong>০১৬১৩-৫৪৫১৬৬</strong> নাম্বারে জানান।
                        </li>
                    </ul>
                    <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-amber-900 text-xs sm:text-sm">
                        <strong>জরুরি পরামর্শ:</strong> পার্সেল খোলার সময় একটি ছোট ভিডিও (আনবক্সিং ভিডিও) করে রাখলে যেকোনো সমস্যায় দ্রুততম সময়ে রিপ্লেসমেন্ট পেতে সবচেয়ে বড় সুবিধা হয়।
                    </div>
                </div>
            ),
        },
        {
            icon: <RefreshCw className="text-[#2d6a27]" size={22} />,
            title: '২. ৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        <strong>Bazar Ghor</strong> থেকে কেনা যেকোনো ইলেকট্রনিক্স ও স্মার্ট গ্যাজেটের সাথে থাকছে ৭ দিনের রিপ্লেসমেন্ট নিশ্চয়তা:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>যদি প্রোডাক্টে কোনো ইন্টারনাল বা টেকনিক্যাল ত্রুটি থাকে (যেমন: সাউন্ডের সমস্যা, চার্জ না হওয়া, সুইচ কাজ না করা)।</li>
                        <li>ওয়েবসাইটে দেখানো স্পেসিফিকেশনের সাথে পণ্যের অমিল থাকলে।</li>
                        <li>ত্রুটিপূর্ণ পণ্যটি আমাদের কাছে পৌঁছানোর সাথে সাথে সম্পূর্ণ নতুন আরেকটি প্রোডাক্ট পাঠিয়ে দেওয়া হয়।</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <AlertTriangle className="text-[#2d6a27]" size={22} />,
            title: '৩. রিটার্ন ও এক্সচেঞ্জের শর্তাবলী',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>রিটার্ন ও রিপ্লেসমেন্ট কার্যকর করার জন্য নিচের শর্তগুলো পূরণ হতে হবে:</p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li>প্রোডাক্টের মূল বক্স, ক্যাবল, ম্যানুয়াল এবং সকল অ্যাক্সেসরিজ সম্পূর্ণ অক্ষত থাকতে হবে।</li>
                        <li>ব্যবহারকারীর অসাবধানতায় মাটিতে পড়ে যাওয়া, ভেঙে ফেলা বা পানিতে ভেজানোর ফলে সৃষ্ট ক্ষতি ওয়ারেন্টির আওতাভুক্ত হবে না।</li>
                        <li>পণ্য হাতে পাওয়ার সর্বোচ্চ ৭ দিনের মধ্যে আমাদের অবগত করতে হবে।</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <Clock className="text-[#2d6a27]" size={22} />,
            title: '৪. রিফান্ড পলিসি ও সময়সীমা',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <p>
                        যদি কোনো কারণে ত্রুটিপূর্ণ পণ্যের রিপ্লেসমেন্ট স্টক না থাকে বা গ্রাহক নিয়মানুযায়ী রিফান্ড চান:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                        <li><strong>ক্যাশ অন ডেলিভারি (COD) অর্ডার:</strong> প্রোডাক্ট আমাদের হাতে পৌঁছানো ও কোয়ালিটি চেকের পর <strong>৩ থেকে ৭ কার্যদিবসের মধ্যে</strong> কাস্টমারের নিজস্ব <strong>বিকাশ বা নগদ</strong> একাউন্টে রিফান্ড প্রদান করা হবে।</li>
                        <li><strong>ডেলিভারি খরচ:</strong> প্রোডাক্টের কোনো সমস্যার কারণে রিটার্ন হলে সমস্ত ডেলিভারি খরচ <strong>Bazar Ghor</strong> বহন করবে।</li>
                    </ul>
                </div>
            ),
        },
        {
            icon: <Truck className="text-[#2d6a27]" size={22} />,
            title: '৫. রিটার্ন করার সহজ প্রক্রিয়া',
            content: (
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                    <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                        <li>
                            <strong>ধাপ ১:</strong> আমাদের হেল্পলাইনে <strong>০১৬১৩-৫৪৫১৬৬</strong> কল করুন অথবা হোয়াটসঅ্যাপে <strong>+8801621-270761</strong> মেসেজ দিন।
                        </li>
                        <li>
                            <strong>ধাপ ২:</strong> আপনার অর্ডার নাম্বার জানান এবং পণ্যের সমস্যা সংক্রান্ত ছবি বা ভিডিও শেয়ার করুন।
                        </li>
                        <li>
                            <strong>ধাপ ৩:</strong> আমাদের টিম দ্রুত ভেরিফাই করে কুরিয়ারের মাধ্যমে পার্সেলটি পিক-আপ করার ব্যবস্থা করবে।
                        </li>
                        <li>
                            <strong>ধাপ ৪:</strong> প্রোডাক্টটি পৌঁছানোর ২৪ থেকে ৪৮ ঘণ্টার মধ্যে নতুন প্রোডাক্ট ডেলিভারির জন্য পাঠিয়ে দেওয়া হবে অথবা রিফান্ড সম্পন্ন হবে।
                        </li>
                    </ol>
                </div>
            ),
        },
    ];

    return (
        <>
            <Head title={`${t.returnPolicy} — Bazar Ghor`}>
                <meta name="description" content="Return and refund policy of Bazar Ghor. 7 days replacement guarantee and doorstep checking." />
            </Head>

            {/* Hero Header */}
            <div className="bg-gradient-to-r from-[#143312] to-[#2d6a27] py-14 text-white text-center">
                <div className="mx-auto max-w-4xl px-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-xs mb-3 text-yellow-300">
                        <RefreshCw size={28} />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">
                        {t.returnPolicy}
                    </h1>
                    <p className="text-sm md:text-base text-green-200 max-w-2xl mx-auto">
                        {language === 'en'
                            ? 'Shop with complete peace of mind with our 7-Day Replacement Guarantee and hassle-free returns.'
                            : 'নিশ্চিন্তে কেনাকাটা করুন আমাদের ৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি এবং ক্যাশ অন ডেলিভারি চেক সুবিধায়।'}
                    </p>
                    <p className="text-xs text-green-300/80 mt-3">
                        {language === 'en' ? 'Customer Protection Guarantee' : 'গ্রাহক সুরক্ষা ও সেবা নিশ্চয়তা'}
                    </p>
                </div>
            </div>

            {/* Quick Highlights Bar */}
            <div className="border-b border-gray-100 bg-white py-6 shadow-2xs">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="flex items-center justify-center gap-3 p-2">
                            <CheckCircle2 className="text-[#2d6a27] shrink-0" size={24} />
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-900">{language === 'en' ? 'Doorstep Checking' : 'সামনে রেখে চেক'}</p>
                                <p className="text-[11px] text-gray-500">{language === 'en' ? 'Inspect before paying' : 'ডেলিভারি ম্যানের সামনে দেখুন'}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-3 p-2 border-y sm:border-y-0 sm:border-x border-gray-100">
                            <RefreshCw className="text-[#2d6a27] shrink-0" size={24} />
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-900">{language === 'en' ? '7 Days Replacement' : '৭ দিনের রিপ্লেসমেন্ট'}</p>
                                <p className="text-[11px] text-gray-500">{language === 'en' ? 'For any manufacturing defect' : 'যেকোনো প্রস্তুতজনিত ত্রুটিতে'}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-3 p-2">
                            <Clock className="text-[#2d6a27] shrink-0" size={24} />
                            <div className="text-left">
                                <p className="text-xs font-bold text-gray-900">{language === 'en' ? 'Fast Refund' : 'দ্রুত রিফান্ড'}</p>
                                <p className="text-[11px] text-gray-500">{language === 'en' ? '3-7 days via bKash/Nagad' : 'বিকাশ ও নগদে ৩-৭ দিনে'}</p>
                            </div>
                        </div>
                    </div>
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

                    {/* Support Hotline Box */}
                    <div className="mt-10 rounded-2xl bg-white border border-gray-100 p-6 md:p-8 shadow-xs text-center">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-[#2d6a27] mb-3">
                            <PhoneCall size={24} />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                            {language === 'en' ? 'Need Help with a Return or Exchange?' : 'রিটার্ন বা রিপ্লেসমেন্ট সংক্রান্ত যেকোনো তথ্যে'}
                        </h3>
                        <p className="text-sm text-gray-600 max-w-md mx-auto mb-5">
                            {language === 'en'
                                ? 'Our representative is always ready to guide you through the process quickly.'
                                : 'আমাদের কাস্টমার কেয়ার টিম আপনাকে দ্রুততম সময়ে সহায়তা প্রদান করবে।'}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <a
                                href="tel:01613545166"
                                className="flex items-center gap-2 rounded-full bg-[#2d6a27] px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#23531e] shadow-sm transition"
                            >
                                <span>📞 Helpline: 01613-545166</span>
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
