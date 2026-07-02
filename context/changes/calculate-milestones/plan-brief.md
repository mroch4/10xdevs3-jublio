# Calculate Milestones — Plan Brief

> Full plan: `context/changes/calculate-milestones/plan.md`

## What & Why

Build the core milestone calculation UI: users input a date and time, then see a sorted list of future milestones (10, 100, 1K, 10K, 100K, 1M for each time unit). This is S-01 from the roadmap — the foundational feature that proves the calculation algorithm works before adding bookmark/sharing capabilities.

## Starting Point

The application already has the calculation engine built: `CardBase`, `DateCard`, `DateTimeCard`, and `Event` classes use the Temporal API to generate milestone events with automatic categorization (Today, ThisWeek, ThisMonth, etc.). The UI currently shows only a header with no interactive elements.

## Desired End State

Users can enter a date and time into form inputs, click Calculate, and see milestone results grouped by time proximity (This Week, This Month, This Year, etc.) with past milestones visually distinguished and far-future milestones filtered. The calculation is instant and updates correctly when recalculating with different inputs.

## Key Decisions Made

| Decision                      | Choice                                     | Why (1 sentence)                                                                                                | Source |
| ----------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------ |
| Date and time input UX        | Always show both, time is optional         | Date required per PRD, time optional - when time provided shows hours/minutes/seconds milestones                | Plan   |
| Default input values          | Current date/time                          | Better UX - users can immediately calculate or adjust from "now" baseline                                       | Plan   |
| Control buttons               | "Reset" and "Set to Now"                   | Convenience features for quick input management                                                                 | Plan   |
| Locale-aware formatting       | Use browser's navigator.language           | Dates display according to user's culture (MM/DD/YYYY vs DD/MM/YYYY)                                            | Plan   |
| DateCard vs DateTimeCard      | Choose based on time input presence        | When time empty, use DateCard for day-level milestones; when time provided, use DateTimeCard for all units      | Plan   |
| Past milestone display        | Show with visual indicator                 | Matches existing Event.category logic that already handles AlreadyPassed category; provides historical context  | Plan   |
| Milestone grouping            | Group by time proximity                    | Leverages Event.getCategory() which already computes Today/ThisWeek/ThisMonth/etc. — minimal additional work    | Plan   |
| Far-future milestone handling | Filter out beyond 75 years, show count     | Matches existing Event.isBeyondLimit() logic and PRD guideline; keeps results practical while being transparent | Plan   |
| Timezone handling             | Browser timezone (implicit)                | Simplest UX for MVP; matches user's current context automatically via Temporal API                              | Plan   |
| Future date input             | Block with validation error                | Forces intended use case (celebrating past events); prevents confusing UX                                       | Plan   |
| Milestone sort order          | Chronological (nearest first) within group | Natural reading order; matches PRD's "sorted list, nearest first" requirement                                   | Plan   |

## Scope

**In scope:**

- Date input (required) and time input (optional) with default values (current date/time)
- "Reset" and "Set to Now" control buttons for UX convenience
- Locale detection via navigator.language for culture-specific date formatting
- Milestone calculation using DateCard (date only) or DateTimeCard (date + time)
- Grouped display by time proximity (Today, ThisWeek, ThisMonth, etc.)
- Visual indicators for past milestones
- Filtering of far-future milestones with count indicator
- Future date validation blocking

**Out of scope:**

- Timezone selector (using browser timezone only)
- Bookmark/save functionality (S-02)
- Calendar export (S-03)
- Social sharing (S-04)
- Authentication (anonymous only for S-01)
- Loading states (calculation is synchronous)
- Past milestone toggle (always shown)

## Architecture / Approach

Three React components wrap the existing calculation classes:

```
MilestoneCalculator (parent, manages locale + chooses DateCard vs DateTimeCard)
├── DateTimeInput (form + validation + control buttons)
└── MilestoneResults (grouped display with locale-aware formatting)
```

Flow: Form loads with current date/time → User adjusts or uses Reset/Set to Now buttons → clicks Calculate → validation runs → if time provided, instantiate `DateTimeCard` (includes second/minute/hour milestones); if time empty, instantiate `DateCard` (day/week/month only) → `getEvents()` called → filter out BeyondHumanLifeExpectancy → group by Event.category → render with locale-aware date formatting.

Reuses existing assets: `DateCard` and `DateTimeCard` for calculation, `Event` for categorization, `EventCategory` enum for grouping, Temporal API for date math. No new dependencies added.

## Phases at a Glance

| Phase                          | What it delivers                                                     | Key risk                                                      |
| ------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1. Date/Time Input Component   | Form with validation, control buttons, defaults to current date/time | Temporal API parsing from HTML5 inputs; validation UX clarity |
| 2. Milestone Results Display   | Grouped, sorted milestone list with locale-aware formatting          | Grouping logic complexity; locale formatting edge cases       |
| 3. Main Calculator Integration | End-to-end flow, chooses DateCard vs DateTimeCard based on input     | State management; conditional logic for card selection        |

**Prerequisites:** None (S-01 has no dependencies)

**Estimated effort:** ~3-4 hours across 3 phases

## Open Risks & Assumptions

- Browser HTML5 date/time input UX varies by browser; validation messages may look different
- Assumption: Time is truly optional per PRD - when user provides date only, they get day-level milestones (DateCard); when they add time, they get hour/minute/second milestones too (DateTimeCard)
- Past milestones will make result lists long for very old dates — acceptable for MVP but may need pagination in future
- Locale formatting relies on browser's navigator.language - assumes this is accurate for the user's preferred culture

## Success Criteria (Summary)

- User can input date "2020-06-15" with time "14:30", click Calculate, see grouped milestones including second/minute/hour events
- User can input date "2020-06-15" without time, click Calculate, see only day/week/month milestones
- Form loads with current date/time as defaults
- "Set to Now" and "Reset" buttons work correctly
- Future date input shows validation error and blocks calculation
- Past milestones display with "Already Passed" badge and muted styling
- Milestones beyond 75 years are hidden with count indicator
- Dates format according to browser locale (MM/DD/YYYY for en-US, DD/MM/YYYY for en-GB, etc.)
