function createUnitId() {
    return `${Date.now()}-${Math.random()}`;
}

/**
 * Adds a new feed session to the history, automatically pairing with the last unit if applicable.
 * Pairs opposite-side feeds into a single unit if the last unit has only one session.
 *
 * @param {Array} history - Array of feed units (newest first)
 * @param {Object} newSingleFeed - New feed session to add
 * @param {string} newSingleFeed.side - 'Left' or 'Right'
 * @param {number} newSingleFeed.duration - Duration in seconds
 * @param {number} newSingleFeed.endTime - Timestamp in milliseconds
 * @returns {Array} Updated history array
 */
export function addFeedLogic(history, newSingleFeed) {
    if (history.length > 0) {
        const lastUnit = history[0];

        const isBreastFeedUnit =
            typeof lastUnit.type !== 'string' || lastUnit.type.toLowerCase() !== 'bottle';
        const hasSingleSession = Array.isArray(lastUnit.sessions) && lastUnit.sessions.length === 1;
        const lastSide = hasSingleSession ? lastUnit.sessions[0]?.side : null;
        const isOppositeSide = lastSide && newSingleFeed.side && lastSide !== newSingleFeed.side;

        if (isBreastFeedUnit && hasSingleSession && isOppositeSide) {
            // Add to existing unit (pair opposite sides)
            const updatedUnit = {
                ...lastUnit,
                sessions: [...lastUnit.sessions, newSingleFeed],
                endTime: newSingleFeed.endTime,
            };
            return [updatedUnit, ...history.slice(1)];
        }
    }

    // Create new unit
    const newUnit = {
        id: createUnitId(),
        sessions: [newSingleFeed],
        endTime: newSingleFeed.endTime,
    };
    return [newUnit, ...history];
}
