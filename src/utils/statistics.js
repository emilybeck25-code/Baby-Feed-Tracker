import { FeedingSide } from './constants.js';

export function calculateDailyStats(history, targetDate) {
    const today = new Date(targetDate);
    today.setHours(0, 0, 0, 0);

    const todayFeeds = history.filter(unit => {
        const feedDate = new Date(unit.endTime);
        feedDate.setHours(0, 0, 0, 0);
        return feedDate.getTime() === today.getTime();
    });

    const totalFeeds = todayFeeds.length;
    const totalTime = todayFeeds.reduce((sum, unit) => {
        return sum + unit.sessions.reduce((s, session) => s + session.duration, 0);
    }, 0);
    const leftTime = todayFeeds.reduce((sum, unit) => {
        return sum + unit.sessions.filter(s => s.side === FeedingSide.Left).reduce((s, session) => s + session.duration, 0);
    }, 0);
    const rightTime = todayFeeds.reduce((sum, unit) => {
        return sum + unit.sessions.filter(s => s.side === FeedingSide.Right).reduce((s, session) => s + session.duration, 0);
    }, 0);

    return { totalFeeds, totalTime, leftTime, rightTime };
}

export function calculateMonthlyStats(history, currentMonth, currentYear) {
    const monthFeeds = history.filter(unit => {
        const feedDate = new Date(unit.endTime);
        return feedDate.getMonth() === currentMonth && feedDate.getFullYear() === currentYear;
    });

    if (monthFeeds.length === 0) {
        return { totalFeeds: 0, avgFeedsPerDay: 0, dailyTotals: [] };
    }

    const totalFeeds = monthFeeds.length;
    const uniqueDays = new Set(monthFeeds.map(unit => {
        const date = new Date(unit.endTime);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    })).size;
    const avgFeedsPerDay = (totalFeeds / uniqueDays).toFixed(1);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyTotals = Array.from({ length: daysInMonth }, (_, index) => ({
        day: index + 1,
        feedCount: 0,
        totalDurationSeconds: 0
    }));

    monthFeeds.forEach(unit => {
        const feedDate = new Date(unit.endTime);
        const dayIndex = feedDate.getDate() - 1;
        const totalDuration = unit.sessions.reduce((sum, session) => sum + session.duration, 0);

        dailyTotals[dayIndex].feedCount += 1;
        dailyTotals[dayIndex].totalDurationSeconds += totalDuration;
    });

    return { totalFeeds, avgFeedsPerDay, dailyTotals };
}
