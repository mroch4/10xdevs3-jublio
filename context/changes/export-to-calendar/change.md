---
change_id: export-to-calendar
roadmap_id: S-03
status: impl_reviewed
created: 2026-07-03
updated: 2026-07-03
---

# Change: Export milestone to calendar

## Context

Implementing S-03 from the roadmap: enable users to export any calculated milestone directly to their calendar (Google Calendar, Apple Calendar, or Outlook) without needing to bookmark it first.

## Scope

- Export functionality for calculated milestones
- Support for Google Calendar (URL deep link)
- Support for Apple Calendar / Outlook (URL deep links)
- Pre-filled event title with user-provided label: "[Value] [Unit] milestone of [Label]"
- Works on any calculated milestone from S-01
- Required label input for milestone context
- Accessible UI with ARIA labels and keyboard navigation
- Toast notifications for user feedback
- ESC key and backdrop click to close modal

## Out of scope

- Export from bookmarked portfolio (that's for later when S-02 is done)
- Custom event titles
- Calendar authentication/OAuth
- Recurring events
- .ics file downloads (deep links only)

## Prerequisites

- S-01 (calculate-milestones) - done ✓

## Status

Implementation reviewed - APPROVED (pending mobile testing)

## Implementation Summary

### Review Verdict

**APPROVED** - All phases completed successfully with high code quality, proper separation of concerns, and thoughtful accessibility enhancements. Ready for mobile testing and production deployment.

**Review findings**: 0 critical | 0 warnings | 2 observations (both positive)
- O1: Beneficial accessibility enhancements beyond original plan (APPROVED)
- O2: User-driven modal persistence refinement (APPROVED)

### Phases Completed

**Phase 0: Milestone.label refactor** (commit: 3f0eb32)
- Removed "+" prefix from Milestone.label storage
- Added "+" prefix in MilestoneResults JSX display
- Label now reusable for calendar export without parsing

**Phase 1: Calendar URL utilities** (commit: bdb632f)
- Created `src/utils/calendarExport.ts` with URL generation logic
- Created `src/utils/enums/CalendarProvider.ts` enum
- Implemented Google/Outlook URL builders
- Implemented date formatters for all-day and timed events
- Local timezone handling (no Z suffix)

**Phase 2: Toast notification system** (commit: 8a8f20d)
- Created `src/components/Toast.tsx` with auto-dismiss
- Bottom-right positioning with Bootstrap alerts
- 5-second auto-dismiss with manual close option

**Phase 3: Calendar export modal** (commit: 611acf7)
- Created `src/components/CalendarExportModal.tsx`
- Label input with 100-char limit and validation
- Live event title preview
- Three provider buttons (Google, Apple, Outlook)
- Minimalistic styling (outline-secondary, no icons)
- Modal persists after provider click
- Input label persists until modal closed

**Phase 4: MilestoneResults integration** (commit: abf4098)
- Added calendar icon (📅) to each milestone row
- Integrated modal and toast state management
- Implemented export handler with window.open
- Popup blocker detection and error handling

**Phase 5: Accessibility and polish** (commit: 7589152)
- Replaced button-wrapped icon with accessible span (role=button)
- Added keyboard navigation (Enter/Space) for calendar icon
- Added comprehensive ARIA labels (modal, inputs, buttons)
- Added ESC key handler to close modal
- Visual states for icon (hover, focus, active)
- Vertical centering with flexbox
- Changed preview label to "Event title:"
- Standardized provider names (Google, Apple, Outlook)

### Files Created
- `src/utils/calendarExport.ts` - Calendar URL generation
- `src/utils/enums/CalendarProvider.ts` - Provider enum
- `src/components/CalendarExportModal.tsx` - Export modal component
- `src/components/CalendarExportModal.css` - Modal styles
- `src/components/Toast.tsx` - Toast notification component
- `src/components/Toast.css` - Toast styles

### Files Modified
- `src/utils/classes/Milestone.ts` (renamed from Event.ts) - Label format refactoring
- `src/components/MilestoneResults.tsx` - Integration and icon trigger
- `src/components/MilestoneResults.css` - Calendar icon styles

### Testing Status
- ✅ Build successful
- ✅ TypeScript compilation passes
- ✅ Implementation review completed (APPROVED)
- ⏳ Manual testing on mobile (pending)
- ⏳ Cross-browser testing (pending)
- ⏳ Calendar provider verification (pending)

### Known Limitations
- Apple Calendar uses Google Calendar URL (browser-based, may not redirect to native app on all platforms)
- Requires user to be logged into calendar provider
- Popup blockers may interfere (handled with error toast)

## Next Steps
1. Complete mobile testing using TESTING.md guide
2. Document any issues found during testing
3. Update roadmap.md to mark S-03 as "done" after successful testing
4. (Optional) Add addendum to plan.md noting modal persistence refinement and ESC key handler
