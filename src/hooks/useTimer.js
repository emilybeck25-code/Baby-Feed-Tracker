import React from 'react';

export function useTimer() {
    const { useState, useEffect, useCallback } = React;
    const [activeSide, setActiveSide] = useState(null);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (activeSide === null) return;
        const interval = setInterval(() => {
            setDuration(d => d + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [activeSide]);

    const startTimer = useCallback((side) => {
        setActiveSide(side);
        setDuration(0);
    }, []);

    const stopTimer = useCallback(() => {
        const feed = {
            side: activeSide,
            duration: duration,
            endTime: Date.now()
        };
        setActiveSide(null);
        setDuration(0);
        return feed;
    }, [activeSide, duration]);

    return { activeSide, duration, startTimer, stopTimer };
}
