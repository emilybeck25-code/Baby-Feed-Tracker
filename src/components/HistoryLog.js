import { FeedingSide } from '../utils/constants.js';
import { formatTime } from '../utils/timeFormatting.js';
import { TimerDisplay } from './TimerDisplay.js';

export function HistoryLog({ chronologicalHistory }) {
    if (chronologicalHistory.length === 0) {
        return (
            <div className="text-slate-500 text-center py-8">
                No feedings logged yet.
            </div>
        );
    }

    const groupedByDay = {};
    chronologicalHistory.forEach(unit => {
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
            dayLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
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
                        {units.map((unit, idx) => {
                            const startTime = new Date(unit.sessions[0].endTime - unit.sessions[0].duration * 1000);
                            const endTime = new Date(unit.endTime);
                            const isPending = unit.sessions.length === 1;

                            let timeSinceLastFeed = '';
                            if (idx > 0) {
                                const prevUnit = units[idx - 1];
                                const prevEndTime = new Date(prevUnit.endTime);
                                const diffMs = startTime - prevEndTime;
                                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                timeSinceLastFeed = `(${diffHours}h ${diffMins}m)`;
                            }

                            return (
                                <div key={unit.id} className="border-l-4 border-violet-400 pl-3">
                                    <div className="text-sm text-slate-600">
                                        {formatTime(startTime)}
                                        {!isPending && <> - {formatTime(endTime)}</>}
                                        {isPending && <span className="ml-2 text-rose-500">- Pending...</span>}
                                        {timeSinceLastFeed && <span className="ml-2 text-slate-400">{timeSinceLastFeed}</span>}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {unit.sessions.map((session, i) => (
                                            <div key={i} className={`flex items-center gap-2 px-3 py-1 rounded-full ${session.side === FeedingSide.Left ? 'bg-violet-100 text-violet-700' : 'bg-rose-100 text-rose-700'}`}>
                                                <span className="font-bold">{session.side[0]}</span>
                                                <span className="text-sm"><TimerDisplay seconds={session.duration} /></span>
                                            </div>
                                        ))}
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
