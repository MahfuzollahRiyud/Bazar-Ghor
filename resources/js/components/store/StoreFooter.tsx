import { useLanguage } from '@/contexts/LanguageContext';
import { Link, usePage } from '@inertiajs/react';
import { ExternalLink, Facebook, Lock, MapPin, Phone } from 'lucide-react';
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

export default function StoreFooter() {
    const { t, language } = useLanguage();
    const { props } = usePage<{ socialLinks?: SocialLinkItem[] }>();
    const socialLinks = Array.isArray(props.socialLinks) ? props.socialLinks : [];
    const footerSocialLinks = socialLinks.filter((s) => s && s.is_active && s.show_in_footer);

    const quickLinks = [
        { label: t.home, href: '/' },
        { label: t.shop, href: '/shop' },
        { label: t.aboutUs, href: '/about' },
        { label: t.contactUs, href: '/contact' },
        { label: t.myAccount, href: '/account' },
    ];

    const policyLinks = [
        { label: t.privacyPolicy, href: '/privacy-policy' },
        { label: t.returnPolicy, href: '/return-policy' },
        { label: t.termsConditions, href: '/terms' },
    ];

    const categories = [
        { label: language === 'en' ? 'Airbuds' : 'এয়ারবাডস', slug: 'airbuds' },
        { label: language === 'en' ? 'Headphones' : 'হেডফোন', slug: 'headphone' },
        { label: language === 'en' ? 'Trimmers' : 'ট্রিমার', slug: 'trimmer' },
        { label: language === 'en' ? 'Smart Watches' : 'স্মার্ট ওয়াচ', slug: 'smart-watch' },
        { label: language === 'en' ? 'Speakers' : 'স্পিকার', slug: 'speaker' },
        { label: language === 'en' ? 'Chargers & Cables' : 'চার্জার ও ক্যাবল', slug: 'charger-cable' },
    ];

    return (
        <footer className="bg-[#143312] text-white border-t border-green-900/60">
            {/* Main Footer */}
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <div className="mb-4 inline-flex items-center rounded-xl bg-white p-1.5 shadow-sm">
                            <img
                                src="/images/logo.png"
                                alt="Bazar Ghor"
                                className="h-12 w-auto object-contain rounded-lg"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                        </div>
                        <p className="mb-4 text-sm leading-relaxed text-green-200">
                            {t.footerBrandDesc}
                        </p>
                        <div className="flex flex-wrap items-center gap-2.5">
                            {footerSocialLinks.length > 0 ? (
                                footerSocialLinks.map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2d6a27] text-white transition-all hover:bg-[#3d8f33] hover:scale-110 shadow-xs"
                                        aria-label={item.title}
                                        title={item.title}
                                    >
                                        <SocialIcon platform={item.platform} icon={item.icon} size={17} />
                                    </a>
                                ))
                            ) : (
                                <a
                                    href="https://www.facebook.com/onlinebazarghor"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2d6a27] text-white transition-colors hover:bg-[#3d8f33]"
                                    aria-label="Facebook Page"
                                    title="Facebook Page (Bazar Ghor)"
                                >
                                    <SocialIcon platform="facebook" size={17} />
                                </a>
                            )}
                            <Link
                                href="/login"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-green-900/60 text-green-200 transition-colors hover:bg-green-800 hover:text-white"
                                aria-label="Admin Login"
                                title={t.adminLogin}
                            >
                                <Lock size={16} />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links & Policies */}
                    <div>
                        <h3 className="mb-4 text-base font-semibold text-green-300 uppercase tracking-wider">{t.quickLinks}</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-green-200 transition-colors hover:text-white hover:translate-x-1 inline-block"
                                    >
                                        → {link.label}
                                    </Link>
                                </li>
                            ))}
                            {policyLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-green-200 transition-colors hover:text-white hover:translate-x-1 inline-block"
                                    >
                                        → {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="mb-4 text-base font-semibold text-green-300 uppercase tracking-wider">{t.categories}</h3>
                        <ul className="space-y-2">
                            {categories.map((cat) => (
                                <li key={cat.slug}>
                                    <Link
                                        href={`/shop?category=${cat.slug}`}
                                        className="text-sm text-green-200 transition-colors hover:text-white hover:translate-x-1 inline-block"
                                    >
                                        → {cat.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 text-base font-semibold text-green-300 uppercase tracking-wider">{t.contactUs}</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <Phone size={16} className="mt-0.5 shrink-0 text-green-400" />
                                <div>
                                    <p className="text-xs text-green-300">Helpline</p>
                                    <a href="tel:01613545166" className="text-sm font-medium text-white hover:text-green-300">
                                        01613-545166
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="mt-0.5 shrink-0 text-emerald-400">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                <div>
                                    <p className="text-xs text-green-300">WhatsApp</p>
                                    <a
                                        href="https://wa.me/8801621270761"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-white hover:text-emerald-300"
                                    >
                                        +8801621-270761
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Facebook size={16} className="mt-0.5 shrink-0 text-green-400" />
                                <div>
                                    <p className="text-xs text-green-300">{t.facebookPage}</p>
                                    <a
                                        href="https://www.facebook.com/onlinebazarghor"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold text-white hover:text-emerald-300 inline-flex items-center gap-1.5 transition-colors"
                                    >
                                        <span>Bazar Ghor</span>
                                        <ExternalLink size={12} className="opacity-75" />
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin size={16} className="mt-0.5 shrink-0 text-green-400" />
                                <div>
                                    <p className="text-xs text-green-300">Coverage</p>
                                    <p className="text-sm text-white">{t.cashOnDelivery}</p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Info Badge */}
                        <div className="mt-4 rounded-xl bg-[#1e481b] p-3 border border-green-700/50">
                            <p className="text-xs font-semibold text-green-300 mb-1">{t.deliveryCharge}</p>
                            <p className="text-xs text-white">🏠 {t.insideDhakaDelivery}</p>
                            <p className="text-xs text-white">🚚 {t.outsideDhakaDelivery}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-green-900/80 py-4">
                <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <p className="text-xs text-green-400">
                        © {new Date().getFullYear()} Bazar Ghor. {t.allRightsReserved}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-green-300">
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">
                            {t.privacyPolicy}
                        </Link>
                        <span>•</span>
                        <Link href="/return-policy" className="hover:text-white transition-colors">
                            {t.returnPolicy}
                        </Link>
                        <span>•</span>
                        <Link href="/terms" className="hover:text-white transition-colors">
                            {t.termsConditions}
                        </Link>
                        <span>•</span>
                        <Link href="/account" className="hover:text-white transition-colors">
                            {t.myAccount}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
