import { FeedingSide } from '../utils/constants.js';

/**
 * Generates realistic breastfeeding data for the past 3 months
 * This data simulates typical newborn feeding patterns:
 * - 8-12 feeds per day
 * - Mix of single-side and both-side feeds
 * - Duration: 10-30 minutes per feed
 * - All feeds have BOTH L and R sessions (even if one is 0 duration)
 */
export function generateSampleData() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const feedUnits = [];

    // Anchor generation to local midnight for realistic day boundaries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Generate 3 months (90 days) of data
    for (let day = 89; day >= 0; day--) {
        // Midnight anchor for the current day iteration
        const dayStartDate = new Date(startOfToday);
        dayStartDate.setDate(dayStartDate.getDate() - day);
        const dayStart = dayStartDate.getTime();

        // 8-12 feeds per day (randomized)
        const feedsPerDay = 8 + Math.floor(Math.random() * 5);

        // Distribute feeds throughout the day with realistic timing
        const feedTimes = [
            1,
            3,
            5,
            7,
            9,
            11,
            13,
            15,
            17,
            19,
            21,
            23, // Typical 2-hour intervals
        ];

        // Shuffle and take the number we need
        const selectedTimes = feedTimes
            .sort(() => Math.random() - 0.5)
            .slice(0, feedsPerDay)
            .sort((a, b) => a - b);

        selectedTimes.forEach((hour) => {
            // Add some randomness to the exact time (±30 minutes)
            const minuteOffset = Math.floor(Math.random() * 60) - 30;
            const firstEnd = dayStart + hour * oneHour + minuteOffset * 60 * 1000;

            // 70% chance of both-side feed, 30% single-side
            const bothSides = Math.random() < 0.7;

            // Random durations (10-20 minutes per side)
            const firstDuration = (600 + Math.floor(Math.random() * 600)) * 1000; // 10-20 min
            const secondDuration = bothSides ? (600 + Math.floor(Math.random() * 600)) * 1000 : 0;

            // Alternate starting side, with some randomness
            const startLeft = Math.random() < 0.5;

            // ALWAYS create 2 sessions (both L and R)
            // For single-side feeds, opposite side has 0 duration
            const sessions = [
                {
                    side: startLeft ? FeedingSide.Left : FeedingSide.Right,
                    duration: Math.floor(firstDuration / 1000),
                    endTime: firstEnd,
                },
                {
                    side: startLeft ? FeedingSide.Right : FeedingSide.Left,
                    duration: Math.floor(secondDuration / 1000),
                    endTime: bothSides ? firstEnd + secondDuration : firstEnd,
                },
            ];

            // Keep sessions chronological within the unit
            sessions.sort((a, b) => (a.endTime === b.endTime ? 0 : a.endTime - b.endTime));

            // Create feed unit
            const unit = {
                id: `sample-${day}-${hour}-${Math.random().toString(36).substr(2, 9)}`,
                sessions,
                endTime: sessions[sessions.length - 1].endTime,
            };

            // Exclude future sessions for the current day
            if (day === 0 && unit.endTime > now) {
                return;
            }

            feedUnits.push(unit);
        });
    }

    // Sort newest first (as the app expects)
    feedUnits.sort((a, b) => b.endTime - a.endTime);
    return feedUnits;
}
