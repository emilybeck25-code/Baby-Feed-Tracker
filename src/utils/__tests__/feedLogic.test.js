import { describe, test, expect } from 'vitest';
import { FeedingSide } from '../constants.js';
import { addFeedLogic } from '../feedLogic.js';

describe('Feed Grouping Logic', () => {
    test('should group opposite sides within 10 minutes', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = {
            side: FeedingSide.Right,
            duration: 240,
            endTime: baseTime + 5 * 60 * 1000,
        };
        const history2 = addFeedLogic(history1, feed2);

        expect(history2.length).toBe(1);
        expect(history2[0].sessions.length).toBe(2);
    });

    test('should NOT group opposite sides after 10 minutes', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = {
            side: FeedingSide.Right,
            duration: 240,
            endTime: baseTime + 11 * 60 * 1000,
        };
        const history2 = addFeedLogic(history1, feed2);

        expect(history2.length).toBe(2);
    });

    test('should NOT group same side feeds', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = {
            side: FeedingSide.Left,
            duration: 240,
            endTime: baseTime + 5 * 60 * 1000,
        };
        const history2 = addFeedLogic(history1, feed2);

        expect(history2.length).toBe(2);
    });

    test('should NOT group when previous unit already has 2 sessions', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = {
            side: FeedingSide.Right,
            duration: 240,
            endTime: baseTime + 5 * 60 * 1000,
        };
        const history2 = addFeedLogic(history1, feed2);

        const feed3 = {
            side: FeedingSide.Left,
            duration: 180,
            endTime: baseTime + 8 * 60 * 1000,
        };
        const history3 = addFeedLogic(history2, feed3);

        expect(history3.length).toBe(2);
        expect(history3[0].sessions.length).toBe(1);
    });

    test('should handle boundary: exactly 10 minutes', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = {
            side: FeedingSide.Right,
            duration: 240,
            endTime: baseTime + 10 * 60 * 1000,
        };
        const history2 = addFeedLogic(history1, feed2);

        expect(history2.length).toBe(2);
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

        const feed2 = {
            side: FeedingSide.Right,
            duration: 240,
            endTime: baseTime + 5 * 60 * 1000,
        };
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
});
