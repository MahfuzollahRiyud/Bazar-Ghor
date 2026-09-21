import ProductCard from '@/components/store/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    products_count: number;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price?: number | null;
    effective_price: number;
    is_on_sale: boolean;
    thumbnail_url?: string | null;
    in_stock: boolean;
    has_variants: boolean;
    short_description?: string | null;
    is_featured?: boolean;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    category?: string;
    search?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
}

interface Props {
    products: PaginatedProducts;
    categories: Category[];
    filters: Filters;
}

export default function Shop({ products, categories, filters }: Props) {
    const { t, language } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [localSearch, setLocalSearch] = useState(filters.search ?? '');

    const sortOptions = [
        { value: '', label: language === 'en' ? 'Default Sorting' : 'ডিফল্ট' },
        { value: 'newest', label: language === 'en' ? 'Newest Arrivals' : 'নতুন আগে' },
        { value: 'price_asc', label: language === 'en' ? 'Price: Low to High' : 'কম দাম আগে' },
        { value: 'price_desc', label: language === 'en' ? 'Price: High to Low' : 'বেশি দাম আগে' },
    ];

    const applyFilter = (newFilters: Partial<Filters>) => {
        router.get('/shop', { ...filters, ...newFilters, page: undefined }, { preserveState: true, replace: true });
    };

    const clearFilter = (key: keyof Filters) => {
        const updated = { ...filters };
        delete updated[key];
        router.get('/shop', updated, { preserveState: true, replace: true });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search: localSearch });
    };

    const hasActiveFilters = filters.category || filters.search || filters.min_price || filters.max_price;

    return (
        <>
            <Head title={`${t.shop} — Bazar Ghor`}>
                <meta name="description" content="Browse all gadgets at Bazar Ghor. Airbuds, headphones, trimmers, smart watches, and accessories." />
            </Head>

            {/* Page Header */}
            <div className="bg-gradient-to-r from-[#143312] to-[#2d6a27] py-8 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{t.shop}</h1>
                    <div className="flex items-center gap-2 text-green-200 text-sm">
                        <Link href="/" className="hover:text-white">{t.home}</Link>
                        <span>/</span>
                        <span className="text-white font-medium">{t.shop}</span>
                        {filters.category && (
                            <>
                                <span>/</span>
                                <span className="text-yellow-300 font-semibold">{categories.find((c) => c.slug === filters.category)?.name}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="flex gap-8">
                    {/* Sidebar — Desktop */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <FilterPanel
                            categories={categories}
                            filters={filters}
                            applyFilter={applyFilter}
                            clearFilter={clearFilter}
                            language={language}
                            t={t}
                        />
                    </aside>

                    {/* Products Grid Column */}
                    <div className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-gray-100 shadow-xs">
                            {/* Row 1 on mobile / Left on desktop: Search Field */}
                            <form onSubmit={handleSearchSubmit} className="flex w-full sm:flex-1 items-center gap-2 min-w-0 sm:max-w-md">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                    <input
                                        type="text"
                                        value={localSearch}
                                        onChange={(e) => setLocalSearch(e.target.value)}
                                        placeholder={t.searchPlaceholder}
                                        className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none shadow-2xs"
                                    />
                                    {localSearch && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLocalSearch('');
                                                if (filters.search) clearFilter('search');
                                            }}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            aria-label="Clear search"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="shrink-0 rounded-xl bg-[#2d6a27] px-4 py-2 text-xs font-bold text-white hover:bg-[#23531f] transition shadow-xs"
                                >
                                    {t.search}
                                </button>
                            </form>

                            {/* Row 2 on mobile / Right on desktop: Filters & Sorting */}
                            <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2.5">
                                {/* Mobile filter button */}
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:border-[#2d6a27] hover:text-[#2d6a27] lg:hidden shadow-2xs"
                                >
                                    <SlidersHorizontal size={14} />
                                    <span>{language === 'en' ? 'Filters' : 'ফিল্টার'}</span>
                                    {hasActiveFilters && (
                                        <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2d6a27] text-[10px] text-white font-bold">
                                            !
                                        </span>
                                    )}
                                </button>

                                {/* Sort Dropdown */}
                                <div className="flex-1 sm:flex-initial">
                                    <select
                                        value={filters.sort ?? ''}
                                        onChange={(e) => applyFilter({ sort: e.target.value })}
                                        aria-label={language === 'en' ? 'Sort by' : 'সাজান'}
                                        className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-900 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none shadow-2xs cursor-pointer"
                                    >
                                        {sortOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <span className="ml-2 text-xs font-medium text-gray-500 hidden sm:inline shrink-0">
                                    {products.total} {language === 'en' ? 'products found' : 'পণ্য পাওয়া গেছে'}
                                </span>
                            </div>
                        </div>

                        {/* Active Filters Badges */}
                        {hasActiveFilters && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {filters.category && (
                                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-[#2d6a27]">
                                        {categories.find((c) => c.slug === filters.category)?.name}
                                        <button onClick={() => clearFilter('category')} aria-label="Remove filter"><X size={12} /></button>
                                    </span>
                                )}
                                {filters.search && (
                                    <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-[#2d6a27]">
                                        "{filters.search}"
                                        <button onClick={() => clearFilter('search')} aria-label="Remove search filter"><X size={12} /></button>
                                    </span>
                                )}
                                <button
                                    onClick={() => router.get('/shop')}
                                    className="text-xs font-semibold text-red-600 hover:underline px-2 py-1"
                                >
                                    {language === 'en' ? 'Reset All' : 'সব রিসেট'}
                                </button>
                            </div>
                        )}

                        {/* Product Grid */}
                        {products.data.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                {products.data.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center border border-gray-100">
                                <p className="mb-2 text-base font-semibold text-gray-700">
                                    {language === 'en' ? 'No products found' : 'কোনো পণ্য পাওয়া যায়নি'}
                                </p>
                                <p className="mb-4 text-xs text-gray-500">
                                    {language === 'en' ? 'Try searching with different keywords or clear filters.' : 'অন্য ফিল্টার ব্যবহার করে চেষ্টা করুন।'}
                                </p>
                                <button
                                    onClick={() => router.get('/shop')}
                                    className="rounded-xl bg-[#2d6a27] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#23531f]"
                                >
                                    {language === 'en' ? 'Clear Filters' : 'ফিল্টার মুছুন'}
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="mt-8 flex justify-center gap-1.5">
                                {products.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveScroll
                                        className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-bold transition ${
                                            link.active
                                                ? 'bg-[#2d6a27] text-white shadow-xs'
                                                : link.url
                                                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-[#2d6a27]'
                                                    : 'text-gray-300 cursor-not-allowed bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b p-4">
                            <h3 className="font-bold text-gray-800 text-base">{language === 'en' ? 'Filters' : 'ফিল্টার'}</h3>
                            <button onClick={() => setSidebarOpen(false)} aria-label="Close filters">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <FilterPanel
                                categories={categories}
                                filters={filters}
                                applyFilter={(f) => { applyFilter(f); setSidebarOpen(false); }}
                                clearFilter={(k) => { clearFilter(k); setSidebarOpen(false); }}
                                language={language}
                                t={t}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function FilterPanel({
    categories,
    filters,
    applyFilter,
    clearFilter,
    language,
    t,
}: {
    categories: Category[];
    filters: Filters;
    applyFilter: (f: Partial<Filters>) => void;
    clearFilter: (k: keyof Filters) => void;
    language: string;
    t: any;
}) {
    const [minPrice, setMinPrice] = useState(filters.min_price ?? '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price ?? '');

    return (
        <div className="space-y-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            {/* Categories */}
            <div>
                <h3 className="mb-3 text-xs font-bold text-gray-800 uppercase tracking-wider">{t.categories}</h3>
                <div className="space-y-1">
                    <button
                        onClick={() => clearFilter('category')}
                        className={`w-full rounded-xl px-3 py-2 text-left text-xs transition ${
                            !filters.category ? 'bg-green-50 font-bold text-[#2d6a27]' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {language === 'en' ? 'All Categories' : 'সব ক্যাটাগরি'}
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.slug}
                            onClick={() => applyFilter({ category: cat.slug })}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                                filters.category === cat.slug
                                    ? 'bg-green-50 font-bold text-[#2d6a27]'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span className="truncate">{cat.name}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">{cat.products_count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="border-t border-gray-100 pt-5">
                <h3 className="mb-3 text-xs font-bold text-gray-800 uppercase tracking-wider">{t.price} (৳)</h3>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder={language === 'en' ? 'Min' : 'কম'}
                        className="w-1/2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                    />
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder={language === 'en' ? 'Max' : 'বেশি'}
                        className="w-1/2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                    />
                </div>
                <button
                    onClick={() => applyFilter({ min_price: minPrice, max_price: maxPrice })}
                    className="mt-3 w-full rounded-xl bg-[#2d6a27] py-2.5 text-xs font-bold text-white hover:bg-[#23531f] transition shadow-xs"
                >
                    {t.apply}
                </button>
            </div>
        </div>
    );
}
