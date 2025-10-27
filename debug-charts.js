/**
 * Comprehensive debugging script for chart data pipeline
 * Run with: node debug-charts.js
 */

import { FeedingSide } from './src/utils/constants.js';
import { generateSampleData } from './src/data/sampleFeedingData.js';
import {
    calculateHourlyStats,
    calculateMonthlyStats,
    calculateYearlyStats,
} from './src/utils/statistics.js';

console.log('=== CHART DATA PIPELINE DEBUG ===\n');

// TEST 1: Sample Data Generation
console.log('TEST 1: Sample Data Generation');
console.log('Generating sample data...');
const sampleData = generateSampleData();
console.log(`✓ Generated ${sampleData.length} feed units`);
console.log(`✓ Date range: ${new Date(sampleData[sampleData.length - 1].endTime).toLocaleDateString()} to ${new Date(sampleData[0].endTime).toLocaleDateString()}`);

// Check first feed structure
const firstFeed = sampleData[0];
console.log('\nFirst feed structure:');
console.log(JSON.stringify(firstFeed, null, 2));
console.log(`  Sessions: ${firstFeed.sessions.length}`);
console.log(`  Session 1: ${firstFeed.sessions[0].side}, ${firstFeed.sessions[0].duration}s`);
console.log(`  Session 2: ${firstFeed.sessions[1].side}, ${firstFeed.sessions[1].duration}s`);

// Check for any single-session feeds (should be 0)
const singleSessionFeeds = sampleData.filter((unit) => unit.sessions.length === 1);
console.log(`\n✓ Single-session feeds: ${singleSessionFeeds.length} (should be 0)`);

// TEST 2: Today View - Hourly Stats
console.log('\n\nTEST 2: Today View - Hourly Stats');
const today = new Date();
console.log(`Calculating stats for: ${today.toLocaleDateString()}`);

const hourlyStats = calculateHourlyStats(sampleData, today);
console.log(`✓ Total feeds today: ${hourlyStats.totalFeeds}`);
console.log(`✓ Total time today: ${hourlyStats.totalTime}s (${Math.round(hourlyStats.totalTime / 60)}min)`);
console.log(`✓ Left time: ${hourlyStats.leftTime}s`);
console.log(`✓ Right time: ${hourlyStats.rightTime}s`);

console.log('\nTime blocks:');
hourlyStats.blocks.forEach((block) => {
    console.log(
        `  ${block.label}: ${block.feedCount} feeds, ${block.duration}s (${Math.round(block.duration / 60)}min)`
    );
});

// Check for empty blocks
const emptyBlocks = hourlyStats.blocks.filter((b) => b.feedCount === 0);
console.log(`\nEmpty blocks: ${emptyBlocks.length}/8`);

// TEST 3: Chart Data Transformation (Today View)
console.log('\n\nTEST 3: Chart Data Transformation (Today View)');
const todayChartData = hourlyStats.blocks.map((block) => ({
    label: block.label,
    feedCount: block.feedCount,
    duration: block.duration,
}));

console.log('Chart data points:');
todayChartData.forEach((point) => {
    console.log(`  ${point.label}: feedCount=${point.feedCount}, duration=${point.duration}`);
});

// Calculate max values for height percentage
const maxFeedCount = Math.max(...todayChartData.map((p) => p.feedCount));
const maxDuration = Math.max(...todayChartData.map((p) => p.duration));
console.log(`\nMax feedCount: ${maxFeedCount}`);
console.log(`Max duration: ${maxDuration}s`);

// Calculate what the bar heights would be
console.log('\nCalculated bar heights (percentages):');
todayChartData.forEach((point) => {
    const feedCountHeight = (point.feedCount / Math.max(maxFeedCount, 1)) * 100;
    const durationHeight = (point.duration / Math.max(maxDuration, 1)) * 100;
    console.log(
        `  ${point.label}: feedCount=${feedCountHeight.toFixed(1)}%, duration=${durationHeight.toFixed(1)}%`
    );
});

// TEST 4: Daily View - Monthly Stats
console.log('\n\nTEST 4: Daily View - Monthly Stats');
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();
console.log(`Calculating stats for: ${today.toLocaleString('default', { month: 'long' })} ${currentYear}`);

const monthlyStats = calculateMonthlyStats(sampleData, currentMonth, currentYear);
console.log(`✓ Total feeds this month: ${monthlyStats.totalFeeds}`);
console.log(`✓ Avg feeds per day: ${monthlyStats.avgFeedsPerDay}`);

// Show first 7 days
console.log('\nFirst 7 days:');
monthlyStats.dailyTotals.slice(0, 7).forEach((day) => {
    console.log(
        `  Day ${day.day}: ${day.feedCount} feeds, ${day.totalDurationSeconds}s (${Math.round(day.totalDurationSeconds / 60)}min)`
    );
});

const daysWithFeeds = monthlyStats.dailyTotals.filter((d) => d.feedCount > 0).length;
console.log(`\nDays with feeds: ${daysWithFeeds}/${monthlyStats.dailyTotals.length}`);

// TEST 5: Monthly View - Yearly Stats
console.log('\n\nTEST 5: Monthly View - Yearly Stats');
console.log(`Calculating stats for: ${currentYear}`);

const yearlyStats = calculateYearlyStats(sampleData, currentYear);
console.log(`✓ Total feeds this year: ${yearlyStats.totalFeeds}`);
console.log(`✓ Avg feeds per month: ${yearlyStats.avgFeedsPerMonth}`);

console.log('\nMonthly totals:');
yearlyStats.monthlyTotals.forEach((month) => {
    console.log(
        `  ${month.label}: ${month.feedCount} feeds, ${month.totalDurationSeconds}s (${Math.round(month.totalDurationSeconds / 60)}min)`
    );
});

const monthsWithFeeds = yearlyStats.monthlyTotals.filter((m) => m.feedCount > 0).length;
console.log(`\nMonths with feeds: ${monthsWithFeeds}/12`);

// TEST 6: Data Type Verification
console.log('\n\nTEST 6: Data Type Verification');
console.log('Checking data types at each step...');
console.log(`  sampleData[0].endTime: ${typeof sampleData[0].endTime} (${sampleData[0].endTime})`);
console.log(`  sampleData[0].sessions[0].duration: ${typeof sampleData[0].sessions[0].duration}`);
console.log(`  hourlyStats.blocks[0].feedCount: ${typeof hourlyStats.blocks[0].feedCount}`);
console.log(`  hourlyStats.blocks[0].duration: ${typeof hourlyStats.blocks[0].duration}`);
console.log(`  todayChartData[0].feedCount: ${typeof todayChartData[0].feedCount}`);
console.log(`  todayChartData[0].duration: ${typeof todayChartData[0].duration}`);

// TEST 7: Edge Case - What if all data is old?
console.log('\n\nTEST 7: Edge Case Testing');
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStats = calculateHourlyStats(sampleData, yesterday);
console.log(`Yesterday's feeds: ${yesterdayStats.totalFeeds}`);

const oldDate = new Date(today);
oldDate.setMonth(oldDate.getMonth() - 6); // 6 months ago
const oldStats = calculateHourlyStats(sampleData, oldDate);
console.log(`Feeds from 6 months ago: ${oldStats.totalFeeds}`);

console.log('\n=== DEBUG COMPLETE ===');
console.log(
    '\nIf all values above are > 0, the data pipeline is working correctly and the issue is in the React rendering.'
);
console.log(
    'If any values are 0 or undefined, that indicates where the data is being lost in the pipeline.'
);
