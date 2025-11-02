import { useState } from 'react';
import { useFeedingContext } from '../contexts/FeedingContext';
import { TimerDisplay } from '../components/TimerDisplay';
import { HistoryLog } from '../components/HistoryLog';
import { LastFeedElapsed } from '../components/LastFeedElapsed';
import { FeedControls } from '../components/feed/FeedControls';
import { FeedTypeToggle } from '../components/layout/FeedTypeToggle';
import { FeedType } from '../utils/constants';

export function TrackerPage() {
    const {
        activeSide,
        duration,
        deleteFeed,
        chronologicalHistory,
        lastFeedTime,
        feedType,
        addBottleFeed,
    } =
        useFeedingContext();
    const [bottleVolume, setBottleVolume] = useState('');

    const parsedBottleVolume = Number(bottleVolume);
    const isValidBottleVolume =
        Number.isFinite(parsedBottleVolume) && parsedBottleVolume > 0 && bottleVolume !== '';

    const handleBottleSubmit = (event) => {
        event.preventDefault();
        if (!isValidBottleVolume) return;
        addBottleFeed(parsedBottleVolume);
        setBottleVolume('');
    };

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

                        {feedType === FeedType.Bottle && (
                            <form
                                onSubmit={handleBottleSubmit}
                                className="mx-auto w-full max-w-sm bg-white rounded-2xl shadow-md border border-slate-100 p-4 text-left"
                            >
                                <label
                                    className="block text-sm font-medium text-slate-600 mb-2"
                                    htmlFor="bottle-volume"
                                >
                                    Bottle volume (mL)
                                </label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    min="0"
                                    step="1"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    value={bottleVolume}
                                    id="bottle-volume"
                                    onChange={(event) => setBottleVolume(event.target.value)}
                                    placeholder="e.g. 120"
                                />
                                <button
                                    type="submit"
                                    className="mt-4 w-full rounded-lg bg-violet-500 text-white font-semibold py-2.5 shadow-sm transition-colors hover:bg-violet-600 disabled:opacity-60 disabled:cursor-not-allowed"
                                    disabled={!isValidBottleVolume}
                                >
                                    Log Bottle
                                </button>
                            </form>
                        )}
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

            {/* Action Buttons */}
            {feedType === FeedType.Breast && <FeedControls />}
        </div>
    );
}
