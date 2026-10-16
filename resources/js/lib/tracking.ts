/**
 * Bazar Ghor - Universal E-Commerce Tracking Layer
 * Supports Meta Pixel (client-side) with event_id deduplication for Meta CAPI (server-side),
 * and modular architecture for future tracking adapters (GA4, TikTok Pixel, etc.)
 */

declare global {
    interface Window {
        fbq?: (...args: any[]) => void;
        _fbq?: any;
    }
}

let isInitialized = false;
let currentPixelId: string | null = null;

/**
 * Dynamically inject and initialize Meta Pixel
 */
export function initMetaPixel(pixelId: string, testEventCode?: string): void {
    if (typeof window === 'undefined') return;

    const trimmedId = pixelId.trim();
    if (!trimmedId) return;

    if (isInitialized && currentPixelId === trimmedId) {
        return;
    }

    // Standard Meta Pixel base code loader
    if (!window.fbq) {
        const n: any = function (...args: any[]) {
            if (n.callMethod) {
                n.callMethod.apply(n, args);
            } else {
                n.queue.push(args);
            }
        };
        if (!window._fbq) window._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        window.fbq = n;

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(script, firstScript);
        } else {
            document.head.appendChild(script);
        }
    }

    window.fbq('init', trimmedId);
    currentPixelId = trimmedId;
    isInitialized = true;

    if (process.env.NODE_ENV !== 'production') {
        console.log(`[Tracking] Meta Pixel initialized with ID: ${trimmedId}`);
    }
}

/**
 * Generic event dispatcher
 */
export function trackEvent(
    eventName: string,
    params: Record<string, any> = {},
    eventId?: string
): void {
    if (typeof window === 'undefined') return;

    try {
        if (typeof window.fbq === 'function') {
            if (eventId) {
                window.fbq('track', eventName, params, { eventID: eventId });
            } else {
                window.fbq('track', eventName, params);
            }
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Tracking Event] ${eventName}`, {
                params,
                eventId,
            });
        }
    } catch (e) {
        console.warn(`[Tracking Error] Failed to dispatch ${eventName}:`, e);
    }
}

/**
 * Standard: PageView
 */
export function trackPageView(): void {
    trackEvent('PageView');
}

/**
 * Standard: ViewContent (Product details view)
 */
export function trackViewContent(data: {
    id: string | number;
    name: string;
    price: number;
    category?: string;
    currency?: string;
}): void {
    trackEvent('ViewContent', {
        content_name: data.name,
        content_category: data.category || 'Product',
        content_ids: [data.id.toString()],
        content_type: 'product',
        value: Number(data.price),
        currency: data.currency || 'BDT',
    });
}

/**
 * Standard: AddToCart
 */
export function trackAddToCart(data: {
    id: string | number;
    name: string;
    price: number;
    quantity?: number;
    category?: string;
    currency?: string;
}): void {
    const qty = data.quantity ?? 1;
    trackEvent('AddToCart', {
        content_name: data.name,
        content_category: data.category || 'Product',
        content_ids: [data.id.toString()],
        content_type: 'product',
        value: Number(data.price) * qty,
        currency: data.currency || 'BDT',
    });
}

export interface CustomerData {
    name?: string;
    phone?: string;
    email?: string;
    district?: string;
    city?: string;
}

/**
 * Format phone to international digits-only format required by Meta (e.g. 88017XXXXXXXX)
 */
export function formatMetaPhone(phone?: string): string | undefined {
    if (!phone) return undefined;
    const clean = phone.replace(/[^0-9]/g, '');
    if (!clean) return undefined;
    if (clean.startsWith('880')) return clean;
    if (clean.startsWith('0')) return '88' + clean;
    if (clean.length === 10 && clean.startsWith('1')) return '880' + clean;
    return clean;
}

/**
 * Meta Pixel Manual Advanced Matching
 * Feeds hashed customer parameters (phone, email, name, city) to Meta
 * to dramatically increase Event Match Quality (EMQ) and ROAS.
 */
export function setCustomerData(customer: CustomerData): void {
    if (typeof window === 'undefined' || !window.fbq) return;

    const userData: Record<string, string> = {
        country: 'bd',
    };

    if (customer.email && customer.email.trim()) {
        userData.em = customer.email.trim().toLowerCase();
    }

    const formattedPhone = formatMetaPhone(customer.phone);
    if (formattedPhone) {
        userData.ph = formattedPhone;
        userData.external_id = formattedPhone;
    }

    if (customer.name && customer.name.trim()) {
        const parts = customer.name.trim().toLowerCase().split(/\s+/);
        userData.fn = parts[0] || '';
        if (parts.length > 1) {
            userData.ln = parts.slice(1).join(' ');
        }
    }

    const city = customer.city || customer.district;
    if (city && city.trim()) {
        userData.ct = city.trim().toLowerCase();
    }

    try {
        if (currentPixelId) {
            window.fbq('init', currentPixelId, userData);
        }
    } catch (e) {
        // silent fail
    }
}

/**
 * Standard: InitiateCheckout
 */
export function trackInitiateCheckout(data: {
    items: Array<{ id: string | number; name?: string; price: number; quantity: number }>;
    value: number;
    currency?: string;
    customer?: CustomerData;
}): void {
    if (data.customer) {
        setCustomerData(data.customer);
    }

    trackEvent('InitiateCheckout', {
        content_ids: data.items.map((i) => i.id.toString()),
        contents: data.items.map((i) => ({
            id: i.id.toString(),
            quantity: i.quantity,
            item_price: Number(i.price),
        })),
        content_type: 'product',
        num_items: data.items.reduce((acc, i) => acc + i.quantity, 0),
        value: Number(data.value),
        currency: data.currency || 'BDT',
    });
}

/**
 * Standard: AddPaymentInfo
 */
export function trackAddPaymentInfo(data: {
    payment_method: string;
    value: number;
    currency?: string;
}): void {
    trackEvent('AddPaymentInfo', {
        payment_method: data.payment_method,
        value: Number(data.value),
        currency: data.currency || 'BDT',
    });
}

/**
 * Standard: Purchase (With exact event_id matching CAPI for deduplication and Advanced Matching)
 */
export function trackPurchase(data: {
    order_number: string;
    value: number;
    currency?: string;
    items?: Array<{ product_id?: number | string; product_name?: string; price: number; quantity: number }>;
    customer?: CustomerData;
    delivery_area?: string;
    payment_method?: string;
}): void {
    if (data.customer) {
        setCustomerData(data.customer);
    }

    const eventId = `order_${data.order_number}`;

    const contents = (data.items || []).map((i) => ({
        id: (i.product_id || i.product_name || 'item').toString(),
        quantity: i.quantity,
        item_price: Number(i.price),
    }));

    const contentIds = (data.items || []).map((i) => (i.product_id || i.product_name || 'item').toString());

    trackEvent(
        'Purchase',
        {
            content_type: 'product',
            content_ids: contentIds,
            contents: contents,
            value: Number(data.value),
            currency: data.currency || 'BDT',
            order_id: data.order_number,
            delivery_area: data.delivery_area,
            payment_method: data.payment_method || 'cash_on_delivery',
            num_items: (data.items || []).reduce((acc, i) => acc + i.quantity, 0),
        },
        eventId
    );
}

/**
 * Standard: Search
 */
export function trackSearch(query: string): void {
    if (!query || !query.trim()) return;
    trackEvent('Search', {
        search_string: query.trim(),
    });
}
