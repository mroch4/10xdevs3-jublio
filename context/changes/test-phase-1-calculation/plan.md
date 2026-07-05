---
change_id: test-phase-1-calculation
phase: 1
status: planned
created: 2026-01-15
test_plan_section: "§2 Phase 1"
risk_coverage: R1
---

# Plan: Phase 1 — Milestone Calculation Accuracy (Unit Tests)

## Overview

Implement unit tests for milestone calculation logic to cover **R1 (Milestone calculation produces wrong dates)**. This phase scaffolds Vitest, writes edge-case tests for date math (leap years, 75-year cutoff, timezone handling), integrates CI gates, and updates the test plan cookbook.

**Risk:** R1 — Milestone calculation produces wrong dates (timezone/DST/leap-year edge cases)  
**Impact:** High — Core value prop breaks; users miss celebrations  
**Likelihood:** Medium — Temporal API mitigates but edge cases are complex  

## Current State

**From research (`research.md`):**
- **No test framework configured** — Must scaffold Vitest from scratch
- **Calculation logic:** Distributed across `CardBase`, `DateCard`, `DateTimeCard`, `Milestone`, `UnitsConfig`, `validation.ts`
- **7 test surface areas** identified (pure functions, no UI dependencies)
- **7 recommended fixtures** for edge cases (leap year, 75-year cutoff, custom milestones, validation)
- **4 design decisions confirmed** by user:
  1. 75-year life expectancy (not 120)
  2. Years NOT calculated (easy for humans to count)
  3. Months calculated (not in UnitsConfig, intentional)
  4. DST uses wall-clock hours (deterministic)

**What exists:**
- ✅ TypeScript 6.0.2, ESLint 10.3.0, Vite 8.1.3
- ✅ `npm run build`, `npm run lint` already in CI (`.github/workflows/deploy.yml`)
- ✅ `@js-temporal/polyfill` for Temporal API

**What's missing:**
- ❌ Vitest + configuration
- ❌ Test files
- ❌ `npm run test` script
- ❌ CI gate for unit tests
- ❌ Pre-commit hook (optional)
- ❌ `test-plan.md` §6 cookbook entry

## Desired End State

**Success criteria:**
1. ✅ Unit test suite runs via `npm test` or `npm run test:unit`
2. ✅ CI blocks merge if any unit test fails (GitHub Actions updated)
3. ✅ At least 15 edge-case tests covering:
   - Leap year (start date Feb 29, cross leap year boundaries)
   - 75-year life expectancy cutoff
   - Month boundary overflow (Jan 31 + 1 month)
   - Custom milestone values (420, 2137)
   - Validation (future date, empty time normalization)
   - Design decisions (no years, months included, wall-clock DST)
4. ✅ Pre-commit hook configured (lint + typecheck; optionally unit tests if <10s)
5. ✅ `test-plan.md` §6 updated with cookbook entry
6. ✅ Tests run <10s locally, <30s in CI

**Verification:**
- `npm test` passes all tests (<10s)
- `npm run build` passes (types + lint)
- CI workflow runs tests on every PR
- Merge blocked if any test fails
- Cookbook entry links to reference test (leap year or 75-year cutoff)

## What We're NOT Doing

- Integration tests (components, Firestore, Auth) → Phase 2
- E2E tests (Playwright, user journeys) → Phase 4
- React Testing Library setup → Phase 2
- DOM environment (`jsdom`) → Phase 2 (Phase 1 tests pure functions only)
- Performance benchmarks → Out of scope (no identified risk)
- Test coverage reports → Nice-to-have, not blocking

## Implementation Approach

Build test suite in 4 phases:

1. **Scaffold Vitest** — Install, configure, wire `npm test` script
2. **Write edge-case tests** — 7 test files covering 7 test surface areas
3. **Wire CI gate** — Update GitHub Actions to run tests and block merge on failure
4. **Update cookbook** — Document test location, naming, run command in `test-plan.md` §6

**Key principles:**
- **Cost × signal:** Prioritize edge cases (leap year, 75-year cutoff) over happy-path
- **Deterministic:** Inject `now` parameter to avoid flaky time-based tests
- **Colocated:** Place tests in `src/utils/classes/__tests__/` alongside code
- **Fast:** Target <10s locally (pure date math, no I/O)

---

## Phase 1.1: Scaffold Vitest

### Overview

Install Vitest and configure for pure function unit tests (no DOM). Wire `npm test` script.

### Changes Required

#### 1. Install Vitest

**Command:**
```powershell
npm install --save-dev vitest
```

**Intent:** Add Vitest as dev dependency for unit testing.

**Verify:** `package.json` includes `"vitest": "^x.x.x"` in `devDependencies`.

#### 2. Add test script to package.json

**File:** `package.json`

**Change:**
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

**Intent:** 
- `npm test` runs tests once (CI mode)
- `npm run test:watch` runs in watch mode (dev mode)

**Rationale:** Standard Vitest commands. `vitest run` exits after tests (CI-friendly); `vitest` (no args) stays in watch mode.

#### 3. Configure Vitest in vite.config.ts

**File:** `vite.config.ts`

**Change:**
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "",
  test: {
	globals: true,
	environment: "node", // Phase 1: pure functions, no DOM
	include: ["src/**/*.test.ts"],
  },
});
```

**Intent:** Configure Vitest to:
- Enable globals (`describe`, `it`, `expect` without imports)
- Use Node environment (no `jsdom` — pure functions only)
- Include only `*.test.ts` files in `src/` (not `*.tsx` — no React component tests yet)

**Rationale:** Phase 1 tests pure date math functions (no UI). `node` environment is faster than `jsdom` and sufficient for this phase.

#### 4. Create TypeScript types for Vitest globals

**File:** `src/vitest.d.ts` (new file)

**Content:**
```typescript
/// <reference types="vitest/globals" />
```

**Intent:** Enable TypeScript IntelliSense for `describe`, `it`, `expect` globals.

**Rationale:** With `globals: true` in Vitest config, this file tells TypeScript about global test functions.

### Success Criteria

- `npm test` runs (exits with "no tests found" until tests written)
- No TypeScript errors in test files using `describe`, `it`, `expect`
- `vite.config.ts` includes `test` section
- `package.json` includes `test` script

---

## Phase 1.2: Write Edge-Case Tests

### Overview

Write 15+ unit tests covering 7 test surface areas. Focus on R1 edge cases (leap year, 75-year cutoff, validation).

### Test File Structure

**Location:** Colocated with code in `src/utils/classes/__tests__/`

**Files to create:**
1. `src/utils/classes/__tests__/CardBase.test.ts` — Power-of-10 + custom milestone generation
2. `src/utils/classes/__tests__/DateCard.test.ts` — Date-only calculation
3. `src/utils/classes/__tests__/DateTimeCard.test.ts` — Date+time calculation
4. `src/utils/classes/__tests__/Milestone.test.ts` — Categorization + 75-year cutoff
5. `src/utils/__tests__/validation.test.ts` — Input validation (future date, empty time)
6. `src/utils/__tests__/temporal-edge-cases.test.ts` — Temporal API usage (leap year, month overflow)
7. `src/utils/__tests__/design-decisions.test.ts` — Confirm 4 design decisions

**Naming convention:** `*.test.ts` (Vitest default pattern)

### Test Cases by Priority

#### High Priority (R1 edge cases)

**1. Leap year start date (2020-02-29)**
- **File:** `temporal-edge-cases.test.ts`
- **Test:** Start `2020-02-29`, add 1,000 days → expect `2022-11-24`
- **Rationale:** Crosses leap year boundary (2020 → 2021 non-leap)
- **Signal:** Verifies Temporal API handles leap year arithmetic correctly

**2. 75-year life expectancy cutoff**
- **File:** `Milestone.test.ts`
- **Test:** Start `2000-01-01`, milestone `2273-12-05` (273.9 years away), inject `now = 2026-01-15` → expect category `BeyondHumanLifeExpectancy`
- **Rationale:** Confirms 75-year cutoff (2026 + 75 = 2101; 2273 > 2101)
- **Signal:** Verifies design decision #1 (75 years, not 120)

**3. 75-year boundary edge case**
- **File:** `Milestone.test.ts`
- **Test:** Start `2000-01-01`, milestone `2075-01-01` (exactly 75 years from `now = 2000-01-01`), inject `now = 2000-01-01` → expect category NOT `BeyondHumanLifeExpectancy` (milestone at cutoff = included)
- **Rationale:** Boundary case — exactly at 75-year limit
- **Signal:** Clarifies `>` vs. `>=` behavior in `isBeyondLimit()`

**4. Future date validation**
- **File:** `validation.test.ts`
- **Test:** `validateDateTime("2030-01-01")` → expect `{ isValid: false, error: "Please enter a past or present date" }`
- **Rationale:** Core validation rule — no future dates allowed
- **Signal:** Prevents bad input that breaks calculation

**5. Today with future time validation**
- **File:** `validation.test.ts`
- **Test:** Current date + time 1 hour in future → expect `{ isValid: false, error: "Please enter a past or present date and time" }`
- **Rationale:** Edge case — date is today but time is future
- **Signal:** Validation must check both date AND time

#### Medium Priority (design decisions + custom milestones)

**6. Years NOT calculated**
- **File:** `design-decisions.test.ts`
- **Test:** `DateCard` and `DateTimeCard` generate milestones → assert NO milestone has `unit === "years"`
- **Rationale:** Confirms design decision #2 (years easy for humans to count)
- **Signal:** Prevents regression if someone adds years to `members` array

**7. Months ARE calculated**
- **File:** `design-decisions.test.ts`
- **Test:** `DateCard` generates milestones → assert at least one milestone has `unit === "months"`
- **Rationale:** Confirms design decision #3 (months useful, not in UnitsConfig)
- **Signal:** Verifies month-based milestones work

**8. Custom milestone values**
- **File:** `CardBase.test.ts`
- **Test:** Start `2020-01-01`, custom milestones `[{ unit: "days", value: 420, id: "c1" }]` → expect milestone at `2021-02-24` with `isCustom = true`, `customId = "c1"`
- **Rationale:** Custom values (420, 2137) are core feature
- **Signal:** Verifies custom milestone generation logic

**9. Month boundary overflow**
- **File:** `temporal-edge-cases.test.ts`
- **Test:** Start `2020-01-31`, add 1 month → expect `2020-02-29` (not March 2)
- **Rationale:** February has fewer days than January
- **Signal:** Verifies Temporal API handles month overflow correctly

**10. Empty time string normalization**
- **File:** `validation.test.ts`
- **Test:** `validateDateTime("2020-01-01", "")` → expect `{ isValid: true, date: PlainDate, time: undefined }`
- **Rationale:** Empty time treated as date-only input
- **Signal:** Verifies edge case from research finding F3

#### Low Priority (happy-path + determinism)

**11. Basic date-only calculation (happy-path)**
- **File:** `DateCard.test.ts`
- **Test:** Start `2020-01-01` → expect 10 days at `2020-01-11`, 100 days at `2020-04-10`, 1,000 days at `2022-09-27`
- **Rationale:** Basic sanity check (already works per S-01)
- **Signal:** Regression test for core functionality

**12. Basic date+time calculation (happy-path)**
- **File:** `DateTimeCard.test.ts`
- **Test:** Start `2020-01-01T12:00:00` → expect 1,000 seconds at `2020-01-01T12:16:40`, 10,000 hours at `2021-02-14T04:00:00`
- **Rationale:** Basic sanity check for time-based milestones
- **Signal:** Regression test for time calculation

**13. Category detection — Today**
- **File:** `Milestone.test.ts`
- **Test:** Milestone date = `2026-01-15`, inject `now = 2026-01-15T12:00:00` → expect category `Today`
- **Rationale:** Categorization logic (date-only comparison, ignoring time)
- **Signal:** Verifies `isToday()` helper

**14. Category detection — ThisWeek**
- **File:** `Milestone.test.ts`
- **Test:** Milestone date = `2026-01-17` (Friday), inject `now = 2026-01-15T12:00:00` (Wednesday) → expect category `ThisWeek`
- **Rationale:** Week boundary detection
- **Signal:** Verifies week calculation logic (lines 44–56)

**15. Category detection — AlreadyPassed**
- **File:** `Milestone.test.ts`
- **Test:** Milestone date = `2020-01-01`, inject `now = 2026-01-15T12:00:00` → expect category `AlreadyPassed`
- **Rationale:** Past milestone detection
- **Signal:** Verifies `isPast()` helper

### Code Example: Reference Test (Leap Year)

**File:** `src/utils/__tests__/temporal-edge-cases.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import DateCard from "../classes/DateCard";

describe("Temporal API Edge Cases", () => {
  describe("Leap year handling", () => {
	it("calculates 1,000 days from leap day (2020-02-29) correctly", () => {
	  // Arrange: Start from leap day
	  const startDate = Temporal.PlainDate.from("2020-02-29");
	  const card = new DateCard(startDate, "en-US");

	  // Act: Generate milestones
	  const events = card.getEvents();

	  // Assert: Find 1,000-day milestone
	  const milestone1000 = events.find(
		(e) => e.label === "1,000 days"
	  );
	  expect(milestone1000).toBeDefined();

	  // Expected: 2020-02-29 + 1,000 days = 2022-11-24
	  // (crosses 2021 non-leap year, so Feb has 28 days)
	  const expectedDate = Temporal.PlainDate.from("2022-11-24");
	  expect(Temporal.PlainDate.compare(milestone1000!.date, expectedDate)).toBe(0);
	});

	it("handles adding 1 year from leap day (rounds to Feb 28)", () => {
	  // Note: This test documents Temporal API behavior
	  // Years are NOT calculated in milestones (design decision #2)
	  // but Temporal API handles this case if used elsewhere
	  const leapDay = Temporal.PlainDate.from("2020-02-29");
	  const nextYear = leapDay.add({ years: 1 });

	  // Expected: 2021-02-28 (not 2021-03-01)
	  expect(nextYear.toString()).toBe("2021-02-28");
	});
  });

  describe("Month boundary overflow", () => {
	it("handles adding 1 month from Jan 31 (overflows to Feb 29)", () => {
	  const jan31 = Temporal.PlainDate.from("2020-01-31");
	  const oneMonthLater = jan31.add({ months: 1 });

	  // Expected: 2020-02-29 (February has fewer days)
	  expect(oneMonthLater.toString()).toBe("2020-02-29");
	});
  });
});
```

**Rationale:** This reference test demonstrates:
- Deterministic date fixtures (`2020-02-29`, `2022-11-24`)
- Clear arrange-act-assert structure
- Type-safe Temporal API usage
- Comments explaining expected behavior

### Changes Required

#### 1. Create `src/utils/classes/__tests__/` directory

**Command:**
```powershell
New-Item -ItemType Directory -Path "src/utils/classes/__tests__" -Force
```

#### 2. Create `src/utils/__tests__/` directory

**Command:**
```powershell
New-Item -ItemType Directory -Path "src/utils/__tests__" -Force
```

#### 3. Write 7 test files (15+ tests total)

**Files:**
1. `src/utils/__tests__/temporal-edge-cases.test.ts` — Tests 1, 9 (leap year, month overflow)
2. `src/utils/classes/__tests__/Milestone.test.ts` — Tests 2, 3, 13, 14, 15 (75-year cutoff, categories)
3. `src/utils/__tests__/validation.test.ts` — Tests 4, 5, 10 (future date, future time, empty string)
4. `src/utils/__tests__/design-decisions.test.ts` — Tests 6, 7 (years NOT calculated, months ARE)
5. `src/utils/classes/__tests__/CardBase.test.ts` — Test 8 (custom milestones)
6. `src/utils/classes/__tests__/DateCard.test.ts` — Test 11 (date-only happy-path)
7. `src/utils/classes/__tests__/DateTimeCard.test.ts` — Test 12 (date+time happy-path)

**Implementation notes:**
- **Inject `now` parameter** in `Milestone` constructor to avoid flaky time-based tests (use optional parameter from line 17)
- **Use `Temporal.PlainDate.compare()`** for date assertions (returns -1, 0, 1)
- **Use `.toString()`** for human-readable error messages (e.g., `expect(date.toString()).toBe("2022-11-24")`)
- **Use `.find()` or `.filter()`** to locate specific milestones in `events` array

### Success Criteria

- `npm test` runs 15+ tests, all pass
- Tests run <10s locally
- Each test has clear arrange-act-assert structure
- No flaky tests (all use injected `now` parameter, not `Temporal.Now`)
- Coverage includes all 4 design decisions

---

## Phase 1.3: Wire CI Gate

### Overview

Update GitHub Actions workflow to run unit tests on every PR and block merge if any test fails.

### Changes Required

#### 1. Update `.github/workflows/deploy.yml`

**File:** `.github/workflows/deploy.yml`

**Current state (from research):**
```yaml
# Existing workflow runs lint + build
- run: npm run lint
- run: npm run build
```

**Change:** Add test step BEFORE build:
```yaml
- name: Run unit tests
  run: npm test
- name: Lint code
  run: npm run lint
- name: Build project
  run: npm run build
```

**Intent:** 
- Run tests first (fastest feedback)
- Block deployment if tests fail (exit code 1)
- Lint and build only run if tests pass

**Rationale:** Order matters — tests are fastest (~10–30s), lint is medium (~5–10s), build is slowest (~30–60s). Fail fast.

### Success Criteria

- GitHub Actions runs `npm test` on every PR
- Workflow fails (red X) if any test fails
- Workflow succeeds (green check) only if all tests + lint + build pass
- Merge button disabled until workflow passes

---

## Phase 1.4: Pre-Commit Hook (Optional)

### Overview

Configure Husky to run lint + typecheck (and optionally unit tests) before every commit. This is **recommended local** (not CI substitute) for fast feedback.

**Optional:** Include unit tests in hook ONLY if they run <10s. If tests are slow, skip this sub-phase.

### Changes Required

#### 1. Install Husky

**Command:**
```powershell
npm install --save-dev husky
npx husky init
```

**Intent:** Initialize Husky git hooks.

**Verify:** `.husky/` directory created with `pre-commit` script template.

#### 2. Configure pre-commit hook

**File:** `.husky/pre-commit`

**Content:**
```bash
npm run lint
npm run build -- --mode development
```

**Intent:** Run lint + typecheck (via `tsc -b` in build script) before commit.

**Rationale:** Catches trivial errors (unused imports, type mismatches) before pushing to CI. Fast (<10s).

**Optional enhancement (if tests <10s):**
```bash
npm test
npm run lint
npm run build -- --mode development
```

**Decision:** Measure `npm test` runtime. If <10s, add to hook. If >10s, skip (tests run in CI anyway).

### Success Criteria

- Pre-commit hook runs on `git commit`
- Commit blocked if lint or typecheck fails
- Hook runs <10s (fast feedback)
- Optionally: Tests run if <10s

---

## Phase 1.5: Update Test Plan Cookbook

### Overview

Update `test-plan.md` §6 with cookbook entry for unit tests. This becomes the reference for future devs ("how do I add a test?").

### Changes Required

#### 1. Update `context/foundation/test-plan.md` §6

**File:** `context/foundation/test-plan.md`

**Section:** `## §6 Testing Cookbook` → `### Unit tests (date math, validation, formatting)`

**Replace:**
```markdown
### Unit tests (date math, validation, formatting)
**Location:** TBD — see §2 Phase 1  
**Naming convention:** TBD — see §2 Phase 1  
**Reference test:** TBD — see §2 Phase 1  
**Run command:** TBD — see §2 Phase 1  
**Coverage target:** TBD — see §2 Phase 1  
```

**With:**
```markdown
### Unit tests (date math, validation, formatting)
**Location:** Colocated with code in `src/utils/__tests__/` and `src/utils/classes/__tests__/`  
**Naming convention:** `*.test.ts` (Vitest default pattern)  
**Reference test:** [`src/utils/__tests__/temporal-edge-cases.test.ts`](../../src/utils/__tests__/temporal-edge-cases.test.ts) — Leap year + month overflow edge cases  
**Run command:** `npm test` (CI mode, runs once) or `npm run test:watch` (dev mode, watch for changes)  
**Coverage target:** 100% for pure date math functions in `src/utils/classes/` (CardBase, DateCard, DateTimeCard, Milestone) and `src/utils/validation.ts`  

**When to add:**
- New date calculation logic (e.g., new time unit, custom milestone filter)
- New validation rule (e.g., label uniqueness, date range constraint)
- New formatting function (e.g., calendar event title, social share text)

**Example scenarios (implemented in Phase 1):**
- ✅ Leap year: `2020-02-29` + 1,000 days → `2022-11-24` ([reference test](../../src/utils/__tests__/temporal-edge-cases.test.ts))
- ✅ 75-year cutoff: Milestone 273.9 years away → category `BeyondHumanLifeExpectancy` ([Milestone.test.ts](../../src/utils/classes/__tests__/Milestone.test.ts))
- ✅ Future date validation: `2030-01-01` → error "Please enter a past or present date" ([validation.test.ts](../../src/utils/__tests__/validation.test.ts))
- ✅ Custom milestones: 420 days → `2021-02-24` with `isCustom = true` ([CardBase.test.ts](../../src/utils/classes/__tests__/CardBase.test.ts))
- ✅ Design decisions: Years NOT calculated, months ARE calculated ([design-decisions.test.ts](../../src/utils/__tests__/design-decisions.test.ts))

**Test structure (arrange-act-assert):**
```typescript
import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import DateCard from "../classes/DateCard";

describe("DateCard", () => {
  it("calculates 1,000 days from start date correctly", () => {
	// Arrange: Set up test data
	const startDate = Temporal.PlainDate.from("2020-01-01");
	const card = new DateCard(startDate, "en-US");

	// Act: Execute the code under test
	const events = card.getEvents();

	// Assert: Verify expected behavior
	const milestone1000 = events.find(e => e.label === "1,000 days");
	expect(milestone1000).toBeDefined();
	expect(milestone1000!.date.toString()).toBe("2022-09-27");
  });
});
```

**Key patterns:**
- **Inject `now` parameter** to avoid flaky time-based tests (use optional parameter in `Milestone` constructor)
- **Use `Temporal.PlainDate.compare()`** for date equality (returns 0 if equal)
- **Use `.toString()`** for human-readable assertions (e.g., `"2022-11-24"`)
- **Test edge cases, not happy-path** — basic calculations already work (verified in S-01)
```

**Intent:** Provide complete cookbook entry with location, naming, examples, and patterns.

**Rationale:** After Phase 1 ships, any dev adding a new date calculation function should know exactly where to put tests and how to structure them.

### Success Criteria

- `test-plan.md` §6 has complete unit test cookbook entry
- Entry links to reference test (`temporal-edge-cases.test.ts`)
- Entry includes 5+ example scenarios from Phase 1
- Entry documents test structure pattern (arrange-act-assert)
- Entry explains key patterns (inject `now`, use `compare()`, test edge cases)

---

## Progress Tracking

**Phase 1.1:** Scaffold Vitest
- [ ] Install Vitest (`npm install --save-dev vitest`)
- [ ] Add `test` script to `package.json`
- [ ] Configure `vite.config.ts` with `test` section
- [ ] Create `src/vitest.d.ts` for TypeScript globals
- [ ] Verify: `npm test` runs (no tests found)

**Phase 1.2:** Write Edge-Case Tests
- [ ] Create `src/utils/__tests__/` directory
- [ ] Create `src/utils/classes/__tests__/` directory
- [ ] Write `temporal-edge-cases.test.ts` (tests 1, 9)
- [ ] Write `Milestone.test.ts` (tests 2, 3, 13, 14, 15)
- [ ] Write `validation.test.ts` (tests 4, 5, 10)
- [ ] Write `design-decisions.test.ts` (tests 6, 7)
- [ ] Write `CardBase.test.ts` (test 8)
- [ ] Write `DateCard.test.ts` (test 11)
- [ ] Write `DateTimeCard.test.ts` (test 12)
- [ ] Verify: `npm test` runs 15+ tests, all pass (<10s)

**Phase 1.3:** Wire CI Gate
- [ ] Update `.github/workflows/deploy.yml` with test step
- [ ] Push to branch, verify CI runs tests
- [ ] Verify: CI fails if test fails, blocks merge

**Phase 1.4:** Pre-Commit Hook (Optional)
- [ ] Install Husky (`npm install --save-dev husky && npx husky init`)
- [ ] Configure `.husky/pre-commit` with lint + typecheck
- [ ] Measure test runtime — if <10s, add `npm test` to hook
- [ ] Verify: Hook runs on commit, blocks if lint/typecheck fails

**Phase 1.5:** Update Cookbook
- [ ] Update `test-plan.md` §6 unit test section
- [ ] Add location, naming, reference test link
- [ ] Document 5+ example scenarios
- [ ] Document test structure pattern
- [ ] Verify: Cookbook entry is complete and actionable

---

## Cost × Signal Analysis

**Cost estimate:**
- Vitest scaffolding: 15 min (install, configure, verify)
- Write 15 tests: 2–3 hours (including debugging edge cases)
- Wire CI gate: 10 min (update YAML, push, verify)
- Pre-commit hook: 20 min (install Husky, configure, test)
- Update cookbook: 30 min (write examples, link tests)
- **Total: ~4 hours**

**Signal:**
- **High:** Leap year, 75-year cutoff, future date validation (R1 core edge cases)
- **Medium:** Custom milestones, design decisions (feature correctness)
- **Low:** Happy-path tests (already works per S-01)

**Tradeoff:** Prioritized R1 edge cases (10 tests) over happy-path (5 tests). If time-constrained, defer tests 11–15 (happy-path) to Phase 1.2 follow-up.

---

## Open Questions

**Q1:** Should pre-commit hook include `npm test` or just lint + typecheck?  
**Answer:** Measure runtime. If tests <10s, include. If >10s, skip (tests run in CI anyway).

**Q2:** Should we add test coverage reporting (e.g., Vitest coverage with `c8`)?  
**Answer:** Defer to Phase 2. Not blocking for Phase 1 — we manually know we're testing all 7 surface areas.

**Q3:** Should we test negative cases (e.g., invalid unit strings)?  
**Answer:** Yes — included in tests 2, 3 (DateCard/DateTimeCard throw error for invalid units).

**Q4:** Should we test locale formatting (e.g., `en-US` vs. `en-GB` date strings)?  
**Answer:** Defer to Phase 2 integration tests. Phase 1 focuses on date math correctness, not formatting.

---

## Risks & Mitigations

**Risk 1:** Tests take >10s, slow down dev workflow  
**Mitigation:** Use `vitest run` (CI mode) for pre-commit hook only if <10s. Otherwise, skip hook and rely on CI.

**Risk 2:** Flaky tests due to `Temporal.Now` usage  
**Mitigation:** Inject `now` parameter in all `Milestone` tests (use optional param from line 17). No test should call `Temporal.Now` directly.

**Risk 3:** CI fails intermittently due to timezone differences  
**Mitigation:** All fixtures use ISO strings (`"2020-01-01"`, `"2026-01-15T12:00:00"`), not local time. Temporal API handles UTC internally.

**Risk 4:** Cookbook entry becomes stale as codebase evolves  
**Mitigation:** Mark cookbook as "living documentation" (§6 intro already says this). Update cookbook in each test-related phase (Phase 2, Phase 3, etc.).

---

## Success Metrics

**Automated verification:**
- `npm test` exits 0 (all tests pass)
- `npm run build` exits 0 (types + lint pass)
- CI workflow passes on PR
- Merge blocked if tests fail

**Manual verification:**
- Tests run <10s locally
- Cookbook entry links work (click reference test link → file opens)
- Pre-commit hook runs <10s (if enabled)
- All 4 design decisions tested (years NOT calculated, months ARE, 75-year cutoff, wall-clock DST)

---

**Status:** `planned` → Ready for `/10x-implement test-phase-1-calculation phase 1`