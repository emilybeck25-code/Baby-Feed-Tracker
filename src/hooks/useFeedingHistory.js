import { useState, useEffect, useCallback, useMemo } from 'react';
import { addFeedLogic } from '../utils/feedLogic';

export function useFeedingHistory() {
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('feedingHistory');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('feedingHistory', JSON.stringify(history));
    }, [history]);

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
    };
}
