import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing a feeding timer with pause/resume and wake lock support.
 *
 * @returns {Object} Timer state and control functions
 * @returns {string|null} .activeSide - Currently active side ('Left', 'Right', or null)
 * @returns {number} .duration - Current timer duration in seconds
 * @returns {boolean} .paused - Whether the timer is paused
 * @returns {Function} .startTimer - Start timer for a specific side
 * @returns {Function} .pauseTimer - Pause the active timer
 * @returns {Function} .resumeTimer - Resume the paused timer
 * @returns {Function} .togglePause - Toggle between pause and resume
 * @returns {Function} .stopTimer - Stop timer and return feed session object
 */
export function useTimer() {
    const [activeSide, setActiveSide] = useState(null);
    const [duration, setDuration] = useState(0);
    const startTimeRef = useRef(null);
    const wakeLockRef = useRef(null);
    const [paused, setPaused] = useState(false);
    // Accumulates seconds across pause/resume cycles
    const elapsedBaseRef = useRef(0);

    // Update duration based on elapsed time from startTime
    useEffect(() => {
        if (activeSide === null || startTimeRef.current === null || paused) return;

        // Update duration every second based on actual elapsed time
        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setDuration(elapsedBaseRef.current + elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [activeSide, paused]);

    const startTimer = useCallback(async (side) => {
        setActiveSide(side);
        startTimeRef.current = Date.now();
        elapsedBaseRef.current = 0;
        setDuration(0);
        setPaused(false);

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

    const pauseTimer = useCallback(() => {
        if (activeSide === null || paused) return;
        // Add elapsed since last (re)start to base
        const elapsed = startTimeRef.current
            ? Math.floor((Date.now() - startTimeRef.current) / 1000)
            : 0;
        elapsedBaseRef.current += elapsed;
        setDuration(elapsedBaseRef.current);
        setPaused(true);
    }, [activeSide, paused]);

    const resumeTimer = useCallback(() => {
        if (activeSide === null || !paused) return;
        startTimeRef.current = Date.now();
        setPaused(false);
    }, [activeSide, paused]);

    const togglePause = useCallback(() => {
        if (activeSide === null) return;
        if (paused) resumeTimer();
        else pauseTimer();
    }, [activeSide, paused, pauseTimer, resumeTimer]);

    const stopTimer = useCallback(() => {
        // Calculate final duration from timestamp (more accurate than interval-based duration)
        const nowPart = startTimeRef.current && !paused
            ? Math.floor((Date.now() - startTimeRef.current) / 1000)
            : 0;
        const finalDuration = elapsedBaseRef.current + nowPart;

        const feed = {
            side: activeSide,
            duration: finalDuration,
            endTime: Date.now(),
        };

        setActiveSide(null);
        setDuration(0);
        startTimeRef.current = null;
        setPaused(false);
        elapsedBaseRef.current = 0;

        // Release wake lock when feeding stops
        if (wakeLockRef.current) {
            wakeLockRef.current
                .release()
                .then(() => {
                    console.log('Wake lock released');
                    wakeLockRef.current = null;
                })
                .catch((err) => {
                    console.warn('Wake lock release failed:', err);
                });
        }

        return feed;
    }, [activeSide, paused]);

    // Clean up wake lock if component unmounts while timer is active
    useEffect(() => {
        return () => {
            if (wakeLockRef.current) {
                wakeLockRef.current.release();
            }
        };
    }, []);

    return { activeSide, duration, paused, startTimer, pauseTimer, resumeTimer, togglePause, stopTimer };
}
