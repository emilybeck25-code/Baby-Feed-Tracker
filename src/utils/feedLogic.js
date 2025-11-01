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
    const newHistory = [...history];

    if (newHistory.length > 0) {
        const lastUnit = newHistory[0];

        if (isPendingUnit(lastUnit)) {
            const [pendingSession] = lastUnit.sessions;
            if (pendingSession?.side === newSingleFeed.side) {
                lastUnit.sessions = [newSingleFeed];
                lastUnit.endTime = newSingleFeed.endTime;
                lastUnit.id = createUnitId();
                return newHistory;
            }
        }

        if (lastUnit.sessions.length === 1 && lastUnit.sessions[0].side !== newSingleFeed.side) {
            // Add to existing unit
            lastUnit.sessions = [...lastUnit.sessions, newSingleFeed];
            lastUnit.endTime = newSingleFeed.endTime;
            return newHistory;
        }
    }

    // Create new unit
    const newUnit = {
        id: createUnitId(),
        sessions: [newSingleFeed],
        endTime: newSingleFeed.endTime,
    };
    return [newUnit, ...newHistory];
}
