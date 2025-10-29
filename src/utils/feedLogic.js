export function addFeedLogic(history, newSingleFeed) {
    const newHistory = [...history];

    if (newHistory.length > 0) {
        const lastUnit = newHistory[0];

        if (
            lastUnit.sessions.length === 1 &&
            lastUnit.sessions[0].side !== newSingleFeed.side
        ) {
            // Add to existing unit
            lastUnit.sessions.push(newSingleFeed);
            lastUnit.endTime = newSingleFeed.endTime;
            return newHistory;
        }
    }

    // Create new unit
    const newUnit = {
        id: `${Date.now()}-${Math.random()}`,
        sessions: [newSingleFeed],
        endTime: newSingleFeed.endTime,
    };
    return [newUnit, ...newHistory];
}
