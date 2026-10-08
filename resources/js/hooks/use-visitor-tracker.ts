import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

function getOrSetToken(key: string, storage: Storage, prefix: string): string {
    try {
        let token = storage.getItem(key);
        if (!token) {
            token = prefix + '_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
            storage.setItem(key, token);
        }
        return token;
    } catch {
        return prefix + '_' + Date.now().toString(36);
    }
}

export function useVisitorTracker() {
    const currentLogIdRef = useRef<number | null>(null);
    const pageStartTimeRef = useRef<number>(Date.now());
    const heartbeatTimerRef = useRef<any>(null);

    const sendDurationUpdate = (logId: number, duration: number) => {
        if (!logId || duration <= 0) return;

        const payload = JSON.stringify({
            log_id: logId,
            duration_seconds: duration,
        });

        // Prefer sendBeacon for unloads/backgrounding
        if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon('/api/analytics/heartbeat', blob);
        } else {
            fetch('/api/analytics/heartbeat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true,
            }).catch(() => {});
        }
    };

    const trackCurrentPage = () => {
        // Clear any prior intervals
        if (heartbeatTimerRef.current) {
            clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
        }

        // Finalize previous page duration if exists
        if (currentLogIdRef.current) {
            const duration = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
            sendDurationUpdate(currentLogIdRef.current, duration);
            currentLogIdRef.current = null;
        }

        pageStartTimeRef.current = Date.now();

        const visitorId = getOrSetToken('bg_vid', localStorage, 'v');
        const sessionId = getOrSetToken('bg_sid', sessionStorage, 's');
        const path = window.location.pathname;

        // Skip dashboard or internal paths
        if (path.startsWith('/dashboard') || path.startsWith('/api')) {
            return;
        }

        fetch('/api/analytics/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                visitor_id: visitorId,
                session_id: sessionId,
                page_path: path,
                page_title: document.title,
                referer: document.referrer || '',
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data && data.log_id) {
                    currentLogIdRef.current = data.log_id;

                    // Periodic heartbeat every 15 seconds (up to 30 mins)
                    heartbeatTimerRef.current = setInterval(() => {
                        if (!currentLogIdRef.current) return;
                        const duration = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
                        if (duration > 1800) {
                            clearInterval(heartbeatTimerRef.current);
                            return;
                        }
                        sendDurationUpdate(currentLogIdRef.current, duration);
                    }, 15000);
                }
            })
            .catch(() => {});
    };

    useEffect(() => {
        // Initial page load
        trackCurrentPage();

        // Track on Inertia page navigations
        const unlistenNavigate = router.on('navigate', () => {
            // Small timeout to allow document.title and URL to update
            setTimeout(() => {
                trackCurrentPage();
            }, 100);
        });

        // Visibility / unload handlers
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && currentLogIdRef.current) {
                const duration = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
                sendDurationUpdate(currentLogIdRef.current, duration);
            }
        };

        const handleBeforeUnload = () => {
            if (currentLogIdRef.current) {
                const duration = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
                sendDurationUpdate(currentLogIdRef.current, duration);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            unlistenNavigate();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (heartbeatTimerRef.current) {
                clearInterval(heartbeatTimerRef.current);
            }
            if (currentLogIdRef.current) {
                const duration = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
                sendDurationUpdate(currentLogIdRef.current, duration);
            }
        };
    }, []);
}
