---
change_id: bookmark-and-manage
roadmap_id: S-02
title: Bookmark and manage portfolio
status: planning
created: 2026-07-03
stream: B
---

# Change: Bookmark and manage portfolio

## Roadmap Context

**Outcome:** User can bookmark their input date/datetime with a required unique label, view all bookmarked dates in a persistent portfolio, click a bookmark to autofill Calculator and recalculate milestones, edit any bookmarked date (date/time/label), and remove dates. Portfolio persists across sessions and devices.

**PRD refs:** FR-010, FR-011, FR-012, FR-013, FR-014, US-02, US-04

**Prerequisites:** 
- F-01 (firebase-auth-scaffold) - done
- F-02 (firestore-portfolio-schema) - done
- S-01 (calculate-milestones) - done

**Unlocks:** S-05 (custom-milestone-values)

## North Star

This is THE north star slice from the roadmap: _"Proves the core differentiation (portfolio-as-multiplier) over single-use calculators. Returns + retention signal indicate the hypothesis works."_

## Change Notes

- All prerequisites are complete and deployed
- Firebase Auth is configured with email/password + Google OAuth
- Firestore collections (users, savedDates) are live with security rules
- S-01 milestone calculation engine is ready to integrate
- This change proves the core product hypothesis: portfolio multiplies celebration opportunities
- **Design decision:** User bookmarks **input date/datetime** (NOT milestone dates). Portfolio shows saved dates (label + date/time). Clicking a bookmark switches to Calculator tab and autofills the input → triggers automatic recalculation. This reuses existing calculation flow and keeps portfolio simple.

## Open Questions

1. Label validation UI feedback: inline vs. toast vs. modal error? → **Decision:** Inline errors for validation, toasts for async errors
2. Edit mode: inline editing vs. dedicated edit view? → **Decision:** Dedicated modal for consistency
3. Bookmark button placement: per milestone vs. single button in calculator? → **Decision:** Single button in `MilestoneCalculator` (below input) - user bookmarks input date, not milestones
4. Delete confirmation: modal vs. inline confirmation vs. undo toast? → **Decision:** Modal confirmation + success toast (no undo in MVP)

## Links

- Roadmap: `context/foundation/roadmap.md` (S-02)
- Auth foundation: `context/archive/2026-07-03-firebase-auth-scaffold/`
- Schema foundation: `context/archive/2026-07-03-firestore-portfolio-schema/`
- Milestone calculation: `context/archive/2026-07-02-calculate-milestones/`
