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
                <div key={day} className="bg-white p-4 rounded-lg shadow-lg">
                    <h3 className="font-bold text-slate-800 mb-3">{day}</h3>
                    <div className="space-y-3">
                        {units.map((unit) => {
                            const startTime = new Date(
                                unit.sessions[0].endTime - unit.sessions[0].duration * 1000
                            );
                            const endTime = new Date(unit.endTime);

                            return (
                                <div key={unit.id} className="relative overflow-hidden rounded-md">
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(unit.id)}
                                        className="absolute inset-y-0 right-0 w-24 bg-red-500 text-white font-semibold flex items-center justify-center"
                                        aria-label="Delete feeding entry"
                                    >
                                        Delete
                                    </button>
                                    <div
                                        className={`border-l-4 border-violet-400 pl-3 pr-6 bg-white transition-transform duration-200 ease-out ${
                                            openItemId === unit.id
                                                ? '-translate-x-24'
                                                : 'translate-x-0'
                                        }`}
                                        onTouchStart={(event) => handleTouchStart(event, unit.id)}
                                        onTouchEnd={(event) => handleTouchEnd(event, unit.id)}
                                        onMouseDown={(event) => handleMouseDown(event, unit.id)}
                                        onMouseUp={(event) => handleMouseUp(event, unit.id)}
                                    >
                                        <div className="text-sm text-slate-600">
                                            {formatTime(startTime)} - {formatTime(endTime)}
                                        </div>
                                        <div className="flex gap-2 mt-2 pb-3">
                                            {unit.sessions.map((session, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${session.side === FeedingSide.Left ? 'bg-violet-100 text-violet-700' : 'bg-rose-100 text-rose-700'}`}
                                                >
                                                    <span className="font-bold">
                                                        {session.side[0]}
                                                    </span>
                                                    <span className="text-sm">
                                                        <TimerDisplay seconds={session.duration} />
                                                    </span>
                                                </div>
                                            ))}
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
