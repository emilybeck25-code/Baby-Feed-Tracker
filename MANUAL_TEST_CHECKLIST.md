# Manual Test Checklist

This checklist covers features that require manual testing due to browser APIs, user interaction, or platform-specific behavior.

## Timer Functionality

### Basic Timer Operations
- [ ] Click L button starts Left timer
- [ ] Click R button starts Right timer
- [ ] Timer displays and increments every second (00:01, 00:02, etc.)
- [ ] Active button turns red
- [ ] Opposite button becomes disabled when timer is active
- [ ] Clicking active button (red) stops the timer
- [ ] Feed is added to history after stopping timer

### Timer Edge Cases
- [ ] Timer continues running when switching to other tabs (Daily, Monthly, Notify)
- [ ] Timer state persists when returning to Tracker tab
- [ ] Timer displays correct format after 1 hour (1:00:00)
- [ ] Multiple rapid start/stops work correctly

## History Display

### Time Formatting
- [ ] Pending feeds show: "HH:MM - Pending..." (no end time)
- [ ] Completed feeds show: "HH:MM - HH:MM"
- [ ] No seconds displayed in history times
- [ ] Times use 12-hour or 24-hour format based on browser locale

### History Organization
- [ ] Feeds grouped by day (Today, Yesterday, day names)
- [ ] "Feeding History" header stays at top (doesn't scroll)
- [ ] History list scrolls independently
- [ ] L feeds show violet badge, R feeds show rose badge
- [ ] Time since last feed displays correctly (e.g., "2h 15m")

### Feed Grouping Display
- [ ] Two opposite-side feeds within 10 minutes show as one unit with 2 badges
- [ ] Feeds more than 10 minutes apart show as separate units
- [ ] Same-side feeds show as separate units regardless of time

## Clear History

- [ ] Clear button is disabled when timer is active
- [ ] Clear button enabled when no timer running
- [ ] Clicking Clear shows confirmation dialog
- [ ] Confirming clears all history
- [ ] Canceling keeps history intact
- [ ] "Feeding History" header disappears when history is empty

## LocalStorage Persistence

- [ ] Add a feed, refresh page → feed still appears
- [ ] Add multiple feeds, close tab, reopen → all feeds appear
- [ ] Clear history, refresh page → history stays empty
- [ ] Start timer, refresh page → timer resets (expected behavior)

## Daily Summary Page

- [ ] Shows "No feeds recorded today" when empty
- [ ] Displays 4 stat cards when feeds exist today
- [ ] Total Feeds count is correct
- [ ] Total Time sums all feed durations correctly
- [ ] Left Side time only includes L feeds
- [ ] Right Side time only includes R feeds
- [ ] Times display in MM:SS or HH:MM:SS format
- [ ] Stats update immediately after adding feed on Tracker page

## Monthly Summary Page

- [ ] Shows "No feeds recorded this month" when empty
- [ ] Displays 2 stat cards when feeds exist this month
- [ ] Total Feeds counts all units this month
- [ ] Avg Feeds/Day calculates correctly (total / unique days)
- [ ] Average shows one decimal place (e.g., "3.5")
- [ ] Feeds from last month don't affect current month stats

## Notifications Page

### Permission Handling
- [ ] Shows yellow warning if notification permission not granted
- [ ] "Enable Notifications" button appears in warning
- [ ] Clicking "Enable Notifications" triggers browser permission prompt
- [ ] Warning disappears after granting permission
- [ ] "Set Reminder" button disabled without permission

### Reminder Functionality
- [ ] "Set Reminder" button disabled when no feeds exist
- [ ] Can input hours and minutes
- [ ] Minutes input limited to 0-59
- [ ] "Set Reminder" creates confirmation message with time
- [ ] Reminder fires at correct time (test with 1 minute delay)
- [ ] Notification shows "Time for the next feed!" message
- [ ] "Clear Reminder" button appears after setting reminder
- [ ] Clicking "Clear Reminder" cancels the notification
- [ ] Setting new reminder replaces old one

## Navigation

- [ ] All 4 tabs clickable (Tracker, Daily, Monthly, Notify)
- [ ] Active tab shows violet color
- [ ] Inactive tabs show gray color
- [ ] Content changes when switching tabs
- [ ] Icons display correctly for each tab
- [ ] Tab labels show correctly

## PWA Installation & Offline Mode

### Installation (iPhone)
- [ ] Open app in Safari
- [ ] Tap Share button
- [ ] "Add to Home Screen" option appears
- [ ] Toggle "Open as Web App" is available
- [ ] After adding, app icon appears on home screen with 🍼 icon
- [ ] Tapping icon opens app in standalone mode (no browser UI)

### Installation (Android)
- [ ] Open app in Chrome
- [ ] "Install app" banner or menu option appears
- [ ] After installing, app appears in app drawer
- [ ] App opens in standalone mode

### Offline Functionality
- [ ] Install app, turn off WiFi and cellular
- [ ] App still opens from home screen
- [ ] Can start/stop timers
- [ ] Can view history
- [ ] Can navigate between pages
- [ ] Data persists when going back online

### Service Worker
- [ ] Service worker registers (check browser DevTools → Application → Service Workers)
- [ ] Files cached correctly
- [ ] Updates deploy correctly (may need to close/reopen app)

## Responsive Design

### Mobile Portrait
- [ ] L/R buttons large and easy to tap
- [ ] Timer display readable
- [ ] History cards fit screen width
- [ ] Bottom nav accessible and not obscured
- [ ] No horizontal scrolling

### Mobile Landscape
- [ ] Layout adjusts appropriately
- [ ] All elements still accessible
- [ ] Bottom nav stays at bottom

### Tablet/Desktop
- [ ] App centers or scales appropriately
- [ ] Touch/click targets still work
- [ ] Doesn't look broken at larger sizes

## Edge Cases & Error Handling

- [ ] Rapid clicking L/R buttons doesn't break state
- [ ] Switching tabs rapidly doesn't cause errors
- [ ] Very long timer durations (>1 hour) display correctly
- [ ] 20+ feeds in history scroll correctly
- [ ] Feeds at midnight group into correct days
- [ ] Clear history during active timer → button disabled
- [ ] Browser back button (if applicable) works or doesn't break app

## Performance

- [ ] Timer updates smoothly (no lag)
- [ ] Adding feeds is instant
- [ ] Switching tabs is instant
- [ ] Scrolling history is smooth with 50+ feeds
- [ ] No memory leaks after extended use

## Accessibility (Optional)

- [ ] Can tab through interactive elements with keyboard
- [ ] Button states visible with keyboard focus
- [ ] Screen reader announces timer state
- [ ] Color contrast sufficient for readability
- [ ] Text scales with browser zoom

---

## Testing Notes

**Recommended Testing Order:**
1. Basic timer operations
2. Feed grouping and history
3. Daily/Monthly stats
4. Notifications (requires permission)
5. PWA installation
6. Offline mode
7. Edge cases

**Testing Tools:**
- Chrome DevTools → Application tab (localStorage, service workers)
- Chrome DevTools → Network tab → Offline mode toggle
- Multiple devices (phone, tablet, desktop)
- Different browsers (Safari, Chrome, Firefox)

**Date/Time Testing:**
- Change system date to test day grouping
- Use short reminder times (1 minute) to test notifications quickly
