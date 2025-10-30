/**
 * Formats seconds into a timer display format (MM:SS or H:MM:SS).
 *
 * @param {number} seconds - Total seconds to format
 * @returns {string} Formatted time string (e.g., "05:23" or "1:05:23")
 */
export function formatTimerDisplay(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Formats a Date object into a localized time string (HH:MM AM/PM).
 *
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string (e.g., "03:45 PM")
 */
export function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
