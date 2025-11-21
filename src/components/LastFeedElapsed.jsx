import { useState, useEffect } from 'react';

export function formatElapsedLabel(lastFeedTime) {
    if (!lastFeedTime) return null;

    const totalMinutes = Math.max(0, Math.floor((Date.now() - lastFeedTime) / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        const hourLabel = hours === 1 ? 'hr' : 'hrs';
        const minuteLabel = minutes === 1 ? 'min' : 'mins';
        const minuteValue = String(minutes).padStart(2, '0');
        return `${hours} ${hourLabel} ${minuteValue} ${minuteLabel}`;
    }

    const minuteLabel = totalMinutes === 1 ? 'min' : 'mins';
    return `${totalMinutes} ${minuteLabel}`;
}

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

    const formatted = formatElapsedLabel(lastFeedTime);
    if (!formatted) return null;

    return (
        <div className="glass rounded-2xl px-6 py-4 flex flex-col items-center gap-2">
            <div className="text-4xl sm:text-5xl font-semibold text-slate-900 tracking-tight">
                {formatted}
            </div>
            <div className="text-xs uppercase tracking-[0.35em] text-fuchsia-400">
                since last feed
            </div>
        </div>
    );
}
