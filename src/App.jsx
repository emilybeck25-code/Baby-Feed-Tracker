import { useState } from 'react';
import { useTimer } from './hooks/useTimer';
import { useFeedingHistory } from './hooks/useFeedingHistory';
import { TrackerPage } from './pages/TrackerPage';
import { SummaryPage } from './pages/SummaryPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { DeveloperMenu } from './components/DeveloperMenu';
import { generateSampleData } from './data/sampleFeedingData';

export function App() {
    const [currentPage, setCurrentPage] = useState('Tracker');
    const { activeSide, duration, paused, startTimer, pauseTimer, resumeTimer, togglePause, stopTimer } = useTimer();
    const {
        history,
        addFeed,
        deleteFeed,
        clearHistory,
        importHistory,
        lastFeedTime,
        chronologicalHistory,
    } = useFeedingHistory();

    const handleImportSampleData = () => {
        const sampleData = generateSampleData();
        importHistory(sampleData);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'Tracker':
                return (
                    <TrackerPage
                        activeSide={activeSide}
                        duration={duration}
                        startTimer={startTimer}
                        paused={paused}
                        pauseTimer={pauseTimer}
                        resumeTimer={resumeTimer}
                        togglePause={togglePause}
                        stopTimer={stopTimer}
                        addFeed={addFeed}
                        deleteFeed={deleteFeed}
                        clearHistory={clearHistory}
                        chronologicalHistory={chronologicalHistory}
                        lastFeedTime={lastFeedTime}
                    />
                );
            case 'Summary':
                return <SummaryPage history={history} />;
            case 'Notify':
                return <NotificationsPage lastFeedTime={lastFeedTime} />;
            default:
                return null;
        }
    };

    return (
        <div className="h-screen bg-gray-100 flex flex-col font-sans">
            {/* Header */}
            <header className="p-4 flex items-center justify-between">
                <DeveloperMenu onImportData={handleImportSampleData} />
                <h1 className="flex-1 text-3xl font-bold bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent text-center">
                    Baby Feed Tracker
                </h1>
                <div className="w-10"></div> {/* Spacer for centering */}
            </header>

            {/* Main Content */}
            <main className="flex-grow overflow-hidden pb-20">{renderPage()}</main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                <div className="flex justify-around items-center py-2">
                    <button
                        onClick={() => setCurrentPage('Tracker')}
                        className={`flex flex-col items-center p-2 ${currentPage === 'Tracker' ? 'text-violet-500' : 'text-slate-500'}`}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="text-xs mt-1">Tracker</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('Summary')}
                        className={`flex flex-col items-center p-2 ${currentPage === 'Summary' ? 'text-violet-500' : 'text-slate-500'}`}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <span className="text-xs mt-1">Summary</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('Notify')}
                        className={`flex flex-col items-center p-2 ${currentPage === 'Notify' ? 'text-violet-500' : 'text-slate-500'}`}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                        <span className="text-xs mt-1">Notify</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
