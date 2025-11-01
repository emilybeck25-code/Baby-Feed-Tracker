import { useState } from 'react';
import { FeedingProvider } from './contexts/FeedingContext';
import { TrackerPage } from './pages/TrackerPage';
import { SummaryPage } from './pages/SummaryPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';

export function App() {
    return (
        <FeedingProvider>
            <AppContent />
        </FeedingProvider>
    );
}

function AppContent() {
    const [currentPage, setCurrentPage] = useState('Tracker');

    const renderPage = () => {
        switch (currentPage) {
            case 'Tracker':
                return <TrackerPage />;
            case 'Summary':
                return <SummaryPage />;
            case 'Notify':
                return <NotificationsPage />;
            default:
                return null;
        }
    };

    return (
        <div className="h-screen bg-gray-100 flex flex-col font-sans">
            <Header />
            <main className="flex-grow overflow-hidden pb-20">{renderPage()}</main>
            <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
        </div>
    );
}
