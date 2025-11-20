import { useState } from 'react';
import { useFeedingContext } from '../contexts/FeedingContext';
import { useReminder } from '../hooks/useReminder';
import { downloadICS } from '../utils/ics';

export function NotificationsPage() {
    const { lastFeedTime } = useFeedingContext();
    const { reminderTime, timeRemainingMs, setReminderForDelay, clearReminder } = useReminder();

    const [permission, setPermission] = useState(
        typeof Notification !== 'undefined' ? Notification.permission : 'default'
    );
    const [hours, setHours] = useState(3);
    const [minutes, setMinutes] = useState(0);

    const requestPermission = async () => {
        if (typeof Notification === 'undefined') return;
        const result = await Notification.requestPermission();
        setPermission(result);
    };

    const setReminder = () => {
        if (typeof Notification !== 'undefined' && permission !== 'granted') return;
        const base = lastFeedTime || Date.now();
        setReminderForDelay(hours, minutes, base, 'Time for the next feed!');
    };

    const addToCalendar = () => {
        const base = lastFeedTime || Date.now();
        const target = base + (Number(hours) * 60 + Number(minutes)) * 60 * 1000;
        downloadICS({
            title: 'Time for the next feed!',
            startTimeMs: target,
            durationMinutes: 15,
            description:
                'Created by Baby Feed Tracker. Consider enabling system reminders for reliability.',
        });
    };

    const remainingMinutes = Math.max(0, Math.floor(timeRemainingMs / 60000));
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMinPart = remainingMinutes % 60;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Feed Reminders</h2>

            {permission !== 'granted' && (
                <div className="glass-soft border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6">
                    <p className="mb-2 font-semibold">Notifications are currently blocked.</p>
                    <p className="text-sm mb-3">
                        Reminders in-app only work while the app is open. For guaranteed alerts, also
                        add the reminder to your calendar below.
                    </p>
                    <button
                        onClick={requestPermission}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg"
                        aria-label="Enable browser notifications"
                    >
                        Enable Notifications
                    </button>
                </div>
            )}

            <div className="glass p-6 rounded-2xl">
                <div className="mb-4">
                    <label
                        className="block text-sm font-semibold text-slate-700 mb-2"
                        htmlFor="reminder-hours"
                    >
                        Remind me in:
                    </label>
                    <div className="flex gap-4 items-end">
                        <div>
                            <input
                                id="reminder-hours"
                                type="number"
                                min="0"
                                value={hours}
                                onChange={(e) => setHours(parseInt(e.target.value, 10) || 0)}
                                className="w-20 px-3 py-2 border border-white/60 rounded-lg text-center bg-white/60"
                                aria-label="Reminder hours"
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
                                className="w-20 px-3 py-2 border border-white/60 rounded-lg text-center bg-white/60"
                                aria-label="Reminder minutes"
                            />
                            <span className="ml-2 text-slate-600">minutes</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={setReminder}
                        disabled={permission !== 'granted'}
                        className="flex-1 px-4 py-3 bg-violet-500 text-white rounded-lg font-semibold disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-95 transition-transform"
                        aria-label="Set reminder"
                    >
                        Set Reminder
                    </button>
                    <button
                        onClick={addToCalendar}
                        className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold active:scale-95 transition-transform"
                        aria-label="Add reminder to calendar"
                    >
                        Add to Calendar (.ics)
                    </button>
                </div>

                {reminderTime && (
                    <div className="mt-4 p-4 glass-soft rounded-lg">
                        <p className="text-slate-800 mb-2">
                            Reminder set for{' '}
                            <strong>{new Date(reminderTime).toLocaleTimeString()}</strong>
                        </p>
                        <p className="text-slate-600">
                            Time remaining:{' '}
                            <strong>
                                {remainingHours > 0
                                    ? `${remainingHours} hr ${String(remainingMinPart).padStart(2, '0')} min`
                                    : `${remainingMinPart} min`}
                            </strong>
                        </p>
                        <div className="mt-3">
                            <button
                                onClick={clearReminder}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                                aria-label="Clear reminder"
                            >
                                Clear Reminder
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-4 text-xs text-slate-500">
                    Reminders only fire while the app is open due to browser limits. For guaranteed
                    alerts, also add the event to your device calendar.
                </div>
            </div>
        </div>
    );
}
