# 🍼 Baby Feed Tracker

Because your baby has a feeding schedule and your boobs deserve a project manager with sparkles.

## 💖 Why parents love it
- 🫶 Swipe-friendly left/right timer so you always know which side is up to bat.
- 🕓 Big, friendly countdown that tells you exactly how long it has been since the last latch.
- 💾 Works offline, saves privately to your device, and keeps your milk memoirs yours alone.
- 🌈 Pastel UI that stays awake during feeds (thanks, wake lock!) and feels soothing at 3 AM.
- 🔔 Local reminders so hangry shrieks never catch you off guard.

## ✨ Feature highlights
- ⏱️ **One-tap L/R timer with finish flow** – Tap `L` or `R` to start, finish the set when baby switches sides, and let the app auto-complete the opposite boob if you forget.
- 🍼 **Auto-paired sessions within 10 minutes** – Never wonder if that 2 AM side swap really saved; the tracker keeps both sessions together.
- 👋 **Swipeable history timeline** – Logbook groups entries by Today/Yesterday, supports swipe-to-delete, and shows each side’s duration at a glance.
- ⏳ **Live “since last feed” ticker** – A jumbo timer lives on the home screen so you can sip coffee with confidence.
- 📊 **Triple-view dashboards** – Flip between Today (3-hour blocks), Daily (day-by-day in the month), and Monthly (month-by-month) to see counts, minutes, averages, and which time slot or month wins the feeding trophy.
- 💡 **Smart insights & dual-metric charts** – Dual bars visualize feed count vs. time, and highlight your most active block/day/month for quick bragging rights.
- 🔔 **Custom feed reminders** – Pick hours + minutes, get a notification precisely when the next snack should happen, and clear it anytime.
- 🛟 **Wake-lock powered sessions** – The screen stays on while a feed runs, so you’re not poking your phone with one free finger.
- 🎁 **Instant sample data** – Pop open the developer menu (hamburger icon) and import three months of realistic feeds to explore dashboards without waiting for baby.
- 📱 **PWA magic** – Add it to your home screen; it behaves like a native app even with airplane mode on.

## 🌟 Fresh sprinkles in this build
- 📈 New Summary page with Today/Daily/Monthly toggle, stat cards, and arrow-key date travel.
- 🎨 Dual-metric chart that layers feed counts and total minutes on every view.
- 💡 Insight pill that calls out your most active time block when data is available.
- 🔄 Auto wake-lock handling so timers keep glowing without touching the screen.
- 🎁 Developer menu import for instant demo data (90 days of realistic sessions).
- 🧺 Refined swipe-to-delete logbook that auto-closes on removal.

## 📱 Add it to your phone (PWA style)
1. Open the app in your mobile browser.
2. Tap “Add to Home Screen” so it lives next to the rest of your sleepy-parent essentials.
3. Allow notifications if you want gentle nudges when it’s go-time again.

## 🛠️ Run it locally
```bash
npm install
npm run dev
```
Visit the server URL (usually `http://localhost:5173`) and start tapping.

## 🧰 Tech under the hood
- ⚡ Vite + React 19 keep everything snappy.
- 🎨 Tailwind CSS paints the soothing gradients.
- 💾 LocalStorage guards your timeline—no accounts, no leaks.
- 📦 `vite-plugin-pwa` turns the build into an offline-ready progressive web app.

## 🤓 Developer goodies
- 🎚️ Developer menu (hamburger icon) to import or reset sample data instantly.
- 🧪 Vitest setup ready for unit tests.
- 📊 Debug logging sprinkled around statistics and chart code for easier tracing while iterating.

## 🥰 Gentle reminder
This tracker backs up your instincts, not replaces them. Call your pediatrician or lactation consultant whenever something feels off—you know your baby best, snuggles and all. 💕
