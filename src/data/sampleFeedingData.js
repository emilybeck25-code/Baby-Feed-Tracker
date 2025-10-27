import { FeedingSide } from '../utils/constants.js';

/**
 * Generates realistic breastfeeding data for the past 7 days
 * This data simulates typical newborn feeding patterns:
 * - 8-12 feeds per day
 * - Mix of single-side and both-side feeds
 * - Duration: 10-30 minutes per feed
 * - More frequent at night
 */
export function generateSampleData() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const feedUnits = [];

    // Generate 7 days of data
    for (let day = 6; day >= 0; day--) {
        const dayStart = now - day * 24 * oneHour;

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
            const feedTime = dayStart + hour * oneHour + minuteOffset * 60 * 1000;

            // 70% chance of both-side feed, 30% single-side
            const bothSides = Math.random() < 0.7;

            // Random durations (10-20 minutes per side)
            const firstDuration = (600 + Math.floor(Math.random() * 600)) * 1000; // 10-20 min
            const secondDuration = bothSides ? (600 + Math.floor(Math.random() * 600)) * 1000 : 0;

            // Alternate starting side, with some randomness
            const startLeft = Math.random() < 0.5;

            const sessions = [];

            if (bothSides) {
                // First session
                sessions.push({
                    side: startLeft ? FeedingSide.Left : FeedingSide.Right,
                    duration: Math.floor(firstDuration / 1000),
                    endTime: feedTime,
                });

                // Second session (opposite side)
                sessions.push({
                    side: startLeft ? FeedingSide.Right : FeedingSide.Left,
                    duration: Math.floor(secondDuration / 1000),
                    endTime: feedTime + secondDuration,
                });
            } else {
                // Single session
                sessions.push({
                    side: startLeft ? FeedingSide.Left : FeedingSide.Right,
                    duration: Math.floor(firstDuration / 1000),
                    endTime: feedTime,
                });
            }

            // Create feed unit
            const unit = {
                id: `sample-${day}-${hour}-${Math.random().toString(36).substr(2, 9)}`,
                sessions,
                endTime: sessions[sessions.length - 1].endTime,
            };

            feedUnits.push(unit);
        });
    }

    // Sort newest first (as the app expects)
    return feedUnits.sort((a, b) => b.endTime - a.endTime);
}
