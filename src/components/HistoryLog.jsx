import { useState, useRef, useEffect } from 'react';
import { FeedingSide } from '../utils/constants';
import { formatTime } from '../utils/timeFormatting';
import { TimerDisplay } from './TimerDisplay';

export function HistoryLog({ chronologicalHistory, onDelete }) {
    const [openItemId, setOpenItemId] = useState(null);
    const touchStartXRef = useRef(0);
    const pointerItemRef = useRef(null);

    useEffect(() => {
        if (openItemId === null) return;
        const stillExists = chronologicalHistory.some((unit) => unit.id === openItemId);
        if (!stillExists) {
            setOpenItemId(null);
        }
    }, [chronologicalHistory, openItemId]);

    const handleTouchStart = (event, unitId) => {
        if (event.touches.length !== 1) return;
        touchStartXRef.current = event.touches[0].clientX;
        pointerItemRef.current = unitId;
    };

    const handleTouchEnd = (event, unitId) => {
        if (pointerItemRef.current !== unitId) return;
        const endX = event.changedTouches[0].clientX;
        const deltaX = endX - touchStartXRef.current;
        if (deltaX < -50) {
            setOpenItemId(unitId);
        } else if (deltaX > 50 && openItemId === unitId) {
            setOpenItemId(null);
        } else if (Math.abs(deltaX) < 10 && openItemId === unitId) {
            setOpenItemId(null);
        }
        pointerItemRef.current = null;
    };

    const mouseStartXRef = useRef(0);

    const handleMouseDown = (event, unitId) => {
        mouseStartXRef.current = event.clientX;
        pointerItemRef.current = unitId;
    };

    const handleMouseUp = (event, unitId) => {
        if (pointerItemRef.current !== unitId) return;
        const deltaX = event.clientX - mouseStartXRef.current;
        if (deltaX < -40) {
            setOpenItemId(unitId);
        } else if (deltaX > 40 && openItemId === unitId) {
            setOpenItemId(null);
        } else if (Math.abs(deltaX) < 6 && openItemId === unitId) {
            setOpenItemId(null);
        }
        pointerItemRef.current = null;
    };

    const handleDelete = (unitId) => {
        setOpenItemId(null);
        if (typeof onDelete === 'function') {
            onDelete(unitId);
        }
    };

    if (chronologicalHistory.length === 0) {
        return <div className="text-slate-500 text-center py-8">No feedings logged yet.</div>;
    }

    const groupedByDay = {};
    chronologicalHistory.forEach((unit) => {
        const date = new Date(unit.endTime);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dayLabel;
        if (date.toDateString() === today.toDateString()) {
            dayLabel = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            dayLabel = 'Yesterday';
        } else {
            dayLabel = date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
            });
        }

        if (!groupedByDay[dayLabel]) {
            groupedByDay[dayLabel] = [];
        }
        groupedByDay[dayLabel].push(unit);
    });

    return (
        <div className="space-y-4">
            {Object.entries(groupedByDay).map(([day, units]) => (
                <div key={day} className="glass p-4 rounded-2xl">
                    <h3 className="font-bold text-slate-800 mb-3">{day}</h3>
                    <div className="space-y-3">
                        {units.map((unit) => {
                            const sessions = Array.isArray(unit.sessions) ? unit.sessions : [];
                            const hasSessions = sessions.length > 0;
                            const defaultEnd = new Date(unit.endTime);
                            const firstSession = hasSessions ? sessions[0] : null;
                            const startTime = hasSessions
                                ? new Date(
                                      (firstSession?.endTime ?? unit.endTime) -
                                          (firstSession?.duration ?? 0) * 1000
                                  )
                                : defaultEnd;
                            const endTime = defaultEnd;
                            const isActive = unit.isActive === true;
                            const isBottle =
                                typeof unit.type === 'string' &&
                                unit.type.toLowerCase() === 'bottle';
                            // Prefer ounces; convert legacy mL if needed
                            const ozField = Number(unit.volumeOz);
                            const mlLegacy = Number(unit.volumeMl ?? 0);
                            const volOz = Number.isFinite(ozField)
                                ? ozField
                                : Number.isFinite(mlLegacy)
                                  ? mlLegacy / 29.5735
                                  : 0;
                            const volumeDisplay = Math.round(volOz * 10) / 10;
                            const canDelete = !isActive;
                            const translationClass =
                                canDelete && openItemId === unit.id ? '-translate-x-28' : 'translate-x-0';
                            const swipeHandlers = canDelete
                                ? {
                                      onTouchStart: (event) => handleTouchStart(event, unit.id),
                                      onTouchEnd: (event) => handleTouchEnd(event, unit.id),
                                      onMouseDown: (event) => handleMouseDown(event, unit.id),
                                      onMouseUp: (event) => handleMouseUp(event, unit.id),
                                  }
                                : {};

                            return (
                                <div key={unit.id} className="relative rounded-xl overflow-hidden">
                                    {canDelete && (
                                        <div
                                            className={`absolute inset-0 flex items-stretch justify-end rounded-inherit transition-opacity duration-150 ${
                                                openItemId === unit.id
                                                    ? 'opacity-100'
                                                    : 'opacity-0 pointer-events-none'
                                            }`}
                                            aria-hidden={openItemId !== unit.id}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(unit.id)}
                                                className="w-28 danger-glass text-white font-semibold flex items-center justify-center"
                                                aria-label="Delete feeding entry"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}

                                    <div
                                        className={`border-l-4 ${
                                            isActive ? 'border-emerald-400' : 'border-violet-300'
                                        } pl-3 pr-6 glass-soft transition-transform duration-200 ease-out ${
                                            canDelete ? translationClass : 'translate-x-0'
                                        } ${isActive ? 'ring-1 ring-emerald-200 bg-emerald-50/70' : ''}`}
                                        {...swipeHandlers}
                                    >
                                        <div className="text-sm text-slate-600">
                                            {formatTime(startTime)} - {formatTime(endTime)}
                                        </div>
                                        {isActive && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-emerald-100/90 text-emerald-700 text-sm font-semibold">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                Live feed in progress
                                            </div>
                                        )}
                                        <div className="flex gap-2 mt-2 pb-3">
                                            {isBottle ? (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-700 font-semibold text-sm">
                                                    <span>🍼 Bottle</span>
                                                    <span>•</span>
                                                    <span>{volumeDisplay} oz</span>
                                                </div>
                                            ) : (
                                                sessions.map((session, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                                                            session.side === FeedingSide.Left
                                                                ? 'bg-violet-100/80 text-violet-700'
                                                                : 'bg-rose-100/80 text-rose-700'
                                                        }`}
                                                    >
                                                        <span className="font-bold">
                                                            {session.side?.[0] ?? '?'}
                                                        </span>
                                                        <span className="text-sm">
                                                            <TimerDisplay
                                                                seconds={session.duration || 0}
                                                            />
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
