import { calculateMonthlyStats } from '../utils/statistics.js';
import { StatCard } from '../components/StatCard.js';

export function MonthlySummaryPage({ history }) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const stats = calculateMonthlyStats(history, currentMonth, currentYear);

    if (stats.totalFeeds === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-slate-500 text-lg">No feeds recorded this month</div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">This Month's Summary</h2>
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Total Feeds" value={stats.totalFeeds} />
                <StatCard title="Avg Feeds/Day" value={stats.avgFeedsPerDay} />
            </div>
        </div>
    );
}
