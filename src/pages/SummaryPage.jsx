import { useState, useMemo } from 'react';
import {
    calculateHourlyStats,
    calculateMonthlyStats,
    calculateYearlyStats,
} from '../utils/statistics';
import { StatCard } from '../components/StatCard';
import { TimerDisplay } from '../components/TimerDisplay';
import { DualMetricChart } from '../components/DualMetricChart';

export function SummaryPage({ history }) {
    const [view, setView] = useState('today'); // 'today' | 'daily' | 'monthly'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
    });
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Calculate stats based on current view
    const stats = useMemo(() => {
        if (view === 'today') {
            return calculateHourlyStats(history, selectedDate);
        } else if (view === 'daily') {
            return calculateMonthlyStats(history, selectedMonth.month, selectedMonth.year);
        } else {
            return calculateYearlyStats(history, selectedYear);
        }
    }, [view, history, selectedDate, selectedMonth, selectedYear]);

    // Format duration for charts (seconds to "X min")
    const formatDuration = (seconds) => {
        const minutes = Math.round(seconds / 60);
        return `${minutes} min`;
    };

    // Date navigation handlers
    const navigatePrev = () => {
        if (view === 'today') {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
        } else if (view === 'daily') {
            const newMonth = selectedMonth.month === 0 ? 11 : selectedMonth.month - 1;
            const newYear = selectedMonth.month === 0 ? selectedMonth.year - 1 : selectedMonth.year;
            setSelectedMonth({ month: newMonth, year: newYear });
        } else {
            setSelectedYear(selectedYear - 1);
        }
    };

    const navigateNext = () => {
        if (view === 'today') {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
        } else if (view === 'daily') {
            const newMonth = selectedMonth.month === 11 ? 0 : selectedMonth.month + 1;
            const newYear =
                selectedMonth.month === 11 ? selectedMonth.year + 1 : selectedMonth.year;
            setSelectedMonth({ month: newMonth, year: newYear });
        } else {
            setSelectedYear(selectedYear + 1);
        }
    };

    // Format date range display
    const getDateRangeLabel = () => {
        if (view === 'today') {
            return selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } else if (view === 'daily') {
            const monthNames = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ];
            return `${monthNames[selectedMonth.month]} ${selectedMonth.year}`;
        } else {
            return `${selectedYear}`;
        }
    };

    // Prepare chart data based on view
    const chartData = useMemo(() => {
        if (view === 'today') {
            return stats.blocks.map((block) => ({
                label: block.label,
                feedCount: block.feedCount,
                duration: block.duration,
            }));
        } else if (view === 'daily') {
            return stats.dailyTotals.map((day) => ({
                label: day.day.toString(),
                feedCount: day.feedCount,
                duration: day.totalDurationSeconds,
            }));
        } else {
            return stats.monthlyTotals.map((month) => ({
                label: month.label,
                feedCount: month.feedCount,
                duration: month.totalDurationSeconds,
            }));
        }
    }, [view, stats]);

    return (
        <div className="p-4 pb-20 overflow-y-auto h-full">
            {/* View Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setView('today')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                        view === 'today'
                            ? 'bg-violet-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                >
                    Today
                </button>
                <button
                    onClick={() => setView('daily')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                        view === 'daily'
                            ? 'bg-violet-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                >
                    Daily
                </button>
                <button
                    onClick={() => setView('monthly')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                        view === 'monthly'
                            ? 'bg-violet-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                >
                    Monthly
                </button>
            </div>

            {/* Date Navigator */}
            <div className="flex items-center justify-between mb-4 bg-white rounded-lg p-3 shadow-sm">
                <button
                    onClick={navigatePrev}
                    className="text-violet-500 hover:text-violet-600 px-3 py-1"
                >
                    ←
                </button>
                <div className="text-slate-800 font-semibold">{getDateRangeLabel()}</div>
                <button
                    onClick={navigateNext}
                    className="text-violet-500 hover:text-violet-600 px-3 py-1"
                >
                    →
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard title="Total Feeds" value={stats.totalFeeds} />
                <StatCard title="Total Time" value={<TimerDisplay seconds={stats.totalTime} />} />
                <StatCard title="Left Side" value={<TimerDisplay seconds={stats.leftTime} />} />
                <StatCard title="Right Side" value={<TimerDisplay seconds={stats.rightTime} />} />
            </div>

            {/* View-specific stats */}
            {view === 'today' && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <StatCard
                        title="Avg Duration"
                        value={<TimerDisplay seconds={stats.avgDuration} />}
                    />
                    <StatCard
                        title="Longest Feed"
                        value={<TimerDisplay seconds={stats.longestFeed} />}
                    />
                </div>
            )}

            {view === 'daily' && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <StatCard title="Avg/Day" value={stats.avgFeedsPerDay} />
                    {stats.mostActiveDay && (
                        <StatCard title="Peak Day" value={`Day ${stats.mostActiveDay}`} />
                    )}
                </div>
            )}

            {view === 'monthly' && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <StatCard title="Avg/Month" value={stats.avgFeedsPerMonth} />
                    {stats.mostActiveMonth && (
                        <StatCard title="Peak Month" value={stats.mostActiveMonth} />
                    )}
                </div>
            )}

            {/* Chart */}
            <div className="mb-4">
                {stats.totalFeeds === 0 ? (
                    <div className="bg-white rounded-3xl shadow-[0_12px_30px_rgba(148,163,184,0.18)] border border-slate-100 p-8">
                        <div className="flex flex-col items-center justify-center text-center py-8">
                            <div className="text-6xl mb-4">📊</div>
                            <div className="text-slate-500 text-lg mb-2">No feeds recorded</div>
                            <div className="text-slate-400 text-sm">
                                {view === 'today' && 'No feeds for this day yet'}
                                {view === 'daily' && 'No feeds this month yet'}
                                {view === 'monthly' && 'No feeds this year yet'}
                            </div>
                        </div>
                    </div>
                ) : (
                    <DualMetricChart
                        title={
                            view === 'today'
                                ? 'Hourly Pattern'
                                : view === 'daily'
                                  ? 'Daily Pattern'
                                  : 'Monthly Pattern'
                        }
                        subtitle={
                            view === 'today'
                                ? 'Feed count and duration by time of day'
                                : view === 'daily'
                                  ? 'Feed count and duration by day of month'
                                  : 'Feed count and duration by month'
                        }
                        data={chartData}
                        formatDuration={formatDuration}
                    />
                )}
            </div>

            {/* Insights */}
            {view === 'today' && stats.mostActiveBlock && (
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-sm">
                    <div className="font-semibold text-violet-900 mb-1">💡 Insight</div>
                    <div className="text-violet-700">Most active time: {stats.mostActiveBlock}</div>
                </div>
            )}
        </div>
    );
}
