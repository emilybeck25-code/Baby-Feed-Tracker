export const PENDING_UNIT_PREFIX = 'pending-';

function createUnitId() {
    return `${Date.now()}-${Math.random()}`;
}

function isPendingUnit(unit) {
    return typeof unit?.id === 'string' && unit.id.startsWith(PENDING_UNIT_PREFIX);
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

        if (isPendingUnit(lastUnit)) {
            const [pendingSession] = lastUnit.sessions;
            if (pendingSession?.side === newSingleFeed.side) {
                // Replace pending unit with real feed data
                const updatedUnit = {
                    ...lastUnit,
                    id: createUnitId(),
                    sessions: [newSingleFeed],
                    endTime: newSingleFeed.endTime,
                };
                return [updatedUnit, ...history.slice(1)];
            }
        }

        if (lastUnit.sessions.length === 1 && lastUnit.sessions[0].side !== newSingleFeed.side) {
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
