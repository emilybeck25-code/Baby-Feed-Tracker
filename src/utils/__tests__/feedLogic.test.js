import { describe, test, expect } from 'vitest';
import { FeedingSide } from '../constants.js';
import { addFeedLogic } from '../feedLogic.js';

describe('Feed Pairing Logic', () => {
    test('should pair opposite sides into same unit', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = { side: FeedingSide.Right, duration: 240, endTime: baseTime + 5000 };
        const history2 = addFeedLogic(history1, feed2);

        expect(history2.length).toBe(1);
        expect(history2[0].sessions.length).toBe(2);
    });

    test('should NOT pair same side feeds', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = { side: FeedingSide.Left, duration: 240, endTime: baseTime + 5000 };
        const history2 = addFeedLogic(history1, feed2);

        expect(history2.length).toBe(2);
    });

    test('should NOT add to unit that already has 2 sessions', () => {
        const history = [];
        const baseTime = Date.now();

        const feed1 = { side: FeedingSide.Left, duration: 300, endTime: baseTime };
        const history1 = addFeedLogic(history, feed1);

        const feed2 = { side: FeedingSide.Right, duration: 240, endTime: baseTime + 5000 };
        const history2 = addFeedLogic(history1, feed2);

        const feed3 = { side: FeedingSide.Left, duration: 180, endTime: baseTime + 10000 };
        const history3 = addFeedLogic(history2, feed3);

        expect(history3.length).toBe(2);
        expect(history3[0].sessions.length).toBe(1);
    });

    test('should create valid unit structure', () => {
        const history = [];
        const feed = { side: FeedingSide.Left, duration: 300, endTime: Date.now() };
        const newHistory = addFeedLogic(history, feed);

        expect(newHistory[0].id).toBeTruthy();
        expect(newHistory[0].sessions.length).toBe(1);
        expect(newHistory[0].endTime).toBe(feed.endTime);
    });

    test('should not mutate original history', () => {
        const history = [];
        const feed = { side: FeedingSide.Left, duration: 300, endTime: Date.now() };
        addFeedLogic(history, feed);

        expect(history.length).toBe(0);
    });
});
