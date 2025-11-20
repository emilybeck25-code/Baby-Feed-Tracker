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
 * Download a single (or repeating) VEVENT ICS with an alarm.
 * @param {object} params
 * @param {string} params.title
 * @param {number} params.startTimeMs
 * @param {number} [params.durationMinutes=15]
 * @param {string} [params.description]
 * @param {string} [params.filename='feed-reminder.ics']
 * @param {number} [params.alarmMinutesBefore=0]  // 0 = fire at start time
 * @param {string} [params.rrule]                 // e.g. 'FREQ=HOURLY;INTERVAL=3;COUNT=8'
 */
export function downloadICS({
    title,
    startTimeMs,
    durationMinutes = 15,
    description = 'Baby Feed Tracker reminder',
    filename = 'feed-reminder.ics',
    alarmMinutesBefore = 0,
    rrule,
}) {
    const dtStart = toICSDate(startTimeMs);
    const dtEnd = toICSDate(startTimeMs + durationMinutes * 60 * 1000);

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Baby Feed Tracker//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@babyfeedtracker`,
        `DTSTAMP:${toICSDate(Date.now())}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${escapeICS(title)}`,
        `DESCRIPTION:${escapeICS(description)}`,
    ];

    if (rrule) lines.push(`RRULE:${rrule}`);

    const trigger = Math.max(0, Number(alarmMinutesBefore) || 0);
    lines.push(
        'BEGIN:VALARM',
        `TRIGGER:-PT${trigger}M`,
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeICS(title)}`,
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
        ''
    );

    const ics = lines.join('\r\n');
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

// Open a prefilled Google Calendar event (UTC times)
export function openGoogleCalendar({ title, startTimeMs, durationMinutes = 15, details = '' }) {
    const toGoogleDate = (ms) => {
        const d = new Date(ms);
        const yyyy = d.getUTCFullYear();
        const mm = pad(d.getUTCMonth() + 1);
        const dd = pad(d.getUTCDate());
        const HH = pad(d.getUTCHours());
        const MM = pad(d.getUTCMinutes());
        const SS = pad(d.getUTCSeconds());
        return `${yyyy}${mm}${dd}T${HH}${MM}${SS}Z`;
        // Example: 20250115T030000Z
    };

    const start = toGoogleDate(startTimeMs);
    const end = toGoogleDate(startTimeMs + durationMinutes * 60 * 1000);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        title
    )}&dates=${start}/${end}&details=${encodeURIComponent(details)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}
