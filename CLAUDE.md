# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Baby Feed Tracker is a PWA for tracking feeding sessions (breast and bottle). It uses React 19 + Vite with Tailwind CSS, stores data locally in localStorage, and operates entirely offline. Reminders are calendar-first: generate .ics downloads (with alarms/optional repeats) or open Google Calendar; no in-app Notification API timers.

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
│   ├── layout/      # Header, BottomNav, FeedTypeToggle, etc.
│   ├── feed/        # FeedButton, FeedControls, BottleControls (feeding/bottle logic)
│   └── [other]      # HistoryLog, TimerDisplay, StatCard, MiniBarChart, LastFeedElapsed, etc.
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
├── theme/
│   ├── tokens.css    # Theme color/glass variables
│   └── useTheme.js   # Theme management hook
├── utils/
│   ├── feedLogic.js      # Feed pairing logic
│   ├── statistics.js     # Stats calculations
│   ├── timeFormatting.js # Time display utilities
│   ├── constants.js
│   └── ics.js            # ICS downloads (with alarms/rrule) + Google Calendar deep link
└── data/
    └── sampleFeedingData.js  # Sample data generator
```

### State Management

State is managed via **FeedingContext** (`src/contexts/FeedingContext.jsx`):
- Wraps `useTimer` and `useFeedingHistory` hooks
- Provides centralized state to all components via `useFeedingContext()`
- Handles the feed-type toggle (breast ↔ bottle), persisting the selection and blocking changes during an active timer
- Exposes timer control methods (`startTimer`, `togglePause`, `stopTimer`) and history helpers (`addFeed`, `addBottleFeed`, etc.)
- Eliminates prop drilling throughout the app
- Keeps the `completedSession` (first-side stop) in context **and persisted to `localStorage`** (`completedSession` key) so the paired-feed flow survives navigation, refreshes, and backgrounding.
- Enforces a hard 20-minute per-side cap (`MAX_FEED_DURATION_SECONDS`): when `timer.duration` hits the limit, it auto-stops, saves the feed, and toggles `completedSession` exactly like a manual stop so pairing stays intact.
- **Derived view model**: `chronologicalHistory` merges an active timer into the head unit when a paired feed is in progress (`activeSide` + `completedSession`), otherwise it prepends a transient `{ id: 'active', isActive: true, sessions: [{ side, duration, endTime: now }] }` while the timer runs. The persisted `history` remains immutable and contains only completed units.

**`useTimer`** (`src/hooks/useTimer.js`):
- Manages timer state for active feeding sessions
- Uses timestamp-based duration calculation (not interval-based) for accuracy
- Persists active timer to localStorage to survive app backgrounding/closing
- Acquires screen wake lock during feeding to prevent screen timeout
- Hydrates timer state on mount from localStorage if timer was active
- Returns feed object with `{ side, duration, endTime }` when stopped

**`useFeedingHistory`** (`src/hooks/useFeedingHistory.js`):
- Manages feeding history (breast + bottle) and localStorage sync; **only completed units are persisted**
- Pairs opposite-side feeds into single units based on user actions
- Supports cross-tab sync via storage events
- History is always sorted newest-first
- Exports `addBottleFeed()` for bottle volumes

**`useWakeLock`** (`src/hooks/useWakeLock.js`):
- Uses a shared NoSleep.js instance to keep the screen awake on iOS, Android, and desktop browsers
- Activates the wake lock whenever feeding is active and resumes after visibility/user interaction events
- Releases the wake lock when the timer pauses/stops and during unmount to avoid leaks

### Reminders (Calendar-First)

- `src/utils/ics.js` builds VEVENT ICS files with a VALARM firing at (or N minutes before) start time and optional HOURLY `RRULE` support; also exposes `openGoogleCalendar` for prefilled events (UTC).
- `NotificationsPage` lets users pick delay hours/minutes and optional repeat interval/count, then choose **Add to Calendar (.ics)** or **Add to Google Calendar**.
- No in-app/background notifications remain; reliability is delegated to the device calendar.

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
  id: string,              // unique ID for completed units only
  sessions: [Feed Session, Feed Session?],
  endTime: number          // timestamp of most recent session
}
```

History array contains Feed Units, stored newest-first.

**Bottle Entry**: Separate unit stored alongside breast feeds
```js
{
  id: string,
  type: 'Bottle',
  volumeOz: number,        // stored as ounces (1 decimal)
  sessions: [],            // always empty for bottle entries
  endTime: number
}
```

### Feed Pairing Logic

Located in `src/utils/feedLogic.js` and `src/components/feed/FeedControls.jsx`:

**Pairing Rules:**
- History is only mutated when the timer stops (or bottle is added); starting a timer does **not** touch history
- When stopping a timer, the resulting session will merge into the most recent history unit iff:
  - That head unit is a breastfeed (not bottle)
  - It has exactly one session
  - The new session is the opposite side
- Otherwise, a new unit is prepended. Units with 2 sessions cannot accept more sessions. No time-based auto-pairing.
- The UI’s `chronologicalHistory` prepends a synthetic `{ id: 'active', isActive: true, sessions: [...] }` entry while timing, but if a paired feed is underway (`completedSession` exists) the active session is merged into the head unit for a continuous row. Do not persist or treat the synthetic row as real data.

**CORE BUTTON FLOW (CRITICAL - DO NOT BREAK):**

This is the fundamental user interaction flow. It is **symmetrical** across both L and R buttons.

**Single-Side Feed (with "End" option):**
1. User presses **L** → L becomes "Stop", R becomes "Pause", timer starts, pending unit created
2. User can press Pause/Play on R to pause/resume the L timer (optional)
3. User presses **Stop** (L) → Timer stops, feed saved, `completedSession` set to L feed, L becomes "End", R returns to "R"
4. User presses **End** (L) → Adds 0-duration R session, clears `completedSession`, both buttons return to L/R

**Paired Feed (opposite side after completing first):**
1. User presses **L** → L becomes "Stop", R becomes "Pause", timer starts, pending unit created
2. User can press Pause/Play on R to pause/resume the L timer (optional)
3. User presses **Stop** (L) → Timer stops, feed saved, `completedSession` set to L feed, L becomes "End", R returns to "R"
4. User presses **R** (opposite side) → **`completedSession` stays set (NOT cleared!)**, timer starts R, R becomes "Stop", L becomes "Pause"
5. User can press Pause/Play on L to pause/resume the R timer (optional)
6. User presses **Stop** (R) → Timer stops, R feed pairs with L feed from `completedSession`, both sessions saved together, `completedSession` cleared, both buttons return to L/R with suggested side highlighted

**Key Implementation Rules:**
- When starting opposite side after `completedSession` exists, **DO NOT clear `completedSession`**
- Only clear `completedSession` in two cases:
  1. When stopping the second timer (paired feed complete)
  2. When pressing "End" button (finish with 0-duration opposite side)
- When stopping a timer: if `completedSession` is null, set it; if it exists, clear it (indicates paired feed)
- The flow is **completely symmetrical** - works exactly the same whether starting with L or R

**Common Mistakes That Break This Flow:**
- ❌ **MOST CRITICAL**: Using `sessions.length === 1` to detect pending feeds (single-session feeds are valid completed feeds!)
- ❌ Clearing `completedSession` when starting opposite side (breaks paired feed detection)
- ❌ Not maintaining `completedSession` state between stop and opposite-side start
- ❌ Adding asymmetric logic between L and R button handlers
- ❌ Checking pending status anywhere except by `unit.id?.startsWith('pending-')`

**Testing This Flow:**
Always test these scenarios after any changes to FeedControls.jsx:
1. Start L, stop L, press "End" → Should finish with L only
2. Start L, stop L, start R, stop R → Should pair L+R, both buttons return to L/R
3. Start R, stop R, start L, stop L → Should pair R+L, both buttons return to L/R (symmetry test)
4. Verify "End" button only appears after stopping first side, never after stopping second side

### Auto-Finalize & Double-Tap Guard (FeedControls)

- A `completedSession` left idle for **30 minutes** triggers `autoFinalize`, which adds the opposite side with duration 0 and clears the session. This uses `setTimeout` stored in `finalizeTimeoutRef` and cancels as soon as a timer starts or the opposite side begins.
- On hydration, if the app is idle and the top history unit is a **completed single-session** whose `endTime` is ≥30 minutes old, the opposite side is auto-added immediately so the history stays realistic after long pauses.
- The "End" buttons on both sides now use `endGuardRef` (boolean ref) to ignore rapid double taps while `completedSession` is set, preventing duplicate 0-duration entries. The guard resets whenever `completedSession` becomes `null`.
- `AUTO_FINALIZE_MS` (currently 30 minutes) lives in `FeedControls.jsx`; change this constant only if product requirements change, and keep the hydration effect, timeout scheduling, and guard logic in sync when refactoring.

### Page Structure

- **TrackerPage**: Timer controls (L/R buttons), feed-type toggle, bottle logging form, history log, last-feed countdown
- **SummaryPage**: Unified dashboard with three toggle views:
  - **Today**: Hourly patterns (8 x 3-hour time blocks), avg/longest feed duration
  - **Daily**: Days of current month (1-31), avg feeds per day, peak day
  - **Monthly**: Months of current year (Jan-Dec), avg feeds per month, peak month
  - Each view shows dual-metric charts (feed count + duration side-by-side) with date navigation
- **NotificationsPage**: Calendar-first reminders (.ics with alarm/repeat + Google Calendar link); no in-app notifications

Navigation is via fixed bottom nav in `App.jsx` (Tracker | Summary | Notify).

### LocalStorage Schema

- `feedingHistory`: Array of Feed Units (JSON)
- `activeTimer`: Current timer state for persistence across app restarts (JSON)
- `reminderTime`: Timestamp for next reminder (number)
- `feedType`: Current selection (`'breast'` or `'bottle'`)
- `completedSession`: Paired-feed in-progress marker (first-side session JSON) so the second side can resume after refresh/backgrounding

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
- **`FeedTypeToggle`**: Switch between breast and bottle workflows

**Feed Controls:**
- **`FeedButton`**: Single L/R button with dynamic icon (Stop/Pause/Play/"Finish"/"L"/"R")
- **`FeedControls`**: Manages both buttons and all feeding flow logic
- **`BottleControls`**: Form for logging bottle feeds in ounces

**Display:**
- **`MiniBarChart`**: Side-by-side bars for feed count + duration with gradients
- **`StatCard`**: Single statistic with title and value
- **`TimerDisplay`**: Formats seconds into MM:SS display
- **`HistoryLog`**: Swipeable feed history (breast + bottle) with delete and clear functions
- **`LastFeedElapsed`**: Shows time elapsed since last feed

**Icons:**
- All SVG icons extracted to `src/components/icons/` for reusability
- Consistent stroke-outline style (strokeWidth=2, strokeLinecap/Join round)
- Includes: ClockIcon, StopIcon, PauseIcon, PlayIcon, ChartIcon, BellIcon, MenuIcon

### Code Quality Tools

- **ESLint**: Configured in `eslint.config.js` (flat config format for ESLint 9) with React, React Hooks, and JSX a11y plugins
- **Prettier**: Configured in `.prettierrc` (4-space indent, single quotes, 100 print width)
- Code is automatically formatted and follows consistent style guidelines

### Edge Case Handling & Defensive Mechanisms

The app includes robust defensive logic to handle edge cases:

**Orphaned Pending Unit Cleanup** (`FeedingContext.jsx`):
- Effect monitors when `activeSide === null`
- Automatically removes pending units (ID starts with `'pending-'`) when no timer is active
- Handles scenarios: app crashes, force-closes, unexpected navigation
- Prevents accumulation of broken pending units in history

**Timer Hydration Sync** (`FeedingContext.jsx`):
- Runs once on mount when timer hydrates from localStorage
- If timer is active but no pending unit exists, creates one
- Ensures timer and history remain synchronized after app restart
- Prevents "timer running but no pending feed" state

**Immutable State Updates** (`feedLogic.js`):
- Uses proper object spreading instead of shallow copy + mutation
- Ensures React detects all state changes correctly
- Prevents subtle rendering bugs and stale state

**Pending Units** (Internal-Only):
- Pending units are identified by ID starting with `'pending-'` prefix
- Used internally for feed pairing logic, not displayed in UI
- Created when timer starts, replaced when timer stops
- Cleaned up automatically if orphaned (app crash/force-close)
- Never displayed to user - HistoryLog shows all feeds with time ranges

These mechanisms make the app resilient to crashes, backgrounding, force-closes, and cross-tab sync issues.

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

## Theming & Swipe Actions

### Theming
- App is **locked to pastel theme** in production (theme switcher removed from UI)
- Theme infrastructure remains in codebase for developer use:
  - Theme tokens live in `src/theme/tokens.css` with `[data-theme="name"]` blocks on `<html>`
  - Surfaces semantic variables for brand colors, glass layers, and chart gradients
  - `useTheme.js` hook manages theme state and localStorage persistence
  - THEMES array includes 'pastel', 'midnight', 'contrast'
- Components consume tokens via helpers in `src/index.css` (`.btn-left`, `.btn-right`, `.gradient-chip`, `.heading-gradient`) or CSS variables (e.g. `gradient="var(--chart-count-gradient)"`)
- Rule of thumb: no inline hex codes for branded surfaces; use semantic variables or helper classes

### Swipe Actions
- Swipe rows (`HistoryLog.jsx`) stay as rounded containers with hidden action rails
- Delete rail inherits radius, fades in when row is open, uses `.danger-glass` helper for glass aesthetic

**Checklist before submitting visual changes**
- No hardcoded brand/danger colors in JSX
- `npm run format` / `npm test` pass
- Pastel theme visually unchanged
