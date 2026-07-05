---
change_id: test-phase-1-calculation
phase: 1
status: complete
created: 2026-07-05
completed: 2026-07-05
test_plan_section: "§2 Phase 1"
risk_coverage: R1
---

# Phase 1: Milestone Calculation Accuracy (Unit Tests)

## Change Brief

**Goal:** Cover **R1 (Milestone calculation produces wrong dates)** with fast, deterministic unit tests for date math edge cases.

**Scope:**
- Unit tests for milestone calculation logic (timezone, DST transitions, leap years, far-future dates, boundary cases)
- Test framework setup (Vitest configuration)
- CI gate integration (unit tests block merge after this phase ships)
- Pre-commit hook setup (lint + typecheck, optional: unit tests if <10s)
- Update `test-plan.md` §6 (cookbook: unit test location, naming, reference test, run command)

**Out of scope:**
- Integration tests (Phase 2)
- E2E tests (Phase 4)
- UI component testing (Phase 2–3)
- Firestore/Auth mocking (Phase 2)

## Risk Coverage

### R1: Milestone calculation produces wrong dates (timezone/DST/leap-year edge cases)
- **Impact:** High — Core value prop breaks; users miss celebrations or plan wrong dates
- **Likelihood:** Medium — Temporal API mitigates but edge cases are complex
- **Source:** PRD FR-025 (DST, leap years, timezone edge cases); Hot-spot: `src/utils/classes/Milestone.ts` (18 commits), `src/utils/classes/DateTimeCard.ts` (7 commits)

**Evidence from codebase scan:**
- `src/utils/classes/Milestone.ts` — High churn (18 commits), likely core calculation logic
- `src/utils/classes/DateTimeCard.ts` — 7 commits, handles date+time input
- `src/utils/classes/DateCard.ts` — Date-only input variant
- Temporal API polyfill (`@js-temporal/polyfill` in `package.json`) — Modern date/time library with better DST/timezone handling than native Date

**Test surface (inferred, to verify in `/10x-research`):**
- Milestone calculation for power-of-10 intervals (10, 100, 1K, 10K, 100K, 1M) across time units (years, months, weeks, days, hours, minutes, seconds)
- DST transition edge cases (e.g., 1,000 hours crossing spring-forward / fall-back)
- Leap year handling (e.g., 1,000 days starting from Feb 29, 2020)
- Timezone override (user picks Berlin time, calculation respects Europe/Berlin DST rules)
- Far-future date filtering (milestones beyond ~120 years excluded per PRD NFR)
- Boundary cases (e.g., negative intervals, zero intervals, maximum safe integer)

## Quality Signal

**Success criteria (what "done" looks like):**
1. ✅ Unit test suite runs in CI (`npm run test:unit` or `npm test`)
2. ✅ CI blocks merge if any unit test fails (GitHub Actions workflow updated)
3. ✅ At least 10 edge-case tests for R1 covering:
   - DST transition (spring-forward, fall-back)
   - Leap year (start date Feb 29, milestone crosses leap year boundary)
   - Timezone override (UTC vs. local timezone vs. arbitrary timezone like Asia/Tokyo)
   - Far-future filtering (milestone date > 2146 or ~120 years from start date)
   - Power-of-10 boundaries (e.g., 999 vs. 1,000 days; 9,999 vs. 10,000 hours)
4. ✅ Pre-commit hook configured (lint + typecheck; optionally unit tests if <10s)
5. ✅ `test-plan.md` §6 updated with:
   - Unit test location (e.g., `src/utils/classes/__tests__/Milestone.test.ts`)
   - Naming convention (e.g., `describe('Milestone')` / `it('calculates 10,000 days with DST transition')`)
   - Reference test (link to 1–2 representative tests)
   - Run command (`npm run test:unit` or `npm test`)
   - Coverage target (e.g., "100% for pure date math functions in `src/utils/classes/`")

**Non-goals (defer to later phases):**
- Integration tests for components (`MilestoneCalculator.tsx`, `MilestoneResults.tsx`) → Phase 2
- E2E smoke test for anonymous user journey → Phase 4
- Multimodal UI review of calculation results → Phase 3

## Risks to Verify in `/10x-research`

1. **Where does calculation logic live?**  
   Hot-spot scan suggests `Milestone.ts`, `DateTimeCard.ts`, `DateCard.ts` — which files contain the actual math? Are there util functions or helpers we should test?

2. **How is Temporal API used?**  
   Does the code use `Temporal.PlainDate`, `Temporal.ZonedDateTime`, or both? How are DST transitions handled? (This determines which test fixtures we need.)

3. **What time units are actually calculated?**  
   PRD says "years, months, weeks, days, hours, minutes, seconds" but does the code compute all? Or subset based on date-only vs. date+time input?

4. **How is the ~120-year filter implemented?**  
   Is there a hardcoded cutoff year (e.g., `2146`) or a relative calculation (e.g., `startDate + 120 years`)? Where does this logic live?

5. **Are there existing manual tests or fixtures?**  
   Check archive folders (`context/archive/2026-07-02-calculate-milestones/`) for any testing notes, edge cases documented, or validation scripts.

6. **What test framework (if any) is already configured?**  
   Does `package.json` have `vitest`, `jest`, or other? If yes, is there a config file? If no, do we scaffold from scratch?

## Next Steps

**After this change opens:**
1. **`/clear`** (start fresh context)
2. **`/10x-research`** with the 6 questions above  
   Output: `context/changes/test-phase-1-calculation/research.md`
3. **`/10x-plan`** with constraints:
   - Cost: Unit tests should run <10s locally, <30s in CI
   - Signal: Prioritize R1 edge cases (DST, leap year, timezone override) over happy-path (basic 100-day calculation already works, per roadmap S-01 archived)
   - Cookbook update: `test-plan.md` §6 first entry (unit tests) must be actionable for future devs
4. **`/10x-implement test-phase-1-calculation phase 1`** (write tests + wire CI)
5. **Re-invoke `/10x-test-plan`** to advance to Phase 2

---

**Status:** `change_opened` → Ready for `/10x-research`