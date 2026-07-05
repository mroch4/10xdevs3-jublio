---
change_id: test-phase-1-calculation
status: researched
created: 2026-07-05
---

# Research: Phase 1 — Milestone Calculation Accuracy (Unit Tests)

## Research Questions & Answers

### Q1: Where does calculation logic live?

**Answer:** The calculation logic is distributed across multiple files in a class hierarchy:

**Core calculation files:**
- **`src/utils/classes/CardBase.ts`** (71 lines) — Abstract base class with `getEvents()` method that generates milestone events
  - Iterates through `UnitsConfig` (power-of-10 exponents: 10^1, 10^2, 10^3, etc.)
  - Calls `base.add({ [unit]: exponent })` using Temporal API to calculate future dates
  - Instantiates `Milestone` objects with calculated dates
  - Handles custom milestones (user-defined values like 420, 2137)

- **`src/utils/classes/DateCard.ts`** (22 lines) — Extends `CardBase` for date-only input
  - Members: `days`, `weeks`, `months` only
  - Returns `Temporal.PlainDate` from `getBase()`

- **`src/utils/classes/DateTimeCard.ts`** (24 lines) — Extends `CardBase` for date+time input
  - Members: `seconds`, `minutes`, `hours`, `days`, `weeks`, `months`
  - Returns `Temporal.PlainDateTime` from `getBase()`

- **`src/utils/classes/Milestone.ts`** (131 lines) — Represents a single milestone event
  - **Line 36:** Life expectancy filter: `currentTime.add({ years: 75 })` (not 120 years as PRD says!)
  - **Lines 29–75:** `getCategory()` method categorizes milestones (Today, ThisWeek, ThisMonth, etc.)
  - **Lines 111–130:** Date comparison helpers (`isPast()`, `isToday()`, `isWeek()`)
  - Handles both `Temporal.PlainDate` and `Temporal.PlainDateTime` (type union on line 5)

**Configuration files:**
- **`src/utils/UnitsConfig.ts`** (11 lines) — Defines which time units to calculate and their exponent ranges
  - `seconds`: 10^3 to 10^10 (1,000 to 10,000,000,000)
  - `minutes`: 10^2 to 10^8 (100 to 100,000,000)
  - `hours`: 10^2 to 10^6 (100 to 1,000,000)
  - `days`: 10^1 to 10^5 (10 to 100,000)
  - `weeks`: 10^1 to 10^4 (10 to 10,000)
  - `years`: 10^1 to 10^4 (10 to 10,000)
  - ⚠️ **Note:** `months` is NOT in `UnitsConfig` but IS in `DateCard.members` and `DateTimeCard.members` — possible bug or intentional omission?

- **`src/utils/enums/DateTimeUnit.ts`** (9 lines) — Enum with 7 time units: `seconds`, `minutes`, `hours`, `days`, `weeks`, `months`, `years`

**Validation (input handling):**
- **`src/utils/validation.ts`** (76 lines) — Validates date/time input before calculation
  - **Lines 49–58:** Future date check using `Temporal.PlainDate.compare()`
  - **Lines 61–68:** Future time check (for today's date only)
  - Uses `Temporal.Now.plainDateTimeISO()` for current time (browser timezone)

**Test surface:** All calculation logic is in `src/utils/classes/` and `src/utils/` — pure functions with no UI dependencies. Perfect for unit testing.

---

### Q2: How is Temporal API used?

**Answer:** The codebase uses **`Temporal.PlainDate`** and **`Temporal.PlainDateTime`** (ISO calendar, no explicit timezone). DST is NOT explicitly handled because the code uses "plain" types (no `ZonedDateTime`).

**Key Temporal API patterns found:**

1. **Date addition** (`CardBase.ts` line 32):
   ```typescript
   base.add({ [item.unit]: exponent })
   ```
   Example: `Temporal.PlainDate("2020-01-01").add({ days: 10000 })` → `2047-05-18`

2. **Current time** (`Milestone.ts` line 30, `validation.ts` line 50):
   ```typescript
   Temporal.Now.plainDateTimeISO()
   ```
   Returns current date+time in ISO calendar, system timezone (but NOT as `ZonedDateTime`)

3. **Date comparison** (`Milestone.ts` lines 78, 113, 120):
   ```typescript
   Temporal.PlainDate.compare(this.date, limit)  // Returns -1, 0, or 1
   Temporal.PlainDateTime.compare(date1, date2)
   ```

4. **Type unions** (`Milestone.ts` line 5):
   ```typescript
   date: Temporal.PlainDate | Temporal.PlainDateTime
   ```
   The `Milestone` class handles both date-only and date+time milestones

**DST handling — CRITICAL FINDING:**  
The code does NOT use `Temporal.ZonedDateTime`, which means **DST transitions are ignored**. When calculating "1,000 hours since X", the code uses `PlainDateTime.add({ hours: 1000 })`, which counts 1,000 wall-clock hours (ignoring DST spring-forward/fall-back). This is consistent with the PRD's "browser timezone" approach but may surprise users.

**Example:**
- Start: 2020-03-08 01:00 PST (day before spring-forward)
- Add 24 hours via `PlainDateTime.add({ hours: 24 })`
- Result: 2020-03-09 01:00 PDT (24 wall-clock hours, not 23 clock-time hours)

**Leap year handling:**  
Temporal API handles leap years automatically. Example:
- `Temporal.PlainDate("2020-02-29").add({ years: 1 })` → `2021-02-28` (not March 1)
- `Temporal.PlainDate("2020-02-29").add({ days: 366 })` → `2021-02-28` (same result, different calculation)

**Test fixtures needed:**
- Leap year start dates: `2020-02-29`, `2024-02-29`
- Month boundaries: `2020-01-31` (adding 1 month → `2020-02-29`)
- Year boundaries: `2019-12-31` (adding seconds/minutes/hours that cross into 2020)
- Far-future dates: Start date + 75 years (life expectancy limit)

---

### Q3: What time units are actually calculated?

**Answer:** The units calculated depend on **date-only vs. date+time input**:

**Date-only input** (`DateCard`):
- `days` (10^1 to 10^5 → 10, 100, 1K, 10K, 100K)
- `weeks` (10^1 to 10^4 → 10, 100, 1K, 10K)
- `months` (NOT in `UnitsConfig` but included in `DateCard.members` — special case?)

**Date+time input** (`DateTimeCard`):
- `seconds` (10^3 to 10^10 → 1K, 10K, 100K, 1M, 10M, 100M, 1B, 10B)
- `minutes` (10^2 to 10^8 → 100, 1K, 10K, 100K, 1M, 10M, 100M)
- `hours` (10^2 to 10^6 → 100, 1K, 10K, 100K, 1M)
- `days` (10^1 to 10^5 → 10, 100, 1K, 10K, 100K)
- `weeks` (10^1 to 10^4 → 10, 100, 1K, 10K)
- `months` (NOT in `UnitsConfig` but included in `DateTimeCard.members` — special case?)

**Missing from PRD:** `years` is in `UnitsConfig` but NOT in `DateCard.members` or `DateTimeCard.members`. This is a **discrepancy** — PRD FR-002 says "years, months, weeks, days, hours, minutes, seconds" but the code doesn't calculate year-based milestones (e.g., "10 years since X").

**Custom milestones** (`CardBase.ts` lines 47–63):
- Users can add arbitrary values (e.g., 420, 2137, 25000) for any unit
- Custom milestones are passed via `customMilestones?: CustomMilestone[]` parameter
- Each custom milestone has `{ unit: string, value: number, id: string }`

**Test surface:**
- Date-only: Verify `days`, `weeks`, `months` (no `seconds`, `minutes`, `hours`)
- Date+time: Verify all 6 units (`seconds`, `minutes`, `hours`, `days`, `weeks`, `months`)
- Custom values: Verify arbitrary values like 420, 2137, 999999 are calculated correctly
- Edge case: Verify `years` is NOT calculated (or document if it should be)

---

### Q4: How is the ~120-year filter implemented?

**Answer:** **CRITICAL FINDING — The filter is 75 years, not 120 years as PRD says!**

**Implementation location:** `src/utils/classes/Milestone.ts` line 36:
```typescript
if (this.isBeyondLimit(currentTime.add({ years: 75 }))) {
  return EventCategory.BeyondHumanLifeExpectancy;
}
```

**How it works:**
1. `getCategory()` is called in `Milestone` constructor (line 24)
2. Calculates cutoff: `now + 75 years`
3. Compares milestone date to cutoff using `Temporal.PlainDate.compare()` (line 78)
4. If milestone date > cutoff, assigns category `BeyondHumanLifeExpectancy`

**Filtering behavior** (from archive review F2):
- The original plan specified hiding milestones beyond 75 years with a count indicator
- **Implementation changed during S-01:** All milestones are now shown, including `BeyondHumanLifeExpectancy` category
- See `src/utils/eventGrouping.ts` line 14: `return { visible: events, beyondCount: 0 };` (no filtering)

**Discrepancy with PRD:**
- PRD NFR says "~120 years (human life expectancy)"
- Code uses 75 years
- This is a **30-year difference** — significant for long-term milestones

**Test surface:**
- Verify 75-year cutoff (not 120)
- Start date: `2000-01-01`, cutoff: `2075-01-01`
- Milestones calculated for 10,000 days (27.4 years → `2027-05-18`) should be `Future` category
- Milestones calculated for 100,000 days (273.9 years → `2273-12-05`) should be `BeyondHumanLifeExpectancy`
- Edge case: Milestone date exactly at `2075-01-01` (is it included or excluded?)

---

### Q5: Are there existing manual tests or fixtures?

**Answer:** Yes! Found extensive manual testing documentation in archive, but **no automated tests or fixtures**.

**Archive documentation:**
- `context/archive/2026-07-02-calculate-milestones/plan.md` (425 lines)
  - Phase 2 manual verification items (lines 200+)
  - Documented edge cases: empty time input, "Set to Now", "Reset" buttons, future date validation
  - Test fixture examples: "2020-06-15" with time "14:30"

- `context/archive/2026-07-02-calculate-milestones/reviews/impl-review.md` (241 lines)
  - **Finding F1:** Plan assumed `CardBase`, `DateCard`, `DateTimeCard` existed but they were created from scratch
  - **Finding F2:** "Beyond Human Life Expectancy" filtering removed during implementation (all milestones now shown)
  - **Finding F3:** Empty time input handling (`timeString.trim() === ""` → `undefined`)
  - No mention of automated tests — all verification was manual

**Calendar export archive** (`context/archive/2026-07-03-export-to-calendar/TESTING.md`):
- 50+ manual test cases for iOS Safari + Android Chrome
- Tests for all-day events, timed events, timezone handling
- Example fixture: "Calculate milestone with date only (e.g., 2000-01-01)"
- Example fixture: "Calculate milestone with date + time (e.g., 2000-01-01 14:00)"

**No existing test files found:**
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `__tests__/` directories in codebase
- No test framework configured in `package.json` (no `vitest`, `jest`, `@testing-library`)

**Test fixtures we can derive from archives:**
1. **Basic calculation:** `2020-06-15` (date-only) → 10 days, 100 days, 1,000 days, etc.
2. **With time:** `2020-06-15 14:30` → 1,000 seconds, 10,000 minutes, 100,000 hours, etc.
3. **Leap year start:** `2020-02-29` → add 1,000 days (crosses leap year boundaries)
4. **Month boundary:** `2020-01-31` → add 1 month (February has fewer days)
5. **Future date validation:** `2030-01-01` (future) → expect validation error
6. **Life expectancy:** `2000-01-01` → 100,000 days (273.9 years) → `BeyondHumanLifeExpectancy` category

---

### Q6: What test framework (if any) is already configured?

**Answer:** **No test framework configured.** We need to scaffold from scratch.

**Current `package.json` (lines 1–32):**
- **Scripts:**
  - `dev`: Vite dev server
  - `build`: TypeScript compile + Vite build
  - `lint`: ESLint
  - `preview`: Vite preview server
  - ❌ No `test` script

- **Dev dependencies:**
  - TypeScript 6.0.2
  - ESLint 10.3.0
  - Vite 8.1.3
  - ❌ No `vitest`, `jest`, `@testing-library/react`, `@testing-library/jest-dom`

- **Dependencies:**
  - React 19.2.6
  - Firebase 12.14.0
  - `@js-temporal/polyfill` 0.5.1 (Temporal API)

**No test configuration files:**
- ❌ No `vitest.config.ts`
- ❌ No `jest.config.js`
- ❌ No `setupTests.ts`

**Recommendation: Use Vitest**
- **Why Vitest:** Native Vite integration, modern API (like Jest but faster), TypeScript support out-of-box, works with React 19
- **Installation needed:** `vitest`, `@vitest/ui` (optional GUI), `jsdom` (for DOM testing if needed later)
- **Configuration:** Extend existing `vite.config.ts` with `test` section

**Example Vitest config (to add to `vite.config.ts`):**
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "",
  test: {
	globals: true,
	environment: "node", // Phase 1 tests pure functions (no DOM)
	include: ["src/**/*.test.ts"],
  },
});
```

**Phase 1 scope (unit tests only):**
- No React Testing Library needed (pure function tests)
- No `jsdom` needed (no DOM interaction)
- Simple imports: `import { describe, it, expect } from "vitest"`

**Phase 2+ scope (integration tests):**
- Add `@testing-library/react`, `@testing-library/user-event`
- Add `jsdom` environment
- Add `@testing-library/jest-dom` for DOM matchers

---

## Test Surface Map

Based on research, here are the **testable units** for Phase 1:

### 1. CardBase.getEvents() — Milestone generation logic
**File:** `src/utils/classes/CardBase.ts` (lines 21–65)  
**Inputs:** `customMilestones?: CustomMilestone[]`  
**Outputs:** `Milestone[]`  
**Edge cases:**
- Default power-of-10 milestones: 10, 100, 1K, 10K, 100K, 1M (depending on unit)
- Custom milestones: 420, 2137, 25000
- Units missing from `UnitsConfig` but in `members` (e.g., `months`)

### 2. DateCard.getBase() — Date-only milestone calculation
**File:** `src/utils/classes/DateCard.ts` (lines 15–21)  
**Inputs:** `unit: string`  
**Outputs:** `Temporal.PlainDate`  
**Edge cases:**
- Valid units: `days`, `weeks`, `months`
- Invalid unit: throws `Error("Invalid unit '...' for DateCard.")`

### 3. DateTimeCard.getBase() — Date+time milestone calculation
**File:** `src/utils/classes/DateTimeCard.ts` (lines 17–23)  
**Inputs:** `unit: string`  
**Outputs:** `Temporal.PlainDateTime`  
**Edge cases:**
- Valid units: `seconds`, `minutes`, `hours`, `days`, `weeks`, `months`
- Invalid unit: throws `Error("Invalid unit '...' for DateTimeCard.")`

### 4. Milestone.getCategory() — Categorization logic
**File:** `src/utils/classes/Milestone.ts` (lines 29–75)  
**Inputs:** `now?: Temporal.PlainDateTime`  
**Outputs:** `EventCategory` enum value  
**Edge cases:**
- `AlreadyPassed`: milestone date < now
- `BeyondHumanLifeExpectancy`: milestone date > now + 75 years
- `Today`: milestone date == now (date-only comparison, ignoring time)
- `ThisWeek`, `NextWeek`: week boundary detection (lines 44–56)
- `ThisMonth`, `NextMonth`: month boundary (lines 58–64)
- `ThisYear`, `NextYear`: year boundary (lines 66–72)
- `Further`: all other future dates
- **Inject `now` parameter** for deterministic tests (avoid `Temporal.Now.plainDateTimeISO()` flakiness)

### 5. Milestone comparison helpers
**File:** `src/utils/classes/Milestone.ts` (lines 111–130)  
**Methods:** `isPast()`, `isToday()`, `isWeek()`, `isBeyondLimit()`  
**Edge cases:**
- Handle both `PlainDate` and `PlainDateTime` (type union, lines 112–115, 119–122, 126–129)
- Boundary: date exactly at midnight (00:00:00) — is it "today" or "yesterday"?

### 6. Temporal.PlainDate.add() — Date math (via Temporal API)
**Not our code, but we test our usage of it**  
**Edge cases to verify:**
- Leap year: `2020-02-29` + 1 year → `2021-02-28` (not March 1)
- Leap year: `2020-02-29` + 1000 days → correct date considering leap years in between
- Month overflow: `2020-01-31` + 1 month → `2020-02-29` (February has fewer days)
- Large intervals: `2000-01-01` + 100,000 days → `2273-12-05` (beyond life expectancy)
- Hour addition crossing DST: `2020-03-08 01:00` + 24 hours → `2020-03-09 01:00` (wall-clock, not clock-time)

### 7. Validation logic
**File:** `src/utils/validation.ts` (lines 16–75)  
**Function:** `validateDateTime(dateString: string, timeString?: string)`  
**Edge cases:**
- Empty date: `""` → error "Date is required"
- Invalid date format: `"2020-13-45"` → error "Invalid date format"
- Future date: `"2030-01-01"` → error "Please enter a past or present date"
- Today with future time: `"2026-01-15"` + `"23:59"` → error if current time < 23:59
- Empty time string: `""` → treated as `undefined` (date-only mode)
- Valid date-only: `"2020-06-15"` + `undefined` → `{ isValid: true, date: PlainDate, time: undefined }`
- Valid date+time: `"2020-06-15"` + `"14:30"` → `{ isValid: true, date: PlainDate, time: PlainTime }`

---

## Recommended Test Fixtures

### Fixture 1: Basic date-only calculation
```typescript
const startDate = Temporal.PlainDate.from("2020-01-01");
const card = new DateCard(startDate, "en-US");
const events = card.getEvents();
// Expected: 10 days → 2020-01-11, 100 days → 2020-04-10, 1000 days → 2022-09-27, etc.
```

### Fixture 2: Leap year start (date-only)
```typescript
const startDate = Temporal.PlainDate.from("2020-02-29");
const card = new DateCard(startDate, "en-US");
const events = card.getEvents();
// Expected: 1000 days → 2022-11-24 (crosses 2021 non-leap year)
```

### Fixture 3: Date+time with seconds/minutes/hours
```typescript
const startDateTime = Temporal.PlainDateTime.from("2020-01-01T12:00:00");
const card = new DateTimeCard(startDateTime, "en-US");
const events = card.getEvents();
// Expected: 1000 seconds → 2020-01-01T12:16:40, 10000 hours → 2021-02-14T04:00:00
```

### Fixture 4: Life expectancy boundary (75 years)
```typescript
const startDate = Temporal.PlainDate.from("2000-01-01");
const now = Temporal.PlainDateTime.from("2026-01-15T12:00:00");
// Calculate milestone: 2000-01-01 + 100,000 days = 2273-12-05 (273.9 years from start)
const milestone = new Milestone(
  Temporal.PlainDate.from("2273-12-05"),
  "days",
  100000,
  "en-US",
  now // Inject fixed "now" for determinism
);
// Expected category: BeyondHumanLifeExpectancy (2273 - 2026 = 247 years > 75)
```

### Fixture 5: Custom milestone values
```typescript
const startDate = Temporal.PlainDate.from("2020-01-01");
const customMilestones = [
  { unit: "days", value: 420, id: "custom-1" },
  { unit: "days", value: 2137, id: "custom-2" },
];
const card = new DateCard(startDate, "en-US", customMilestones);
const events = card.getEvents();
// Expected: 420 days → 2021-02-24, 2137 days → 2025-11-01
// Both should have isCustom = true, customId set
```

### Fixture 6: Validation — future date rejection
```typescript
const validation = validateDateTime("2030-01-01");
// Expected: { isValid: false, error: "Please enter a past or present date" }
```

### Fixture 7: Validation — today with future time
```typescript
const now = Temporal.Now.plainDateTimeISO();
const todayDate = now.toPlainDate().toString();
const futureTime = now.toPlainTime().add({ hours: 1 }).toString().slice(0, 5);
const validation = validateDateTime(todayDate, futureTime);
// Expected: { isValid: false, error: "Please enter a past or present date and time" }
```

---

## Key Findings Summary

### 🔴 Critical Findings (test as-is, working as intended)
1. **Life expectancy: 75 years** (`Milestone.ts` line 36) — **Intentional:** 75 = average human life time; PRD "~120 years" was approximation. Code correct. `BeyondHumanLifeExpectancy` category handles both >75 and >120.
2. **DST NOT handled** (uses `PlainDateTime`, not `ZonedDateTime`) — Wall-clock hours behavior, test to ensure it's deterministic
3. **`years` unit NOT calculated** — **Intentional:** Easy for humans to add years mentally (10 years = obvious), so power-of-10 years would be redundant (10 years, 100 years, etc.)
4. **`months` unit calculated but NOT in `UnitsConfig`** — **Intentional:** Months are useful milestones but don't follow power-of-10 pattern cleanly (12 months/year makes powers awkward)

### ⚠️ Medium Findings (document and test)
5. **"Beyond Human Life Expectancy" filtering removed** in S-01 implementation (all milestones now shown) — Test that category assignment still works correctly
6. **Empty time string normalization** (`""` → `undefined`) implemented but not specified in validation contract — Test this edge case explicitly

### ✅ Test Framework Decision
7. **No test framework exists** — must scaffold Vitest from scratch
8. **Phase 1 scope:** Pure function unit tests (no DOM, no React Testing Library)

---

## Next Steps for `/10x-plan`

### Test Suite Design Constraints

**Cost targets:**
- Unit test suite: <10s locally, <30s in CI
- Individual tests: <100ms each (pure date math is fast)

**Signal priorities (R1 edge cases):**
1. **High priority:** Leap year, 75-year cutoff, validation future date rejection
2. **Medium priority:** Custom milestones, month boundary overflow, category detection
3. **Low priority:** Happy-path (basic 100-day calculation already works per S-01 archive)

**Cookbook requirements:**
- Update `test-plan.md` §6 with:
  - Test location: `src/utils/classes/__tests__/` (colocated with code)
  - Naming: `*.test.ts` (Vitest convention)
  - Run command: `npm run test:unit` or `npm test`
  - Reference test: Link to leap year or life expectancy test
  - Coverage target: 100% for pure functions in `src/utils/classes/`

**Open questions for plan:**
1. ~~Should we test the `months` unit discrepancy?~~ ✅ **Resolved:** `months` calculation is intentional (useful milestone, doesn't fit power-of-10 pattern). Test it works correctly.
2. ~~Should we document DST behavior?~~ ✅ **Resolved:** DST uses wall-clock hours (deterministic). Test to ensure no unexpected timezone/DST bugs.
3. ~~Should we test 75-year cutoff as-is or change to 120?~~ ✅ **Resolved:** Test 75-year cutoff as-is (average human life time, working as intended).
4. ~~Should `years` be calculated?~~ ✅ **Resolved:** NO. Years are easy for humans to count mentally. Test that `years` unit is NOT in calculated milestones.

---

## Design Decisions Confirmed by User

**All "discrepancies" resolved — test the code as-is, no changes needed:**

1. **75-year life expectancy cutoff** ✅ CORRECT  
   - Average human life time (not 120 years as PRD approximated)
   - `BeyondHumanLifeExpectancy` category handles both >75 and >120
   - Test the 75-year boundary explicitly

2. **`UnitsConfig` has `years` but code doesn't calculate year-based milestones** ✅ CORRECT  
   - Years are easy for humans to add mentally (10 years, 100 years = obvious)
   - Power-of-10 years would be redundant UI noise
   - Test that year-based milestones are NOT generated

3. **`months` calculated but NOT in `UnitsConfig`** ✅ CORRECT  
   - Months are useful milestones (6 months, 12 months, 24 months, etc.)
   - Don't fit power-of-10 pattern cleanly (12 months/year makes exponents awkward)
   - Test that month-based milestones ARE generated correctly

4. **DST uses wall-clock hours (no `ZonedDateTime`)** ✅ CORRECT  
   - Deterministic behavior (24 hours = 24 wall-clock hours, regardless of DST transitions)
   - Simpler implementation, no timezone database complexity
   - Test that calculations are consistent and deterministic

**Maps and fixtures approved** — ready for `/10x-plan`

---

**Status:** `researched` → Ready for `/10x-plan`