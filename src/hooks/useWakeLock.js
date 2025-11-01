import { useCallback, useEffect, useRef } from 'react';

/**
 * Keeps the screen from dimming/sleeping while the app is visible.
 * Best-effort; may require a user gesture on some browsers.
 */
export function useWakeLock(enabled = true) {
    const sentinelRef = useRef(null);
    const requestWakeLockRef = useRef(() => {});

    const requestWakeLock = useCallback(async () => {
        if (!enabled) return;
        if (!('wakeLock' in navigator)) return;
        try {
            if (sentinelRef.current) {
                sentinelRef.current.removeEventListener('release', requestWakeLockRef.current);
                sentinelRef.current.release().catch(() => {});
            }
            const sentinel = await navigator.wakeLock.request('screen');
            sentinelRef.current = sentinel;
            sentinel.addEventListener('release', requestWakeLockRef.current);
        } catch {
            // NotAllowedError / AbortError — will retry on next user interaction.
        }
    }, [enabled]);

    useEffect(() => {
        requestWakeLockRef.current = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };
    }, [requestWakeLock]);

    useEffect(() => {
        if (!enabled) return;
        if (document.visibilityState === 'visible') {
            requestWakeLock();
        }
        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        const onFirstActivation = () => {
            requestWakeLock();
            window.removeEventListener('pointerdown', onFirstActivation);
            window.removeEventListener('keydown', onFirstActivation);
            window.removeEventListener('touchstart', onFirstActivation);
        };
        window.addEventListener('pointerdown', onFirstActivation, { once: true });
        window.addEventListener('keydown', onFirstActivation, { once: true });
        window.addEventListener('touchstart', onFirstActivation, { once: true });
        return () => {
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('pointerdown', onFirstActivation);
            window.removeEventListener('keydown', onFirstActivation);
            window.removeEventListener('touchstart', onFirstActivation);
            const sentinel = sentinelRef.current;
            if (sentinel) {
                sentinel.removeEventListener('release', requestWakeLockRef.current);
                sentinel.release().catch(() => {});
                sentinelRef.current = null;
            }
        };
    }, [enabled, requestWakeLock]);
}
