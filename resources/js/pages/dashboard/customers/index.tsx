import { Head, router } from '@inertiajs/react';
import {
    Eye,
    Mail,
    MapPin,
    Phone,
    Search,
    ShoppingBag,
    UserCheck,
    Users,
    X,
    TrendingUp,
    Calendar,
    Copy,
    Check,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface CustomerItem {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    division?: string | null;
    district?: string | null;
    upazila?: string | null;
    address?: string | null;
    orders_count: number;
    total_spent: number;
    created_at?: string;
    joined_date?: string;
}

interface PaginationLink {
    url?: string | null;
    label: string;
    active: boolean;
}

interface Props {
    customers: {
        data: CustomerItem[];
        links: PaginationLink[];
        total: number;
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
    };
    stats: {
        total_customers: number;
        active_buyers: number;
        total_customer_revenue: number;
    };
}

export default function CustomersIndex({ customers, filters, stats }: Props) {
    const { t, language } = useAdminLanguage();

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
    const [copiedPhoneId, setCopiedPhoneId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dashboard/customers', { search: searchQuery.trim() || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.get('/dashboard/customers', {}, { preserveState: true, replace: true });
    };

    const copyToClipboard = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedPhoneId(id);
        toast.success(language === 'en' ? 'Copied to clipboard!' : 'ক্লিপবোর্ডে কপি হয়েছে!');
        setTimeout(() => setCopiedPhoneId(null), 2000);
    };

    return (
        <>
            <Head title={`${t.customerManagement} — Bazar Ghor Admin`} />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                            <Users className="text-[#2d6a27]" size={26} />
                            {t.customerManagement}
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                            {language === 'en'
                                ? 'View all registered customers, contact information, and purchase records.'
                                : 'সকল নিবন্ধিত গ্রাহক, যোগাযোগের তথ্য এবং তাদের কেনাকাটার হিসাব দেখুন।'}
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center text-[#2d6a27] shrink-0">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.totalCustomers}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.total_customers.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.activeBuyers}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.active_buyers.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.customerRevenue}</p>
                            <p className="text-2xl font-bold text-[#2d6a27] mt-0.5">৳{stats.total_customer_revenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="rounded-2xl bg-white p-4 border border-gray-100 shadow-xs">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t.searchCustomersPlaceholder}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none transition shadow-2xs"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full sm:w-auto rounded-xl bg-[#2d6a27] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#23531f] transition shadow-xs"
                        >
                            {t.search}
                        </button>
                    </form>
                </div>

                {/* Customers Table */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="px-5 py-3.5">{t.name}</th>
                                    <th className="px-5 py-3.5">{language === 'en' ? 'Contact Information' : 'যোগাযোগের তথ্য'}</th>
                                    <th className="px-5 py-3.5 hidden md:table-cell">{t.address}</th>
                                    <th className="px-5 py-3.5 text-center">{t.ordersCount}</th>
                                    <th className="px-5 py-3.5 text-right">{t.totalSpent}</th>
                                    <th className="px-5 py-3.5 hidden lg:table-cell">{t.joinedDate}</th>
                                    <th className="px-5 py-3.5 text-right">{t.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Users size={36} className="text-gray-300 mb-2" />
                                                <p className="font-semibold text-gray-700">{t.noCustomersFound}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    customers.data.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50/70 transition">
                                            {/* Customer Name & Avatar */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 rounded-full bg-green-100 text-[#2d6a27] font-bold flex items-center justify-center text-sm shadow-2xs border border-green-200">
                                                        {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{customer.name}</p>
                                                        <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-0.5">
                                                            Customer
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact Info (Email & Phone) */}
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                                                        <Mail size={13} className="text-gray-400 shrink-0" />
                                                        <a href={`mailto:${customer.email}`} className="hover:text-[#2d6a27] hover:underline">
                                                            {customer.email}
                                                        </a>
                                                    </div>

                                                    {customer.phone ? (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-800 font-mono">
                                                            <Phone size={13} className="text-[#2d6a27] shrink-0" />
                                                            <a href={`tel:${customer.phone}`} className="hover:text-[#2d6a27] font-semibold">
                                                                {customer.phone}
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => copyToClipboard(customer.phone!, customer.id)}
                                                                className="text-gray-400 hover:text-gray-700 p-0.5"
                                                                title="Copy phone"
                                                            >
                                                                {copiedPhoneId === customer.id ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">
                                                            {language === 'en' ? 'No phone provided' : 'ফোন নম্বর নেই'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Location / Address */}
                                            <td className="px-5 py-4 hidden md:table-cell">
                                                {customer.district || customer.address ? (
                                                    <div className="text-xs text-gray-700 max-w-xs">
                                                        <p className="font-semibold text-gray-900">
                                                            {[customer.district, customer.division].filter(Boolean).join(', ')}
                                                        </p>
                                                        {customer.address && (
                                                            <p className="text-gray-500 truncate" title={customer.address}>
                                                                {customer.address}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">
                                                        {language === 'en' ? 'No address saved' : 'ঠিকানা সেভ নেই'}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Orders Count */}
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    customer.orders_count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    <ShoppingBag size={12} />
                                                    {customer.orders_count}
                                                </span>
                                            </td>

                                            {/* Total Spent */}
                                            <td className="px-5 py-4 text-right">
                                                <p className="font-bold text-[#2d6a27] text-sm">
                                                    ৳{customer.total_spent.toLocaleString()}
                                                </p>
                                            </td>

                                            {/* Joined Date */}
                                            <td className="px-5 py-4 hidden lg:table-cell text-xs text-gray-500">
                                                {customer.joined_date}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedCustomer(customer)}
                                                    className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-[#2d6a27] hover:text-[#2d6a27] transition shadow-2xs"
                                                >
                                                    <Eye size={13} />
                                                    <span>{language === 'en' ? 'View' : 'বিস্তারিত'}</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {customers.links && customers.links.length > 3 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <span className="text-xs text-gray-500">
                                {language === 'en'
                                    ? `Showing ${customers.data.length} of ${customers.total} customers`
                                    : `মোট ${customers.total} জনের মধ্যে ${customers.data.length} জন প্রদর্শিত`}
                            </span>
                            <div className="flex items-center gap-1">
                                {customers.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                                            link.active
                                                ? 'bg-[#2d6a27] text-white font-bold'
                                                : link.url
                                                ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                                : 'text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-50 duration-200">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 text-[#2d6a27] font-bold flex items-center justify-center text-sm border border-green-200">
                                    {selectedCustomer.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">{selectedCustomer.name}</h3>
                                    <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* Summary Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-green-50/80 p-3.5 border border-green-200 text-center">
                                    <p className="text-xs font-semibold text-green-800">{t.ordersCount}</p>
                                    <p className="text-xl font-bold text-[#2d6a27] mt-0.5">{selectedCustomer.orders_count}</p>
                                </div>
                                <div className="rounded-xl bg-amber-50/80 p-3.5 border border-amber-200 text-center">
                                    <p className="text-xs font-semibold text-amber-800">{t.totalSpent}</p>
                                    <p className="text-xl font-bold text-[#2d6a27] mt-0.5">৳{selectedCustomer.total_spent.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/50 space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    {language === 'en' ? 'Contact Details' : 'যোগাযোগের তথ্য'}
                                </h4>

                                <div className="flex items-center gap-3 text-sm text-gray-800">
                                    <Mail size={16} className="text-[#2d6a27] shrink-0" />
                                    <div>
                                        <p className="text-[11px] text-gray-500">{t.email}</p>
                                        <a href={`mailto:${selectedCustomer.email}`} className="font-medium hover:text-[#2d6a27] hover:underline">
                                            {selectedCustomer.email}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-gray-800">
                                    <Phone size={16} className="text-[#2d6a27] shrink-0" />
                                    <div>
                                        <p className="text-[11px] text-gray-500">{t.phone}</p>
                                        {selectedCustomer.phone ? (
                                            <a href={`tel:${selectedCustomer.phone}`} className="font-semibold text-gray-900 hover:text-[#2d6a27]">
                                                {selectedCustomer.phone}
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">
                                                {language === 'en' ? 'No phone specified' : 'ফোন নম্বর দেওয়া নেই'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-sm text-gray-800">
                                    <MapPin size={16} className="text-[#2d6a27] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[11px] text-gray-500">{t.address}</p>
                                        <p className="text-xs text-gray-800">
                                            {[
                                                selectedCustomer.address,
                                                selectedCustomer.upazila,
                                                selectedCustomer.district,
                                                selectedCustomer.division,
                                            ]
                                                .filter(Boolean)
                                                .join(', ') || (
                                                <span className="text-gray-400 italic">
                                                    {language === 'en' ? 'No address on file' : 'কোনো ঠিকানা নেই'}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-sm text-gray-800">
                                    <Calendar size={16} className="text-[#2d6a27] shrink-0" />
                                    <div>
                                        <p className="text-[11px] text-gray-500">{t.joinedDate}</p>
                                        <p className="text-xs text-gray-700">{selectedCustomer.created_at}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <span className="text-xs text-gray-500">ID: #{selectedCustomer.id}</span>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="rounded-xl bg-gray-200 px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-300 transition"
                            >
                                {t.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
