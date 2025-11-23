export function unitMatchesSession(unit, session) {
    if (!unit || !session) return false;
    const sessions = Array.isArray(unit.sessions) ? unit.sessions : [];
    return sessions.some(
        (entry) => entry?.side === session.side && entry?.endTime === session.endTime
    );
}

export function headMatchesPendingSession(history, session) {
    if (!session || !Array.isArray(history) || history.length === 0) return false;
    const [latest] = history;
    const isBottle =
        typeof latest.type === 'string' && latest.type.toLowerCase() === 'bottle';
    if (isBottle) return false;
    const sessions = Array.isArray(latest.sessions) ? latest.sessions : [];
    if (sessions.length !== 1) return false;
    const [first] = sessions;
    return first?.side === session.side && first?.endTime === session.endTime;
}
