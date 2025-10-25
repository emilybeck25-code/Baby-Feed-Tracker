import { formatTimerDisplay } from '../utils/timeFormatting';

export function TimerDisplay({ seconds }) {
    return formatTimerDisplay(seconds);
}
