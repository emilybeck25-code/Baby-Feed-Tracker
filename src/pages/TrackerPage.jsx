import { useState, useMemo } from 'react';
import { FeedingSide } from '../utils/constants';
import { TimerDisplay } from '../components/TimerDisplay';
import { HistoryLog } from '../components/HistoryLog';
import { LastFeedElapsed } from '../components/LastFeedElapsed';

export function TrackerPage({
    activeSide,
    duration,
    startTimer,
    paused,
    pauseTimer,
    resumeTimer,
    togglePause,
    stopTimer,
    addFeed,
    deleteFeed,
    clearHistory,
    chronologicalHistory,
    lastFeedTime,
}) {
    const [completedSession, setCompletedSession] = useState(null);

    // Determine the suggested side for the next feed when idle.
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
            setCompletedSession(feed);
            return;
        }

        // If there's a completed session
        if (completedSession !== null) {
            // If user clicks the same side again (the "Finish" button), save with 0-duration opposite side
            if (completedSession.side === side) {
                // Add the completed session
                addFeed(completedSession);
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

    const handleFinishBothSides = () => {
        // When second side timer stops, save both sessions
        if (completedSession !== null && activeSide !== null) {
            const secondFeed = stopTimer();
            addFeed(completedSession);
            addFeed(secondFeed);
            setCompletedSession(null);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Timer Display */}
            <div className="p-6 text-center">
                {activeSide === null && completedSession === null ? (
                    <>
                        <LastFeedElapsed lastFeedTime={lastFeedTime} />
                        <div className="text-slate-500 text-lg">Tap L or R to start a feed</div>
                    </>
                ) : activeSide !== null ? (
                    <>
                        <div className="text-slate-600 mb-2">Feeding on {activeSide} side</div>
                        <div className="text-6xl font-bold text-slate-800">
                            <TimerDisplay seconds={duration} />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-slate-600 mb-2">
                            {completedSession.side} side complete
                        </div>
                        <div className="text-slate-500 text-lg">
                            Tap Finish to save, or tap{' '}
                            {completedSession.side === FeedingSide.Left ? 'R' : 'L'} to continue
                        </div>
                    </>
                )}
            </div>

            {/* History Header - Static */}
            {chronologicalHistory.length > 0 && (
                <div className="px-4 flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Feeding History</h2>
                    <button
                        onClick={clearHistory}
                        disabled={activeSide !== null || completedSession !== null}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* History Log - Scrollable */}
            <div className="flex-grow overflow-y-auto px-4 pb-4">
                <HistoryLog chronologicalHistory={chronologicalHistory} onDelete={deleteFeed} />
            </div>

            {/* Action Buttons */}
            <div className="p-6 flex gap-4 justify-center">
                {/* LEFT BUTTON AREA */}
                {activeSide === FeedingSide.Right ? (
                    <button
                        type="button"
                        onClick={togglePause}
                        aria-label={paused ? 'Resume timer' : 'Pause timer'}
                        className="w-24 h-24 rounded-full text-white font-bold shadow-lg active:scale-95 transition-transform bg-violet-400"
                    >
                        {paused ? (
                            <svg
                                className="w-10 h-10 mx-auto"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M8 5v14l11-7-11-7z" />
                            </svg>
                        ) : (
                            <svg
                                className="w-10 h-10 mx-auto"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <rect x="6" y="5" width="4" height="14" rx="1" />
                                <rect x="14" y="5" width="4" height="14" rx="1" />
                            </svg>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            if (completedSession !== null && activeSide === FeedingSide.Left) {
                                handleFinishBothSides();
                            } else {
                                handleButtonClick(FeedingSide.Left);
                            }
                        }}
                        disabled={activeSide === FeedingSide.Right}
                        className={`w-24 h-24 rounded-full text-white font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${
                            activeSide === FeedingSide.Left ||
                            completedSession?.side === FeedingSide.Left
                                ? 'bg-violet-600'
                                : 'bg-violet-400'
                        } ${completedSession?.side === FeedingSide.Left ? 'text-lg' : 'text-4xl'} ${
                            suggestedStartSide === FeedingSide.Left ? 'scale-110' : ''
                        }`}
                    >
                        {completedSession?.side === FeedingSide.Left ? 'Finish' : 'L'}
                    </button>
                )}

                {/* RIGHT BUTTON AREA */}
                {activeSide === FeedingSide.Left ? (
                    <button
                        type="button"
                        onClick={togglePause}
                        aria-label={paused ? 'Resume timer' : 'Pause timer'}
                        className="w-24 h-24 rounded-full text-white font-bold shadow-lg active:scale-95 transition-transform bg-rose-400"
                    >
                        {paused ? (
                            <svg
                                className="w-10 h-10 mx-auto"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M8 5v14l11-7-11-7z" />
                            </svg>
                        ) : (
                            <svg
                                className="w-10 h-10 mx-auto"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <rect x="6" y="5" width="4" height="14" rx="1" />
                                <rect x="14" y="5" width="4" height="14" rx="1" />
                            </svg>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            if (completedSession !== null && activeSide === FeedingSide.Right) {
                                handleFinishBothSides();
                            } else {
                                handleButtonClick(FeedingSide.Right);
                            }
                        }}
                        disabled={activeSide === FeedingSide.Left}
                        className={`w-24 h-24 rounded-full text-white font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${
                            activeSide === FeedingSide.Right ||
                            completedSession?.side === FeedingSide.Right
                                ? 'bg-rose-600'
                                : 'bg-rose-400'
                        } ${completedSession?.side === FeedingSide.Right ? 'text-lg' : 'text-4xl'} ${
                            suggestedStartSide === FeedingSide.Right ? 'scale-110' : ''
                        }`}
                    >
                        {completedSession?.side === FeedingSide.Right ? 'Finish' : 'R'}
                    </button>
                )}
            </div>
        </div>
    );
}
