import { createContext, useContext, useEffect, useRef } from 'react';
import { useTimer } from '../hooks/useTimer';
import { useFeedingHistory } from '../hooks/useFeedingHistory';
import { PENDING_UNIT_PREFIX } from '../utils/feedLogic';

const FeedingContext = createContext(null);

export function FeedingProvider({ children }) {
    const timer = useTimer();
    const history = useFeedingHistory();

    const startTimerWithPending = (side) => {
        const startTime = Date.now();
        history.addPendingFeed(side, startTime);
        timer.startTimer(side);
    };

    // Track if we've already synced hydration to prevent duplicate pending units
    const hydrationSyncedRef = useRef(false);

    // Cleanup orphaned pending units when timer is not active
    useEffect(() => {
        if (timer.activeSide === null && history.history.length > 0) {
            const topUnit = history.history[0];
            // If there's a pending unit but no active timer, remove it
            if (topUnit?.id?.startsWith?.(PENDING_UNIT_PREFIX)) {
                history.deleteFeed(topUnit.id);
            }
        }
    }, [timer.activeSide, history]);

    // Sync timer hydration: if timer hydrated with active side but no pending unit exists, create one
    useEffect(() => {
        if (hydrationSyncedRef.current) return;

        if (timer.activeSide !== null) {
            const topUnit = history.history[0];
            const hasPendingUnit = topUnit?.id?.startsWith?.(PENDING_UNIT_PREFIX);

            // If timer is active but there's no pending unit, create one
            if (!hasPendingUnit) {
                // Use current time as startTime for the pending unit
                history.addPendingFeed(timer.activeSide, Date.now());
            }

            hydrationSyncedRef.current = true;
        }
    }, [timer.activeSide, history]);

    const value = {
        // Timer state and methods
        activeSide: timer.activeSide,
        duration: timer.duration,
        paused: timer.paused,
        startTimer: startTimerWithPending,
        togglePause: timer.togglePause,
        stopTimer: timer.stopTimer,

        // History state and methods
        history: history.history,
        addFeed: history.addFeed,
        deleteFeed: history.deleteFeed,
        clearHistory: history.clearHistory,
        importHistory: history.importHistory,
        lastFeedTime: history.lastFeedTime,
        chronologicalHistory: history.chronologicalHistory,
    };

    return <FeedingContext.Provider value={value}>{children}</FeedingContext.Provider>;
}

export function useFeedingContext() {
    const context = useContext(FeedingContext);
    if (!context) {
        throw new Error('useFeedingContext must be used within a FeedingProvider');
    }
    return context;
}
