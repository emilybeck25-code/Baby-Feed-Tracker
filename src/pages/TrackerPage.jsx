import { useFeedingContext } from '../contexts/FeedingContext';
import { TimerDisplay } from '../components/TimerDisplay';
import { HistoryLog } from '../components/HistoryLog';
import { LastFeedElapsed } from '../components/LastFeedElapsed';
import { FeedControls } from '../components/feed';

export function TrackerPage() {
    const { activeSide, duration, deleteFeed, clearHistory, chronologicalHistory, lastFeedTime } =
        useFeedingContext();

    return (
        <div className="flex flex-col h-full">
            {/* Timer Display */}
            <div className="p-6 text-center">
                {activeSide === null ? (
                    <>
                        <LastFeedElapsed lastFeedTime={lastFeedTime} />
                        <div className="text-slate-500 text-lg">Tap L or R to start a feed</div>
                    </>
                ) : (
                    <>
                        <div className="text-slate-600 mb-2">Feeding on {activeSide} side</div>
                        <div className="text-6xl font-bold text-slate-800">
                            <TimerDisplay seconds={duration} />
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
                        disabled={activeSide !== null}
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
            <FeedControls />
        </div>
    );
}
