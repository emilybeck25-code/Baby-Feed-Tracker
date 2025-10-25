import { FeedingSide } from '../utils/constants';
import { TimerDisplay } from '../components/TimerDisplay';
import { HistoryLog } from '../components/HistoryLog';

export function TrackerPage({ activeSide, duration, startTimer, stopTimer, addFeed, deleteFeed, clearHistory, chronologicalHistory }) {
    const handleButtonClick = (side) => {
        if (activeSide === null) {
            startTimer(side);
        } else if (activeSide === side) {
            const feed = stopTimer();
            addFeed(feed);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Timer Display */}
            <div className="p-6 text-center">
                {activeSide === null ? (
                    <div className="text-slate-500 text-lg">Tap L or R to start a feed</div>
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
            <div className="p-6 flex gap-4 justify-center">
                <button
                    onClick={() => handleButtonClick(FeedingSide.Left)}
                    disabled={activeSide !== null && activeSide !== FeedingSide.Left}
                    className={`w-24 h-24 rounded-full text-white text-4xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${
                        activeSide === FeedingSide.Left ? 'bg-red-600' : 'bg-violet-400'
                    }`}
                >
                    L
                </button>
                <button
                    onClick={() => handleButtonClick(FeedingSide.Right)}
                    disabled={activeSide !== null && activeSide !== FeedingSide.Right}
                    className={`w-24 h-24 rounded-full text-white text-4xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${
                        activeSide === FeedingSide.Right ? 'bg-red-600' : 'bg-rose-400'
                    }`}
                >
                    R
                </button>
            </div>
        </div>
    );
}
