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
    blogs: string;
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

    // Hero Section
    heroSection: string;
    heroManagement: string;
    displayMode: string;
    singleBanner: string;
    sliderCarousel: string;
    useSlider: string;
    heroNotice: string;
    addSlide: string;
    editSlide: string;
    slideTitle: string;
    slideSubtitle: string;
    slideLink: string;
    moveUp: string;
    moveDown: string;
    order: string;
    reorderSuccess: string;
    noSlidesFound: string;
    originalQualityNotice: string;

    // Orders Management
    ordersManagement: string;
    allOrders: string;
    pending: string;
    confirmed: string;
    processingOrders: string;
    shipped: string;
    delivered: string;
    cancelled: string;
    customer: string;
    orderDetails: string;
    updateStatus: string;
    changeStatus: string;
    customerInfo: string;
    deliveryInfo: string;
    orderItems: string;
    subtotal: string;
    deliveryCharge: string;
    discount: string;
    items: string;
    quantity: string;
    orderNumber: string;
    paymentMethod: string;
    division: string;
    district: string;
    upazila: string;
    deliveryArea: string;
    notes: string;

    // Products Management
    productManagement: string;
    addProduct: string;
    editProduct: string;
    allProducts: string;
    inStock: string;
    outOfStock: string;
    stock: string;
    stockQuantity: string;
    category: string;
    featured: string;
    sku: string;
    salePrice: string;
    regularPrice: string;
    thumbnail: string;
    gallery: string;
    deleteProductConfirm: string;

    // Coupons
    couponManagement: string;
    newCoupon: string;
    editCoupon: string;
    couponCode: string;
    discountType: string;
    percentage: string;
    fixedAmount: string;
    discountValue: string;
    minOrderAmount: string;
    maxDiscountAmount: string;
    usageLimit: string;
    expiryDate: string;
    timesUsed: string;
    valid: string;
    expired: string;
    activateCoupon: string;
    noCouponsFound: string;
    deleteCouponConfirm: string;

    // Code Snippets
    codeSnippets: string;
    snippetsManagement: string;
    snippetsNotice: string;
    addSnippet: string;
    editSnippet: string;
    snippetTitle: string;
    placement: string;
    headerLocation: string;
    bodyLocation: string;
    footerLocation: string;
    codeContent: string;
    snippetActive: string;
    noSnippetsFound: string;
    deleteSnippetConfirm: string;
    snippetPlaceholder: string;
    headerCount: string;
    bodyCount: string;
    footerCount: string;

    // Social Media Links
    socialLinks: string;
    socialMediaManagement: string;
    socialMediaNotice: string;
    addSocialLink: string;
    editSocialLink: string;
    platform: string;
    linkTitle: string;
    targetUrl: string;
    showInHeader: string;
    showInFooter: string;
    deleteSocialLinkConfirm: string;

    // Blog Posts
    blogManagement: string;
    blogNotice: string;
    addBlog: string;
    editBlog: string;
    blogTitle: string;
    postContent: string;
    postExcerpt: string;
    featuredImage: string;
    postAuthor: string;
    publishStatus: string;
    published: string;
    draft: string;
    views: string;
    metaTitle: string;
    metaDescription: string;
    deleteBlogConfirm: string;
    noBlogsFound: string;
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
        blogs: 'Blog Posts',
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

        heroSection: 'Hero Section',
        heroManagement: 'Hero Banner & Slider Management',
        displayMode: 'Display Mode',
        singleBanner: 'Single Static Banner',
        sliderCarousel: 'Multi-Slide Carousel Slider',
        useSlider: 'Use Slider',
        heroNotice: 'Control what visitors see on the homepage hero section. You can switch between a single high-impact banner or an interactive auto-sliding carousel.',
        addSlide: 'Add New Slide',
        editSlide: 'Edit Slide',
        slideTitle: 'Title / Caption (Optional)',
        slideSubtitle: 'Subtitle (Optional)',
        slideLink: 'Link / Action URL (e.g. /shop or /shop?category=airbuds)',
        moveUp: 'Move Up',
        moveDown: 'Move Down',
        order: 'Order',
        reorderSuccess: 'Slide sequence updated successfully!',
        noSlidesFound: 'No hero slides added yet.',
        originalQualityNotice: '100% Original HD Quality: Banner images are preserved without lossy compression or blur.',

        ordersManagement: 'Order Management',
        allOrders: 'All Orders',
        pending: 'Pending',
        confirmed: 'Confirmed',
        processingOrders: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        customer: 'Customer',
        orderDetails: 'Order Details',
        updateStatus: 'Update Order Status',
        changeStatus: 'Change Status',
        customerInfo: 'Customer Information',
        deliveryInfo: 'Delivery Information',
        orderItems: 'Order Items',
        subtotal: 'Subtotal',
        deliveryCharge: 'Delivery Charge',
        discount: 'Discount',
        items: 'Items',
        quantity: 'Quantity',
        orderNumber: 'Order Number',
        paymentMethod: 'Payment Method',
        division: 'Division',
        district: 'District',
        upazila: 'Upazila / Thana',
        deliveryArea: 'Delivery Area',
        notes: 'Order Notes',

        productManagement: 'Product Management',
        addProduct: 'Add New Product',
        editProduct: 'Edit Product',
        allProducts: 'All Products',
        inStock: 'In Stock',
        outOfStock: 'Out of Stock',
        stock: 'Stock',
        stockQuantity: 'Stock Quantity',
        category: 'Category',
        featured: 'Featured',
        sku: 'SKU',
        salePrice: 'Sale Price',
        regularPrice: 'Regular Price',
        thumbnail: 'Thumbnail Image',
        gallery: 'Gallery Images',
        deleteProductConfirm: 'Are you sure you want to delete this product? This action cannot be undone.',

        couponManagement: 'Coupon Management',
        newCoupon: 'New Coupon',
        editCoupon: 'Edit Coupon',
        couponCode: 'Coupon Code',
        discountType: 'Discount Type',
        percentage: 'Percentage (%)',
        fixedAmount: 'Fixed Amount (৳)',
        discountValue: 'Discount Amount',
        minOrderAmount: 'Minimum Order (৳)',
        maxDiscountAmount: 'Maximum Discount (৳)',
        usageLimit: 'Usage Limit',
        expiryDate: 'Expiry Date',
        timesUsed: 'Times Used',
        valid: 'Active',
        expired: 'Expired',
        activateCoupon: 'Activate Coupon',
        noCouponsFound: 'No coupons found.',
        deleteCouponConfirm: 'Are you sure you want to delete coupon',

        codeSnippets: 'Code Snippets',
        snippetsManagement: 'Code Snippets & Tracking Scripts',
        snippetsNotice: 'Easily inject custom tracking tags, Facebook Pixel, Google Tag Manager (GTM), or analytics codes into your storefront header, body, or footer without editing theme files.',
        addSnippet: 'Add New Snippet',
        editSnippet: 'Edit Snippet',
        snippetTitle: 'Snippet Title / Description',
        placement: 'Placement Location',
        headerLocation: 'Header (<head>)',
        bodyLocation: 'Body (After <body>)',
        footerLocation: 'Footer (Before </body>)',
        codeContent: 'Code / Script Content',
        snippetActive: 'Enable snippet on storefront',
        noSnippetsFound: 'No code snippets added yet.',
        deleteSnippetConfirm: 'Are you sure you want to delete this code snippet?',
        snippetPlaceholder: '<script>\n  // Paste Facebook Pixel, GTM, or custom scripts here...\n</script>',
        headerCount: 'Header Snippets',
        bodyCount: 'Body Snippets',
        footerCount: 'Footer Snippets',

        socialLinks: 'Social Links',
        socialMediaManagement: 'Social Media Links & Accounts',
        socialMediaNotice: 'Manage your official social media profiles. Active links will dynamically appear on your store header top bar and footer with official brand icons.',
        addSocialLink: 'Add Social Link',
        editSocialLink: 'Edit Social Link',
        platform: 'Platform',
        linkTitle: 'Profile Title / Label',
        targetUrl: 'Target URL / Link',
        showInHeader: 'Show in Header',
        showInFooter: 'Show in Footer',
        deleteSocialLinkConfirm: 'Are you sure you want to delete social link',

        blogManagement: 'Blog Posts & Articles',
        blogNotice: 'Publish engaging gadget reviews, buying guides, and technical tips to boost SEO rankings and drive organic store traffic.',
        addBlog: 'Write New Blog Post',
        editBlog: 'Edit Blog Post',
        blogTitle: 'Blog Post Title',
        postContent: 'Article Content',
        postExcerpt: 'Short Summary / Excerpt',
        featuredImage: 'Cover Image',
        postAuthor: 'Author Name',
        publishStatus: 'Publish Status',
        published: 'Published',
        draft: 'Draft',
        views: 'Views',
        metaTitle: 'SEO Meta Title',
        metaDescription: 'SEO Meta Description',
        deleteBlogConfirm: 'Are you sure you want to delete blog post',
        noBlogsFound: 'No blog posts published yet.',
    },
    bn: {
        dashboard: 'ড্যাশবোর্ড',
        products: 'পণ্য',
        categories: 'ক্যাটাগরি',
        media: 'মিডিয়া লাইব্রেরি',
        orders: 'অর্ডার',
        coupons: 'কুপন',
        customers: 'কাস্টমার',
        blogs: 'ব্লগ পোস্টসমূহ',
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

        heroSection: 'হিরো সেকশন',
        heroManagement: 'হিরো ব্যানার ও স্লাইডার ব্যবস্থাপনা',
        displayMode: 'ডিসপ্লে মোড',
        singleBanner: 'সিঙ্গেল স্ট্যাটিক ব্যানার',
        sliderCarousel: 'মাল্টি-স্লাইড ক্যারোসেল স্লাইডার',
        useSlider: 'স্লাইডার ব্যবহার করুন',
        heroNotice: 'ওয়েবসাইটের মূল হিরো সেকশন নিয়ন্ত্রণ করুন। আপনি চাইলে একটি সিঙ্গেল ব্যানার অথবা একের অধিক ব্যানার নিয়ে অটো-স্লাইডিং ক্যারোসেল চালাতে পারবেন।',
        addSlide: 'নতুন স্লাইড যোগ করুন',
        editSlide: 'স্লাইড সম্পাদনা',
        slideTitle: 'শিরোনাম (ঐচ্ছিক)',
        slideSubtitle: 'সাবটাইটেল (ঐচ্ছিক)',
        slideLink: 'লিংক ইউআরএল (যেমন: /shop অথবা /shop?category=airbuds)',
        moveUp: 'উপরে নিন',
        moveDown: 'নিচে নিন',
        order: 'ক্রমিক নম্বর',
        reorderSuccess: 'স্লাইডের ক্রম সফলভাবে সাজানো হয়েছে!',
        noSlidesFound: 'এখনও কোনো হিরো ব্যানার যোগ করা হয়নি।',
        originalQualityNotice: '১০০% অরিজিনাল এইচডি কোয়ালিটি: ব্যানার ইমেজ কোনো ক্ষতি বা ঘোলা ছাড়াই সম্পূর্ণ নিখুঁতভাবে সংরক্ষিত হবে।',

        ordersManagement: 'অর্ডার ব্যবস্থাপনা',
        allOrders: 'সব অর্ডার',
        pending: 'অপেক্ষায়',
        confirmed: 'নিশ্চিত',
        processingOrders: 'প্রস্তুতি',
        shipped: 'পাঠানো হয়েছে',
        delivered: 'পৌঁছেছে',
        cancelled: 'বাতিল',
        customer: 'গ্রাহক',
        orderDetails: 'অর্ডারের বিবরণ',
        updateStatus: 'অর্ডার স্ট্যাটাস পরিবর্তন',
        changeStatus: 'স্ট্যাটাস বদলান',
        customerInfo: 'গ্রাহকের তথ্য',
        deliveryInfo: 'ডেলিভারি তথ্য',
        orderItems: 'অর্ডারের পণ্যসমূহ',
        subtotal: 'সাবটোটাল',
        deliveryCharge: 'ডেলিভারি চার্জ',
        discount: 'ডিসকাউন্ট',
        items: 'পণ্য',
        quantity: 'পরিমাণ',
        orderNumber: 'অর্ডার নম্বর',
        paymentMethod: 'পেমেন্ট পদ্ধতি',
        division: 'বিভাগ',
        district: 'জেলা',
        upazila: 'উপজেলা / থানা',
        deliveryArea: 'ডেলিভারি এলাকা',
        notes: 'অর্ডার নোট',

        productManagement: 'পণ্য ব্যবস্থাপনা',
        addProduct: 'নতুন পণ্য যোগ করুন',
        editProduct: 'পণ্য সম্পাদনা',
        allProducts: 'সব পণ্য',
        inStock: 'স্টকে আছে',
        outOfStock: 'স্টক শেষ',
        stock: 'স্টক',
        stockQuantity: 'স্টক সংখ্যা',
        category: 'ক্যাটাগরি',
        featured: 'ফিচার্ড',
        sku: 'এসকেইউ',
        salePrice: 'অফার মূল্য',
        regularPrice: 'মূল দাম',
        thumbnail: 'প্রধান ছবি',
        gallery: 'গ্যালারি ছবি',
        deleteProductConfirm: 'আপনি কি নিশ্চিত এই পণ্যটি মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।',

        couponManagement: 'কুপন ব্যবস্থাপনা',
        newCoupon: 'নতুন কুপন',
        editCoupon: 'কুপন সম্পাদনা',
        couponCode: 'কুপন কোড',
        discountType: 'ছাড়ের ধরন',
        percentage: 'শতাংশ (%)',
        fixedAmount: 'নির্দিষ্ট (৳)',
        discountValue: 'ছাড়ের পরিমাণ',
        minOrderAmount: 'সর্বনিম্ন অর্ডার (৳)',
        maxDiscountAmount: 'সর্বোচ্চ ছাড় (৳)',
        usageLimit: 'ব্যবহারের সীমা',
        expiryDate: 'মেয়াদ শেষ',
        timesUsed: 'বার ব্যবহৃত',
        valid: 'সক্রিয়',
        expired: 'মেয়াদ শেষ',
        activateCoupon: 'সক্রিয় করুন',
        noCouponsFound: 'কোনো কুপন পাওয়া যায়নি।',
        deleteCouponConfirm: 'আপনি কি কুপনটি মুছতে চান',

        codeSnippets: 'কোড স্নিপেটস',
        snippetsManagement: 'কোড স্নিপেটস ও ট্র্যাকিং স্ক্রিপ্টস',
        snippetsNotice: 'আপনার ওয়েবসাইটের হেডার, বডি বা ফুটারে ফেসবুক পিক্সেল, গুগল ট্যাগ ম্যানেজার (GTM), বা যেকোনো ট্র্যাকিং কোড সহজে যুক্ত করুন। থিম ফাইল এডিটের কোনো প্রয়োজন নেই।',
        addSnippet: 'নতুন কোড যোগ করুন',
        editSnippet: 'কোড সম্পাদনা',
        snippetTitle: 'কোডের নাম বা বিবরণ',
        placement: 'প্লেসমেন্ট লোকেশন',
        headerLocation: 'হেডার (<head>)',
        bodyLocation: 'বডি (<body> ট্যাগের পর)',
        footerLocation: 'ফুটার (</body> ট্যাগের পূর্বে)',
        codeContent: 'কোড / স্ক্রিপ্ট কনটেন্ট',
        snippetActive: 'ওয়েবসাইটে এই কোডটি সক্রিয় রাখুন',
        noSnippetsFound: 'এখনও কোনো কোড স্নিপেট যোগ করা হয়নি।',
        deleteSnippetConfirm: 'আপনি কি নিশ্চিত এই কোড স্নিপেটটি মুছে ফেলতে চান?',
        snippetPlaceholder: '<script>\n  // এখানে ফেসবুক পিক্সেল, জিটিএম বা কাস্টম স্ক্রিপ্ট পেস্ট করুন...\n</script>',
        headerCount: 'হেডার কোড',
        bodyCount: 'বডি কোড',
        footerCount: 'ফুটার কোড',

        socialLinks: 'সোশ্যাল মিডিয়া',
        socialMediaManagement: 'সোশ্যাল মিডিয়া লিংক ও অ্যাকাউন্টস',
        socialMediaNotice: 'আপনার অফিশিয়াল সোশ্যাল মিডিয়া প্রোফাইলগুলো পরিচালনা করুন। সক্রিয় লিংকগুলো স্বয়ংক্রিয়ভাবে হেডারের টপ বার এবং ফুটারে অফিসিয়াল আইকনসহ প্রদর্শিত হবে।',
        addSocialLink: 'নতুন সোশ্যাল লিংক যোগ করুন',
        editSocialLink: 'সোশ্যাল লিংক সম্পাদনা',
        platform: 'প্ল্যাটফর্ম',
        linkTitle: 'প্রোফাইলের নাম / টাইটেল',
        targetUrl: 'টার্গেট URL / লিংক',
        showInHeader: 'হেডারে দেখান',
        showInFooter: 'ফুটারে দেখান',
        deleteSocialLinkConfirm: 'আপনি কি এই সোশ্যাল লিংকটি মুছে ফেলতে চান',

        blogManagement: 'ব্লগ পোস্ট ও আর্টিকেল',
        blogNotice: 'এসইও (SEO) র‍্যাঙ্কিং বৃদ্ধি এবং গ্রাহকদের বিশ্বস্ততা অর্জনের জন্য গ্যাজেটের রিভিউ, টিপস ও গাইড পোস্ট করুন।',
        addBlog: 'নতুন ব্লগ পোস্ট লিখুন',
        editBlog: 'ব্লগ পোস্ট সম্পাদনা',
        blogTitle: 'ব্লগ পোস্টের শিরোনাম',
        postContent: 'মূল আর্টিকেল / কন্টেন্ট',
        postExcerpt: 'সংক্ষিপ্ত সারসংক্ষেপ (Excerpt)',
        featuredImage: 'কভার ইমেজ',
        postAuthor: 'লেখকের নাম',
        publishStatus: 'পাবলিশ স্ট্যাটাস',
        published: 'পাবলিশড',
        draft: 'ড্রাফট',
        views: 'ভিউস',
        metaTitle: 'এসইও মেটা টাইটেল',
        metaDescription: 'এসইও মেটা ডেসক্রিপশন',
        deleteBlogConfirm: 'আপনি কি নিশ্চিত এই ব্লগ পোস্টটি মুছে ফেলতে চান',
        noBlogsFound: 'এখনও কোনো ব্লগ পোস্ট যোগ করা হয়নি।',
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
