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

# Testing
npm test             # Run tests once with Vitest
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # Lint code with ESLint
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## Architecture

### State Management

State is managed via React hooks with no external state library:

- **`useTimer`** (`src/hooks/useTimer.js`): Manages timer state for active feeding sessions
  - Uses timestamp-based duration calculation (not interval-based) for accuracy
  - Acquires screen wake lock during feeding to prevent screen timeout
  - Returns feed object with `{ side, duration, endTime }` when stopped

- **`useFeedingHistory`** (`src/hooks/useFeedingHistory.js`): Manages feeding history and localStorage sync
  - Auto-pairs opposite-side feeds within 10 minutes into single units
  - Auto-completes unpaired feeds (adds 0-duration opposite side) after 10 minutes
  - History is always sorted newest-first

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
  id: string,              // unique ID
  sessions: [Feed Session, Feed Session?],
  endTime: number          // timestamp of most recent session
}
```

History array contains Feed Units, stored newest-first.

### Feed Pairing Logic

Located in `src/utils/feedLogic.js`:

- Feeds from opposite sides within 10 minutes are paired into a single unit
- Same-side feeds always create separate units
- Units with 2 sessions cannot accept more sessions
- The 10-minute window (`TEN_MINUTES_MS` in `src/utils/constants.js`) is measured from the previous unit's `endTime`

### Page Structure

- **TrackerPage**: Timer controls (L/R buttons), history log, last-feed countdown
- **DailySummaryPage**: Today's stats (total feeds, left/right time)
- **MonthlySummaryPage**: Bar charts showing feeds and minutes per day
- **NotificationsPage**: Set reminder timer (hours + minutes)

Navigation is via fixed bottom nav in `App.jsx`.

### LocalStorage Schema

- `feedingHistory`: Array of Feed Units (JSON)
- `reminderTime`: Timestamp for next reminder (number)

### Notifications

Notifications are managed via the Notifications API. Permission is requested when the user first sets a reminder. Reminders trigger browser notifications even when the app is backgrounded.

### Testing

Uses Vitest with tests organized in `src/utils/__tests__/`:
- `feedLogic.test.js` - Feed grouping logic (10-minute pairing rules) and data structure integrity
- `timeFormatting.test.js` - Timer display formatting
- `statistics.test.js` - Daily statistics calculation

Configuration in `vitest.config.js` with jsdom environment for browser API testing (localStorage, navigator).

Run with `npm test` (or `npm run test:watch` for watch mode).

### Code Quality Tools

- **ESLint**: Configured in `.eslintrc.cjs` with React, React Hooks, and JSX a11y plugins
- **Prettier**: Configured in `.prettierrc` (4-space indent, single quotes, 100 print width)
- Code is automatically formatted and follows consistent style guidelines

### Deployment

Deployed to GitHub Pages with base path `/Baby-Feed-Tracker/` configured in `vite.config.js`.

## Key Constraints

- No backend or authentication
- All data stored locally in browser
- Must work offline (PWA with service worker via `vite-plugin-pwa`)
- Screen wake lock keeps display on during feeding sessions
