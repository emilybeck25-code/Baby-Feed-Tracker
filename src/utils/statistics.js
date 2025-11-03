import { FeedingSide } from './constants.js';

const getSessions = (unit) => (Array.isArray(unit.sessions) ? unit.sessions : []);

const getUnitDuration = (unit) =>
    getSessions(unit).reduce((sum, session) => sum + (session?.duration ?? 0), 0);

const getSideDuration = (unit, side) =>
    getSessions(unit)
        .filter((session) => session?.side === side)
        .reduce((sum, session) => sum + (session?.duration ?? 0), 0);

const getUnitType = (unit) => {
    const type = typeof unit?.type === 'string' ? unit.type.toLowerCase() : null;
    if (type === 'bottle') {
        return 'Bottle';
    }
    return 'Breast';
};

// Ounces; fall back to mL→oz conversion for legacy entries
const getBottleVolumeOz = (unit) => {
    if (getUnitType(unit) !== 'Bottle') return 0;
    const oz = Number(unit?.volumeOz);
    if (Number.isFinite(oz)) return oz;
    const ml = Number(unit?.volumeMl ?? 0);
    return Number.isFinite(ml) ? ml / 29.5735 : 0;
};

/**
 * Calculates feeding statistics for a specific date.
 *
 * @param {Array} history - Array of feed units
 * @param {Date|number} targetDate - Target date to calculate stats for
 * @returns {Object} Stats object with totalFeeds, totalTime, leftTime, rightTime, avgDuration, longestFeed, shortestFeed
 */
export function calculateDailyStats(history, targetDate) {
    const today = new Date(targetDate);
    today.setHours(0, 0, 0, 0);

    const todayFeeds = history.filter((unit) => {
        const feedDate = new Date(unit.endTime);
        feedDate.setHours(0, 0, 0, 0);
        return feedDate.getTime() === today.getTime();
    });

    const totalFeeds = todayFeeds.length;
    const totalTime = todayFeeds.reduce((sum, unit) => sum + getUnitDuration(unit), 0);
    const leftTime = todayFeeds.reduce(
        (sum, unit) => sum + getSideDuration(unit, FeedingSide.Left),
        0
    );
    const rightTime = todayFeeds.reduce(
        (sum, unit) => sum + getSideDuration(unit, FeedingSide.Right),
        0
    );

    // Calculate additional stats
    const durations = todayFeeds.map((unit) => getUnitDuration(unit));
    const avgDuration = totalFeeds > 0 ? Math.round(totalTime / totalFeeds) : 0;
    const longestFeed = durations.length > 0 ? Math.max(...durations) : 0;
    const shortestFeed = durations.length > 0 ? Math.min(...durations) : 0;

    return { totalFeeds, totalTime, leftTime, rightTime, avgDuration, longestFeed, shortestFeed };
}

/**
 * Calculates hourly feeding patterns for a specific date (8 x 3-hour time blocks).
 *
 * @param {Array} history - Array of feed units
 * @param {Date|number} targetDate - Target date to calculate stats for
 * @returns {Object} Stats with blocks array, mostActiveBlock, and daily totals
 */
export function calculateHourlyStats(history, targetDate) {
    const today = new Date(targetDate);
    today.setHours(0, 0, 0, 0);

    const todayFeeds = history.filter((unit) => {
        const feedDate = new Date(unit.endTime);
        feedDate.setHours(0, 0, 0, 0);
        return feedDate.getTime() === today.getTime();
    });

    // Create 8 time blocks (3-hour intervals)
    const timeBlocks = [
        { label: '12-3am', startHour: 0, endHour: 3 },
        { label: '3-6am', startHour: 3, endHour: 6 },
        { label: '6-9am', startHour: 6, endHour: 9 },
        { label: '9-12pm', startHour: 9, endHour: 12 },
        { label: '12-3pm', startHour: 12, endHour: 15 },
        { label: '3-6pm', startHour: 15, endHour: 18 },
        { label: '6-9pm', startHour: 18, endHour: 21 },
        { label: '9-12am', startHour: 21, endHour: 24 },
    ];

    const blocks = timeBlocks.map((block) => ({
        ...block,
        feedCount: 0,
        duration: 0,
        bottleOz: 0,
    }));

    // Aggregate feeds into time blocks
    todayFeeds.forEach((unit) => {
        const feedDate = new Date(unit.endTime);
        const hour = feedDate.getHours();
        const blockIndex = Math.floor(hour / 3);
        const duration = getUnitDuration(unit);
        const bottleOz = getBottleVolumeOz(unit);

        blocks[blockIndex].feedCount += 1;
        blocks[blockIndex].duration += duration;
        blocks[blockIndex].bottleOz += bottleOz;
    });

    // Find most active block
    let mostActiveBlock = blocks[0].label;
    let maxFeeds = blocks[0].feedCount;
    blocks.forEach((block) => {
        if (block.feedCount > maxFeeds) {
            maxFeeds = block.feedCount;
            mostActiveBlock = block.label;
        }
    });

    // Calculate overall stats using existing function
    const dailyStats = calculateDailyStats(history, targetDate);

    return {
        blocks,
        mostActiveBlock: maxFeeds > 0 ? mostActiveBlock : null,
        ...dailyStats,
    };
}

/**
 * Calculates feeding statistics for a specific month.
 *
 * @param {Array} history - Array of feed units
 * @param {number} currentMonth - Month (0-11)
 * @param {number} currentYear - Year (e.g., 2025)
 * @returns {Object} Stats with totalFeeds, avgFeedsPerDay, mostActiveDay, dailyTotals array
 */
export function calculateMonthlyStats(history, currentMonth, currentYear) {
    const monthFeeds = history.filter((unit) => {
        const feedDate = new Date(unit.endTime);
        return feedDate.getMonth() === currentMonth && feedDate.getFullYear() === currentYear;
    });

    if (monthFeeds.length === 0) {
        return {
            totalFeeds: 0,
            totalTime: 0,
            avgFeedsPerDay: 0,
            leftTime: 0,
            rightTime: 0,
            mostActiveDay: null,
            dailyTotals: [],
        };
    }

    const totalFeeds = monthFeeds.length;
    const totalTime = monthFeeds.reduce((sum, unit) => sum + getUnitDuration(unit), 0);

    const leftTime = monthFeeds.reduce(
        (sum, unit) => sum + getSideDuration(unit, FeedingSide.Left),
        0
    );

    const rightTime = monthFeeds.reduce(
        (sum, unit) => sum + getSideDuration(unit, FeedingSide.Right),
        0
    );

    const uniqueDays = new Set(
        monthFeeds.map((unit) => {
            const date = new Date(unit.endTime);
            return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        })
    ).size;
    const avgFeedsPerDay = (totalFeeds / uniqueDays).toFixed(1);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyTotals = Array.from({ length: daysInMonth }, (_, index) => ({
        day: index + 1,
        feedCount: 0,
        totalDurationSeconds: 0,
        bottleOz: 0,
    }));

    monthFeeds.forEach((unit) => {
        const feedDate = new Date(unit.endTime);
        const dayIndex = feedDate.getDate() - 1;
        const totalDuration = getUnitDuration(unit);
        const bottleOz = getBottleVolumeOz(unit);

        if (!dailyTotals[dayIndex]) return;

        dailyTotals[dayIndex].feedCount += 1;
        dailyTotals[dayIndex].totalDurationSeconds += totalDuration;
        dailyTotals[dayIndex].bottleOz += bottleOz;
    });

    // Find most active day
    let mostActiveDay = null;
    let maxFeeds = 0;
    dailyTotals.forEach((day) => {
        if (day.feedCount > maxFeeds) {
            maxFeeds = day.feedCount;
            mostActiveDay = day.day;
        }
    });

    return {
        totalFeeds,
        totalTime,
        avgFeedsPerDay,
        leftTime,
        rightTime,
        mostActiveDay: maxFeeds > 0 ? mostActiveDay : null,
        dailyTotals,
    };
}

/**
 * Calculates feeding statistics for a specific year.
 *
 * @param {Array} history - Array of feed units
 * @param {number} year - Year (e.g., 2025)
 * @returns {Object} Stats with totalFeeds, avgFeedsPerMonth, mostActiveMonth, monthlyTotals array
 */
export function calculateYearlyStats(history, year) {
    const yearFeeds = history.filter((unit) => {
        const feedDate = new Date(unit.endTime);
        return feedDate.getFullYear() === year;
    });

    if (yearFeeds.length === 0) {
        return {
            totalFeeds: 0,
            totalTime: 0,
            avgFeedsPerMonth: 0,
            leftTime: 0,
            rightTime: 0,
            mostActiveMonth: null,
            monthlyTotals: [],
        };
    }

    const monthLabels = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    const monthlyTotals = Array.from({ length: 12 }, (_, index) => ({
        month: index,
        label: monthLabels[index],
        feedCount: 0,
        totalDurationSeconds: 0,
        bottleOz: 0,
    }));

    yearFeeds.forEach((unit) => {
        const feedDate = new Date(unit.endTime);
        const monthIndex = feedDate.getMonth();
        const totalDuration = getUnitDuration(unit);
        const bottleOz = getBottleVolumeOz(unit);

        monthlyTotals[monthIndex].feedCount += 1;
        monthlyTotals[monthIndex].totalDurationSeconds += totalDuration;
        monthlyTotals[monthIndex].bottleOz += bottleOz;
    });

    const totalFeeds = yearFeeds.length;
    const totalTime = yearFeeds.reduce((sum, unit) => sum + getUnitDuration(unit), 0);

    const leftTime = yearFeeds.reduce(
        (sum, unit) => sum + getSideDuration(unit, FeedingSide.Left),
        0
    );

    const rightTime = yearFeeds.reduce(
        (sum, unit) => sum + getSideDuration(unit, FeedingSide.Right),
        0
    );

    const monthsWithFeeds = monthlyTotals.filter((m) => m.feedCount > 0).length;
    const avgFeedsPerMonth = monthsWithFeeds > 0 ? (totalFeeds / monthsWithFeeds).toFixed(1) : 0;

    // Find most active month
    let mostActiveMonth = null;
    let maxFeeds = 0;
    monthlyTotals.forEach((month) => {
        if (month.feedCount > maxFeeds) {
            maxFeeds = month.feedCount;
            mostActiveMonth = month.label;
        }
    });

    return {
        totalFeeds,
        totalTime,
        avgFeedsPerMonth,
        leftTime,
        rightTime,
        mostActiveMonth: maxFeeds > 0 ? mostActiveMonth : null,
        monthlyTotals,
    };
}
