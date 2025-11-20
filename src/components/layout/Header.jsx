import { DeveloperMenu } from '../DeveloperMenu';
import { useFeedingContext } from '../../contexts/FeedingContext';
import { generateSampleData } from '../../data/sampleFeedingData';
import { useReminder } from '../../hooks/useReminder';
import packageJson from '../../../package.json';

export function Header() {
    const { importHistory, clearHistory, activeSide } = useFeedingContext();
    const { reminderTime, timeRemainingMs, clearReminder } = useReminder();

    const handleImportSampleData = () => {
        const sampleData = generateSampleData();
        importHistory(sampleData);
    };

    const handleClearHistory = () => {
        clearHistory();
    };

    const remainingMinutes = Math.max(0, Math.floor(timeRemainingMs / 60000));
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMinPart = remainingMinutes % 60;
    const countdownLabel =
        remainingHours > 0
            ? `${remainingHours}h ${String(remainingMinPart).padStart(2, '0')}m`
            : `${remainingMinPart}m`;

    const showReminder = reminderTime && timeRemainingMs > 0;

    return (
        <header className="mx-4 mt-4 flex items-center justify-between gap-3">
            <DeveloperMenu
                onImportData={handleImportSampleData}
                onClearHistory={handleClearHistory}
                clearDisabled={activeSide !== null}
            />
            <h1 className="flex-1 text-3xl font-bold heading-gradient text-center">
                Baby Feed Tracker
            </h1>
            <div className="min-w-[3.5rem] text-right flex items-center gap-2 justify-end">
                {showReminder && (
                    <button
                        type="button"
                        onClick={clearReminder}
                        className="glass-chip inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-700"
                        aria-label={`Clear reminder set for ${new Date(reminderTime).toLocaleTimeString()}`}
                        title={`Clear reminder (fires at ${new Date(reminderTime).toLocaleTimeString()})`}
                    >
                        ⏰ {countdownLabel}
                        <span aria-hidden>×</span>
                    </button>
                )}
                <span
                    className="glass-chip inline-block px-2 py-1 text-xs font-semibold text-slate-600"
                    title="Application version"
                >
                    v{packageJson.version}
                </span>
            </div>
        </header>
    );
}
