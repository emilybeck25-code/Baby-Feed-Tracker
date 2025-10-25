import { formatTimerDisplay } from '../utils/timeFormatting.js';

export function TimerDisplay({ seconds }) {
    return formatTimerDisplay(seconds);
}
