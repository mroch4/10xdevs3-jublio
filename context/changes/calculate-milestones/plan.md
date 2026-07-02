# Calculate Milestones Implementation Plan

## Overview

Implement the milestone calculation UI that allows users to input a date and time, then displays a grouped, sorted list of future milestone events. This is S-01 from the roadmap - the foundational feature that enables all subsequent bookmark and sharing functionality.

## Current State Analysis

The application already has solid foundations for milestone calculation:

**Existing Assets:**

- `CardBase` (src/utils/classes/CardBase.ts) - Abstract base with `getEvents()` method that generates milestone events using UnitsConfig
- `DateCard` (src/utils/classes/DateCard.ts) - Handles date-only milestones for Days, Weeks, Months
- `DateTimeCard` (src/utils/classes/DateTimeCard.ts) - Handles date+time milestones for Seconds, Minutes, Hours, Days, Weeks, Months
- `Event` (src/utils/classes/Event.ts) - Milestone event model with automatic categorization (Today, ThisWeek, ThisMonth, etc.) and past/future detection
- `EventCategory` (src/utils/enums/EventCategory.ts) - Categories: Today, ThisWeek, NextWeek, ThisMonth, NextMonth, ThisYear, NextYear, Further, BeyondHumanLifeExpectancy, AlreadyPassed
- `UnitsConfig` (src/utils/UnitsConfig.ts) - Defines which time units to calculate and their exponent ranges (10, 100, 1K, etc.)
- Temporal API polyfill already installed and in use

**What's Missing:**

- No UI components for date/time input
- No components to display milestone results
- No integration between input and calculation logic
- Current App.tsx only shows header

**Key Constraints:**

- Must use Bootstrap 5 (already loaded from CDN in index.html)
- Must not add lodash or other unnecessary dependencies (per context/foundation/lessons.md)
- Must use Temporal API for all date/time operations (already established pattern)
- Time input is optional (date required, time optional per PRD)
- Dates must display according to browser locale (use `navigator.language`)
- Default input values should be current date/time
- Must include "Reset" and "Set to Now" buttons for UX convenience

## Desired End State

Users can:

1. See a form with date picker and time picker inputs (both always visible)
2. Enter a past or present date/time
3. Click a "Calculate" button to generate milestones
4. View milestone results grouped by time proximity (This Week, This Month, etc.)
5. See past milestones with "Already Passed" visual indicator
6. See milestones sorted chronologically (nearest first) within each group
7. Not see milestones beyond 75 years in the future (with count indicator)
8. Get validation error if they try to enter a future date

**Verification:**

- User inputs date "2020-06-15" and time "14:30", clicks Calculate, sees grouped milestones starting with nearest events
- User inputs date "2020-06-15" without time, clicks Calculate, sees day-level milestones (Days, Weeks, Months only)
- User inputs today's date, sees validation error: "Please enter a past or present date"
- Default values are current date/time when form loads
- "Reset" button clears both inputs
- "Set to Now" button populates current date/time
- Past milestones show with muted styling and "Already Passed" badge
- Milestones beyond 75 years are hidden with message: "X more beyond 75 years"
- Dates display according to browser locale (e.g., MM/DD/YYYY for en-US, DD/MM/YYYY for en-GB)

## What We're NOT Doing

- Timezone selector (using browser timezone only)
- Bookmark/save functionality (that's S-02)
- Calendar export (that's S-03)
- Social sharing (that's S-04)
- Authentication/login (anonymous access only for S-01)
- Loading states (calculation is synchronous and fast)
- Mobile-specific optimizations beyond Bootstrap's responsive utilities
- Past milestone toggle (always show with visual indicator)

## Implementation Approach

Build three React components that wrap the existing calculation classes:

1. **MilestoneCalculator** - Parent component managing state, locale detection, and orchestrating calculation
2. **DateTimeInput** - Form with date/time inputs, validation, and control buttons (Reset/Set to Now)
3. **MilestoneResults** - Displays grouped and sorted milestone events

The component will detect browser locale via `navigator.language` and pass it to calculation classes for proper date formatting. When user provides only a date, use `DateCard` (day-level milestones); when both date and time provided, use `DateTimeCard` (includes hours/minutes/seconds milestones).

Key flow:

- Form loads with current date/time as defaults → User modifies or uses Reset/Set to Now buttons → clicks Calculate → validation runs → instantiate `DateCard` or `DateTimeCard` based on whether time is provided → `events` array generated → filter out BeyondHumanLifeExpectancy → group by category → render with locale-aware date formatting

## Phase 1: Date/Time Input Component

### Overview

Build the form component that captures date and time input with validation and control buttons. This establishes the user entry point with good UX defaults (current date/time) and ensures data quality before calculation.

### Changes Required:

#### 1. Create DateTimeInput Component

**File**: `src/components/DateTimeInput.tsx`

**Intent**: Create a controlled form component with date input (required), time input (optional), validation logic that blocks future dates, control buttons (Reset, Set to Now), and a calculate button that triggers the parent's calculation handler.

**Contract**: Component accepts props `{ onCalculate: (date: Temporal.PlainDate, time?: Temporal.PlainTime) => void }` and renders a Bootstrap form with:

- Date input (required, HTML5 date picker, defaults to current date)
- Time input (optional, HTML5 time picker, defaults to current time)
- "Set to Now" button - populates both inputs with current date/time
- "Reset" button - clears both inputs
- "Calculate" button
- Validation error display area

Validation rules:

- Date must be provided (time is optional)
- Date must be in the past or today
- On validation failure, show error message and prevent calculation
- On success, construct `Temporal.PlainDate` and optionally `Temporal.PlainTime`, then call `onCalculate`

#### 2. Add Validation Helper

**File**: `src/utils/validation.ts`

**Intent**: Centralize date validation logic for reuse and testability.

**Contract**: Export function `validateDateTime(dateString: string, timeString?: string): { isValid: boolean; error?: string; date?: Temporal.PlainDate; time?: Temporal.PlainTime }` that:

- Checks date input is non-empty (time is optional)
- Parses date using Temporal.PlainDate.from()
- If time provided, parses using Temporal.PlainTime.from()
- Compares date (and time if provided) against current date/time to ensure not in future
- Returns structured validation result with either error message or parsed date and optional time

#### 3. Create Components Directory

**File**: `src/components/` (directory)

**Intent**: Establish standard location for React components, separating them from utility classes.

**Contract**: New directory at project root level alongside `src/utils/`.

### Success Criteria:

#### Automated Verification:

- Type checking passes: `npm run typecheck`
- Linting passes: `npm run lint`
- Build succeeds: `npm run build`
- Component renders without errors: `npm run dev` and navigate to localhost

#### Manual Verification:

- Date input renders as HTML5 date picker with current date as default
- Time input renders as HTML5 time picker with current time as default
- Both inputs are visible by default
- Empty date input shows validation error: "Date is required"
- Future date shows validation error: "Please enter a past or present date"
- "Set to Now" button populates both inputs with current date/time
- "Reset" button clears both inputs
- Valid past date without time calls onCalculate with date only
- Valid past date with time calls onCalculate with both date and time

---

## Phase 2: Milestone Results Display

### Overview

Build the component that renders grouped and sorted milestone events. This transforms the raw Event array into a scannable, categorized view.

### Changes Required:

#### 1. Create MilestoneResults Component

**File**: `src/components/MilestoneResults.tsx`

**Intent**: Display milestone events grouped by EventCategory with visual hierarchy, locale-aware date formatting, and styling. Filter out BeyondHumanLifeExpectancy events and show count indicator.

**Contract**: Component accepts props `{ events: Event[]; locale: string }` and renders:

- Events filtered to exclude `EventCategory.BeyondHumanLifeExpectancy`
- Remaining events grouped by their `category` property
- Groups displayed in temporal order (Today, ThisWeek, NextWeek, ThisMonth, etc.)
- Within each group, events sorted chronologically (nearest first)
- Past events (AlreadyPassed category) shown with muted styling and "Already Passed" badge
- Event dates formatted using the provided locale (via `event.date.toLocaleString(locale)`)
- Count indicator if any events were filtered: "X more beyond 75 years"

Bootstrap structure:

- Section headers (`<h4>`) for each category
- Card or list-group-item for each event showing: date, label (e.g., "+ 1,000 days"), and visual indicator for past events

#### 2. Add Event Grouping Utility

**File**: `src/utils/eventGrouping.ts`

**Intent**: Encapsulate the logic for filtering, grouping, and sorting events to keep component clean and logic testable.

**Contract**: Export functions:

- `filterEvents(events: Event[]): { visible: Event[]; beyondCount: number }` - removes BeyondHumanLifeExpectancy, returns visible events and count of filtered
- `groupByCategory(events: Event[]): Map<EventCategory, Event[]>` - groups events by their category property
- `sortEventsByDate(events: Event[]): Event[]` - sorts events chronologically (nearest first)
- `getCategoryOrder(): EventCategory[]` - returns category display order array

#### 3. Add Styling for Milestone Results

**File**: `src/components/MilestoneResults.css`

**Intent**: Add visual styling for past event indicators and category section headers.

**Contract**: CSS classes:

- `.milestone-past` - muted text color and opacity for AlreadyPassed events
- `.milestone-badge` - badge styling for "Already Passed" label
- `.category-header` - styling for time proximity section headers

### Success Criteria:

#### Automated Verification:

- Type checking passes: `npm run typecheck`
- Linting passes: `npm run lint`
- Build succeeds: `npm run build`
- Component renders without errors with sample Event array

#### Manual Verification:

- Events grouped under correct category headers (Today, ThisWeek, etc.)
- Within each group, nearest milestone appears first
- Past events show with muted styling and "Already Passed" badge
- BeyondHumanLifeExpectancy events do not appear in any group
- Count indicator shows: "12 more beyond 75 years" (or appropriate count)
- Empty state message appears when no events to display

---

## Phase 3: Main Calculator Integration

### Overview

Wire together the input and display components with the existing calculation logic. This completes the end-to-end flow from user input to milestone display.

### Changes Required:

#### 1. Create MilestoneCalculator Component

**File**: `src/components/MilestoneCalculator.tsx`

**Intent**: Parent component that manages calculation state, detects browser locale, decides whether to use DateCard or DateTimeCard based on time input, and passes generated events to display component.

**Contract**: Component manages state for `events: Event[] | null` and `locale: string` (from `navigator.language`), and renders:

- DateTimeInput component with onCalculate handler
- When events exist, MilestoneResults component with events and locale props
- When events is null, show placeholder message: "Enter a date and time to calculate milestones"

The onCalculate handler:

1. Receives validated `Temporal.PlainDate` and optional `Temporal.PlainTime` from DateTimeInput
2. If time is provided: instantiate `new DateTimeCard(Temporal.PlainDateTime.from({ ...date, ...time }), locale)` for second/minute/hour/day/week/month milestones
3. If time is NOT provided: instantiate `new DateCard(date, locale)` for day/week/month milestones only
4. Calls `card.getEvents()` to generate milestone array
5. Sets events state to trigger MilestoneResults render

#### 2. Update App.tsx

**File**: `src/App.tsx`

**Intent**: Replace placeholder content with MilestoneCalculator component.

**Contract**: Import and render `<MilestoneCalculator />` below the existing header. Keep header unchanged.

#### 3. Remove UnitsConfig Fix from Plan

**File**: `src/utils/UnitsConfig.ts`

**Intent**: ~~Correct the duplicate `Minutes` entry~~ **ALREADY FIXED** - UnitsConfig now correctly has Years at line 10.

**Contract**: No changes needed - verified that UnitsConfig already contains the correct units:

- Seconds (exp 3-10)
- Minutes (exp 2-8)
- Hours (exp 2-6)
- Days (exp 1-5)
- Weeks (exp 1-4)
- Years (exp 1-4)

### Success Criteria:

#### Automated Verification:

- Type checking passes: `npm run typecheck`
- Linting passes: `npm run lint`
- Build succeeds: `npm run build`
- Dev server starts without errors: `npm run dev`

#### Manual Verification:

- App loads showing header and date/time input form
- Input date "2020-06-15" and time "14:30", click Calculate
- Milestone results appear grouped by proximity
- Verify a few milestone calculations manually (e.g., 1,000 days from June 15, 2020 should be March 12, 2023)
- Past milestones show with "Already Passed" badge
- Future date validation prevents calculation
- Results update correctly when calculating multiple times with different inputs
- Browser timezone is used (verify by checking results against system clock)

---

## Testing Strategy

### Unit Tests:

(Future phase - not in this plan scope)

- `validateDateTime()` with various valid/invalid inputs
- `filterEvents()` with events of different categories
- `groupByCategory()` with mixed event array
- `sortEventsByDate()` with unsorted events

### Integration Tests:

(Future phase - not in this plan scope)

- DateTimeInput validation flow
- MilestoneCalculator state management
- Event generation via DateTimeCard

### Manual Testing Steps:

1. **Happy path (with time)**: Enter past date "2020-06-15" and time "14:30", verify grouped results appear sorted correctly with second/minute/hour milestones
2. **Happy path (date only)**: Enter past date "2020-06-15" without time, verify results show only day/week/month milestones
3. **Default values**: On page load, verify date and time inputs are pre-filled with current date/time
4. **Set to Now button**: Clear inputs, click "Set to Now", verify both inputs populate with current date/time
5. **Reset button**: Fill inputs, click "Reset", verify both inputs clear
6. **Past milestones**: Enter old date (e.g., "2010-01-01"), verify past events show with "Already Passed" badge and muted styling
7. **Future date validation**: Enter tomorrow's date, verify error blocks calculation
8. **Empty date**: Clear date input, verify error: "Date is required"
9. **Browser timezone**: Check that results match local time (e.g., calculate at 2:30 PM local time, verify "Today" category includes milestones due today in local time)
10. **Beyond lifetime filter**: Enter very old date (e.g., "1900-01-01"), verify count indicator shows filtered events
11. **Locale formatting**: Test with different browser language settings (en-US vs en-GB) and verify date format matches (MM/DD/YYYY vs DD/MM/YYYY)
12. **Edge case - today's date**: Enter exactly today's date with current time, verify no past events appear
13. **Multiple calculations**: Calculate for different dates/times in sequence, verify results update correctly each time

## Performance Considerations

- Milestone calculation is synchronous and completes in <10ms for typical date ranges (DateTimeCard instantiation + getEvents loop)
- Event array size is bounded by UnitsConfig (approximately 30-50 events typical, ~100 max)
- Grouping and sorting operations are O(n) and O(n log n) respectively - acceptable for n < 200
- No need for virtualization or pagination at this scale
- Browser timezone lookup via `Temporal.Now.timeZoneId()` is a single native call

## References

- Roadmap: `context/foundation/roadmap.md` (S-01 section, lines 97-105)
- PRD User Story: `context/foundation/prd.md` (US-01, lines 59-74)
- Lessons: `context/foundation/lessons.md` (no lodash rule)
- Existing calculation logic: `src/utils/classes/CardBase.ts`, `DateTimeCard.ts`, `Event.ts`
- Event categories: `src/utils/enums/EventCategory.ts`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Date/Time Input Component

#### Automated

- [x] 1.1 Type checking passes: `npm run typecheck`
- [x] 1.2 Linting passes: `npm run lint`
- [x] 1.3 Build succeeds: `npm run build`
- [x] 1.4 Component renders without errors: `npm run dev` and navigate to localhost

#### Manual

- [x] 1.5 Date input renders as HTML5 date picker with current date as default
- [x] 1.6 Time input renders as HTML5 time picker with current time as default
- [x] 1.7 Both inputs are visible by default
- [x] 1.8 Empty date input shows validation error: "Date is required"
- [x] 1.9 Future date shows validation error: "Please enter a past or present date"
- [x] 1.10 "Set to Now" button populates both inputs with current date/time
- [x] 1.11 "Reset" button clears both inputs
- [x] 1.12 Valid past date without time calls onCalculate with date only
- [x] 1.13 Valid past date with time calls onCalculate with both date and time

### Phase 2: Milestone Results Display

#### Automated

- [ ] 2.1 Type checking passes: `npm run typecheck`
- [ ] 2.2 Linting passes: `npm run lint`
- [ ] 2.3 Build succeeds: `npm run build`
- [ ] 2.4 Component renders without errors with sample Event array

#### Manual

- [ ] 2.5 Events grouped under correct category headers (Today, ThisWeek, etc.)
- [ ] 2.6 Within each group, nearest milestone appears first
- [ ] 2.7 Past events show with muted styling and "Already Passed" badge
- [ ] 2.8 BeyondHumanLifeExpectancy events do not appear in any group
- [ ] 2.9 Count indicator shows: "12 more beyond 75 years" (or appropriate count)
- [ ] 2.10 Empty state message appears when no events to display

### Phase 3: Main Calculator Integration

#### Automated

- [ ] 3.1 Type checking passes: `npm run typecheck`
- [ ] 3.2 Linting passes: `npm run lint`
- [ ] 3.3 Build succeeds: `npm run build`
- [ ] 3.4 Dev server starts without errors: `npm run dev`

#### Manual

- [ ] 3.5 App loads showing header and date/time input form with current date/time as defaults
- [ ] 3.6 Input date "2020-06-15" and time "14:30", click Calculate
- [ ] 3.7 Milestone results appear grouped by proximity with second/minute/hour milestones
- [ ] 3.8 Input date "2020-06-15" without time, click Calculate, see only day/week/month milestones
- [ ] 3.9 Verify a few milestone calculations manually (e.g., 1,000 days from June 15, 2020 should be March 12, 2023)
- [ ] 3.10 Past milestones show with "Already Passed" badge
- [ ] 3.11 Future date validation prevents calculation
- [ ] 3.12 "Set to Now" and "Reset" buttons work correctly
- [ ] 3.13 Results update correctly when calculating multiple times with different inputs
- [ ] 3.14 Browser timezone is used (verify by checking results against system clock)
- [ ] 3.15 Dates display according to browser locale (test with en-US and en-GB if possible)
