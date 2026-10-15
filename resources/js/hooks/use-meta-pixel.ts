import { useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { initMetaPixel, trackPageView } from '@/lib/tracking';

interface TrackingProps {
    trackingSettings?: {
        meta_pixel_id?: string;
        meta_pixel_enabled?: boolean;
        meta_test_event_code?: string;
    };
    [key: string]: any;
}

export function useMetaPixel() {
    const { trackingSettings } = usePage<TrackingProps>().props;

    useEffect(() => {
        if (!trackingSettings?.meta_pixel_enabled || !trackingSettings?.meta_pixel_id) {
            return;
        }

        const pixelId = trackingSettings.meta_pixel_id.trim();
        if (!pixelId) return;

        // Initialize Meta Pixel
        initMetaPixel(pixelId, trackingSettings.meta_test_event_code);

        // Fire initial page view
        trackPageView();

        // Listen for Inertia page transitions
        const removeFinishListener = router.on('finish', (event) => {
            const url = event.detail?.page?.url || window.location.pathname;
            // Only track storefront pages
            if (!url.startsWith('/dashboard') && !url.startsWith('/admin')) {
                trackPageView();
            }
        });

        return () => {
            removeFinishListener();
        };
    }, [trackingSettings?.meta_pixel_id, trackingSettings?.meta_pixel_enabled]);
}
