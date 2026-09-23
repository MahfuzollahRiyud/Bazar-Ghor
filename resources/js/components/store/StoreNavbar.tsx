import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, usePage } from '@inertiajs/react';
import { Globe, LogIn, Menu, Phone, Search, ShoppingCart, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
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

export default function StoreNavbar() {
    const { totalItems } = useCart();
    const { language, toggleLanguage, t } = useLanguage();
    const { url, props } = usePage<{
        auth?: { user?: { id: number; name: string; email: string; role?: string } | null };
        socialLinks?: SocialLinkItem[];
    }>();
    const user = props.auth?.user;
    const socialLinks = Array.isArray(props.socialLinks) ? props.socialLinks : [];
    const headerSocialLinks = socialLinks.filter((s) => s && s.is_active && s.show_in_header);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <>
            {/* Top Bar */}
            <div className="bg-[#1f4e1b] py-1.5 sm:py-2 text-white text-xs border-b border-green-800/40">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4">
                    {/* Delivery charge info - visible on desktop, hidden on mobile */}
                    <p className="hidden md:block font-medium tracking-wide">
                        {t.topBarDelivery}
                    </p>

                    <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-2 sm:gap-3.5 flex-nowrap overflow-x-auto no-scrollbar">
                        {/* 1. Auth / Account Quick Link (First) */}
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

                        <span className="text-green-500/70 text-xs shrink-0">|</span>

                        {/* 2. Phone Number (Middle) */}
                        <a
                            href="tel:01613545166"
                            className="flex items-center gap-1 sm:gap-1.5 font-medium transition-opacity hover:opacity-90 text-[11px] sm:text-xs shrink-0"
                        >
                            <Phone size={12} className="text-yellow-300 shrink-0" />
                            <span className="whitespace-nowrap">01613-545166</span>
                        </a>

                        {/* 3. Social Media Icons (Rightmost, visible on desktop AND mobile) */}
                        {headerSocialLinks.length > 0 && (
                            <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 sm:pl-2 border-l border-green-700/60 shrink-0">
                                {headerSocialLinks.map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={item.title}
                                        className="flex h-5 w-5 items-center justify-center rounded-full bg-green-900/70 text-green-200 transition-all hover:bg-white hover:text-[#1f4e1b] hover:scale-110"
                                    >
                                        <SocialIcon platform={item.platform} icon={item.icon} size={11} />
                                    </a>
                                ))}
                            </div>
                        )}
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
                            src="/images/logo.png"
                            alt="Bazar Ghor"
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
                                <span className="text-[#2d6a27]">Bazar</span>
                                <span className="ml-1 text-[#8b4513]">Ghor</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-medium tracking-wider -mt-1 uppercase">
                                {language === 'en' ? 'Smart Gadgets' : 'গ্যাজেট স্টোর'}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Search Bar (Always Open) */}
                    <form onSubmit={handleSearch} className="hidden md:flex items-center relative w-56 lg:w-72 xl:w-84 mx-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="w-full rounded-full border border-gray-200 bg-gray-50/90 pl-3.5 pr-9 py-1.5 text-xs lg:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:bg-white focus:ring-2 focus:ring-[#2d6a27]/20 focus:outline-none transition-all shadow-2xs"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[#2d6a27] text-white hover:bg-[#23531e] transition-colors"
                            aria-label={t.search}
                            title={t.search}
                        >
                            <Search size={13} />
                        </button>
                    </form>

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

                {/* Mobile Dedicated Search Row (Full Width Row on Mobile) */}
                <div className="block md:hidden px-4 pt-1.5 pb-1">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="w-full rounded-full border border-gray-200 bg-gray-50 pl-4 pr-10 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:bg-white focus:ring-2 focus:ring-[#2d6a27]/20 focus:outline-none transition-all shadow-2xs"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-[#2d6a27] text-white hover:bg-[#23531e] transition-colors"
                            aria-label={t.search}
                        >
                            <Search size={12} />
                        </button>
                    </form>
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
