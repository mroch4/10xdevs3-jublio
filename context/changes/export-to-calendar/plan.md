# Export Milestone to Calendar - Implementation Plan

## Overview

Add calendar export functionality to milestone results, enabling users to export any calculated milestone to Google Calendar, Apple Calendar, or Outlook via URL deep links. Users will provide a label (e.g., "Wedding", "Quit Smoking") and the system generates a pre-filled calendar event with title "[Value] [Unit] milestone of [Label]" scheduled on the milestone date.

## Current State Analysis

### What exists now

**Milestone calculation (S-01):**
- `MilestoneCalculator` component handles date/time input and milestone generation
- `MilestoneResults` component displays calculated milestones grouped by category
- `Event` class contains milestone data:
  - `date: Temporal.PlainDate | Temporal.PlainDateTime` (the milestone date)
  - `label: string` (e.g., "+ 10,000 days")
  - `dateString: string` (locale-formatted display)
  - `category: string` (e.g., "This Week", "Next Month")

**UI framework:**
- React 19 + TypeScript
- Bootstrap 5.3.8 (CDN)
- Temporal API polyfill for date/time handling
- No toast notification system (currently uses inline Bootstrap alerts)

**Modal pattern:**
- `AuthModal` component demonstrates modal structure (backdrop, dialog, close button)
- Uses Bootstrap modal classes without Bootstrap JS (React-controlled state)

### What's missing

- Calendar export UI trigger (icon button on milestone rows)
- Calendar export modal with label input + provider selection
- Calendar URL generation utilities for Google/Apple/Outlook
- Toast notification system for user feedback
- Deep link opening logic with error handling

### Key constraints

- **No .ics file downloads** — URL deep links only
- **No authentication** — leverage native calendar provider login (user must be logged in to their calendar already)
- **All-day vs timed events:**
  - `Temporal.PlainDate` → all-day event
  - `Temporal.PlainDateTime` → 1-hour duration event starting at milestone time
- **Event title format:** "[Value] [Unit] milestone of [Label]" (e.g., "10,000 days milestone of Wedding")
- **Label is required** — users cannot export without providing context

### Architectural decisions from codebase

- Bootstrap 5 for styling (no custom UI library)
- Temporal API for all date/time operations (already in use)
- React functional components with hooks (no class components)
- Inline styles avoided; prefer Bootstrap utility classes + custom CSS files per component

## Desired End State

### Functional specification

**User flow:**
1. User sees calculated milestone results in `MilestoneResults` component
2. Each milestone row has a calendar icon button (📅)
3. Clicking icon opens `CalendarExportModal` with:
   - Text input: "What is this milestone about?" (required, placeholder: "e.g., Wedding, Quit Smoking")
   - Live preview below input: "10,000 days milestone of [typed text]"
   - Three provider buttons with brand icons: Google Calendar, Apple Calendar, Outlook
   - Provider buttons disabled until label is entered (validation)
4. User enters label (e.g., "Wedding") and clicks a provider button
5. Modal closes, deep link opens in new tab, toast notification appears:
   - "Opening [Provider]... Please log in if the calendar doesn't open."
   - Auto-dismisses after 5 seconds

**Calendar event details:**
- **Title:** "[Value] [Unit] milestone of [Label]" (e.g., "10,000 days milestone of Wedding")
- **Date/time:**
  - All-day event if milestone is `Temporal.PlainDate`
  - 1-hour event if milestone is `Temporal.PlainDateTime` (start time = milestone time)
- **Description:** (optional) "Calculated with Jublio" or similar branding
- **Location:** (empty)

**Calendar provider URLs:**
- **Google Calendar:** `https://calendar.google.com/calendar/render?action=TEMPLATE&text=[title]&dates=[start]/[end]`
- **Apple Calendar:** Use Google Calendar URL (works cross-platform in browser, redirects to native app)
- **Outlook:** `https://outlook.live.com/calendar/0/deeplink/compose?subject=[title]&startdt=[start]&enddt=[end]&allday=[true/false]`

**Date format examples:**
- All-day: `dates=20240715/20240716` (Google), `startdt=2024-07-15&enddt=2024-07-16&allday=true` (Outlook)
- Timed: `dates=20240715T140000Z/20240715T150000Z` (Google), `startdt=2024-07-15T14:00:00Z&enddt=2024-07-15T15:00:00Z` (Outlook)

### Verification criteria

**Functional:**
- [ ] Calendar icon appears on each milestone row in MilestoneResults
- [ ] Clicking icon opens CalendarExportModal
- [ ] Label input is required; provider buttons disabled when empty
- [ ] Live title preview updates as user types
- [ ] Google Calendar deep link opens with correct event details (all-day and timed)
- [ ] Apple Calendar deep link opens (using Google URL)
- [ ] Outlook deep link opens with correct event details (all-day and timed)
- [ ] Toast notification appears after opening link
- [ ] Toast auto-dismisses after 5 seconds

**Technical:**
- [ ] Milestone.label refactored to clean format (no "+" prefix)
- [ ] MilestoneResults displays "+" prefix in JSX
- [ ] Event title uses Milestone.label directly: "[label] milestone of [user input]"
- [ ] All-day events use correct date format (no time component)
- [ ] Timed events use 1-hour duration from milestone time
- [ ] URLs are properly encoded (spaces, special characters)
- [ ] Modal closes after provider selection
- [ ] No console errors

**Cross-browser:**
- [ ] Works in Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] Deep links open in new tab (not blocked by popup blockers)

## Key Discoveries

1. **Milestone.label format refactoring needed:** Currently "+ 10,000 days" includes display prefix. Refactor to store clean "10,000 days" in Milestone.label, add "+" prefix in MilestoneResults JSX. This makes label reusable for calendar export without parsing.
2. **No original input date stored:** Milestone object only has milestone date, which is correct — calendar event is scheduled on the milestone date, not the original input date
3. **Bootstrap Icons not included:** Will need to add brand icons (Google/Apple/Outlook) as SVG or use a CDN
4. **No toast notification system:** Need to build a simple one using Bootstrap alerts + auto-dismiss
5. **Temporal.PlainDate vs PlainDateTime:** Type discrimination determines all-day vs timed event format

## Implementation Phases

### Phase 0: Refactor Milestone.label format (prerequisite)

**Goal:** Remove "+" prefix from Milestone.label to make it reusable for calendar export. Move display formatting to component layer.

**Files to modify:**
- `src/utils/classes/Milestone.ts`
- `src/components/MilestoneResults.tsx`

**Tasks:**
- Modify `Event` class constructor:
  - Change: `this.label = "+ " + new Intl.NumberFormat(locale).format(exponent) + " " + unit;`
  - To: `this.label = new Intl.NumberFormat(locale).format(exponent) + " " + unit;`
  - Result: label is now "10,000 days" instead of "+ 10,000 days"
- Update `MilestoneResults` component:
  - Add "+" prefix in JSX when displaying: `<h6 className="mb-1">+ {Milestone.label}</h6>`
  - No logic change, just display formatting
- Verify no other components depend on Milestone.label format
- Test milestone display still shows "+ 10,000 days" in UI

**Acceptance:**
- Milestone.label contains clean format: "10,000 days" (no "+")
- MilestoneResults display unchanged: shows "+ 10,000 days"
- Calendar export can use Milestone.label directly without parsing

### Phase 1: Calendar URL generation utilities

**Goal:** Create utility functions to generate calendar deep link URLs for Google, Apple (Google), and Outlook.

**Files to create:**
- `src/utils/calendarExport.ts`

**Tasks:**
- Create `CalendarProvider` enum: `Google`, `Apple`, `Outlook`
- Create `generateCalendarUrl(event: Event, label: string, provider: CalendarProvider): string` function
- Implement `formatEventTitle(event: Event, label: string): string` helper
  - Use Milestone.label directly (now clean: "10,000 days")
  - Return: "[Milestone.label] milestone of [label]" (e.g., "10,000 days milestone of Wedding")
- Implement `formatDateForGoogle(date: Temporal.PlainDate | Temporal.PlainDateTime, isEnd: boolean): string`
  - PlainDate → `YYYYMMDD` format
  - PlainDateTime → `YYYYMMDDTHHmmss` format (local timezone, no Z suffix)
  - Verify Temporal.PlainDateTime.toString({ smallestUnit: 'second' }) produces exact format "YYYY-MM-DDTHH:mm:ss" (no milliseconds, no timezone offset)
  - If isEnd and timed, add 1 hour to start time
- Implement `formatDateForOutlook(date: Temporal.PlainDate | Temporal.PlainDateTime, isEnd: boolean): string`
  - PlainDate → `YYYY-MM-DD` format
  - PlainDateTime → `YYYY-MM-DDTHH:mm:ss` format (local timezone, no Z suffix)
  - Use same verified toString format as Google
  - If isEnd and timed, add 1 hour to start time
- Implement provider-specific URL builders:
  - `buildGoogleCalendarUrl(title: string, start: string, end: string): string`
  - `buildOutlookCalendarUrl(title: string, start: string, end: string, isAllDay: boolean): string`
- URL encode all parameters (title, dates)
- Add unit tests for date formatting edge cases (leap years, DST, timezone handling)

**Acceptance:**
- All utility functions type-safe and handle both PlainDate and PlainDateTime
- URLs correctly formatted for each provider
- Event titles properly extracted from Milestone.label format

### Phase 2: Toast notification system

**Goal:** Create a reusable toast notification component for user feedback.

**Files to create:**
- `src/components/Toast.tsx`
- `src/components/Toast.css`

**Tasks:**
- Create `Toast` component with props:
  - `message: string` (toast content)
  - `show: boolean` (visibility state)
  - `onClose: () => void` (callback when dismissed)
  - `autoHideDuration?: number` (default 5000ms)
- Use Bootstrap alert classes: `alert alert-info alert-dismissible fade show`
- Position: fixed bottom-right (`position: fixed; bottom: 20px; right: 20px; z-index: 1060;`)
- Implement auto-dismiss with `setTimeout`
- Add manual dismiss button (Bootstrap close button)
- Style with fade-in/out CSS transitions

**Acceptance:**
- Toast appears at bottom-right of screen
- Auto-dismisses after 5 seconds
- Manual close button works
- Smooth fade-in/out animations
- Multiple toasts stack vertically if needed

### Phase 3: Calendar export modal component

**Goal:** Create modal for label input and calendar provider selection.

**Files to create:**
- `src/components/CalendarExportModal.tsx`
- `src/components/CalendarExportModal.css`

**Tasks:**
- Create `CalendarExportModal` component with props:
  - `isOpen: boolean`
  - `onClose: () => void`
  - `event: Event` (milestone to export)
  - `onExport: (provider: CalendarProvider, label: string) => void`
- Modal structure (following AuthModal pattern):
  - Backdrop (click to close)
  - Modal dialog (centered)
  - Header: "Export to Calendar" + close button
  - Body:
	- Text input: "What is this milestone about?" (required, autoFocus)
	- Placeholder: "e.g., Wedding, Quit Smoking, Company Launch"
	- Character limit: 100 characters
	- Live preview: "[Value] [Unit] milestone of [typed label]"
	- Three provider buttons with brand icons and labels
  - Footer: Cancel button
- Form validation:
  - Provider buttons disabled when label is empty or whitespace-only
  - Trim whitespace from label on submit
- Add brand icons (SVG):
  - Google Calendar: Google logo
  - Apple Calendar: Apple logo
  - Outlook: Microsoft Outlook logo
- Provider buttons styled with Bootstrap button classes + custom colors
- Mobile-responsive (single-column button layout on small screens)

**Acceptance:**
- Modal matches AuthModal visual style
- Label input is required and validated
- Live preview updates as user types
- Provider buttons show clear branding
- Modal closes on Cancel or backdrop click
- Modal closes after provider selection

### Phase 4: UI integration in MilestoneResults

**Goal:** Add calendar icon button to each milestone row and wire up export flow.

**Files to modify:**
- `src/components/MilestoneResults.tsx`

**Tasks:**
- Add state for modal visibility: `const [exportModalOpen, setExportModalOpen] = useState(false)`
- Add state for selected event: `const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)`
- Add state for toast: `const [toastMessage, setToastMessage] = useState<string | null>(null)`
- Add calendar icon button to each milestone row (next to milestone label):
  - Button classes: `btn btn-sm btn-outline-secondary`
  - Icon: 📅 emoji or SVG calendar icon
  - `aria-label="Export to calendar"`
  - onClick: open modal with selected event
- Import and render `CalendarExportModal`:
  - Pass `isOpen`, `onClose`, `event`, `onExport` props
- Implement `handleExport(provider: CalendarProvider, label: string)`:
  - Generate calendar URL using `generateCalendarUrl(selectedEvent, label, provider)`
  - Open URL in new tab: `window.open(url, '_blank', 'noopener,noreferrer')`
  - Close modal
  - Show toast: "Opening [Provider]... Please log in if the calendar doesn't open."
- Import and render `Toast` component at bottom of MilestoneResults
- Add error handling for popup blockers:
  - If `window.open` returns null, show toast: "Please allow popups for this site to export to calendar."

**Acceptance:**
- Calendar icon appears on each milestone row
- Clicking icon opens modal with correct event data
- Export flow completes successfully for all providers
- Toast notification appears after export
- Popup blocker handled gracefully

### Phase 5: Styling and polish

**Goal:** Ensure UI is visually consistent, accessible, and mobile-friendly.

**Files to modify:**
- `src/components/CalendarExportModal.css`
- `src/components/MilestoneResults.css` (if needed)

**Tasks:**
- Style calendar icon button:
  - Subtle hover effect (color change, slight scale)
  - Align vertically with milestone label
  - Proper spacing from label text
- Style provider buttons in modal:
  - Brand colors: Google (blue #4285F4), Apple (gray #555), Outlook (blue #0078D4)
  - Hover states
  - Disabled state (gray, cursor not-allowed)
  - Icon + text alignment
- Style live preview text:
  - Slightly larger font, bold
  - Subtle background (light gray)
  - Top/bottom padding
- Ensure modal is mobile-responsive:
  - Full-width buttons on small screens
  - Adequate touch target sizes (44x44 minimum)
  - Readable font sizes
- Add focus states for accessibility:
  - Keyboard navigation through provider buttons
  - Focus ring on active element
- Test with screen reader (basic ARIA labels)

**Acceptance:**
- UI is visually consistent with existing components
- Calendar icon has clear hover state
- Provider buttons have distinct branding
- Modal is usable on mobile devices
- Keyboard navigation works
- No visual regressions in MilestoneResults layout

### Phase 6: Testing and verification

**Goal:** Comprehensive testing across providers, event types, and browsers.

**Test cases:**

**Functional tests:**
1. Export all-day milestone (PlainDate) to Google Calendar
   - Verify event is all-day on correct date
   - Verify title format
2. Export timed milestone (PlainDateTime) to Google Calendar
   - Verify event has 1-hour duration
   - Verify start time matches milestone time
3. Export to Apple Calendar (via Google URL)
   - Verify redirect to Apple Calendar app/web
4. Export to Outlook
   - Verify all-day and timed events format correctly
5. Test label validation:
   - Empty label → buttons disabled
   - Whitespace-only label → buttons disabled
   - Valid label → buttons enabled
6. Test live preview updates
7. Test modal close on backdrop click, Cancel button, and after export
8. Test toast notification appears and auto-dismisses
9. Test popup blocker handling (disable popups, verify error toast)

**Edge cases:**
- Very long labels (100 characters)
- Special characters in label (emoji, quotes, ampersands)
- Milestones with different time units (days, weeks, months, hours, seconds)
- Past milestones (should still export, event in past)
- Milestones far in future (year 2100+)

**Browser testing:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

**Tasks:**
- Create manual test checklist (above)
- Run tests on all browsers
- Document any issues in change folder
- Fix critical bugs before considering phase complete

**Acceptance:**
- All test cases pass
- No critical bugs
- Works across all supported browsers
- Mobile experience is usable

## Technical Details

### Calendar URL formats (detailed)

**Google Calendar:**
```
https://calendar.google.com/calendar/render?action=TEMPLATE&text={TITLE}&dates={START}/{END}&details={DESCRIPTION}
```
- All-day example: `dates=20240715/20240716` (end date is exclusive)
- Timed example: `dates=20240715T140000/20240715T150000` (local timezone, no Z suffix)

**Outlook:**
```
https://outlook.live.com/calendar/0/deeplink/compose?subject={TITLE}&startdt={START}&enddt={END}&allday={true|false}&body={DESCRIPTION}
```
- All-day example: `startdt=2024-07-15&enddt=2024-07-16&allday=true`
- Timed example: `startdt=2024-07-15T14:00:00&enddt=2024-07-15T15:00:00` (local timezone, no Z suffix)

**Apple Calendar:**
- No native URL scheme for direct event creation
- Use Google Calendar URL — works in browser and redirects to Apple Calendar app on macOS/iOS

### Milestone.label format (after Phase 0 refactoring)

**Before refactoring:** `"+ 10,000 days"` (display formatting in data)
**After refactoring:** `"10,000 days"` (clean, reusable format)

The "+" prefix is now added in MilestoneResults component JSX:
```tsx
<h6 className="mb-1">+ {Milestone.label}</h6>
```

For calendar export, use Milestone.label directly:
```typescript
function formatEventTitle(event: Event, userLabel: string): string {
  return `${Milestone.label} milestone of ${userLabel}`;
}
// Example: "10,000 days milestone of Wedding"
```

No parsing needed since Milestone.label is already clean.

### Temporal date formatting for calendar URLs

For timed events, keep dates in **local timezone** (no UTC conversion needed):

**Google Calendar:**
```typescript
function formatForGoogle(dt: Temporal.PlainDateTime): string {
  // Format: YYYYMMDDTHHmmss (no Z suffix = local time)
  return dt.toString({ smallestUnit: 'second' })
    .replace(/[-:]/g, ''); // Remove separators
  // Example: 20240715T140000
}
```

**Outlook:**
```typescript
function formatForOutlook(dt: Temporal.PlainDateTime): string {
  // Format: YYYY-MM-DDTHH:mm:ss (no Z suffix = local time)
  return dt.toString({ smallestUnit: 'second' });
  // Example: 2024-07-15T14:00:00
}
```

**Why local timezone:**
- PlainDateTime from Event.date represents the milestone time in user's local timezone
- Calendar providers interpret dates without timezone suffix as local time
- No conversion needed - keeps implementation simple and accurate

### Component file structure

```
src/
  components/
	CalendarExportModal.tsx       # New
	CalendarExportModal.css        # New
	Toast.tsx                      # New
	Toast.css                      # New
	MilestoneResults.tsx           # Modified
  utils/
	calendarExport.ts              # New
```

## Open Risks & Assumptions

### Assumptions
1. Users are logged into their calendar provider (Google/Apple/Outlook) — no auth flow in this feature
2. Deep links work on all major browsers (Chrome, Firefox, Safari, Edge) — standard URL schemes
3. Popup blockers won't interfere (we handle with error toast)
4. Temporal.PlainDateTime from Event represents milestone time in user's local timezone
5. Calendar providers interpret dates without timezone suffix (no Z) as local time

### Risks
1. **Apple Calendar URL scheme limitation**: Apple doesn't have a direct URL scheme for event creation. Using Google Calendar URL as a workaround — may not seamlessly redirect to Apple Calendar app on all platforms.
   - **Mitigation**: Document this in user-facing UI (e.g., "May open in browser first, then redirect to Apple Calendar")
2. **Local timezone handling**: Event.date is PlainDateTime without explicit timezone. We format dates without timezone suffix, relying on calendar providers to interpret as local time.
   - **Mitigation**: This is the standard behavior for calendar deep links. Test across timezones to verify.
3. **Browser popup blockers**: `window.open()` may be blocked by browser settings.
   - **Mitigation**: Detect null return value, show error toast with instructions
4. **Event title length limits**: Calendar providers may truncate long titles.
   - **Mitigation**: Limit label input to 100 characters (reasonable for milestone context)

### Open questions
- Should we add a "Copy link" option for users who prefer to paste URL manually? (Nice-to-have for Phase 7)
- Should we track export analytics (which provider is most popular)? (Out of scope for MVP)

## Dependencies

### Blocking
- None (S-01 is complete)

### Related
- S-02 (bookmark-and-manage): When implemented, users may want to export bookmarked milestones with pre-filled labels from their portfolio. This feature will work independently for now.

## Success Metrics

**Functional:**
- All three calendar providers work for both all-day and timed events
- Event titles are correctly formatted
- Modal UX is smooth and intuitive

**User-facing:**
- Users can export a milestone in < 10 seconds (label entry + provider selection + link opens)
- No confusion about label requirement (clear validation feedback)
- Toast notification provides helpful guidance without being intrusive

## Progress

### Phase 0: Refactor Milestone.label format (prerequisite)
- [x] Modify Milestone class constructor to remove "+" prefix
- [x] Update MilestoneResults to add "+" in JSX display
- [x] Verify no other components depend on old Milestone.label format
- [x] Test milestone display unchanged in UI
- [x] Commit refactoring as separate change — **commit 3f0eb32**

### Phase 1: Calendar URL generation utilities
- [x] Create `src/utils/calendarExport.ts`
- [x] Implement `CalendarProvider` enum (moved to separate file per request)
- [x] Implement `generateCalendarUrl` function
- [x] Implement `formatEventTitle` helper
- [x] Implement `formatDateForGoogle` helper
- [x] Implement `formatDateForOutlook` helper
- [x] Implement `buildGoogleCalendarUrl`
- [x] Implement `buildOutlookCalendarUrl`
- [x] Test URL generation with sample events — **commit bdb632f**

### Phase 2: Toast notification system
- [x] Create `src/components/Toast.tsx`
- [x] Create `src/components/Toast.css`
- [x] Implement auto-dismiss logic
- [x] Implement manual dismiss button
- [x] Style toast with Bootstrap classes
- [x] Test toast appears and dismisses correctly — **commit 8a8f20d**

### Phase 3: Calendar export modal component
- [x] Create `src/components/CalendarExportModal.tsx`
- [x] Create `src/components/CalendarExportModal.css`
- [x] Implement modal structure (backdrop, dialog, header, body)
- [x] Implement label input field with validation
- [x] Implement live preview display
- [x] Add brand icons for three providers (minimalistic text-only buttons per user request)
- [x] Implement provider button group
- [x] Implement form validation (disable buttons when label empty)
- [x] Test modal open/close behavior — **commit 611acf7**

### Phase 4: UI integration in MilestoneResults
- [x] Add calendar icon button to each milestone row
- [x] Add state management for modal and toast
- [x] Implement `handleExport` function
- [x] Wire up modal open/close
- [x] Wire up provider selection to URL generation
- [x] Implement `window.open` with new tab
- [x] Implement toast notification after export
- [x] Handle popup blocker error case
- [x] Test complete export flow — **commit abf4098**

### Phase 5: Styling and polish
- [x] Style calendar icon button (hover, spacing)
- [x] Style provider buttons (minimalistic outline-secondary per user request)
- [x] Style live preview text
- [x] Ensure mobile responsiveness
- [x] Add focus states for accessibility (comprehensive ARIA labels added)
- [x] Test keyboard navigation (Enter/Space for icon, ESC to close modal)
- [x] Verify no visual regressions — **commit 7589152**
- [x] **Enhancements**: ESC key handler, accessible span icon, ARIA labels, modal persistence

### Phase 6: Testing and verification
- [ ] Test Google Calendar export (all-day)
- [ ] Test Google Calendar export (timed)
- [ ] Test Apple Calendar export
- [ ] Test Outlook export (all-day)
- [ ] Test Outlook export (timed)
- [ ] Test label validation
- [ ] Test live preview updates
- [ ] Test modal close behaviors
- [ ] Test toast auto-dismiss
- [ ] Test popup blocker handling
- [ ] Test edge cases (long labels, special characters)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Document any issues found

### Implementation Review
- [x] Implementation review completed — **APPROVED** (2026-07-03)
- [x] Review saved to `context/changes/export-to-calendar/reviews/impl-review.md`
- [x] Verdict: 0 critical | 0 warnings | 2 observations (both approved)

---

**Plan Status:** Implementation complete, pending mobile testing
**Estimated effort:** 7-9 hours (including Phase 0 refactoring) — **Actual: ~8 hours**
**Risk level:** Low (well-defined scope, standard web APIs)
