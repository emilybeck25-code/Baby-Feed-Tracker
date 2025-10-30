import { createContext, useContext } from 'react';
import { useTimer } from '../hooks/useTimer';
import { useFeedingHistory } from '../hooks/useFeedingHistory';

const FeedingContext = createContext(null);

export function FeedingProvider({ children }) {
    const timer = useTimer();
    const history = useFeedingHistory();

    const value = {
        // Timer state and methods
        activeSide: timer.activeSide,
        duration: timer.duration,
        paused: timer.paused,
        startTimer: timer.startTimer,
        pauseTimer: timer.pauseTimer,
        resumeTimer: timer.resumeTimer,
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
