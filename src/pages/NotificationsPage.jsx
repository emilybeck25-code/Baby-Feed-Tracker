import { useState } from 'react';
import { useFeedingContext } from '../contexts/FeedingContext';
import { downloadICS, openGoogleCalendar } from '../utils/ics';

export function NotificationsPage() {
    const { lastFeedTime } = useFeedingContext();

    // Initial delay before the first reminder
    const [hours, setHours] = useState(3);
    const [minutes, setMinutes] = useState(0);

    // Optional repeat rule
    const [repeatEnabled, setRepeatEnabled] = useState(false);
    const [repeatIntervalHours, setRepeatIntervalHours] = useState(3);
    const [repeatCount, setRepeatCount] = useState(8);

    const [fallbackBaseMs] = useState(() => Date.now());
    const base = lastFeedTime || fallbackBaseMs;
    const target = base + (Number(hours) * 60 + Number(minutes)) * 60 * 1000;

    const handleIcs = () => {
        const params = {
            title: 'Time for the next feed!',
            startTimeMs: target,
            durationMinutes: 15,
            alarmMinutesBefore: 0,
            description: 'Created by Baby Feed Tracker',
            filename: 'feed-reminder.ics',
        };

        if (repeatEnabled && repeatIntervalHours > 0 && repeatCount > 0) {
            const interval = Math.max(1, Number(repeatIntervalHours) || 0);
            const count = Math.max(1, Number(repeatCount) || 0);
            params.rrule = `FREQ=HOURLY;INTERVAL=${interval};COUNT=${count}`;
            params.filename = `feed-reminder-${interval}h-x${count}.ics`;
        }

        downloadICS(params);
    };

    const handleGCal = () => {
        openGoogleCalendar({
            title: 'Time for the next feed!',
            startTimeMs: target,
            durationMinutes: 15,
            details: 'Created by Baby Feed Tracker',
        });
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Feed Reminders</h2>

            <div className="glass p-6 rounded-2xl space-y-5">
                <p className="text-sm text-slate-600">
                    Create reliable reminders by adding events to your device calendar. Calendar
                    alerts fire even if the app is closed.
                </p>

                <div>
                    <label
                        className="block text-sm font-semibold text-slate-700 mb-2"
                        htmlFor="reminder-hours"
                    >
                        Remind me in:
                    </label>
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <input
                                id="reminder-hours"
                                type="number"
                                min="0"
                                value={hours}
                                onChange={(e) => setHours(parseInt(e.target.value, 10) || 0)}
                                className="w-24 px-3 py-2 border border-white/60 rounded-lg text-center bg-white/60"
                                aria-label="Hours"
                            />
                            <span className="ml-2 text-slate-600">hours</span>
                        </div>
                        <div>
                            <input
                                id="reminder-minutes"
                                type="number"
                                min="0"
                                max="59"
                                value={minutes}
                                onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 0)}
                                className="w-24 px-3 py-2 border border-white/60 rounded-lg text-center bg-white/60"
                                aria-label="Minutes"
                            />
                            <span className="ml-2 text-slate-600">minutes</span>
                        </div>
                    </div>
                </div>

                <div className="glass-soft rounded-xl p-4 space-y-3">
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={repeatEnabled}
                            onChange={(e) => setRepeatEnabled(e.target.checked)}
                        />
                        <span className="text-sm font-semibold text-slate-700">
                            Repeat (optional)
                        </span>
                    </label>

                    {repeatEnabled && (
                        <div className="flex flex-wrap items-end gap-4">
                            <div>
                                <input
                                    type="number"
                                    min="1"
                                    value={repeatIntervalHours}
                                    onChange={(e) =>
                                        setRepeatIntervalHours(parseInt(e.target.value, 10) || 1)
                                    }
                                    className="w-24 px-3 py-2 border border-white/60 rounded-lg text-center bg-white/60"
                                    aria-label="Repeat interval hours"
                                />
                                <span className="ml-2 text-slate-600">hours</span>
                            </div>
                            <div>
                                <input
                                    type="number"
                                    min="1"
                                    value={repeatCount}
                                    onChange={(e) =>
                                        setRepeatCount(parseInt(e.target.value, 10) || 1)
                                    }
                                    className="w-24 px-3 py-2 border border-white/60 rounded-lg text-center bg-white/60"
                                    aria-label="Repeat count"
                                />
                                <span className="ml-2 text-slate-600">occurrences</span>
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-slate-500">
                        Tip: “Every 3 hours, 8 occurrences” covers a 24-hour period.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleIcs}
                        className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold active:scale-95 transition-transform"
                        aria-label="Add reminder to calendar via ICS"
                    >
                        Add to Calendar (.ics)
                    </button>

                    <button
                        onClick={handleGCal}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold active:scale-95 transition-transform"
                        aria-label="Add reminder to Google Calendar"
                    >
                        Add to Google Calendar
                    </button>
                </div>

                <p className="text-xs text-slate-500">
                    Calendar events work offline and will alert you even if this app is closed.
                </p>
            </div>
        </div>
    );
}
