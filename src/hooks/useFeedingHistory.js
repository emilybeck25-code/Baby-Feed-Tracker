import { useState, useEffect, useCallback, useMemo } from 'react';
import { addFeedLogic } from '../utils/feedLogic.js';

const STORAGE_KEY = 'feedingHistory';

/**
 * Custom hook for managing feeding history with localStorage persistence.
 *
 * @returns {Object} History state and control functions
 * @returns {Array} .history - Array of feed units (newest first)
 * @returns {Function} .addFeed - Add a new feed session to history
 * @returns {Function} .deleteFeed - Delete a feed unit by ID
 * @returns {Function} .clearHistory - Clear all feeding history
 * @returns {Function} .importHistory - Import history data (with confirmation)
 * @returns {number|null} .lastFeedTime - Timestamp of most recent feed
 * @returns {Array} .chronologicalHistory - Same as history (for backwards compatibility)
 */
export function useFeedingHistory() {
    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            console.warn('[FeedingHistory] Failed to parse localStorage; resetting.');
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch {
            // ignore quota errors
        }
    }, [history]);

    // Cross-tab sync
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key !== STORAGE_KEY) return;
            try {
                const next = e.newValue ? JSON.parse(e.newValue) : [];
                setHistory(Array.isArray(next) ? next : []);
            } catch {
                // ignore parse error from other tab
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);
    const addFeed = useCallback((newSingleFeed) => {
        setHistory((prevHistory) => addFeedLogic(prevHistory, newSingleFeed));
    }, []);

    const addBottleFeed = useCallback((volumeOz, at = Date.now()) => {
        const numeric = Number(volumeOz);
        const sanitized = Number.isFinite(numeric) ? Math.round(numeric * 10) / 10 : 0;
        const bottleUnit = {
            id: `${Date.now()}-${Math.random()}`,
            type: 'Bottle',
            volumeOz: sanitized,
            sessions: [],
            endTime: at,
        };

        setHistory((prevHistory) => [bottleUnit, ...prevHistory]);
    }, []);

    const deleteFeed = useCallback((unitId) => {
        setHistory((prevHistory) => prevHistory.filter((unit) => unit.id !== unitId));
    }, []);

    const updateFeed = useCallback((unitId, payload) => {
        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
        setHistory((prevHistory) => {
            const idx = prevHistory.findIndex((unit) => unit.id === unitId);
            if (idx === -1) return prevHistory;
            const unit = prevHistory[idx];
            if (unit.isActive) return prevHistory;

            if (payload?.type === 'breast') {
                const targetSide = payload.side;
                if (!targetSide) return prevHistory;
                const rawSeconds = Number(payload.durationSeconds ?? payload.duration ?? 0);
                const clampedSeconds = clamp(isFinite(rawSeconds) ? rawSeconds : 0, 0, 20 * 60);
                const sessions = Array.isArray(unit.sessions) ? [...unit.sessions] : [];
                const existingIdx = sessions.findIndex((s) => s?.side === targetSide);
                if (existingIdx !== -1) {
                    sessions[existingIdx] = {
                        ...sessions[existingIdx],
                        duration: clampedSeconds,
                    };
                } else {
                    sessions.push({
                        side: targetSide,
                        duration: clampedSeconds,
                        endTime: unit.endTime,
                    });
                }
                const updatedUnit = {
                    ...unit,
                    sessions,
                };
                const next = [...prevHistory];
                next[idx] = updatedUnit;
                return next;
            }

            if (payload?.type === 'bottle') {
                const rawOz = Number(payload.volumeOz ?? payload.volume ?? 0);
                const clampedOz = clamp(isFinite(rawOz) ? rawOz : 0, 0, 20);
                const roundedOz = Math.round(clampedOz * 10) / 10;
                const updatedUnit = {
                    ...unit,
                    volumeOz: roundedOz,
                    type: unit.type || 'Bottle',
                    sessions: Array.isArray(unit.sessions) ? unit.sessions : [],
                };
                const next = [...prevHistory];
                next[idx] = updatedUnit;
                return next;
            }

            return prevHistory;
        });
    }, []);

    const clearHistory = useCallback(() => {
        if (window.confirm('Are you sure you want to clear all feeding history?')) {
            setHistory([]);
            localStorage.removeItem('feedingHistory');
        }
    }, []);

    const importHistory = useCallback((importedData) => {
        if (
            window.confirm(
                'This will replace your current feeding history. Are you sure you want to continue?'
            )
        ) {
            setHistory(importedData);
        }
    }, []);

    const lastFeedTime = history.length > 0 ? history[0].endTime : null;
    const chronologicalHistory = useMemo(() => [...history], [history]);

    return {
        history,
        addFeed,
        deleteFeed,
        clearHistory,
        importHistory,
        lastFeedTime,
        chronologicalHistory,
        addBottleFeed,
        updateFeed,
    };
}
