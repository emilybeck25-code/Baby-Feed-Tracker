import { describe, test, expect } from 'vitest';
import { FeedingSide } from '../constants.js';
import { calculateDailyStats } from '../statistics.js';

describe('Daily Statistics Calculation', () => {
    test('should calculate stats for feeds on target day', () => {
        const baseTime = new Date('2025-01-15T10:00:00').getTime();

        const history = [
            {
                id: '1',
                sessions: [
                    { side: FeedingSide.Left, duration: 300, endTime: baseTime },
                    {
                        side: FeedingSide.Right,
                        duration: 240,
                        endTime: baseTime + 5 * 60 * 1000,
                    },
                ],
                endTime: baseTime + 5 * 60 * 1000,
            },
            {
                id: '2',
                sessions: [
                    {
                        side: FeedingSide.Left,
                        duration: 360,
                        endTime: baseTime + 3 * 60 * 60 * 1000,
                    },
                ],
                endTime: baseTime + 3 * 60 * 60 * 1000,
            },
        ];

        const stats = calculateDailyStats(history, '2025-01-15T10:00:00');

        expect(stats.totalFeeds).toBe(2);
        expect(stats.totalTime).toBe(900); // 300 + 240 + 360
        expect(stats.leftTime).toBe(660); // 300 + 360
        expect(stats.rightTime).toBe(240);
    });

    test('should return zeros for day with no feeds', () => {
        const history = [];
        const stats = calculateDailyStats(history, '2025-01-15T10:00:00');

        expect(stats.totalFeeds).toBe(0);
        expect(stats.totalTime).toBe(0);
        expect(stats.leftTime).toBe(0);
        expect(stats.rightTime).toBe(0);
    });

    test('should only count feeds from target day', () => {
        const day1 = new Date('2025-01-15T10:00:00').getTime();
        const day2 = new Date('2025-01-16T10:00:00').getTime();

        const history = [
            {
                id: '1',
                sessions: [{ side: FeedingSide.Left, duration: 300, endTime: day1 }],
                endTime: day1,
            },
            {
                id: '2',
                sessions: [{ side: FeedingSide.Right, duration: 240, endTime: day2 }],
                endTime: day2,
            },
        ];

        const stats = calculateDailyStats(history, '2025-01-15T10:00:00');

        expect(stats.totalFeeds).toBe(1);
        expect(stats.totalTime).toBe(300);
    });
});
