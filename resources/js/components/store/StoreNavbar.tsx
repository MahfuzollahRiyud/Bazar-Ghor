import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, usePage } from '@inertiajs/react';
import { Globe, LogIn, Menu, Phone, Search, ShoppingCart, User, X, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SocialIcon from '@/components/store/SocialIcon';

interface SocialLinkItem {
    id: number;
    platform: string;
    title: string;
    url: string;
    icon?: string;
    color?: string;
    is_active: boolean;
    show_in_header: boolean;
    show_in_footer: boolean;
    sort_order: number;
}

interface SuggestionItem {
    id: number;
    name: string;
    slug: string;
    sku?: string | null;
    price: number;
    sale_price?: number | null;
    primary_image_url?: string | null;
}

export default function StoreNavbar() {
    const { totalItems } = useCart();
    const { language, toggleLanguage, t } = useLanguage();
    const { url, props } = usePage<{
        auth?: { user?: { id: number; name: string; email: string; role?: string } | null };
        socialLinks?: SocialLinkItem[];
        siteSettings?: {
            site_title?: string;
            site_tagline?: string;
            site_logo_url?: string;
            site_favicon_url?: string;
        };
    }>();
    const user = props.auth?.user;
    const socialLinks = Array.isArray(props.socialLinks) ? props.socialLinks : [];
    const headerSocialLinks = socialLinks.filter((s) => s && s.is_active && s.show_in_header);
    const siteSettings = props.siteSettings;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const desktopSearchRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLDivElement>(null);

    const navLinks = [
        { label: t.home, href: '/' },
        { label: t.shop, href: '/shop' },
        { label: t.blog ?? (language === 'en' ? 'Blog' : 'ব্লগ'), href: '/blog' },
        { label: t.aboutUs, href: '/about' },
        { label: t.contactUs, href: '/contact' },
    ];

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Debounced search suggestions
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setSuggestions([]);
            setIsLoadingSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoadingSuggestions(true);
            try {
                const res = await fetch(`/search-suggestions?q=${encodeURIComponent(searchQuery.trim())}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(Array.isArray(data) ? data : []);
                    setShowSuggestions(true);
                }
            } catch {
                // Ignore network error
            } finally {
                setIsLoadingSuggestions(false);
            }
        }, 220);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                desktopSearchRef.current && !desktopSearchRef.current.contains(target) &&
                mobileSearchRef.current && !mobileSearchRef.current.contains(target)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setShowSuggestions(false);
            window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    return (
        <>
            {/* Top Bar */}
            <div className="bg-[#1f4e1b] py-1.5 sm:py-2 text-white text-xs border-b border-green-800/40 overflow-hidden">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4">
                    {/* Delivery charge info - visible on desktop, hidden on mobile */}
                    <p className="hidden md:block font-medium tracking-wide">
                        {t.topBarDelivery}
                    </p>

                    <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-2 sm:gap-3 flex-nowrap">
                        {/* 1. Social Media Icons (First on the right group) */}
                        {headerSocialLinks.length > 0 && (
                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                {headerSocialLinks.map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={item.title}
                                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-900/80 text-green-200 transition-colors hover:bg-white hover:text-[#1f4e1b]"
                                    >
                                        <SocialIcon platform={item.platform} icon={item.icon} size={11} />
                                    </a>
                                ))}
                            </div>
                        )}

                        {headerSocialLinks.length > 0 && (
                            <span className="text-green-500/70 text-xs shrink-0 select-none">|</span>
                        )}

                        {/* 2. Phone Number (Middle) */}
                        <a
                            href="tel:01613545166"
                            className="flex items-center gap-1 sm:gap-1.5 font-medium transition-opacity hover:opacity-90 text-[11px] sm:text-xs shrink-0"
                        >
                            <Phone size={12} className="text-yellow-300 shrink-0" />
                            <span className="whitespace-nowrap">01613-545166</span>
                        </a>

                        <span className="text-green-500/70 text-xs shrink-0 select-none">|</span>

                        {/* 3. Auth / Account Quick Link (Rightmost) */}
                        <div className="flex items-center shrink-0">
                            {user ? (
                                <Link
                                    href={user.role === 'admin' ? '/dashboard' : '/account'}
                                    className="flex items-center gap-1 sm:gap-1.5 font-semibold text-yellow-300 hover:text-white transition-colors text-[11px] sm:text-xs"
                                >
                                    <User size={13} className="shrink-0" />
                                    <span>{user.role === 'admin' ? t.dashboard : t.myAccount}</span>
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex items-center gap-1 sm:gap-1.5 font-medium text-green-100 hover:text-white transition-colors text-[11px] sm:text-xs"
                                >
                                    <LogIn size={13} className="shrink-0" />
                                    <span>{t.loginOrRegister}</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <nav
                className={`sticky top-0 z-50 transition-all duration-300 ${
                    scrolled ? 'bg-white/98 backdrop-blur-md shadow-md py-2' : 'bg-white py-2.5 sm:py-3 border-b border-gray-100'
                }`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                        <img
                            src={siteSettings?.site_logo_url || '/images/logo.png'}
                            alt={siteSettings?.site_title || 'Bazar Ghor'}
                            className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg object-contain transition-transform group-hover:scale-105"
                            onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const next = target.nextElementSibling as HTMLElement;
                                if (next) next.style.display = 'flex';
                            }}
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center text-xl font-bold tracking-tight">
                                <span className="text-[#2d6a27]">{siteSettings?.site_title ? siteSettings.site_title.split(' ')[0] : 'Bazar'}</span>
                                <span className="ml-1 text-[#8b4513]">{siteSettings?.site_title ? siteSettings.site_title.split(' ').slice(1).join(' ') || 'Ghor' : 'Ghor'}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-medium tracking-wider -mt-1 uppercase">
                                {siteSettings?.site_tagline || (language === 'en' ? 'Smart Gadgets' : 'গ্যাজেট স্টোর')}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Search Bar (Always Open) with Suggestions Dropdown */}
                    <div ref={desktopSearchRef} className="hidden md:block relative w-56 lg:w-72 xl:w-84 mx-4">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => {
                                    if (suggestions.length > 0) setShowSuggestions(true);
                                }}
                                placeholder={t.searchPlaceholder}
                                className="w-full rounded-full border border-gray-200 bg-gray-50/90 pl-3.5 pr-9 py-1.5 text-xs lg:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:bg-white focus:ring-2 focus:ring-[#2d6a27]/20 focus:outline-none transition-all shadow-2xs"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[#2d6a27] text-white hover:bg-[#23531e] transition-colors"
                                aria-label={t.search}
                                title={t.search}
                            >
                                {isLoadingSuggestions ? (
                                    <Loader2 size={13} className="animate-spin text-white" />
                                ) : (
                                    <Search size={13} />
                                )}
                            </button>
                        </form>

                        {/* Desktop Suggestions Popup */}
                        {showSuggestions && searchQuery.trim().length >= 2 && (
                            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-white shadow-2xl border border-gray-200/80 overflow-hidden divide-y divide-gray-100 max-h-96 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150">
                                {isLoadingSuggestions ? (
                                    <div className="py-5 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                                        <Loader2 size={14} className="animate-spin text-[#2d6a27]" />
                                        <span>{language === 'en' ? 'Searching products & SKU...' : 'পণ্য ও SKU খোঁজা হচ্ছে...'}</span>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <>
                                        <div className="px-3 py-1.5 bg-gray-50/90 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                                            <span>{language === 'en' ? 'Products & SKU' : 'পণ্য ও SKU কোড'}</span>
                                            <span className="text-[#2d6a27] font-semibold">{suggestions.length} {language === 'en' ? 'found' : 'টি পাওয়া গেছে'}</span>
                                        </div>
                                        {suggestions.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={`/product/${item.slug}`}
                                                onClick={() => setShowSuggestions(false)}
                                                className="flex items-center gap-3 p-2.5 hover:bg-green-50/70 transition group"
                                            >
                                                <div className="h-11 w-11 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                                                    {item.primary_image_url ? (
                                                        <img src={item.primary_image_url} alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-200" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">📷</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-gray-800 group-hover:text-[#2d6a27] truncate">
                                                        {item.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {item.sku && (
                                                            <span className="text-[10px] font-mono font-medium bg-emerald-50 text-[#2d6a27] border border-emerald-200/60 px-1.5 py-0.2 rounded">
                                                                SKU: {item.sku}
                                                            </span>
                                                        )}
                                                        <div className="flex items-center gap-1.5 text-xs">
                                                            {item.sale_price ? (
                                                                <>
                                                                    <span className="font-bold text-[#2d6a27]">৳{Number(item.sale_price).toLocaleString()}</span>
                                                                    <span className="text-[10px] text-gray-400 line-through">৳{Number(item.price).toLocaleString()}</span>
                                                                </>
                                                            ) : (
                                                                <span className="font-bold text-gray-900">৳{Number(item.price).toLocaleString()}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={(e) => handleSearch(e)}
                                            className="w-full p-2.5 text-center text-xs font-bold text-[#2d6a27] hover:bg-green-50 transition border-t border-gray-100 block"
                                        >
                                            {language === 'en' ? `View all results for "${searchQuery}" →` : `"${searchQuery}" এর সব ফলাফল দেখুন →`}
                                        </button>
                                    </>
                                ) : (
                                    <div className="py-6 text-center text-xs text-gray-400">
                                        {language === 'en' ? 'No products or SKU matched your search.' : 'আপনার সার্চের সাথে কোনো পণ্য বা SKU মেলেনি।'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden items-center gap-5 lg:gap-7 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-[#2d6a27] ${
                                    url === link.href ? 'text-[#2d6a27] font-semibold' : 'text-gray-700'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Language Switcher Pill */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:border-[#2d6a27] hover:bg-green-50 hover:text-[#2d6a27] active:scale-95"
                            title="Toggle Language (English / বাংলা)"
                        >
                            <Globe size={13} className="text-[#2d6a27]" />
                            <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
                        </button>

                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="relative rounded-full p-2 text-gray-700 transition-colors hover:bg-green-50 hover:text-[#2d6a27]"
                            aria-label="Cart"
                            title={t.cart}
                        >
                            <ShoppingCart size={20} />
                            {totalItems > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8b4513] text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50 duration-200">
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </Link>

                        {/* User / Login link */}
                        <Link
                            href={user ? (user.role === 'admin' ? '/dashboard' : '/account') : '/login'}
                            className="hidden sm:flex items-center justify-center rounded-full p-2 text-gray-700 transition-colors hover:bg-green-50 hover:text-[#2d6a27]"
                            title={user ? (user.role === 'admin' ? t.dashboard : t.myAccount) : t.loginOrRegister}
                        >
                            {user ? <User size={20} className="text-[#2d6a27]" /> : <LogIn size={20} />}
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="rounded-full p-2 text-gray-700 transition-colors hover:bg-green-50 md:hidden"
                            aria-label="Menu"
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dedicated Search Row (Full Width Row on Mobile) with Suggestions */}
                <div ref={mobileSearchRef} className="block md:hidden px-4 pt-1.5 pb-1 relative">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                                if (suggestions.length > 0) setShowSuggestions(true);
                            }}
                            placeholder={t.searchPlaceholder}
                            className="w-full rounded-full border border-gray-200 bg-gray-50 pl-4 pr-10 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:bg-white focus:ring-2 focus:ring-[#2d6a27]/20 focus:outline-none transition-all shadow-2xs"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-[#2d6a27] text-white hover:bg-[#23531e] transition-colors"
                            aria-label={t.search}
                        >
                            {isLoadingSuggestions ? (
                                <Loader2 size={12} className="animate-spin text-white" />
                            ) : (
                                <Search size={12} />
                            )}
                        </button>
                    </form>

                    {/* Mobile Suggestions Popup */}
                    {showSuggestions && searchQuery.trim().length >= 2 && (
                        <div className="absolute left-4 right-4 top-full mt-1.5 z-50 rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 max-h-80 overflow-y-auto animate-in fade-in-50 duration-150">
                            {isLoadingSuggestions ? (
                                <div className="py-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                                    <Loader2 size={13} className="animate-spin text-[#2d6a27]" />
                                    <span>{language === 'en' ? 'Searching...' : 'অনুসন্ধান চলছে...'}</span>
                                </div>
                            ) : suggestions.length > 0 ? (
                                <>
                                    {suggestions.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/product/${item.slug}`}
                                            onClick={() => setShowSuggestions(false)}
                                            className="flex items-center gap-3 p-2.5 hover:bg-green-50/70 transition"
                                        >
                                            <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                                                {item.primary_image_url ? (
                                                    <img src={item.primary_image_url} alt={item.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">📷</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {item.sku && (
                                                        <span className="text-[9px] font-mono bg-emerald-50 text-[#2d6a27] px-1 rounded">
                                                            SKU: {item.sku}
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-bold text-[#2d6a27]">
                                                        ৳{Number(item.sale_price || item.price).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={(e) => handleSearch(e)}
                                        className="w-full p-2.5 text-center text-xs font-bold text-[#2d6a27] hover:bg-green-50 transition border-t border-gray-100 block"
                                    >
                                        {language === 'en' ? `View all results →` : `সব ফলাফল দেখুন →`}
                                    </button>
                                </>
                            ) : (
                                <div className="py-5 text-center text-xs text-gray-400">
                                    {language === 'en' ? 'No products found' : 'কোনো পণ্য পাওয়া যায়নি'}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
                        <div className="mt-3 flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                                        url === link.href
                                            ? 'bg-green-50 text-[#2d6a27] font-semibold'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between px-2">
                                <span className="text-xs text-gray-500">{t.account}:</span>
                                <Link
                                    href={user ? (user.role === 'admin' ? '/dashboard' : '/account') : '/login'}
                                    onClick={() => setMobileOpen(false)}
                                    className="text-xs font-semibold text-[#2d6a27] hover:underline"
                                >
                                    {user ? (user.role === 'admin' ? t.dashboard : t.myAccount) : t.loginOrRegister} →
                                </Link>
                            </div>

                            {headerSocialLinks.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between px-2">
                                    <span className="text-xs text-gray-500">{language === 'en' ? 'Follow Us:' : 'অনুসরণ করুন:'}</span>
                                    <div className="flex items-center gap-2">
                                        {headerSocialLinks.map((item) => (
                                            <a
                                                key={item.id}
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={item.title}
                                                className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-[#2d6a27] hover:bg-[#2d6a27] hover:text-white transition-colors"
                                            >
                                                <SocialIcon platform={item.platform} icon={item.icon} size={13} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
