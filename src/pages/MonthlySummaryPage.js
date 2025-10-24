import { calculateMonthlyStats } from '../utils/statistics.js';
import { StatCard } from '../components/StatCard.js';
import { MiniBarChart } from '../components/MiniBarChart.js';

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

    const feedCountData = stats.dailyTotals.map(day => ({
        label: day.day.toString(),
        value: day.feedCount
    }));

    const feedingTimeData = stats.dailyTotals.map(day => ({
        label: day.day.toString(),
        value: parseFloat((day.totalDurationSeconds / 60).toFixed(1))
    }));

    const formatMinutes = (value) => {
        const rounded = Math.round(value * 10) / 10;
        const display = Number.isInteger(rounded) ? rounded : rounded.toFixed(1);
        return `${display} min`;
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">This Month's Summary</h2>
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Total Feeds" value={stats.totalFeeds} />
                <StatCard title="Avg Feeds/Day" value={stats.avgFeedsPerDay} />
            </div>
            <div className="mt-6 space-y-4">
                <MiniBarChart
                    title="Daily Feed Rhythm"
                    subtitle="Each bar shows how many complete feeds happened"
                    data={feedCountData}
                    valueFormatter={value => `${value} ${value === 1 ? 'feed' : 'feeds'}`}
                    gradient="linear-gradient(180deg, #c084fc 0%, #ec4899 100%)"
                    shadowColor="rgba(236, 72, 153, 0.25)"
                    accentLabel="Feeds"
                />
                <MiniBarChart
                    title="Time Spent Feeding"
                    subtitle="Total nursing minutes captured per day"
                    data={feedingTimeData}
                    valueFormatter={formatMinutes}
                    gradient="linear-gradient(180deg, #38bdf8 0%, #6366f1 100%)"
                    shadowColor="rgba(99, 102, 241, 0.22)"
                    accentLabel="Minutes"
                />
            </div>
        </div>
    );
}
