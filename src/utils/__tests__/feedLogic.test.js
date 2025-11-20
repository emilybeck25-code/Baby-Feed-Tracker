import test from 'node:test';
import assert from 'node:assert/strict';
import { addFeedLogic } from '../feedLogic.js';

test('addFeedLogic pairs the new session with the existing unit when sides alternate', () => {
    const firstSession = {
        side: 'Left',
        duration: 60,
        endTime: 1_700_000_000_000,
    };
    const existingUnit = {
        id: 'unit-1',
        sessions: [firstSession],
        endTime: firstSession.endTime,
    };
    const newSession = {
        side: 'Right',
        duration: 120,
        endTime: 1_700_000_060_000,
    };

    const result = addFeedLogic([existingUnit], newSession);
    assert.equal(result.length, 1);
    const [unit] = result;
    assert.equal(unit.id, existingUnit.id);
    assert.equal(unit.sessions.length, 2);
    assert.equal(unit.sessions[0], firstSession);
    assert.equal(unit.sessions[1], newSession);
    assert.equal(unit.endTime, newSession.endTime);
});

test('addFeedLogic prepends a new unit when no pairing is available', () => {
    const session = {
        side: 'Right',
        duration: 45,
        endTime: 1_700_000_000_000,
    };
    const history = [
        {
            id: 'paired',
            sessions: [
                { side: 'Left', duration: 30, endTime: 1_600 },
                { side: 'Right', duration: 40, endTime: 1_640 },
            ],
            endTime: 1_640,
        },
    ];

    const originalDateNow = Date.now;
    const originalMathRandom = Math.random;
    Date.now = () => 4321;
    Math.random = () => 0.111;

    try {
        const result = addFeedLogic(history, session);
        assert.equal(result.length, 2);
        assert.equal(result[0].id, '4321-0.111');
        assert.equal(result[0].sessions.length, 1);
        assert.equal(result[0].sessions[0], session);
        assert.equal(result[0].endTime, session.endTime);
        assert.equal(result[1], history[0]);
    } finally {
        Date.now = originalDateNow;
        Math.random = originalMathRandom;
    }
});

test('addFeedLogic does not merge bottle entries', () => {
    const bottleUnit = {
        id: 'bottle',
        type: 'Bottle',
        volumeOz: 4,
        sessions: [],
        endTime: 1_600,
    };
    const session = {
        side: 'Left',
        duration: 30,
        endTime: 1_700,
    };

    const result = addFeedLogic([bottleUnit], session);
    assert.equal(result.length, 2);
    assert.equal(result[1], bottleUnit);
    assert.equal(result[0].sessions[0], session);
});
