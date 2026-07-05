---
change_id: custom-milestone-values
roadmap_id: S-05
title: Custom milestone values
status: complete
created: 2026-07-04
planned_at: 2026-07-04
completed_at: 2026-07-05
stream: B
---

# Change: Custom milestone values

## Roadmap Context

**Outcome:** User can add custom milestone values (e.g., 25,000 days, 420 hours, 2137 seconds) to any input date during calculation; custom values are session-only and appear sorted alongside default power-of-10 milestones (nearest first).

**PRD refs:** FR-006, US-06

**Prerequisites:** 
- S-01 (calculate-milestones) - done (archived 2026-07-02)

**Unlocks:** None (feature enhancement for all users)

## Change Notes

- All prerequisites are complete and deployed
- S-01 milestone calculation provides the foundation (power-of-10 milestones with sorting)
- Milestone calculation engine already handles sorting by nearest-first
- **Critical architecture decision:** Custom milestones are **session-only** (React state, NOT Firebase). Available to **all users** (anonymous + logged-in). Stored as **value+unit offsets** (e.g., `{id: "420-days", value: 420, unit: "days"}`), calculated at display time: `inputDate + value [unit]` = milestone date. This ensures editing input date automatically recalculates custom milestones with no stale data. Lost on page refresh.
- Design decision: Start with session-only to validate feature usage. Future enhancement could add "Save custom milestones" button (requires login + associates with bookmark).
- Custom values should integrate seamlessly with existing power-of-10 milestones in display (merged, sorted by proximity).

## Open Questions

1. UI placement: Add custom milestone button per bookmarked date in portfolio view, or within calculator after selecting a bookmark?
   - **Decision:** In calculator (available to all users, not just bookmark owners). Button below results or in header.

2. Input validation: Min/max value constraints? (e.g., min 1, max 1,000,000,000?)
   - **Decision:** Min 1, max 1,000,000,000 - reasonable bounds for custom milestone values

3. Duplicate handling: Allow duplicate custom values per date, or enforce uniqueness?
   - **Decision:** Enforce uniqueness (prevent duplicate value+unit pairs in current session) - avoids confusion and clutter

4. Edit/delete: Should users be able to edit existing custom milestones, or only add/remove?
   - **Decision:** Delete only (no edit) - simpler implementation for MVP. User can remove + re-add if needed.

5. Display: How to visually distinguish custom milestones from default power-of-10 milestones in the results list?
   - **Decision:** "Custom" badge + remove button (X icon) - clear distinction and inline delete functionality

6. Unit selection: Should UI pre-filter time units based on bookmark date context (e.g., hide seconds for dates >100 years old)?
   - **Decision:** Filter based on input type (date-only vs. date+time). Date-only: show years/months/weeks/days only. Date+time: show all units.

7. Persistence: Should custom milestones persist across sessions, or be session-only?
   - **Decision:** Session-only (React state, lost on refresh). Simpler MVP, validates feature usage. Future enhancement: "Save custom milestones" button (requires login + bookmark).

## Links

- Roadmap: `context/foundation/roadmap.md` (S-05)
- Bookmark foundation: `context/archive/2026-07-05-bookmark-and-manage/`
- Schema foundation: `context/archive/2026-07-03-firestore-portfolio-schema/`
- Milestone calculation: `context/archive/2026-07-02-calculate-milestones/`
