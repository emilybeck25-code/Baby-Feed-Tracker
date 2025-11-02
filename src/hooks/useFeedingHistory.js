import { useState, useEffect, useCallback, useMemo } from 'react';
import { addFeedLogic, PENDING_UNIT_PREFIX } from '../utils/feedLogic.js';

const STORAGE_KEY = 'feedingHistory';

/**
 * @internal
 * Exported for unit tests. App code should not call this directly.
 */
export function createPendingUnit(side, startTime) {
    return {
        id: `${PENDING_UNIT_PREFIX}${startTime}`,
        sessions: [
            {
                side,
                duration: 0,
                endTime: startTime,
            },
        ],
        endTime: startTime,
    };
}

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
    const addPendingFeed = useCallback((side, startTime) => {
        setHistory((prevHistory) => {
            const top = prevHistory[0];

            // Prevent duplicate pending unit
            if (top && typeof top.id === 'string' && top.id.startsWith(PENDING_UNIT_PREFIX)) {
                return prevHistory;
            }

            /**
             * Note: Do NOT infer "pending" from sessions.length. The 'pending-' ID prefix is the source of truth.
             */
            // Reuse existing single-session unit when starting the opposite side
            if (top && Array.isArray(top.sessions) && top.sessions.length === 1) {
                const firstSide = top.sessions[0]?.side;
                if (firstSide && firstSide !== side) {
                    return prevHistory;
                }
            }

            const pendingUnit = createPendingUnit(side, startTime);
            return [pendingUnit, ...prevHistory];
        });
    }, []);

    const addFeed = useCallback((newSingleFeed) => {
        setHistory((prevHistory) => addFeedLogic(prevHistory, newSingleFeed));
    }, []);

    const addBottleFeed = useCallback((volumeMl, at = Date.now()) => {
        const numericVolume = Number(volumeMl);
        const bottleUnit = {
            id: `${Date.now()}-${Math.random()}`,
            type: 'Bottle',
            volumeMl: Number.isFinite(numericVolume) ? numericVolume : 0,
            sessions: [],
            endTime: at,
        };

        setHistory((prevHistory) => [bottleUnit, ...prevHistory]);
    }, []);

    const deleteFeed = useCallback((unitId) => {
        setHistory((prevHistory) => prevHistory.filter((unit) => unit.id !== unitId));
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
        addPendingFeed,
        addBottleFeed,
    };
}
