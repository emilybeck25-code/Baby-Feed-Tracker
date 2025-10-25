# Baby Feed Tracker

Because your baby has a feeding schedule and your boobs deserve a project manager.

## Why moms love it
- Swipe-friendly left/right timer so you always know which side is up to bat.
- Auto-pairs feeds within 10 minutes, because sometimes the other boob was just waiting for its encore.
- Pretty daily and monthly dashboards that translate cluster feeds into real numbers (and sanity).
- Local notifications that nudge you before hangry shrieks begin.
- Works offline and saves to your device, so no stranger is reading your milk memoirs.

## What it actually does for you
- **One-tap timer for L/R sessions** - Hit `L` or `R` to start, tap again to log, no spreadsheets required.
- **Smart history timeline** - Swipe entries to delete, see sessions grouped by Today/Yesterday, and spot those 3 AM half-asleep feeds.
- **Daily stats at a glance** - Totals for feeds and minutes per side help you answer "Did she eat enough?" without panic-Googling.
- **Monthly trend charts** - Visual bar charts show your feeding rhythm and total minutes so you can brag about that cluster-feed marathon like the champ you are.
- **Feed reminders** - Set a timer (hours + minutes) that rings even if you crash for a nap; clear it anytime.
- **Last-feed countdown** - Big friendly clock shows how long it has been since baby latched, so you can finish your coffee in peace (for once).

## Install it on your phone (PWA style)
1. Open the app in your mobile browser.
2. Add it to your home screen (it behaves just like an app, even offline).
3. Grant notification permission if you want reminders to ping you when it's go-time again.

## For the sleep-deprived developer in you
```bash
npm install
npm run dev
```
Visit the printed URL (usually `http://localhost:5173`) and start tapping.

## Tech under the hood
- Vite + React 19 for a snappy interface.
- Tailwind CSS for the soothing pastel vibes.
- LocalStorage keeps history on your device; no accounts, no leaks, no worries.
- PWA support with `vite-plugin-pwa` so it works offline and feels native.

## A quick note
This tracker is meant to back up your instincts, not replace them. Call your pediatrician or lactation consultant when something feels off -- poop jokes aside, you know your baby best. <3
