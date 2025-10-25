import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer() {
    const [activeSide, setActiveSide] = useState(null);
    const [duration, setDuration] = useState(0);
    const startTimeRef = useRef(null);
    const wakeLockRef = useRef(null);

    // Update duration based on elapsed time from startTime
    useEffect(() => {
        if (activeSide === null || startTimeRef.current === null) return;

        // Update duration every second based on actual elapsed time
        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setDuration(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeSide]);

    const startTimer = useCallback(async (side) => {
        setActiveSide(side);
        startTimeRef.current = Date.now();
        setDuration(0);

        // Request wake lock to keep screen on during feeding
        if ('wakeLock' in navigator) {
            try {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                console.log('Wake lock acquired - screen will stay on');
            } catch (err) {
                console.warn('Wake lock request failed:', err);
            }
        }
    }, []);

    const stopTimer = useCallback(() => {
        // Calculate final duration from timestamp (more accurate than interval-based duration)
        const finalDuration = startTimeRef.current
            ? Math.floor((Date.now() - startTimeRef.current) / 1000)
            : duration;

        const feed = {
            side: activeSide,
            duration: finalDuration,
            endTime: Date.now()
        };

        setActiveSide(null);
        setDuration(0);
        startTimeRef.current = null;

        // Release wake lock when feeding stops
        if (wakeLockRef.current) {
            wakeLockRef.current.release()
                .then(() => {
                    console.log('Wake lock released');
                    wakeLockRef.current = null;
                })
                .catch((err) => {
                    console.warn('Wake lock release failed:', err);
                });
        }

        return feed;
    }, [activeSide, duration]);

    // Clean up wake lock if component unmounts while timer is active
    useEffect(() => {
        return () => {
            if (wakeLockRef.current) {
                wakeLockRef.current.release();
            }
        };
    }, []);

    return { activeSide, duration, startTimer, stopTimer };
}
