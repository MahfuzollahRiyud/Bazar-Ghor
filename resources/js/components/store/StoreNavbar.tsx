import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, usePage } from '@inertiajs/react';
import { Globe, LogIn, Menu, Phone, Search, ShoppingCart, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StoreNavbar() {
    const { totalItems } = useCart();
    const { language, toggleLanguage, t } = useLanguage();
    const { url, props } = usePage<{ auth?: { user?: { id: number; name: string; email: string; role?: string } | null } }>();
    const user = props.auth?.user;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const navLinks = [
        { label: t.home, href: '/' },
        { label: t.shop, href: '/shop' },
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
            <div className="bg-[#1f4e1b] py-2 text-white text-xs border-b border-green-800/40">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
                    <p className="font-medium tracking-wide">
                        {t.topBarDelivery}
                    </p>

                    <div className="flex items-center gap-4">
                        <a
                            href="tel:01613545166"
                            className="flex items-center gap-1.5 font-medium transition-opacity hover:opacity-90"
                        >
                            <Phone size={12} className="text-yellow-300" />
                            <span>01613-545166</span>
                        </a>

                        <span className="text-green-400">|</span>

                        {/* Auth / Account Quick Link */}
                        {user ? (
                            <Link
                                href={user.role === 'admin' ? '/dashboard' : '/account'}
                                className="flex items-center gap-1.5 font-semibold text-yellow-300 hover:text-white transition-colors"
                            >
                                <User size={13} />
                                <span>{user.role === 'admin' ? t.dashboard : t.myAccount}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-1.5 font-medium text-green-100 hover:text-white transition-colors"
                            >
                                <LogIn size={13} />
                                <span>{t.loginOrRegister}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <nav
                className={`sticky top-0 z-50 transition-all duration-300 ${
                    scrolled ? 'bg-white/98 backdrop-blur-md shadow-md py-2.5' : 'bg-white py-3.5 border-b border-gray-100'
                }`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <img
                            src="/images/logo.png"
                            alt="Bazar Ghor"
                            className="h-11 w-11 rounded-lg object-contain transition-transform group-hover:scale-105"
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

                    {/* Desktop Nav Links */}
                    <div className="hidden items-center gap-7 md:flex">
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
                        {/* Search */}
                        {searchOpen ? (
                            <form onSubmit={handleSearch} className="flex items-center gap-1.5">
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t.searchPlaceholder}
                                    className="w-44 sm:w-60 rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2d6a27] focus:ring-1 focus:ring-[#2d6a27] focus:outline-none shadow-xs"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSearchOpen(false)}
                                    className="rounded-full p-1 text-gray-500 hover:text-gray-800"
                                >
                                    <X size={18} />
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="rounded-full p-2 text-gray-600 transition-colors hover:bg-green-50 hover:text-[#2d6a27]"
                                aria-label="Search"
                                title={t.search}
                            >
                                <Search size={20} />
                            </button>
                        )}

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
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
