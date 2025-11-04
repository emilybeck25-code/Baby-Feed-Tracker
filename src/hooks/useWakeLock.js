import { useEffect, useRef } from 'react';
import NoSleep from 'nosleep.js';

/**
 * Keeps the screen awake across browsers using NoSleep.js.
 * Keeps the same hook signature: pass `enabled` to control activation.
 */
let sharedNoSleepInstance = null;

const getNoSleepInstance = () => {
    if (typeof window === 'undefined') return null;
    if (!sharedNoSleepInstance) {
        sharedNoSleepInstance = new NoSleep();
    }
    return sharedNoSleepInstance;
};

export function useWakeLock(enabled = true) {
    const isActiveRef = useRef(false);
    const enablePromiseRef = useRef(null);

    useEffect(() => {
        const noSleep = getNoSleepInstance();
        if (!noSleep) return;
        if (typeof document === 'undefined' || typeof window === 'undefined') return;

        let cancelled = false;
        const listenerOptions = { passive: true };

        const isDocumentVisible = () => {
            const state = document.visibilityState;
            return state === undefined || state === 'visible';
        };

        const disableNoSleep = () => {
            enablePromiseRef.current = null;
            if (!isActiveRef.current) return;
            try {
                noSleep.disable();
            } catch {
                // Ignore disable errors; we'll attempt again if needed.
            }
            isActiveRef.current = false;
        };

        const tryEnable = () => {
            if (
                !enabled ||
                cancelled ||
                isActiveRef.current ||
                enablePromiseRef.current ||
                !isDocumentVisible()
            ) {
                return;
            }
            const promise = (async () => {
                try {
                    await noSleep.enable();
                    if (!cancelled && enabled) {
                        isActiveRef.current = true;
                    }
                } catch {
                    // Most failures are due to missing user interaction; retry on next gesture.
                } finally {
                    if (enablePromiseRef.current === promise) {
                        enablePromiseRef.current = null;
                    }
                }
            })();
            enablePromiseRef.current = promise;
        };

        const onVisibilityChange = () => {
            if (isDocumentVisible()) {
                tryEnable();
            } else {
                disableNoSleep();
            }
        };

        const onUserActivation = () => {
            tryEnable();
        };

        if (enabled) {
            tryEnable();
            document.addEventListener('visibilitychange', onVisibilityChange);
            window.addEventListener('pointerdown', onUserActivation, listenerOptions);
            window.addEventListener('touchstart', onUserActivation, listenerOptions);
            window.addEventListener('keydown', onUserActivation, listenerOptions);
        } else {
            disableNoSleep();
        }

        return () => {
            cancelled = true;
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('pointerdown', onUserActivation, listenerOptions);
            window.removeEventListener('touchstart', onUserActivation, listenerOptions);
            window.removeEventListener('keydown', onUserActivation, listenerOptions);
            disableNoSleep();
        };
    }, [enabled]);
}
