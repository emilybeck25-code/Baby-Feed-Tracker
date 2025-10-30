import { DeveloperMenu } from '../DeveloperMenu';
import { APP_VERSION } from '../../version';
import { useFeedingContext } from '../../contexts/FeedingContext';
import { generateSampleData } from '../../data/sampleFeedingData';

export function Header() {
    const { importHistory } = useFeedingContext();

    const handleImportSampleData = () => {
        const sampleData = generateSampleData();
        importHistory(sampleData);
    };

    return (
        <header className="p-4 flex items-center justify-between">
            <DeveloperMenu onImportData={handleImportSampleData} />
            <h1 className="flex-1 text-3xl font-bold bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent text-center">
                Baby Feed Tracker
            </h1>
            <div
                className="min-w-[3.5rem] text-right text-sm font-semibold text-slate-500"
                title="Application version"
            >
                v{APP_VERSION}
            </div>
        </header>
    );
}
