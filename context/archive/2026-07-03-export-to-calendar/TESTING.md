# S-03 Export to Calendar - Testing Guide

## Mobile Testing Checklist

### Setup

- [x] Deploy latest build to GitHub Pages
- [x] Open app on iOS Safari
- [x] Open app on Android Chrome
- [x] Calculate at least 2 milestones (1 all-day date, 1 timed date/time)

### Basic Flow

- [x] Calendar icon (📅) visible on each milestone row
- [x] Tap calendar icon opens modal
- [x] Modal has clear title "Export to Calendar"
- [x] Label input placeholder text visible
- [x] Provider buttons disabled when label empty
- [x] Type label → provider buttons become enabled
- [x] Event title preview updates as you type

### Provider Tests

#### Google Calendar (all-day)

1. [x] Calculate milestone with date only (e.g., 2000-01-01)
2. [x] Tap calendar icon, enter label (e.g., "Wedding")
3. [x] Preview shows: "[value] [unit] since Wedding ([original date])"
4. [x] Tap "Google" button
5. [x] New tab opens with Google Calendar
6. [x] Event pre-filled with correct title including original date
7. [x] Event date matches milestone date
8. [x] Event is all-day (no time shown)
9. [x] Toast notification appears

#### Google Calendar (timed)

1. [x] Calculate milestone with date + time (e.g., 2000-01-01 14:00)
2. [x] Tap calendar icon, enter label (e.g., "Company Launch")
3. [x] Tap "Google" button
4. [x] Event has correct start time (14:00)
5. [x] Event duration is 1 hour (14:00-15:00)
6. [x] Event time matches your local timezone

#### Apple Calendar

1. [x] Tap "Apple" button
2. [x] Browser downloads `.ics` file automatically
3. [x] File named: `{label}_milestone.ics`
4. [x] Open the downloaded file
5. [x] Apple Calendar app launches (or import prompt appears)
6. [x] Event details correct (title, date/time, duration)
7. [x] Toast shows: "Calendar file downloaded. Open it to add the event to Apple Calendar."

#### Outlook (all-day)

1. [x] Calculate milestone with date only
2. [x] Tap calendar icon, enter label
3. [x] Tap "Outlook" button
4. [x] Outlook web calendar opens
5. [x] Event is all-day
6. [x] Event date correct

#### Outlook (timed)

1. [x] Calculate milestone with date + time
2. [x] Tap "Outlook" button
3. [x] Event has correct time
4. [x] Event duration is 1 hour

### Modal Behavior

- [x] Tap X button → modal closes
- [x] Press ESC key (if keyboard available) → modal closes
- [x] After tapping provider button → modal stays open
- [x] After tapping provider button → label input persists
- [x] Can export to multiple providers without re-typing label
- [x] Close modal → label is cleared
- [x] Re-open modal → label input is empty

### Toast Notification

- [x] Toast appears after tapping provider button
- [x] Toast message: "Opening [Provider]... Please log in if the calendar doesn't open."
- [x] Toast positioned bottom-right
- [x] Toast auto-dismisses after ~5 seconds
- [x] Can manually close toast with X button
- [x] Multiple exports → only one toast shown at a time

### Accessibility

- [x] Calendar icon has visible focus state when tabbed
- [x] Can navigate modal with keyboard (Tab key)
- [x] Can activate calendar icon with Enter or Space
- [x] Provider buttons have clear focus states
- [x] Screen reader announces modal title (if available)

### Edge Cases

- [x] Long label (95+ chars) → input respects 100-char limit
- [x] Label with special characters (emojis, accents) → URL encodes correctly
- [x] Very far future date (e.g., +100K days) → no errors
- [x] Past milestone → export still works

### Cross-Browser (Desktop quick check)

- [x] Chrome: basic flow works
- [x] Firefox: basic flow works
- [x] Safari: basic flow works
- [x] Edge: basic flow works

### Popup Blocker Test

- [x] Enable popup blocker in browser settings
- [x] Try to export → toast shows error message
- [x] Error message: "Please allow popups for this site to export to calendar."

## Issues Found

| #   | Description | Severity | Screenshot | Status |
| --- | ----------- | -------- | ---------- | ------ |
|     |             |          |            |        |

## Notes

- Requires user to be logged into calendar provider
- Local timezone handling: Events without "Z" suffix interpreted as local time by calendar providers

## Sign-off

- [x] All critical tests passed
- [x] No blocking issues found
- [x] Ready for production
- [x] Issues documented above

**Tester:** **\*\***\_\_\_**\*\***  
**Date:** **\*\***\_\_\_**\*\***  
**Devices tested:** **\*\***\_\_\_**\*\***
