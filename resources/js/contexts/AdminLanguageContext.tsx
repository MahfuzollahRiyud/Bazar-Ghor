import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type AdminLanguage = 'en' | 'bn';

export interface AdminTranslations {
    // Navigation
    dashboard: string;
    products: string;
    categories: string;
    media: string;
    orders: string;
    coupons: string;
    customers: string;
    viewStore: string;
    logout: string;

    // Actions & Common
    actions: string;
    add: string;
    edit: string;
    delete: string;
    save: string;
    update: string;
    cancel: string;
    close: string;
    search: string;
    filter: string;
    all: string;
    status: string;
    active: string;
    inactive: string;
    loading: string;
    processing: string;
    select: string;
    upload: string;
    change: string;
    remove: string;
    total: string;
    date: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    price: string;

    // Customers
    customerManagement: string;
    customerList: string;
    totalCustomers: string;
    activeBuyers: string;
    customerRevenue: string;
    searchCustomersPlaceholder: string;
    ordersCount: string;
    totalSpent: string;
    joinedDate: string;
    noCustomersFound: string;
    customerDetails: string;
    recentOrders: string;

    // Categories
    categoryManagement: string;
    newCategory: string;
    editCategory: string;
    categoryName: string;
    slug: string;
    description: string;
    sortOrder: string;
    categoryImage: string;
    chooseFromMedia: string;
    uploadNewImage: string;
    deleteCategoryConfirm: string;
    categoryAddedSuccess: string;
    categoryUpdatedSuccess: string;
    categoryDeletedSuccess: string;
}

const TRANSLATIONS: Record<AdminLanguage, AdminTranslations> = {
    en: {
        dashboard: 'Dashboard',
        products: 'Products',
        categories: 'Categories',
        media: 'Media Library',
        orders: 'Orders',
        coupons: 'Coupons',
        customers: 'Customers',
        viewStore: 'View Storefront',
        logout: 'Log Out',

        actions: 'Actions',
        add: 'Add New',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        update: 'Update',
        cancel: 'Cancel',
        close: 'Close',
        search: 'Search...',
        filter: 'Filter',
        all: 'All',
        status: 'Status',
        active: 'Active',
        inactive: 'Inactive',
        loading: 'Loading...',
        processing: 'Processing...',
        select: 'Select',
        upload: 'Upload',
        change: 'Change',
        remove: 'Remove',
        total: 'Total',
        date: 'Date',
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        address: 'Address',
        price: 'Price',

        customerManagement: 'Customer Management',
        customerList: 'Registered Customers',
        totalCustomers: 'Total Customers',
        activeBuyers: 'Active Buyers',
        customerRevenue: 'Total Customer Revenue',
        searchCustomersPlaceholder: 'Search by name, email, phone or district...',
        ordersCount: 'Orders',
        totalSpent: 'Total Spent',
        joinedDate: 'Joined Date',
        noCustomersFound: 'No customers found matching your criteria.',
        customerDetails: 'Customer Profile & Information',
        recentOrders: 'Recent Orders',

        categoryManagement: 'Category Management',
        newCategory: 'New Category',
        editCategory: 'Edit Category',
        categoryName: 'Category Name',
        slug: 'Slug',
        description: 'Description',
        sortOrder: 'Sort Order',
        categoryImage: 'Category Image',
        chooseFromMedia: 'Media Library',
        uploadNewImage: 'Upload File',
        deleteCategoryConfirm: 'Are you sure you want to delete this category?',
        categoryAddedSuccess: 'Category created successfully!',
        categoryUpdatedSuccess: 'Category updated successfully!',
        categoryDeletedSuccess: 'Category deleted successfully!',
    },
    bn: {
        dashboard: 'ড্যাশবোর্ড',
        products: 'পণ্য',
        categories: 'ক্যাটাগরি',
        media: 'মিডিয়া লাইব্রেরি',
        orders: 'অর্ডার',
        coupons: 'কুপন',
        customers: 'কাস্টমার',
        viewStore: 'শপ দেখুন',
        logout: 'লগআউট',

        actions: 'অ্যাকশন',
        add: 'নতুন যোগ করুন',
        edit: 'সম্পাদনা',
        delete: 'মুছুন',
        save: 'সংরক্ষণ করুন',
        update: 'আপডেট করুন',
        cancel: 'বাতিল',
        close: 'বন্ধ করুন',
        search: 'অনুসন্ধান...',
        filter: 'ফিল্টার',
        all: 'সব',
        status: 'স্ট্যাটাস',
        active: 'সক্রিয়',
        inactive: 'নিষ্ক্রিয়',
        loading: 'লোড হচ্ছে...',
        processing: 'অপেক্ষা করুন...',
        select: 'সিলেক্ট করুন',
        upload: 'আপলোড করুন',
        change: 'পরিবর্তন করুন',
        remove: 'সরান',
        total: 'সর্বমোট',
        date: 'তারিখ',
        name: 'নাম',
        phone: 'ফোন',
        email: 'ইমেইল',
        address: 'ঠিকানা',
        price: 'মূল্য',

        customerManagement: 'গ্রাহক ব্যবস্থাপনা',
        customerList: 'নিবন্ধিত গ্রাহক তালিকা',
        totalCustomers: 'মোট গ্রাহক',
        activeBuyers: 'অর্ডারকারী গ্রাহক',
        customerRevenue: 'গ্রাহকদের মোট কেনাকাটা',
        searchCustomersPlaceholder: 'নাম, ইমেইল, ফোন অথবা জেলা দিয়ে খুঁজুন...',
        ordersCount: 'অর্ডার সংখ্যা',
        totalSpent: 'মোট খরচ',
        joinedDate: 'যোগদানের তারিখ',
        noCustomersFound: 'কোনো গ্রাহক পাওয়া যায়নি।',
        customerDetails: 'গ্রাহকের বিস্তারিত তথ্য',
        recentOrders: 'সাম্প্রতিক অর্ডারসমূহ',

        categoryManagement: 'ক্যাটাগরি ব্যবস্থাপনা',
        newCategory: 'নতুন ক্যাটাগরি',
        editCategory: 'ক্যাটাগরি সম্পাদনা',
        categoryName: 'ক্যাটাগরির নাম',
        slug: 'স্লাগ',
        description: 'বিবরণ',
        sortOrder: 'ক্রম নম্বর',
        categoryImage: 'ছবি',
        chooseFromMedia: 'মিডিয়া লাইব্রেরি',
        uploadNewImage: 'ছবি আপলোড',
        deleteCategoryConfirm: 'আপনি কি নিশ্চিত এই ক্যাটাগরি মুছে ফেলতে চান?',
        categoryAddedSuccess: 'ক্যাটাগরি সফলভাবে তৈরি হয়েছে!',
        categoryUpdatedSuccess: 'ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে!',
        categoryDeletedSuccess: 'ক্যাটাগরি মুছে ফেলা হয়েছে!',
    },
};

interface AdminLanguageContextType {
    language: AdminLanguage;
    setLanguage: (lang: AdminLanguage) => void;
    toggleLanguage: () => void;
    t: AdminTranslations;
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
    // Default language is strictly English ('en') as requested
    const [language, setLanguageState] = useState<AdminLanguage>('en');

    useEffect(() => {
        const saved = localStorage.getItem('bazarghor_admin_lang');
        if (saved === 'en' || saved === 'bn') {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: AdminLanguage) => {
        setLanguageState(lang);
        localStorage.setItem('bazarghor_admin_lang', lang);
    };

    const toggleLanguage = () => {
        const next = language === 'en' ? 'bn' : 'en';
        setLanguage(next);
    };

    return (
        <AdminLanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t: TRANSLATIONS[language] }}>
            {children}
        </AdminLanguageContext.Provider>
    );
}

export function useAdminLanguage(): AdminLanguageContextType {
    const context = useContext(AdminLanguageContext);
    if (!context) {
        // Safe fallback if used outside provider
        return {
            language: 'en',
            setLanguage: () => {},
            toggleLanguage: () => {},
            t: TRANSLATIONS.en,
        };
    }
    return context;
}
