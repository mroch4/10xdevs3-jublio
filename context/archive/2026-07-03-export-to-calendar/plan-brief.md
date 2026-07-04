# Export to Calendar - Plan Brief

## What
Add calendar export to milestone results. Users click calendar icon → enter label → select provider (Google/Apple/Outlook) → deep link opens with pre-filled Milestone.

## Why
PRD FR-015 to FR-018: Enable users to integrate milestones with their existing calendar system for reminders.

## How

**User flow:**
1. Calendar icon on each milestone row
2. Modal opens: "What is this milestone about?" (required input)
3. Live preview: "10,000 days milestone of [label]"
4. Three provider buttons (Google/Apple/Outlook with brand icons)
5. Click → deep link opens → toast notification

**Implementation:**
- Phase 0: Refactor Milestone.label format (remove "+" prefix, add in JSX)
- Phase 1: URL generation utils (`src/utils/calendarExport.ts`)
- Phase 2: Toast notification component (Bootstrap alerts + auto-dismiss)
- Phase 3: CalendarExportModal component (label input + provider buttons)
- Phase 4: Integrate into MilestoneResults (icon button + modal state)
- Phase 5: Styling (brand colors, mobile-responsive)
- Phase 6: Testing (all providers, browsers, edge cases)

**Key decisions:**
- Phase 0 prerequisite: Refactor Milestone.label to remove "+" prefix (store "10,000 days", add "+" in component JSX)
- Event title: "[Milestone.label] milestone of [User Label]" (e.g., "10,000 days milestone of Wedding")
- All-day events: `Temporal.PlainDate` → YYYYMMDD format
- Timed events: `Temporal.PlainDateTime` → 1-hour duration
- Apple Calendar: use Google URL (works cross-platform)
- Label required (validation)
- Toast guidance: "Please log in to [Provider] if the calendar doesn't open"

**Files:**
- New: `src/utils/calendarExport.ts`, `src/components/CalendarExportModal.tsx`, `src/components/Toast.tsx`
- Modified: `src/components/MilestoneResults.tsx`

**Risks:**
- Apple Calendar URL redirect may not be seamless (documented in UI)
- Timezone handling assumes system timezone for Temporal.PlainDateTime
- Popup blockers (handled with error toast)

**Estimate:** 7-9 hours (including Phase 0 refactoring)
