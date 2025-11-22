import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useWakeLock } from './useWakeLock';

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
const ACTIVE_TIMER_KEY = 'activeTimer';
const MAX_reasonable_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours (sanity check)

function readActiveTimer() {
    try {
        const raw = localStorage.getItem(ACTIVE_TIMER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeActiveTimer(state) {
    try {
        if (state) {
            localStorage.setItem(ACTIVE_TIMER_KEY, JSON.stringify(state));
        } else {
            localStorage.removeItem(ACTIVE_TIMER_KEY);
        }
    } catch {
        // ignore quota/parse errors
    }
}

function hydrateTimer() {
    const saved = readActiveTimer();
    if (!saved || !saved.side) return null;

    const elapsedBase = Number(saved.elapsedBase) || 0;
    const paused = !!saved.paused;
    const pausedAt = saved.pausedAt ? Number(saved.pausedAt) : null;
    let startedAt = null;
    let duration = elapsedBase;

    if (!paused) {
        const parsedStart = Number(saved.startedAt);
        if (Number.isFinite(parsedStart) && parsedStart > 0) {
            const timeSinceStart = Date.now() - parsedStart;

            if (duration + timeSinceStart / 1000 > MAX_reasonable_DURATION_MS / 1000) {
                return {
                    side: saved.side,
                    paused: true,
                    elapsedBase: 60 * 60,
                    startedAt: null,
                    pausedAt: Date.now(),
                    duration: 60 * 60,
                    wasStale: true,
                };
            }

            startedAt = parsedStart;
            duration = elapsedBase + Math.floor(timeSinceStart / 1000);
        }
    }

    return {
        side: saved.side,
        paused,
        elapsedBase,
        startedAt,
        pausedAt,
        duration,
    };
}

export function useTimer() {
    const hydrated = useMemo(() => hydrateTimer(), []);
    const [activeSide, setActiveSide] = useState(hydrated ? hydrated.side : null);
    const [duration, setDuration] = useState(hydrated ? hydrated.duration : 0);
    const [paused, setPaused] = useState(hydrated ? hydrated.paused : false);
    const startTimeRef = useRef(hydrated && !hydrated.paused ? hydrated.startedAt : null);
    // Accumulates seconds across pause/resume cycles
    const elapsedBaseRef = useRef(hydrated ? hydrated.elapsedBase : 0);
    // Timestamp when timer was paused (for accurate endTime)
    const pausedAtRef = useRef(hydrated ? hydrated.pausedAt : null);

    // Keep screen awake ONLY while actively timing
    useWakeLock(activeSide !== null && !paused);

    // Update duration based on elapsed time from startTime
    useEffect(() => {
        if (activeSide === null || startTimeRef.current === null || paused) return;

        // Update duration every second based on actual elapsed time
        const tick = () => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setDuration(elapsedBaseRef.current + elapsed);
        };
        tick();
        const interval = setInterval(tick, 1000);

        return () => clearInterval(interval);
    }, [activeSide, paused]);

    // Persist on visibility changes/pagehide to avoid losing progress
    useEffect(() => {
        const persist = () => {
            if (activeSide === null) {
                writeActiveTimer(null);
                return;
            }
            const now = Date.now();
            const elapsed =
                !paused && startTimeRef.current
                    ? Math.floor((now - startTimeRef.current) / 1000)
                    : 0;
            writeActiveTimer({
                side: activeSide,
                paused,
                elapsedBase: elapsedBaseRef.current + elapsed,
                startedAt: paused ? null : startTimeRef.current || now,
            });
        };
        document.addEventListener('visibilitychange', persist);
        window.addEventListener('pagehide', persist);
        return () => {
            document.removeEventListener('visibilitychange', persist);
            window.removeEventListener('pagehide', persist);
        };
    }, [activeSide, paused]);

    const startTimer = useCallback((side) => {
        setActiveSide(side);
        startTimeRef.current = Date.now();
        elapsedBaseRef.current = 0;
        pausedAtRef.current = null;
        setDuration(0);
        setPaused(false);
        writeActiveTimer({
            side,
            paused: false,
            elapsedBase: 0,
            startedAt: startTimeRef.current,
            pausedAt: null,
        });
    }, []);

    const pauseTimer = useCallback(() => {
        if (activeSide === null || paused) return;
        // Add elapsed since last (re)start to base
        const now = Date.now();
        const elapsed = startTimeRef.current ? Math.floor((now - startTimeRef.current) / 1000) : 0;
        elapsedBaseRef.current += elapsed;
        setDuration(elapsedBaseRef.current);
        setPaused(true);
        pausedAtRef.current = now;
        startTimeRef.current = null;
        writeActiveTimer({
            side: activeSide,
            paused: true,
            elapsedBase: elapsedBaseRef.current,
            startedAt: null,
            pausedAt: now,
        });
    }, [activeSide, paused]);

    const resumeTimer = useCallback(() => {
        if (activeSide === null || !paused) return;
        startTimeRef.current = Date.now();
        pausedAtRef.current = null;
        setPaused(false);
        writeActiveTimer({
            side: activeSide,
            paused: false,
            elapsedBase: elapsedBaseRef.current,
            startedAt: startTimeRef.current,
            pausedAt: null,
        });
    }, [activeSide, paused]);

    const togglePause = useCallback(() => {
        if (activeSide === null) return;
        if (paused) resumeTimer();
        else pauseTimer();
    }, [activeSide, paused, pauseTimer, resumeTimer]);

    const stopTimer = useCallback(() => {
        // Calculate final duration from timestamp (more accurate than interval-based duration)
        const nowPart =
            startTimeRef.current && !paused
                ? Math.floor((Date.now() - startTimeRef.current) / 1000)
                : 0;
        const finalDuration = elapsedBaseRef.current + nowPart;

        // Use pausedAt as endTime if paused, otherwise use current time
        const endTime = paused && pausedAtRef.current ? pausedAtRef.current : Date.now();

        const feed = {
            side: activeSide,
            duration: finalDuration,
            endTime,
        };

        setActiveSide(null);
        setDuration(0);
        startTimeRef.current = null;
        pausedAtRef.current = null;
        setPaused(false);
        elapsedBaseRef.current = 0;
        writeActiveTimer(null);

        return feed;
    }, [activeSide, paused]);

    // Clean up wake lock if component unmounts while timer is active
    // (handled by useWakeLock hook)

    return {
        activeSide,
        duration,
        paused,
        startTimer,
        pauseTimer,
        resumeTimer,
        togglePause,
        stopTimer,
    };
}
