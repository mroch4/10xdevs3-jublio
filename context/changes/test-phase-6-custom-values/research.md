# Phase 6 Research: Custom Milestone Validation

**Research Date:** 2026-07-05
**Phase:** 6 — Custom milestone validation (unit tests)  
**Risk Coverage:** R6 (Custom milestone values fail validation or produce out-of-bounds dates)

## Research Questions

### Q1: Where is custom milestone validation logic?

**Location:** `src/components/modals/CustomMilestoneModal.tsx` lines 113-190

**Key function:** `validateValue(val: string): boolean`

**Validation rules implemented:**
1. Empty value allowed (returns `true`, no error)
2. Must be valid number (`parseInt(val, 10)`)
3. Must be whole number (no decimal point)
4. Must be >= `MIN_CUSTOM_MILESTONE_VALUE` (1)
5. Must be <= `MAX_CUSTOM_MILESTONE_VALUE` (1,000,000,000)
6. If units selected and `originalDate` exists:
   - For each selected unit, calculate milestone date via `originalDate.add({ [unit]: numValue })`
   - Compare with 75-year limit: `Temporal.Now.plainDateTimeISO().add({ years: 75 })`
   - If milestone > limit, validation fails with "exceeds human lifetime" error
   - If Temporal calculation throws, validation fails with "Invalid combination" error

**Architecture note:**  
Validation is tightly coupled to UI component (modal state, `originalDate` prop, `selectedUnits` state). For unit testing, we should:
- **Option A:** Extract pure validation logic to `src/utils/customMilestoneValidation.ts`
- **Option B:** Test via component integration tests (Phase 2 scope)

**Recommendation:** **Extract to utility** — validation logic is complex (6 rules + Temporal arithmetic) and should be unit-testable independent of React state.

---

### Q2: What validation rules exist?

**Constants (src/utils/constants.ts):**
```typescript
export const MIN_CUSTOM_MILESTONE_VALUE = 1;
export const MAX_CUSTOM_MILESTONE_VALUE = 1000000000; // 1 billion
```

**Complete validation rules:**

| Rule | Implementation | Error Message |
|------|----------------|---------------|
| Empty value | `val.trim().length === 0` → `true` | (none, allowed) |
| Valid number | `isNaN(parseInt(val, 10))` | "Value must be a valid number" |
| Whole number | `val.includes(".")` | "Value must be a whole number" |
| Minimum value | `numValue < 1` | "Value must be at least 1" |
| Maximum value | `numValue > 1000000000` | "Value must be 1,000,000,000 or less" |
| Life expectancy (per unit) | `Temporal.PlainDate.compare(milestoneDate, now + 75 years) > 0` | "Milestone would exceed human lifetime ({value} {unit} is too far in the future)" |
| Temporal overflow | `originalDate.add()` throws | "Invalid combination: {value} {unit}" |

**Edge cases to test:**
- Boundary values: `0`, `1`, `1000000000`, `1000000001`
- Invalid inputs: `-1`, `"abc"`, `"1.5"`, `""`, `"  "`, `null`, `undefined`
- Life expectancy: value × unit that produces date > 75 years from now
- Temporal overflow: very large values that exceed Temporal.PlainDate max year (275760-09-13)

---

### Q3: Should we extract validation to testable function?

**Decision:** **YES — extract to `src/utils/customMilestoneValidation.ts`**

**Rationale:**
1. **Testability:** Current validation is inside React component with modal state dependencies (`selectedUnits`, `originalDate` prop). Unit tests should not require component instantiation.
2. **Reusability:** Validation logic may be needed in future non-UI contexts (e.g., API endpoints, import/export).
3. **Complexity:** 6 distinct validation rules + Temporal arithmetic = high value from unit tests.
4. **Precedent:** Phase 1 tested `src/utils/validation.ts` (date/time validation) as a pure function.

**Proposed API:**
```typescript
// src/utils/customMilestoneValidation.ts

export interface CustomMilestoneValidationResult {
  isValid: boolean;
  error: string | null;
}

export function validateCustomMilestoneValue(
  value: string,
  selectedUnits: string[],
  originalDate: Temporal.PlainDate | Temporal.PlainDateTime | null
): CustomMilestoneValidationResult
```

**Migration path:**
1. Extract validation logic to utility function
2. Write unit tests for extracted function
3. Refactor `CustomMilestoneModal.tsx` to call utility (optional for Phase 6, required if we want green tests)

**Phase 6 scope decision:**  
- ✅ Extract validation to utility
- ✅ Write unit tests for utility
- ✅ Refactor modal to use utility (to avoid breaking existing UI)
- ❌ UI integration tests (defer to Phase 2)

---

### Q4: What error messages are shown?

**Error messages (from `CustomMilestoneModal.tsx` lines 127-184):**

| Scenario | Message |
|----------|---------|
| Invalid number | `"Value must be a valid number"` |
| Decimal value | `"Value must be a whole number"` |
| Below minimum (< 1) | `"Value must be at least 1"` |
| Above maximum (> 1B) | `"Value must be 1,000,000,000 or less"` |
| Exceeds 75-year limit | `"Milestone would exceed human lifetime ({value} {unit} is too far in the future)"` |
| Temporal calculation error | `"Invalid combination: {value} {unit}"` |
| No original date (submit only) | `"Please calculate milestones first before adding custom values"` |

**Test assertions:** Tests should verify both `isValid: false` and exact error message text.

---

### Q5: How do units interact with validation?

**Unit availability (lines 67-77):**
- **hasTimeInput = true:** seconds, minutes, hours, days, weeks, months, years
- **hasTimeInput = false:** days, weeks, months, years

**Unit disabling (lines 79-111):**
- Function `checkUnitExceedsLimit(value, unit)` pre-calculates if a unit would exceed 75-year limit
- Units are disabled (checkbox greyed out) if they would exceed limit with current value
- Example: value = `1000000000` seconds (~31.7 years) → all units might be enabled
- Example: value = `100` years → exceeds 75-year limit → disabled

**Validation behavior:**
- If `selectedUnits.size === 0`, validation only checks value rules (lines 154-156)
- If units are selected, validation checks life expectancy for **each** selected unit (lines 159-187)
- This means validation is **context-dependent**: same value can be valid with one unit but invalid with another

**Test surface:**
- Test value validation **without** units (standalone value checks)
- Test value validation **with** units that produce valid dates (< 75 years)
- Test value validation **with** units that produce invalid dates (> 75 years)
- Test multiple units selected (validation checks all)

---

### Q6: Are there existing tests for custom milestone validation?

**Search results:** No existing tests found for custom milestone validation rules.

**Existing related tests (from Phase 1):**
- `src/utils/classes/__tests__/CardBase.test.ts` — Tests custom milestone **generation** (lines 67-95)
  - Verifies custom milestones are added to event list
  - Checks `isCustom` flag and `customId` property
  - Does **not** test validation logic (assumes valid inputs)

**Gap:** No tests for:
- Validation rules (min/max, integer, non-negative)
- Life expectancy filtering (75-year cutoff per unit)
- Temporal overflow handling
- Error message text

**Phase 6 scope:** Fill this gap with unit tests for extracted validation function.

---

## Test Surface Map

### Pure validation function (to be extracted)

**Input boundaries:**
- Value strings: `""`, `"0"`, `"1"`, `"1000000000"`, `"1000000001"`, `"-1"`, `"abc"`, `"1.5"`, `"  "`, very large numbers
- Selected units: `[]`, `["days"]`, `["seconds", "days", "months"]`
- Original date: `null`, date today, date in past, `PlainDate` vs `PlainDateTime`

**Output:** `{ isValid: boolean, error: string | null }`

**Test categories:**
1. **Value-only validation** (no units, no originalDate):
   - Empty string → valid
   - Invalid number → error "Value must be a valid number"
   - Decimal → error "Value must be a whole number"
   - Below minimum (0, -1) → error "Value must be at least 1"
   - At minimum (1) → valid
   - At maximum (1000000000) → valid
   - Above maximum (1000000001) → error "Value must be 1,000,000,000 or less"

2. **Life expectancy validation** (with units and originalDate):
   - Valid combinations (e.g., 1000 days from 2020-01-01)
   - Invalid combinations exceeding 75 years (e.g., 100 years, 1000000000 seconds × months)
   - Temporal overflow (e.g., 999999999 years → exceeds max Temporal year)
   - Multiple units with mixed validity (one valid, one exceeds limit)

3. **Edge cases:**
   - `originalDate = null` with units → should validation fail or ignore life-expectancy check?
   - Empty units array with valid value → valid (no life-expectancy check)
   - Very large but valid value (e.g., 999999999) → check Temporal arithmetic

---

## Design Decisions (From PRD & Roadmap)

### D1: Custom milestone values are positive integers only
**Source:** PRD FR-006 ("Specify a custom value and unit"); Roadmap S-05 implementation notes ("validation rules: positive integers only")  
**Rationale:** Negative milestones (past events) and fractional milestones (0.5 days) don't align with core UX ("celebrate weird numerical facts")  
**Test impact:** Assert that `0`, `-1`, `1.5` all fail validation with appropriate errors

### D2: Custom milestones respect 75-year life expectancy filter
**Source:** PRD US-06 ("Custom values respect active filters"); Success Criteria guardrail ("milestones appear only if within life expectancy")  
**Rationale:** Consistency with default milestones; prevents "birthday in year 2150" scenarios  
**Test impact:** Assert that value × unit combinations exceeding 75 years from `Temporal.Now` fail validation

### D3: Custom milestone validation is client-side only (no server validation)
**Source:** Roadmap S-05 archived 2026-07-05 ("client-side validation sufficient for now")  
**Rationale:** Anonymous users don't persist custom milestones to Firestore; bookmarked milestones don't include custom values (only pre-generated events)  
**Test impact:** Unit tests only; no API/Firestore validation tests needed

### D4: Maximum custom value is 1 billion
**Source:** `src/utils/constants.ts` line 7  
**Rationale:** Prevents UI overflow and Temporal arithmetic errors; 1 billion seconds ≈ 31.7 years (within 75-year limit), 1 billion days ≈ 2.7 million years (exceeds limit, caught by life-expectancy check)  
**Test impact:** Test boundary at 1,000,000,000 (valid) and 1,000,000,001 (invalid)

---

## Existing Code Dependencies

### Files to extract/modify:
1. **New file:** `src/utils/customMilestoneValidation.ts` — Extract validation logic
2. **Modify:** `src/components/modals/CustomMilestoneModal.tsx` — Replace inline validation with utility call
3. **New file:** `src/utils/__tests__/customMilestoneValidation.test.ts` — Unit tests

### Files to read (reference only):
- `src/utils/constants.ts` — MIN/MAX values
- `src/utils/enums/DateTimeUnit.ts` — Unit enum values
- `src/utils/classes/CardBase.ts` — Custom milestone generation (already tested in Phase 1)

---

## Recommended Test Fixtures

### Test dates:
- `today = Temporal.Now.plainDateISO()` — For life expectancy calculations
- `dateInPast = Temporal.PlainDate.from("2020-01-01")` — For milestone date calculations
- `dateTimeInPast = Temporal.PlainDateTime.from("2020-01-01T12:00:00")` — For PlainDateTime tests

### Test values:
- Boundary: `"0"`, `"1"`, `"1000000000"`, `"1000000001"`
- Invalid: `"-1"`, `"abc"`, `"1.5"`, `""`, `"  "`
- Overflow: `"999999999"` (with years unit → exceeds Temporal max year)
- Life expectancy: Calculate value that produces date exactly 75 years from now, then test ±1

### Test units:
- Single unit: `["days"]`
- Multiple units: `["seconds", "days", "months"]`
- Empty: `[]`
- Units producing dates > 75 years: `["years"]` with value `100`

---

## Open Questions

### Q: Should validation allow empty value (`""`) to pass?
**Current behavior:** Yes — `validateValue("")` returns `true` (line 119)  
**Rationale:** Allows user to type without immediate error; form submit handles empty separately  
**Test decision:** Assert empty string returns `{ isValid: true, error: null }`

### Q: Should validation check life expectancy when `originalDate = null`?
**Current behavior:** No — lines 161-186 only run `if (originalDate)`  
**Rationale:** Can't calculate milestone date without base date  
**Test decision:** When `originalDate = null`, skip life-expectancy checks even if units selected

### Q: Should validation fail for Temporal overflow (e.g., year > 275760)?
**Current behavior:** Yes — `try/catch` around `originalDate.add()` returns error "Invalid combination" (lines 180-185)  
**Rationale:** Temporal API throws `RangeError` for out-of-bounds dates  
**Test decision:** Assert that values exceeding Temporal limits fail with "Invalid combination" error

---

## Phase 6 Scope Summary

**In scope:**
- ✅ Extract validation logic to `src/utils/customMilestoneValidation.ts`
- ✅ Write 15-20 unit tests for validation rules + edge cases
- ✅ Refactor `CustomMilestoneModal.tsx` to use extracted utility
- ✅ Verify all Phase 1 tests (54) still pass
- ✅ Update `test-plan.md` §6 cookbook with custom validation examples

**Out of scope:**
- ❌ UI integration tests for `CustomMilestoneModal` (Phase 2)
- ❌ E2E tests for custom milestone workflow (Phase 4)
- ❌ Firestore persistence tests (no custom values stored)
- ❌ Performance benchmarks for large values

**Success criteria:**
- All validation rules covered (value-only + life-expectancy)
- Edge cases tested (boundaries, overflows, multiple units)
- Error messages match existing UI strings
- Existing 54 tests still pass
- New tests run in <5s (add to ~2.5s suite)

---

**Research Status:** Complete — Ready for `/10x-plan`