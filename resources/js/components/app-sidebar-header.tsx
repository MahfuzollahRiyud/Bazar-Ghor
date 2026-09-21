import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Globe, Store } from 'lucide-react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { language, toggleLanguage } = useAdminLanguage();

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 bg-white">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2">
                {/* Language Switcher Toggle */}
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#2d6a27] hover:bg-green-50 hover:text-[#2d6a27] transition shadow-2xs active:scale-95"
                    title={language === 'en' ? 'বাংলায় পরিবর্তন করুন' : 'Switch to English'}
                >
                    <Globe size={13} className="text-[#2d6a27]" />
                    <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
                </button>

                {/* Quick Link to Storefront */}
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-[#2d6a27] hover:border-[#2d6a27] transition shadow-2xs"
                >
                    <Store size={14} className="text-[#2d6a27]" />
                    <span>{language === 'en' ? 'View Store' : 'স্টোর দেখুন'}</span>
                </a>
            </div>
        </header>
    );
}
