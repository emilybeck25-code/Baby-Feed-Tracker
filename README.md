# 🍼 Baby Feed Tracker

Baby Feed Tracker keeps nursing sessions organized so you can focus on caring for your baby instead of juggling overlapping timers.

## 💖 Why parents rely on it
- 🫶 Quick left/right timer controls make it easy to record which side was last.
- ⏯️ Pause or resume mid-feed without losing the session when you need to burp or switch positions.
- 🕓 A prominent “time since last feed” timer answers the question every tired parent keeps asking.
- 💾 Data stays on your device, works offline, and can be cleared whenever you choose.
- 🌈 Calm UI that stays awake during feeds, even in the middle of the night.
- 🔔 Local reminders help you stay ahead of the next hungry moment.

## ✨ Feature highlights
- ⏱️ **One-tap L/R timer with pause and finish flow** – Start a side, pause if needed, then finish when you switch; the app fills in the opposite side if you forget.
- 🔁 **Auto-paired sessions within 10 minutes** – Sessions that belong together are grouped automatically.
- 🧠 **Smart side suggestions** – A subtle indicator suggests the next side to begin with based on recent history.
- 👋 **Swipeable history timeline** – Today/Yesterday grouping, swipe-to-delete, and a snapshot of each side’s duration.
- ⏳ **Live “since last feed” ticker** – A jumbo timer stays visible on the home screen.
- 📊 **Three dashboards** – Review Today (3-hour blocks), Daily (per day), and Monthly (per month) views with counts, minutes, averages, and standout periods.
- 💡 **Insights & dual-metric charts** – Combined bar charts surface the busiest block/day/month at a glance.
- 🔔 **Custom feed reminders** – Set the next reminder by hours and minutes, dismiss it anytime plans change.
- 🛟 **Wake-lock during active sessions** – The screen stays on so you’re not constantly unlocking your phone.
- 🎁 **Instant sample data** – The developer menu can load three months of realistic data for demos or testing.
- 📱 **PWA support** – Install it on your home screen and keep using it offline.

## 🌟 Recent updates
- 📈 Summary page with Today/Daily/Monthly toggle, stat cards, and quick navigation.
- 🎨 Dual-metric chart layering feed counts and total minutes on every view.
- 💡 Insight pill highlighting the most active time block when data is available.
- 🔄 Automatic wake-lock handling so active timers remain visible.
- ⏯️ Pause/resume toggle on the active side plus a Finish flow that records both sides accurately.
- 🎁 Developer menu import for 90 days of sample sessions.
- 🧺 Swipe-to-delete logbook flow that cleanly closes after removal.

## 🧭 App navigation
- **Tracker** – Start, pause, resume, or finish feeds, monitor the “since last feed” ticker, swipe entries to delete, and clear history when no timer is running.
- **Summary** – Compare feed counts and duration across Today, Daily, and Monthly views; charts and insight pills call out high-activity periods.
- **Notify** – Request notification permission, set reminder offsets from the last feed, and clear alerts whenever plans shift.

## 🧁 Sample data & storage
- 📥 Import 90 days of realistic sessions from the developer menu whenever you need demo data.
- 🧼 Clear history from the Tracker tab while idle; everything is stored in `localStorage` and stays on your device unless you export it.

## 📱 Add it to your phone (PWA style)
1. Open the app in your mobile browser.
2. Tap “Add to Home Screen” so it’s ready alongside the rest of your go-to tools.
3. Allow notifications if you want timely nudges for the next feed.

## 🛠️ Local development
Prerequisites: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Visit the server URL (usually `http://localhost:5173`) to start testing the app.

```bash
npm run build   # create a production build in dist/
npm run preview # serve the built app locally
```

Need a static preview server instead? `node server.mjs` serves the `dist/` output.

## 🧮 Versioning
- The app header shows the current version (pulled from `package.json`) so releases are visible to users.
- Use [Semantic Versioning](https://semver.org/)—`MAJOR.MINOR.PATCH`—for feature work, fixes, and breaking changes.
- **Contributors (human or LLM): bump `package.json`'s `version` before merging behavior changes** so the UI and documentation match.

## ✅ Quality checks
- `npm run test` – Run the Vitest suite in CI mode.
- `npm run test:watch` – Keep Vitest watching while iterating.
- `npm run test:coverage` – Generate coverage output for components and utilities.
- `npm run lint` / `npm run lint:fix` – ESLint with React, hooks, and JSX a11y rules.
- `npm run format:check` / `npm run format` – Prettier guardrails for JS/JSX/CSS.

## 🧰 Tech under the hood
- ⚡ Vite 7 + React 19 for quick builds and fast refresh.
- 🎨 Tailwind CSS powers the interface and theming.
- 💾 LocalStorage protects your timeline—no accounts, no syncing.
- 📦 `vite-plugin-pwa` delivers offline-ready behavior.
- 🧪 Vitest and Testing Library cover component-level confidence.

## 🤓 Developer goodies
- 🎚️ Developer menu (hamburger icon) to import or reset sample data in seconds.
- 📊 Debug logging around statistics and charting for easier investigation while iterating.

## 🥰 Gentle reminder
This tracker supports your instincts—it doesn’t replace them. Reach out to your pediatrician whenever something feels off. You know your baby best. 💕
