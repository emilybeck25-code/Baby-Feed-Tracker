import test from 'node:test';
import assert from 'node:assert/strict';
import { headMatchesPendingSession, unitMatchesSession } from '../pendingSession.js';

const session = { side: 'Left', duration: 60, endTime: 1_700_000_000 };

test('headMatchesPendingSession only matches a single-session head with same side and endTime', () => {
    const history = [
        {
            id: 'a',
            sessions: [{ side: 'Left', duration: 60, endTime: session.endTime }],
            endTime: session.endTime,
        },
    ];
    assert.equal(headMatchesPendingSession(history, session), true);

    const wrongSide = [
        {
            id: 'b',
            sessions: [{ side: 'Right', duration: 60, endTime: session.endTime }],
            endTime: session.endTime,
        },
    ];
    assert.equal(headMatchesPendingSession(wrongSide, session), false);

    const wrongEndTime = [
        {
            id: 'c',
            sessions: [{ side: 'Left', duration: 60, endTime: session.endTime + 1 }],
            endTime: session.endTime + 1,
        },
    ];
    assert.equal(headMatchesPendingSession(wrongEndTime, session), false);

    const bottle = [
        {
            id: 'd',
            type: 'Bottle',
            sessions: [{ side: 'Left', duration: 60, endTime: session.endTime }],
            endTime: session.endTime,
        },
    ];
    assert.equal(headMatchesPendingSession(bottle, session), false);

    const multiSession = [
        {
            id: 'e',
            sessions: [
                { side: 'Left', duration: 60, endTime: session.endTime },
                { side: 'Right', duration: 10, endTime: session.endTime + 10 },
            ],
            endTime: session.endTime + 10,
        },
    ];
    assert.equal(headMatchesPendingSession(multiSession, session), false);
});

test('unitMatchesSession treats endTime as identity (delete head then start opposite side stays isolated)', () => {
    const history = [
        {
            id: 'x',
            sessions: [{ side: 'Left', duration: 60, endTime: session.endTime }],
            endTime: session.endTime,
        },
        {
            id: 'y',
            sessions: [{ side: 'Right', duration: 45, endTime: session.endTime + 500 }],
            endTime: session.endTime + 500,
        },
    ];

    // Matches the exact original session
    assert.equal(unitMatchesSession(history[0], session), true);
    // Same side but different endTime should not match (endTime is stable identity)
    const mutatedEndTime = { ...session, endTime: session.endTime + 1 };
    assert.equal(unitMatchesSession(history[0], mutatedEndTime), false);

    // If the head entry is deleted (history becomes empty), pending session should not match anything
    const deletedHistory = [];
    assert.equal(headMatchesPendingSession(deletedHistory, session), false);
});
