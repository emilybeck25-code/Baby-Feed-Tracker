import { useMemo, useEffect, useRef } from 'react';
import { FeedingSide } from '../../utils/constants';
import { useFeedingContext } from '../../contexts/FeedingContext';
import { FeedButton } from './FeedButton';

const AUTO_FINALIZE_MS = 30 * 60 * 1000;

export function FeedControls() {
    const {
        activeSide,
        paused,
        stopTimer,
        togglePause,
        startTimer,
        addFeed,
        chronologicalHistory,
        completedSession,
        setCompletedSession,
    } = useFeedingContext();

    const finalizeTimeoutRef = useRef(null);
    const endGuardRef = useRef(false);

    const opposite = (side) => (side === FeedingSide.Left ? FeedingSide.Right : FeedingSide.Left);

    const autoFinalize = (session) => {
        addFeed({
            side: opposite(session.side),
            duration: 0,
            endTime: session.endTime,
        });
        setCompletedSession(null);
    };

    useEffect(() => {
        if (finalizeTimeoutRef.current) {
            clearTimeout(finalizeTimeoutRef.current);
            finalizeTimeoutRef.current = null;
        }
        if (activeSide !== null || !completedSession) return;
        const deadline = completedSession.endTime + AUTO_FINALIZE_MS;
        const delay = deadline - Date.now();
        if (delay <= 0) {
            autoFinalize(completedSession);
            return;
        }
        finalizeTimeoutRef.current = setTimeout(() => autoFinalize(completedSession), delay);
        return () => {
            if (finalizeTimeoutRef.current) {
                clearTimeout(finalizeTimeoutRef.current);
            }
        };
    }, [completedSession, activeSide]);

    useEffect(() => {
        if (activeSide !== null) return;
        const top = chronologicalHistory?.[0];
        if (!top || !Array.isArray(top.sessions) || top.sessions.length !== 1) return;
        if (Date.now() - top.endTime >= AUTO_FINALIZE_MS) {
            const first = top.sessions[0];
            const oppositeSide =
                first.side === FeedingSide.Left ? FeedingSide.Right : FeedingSide.Left;
            addFeed({
                side: oppositeSide,
                duration: 0,
                endTime: first.endTime,
            });
        }
    }, [chronologicalHistory, activeSide]);

    useEffect(() => {
        if (completedSession === null) {
            endGuardRef.current = false;
        }
    }, [completedSession]);

    // Determine the suggested side for the next feed when idle
    const suggestedStartSide = useMemo(() => {
        if (activeSide !== null || completedSession !== null) return null;
        if (!chronologicalHistory || chronologicalHistory.length === 0) return null;
        const mostRecent = chronologicalHistory[0];
        const firstSession = mostRecent?.sessions?.[0];
        if (!firstSession?.side) return null;
        return firstSession.side === FeedingSide.Left ? FeedingSide.Right : FeedingSide.Left;
    }, [chronologicalHistory, activeSide, completedSession]);

    const handleButtonClick = (side) => {
        // If timer is running and user clicks the active button, stop the timer
        if (activeSide === side) {
            const feed = stopTimer();
            addFeed(feed);
            if (completedSession !== null) {
                setCompletedSession(null);
            } else {
                setCompletedSession(feed);
            }
            return;
        }

        // If there's a completed session
        if (completedSession !== null) {
            // If user clicks the same side again (the "Finish" button), save with 0-duration opposite side
            if (completedSession.side === side) {
                // Add 0-duration session on opposite side to complete the feed
                const oppositeSide =
                    completedSession.side === FeedingSide.Left
                        ? FeedingSide.Right
                        : FeedingSide.Left;
                addFeed({
                    side: oppositeSide,
                    duration: 0,
                    endTime: completedSession.endTime,
                });
                setCompletedSession(null);
            } else {
                // User clicked opposite side, start timer on that side
                startTimer(side);
            }
            return;
        }

        // No timer running and no completed session, start new timer
        if (activeSide === null) {
            startTimer(side);
        }
    };

    const handleLeftClick = () => {
        if (activeSide === FeedingSide.Left) {
            // Stop the active Left side
            const feed = stopTimer();
            addFeed(feed);
            if (completedSession !== null) {
                setCompletedSession(null);
            } else {
                setCompletedSession(feed);
            }
        } else if (activeSide === FeedingSide.Right) {
            // Pause the Right side timer
            togglePause();
        } else if (completedSession !== null && activeSide === null) {
            // Handle completed session flow
            if (completedSession.side === FeedingSide.Left) {
                // Finish button: only add 0-duration opposite side (original side already saved)
                if (endGuardRef.current) return;
                endGuardRef.current = true;
                addFeed({
                    side: FeedingSide.Right,
                    duration: 0,
                    endTime: completedSession.endTime,
                });
                setCompletedSession(null);
            } else {
                // Start timer on opposite side
                startTimer(FeedingSide.Left);
            }
        } else {
            // Start new Left side timer
            handleButtonClick(FeedingSide.Left);
        }
    };

    const handleRightClick = () => {
        if (activeSide === FeedingSide.Right) {
            // Stop the active Right side
            const feed = stopTimer();
            addFeed(feed);
            if (completedSession !== null) {
                setCompletedSession(null);
            } else {
                setCompletedSession(feed);
            }
        } else if (activeSide === FeedingSide.Left) {
            // Pause the Left side timer
            togglePause();
        } else if (completedSession !== null && activeSide === null) {
            // Handle completed session flow
            if (completedSession.side === FeedingSide.Right) {
                // Finish button: only add 0-duration opposite side (original side already saved)
                if (endGuardRef.current) return;
                endGuardRef.current = true;
                addFeed({
                    side: FeedingSide.Left,
                    duration: 0,
                    endTime: completedSession.endTime,
                });
                setCompletedSession(null);
            } else {
                // Start timer on opposite side
                startTimer(FeedingSide.Right);
            }
        } else {
            // Start new Right side timer
            handleButtonClick(FeedingSide.Right);
        }
    };

    return (
        <div className="p-6 flex gap-4 justify-center">
            <FeedButton
                side={FeedingSide.Left}
                activeSide={activeSide}
                paused={paused}
                completedSession={completedSession}
                suggestedStartSide={suggestedStartSide}
                onClick={handleLeftClick}
            />
            <FeedButton
                side={FeedingSide.Right}
                activeSide={activeSide}
                paused={paused}
                completedSession={completedSession}
                suggestedStartSide={suggestedStartSide}
                onClick={handleRightClick}
            />
        </div>
    );
}
