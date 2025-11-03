import { useFeedingContext } from '../contexts/FeedingContext';
import { TimerDisplay } from '../components/TimerDisplay';
import { HistoryLog } from '../components/HistoryLog';
import { LastFeedElapsed } from '../components/LastFeedElapsed';
import { FeedControls } from '../components/feed/FeedControls';
import { FeedTypeToggle } from '../components/layout/FeedTypeToggle';
import { FeedType } from '../utils/constants';
import { BottleControls } from '../components/feed/BottleControls';

export function TrackerPage() {
    const { activeSide, duration, deleteFeed, chronologicalHistory, lastFeedTime, feedType } =
        useFeedingContext();

    return (
        <div className="flex flex-col h-full">
            {/* Timer Display */}
            <div className="p-6 text-center space-y-6">
                <LastFeedElapsed lastFeedTime={lastFeedTime} />

                {activeSide !== null && feedType === FeedType.Breast ? (
                    <>
                        <div className="text-slate-600 mb-2">Feeding on {activeSide} side</div>
                        <div className="text-6xl font-bold text-slate-800">
                            <TimerDisplay seconds={duration} />
                        </div>
                    </>
                ) : (
                    <>
                        <FeedTypeToggle variant="wide" />
                    </>
                )}
            </div>

            {/* History Header - Static */}
            {chronologicalHistory.length > 0 && (
                <div className="px-4 mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Feeding History</h2>
                </div>
            )}

            {/* History Log - Scrollable */}
            <div className="flex-grow overflow-y-auto px-4 pb-4">
                <HistoryLog chronologicalHistory={chronologicalHistory} onDelete={deleteFeed} />
            </div>

            {/* Action Buttons / Bottom Controls */}
            {feedType === FeedType.Breast ? (
                <FeedControls />
            ) : (
                <div className="p-6">
                    <BottleControls />
                </div>
            )}
        </div>
    );
}
