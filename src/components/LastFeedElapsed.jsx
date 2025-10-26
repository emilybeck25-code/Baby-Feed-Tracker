import { useState, useEffect } from 'react';

export function LastFeedElapsed({ lastFeedTime }) {
    const [elapsedMs, setElapsedMs] = useState(() =>
        lastFeedTime ? Date.now() - lastFeedTime : 0
    );

    useEffect(() => {
        if (!lastFeedTime) return;

        const updateElapsed = () => {
            setElapsedMs(Date.now() - lastFeedTime);
        };

        updateElapsed();
        const interval = setInterval(updateElapsed, 1000);

        return () => clearInterval(interval);
    }, [lastFeedTime]);

    if (!lastFeedTime) {
        return null;
    }

    const totalMinutes = Math.max(0, Math.floor(elapsedMs / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let formatted;
    if (hours > 0) {
        const hourLabel = hours === 1 ? 'hr' : 'hrs';
        const minuteLabel = minutes === 1 ? 'min' : 'mins';
        const minuteValue = String(minutes).padStart(2, '0');
        formatted = `${hours} ${hourLabel} ${minuteValue} ${minuteLabel}`;
    } else {
        const minuteLabel = totalMinutes === 1 ? 'min' : 'mins';
        formatted = `${totalMinutes} ${minuteLabel}`;
    }

    return (
        <div className="flex flex-col items-center gap-1 mb-6">
            <div className="text-4xl font-semibold text-slate-900 tracking-tight">{formatted}</div>
            <div className="text-sm uppercase tracking-[0.3em] text-violet-500">
                since last feed
            </div>
        </div>
    );
}
