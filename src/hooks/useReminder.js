// Shared reminder hook with persistence and scheduling
import { useEffect, useState } from 'react';

const KEY_TIME = 'reminderTime'; // number (ms)
const KEY_TITLE = 'reminderTitle'; // string
let activeTimeoutId = null; // shared across hook instances
const listeners = new Set(); // pub/sub for cross-component updates

function readTime() {
    try {
        const raw = localStorage.getItem(KEY_TIME);
        const n = raw ? Number(raw) : null;
        return Number.isFinite(n) ? n : null;
    } catch {
        return null;
    }
}

function readTitle() {
    try {
        return localStorage.getItem(KEY_TITLE) || 'Time for the next feed!';
    } catch {
        return 'Time for the next feed!';
    }
}

function writeReminder(reminderTime, title = 'Time for the next feed!') {
    try {
        if (reminderTime) {
            localStorage.setItem(KEY_TIME, String(reminderTime));
            localStorage.setItem(KEY_TITLE, String(title));
        } else {
            localStorage.removeItem(KEY_TIME);
            localStorage.removeItem(KEY_TITLE);
        }
    } catch {
        // ignore
    }
    notifySubscribers();
}

function notifySubscribers() {
    listeners.forEach((fn) => {
        try {
            fn();
        } catch {
            // ignore bad listener
        }
    });
}

function fireNotificationNow() {
    const title = readTitle();
    if (typeof window === 'undefined') return;
    try {
        if ('Notification' in window && Notification.permission === 'granted') {
            // Using a short body so it’s unobtrusive
            new Notification(title);
        } else {
            // Fallback to alert if notifications are blocked
            alert(title);
        }
    } catch {
        // ignore
    }
}

function clearScheduledTimeout() {
    if (activeTimeoutId) {
        clearTimeout(activeTimeoutId);
        activeTimeoutId = null;
    }
}

function scheduleIfFuture() {
    clearScheduledTimeout();
    const t = readTime();
    if (!t) return;
    const delay = t - Date.now();
    if (delay <= 0) {
        // Fire immediately and clear persisted reminder
        fireNotificationNow();
        writeReminder(null);
        return;
    }
    activeTimeoutId = setTimeout(() => {
        fireNotificationNow();
        writeReminder(null);
        clearScheduledTimeout();
    }, delay);
}

function onStorage(e) {
    if (e?.key !== null && e.key !== KEY_TIME && e.key !== KEY_TITLE) return;
    scheduleIfFuture();
    notifySubscribers();
}

export function useReminder() {
    const [now, setNow] = useState(null);
    const reminderTime = readTime();
    const timeRemainingMs = reminderTime && now ? Math.max(0, reminderTime - now) : 0;

    useEffect(() => {
        // tick once per second for countdowns
        const syncNow = () => setNow(Date.now());
        syncNow();
        const id = setInterval(syncNow, 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        // initial schedule + storage listeners
        scheduleIfFuture();
        window.addEventListener('storage', onStorage);
        const listener = () => setNow(Date.now());
        listeners.add(listener);
        return () => {
            window.removeEventListener('storage', onStorage);
            listeners.delete(listener);
        };
    }, []);

    const setReminderAt = (timestampMs, title = 'Time for the next feed!') => {
        writeReminder(timestampMs, title);
        scheduleIfFuture();
        setNow(Date.now());
    };

    const setReminderForDelay = (hours, minutes, baseTimeMs = Date.now(), title) => {
        const delayMs = (Number(hours) * 60 + Number(minutes)) * 60 * 1000;
        setReminderAt(baseTimeMs + delayMs, title);
    };

    const clearReminder = () => {
        writeReminder(null);
        clearScheduledTimeout();
        setNow(Date.now());
    };

    return {
        reminderTime,
        timeRemainingMs,
        setReminderAt,
        setReminderForDelay,
        clearReminder,
    };
}
