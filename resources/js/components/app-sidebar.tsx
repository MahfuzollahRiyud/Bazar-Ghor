import { Link } from '@inertiajs/react';
import {
    LayoutGrid,
    Package,
    ShoppingCart,
    Tag,
    FolderOpen,
    Store,
    Image as ImageIcon,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { t } = useAdminLanguage();

    const mainNavItems: NavItem[] = [
        {
            title: t.dashboard,
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: t.products,
            href: '/dashboard/products',
            icon: Package,
        },
        {
            title: t.categories,
            href: '/dashboard/categories',
            icon: FolderOpen,
        },
        {
            title: t.media,
            href: '/dashboard/media',
            icon: ImageIcon,
        },
        {
            title: t.orders,
            href: '/dashboard/orders',
            icon: ShoppingCart,
        },
        {
            title: t.customers,
            href: '/dashboard/customers',
            icon: Users,
        },
        {
            title: t.coupons,
            href: '/dashboard/coupons',
            icon: Tag,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: t.viewStore,
            href: '/',
            icon: Store,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
