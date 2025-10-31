import { useState, useEffect, useCallback, useMemo } from 'react';
import { addFeedLogic, PENDING_UNIT_PREFIX } from '../utils/feedLogic.js';

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
        const saved = localStorage.getItem('feedingHistory');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('feedingHistory', JSON.stringify(history));
    }, [history]);

    const addPendingFeed = useCallback((side, startTime) => {
        setHistory((prevHistory) => {
            const pendingUnit = createPendingUnit(side, startTime);
            if (prevHistory.length > 0 && prevHistory[0]?.id?.startsWith(PENDING_UNIT_PREFIX)) {
                return prevHistory;
            }
            return [pendingUnit, ...prevHistory];
        });
    }, []);

    const addFeed = useCallback((newSingleFeed) => {
        setHistory((prevHistory) => addFeedLogic(prevHistory, newSingleFeed));
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
    };
}
