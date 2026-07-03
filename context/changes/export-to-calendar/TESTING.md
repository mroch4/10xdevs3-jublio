# S-03 Export to Calendar - Testing Guide

## Mobile Testing Checklist

### Setup
- [ ] Deploy latest build to GitHub Pages
- [ ] Open app on iOS Safari
- [ ] Open app on Android Chrome
- [ ] Calculate at least 2 milestones (1 all-day date, 1 timed date/time)

### Basic Flow
- [ ] Calendar icon (📅) visible on each milestone row
- [ ] Tap calendar icon opens modal
- [ ] Modal has clear title "Export to Calendar"
- [ ] Label input placeholder text visible
- [ ] Provider buttons disabled when label empty
- [ ] Type label → provider buttons become enabled
- [ ] Event title preview updates as you type

### Provider Tests

#### Google Calendar (all-day)
1. [ ] Calculate milestone with date only (e.g., 2000-01-01)
2. [ ] Tap calendar icon, enter label (e.g., "Wedding")
3. [ ] Preview shows: "[value] [unit] milestone of Wedding"
4. [ ] Tap "Google" button
5. [ ] New tab opens with Google Calendar
6. [ ] Event pre-filled with correct title
7. [ ] Event date matches milestone date
8. [ ] Event is all-day (no time shown)
9. [ ] Toast notification appears

#### Google Calendar (timed)
1. [ ] Calculate milestone with date + time (e.g., 2000-01-01 14:00)
2. [ ] Tap calendar icon, enter label (e.g., "Company Launch")
3. [ ] Tap "Google" button
4. [ ] Event has correct start time (14:00)
5. [ ] Event duration is 1 hour (14:00-15:00)
6. [ ] Event time matches your local timezone

#### Apple Calendar
1. [ ] Tap "Apple" button
2. [ ] Browser opens Google Calendar URL (expected behavior)
3. [ ] Note: May not redirect to native Apple Calendar app
4. [ ] Event details correct (same as Google test)

#### Outlook (all-day)
1. [ ] Calculate milestone with date only
2. [ ] Tap calendar icon, enter label
3. [ ] Tap "Outlook" button
4. [ ] Outlook web calendar opens
5. [ ] Event is all-day
6. [ ] Event date correct

#### Outlook (timed)
1. [ ] Calculate milestone with date + time
2. [ ] Tap "Outlook" button
3. [ ] Event has correct time
4. [ ] Event duration is 1 hour

### Modal Behavior
- [ ] Tap backdrop (outside modal) → modal closes
- [ ] Tap X button → modal closes
- [ ] Press ESC key (if keyboard available) → modal closes
- [ ] After tapping provider button → modal stays open
- [ ] After tapping provider button → label input persists
- [ ] Can export to multiple providers without re-typing label
- [ ] Close modal → label is cleared
- [ ] Re-open modal → label input is empty

### Toast Notification
- [ ] Toast appears after tapping provider button
- [ ] Toast message: "Opening [Provider]... Please log in if the calendar doesn't open."
- [ ] Toast positioned bottom-right
- [ ] Toast auto-dismisses after ~5 seconds
- [ ] Can manually close toast with X button
- [ ] Multiple exports → only one toast shown at a time

### Accessibility
- [ ] Calendar icon has visible focus state when tabbed
- [ ] Can navigate modal with keyboard (Tab key)
- [ ] Can activate calendar icon with Enter or Space
- [ ] Provider buttons have clear focus states
- [ ] Screen reader announces modal title (if available)

### Edge Cases
- [ ] Long label (95+ chars) → input respects 100-char limit
- [ ] Label with special characters (emojis, accents) → URL encodes correctly
- [ ] Very far future date (e.g., +100K days) → no errors
- [ ] Past milestone → export still works

### Cross-Browser (Desktop quick check)
- [ ] Chrome: basic flow works
- [ ] Firefox: basic flow works
- [ ] Safari: basic flow works
- [ ] Edge: basic flow works

### Popup Blocker Test
- [ ] Enable popup blocker in browser settings
- [ ] Try to export → toast shows error message
- [ ] Error message: "Please allow popups for this site to export to calendar."

## Issues Found

| # | Description | Severity | Screenshot | Status |
|---|-------------|----------|------------|--------|
|   |             |          |            |        |

## Notes

- Apple Calendar URL scheme limitation: Uses Google Calendar URL, may not seamlessly redirect to native app on all platforms
- Requires user to be logged into calendar provider
- Local timezone handling: Events without "Z" suffix interpreted as local time by calendar providers

## Sign-off

- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Ready for production
- [ ] Issues documented above

**Tester:** _______________  
**Date:** _______________  
**Devices tested:** _______________
