import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTimer } from '../hooks/useTimer';
import { useFeedingHistory } from '../hooks/useFeedingHistory';
import { FeedType, MAX_FEED_DURATION_SECONDS } from '../utils/constants';

const FeedingContext = createContext(null);

const FEED_TYPE_STORAGE_KEY = 'feedType';
const COMPLETED_SESSION_KEY = 'completedSession';

export function FeedingProvider({ children }) {
    const timer = useTimer();
    const historyStore = useFeedingHistory();
    const [currentTime, setCurrentTime] = useState(() => Date.now());
    const [feedType, setFeedTypeState] = useState(() => {
        try {
            const stored = localStorage.getItem(FEED_TYPE_STORAGE_KEY);
            return stored === FeedType.Bottle ? FeedType.Bottle : FeedType.Breast;
        } catch {
            return FeedType.Breast;
        }
    });
    const [completedSession, setCompletedSession] = useState(() => {
        try {
            const saved = localStorage.getItem(COMPLETED_SESSION_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (timer.activeSide !== null) {
            setCurrentTime(Date.now());
        }
    }, [timer.activeSide, timer.duration, timer.paused]);

    useEffect(() => {
        try {
            localStorage.setItem(FEED_TYPE_STORAGE_KEY, feedType);
        } catch {
            // ignore quota errors
        }
    }, [feedType]);

    useEffect(() => {
        try {
            if (completedSession) {
                localStorage.setItem(COMPLETED_SESSION_KEY, JSON.stringify(completedSession));
            } else {
                localStorage.removeItem(COMPLETED_SESSION_KEY);
            }
        } catch {
            // ignore quota errors
        }
    }, [completedSession]);

    useEffect(() => {
        if (historyStore.history.length === 0 && completedSession !== null) {
            setCompletedSession(null);
        }
    }, [historyStore.history, completedSession]);

    useEffect(() => {
        if (timer.activeSide === null) return;
        if (timer.duration < MAX_FEED_DURATION_SECONDS) return;

        const feed = timer.stopTimer();
        historyStore.addFeed(feed);
        setCompletedSession((prev) => (prev !== null ? null : feed));
    }, [timer.activeSide, timer.duration, timer.stopTimer, historyStore.addFeed]);

    const displayHistory = useMemo(() => {
        if (timer.activeSide === null) {
            return historyStore.history;
        }

        const activeSession = {
            side: timer.activeSide,
            duration: timer.duration,
            endTime: currentTime,
        };

        if (completedSession && historyStore.history.length > 0) {
            const [latest, ...rest] = historyStore.history;
            const merged = {
                ...latest,
                sessions: Array.isArray(latest.sessions)
                    ? [...latest.sessions, activeSession]
                    : [activeSession],
                endTime: currentTime,
                isActive: true,
                isPaused: timer.paused,
            };
            return [merged, ...rest];
        }

        const activeUnit = {
            id: 'active',
            sessions: [activeSession],
            endTime: currentTime,
            isActive: true,
            isPaused: timer.paused,
        };
        return [activeUnit, ...historyStore.history];
    }, [
        timer.activeSide,
        timer.duration,
        timer.paused,
        historyStore.history,
        currentTime,
        completedSession,
    ]);

    const setFeedType = useCallback(
        (nextType) => {
            if (timer.activeSide !== null) {
                return;
            }

            const normalized =
                typeof nextType === 'string' && nextType.toLowerCase() === FeedType.Bottle
                    ? FeedType.Bottle
                    : FeedType.Breast;

            setFeedTypeState(normalized);
        },
        [timer.activeSide]
    );

    const value = {
        // Timer state and methods
        activeSide: timer.activeSide,
        duration: timer.duration,
        paused: timer.paused,
        startTimer: timer.startTimer,
        togglePause: timer.togglePause,
        stopTimer: timer.stopTimer,

        // History state and methods
        history: historyStore.history,
        addFeed: historyStore.addFeed,
        addBottleFeed: historyStore.addBottleFeed,
        deleteFeed: historyStore.deleteFeed,
        clearHistory: historyStore.clearHistory,
        importHistory: historyStore.importHistory,
        lastFeedTime: historyStore.lastFeedTime,
        chronologicalHistory: displayHistory,

        // Feed type toggle
        feedType,
        setFeedType,

        // Completed paired-feed state
        completedSession,
        setCompletedSession,
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
