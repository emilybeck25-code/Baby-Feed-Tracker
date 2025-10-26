import { describe, test, expect } from 'vitest';
import { formatTimerDisplay } from '../timeFormatting.js';

describe('Timer Display Formatting', () => {
    test('should format seconds correctly (< 1 minute)', () => {
        expect(formatTimerDisplay(45)).toBe('00:45');
    });

    test('should format minutes and seconds correctly', () => {
        expect(formatTimerDisplay(125)).toBe('02:05');
    });

    test('should format hours, minutes, seconds correctly', () => {
        expect(formatTimerDisplay(3665)).toBe('1:01:05');
    });

    test('should pad single digits with zeros', () => {
        expect(formatTimerDisplay(65)).toBe('01:05');
    });

    test('should handle zero', () => {
        expect(formatTimerDisplay(0)).toBe('00:00');
    });

    test('should handle very large duration values', () => {
        const largeSeconds = 7200; // 2 hours
        const display = formatTimerDisplay(largeSeconds);

        expect(display).toBe('2:00:00');
    });
});
