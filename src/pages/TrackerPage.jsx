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
    const isBreastActive = activeSide !== null && feedType === FeedType.Breast;

    const primaryCard = isBreastActive ? (
        <div className="glass rounded-2xl px-6 py-4 flex flex-col items-center gap-2">
            <div className="text-xs uppercase tracking-[0.35em] text-fuchsia-400">
                feeding on {activeSide} side
            </div>
            <div className="text-5xl font-semibold text-slate-900 tracking-tight">
                <TimerDisplay seconds={duration} />
            </div>
        </div>
    ) : (
        <LastFeedElapsed lastFeedTime={lastFeedTime} />
    );

    return (
        <div className="flex flex-col h-full">
            {/* Timer Display */}
            <div className="px-6 pt-6 pb-4 text-center space-y-4">
                {primaryCard}
                <FeedTypeToggle variant="wide" />
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
