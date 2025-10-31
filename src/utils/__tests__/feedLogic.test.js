import test from 'node:test';
import assert from 'node:assert/strict';
import { addFeedLogic, PENDING_UNIT_PREFIX } from '../feedLogic.js';
import { createPendingUnit } from '../../hooks/useFeedingHistory.js';

test('addFeedLogic replaces the top pending unit with the completed session', () => {
    const startTime = 1_700_000_000_000;
    const pendingUnit = createPendingUnit('Left', startTime);
    const completedSession = {
        side: 'Left',
        duration: 120,
        endTime: startTime + 120_000,
    };

    const originalDateNow = Date.now;
    const originalMathRandom = Math.random;
    Date.now = () => 1111;
    Math.random = () => 0.5;

    try {
        const result = addFeedLogic([pendingUnit], completedSession);
        assert.equal(result.length, 1);

        const [unit] = result;
        assert.equal(unit.sessions.length, 1);
        assert.equal(unit.sessions[0], completedSession);
        assert.equal(unit.endTime, completedSession.endTime);
        assert.equal(unit.id, '1111-0.5');
        assert.ok(!unit.id.startsWith(PENDING_UNIT_PREFIX));
    } finally {
        Date.now = originalDateNow;
        Math.random = originalMathRandom;
    }
});

test('addFeedLogic pairs the opposite side after pending replacement', () => {
    const startTime = 1_700_000_000_000;
    const pendingUnit = createPendingUnit('Left', startTime);
    const leftSession = {
        side: 'Left',
        duration: 60,
        endTime: startTime + 60_000,
    };
    const rightSession = {
        side: 'Right',
        duration: 300,
        endTime: startTime + 360_000,
    };

    const originalDateNow = Date.now;
    const originalMathRandom = Math.random;
    Date.now = () => 1234;
    Math.random = () => 0.321;

    let historyAfterLeft;
    try {
        historyAfterLeft = addFeedLogic([pendingUnit], leftSession);
        assert.equal(historyAfterLeft[0].id, '1234-0.321');
    } finally {
        Date.now = originalDateNow;
        Math.random = originalMathRandom;
    }

    const finalHistory = addFeedLogic(historyAfterLeft, rightSession);
    const [unit] = finalHistory;

    assert.equal(unit.sessions.length, 2);
    assert.equal(unit.sessions[0], leftSession);
    assert.equal(unit.sessions[1], rightSession);
    assert.equal(unit.endTime, rightSession.endTime);
});

test('createPendingUnit produces the expected placeholder shape', () => {
    const startTime = 1_700_000_000_000;
    const pendingUnit = createPendingUnit('Right', startTime);

    assert.equal(pendingUnit.id, `${PENDING_UNIT_PREFIX}${startTime}`);
    assert.equal(pendingUnit.endTime, startTime);
    assert.equal(pendingUnit.sessions.length, 1);
    assert.deepEqual(pendingUnit.sessions[0], {
        side: 'Right',
        duration: 0,
        endTime: startTime,
    });
});
