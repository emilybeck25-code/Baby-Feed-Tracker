import { FeedingSide, TEN_MINUTES_MS } from '../utils/constants.js';
import { addFeedLogic } from '../utils/feedLogic.js';

export function useFeedingHistory() {
    const { useState, useEffect, useCallback, useMemo } = React;

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('feedingHistory');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('feedingHistory', JSON.stringify(history));
    }, [history]);

    const addFeed = useCallback((newSingleFeed) => {
        setHistory(prevHistory => addFeedLogic(prevHistory, newSingleFeed));
    }, []);

    const deleteFeed = useCallback((unitId) => {
        setHistory(prevHistory => prevHistory.filter(unit => unit.id !== unitId));
    }, []);

    // Auto-completion logic
    useEffect(() => {
        if (history.length === 0) return;
        const lastUnit = history[0];
        if (lastUnit.sessions.length !== 1) return;

        const timeSinceLastFeed = Date.now() - lastUnit.endTime;
        const delay = Math.max(0, TEN_MINUTES_MS - timeSinceLastFeed);

        const timeout = setTimeout(() => {
            setHistory(prevHistory => {
                const newHistory = [...prevHistory];
                const unit = newHistory[0];
                if (unit.sessions.length === 1) {
                    const missingSide = unit.sessions[0].side === FeedingSide.Left ? FeedingSide.Right : FeedingSide.Left;
                    unit.sessions.push({
                        side: missingSide,
                        duration: 0,
                        endTime: unit.endTime
                    });
                }
                return newHistory;
            });
        }, delay);

        return () => clearTimeout(timeout);
    }, [history]);

    const clearHistory = useCallback(() => {
        if (window.confirm('Are you sure you want to clear all feeding history?')) {
            setHistory([]);
            localStorage.removeItem('feedingHistory');
        }
    }, []);

    const lastFeedTime = history.length > 0 ? history[0].endTime : null;
    const chronologicalHistory = useMemo(() => [...history], [history]);

    return { history, addFeed, deleteFeed, clearHistory, lastFeedTime, chronologicalHistory };
}
