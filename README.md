# 🍼 Baby Feed Tracker

Because your baby has a feeding schedule and your boobs deserve a project manager with sparkles.

## 💖 Why parents love it
- 🫶 Swipe-friendly left/right timer so you always know which side is up to bat.
- ⏯️ Pause and resume mid-feed without losing the countdown when baby needs a burp break.
- 🕓 Big, friendly countdown that tells you exactly how long it has been since the last latch.
- 💾 Works offline, saves privately to your device, and keeps your milk memoirs yours alone.
- 🌈 Pastel UI that stays awake during feeds (thanks, wake lock!) and feels soothing at 3 AM.
- 🔔 Local reminders so hangry shrieks never catch you off guard.

## ✨ Feature highlights
- ⏱️ **One-tap L/R timer with pause + finish flow** – Tap `L` or `R` to start, pause when needed, finish the set when baby switches sides, and let the app auto-complete the opposite boob if you forget.
- 🔁 **Auto-paired sessions within 10 minutes** – Never wonder if that 2 AM side swap really saved; the tracker keeps both sessions together.
- 🧠 **Smart side suggestions** – Get a gentle glow on the side the tracker recommends starting on next.
- 👋 **Swipeable history timeline** – Logbook groups entries by Today/Yesterday, supports swipe-to-delete, and shows each side’s duration at a glance.
- ⏳ **Live “since last feed” ticker** – A jumbo timer lives on the home screen so you can sip coffee with confidence.
- 📊 **Triple-view dashboards** – Flip between Today (3-hour blocks), Daily (day-by-day in the month), and Monthly (month-by-month) to see counts, minutes, averages, and which time slot or month wins the feeding trophy.
- 💡 **Smart insights & dual-metric charts** – Dual bars visualize feed count vs. time, and highlight your most active block/day/month for quick bragging rights.
- 🔔 **Custom feed reminders** – Pick hours + minutes, get a notification precisely when the next snack should happen, and clear it anytime.
- 🛟 **Wake-lock powered sessions** – The screen stays on while a feed runs, so you’re not poking your phone with one free finger.
- 🎁 **Instant sample data** – Pop open the developer menu (hamburger icon) and import three months of realistic feeds to explore dashboards without waiting for baby.
- 📱 **PWA magic** – Add it to your home screen; it behaves like a native app even with airplane mode on.

## 🌟 Fresh sprinkles in this build
- 📈 Summary page with Today/Daily/Monthly toggle, stat cards, and quick date navigation controls.
- 🎨 Dual-metric chart that layers feed counts and total minutes on every view.
- 💡 Insight pill that calls out your most active time block when data is available.
- 🔄 Auto wake-lock handling so timers keep glowing without touching the screen.
- ⏯️ Pause/resume toggle on the active side plus a Finish flow that captures both sides accurately.
- 🎁 Developer menu import for instant demo data (90 days of realistic sessions).
- 🧺 Refined swipe-to-delete logbook that auto-closes on removal.

## 🧭 App navigation
- **Tracker** – Start, pause, resume, and finish feeds on either side, watch the “since last feed” ticker, swipe entries to delete, and clear history when you’re idle.
- **Summary** – Switch between Today, Daily, and Monthly views to compare feed counts and total duration; charts highlight the busiest slot and an insight pill surfaces the most active block.
- **Notify** – Request Notification permission, set hour + minute offsets from the last feed, and clear reminders whenever plans change.

## 🧁 Sample data & storage
- 📥 Use the hamburger Developer menu to import 90 days of realistic sample sessions for demos or screenshots.
- 🧼 Clear history from the Tracker tab when no timer is running; all data lives in `localStorage`, so it never leaves your device unless you export it yourself.

## 📱 Add it to your phone (PWA style)
1. Open the app in your mobile browser.
2. Tap “Add to Home Screen” so it lives next to the rest of your sleepy-parent essentials.
3. Allow notifications if you want gentle nudges when it’s go-time again.

## 🛠️ Local development
Prerequisites: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Visit the server URL (usually `http://localhost:5173`) and start tapping.

```bash
npm run build   # create a production build in dist/
npm run preview # serve the built app locally
```

Need a static preview server instead? `node server.mjs` will serve the output in `dist/`.

## 🧮 Versioning
- The app header shows the current version (pulled from `package.json`) so releases are obvious.
- Use [Semantic Versioning](https://semver.org/)—`MAJOR.MINOR.PATCH`—when you ship new features, fixes, or breaking changes.
- **Contributors (human or LLM): bump `package.json`'s `version` before merging behavior changes** so the UI and docs stay in sync.

## ✅ Quality checks
- `npm run test` – Run the Vitest suite in CI mode.
- `npm run test:watch` – Keep Vitest watching while you iterate.
- `npm run test:coverage` – Generate coverage output for components and utilities.
- `npm run lint` / `npm run lint:fix` – ESLint with React, hooks, and JSX a11y rules.
- `npm run format:check` / `npm run format` – Prettier formatting guardrails for JS/JSX/CSS.

## 🧰 Tech under the hood
- ⚡ Vite 7 + React 19 keep everything snappy.
- 🎨 Tailwind CSS paints the soothing gradients.
- 💾 LocalStorage guards your timeline—no accounts, no leaks.
- 📦 `vite-plugin-pwa` turns the build into an offline-ready progressive web app.
- 🧪 Vitest and Testing Library power component-level confidence.

## 🤓 Developer goodies
- 🎚️ Developer menu (hamburger icon) to import or reset sample data instantly.
- 📊 Debug logging sprinkled around statistics and chart code for easier tracing while iterating.

## 🥰 Gentle reminder
This tracker backs up your instincts, not replaces them. Call your pediatrician or lactation consultant whenever something feels off—you know your baby best, snuggles and all. 💕
