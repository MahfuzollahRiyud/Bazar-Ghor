import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Language = 'en' | 'bn';

export interface Translations {
    // Top Bar & Navigation
    topBarDelivery: string;
    phone: string;
    adminLogin: string;
    dashboard: string;
    login: string;
    register: string;
    loginOrRegister: string;
    myAccount: string;
    myOrders: string;
    logout: string;
    guestCheckoutNotice: string;
    createAccountWithOrder: string;
    setPassword: string;
    home: string;
    shop: string;
    aboutUs: string;
    contactUs: string;
    searchPlaceholder: string;
    search: string;
    cart: string;
    account: string;

    // Actions & Buttons
    addToCart: string;
    addedToCart: string;
    buyNow: string;
    viewOptions: string;
    viewCart: string;
    checkout: string;
    proceedToCheckout: string;
    shopNow: string;
    viewAll: string;
    outOfStock: string;
    inStock: string;
    apply: string;
    remove: string;
    clearCart: string;
    orderNow: string;
    placeOrder: string;
    processing: string;

    // Badges & Status
    off: string;
    featured: string;
    latest: string;
    specialOffer: string;
    whyChooseUs: string;
    categories: string;
    newArrivals: string;
    relatedProducts: string;

    // Features
    feat1Title: string;
    feat1Desc: string;
    feat2Title: string;
    feat2Desc: string;
    feat3Title: string;
    feat3Desc: string;
    feat4Title: string;
    feat4Desc: string;

    // Why us
    why1Title: string;
    why1Desc: string;
    why2Title: string;
    why2Desc: string;
    why3Title: string;
    why3Desc: string;

    // Delivery & Pricing
    insideDhakaDelivery: string;
    outsideDhakaDelivery: string;
    cashOnDelivery: string;
    deliveryCharge: string;
    subtotal: string;
    discount: string;
    total: string;
    insideDhaka: string;
    outsideDhaka: string;

    // Cart & Checkout
    shoppingCart: string;
    emptyCartTitle: string;
    emptyCartDesc: string;
    product: string;
    quantity: string;
    price: string;
    orderSummary: string;
    customerInfo: string;
    fullName: string;
    phoneNumber: string;
    emailOptional: string;
    deliveryAddress: string;
    division: string;
    district: string;
    upazila: string;
    fullAddress: string;
    deliveryArea: string;
    notesOptional: string;
    couponCode: string;
    haveCoupon: string;
    paymentMethod: string;
    orderSuccessTitle: string;
    orderSuccessDesc: string;
    orderNumber: string;
    invoiceDetails: string;
    backToHome: string;

    // Footer
    footerBrandDesc: string;
    quickLinks: string;
    allRightsReserved: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
    en: {
        topBarDelivery: '🚚 Inside Dhaka ৳60 | Outside Dhaka ৳120 Delivery Charge',
        phone: '01613-545166',
        adminLogin: 'Admin Login',
        dashboard: 'Dashboard',
        login: 'Login',
        register: 'Register',
        loginOrRegister: 'Login / Register',
        myAccount: 'My Account',
        myOrders: 'My Orders',
        logout: 'Log Out',
        guestCheckoutNotice: 'Purchase directly without creating an account',
        createAccountWithOrder: 'Create an account to track your orders easily',
        setPassword: 'Set a Password',
        home: 'Home',
        shop: 'Shop',
        aboutUs: 'About Us',
        contactUs: 'Contact Us',
        searchPlaceholder: 'Search gadgets, airbuds...',
        search: 'Search',
        cart: 'Cart',
        account: 'Account',

        addToCart: 'Add to Cart',
        addedToCart: 'Added!',
        buyNow: 'Buy Now',
        viewOptions: 'View Options',
        viewCart: 'View Cart',
        checkout: 'Checkout',
        proceedToCheckout: 'Proceed to Checkout',
        shopNow: 'Shop Now',
        viewAll: 'View All',
        outOfStock: 'Out of Stock',
        inStock: 'In Stock',
        apply: 'Apply',
        remove: 'Remove',
        clearCart: 'Clear Cart',
        orderNow: 'Order Now',
        placeOrder: 'Confirm Order (Cash on Delivery)',
        processing: 'Processing...',

        off: 'OFF',
        featured: 'Featured',
        latest: 'Latest',
        specialOffer: 'Special Offer',
        whyChooseUs: 'Why Choose Bazar Ghor?',
        categories: 'Categories',
        newArrivals: 'New Arrivals',
        relatedProducts: 'Related Products',

        feat1Title: '100% Original',
        feat1Desc: 'All products are 100% authentic and tested',
        feat2Title: 'Fast Delivery',
        feat2Desc: '1-2 days in Dhaka, 3-5 days nationwide',
        feat3Title: '24/7 Support',
        feat3Desc: 'Friendly assistance via Phone & Facebook',
        feat4Title: 'Best Price',
        feat4Desc: 'Competitive prices guaranteed on gadgets',

        why1Title: 'Reliability & Trust',
        why1Desc: 'We supply high-quality gadgets directly to your doorstep with guaranteed authenticity.',
        why2Title: 'Affordable Pricing',
        why2Desc: 'Get the best market prices, regular discounts, and special promotional offers.',
        why3Title: 'Easy Returns & Support',
        why3Desc: 'Friendly after-sales service and dedicated support for any inquiries or product issues.',

        insideDhakaDelivery: 'Inside Dhaka: ৳60',
        outsideDhakaDelivery: 'Outside Dhaka: ৳120',
        cashOnDelivery: 'Cash on Delivery Nationwide',
        deliveryCharge: 'Delivery Charge',
        subtotal: 'Subtotal',
        discount: 'Discount',
        total: 'Total',
        insideDhaka: 'Inside Dhaka (৳60)',
        outsideDhaka: 'Outside Dhaka (৳120)',

        shoppingCart: 'Shopping Cart',
        emptyCartTitle: 'Your cart is empty',
        emptyCartDesc: 'Explore our latest gadgets and add your favorites to cart!',
        product: 'Product',
        quantity: 'Quantity',
        price: 'Price',
        orderSummary: 'Order Summary',
        customerInfo: 'Customer Information',
        fullName: 'Full Name',
        phoneNumber: 'Phone Number',
        emailOptional: 'Email (Optional)',
        deliveryAddress: 'Delivery Address',
        division: 'Division',
        district: 'District',
        upazila: 'Upazila / Area',
        fullAddress: 'Full Delivery Address (House, Road, Area)',
        deliveryArea: 'Delivery Area',
        notesOptional: 'Order Notes (Optional)',
        couponCode: 'Coupon Code',
        haveCoupon: 'Have a coupon code?',
        paymentMethod: 'Payment Method',
        orderSuccessTitle: 'Order Placed Successfully!',
        orderSuccessDesc: 'Thank you for shopping with Bazar Ghor. Our team will call you shortly to confirm your order.',
        orderNumber: 'Order Number',
        invoiceDetails: 'Order Details',
        backToHome: 'Back to Home',

        footerBrandDesc: 'Your trusted online gadget destination. Premium quality electronics, smart accessories, and audio gear delivered nationwide with Cash on Delivery.',
        quickLinks: 'Quick Links',
        allRightsReserved: 'All rights reserved.',
    },
    bn: {
        topBarDelivery: '🚚 ঢাকার ভেতরে ৳৬০ | ঢাকার বাইরে ৳১২০ ডেলিভারি চার্জ',
        phone: '০১৬১৩-৫৪৫১৬৬',
        adminLogin: 'এডমিন লগইন',
        dashboard: 'ড্যাশবোর্ড',
        login: 'লগইন',
        register: 'রেজিস্টার',
        loginOrRegister: 'লগইন / রেজিস্টার',
        myAccount: 'আমার অ্যাকাউন্ট',
        myOrders: 'আমার অর্ডারসমূহ',
        logout: 'লগআউট',
        guestCheckoutNotice: 'অ্যাকাউন্ট না খুলেও সরাসরি অর্ডার করুন',
        createAccountWithOrder: 'পরবর্তীতে অর্ডার ট্র্যাকিং ও সুবিধার জন্য অ্যাকাউন্ট তৈরি করুন',
        setPassword: 'পাসওয়ার্ড নির্ধারণ করুন',
        home: 'হোম',
        shop: 'শপ',
        aboutUs: 'আমাদের সম্পর্কে',
        contactUs: 'যোগাযোগ',
        searchPlaceholder: 'পণ্য খুঁজুন...',
        search: 'অনুসন্ধান',
        cart: 'কার্ট',
        account: 'অ্যাকাউন্ট',

        addToCart: 'কার্টে যোগ করুন',
        addedToCart: 'যোগ হয়েছে!',
        buyNow: 'এখনই কিনুন',
        viewOptions: 'অপশন দেখুন',
        viewCart: 'কার্ট দেখুন',
        checkout: 'চেকআউট',
        proceedToCheckout: 'চেকআউটে যান',
        shopNow: 'এখনই কিনুন',
        viewAll: 'সব দেখুন',
        outOfStock: 'স্টক নেই',
        inStock: 'স্টকে আছে',
        apply: 'প্রয়োগ করুন',
        remove: 'মুছুন',
        clearCart: 'কার্ট খালি করুন',
        orderNow: 'এখনই অর্ডার করুন',
        placeOrder: 'অর্ডার নিশ্চিত করুন (ক্যাশ অন ডেলিভারি)',
        processing: 'অপেক্ষা করুন...',

        off: 'ছাড়',
        featured: 'ফিচার্ড',
        latest: 'লেটেস্ট',
        specialOffer: 'বিশেষ অফার',
        whyChooseUs: 'কেন Bazar Ghor বেছে নেবেন?',
        categories: 'ক্যাটাগরি',
        newArrivals: 'নতুন পণ্য',
        relatedProducts: 'সম্পর্কিত পণ্য',

        feat1Title: '১০০% অরিজিনাল',
        feat1Desc: 'সব পণ্য সম্পূর্ণ আসল ও মানসম্পন্ন',
        feat2Title: 'দ্রুত ডেলিভারি',
        feat2Desc: 'ঢাকায় ১-২ দিন, সারাদেশে ৩-৫ দিন',
        feat3Title: 'সার্বক্ষণিক সাপোর্ট',
        feat3Desc: 'কল ও ফেসবুকে সর্বদা সহায়তা পাবেন',
        feat4Title: 'সেরা দাম',
        feat4Desc: 'বাজারের সেরা দামে আসল পণ্য',

        why1Title: 'বিশ্বস্ততা ও নিশ্চয়তা',
        why1Desc: 'আমরা প্রতিটি পণ্যের গুণমান যাচাই করে সরাসরি আপনার কাছে পৌঁছে দিই।',
        why2Title: 'সাশ্রয়ী মূল্য',
        why2Desc: 'বাজারের সেরা দামে পণ্য ও নিয়মিত আকর্ষণীয় ছাড়ের সুযোগ।',
        why3Title: 'সহজ রিটার্ন ও সাপোর্ট',
        why3Desc: 'যেকোনো প্রয়োজনে আমাদের সাপোর্ট টিম দ্রুত সহায়তা প্রদান করে।',

        insideDhakaDelivery: 'ঢাকার ভেতরে: ৳৬০',
        outsideDhakaDelivery: 'ঢাকার বাইরে: ৳১২০',
        cashOnDelivery: 'সারাদেশে ক্যাশ অন ডেলিভারি',
        deliveryCharge: 'ডেলিভারি চার্জ',
        subtotal: 'সাবটোটাল',
        discount: 'ডিসকাউন্ট',
        total: 'সর্বমোট',
        insideDhaka: 'ঢাকার ভেতরে (৳৬০)',
        outsideDhaka: 'ঢাকার বাইরে (৳১২০)',

        shoppingCart: 'শপিং কার্ট',
        emptyCartTitle: 'আপনার কার্ট খালি!',
        emptyCartDesc: 'আমাদের শপ থেকে পছন্দের গ্যাজেট কার্টে যোগ করুন।',
        product: 'পণ্য',
        quantity: 'পরিমাণ',
        price: 'মূল্য',
        orderSummary: 'অর্ডার সামারি',
        customerInfo: 'আপনার তথ্য',
        fullName: 'পূর্ণ নাম',
        phoneNumber: 'ফোন নম্বর',
        emailOptional: 'ইমেইল (ঐচ্ছিক)',
        deliveryAddress: 'ডেলিভারি ঠিকানা',
        division: 'বিভাগ',
        district: 'জেলা',
        upazila: 'উপজেলা / থানা',
        fullAddress: 'সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা)',
        deliveryArea: 'ডেলিভারি এলাকা',
        notesOptional: 'অতিরিক্ত নোট (ঐচ্ছিক)',
        couponCode: 'কুপন কোড',
        haveCoupon: 'কুপন কোড আছে?',
        paymentMethod: 'পেমেন্ট পদ্ধতি',
        orderSuccessTitle: 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!',
        orderSuccessDesc: 'Bazar Ghor-এ কেনাকাটার জন্য ধন্যবাদ। আমাদের প্রতিনিধি শীঘ্রই ফোন করে অর্ডার কনফার্ম করবেন।',
        orderNumber: 'অর্ডার নম্বর',
        invoiceDetails: 'অর্ডারের বিবরণ',
        backToHome: 'হোমে ফিরে যান',

        footerBrandDesc: 'আপনার বিশ্বস্ত অনলাইন গ্যাজেট স্টোর। সেরা মানের পণ্য, সেরা দামে — দ্রুত ডেলিভারিতে আপনার দোরগোড়ায়।',
        quickLinks: 'দ্রুত লিংক',
        allRightsReserved: 'সর্বস্বত্ব সংরক্ষিত।',
    },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Default to 'en' as requested: "amader primary language english thakbe"
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('bazar_ghor_lang');
            if (saved === 'en' || saved === 'bn') return saved;
        }
        return 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('bazar_ghor_lang', lang);
        }
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'bn' : 'en');
    };

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                toggleLanguage,
                t: TRANSLATIONS[language],
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextType {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
