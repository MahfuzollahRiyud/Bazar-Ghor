import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpDown,
    CheckCircle2,
    Edit,
    ExternalLink,
    Filter,
    Package,
    PackagePlus,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Star,
    Tag,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    slug: string;
    sku?: string | null;
    category?: string | null;
    category_id?: number | null;
    price: number;
    sale_price?: number | null;
    stock_quantity: number;
    thumbnail_url?: string | null;
    is_active: boolean;
    is_featured: boolean;
    has_variants: boolean;
    created_at: string;
}

interface Category {
    id: number;
    name: string;
}

interface Paginated {
    data: Product[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    search?: string;
    category_id?: string;
    stock_status?: string;
    status?: string;
    sort?: string;
}

interface Stats {
    total: number;
    in_stock: number;
    out_of_stock: number;
    active: number;
}

interface Props {
    products: Paginated;
    categories: Category[];
    filters: Filters;
    stats: Stats;
}

export default function ProductsIndex({
    products = { data: [], current_page: 1, last_page: 1, total: 0, links: [] },
    categories = [],
    filters = {},
    stats,
}: Props) {
    const { t, language } = useAdminLanguage();
    const [deleting, setDeleting] = useState<number | null>(null);

    const safeFilters: Filters = (filters && typeof filters === 'object' && !Array.isArray(filters)) ? filters : {};
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeProductsList = Array.isArray(products?.data) ? products.data : [];
    const paginationLinks = Array.isArray(products?.links) ? products.links : [];

    const totalCount = stats?.total ?? products?.total ?? safeProductsList.length;
    const inStockCount = stats?.in_stock ?? 0;
    const outOfStockCount = stats?.out_of_stock ?? 0;

    const [search, setSearch] = useState(safeFilters.search ?? '');
    const [categoryId, setCategoryId] = useState(safeFilters.category_id ?? '');
    const [stockStatus, setStockStatus] = useState(safeFilters.stock_status ?? '');
    const [sort, setSort] = useState(safeFilters.sort ?? '');

    const applyFilters = (overrides: Partial<Filters> = {}) => {
        router.get(
            '/dashboard/products',
            {
                search: overrides.search !== undefined ? overrides.search : search,
                category_id: overrides.category_id !== undefined ? overrides.category_id : categoryId,
                stock_status: overrides.stock_status !== undefined ? overrides.stock_status : stockStatus,
                sort: overrides.sort !== undefined ? overrides.sort : sort,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const resetFilters = () => {
        setSearch('');
        setCategoryId('');
        setStockStatus('');
        setSort('');
        router.get('/dashboard/products');
    };

    const handleDelete = (id: number, name: string) => {
        if (!confirm(t.deleteProductConfirm)) return;
        setDeleting(id);
        router.delete(`/dashboard/products/${id}`, {
            onSuccess: () => toast.success(language === 'en' ? 'Product deleted successfully.' : 'পণ্যটি সফলভাবে মুছে ফেলা হয়েছে।'),
            onError: () => toast.error(language === 'en' ? 'Failed to delete product.' : 'পণ্যটি মুছতে সমস্যা হয়েছে।'),
            onFinish: () => setDeleting(null),
        });
    };

    const hasActiveFilters = !!(safeFilters.search || safeFilters.category_id || safeFilters.stock_status || safeFilters.sort);

    return (
        <>
            <Head title={`${t.productManagement} — Bazar Ghor Admin`} />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{t.productManagement}</h1>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                {language === 'en' ? 'Catalog' : 'ক্যাটালগ'}
                            </span>
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                            {language === 'en'
                                ? `Found ${totalCount} total products`
                                : `মোট ${totalCount}টি পণ্য পাওয়া গেছে`}
                        </p>
                    </div>

                    <Link
                        href="/dashboard/products/create"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d6a27] px-5 py-2.5 font-bold text-sm text-white shadow-sm transition hover:bg-[#23531f] active:scale-95"
                    >
                        <PackagePlus size={18} />
                        {t.addProduct}
                    </Link>
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3 text-xs sm:text-sm font-medium">
                    <button
                        onClick={() => { setStockStatus(''); applyFilters({ stock_status: '' }); }}
                        className={`px-3 py-1.5 rounded-lg transition ${
                            !safeFilters.stock_status
                                ? 'bg-[#2d6a27] text-white font-bold'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {t.allProducts} <span className="opacity-80">({totalCount})</span>
                    </button>

                    <button
                        onClick={() => { setStockStatus('in_stock'); applyFilters({ stock_status: 'in_stock' }); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                            safeFilters.stock_status === 'in_stock'
                                ? 'bg-emerald-600 text-white font-bold'
                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                    >
                        <CheckCircle2 size={14} />
                        {t.inStock} <span className="opacity-80">({inStockCount})</span>
                    </button>

                    <button
                        onClick={() => { setStockStatus('out_of_stock'); applyFilters({ stock_status: 'out_of_stock' }); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                            safeFilters.stock_status === 'out_of_stock'
                                ? 'bg-red-600 text-white font-bold'
                                : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                        }`}
                    >
                        <XCircle size={14} />
                        {t.outOfStock} <span className="opacity-80">({outOfStockCount})</span>
                    </button>
                </div>

                {/* Filter Controls Bar */}
                <div className="rounded-2xl bg-white p-4 shadow-xs border border-gray-200 space-y-3">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 items-center">
                        {/* Search Input */}
                        <div className="relative col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={language === 'en' ? 'Search by name or SKU...' : 'নাম অথবা SKU দিয়ে খুঁজুন...'}
                                className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div>
                            <select
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value);
                                    applyFilters({ category_id: e.target.value });
                                }}
                                className="w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-xs text-gray-900 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none"
                            >
                                <option value="">{language === 'en' ? 'All Categories' : 'সব ক্যাটাগরি'}</option>
                                {safeCategories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sorting Dropdown */}
                        <div>
                            <select
                                value={sort}
                                onChange={(e) => {
                                    setSort(e.target.value);
                                    applyFilters({ sort: e.target.value });
                                }}
                                className="w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-xs text-gray-900 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none font-medium"
                            >
                                <option value="">{language === 'en' ? 'Sort: Newest First' : 'সর্টিং: নতুন আগে'}</option>
                                <option value="name_asc">{language === 'en' ? 'Name: A to Z' : 'নাম: A to Z'}</option>
                                <option value="name_desc">{language === 'en' ? 'Name: Z to A' : 'নাম: Z to A'}</option>
                                <option value="price_asc">{language === 'en' ? 'Price: Low to High' : 'দাম: কম থেকে বেশি'}</option>
                                <option value="price_desc">{language === 'en' ? 'Price: High to Low' : 'দাম: বেশি থেকে কম'}</option>
                                <option value="stock_desc">{language === 'en' ? 'Stock: High to Low' : 'স্টক: বেশি থেকে কম'}</option>
                                <option value="oldest">{language === 'en' ? 'Oldest First' : 'পুরাতন আগে'}</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="flex-1 rounded-xl bg-[#2d6a27] py-2 px-3 text-xs font-bold text-white hover:bg-[#23531f] transition shadow-xs flex items-center justify-center gap-1"
                            >
                                <Filter size={13} />
                                {t.filter}
                            </button>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="rounded-xl border border-gray-300 bg-gray-50 py-2 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                                    title={language === 'en' ? 'Reset Filters' : 'ফিল্টার রিসেট করুন'}
                                >
                                    <RotateCcw size={13} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Products Table */}
                <div className="rounded-2xl bg-white shadow-xs border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-4 py-3.5 w-16">{language === 'en' ? 'Image' : 'ছবি'}</th>
                                    <th className="px-4 py-3.5">{language === 'en' ? 'Product & SKU' : 'পণ্য ও বিবরণ'}</th>
                                    <th className="px-4 py-3.5 hidden md:table-cell">{t.category}</th>
                                    <th className="px-4 py-3.5">{t.price}</th>
                                    <th className="px-4 py-3.5">{t.stock}</th>
                                    <th className="px-4 py-3.5 hidden sm:table-cell">{t.status}</th>
                                    <th className="px-4 py-3.5 text-right w-28">{t.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {safeProductsList.length > 0 ? (
                                    safeProductsList.map((product) => {
                                        const isInStock = Boolean(product.has_variants || (Number(product.stock_quantity) > 0));
                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                                                {/* Thumbnail */}
                                                <td className="px-4 py-3">
                                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                                                        {product.thumbnail_url ? (
                                                            <img
                                                                src={product.thumbnail_url}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                                                <Package size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Title & SKU & Store Link */}
                                                <td className="px-4 py-3">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <Link
                                                                href={`/dashboard/products/${product.id}/edit`}
                                                                className="font-bold text-gray-900 text-xs sm:text-sm hover:text-[#2d6a27] transition"
                                                            >
                                                                {product.name}
                                                            </Link>
                                                            <a
                                                                href={`/product/${product.slug}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-gray-400 hover:text-[#2d6a27] transition"
                                                                title={language === 'en' ? 'View in Store' : 'ওয়েবসাইটে দেখুন'}
                                                            >
                                                                <ExternalLink size={12} />
                                                            </a>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                                            <span>SKU: {product.sku || 'N/A'}</span>
                                                            {product.has_variants && (
                                                                <span className="rounded-md bg-purple-50 px-1.5 py-0.2 text-[10px] font-semibold text-purple-700 border border-purple-200">
                                                                    {language === 'en' ? 'Variants' : 'ভ্যারিয়েন্ট আছে'}
                                                                </span>
                                                            )}
                                                            {product.is_featured && (
                                                                <span className="flex items-center gap-0.5 text-amber-600 font-semibold text-[10px]">
                                                                    <Star size={10} className="fill-current" /> {t.featured}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Category */}
                                                <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-700 font-medium">
                                                    {product.category || '—'}
                                                </td>

                                                {/* Price */}
                                                <td className="px-4 py-3">
                                                    <div className="text-xs sm:text-sm font-bold text-[#2d6a27]">
                                                        ৳{Number(product.sale_price || product.price).toLocaleString()}
                                                    </div>
                                                    {product.sale_price && (
                                                        <span className="text-[11px] text-gray-400 line-through">
                                                            ৳{Number(product.price).toLocaleString()}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Stock Status */}
                                                <td className="px-4 py-3">
                                                    {isInStock ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                            <span className="size-1.5 rounded-full bg-emerald-500" />
                                                            {product.has_variants
                                                                ? t.inStock
                                                                : `${language === 'en' ? 'Stock' : 'স্টক'}: ${product.stock_quantity}`}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
                                                            <span className="size-1.5 rounded-full bg-red-500" />
                                                            {t.outOfStock}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status (Active / Inactive) */}
                                                <td className="px-4 py-3 hidden sm:table-cell">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                                        product.is_active
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                                                    }`}>
                                                        {product.is_active ? t.active : t.inactive}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            href={`/dashboard/products/${product.id}/edit`}
                                                            className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-700 hover:border-[#2d6a27] hover:text-[#2d6a27] transition shadow-2xs"
                                                            title={t.edit}
                                                        >
                                                            <Edit size={14} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(product.id, product.name)}
                                                            disabled={deleting === product.id}
                                                            className="rounded-lg border border-gray-200 bg-white p-1.5 text-red-600 hover:border-red-500 hover:bg-red-50 transition shadow-2xs disabled:opacity-50"
                                                            title={t.delete}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                            <Package size={40} className="mx-auto text-gray-300 mb-2" />
                                            <p className="font-semibold text-gray-700">
                                                {language === 'en' ? 'No products found' : 'কোনো পণ্য পাওয়া যায়নি'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {language === 'en'
                                                    ? 'Try resetting your search filters or add a new product.'
                                                    : 'ফিল্টার রিসেট করুন বা নতুন পণ্য যোগ করুন'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {products?.last_page && products.last_page > 1 && paginationLinks.length > 0 && (
                        <div className="border-t border-gray-200 px-4 py-3.5 flex items-center justify-between flex-wrap gap-2 bg-gray-50/50">
                            <span className="text-xs text-gray-500">
                                {language === 'en'
                                    ? `Page ${products.current_page} of ${products.last_page} (${totalCount} total products)`
                                    : `পেজ ${products.current_page} এর ${products.last_page} (মোট ${totalCount}টি পণ্য)`}
                            </span>

                            <div className="flex items-center gap-1.5">
                                {paginationLinks.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`min-w-8 h-8 rounded-lg px-2 text-xs font-bold transition flex items-center justify-center ${
                                            link.active
                                                ? 'bg-[#2d6a27] text-white shadow-xs'
                                                : link.url
                                                    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                                    : 'text-gray-300 bg-gray-100 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
