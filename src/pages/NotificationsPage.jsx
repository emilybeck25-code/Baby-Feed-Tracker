import { useState } from 'react';
import { useFeedingContext } from '../contexts/FeedingContext';

export function NotificationsPage() {
    const { lastFeedTime } = useFeedingContext();
    const [permission, setPermission] = useState(Notification.permission);
    const [hours, setHours] = useState(3);
    const [minutes, setMinutes] = useState(0);
    const [reminderTimeoutId, setReminderTimeoutId] = useState(null);
    const [reminderTime, setReminderTime] = useState(null);

    const requestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
    };

    const setReminder = () => {
        if (!lastFeedTime || permission !== 'granted') return;

        const reminderMs = (hours * 60 + minutes) * 60 * 1000;
        const targetTime = lastFeedTime + reminderMs;
        const delay = targetTime - Date.now();

        if (delay > 0) {
            const timeoutId = setTimeout(() => {
                new Notification('Time for the next feed!');
                setReminderTimeoutId(null);
                setReminderTime(null);
            }, delay);

            setReminderTimeoutId(timeoutId);
            setReminderTime(targetTime);
        }
    };

    const clearReminder = () => {
        if (reminderTimeoutId) {
            clearTimeout(reminderTimeoutId);
            setReminderTimeoutId(null);
            setReminderTime(null);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Feed Reminders</h2>

            {permission !== 'granted' && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-6">
                    <p className="mb-2">Notification permission is required to set reminders.</p>
                    <button
                        onClick={requestPermission}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
                    >
                        Enable Notifications
                    </button>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Remind me in:
                    </label>
                    <div className="flex gap-4">
                        <div>
                            <input
                                type="number"
                                min="0"
                                value={hours}
                                onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                                className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center"
                            />
                            <span className="ml-2 text-slate-600">hours</span>
                        </div>
                        <div>
                            <input
                                type="number"
                                min="0"
                                max="59"
                                value={minutes}
                                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                                className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center"
                            />
                            <span className="ml-2 text-slate-600">minutes</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={setReminder}
                    disabled={permission !== 'granted' || !lastFeedTime}
                    className="w-full px-4 py-3 bg-violet-500 text-white rounded-lg font-semibold disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                    Set Reminder
                </button>

                {reminderTime && (
                    <div className="mt-4 p-4 bg-green-100 rounded-lg">
                        <p className="text-green-800 mb-2">
                            Reminder set for {new Date(reminderTime).toLocaleTimeString()}
                        </p>
                        <button
                            onClick={clearReminder}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg"
                        >
                            Clear Reminder
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
