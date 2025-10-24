#!/usr/bin/env node

import { FeedingSide } from './src/utils/constants.js';
import { addFeedLogic } from './src/utils/feedLogic.js';
import { formatTimerDisplay } from './src/utils/timeFormatting.js';
import { calculateDailyStats } from './src/utils/statistics.js';

// Test Framework
const results = {
    total: 0,
    passed: 0,
    failed: 0,
    suites: []
};

let currentSuite = null;

function describe(name, fn) {
    currentSuite = { name, tests: [] };
    results.suites.push(currentSuite);
    fn();
    currentSuite = null;
}

function test(name, fn) {
    results.total++;
    try {
        fn();
        results.passed++;
        currentSuite.tests.push({ name, passed: true });
    } catch (error) {
        results.failed++;
        currentSuite.tests.push({ name, passed: false, error: error.message });
    }
}

function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        },
        toEqual(expected) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            }
        },
        toBeTruthy() {
            if (!actual) {
                throw new Error(`Expected truthy value, got ${actual}`);
            }
        },
        toBeFalsy() {
            if (actual) {
                throw new Error(`Expected falsy value, got ${actual}`);
            }
        },
        toBeGreaterThan(expected) {
            if (actual <= expected) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        },
        toBeLessThan(expected) {
            if (actual >= expected) {
                throw new Error(`Expected ${actual} to be less than ${expected}`);
            }
        }
    };
}

// TESTS
describe('Feed Grouping Logic', () => {
    test('should group opposite sides within 10 minutes', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = { side: FeedingSide.Right, duration: 240, endTime: baseTime + 5 * 60 * 1000 };
        const history2 = addFeedLogic(history1, feed2);

        expect(history2.length).toBe(1);
        expect(history2[0].sessions.length).toBe(2);
    });

    test('should NOT group opposite sides after 10 minutes', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = { side: FeedingSide.Right, duration: 240, endTime: baseTime + 11 * 60 * 1000 };
        const history2 = addFeedLogic(history1, feed2);

        expect(history2.length).toBe(2);
    });

    test('should NOT group same side feeds', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = { side: FeedingSide.Left, duration: 240, endTime: baseTime + 5 * 60 * 1000 };
        const history2 = addFeedLogic(history1, feed2);

        expect(history2.length).toBe(2);
    });

    test('should NOT group when previous unit already has 2 sessions', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = { side: FeedingSide.Right, duration: 240, endTime: baseTime + 5 * 60 * 1000 };
        const history2 = addFeedLogic(history1, feed2);

        const feed3 = { side: FeedingSide.Left, duration: 180, endTime: baseTime + 8 * 60 * 1000 };
        const history3 = addFeedLogic(history2, feed3);

        expect(history3.length).toBe(2);
        expect(history3[0].sessions.length).toBe(1);
    });

    test('should handle boundary: exactly 10 minutes', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = { side: FeedingSide.Right, duration: 240, endTime: baseTime + 10 * 60 * 1000 };
        const history2 = addFeedLogic(history1, feed2);

        expect(history2.length).toBe(2);
    });
});

describe('Timer Display Formatting', () => {
    test('should format seconds correctly (< 1 minute)', () => {
        expect(formatTimerDisplay(45)).toBe('00:45');
    });

    test('should format minutes and seconds correctly', () => {
        expect(formatTimerDisplay(125)).toBe('02:05');
    });

    test('should format hours, minutes, seconds correctly', () => {
        expect(formatTimerDisplay(3665)).toBe('1:01:05');
    });

    test('should pad single digits with zeros', () => {
        expect(formatTimerDisplay(65)).toBe('01:05');
    });

    test('should handle zero', () => {
        expect(formatTimerDisplay(0)).toBe('00:00');
    });
});

describe('Daily Statistics Calculation', () => {
    test('should calculate stats for feeds on target day', () => {
        const baseTime = new Date('2025-01-15T10:00:00').getTime();

        const history = [
            {
                id: '1',
                sessions: [
                    { side: FeedingSide.Left, duration: 300, endTime: baseTime },
                    { side: FeedingSide.Right, duration: 240, endTime: baseTime + 5 * 60 * 1000 }
                ],
                endTime: baseTime + 5 * 60 * 1000
            },
            {
                id: '2',
                sessions: [
                    { side: FeedingSide.Left, duration: 360, endTime: baseTime + 3 * 60 * 60 * 1000 }
                ],
                endTime: baseTime + 3 * 60 * 60 * 1000
            }
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
                endTime: day1
            },
            {
                id: '2',
                sessions: [{ side: FeedingSide.Right, duration: 240, endTime: day2 }],
                endTime: day2
            }
        ];

        const stats = calculateDailyStats(history, '2025-01-15T10:00:00');

        expect(stats.totalFeeds).toBe(1);
        expect(stats.totalTime).toBe(300);
    });
});

describe('Data Structure Integrity', () => {
    test('should create new unit with correct structure', () => {
        const history = [];
        const feed = { side: FeedingSide.Left, duration: 300, endTime: Date.now() };
        const newHistory = addFeedLogic(history, feed);

        expect(newHistory[0].id).toBeTruthy();
        expect(newHistory[0].sessions.length).toBe(1);
        expect(newHistory[0].sessions[0]).toEqual(feed);
        expect(newHistory[0].endTime).toBe(feed.endTime);
    });

    test('should not mutate original history array', () => {
        const history = [];
        const feed = { side: FeedingSide.Left, duration: 300, endTime: Date.now() };
        addFeedLogic(history, feed);

        expect(history.length).toBe(0);
    });

    test('should update endTime when adding to existing unit', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = { side: FeedingSide.Right, duration: 240, endTime: baseTime + 5 * 60 * 1000 };
        const history2 = addFeedLogic(history1, feed2);

        expect(history2[0].endTime).toBe(feed2.endTime);
    });
});

describe('Edge Cases', () => {
    test('should handle empty history', () => {
        const history = [];
        const feed = { side: FeedingSide.Left, duration: 300, endTime: Date.now() };
        const newHistory = addFeedLogic(history, feed);

        expect(newHistory.length).toBe(1);
    });

    test('should handle zero duration feeds', () => {
        const history = [];
        const feed = { side: FeedingSide.Left, duration: 0, endTime: Date.now() };
        const newHistory = addFeedLogic(history, feed);

        expect(newHistory[0].sessions[0].duration).toBe(0);
    });

    test('should handle very large duration values', () => {
        const largeSeconds = 7200; // 2 hours
        const display = formatTimerDisplay(largeSeconds);

        expect(display).toBe('2:00:00');
    });
});

// Display results in terminal
console.log('\n========================================');
console.log('  Baby Feed Tracker - Test Results');
console.log('========================================\n');

results.suites.forEach(suite => {
    console.log(`\n📦 ${suite.name}`);
    console.log('─'.repeat(40));

    suite.tests.forEach(test => {
        if (test.passed) {
            console.log(`  ✓ ${test.name}`);
        } else {
            console.log(`  ✗ ${test.name}`);
            console.log(`    Error: ${test.error}`);
        }
    });
});

console.log('\n========================================');
console.log('Summary');
console.log('========================================');
console.log(`Total:  ${results.total}`);
console.log(`Passed: ${results.passed} ✓`);
console.log(`Failed: ${results.failed} ✗`);
console.log('========================================\n');

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
