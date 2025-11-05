import { DeveloperMenu } from '../DeveloperMenu';
import { useFeedingContext } from '../../contexts/FeedingContext';
import { generateSampleData } from '../../data/sampleFeedingData';
import packageJson from '../../../package.json';
export function Header() {
    const { importHistory, clearHistory, activeSide } = useFeedingContext();

    const handleImportSampleData = () => {
        const sampleData = generateSampleData();
        importHistory(sampleData);
    };

    const handleClearHistory = () => {
        clearHistory();
    };

    return (
        <header className="mx-4 mt-4 px-4 py-3 glass rounded-2xl flex items-center justify-between gap-3">
            <DeveloperMenu
                onImportData={handleImportSampleData}
                onClearHistory={handleClearHistory}
                clearDisabled={activeSide !== null}
            />
            <h1 className="flex-1 text-3xl font-bold heading-gradient text-center">
                Baby Feed Tracker
            </h1>
            <div className="min-w-[3.5rem] text-right">
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
