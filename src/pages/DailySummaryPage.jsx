import React from 'react';
import { calculateDailyStats } from '../utils/statistics.js';
import { StatCard } from '../components/StatCard.js';
import { TimerDisplay } from '../components/TimerDisplay.js';

export function DailySummaryPage({ history }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = calculateDailyStats(history, today);

    if (stats.totalFeeds === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-slate-500 text-lg">No feeds recorded today</div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Today's Summary</h2>
            <div className="grid grid-cols-2 gap-4">
                <StatCard title="Total Feeds" value={stats.totalFeeds} />
                <StatCard title="Total Time" value={<TimerDisplay seconds={stats.totalTime} />} />
                <StatCard title="Left Side" value={<TimerDisplay seconds={stats.leftTime} />} />
                <StatCard title="Right Side" value={<TimerDisplay seconds={stats.rightTime} />} />
            </div>
        </div>
    );
}
