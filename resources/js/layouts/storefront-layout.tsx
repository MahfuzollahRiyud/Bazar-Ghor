import { CartProvider } from '@/contexts/CartContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import StoreFooter from '@/components/store/StoreFooter';
import StoreNavbar from '@/components/store/StoreNavbar';
import WhatsAppButton from '@/components/store/WhatsAppButton';
import { useEffect, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export default function StorefrontLayout({ children }: Props) {
    useEffect(() => {
        // Guarantee storefront stays in clean, crisp light mode so white inputs and black text never clash with OS dark mode
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
    }, []);

    return (
        <LanguageProvider>
            <CartProvider>
                <div className="storefront flex min-h-screen flex-col bg-[#faf9f6] text-gray-900 antialiased selection:bg-[#2d6a27] selection:text-white">
                    <StoreNavbar />
                    <main className="flex-1">
                        {children}
                    </main>
                    <StoreFooter />
                    <WhatsAppButton />
                </div>
            </CartProvider>
        </LanguageProvider>
    );
}
