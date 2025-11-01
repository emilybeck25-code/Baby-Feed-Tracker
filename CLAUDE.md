# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Baby Feed Tracker is a PWA for tracking breastfeeding sessions. It uses React 19 + Vite with Tailwind CSS, stores data locally in localStorage, and operates entirely offline.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build

# Code Quality
npm run lint         # Lint code with ESLint
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Testing
npm test             # Run tests in src/utils/__tests__/
```

## Architecture

### Project Structure

The app follows React best practices with clear separation of concerns:

```
src/
├── components/
│   ├── icons/       # Reusable SVG icon components (Clock, Stop, Pause, Play, etc.)
│   ├── layout/      # Header and BottomNav components
│   ├── feed/        # FeedButton and FeedControls (button logic)
│   └── [other]      # HistoryLog, TimerDisplay, StatCard, MiniBarChart, etc.
├── contexts/
│   └── FeedingContext.jsx  # Centralized state via Context API
├── hooks/
│   ├── useTimer.js          # Timer state with wake lock
│   ├── useFeedingHistory.js # History with localStorage sync
│   └── useWakeLock.js       # Screen wake lock management
├── pages/
│   ├── TrackerPage.jsx
│   ├── SummaryPage.jsx
│   └── NotificationsPage.jsx
├── utils/
│   ├── feedLogic.js      # Feed pairing logic
│   ├── statistics.js     # Stats calculations
│   ├── timeFormatting.js # Time display utilities
│   └── constants.js
└── data/
    └── sampleFeedingData.js  # Sample data generator
```

### State Management

State is managed via **FeedingContext** (`src/contexts/FeedingContext.jsx`):
- Wraps `useTimer` and `useFeedingHistory` hooks
- Provides centralized state to all components via `useFeedingContext()`
- Eliminates prop drilling throughout the app

**`useTimer`** (`src/hooks/useTimer.js`):
- Manages timer state for active feeding sessions
- Uses timestamp-based duration calculation (not interval-based) for accuracy
- Persists active timer to localStorage to survive app backgrounding/closing
- Acquires screen wake lock during feeding to prevent screen timeout
- Hydrates timer state on mount from localStorage if timer was active
- Returns feed object with `{ side, duration, endTime }` when stopped

**`useFeedingHistory`** (`src/hooks/useFeedingHistory.js`):
- Manages feeding history and localStorage sync
- Adds "pending" feed units (with 0-duration placeholder) when timer starts
- Pairs opposite-side feeds into single units based on user actions
- Supports cross-tab sync via storage events
- History is always sorted newest-first
- Exports `addPendingFeed()` to create placeholder entries

### Data Model

**Feed Session**: Single feeding event
```js
{
  side: 'Left' | 'Right',
  duration: number,        // seconds
  endTime: number          // timestamp (ms)
}
```

**Feed Unit**: 1 or 2 sessions grouped together
```js
{
  id: string,              // unique ID (or 'pending-{timestamp}' for placeholders)
  sessions: [Feed Session, Feed Session?],
  endTime: number          // timestamp of most recent session
}
```

History array contains Feed Units, stored newest-first.

### Feed Pairing Logic

Located in `src/utils/feedLogic.js` and `src/components/feed/FeedControls.jsx`:

**Pairing Rules:**
- When timer starts, a "pending" feed unit is added to history (with 0-duration placeholder)
- When timer stops, pending unit is replaced with actual feed data
- Opposite-side feeds are paired into existing single-session units
- Same-side feeds always create separate units
- Units with 2 sessions cannot accept more sessions
- No time-based auto-pairing

**Button Flow:**
1. Click L/R → starts timer, shows Stop (on active) + Pause (on opposite), creates pending unit
2. Click Stop → saves session, replaces pending unit, shows "Finish" button
3. Click "Finish" → saves with 0-duration opposite side
4. OR click opposite side → starts second timer
5. Stop second timer → pairs both sessions into single unit

### Page Structure

- **TrackerPage**: Timer controls (L/R buttons), history log, last-feed countdown
- **SummaryPage**: Unified dashboard with three toggle views:
  - **Today**: Hourly patterns (8 x 3-hour time blocks), avg/longest feed duration
  - **Daily**: Days of current month (1-31), avg feeds per day, peak day
  - **Monthly**: Months of current year (Jan-Dec), avg feeds per month, peak month
  - Each view shows dual-metric charts (feed count + duration side-by-side) with date navigation
- **NotificationsPage**: Set reminder timer (hours + minutes)

Navigation is via fixed bottom nav in `App.jsx` (Tracker | Summary | Notify).

### LocalStorage Schema

- `feedingHistory`: Array of Feed Units (JSON)
- `activeTimer`: Current timer state for persistence across app restarts (JSON)
- `reminderTime`: Timestamp for next reminder (number)

### Notifications

Notifications are managed via the Notifications API. Permission is requested when the user first sets a reminder. Reminders trigger browser notifications even when the app is backgrounded.

### Statistics Utilities

Located in `src/utils/statistics.js`:

- **`calculateDailyStats`**: Returns total feeds, total time, left/right time, avg/longest/shortest duration
- **`calculateHourlyStats`**: Aggregates feeds into 8 three-hour time blocks, identifies most active block
- **`calculateMonthlyStats`**: Aggregates by day of month (1-31), returns avg feeds per day and peak day
- **`calculateYearlyStats`**: Aggregates by month (Jan-Dec), returns avg feeds per month and peak month

All functions accept history array and date/period parameters, return 0 values when no data exists.

### Key Components

**Layout:**
- **`Header`**: App title, version badge, developer menu
- **`BottomNav`**: Fixed navigation bar with icons (Tracker | Summary | Notify)

**Feed Controls:**
- **`FeedButton`**: Single L/R button with dynamic icon (Stop/Pause/Play/"Finish"/"L"/"R")
- **`FeedControls`**: Manages both buttons and all feeding flow logic

**Display:**
- **`MiniBarChart`**: Side-by-side bars for feed count + duration with gradients
- **`StatCard`**: Single statistic with title and value
- **`TimerDisplay`**: Formats seconds into MM:SS display
- **`HistoryLog`**: Swipeable feed history with delete and clear functions
- **`LastFeedElapsed`**: Shows time elapsed since last feed

**Icons:**
- All SVG icons extracted to `src/components/icons/` for reusability
- Includes: ClockIcon, StopIcon, PauseIcon, PlayIcon, ChartIcon, BellIcon, MenuIcon

### Code Quality Tools

- **ESLint**: Configured in `eslint.config.js` (flat config format for ESLint 9) with React, React Hooks, and JSX a11y plugins
- **Prettier**: Configured in `.prettierrc` (4-space indent, single quotes, 100 print width)
- Code is automatically formatted and follows consistent style guidelines

### Deployment

Deployed to GitHub Pages with base path `/Baby-Feed-Tracker/` configured in `vite.config.js`.

### PWA Update Strategy

The app uses `vite-plugin-pwa` with the following update mechanism to ensure installed PWAs receive updates:

**Configuration** (`vite.config.js`):
- `registerType: 'autoUpdate'` - Automatically activates new service workers
- Forces `skipWaiting()` and `clientsClaim()` for immediate updates

**Update Detection** (`src/main.jsx`):
- Imports `virtual:pwa-register` module to programmatically control service worker
- Checks for updates every 60 seconds via `registration.update()`
- This works around GitHub Pages' HTTP cache headers (10-minute cache on sw.js)

**How Updates Work**:
1. Every 60 seconds, the app calls `registration.update()` to force a network fetch of `sw.js`
2. Browser compares new `sw.js` byte-by-byte with current version
3. If changed, new service worker installs and immediately activates (`skipWaiting`)
4. New worker takes control of all pages (`clientsClaim`)
5. PWA automatically reloads to use new assets

**Why This is Needed**:
- GitHub Pages serves files with cache headers that browsers respect for up to 24 hours
- Without periodic `registration.update()` calls, installed PWAs would only check for updates on app launch after 24+ hours
- The 60-second interval ensures updates are detected within ~1 minute of deployment

**Alternative Approach**:
For production deployments on platforms with cache header control (Vercel, Netlify), set `cache-control: max-age=0, must-revalidate` on `sw.js` and `index.html`, then remove the 60-second interval.

## Key Constraints

- No backend or authentication
- All data stored locally in browser
- Must work offline (PWA with service worker via `vite-plugin-pwa`)
- Screen wake lock keeps display on during feeding sessions
