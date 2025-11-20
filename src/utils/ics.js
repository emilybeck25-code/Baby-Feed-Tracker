// Utility to generate and download a single-event ICS file
function pad(n) {
    return String(n).padStart(2, '0');
}

function toICSDate(ms) {
    const d = new Date(ms);
    return (
        d.getUTCFullYear() +
        pad(d.getUTCMonth() + 1) +
        pad(d.getUTCDate()) +
        'T' +
        pad(d.getUTCHours()) +
        pad(d.getUTCMinutes()) +
        pad(d.getUTCSeconds()) +
        'Z'
    );
}

function escapeICS(s = '') {
    return String(s).replace(/\\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

/**
 * Download a single VEVENT ICS file.
 * @param {object} params
 * @param {string} params.title
 * @param {number} params.startTimeMs
 * @param {number} [params.durationMinutes=15]
 * @param {string} [params.description]
 * @param {string} [params.filename='feed-reminder.ics']
 */
export function downloadICS({
    title,
    startTimeMs,
    durationMinutes = 15,
    description = 'Baby Feed Tracker reminder',
    filename = 'feed-reminder.ics',
}) {
    const dtStart = toICSDate(startTimeMs);
    const dtEnd = toICSDate(startTimeMs + durationMinutes * 60 * 1000);
    const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Baby Feed Tracker//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${Date.now()}@babyfeedtracker.local`,
        `DTSTAMP:${toICSDate(Date.now())}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${escapeICS(title)}`,
        `DESCRIPTION:${escapeICS(description)}`,
        'END:VEVENT',
        'END:VCALENDAR',
        '',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
