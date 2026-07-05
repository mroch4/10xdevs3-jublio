# Phase 6 Plan: Custom Milestone Validation Unit Tests

**Plan Date:** 2026-07-05
**Phase:** 6 — Custom milestone validation (unit tests)  
**Risk Coverage:** R6 (Custom milestone values fail validation or produce out-of-bounds dates)  
**Estimated Duration:** 30-45 minutes

---

## Plan Overview

**Goal:** Extract custom milestone validation logic from UI component to pure utility function and add comprehensive unit test coverage for all validation rules and edge cases.

**Approach:** Three-step refactor-and-test:
1. Extract validation logic from `CustomMilestoneModal.tsx` to `src/utils/customMilestoneValidation.ts`
2. Write 15-20 unit tests covering value validation, life expectancy checks, and edge cases
3. Refactor modal to use new utility and verify all tests pass (54 Phase 1 + ~15-20 Phase 6)

**Why this order?**
- Extract first → enables pure unit testing without React dependencies
- Tests after extraction → validates extracted logic matches original behavior
- Refactor modal last → ensures no UI regression

---

## Implementation Steps

### Phase 6.1: Extract validation utility

**File:** `src/utils/customMilestoneValidation.ts` (new)

**Extract from:** `CustomMilestoneModal.tsx` lines 113-190 (`validateValue` function)

**New API:**
```typescript
export interface CustomMilestoneValidationResult {
  isValid: boolean;
  error: string | null;
}

export function validateCustomMilestoneValue(
  value: string,
  selectedUnits: string[] = [],
  originalDate: Temporal.PlainDate | Temporal.PlainDateTime | null = null
): CustomMilestoneValidationResult
```

**Logic to extract:**
1. Empty value check → return `{ isValid: true, error: null }`
2. Parse integer → `parseInt(value, 10)`
3. Invalid number check → `isNaN(numValue)` → error "Value must be a valid number"
4. Decimal check → `value.includes(".")` → error "Value must be a whole number"
5. Minimum check → `numValue < MIN_CUSTOM_MILESTONE_VALUE` → error "Value must be at least 1"
6. Maximum check → `numValue > MAX_CUSTOM_MILESTONE_VALUE` → error "Value must be 1,000,000,000 or less"
7. Life expectancy check (if `originalDate` and `selectedUnits.length > 0`):
   - For each unit, calculate `originalDate.add({ [unit]: numValue })`
   - Compare with `Temporal.Now.plainDateTimeISO().add({ years: 75 })`
   - If exceeds → error "Milestone would exceed human lifetime ({value} {unit} is too far in the future)"
   - If Temporal throws → error "Invalid combination: {value} {unit}"

**Import dependencies:**
```typescript
import { Temporal } from "@js-temporal/polyfill";
import { MIN_CUSTOM_MILESTONE_VALUE, MAX_CUSTOM_MILESTONE_VALUE } from "./constants";
```

**Output:** Pure function with no React dependencies

---

### Phase 6.2: Write unit tests

**File:** `src/utils/__tests__/customMilestoneValidation.test.ts` (new)

**Test structure (15-20 tests across 3 describe blocks):**

#### Block 1: Value-only validation (no units, no originalDate)
1. ✅ Empty string → valid (no error)
2. ✅ Whitespace string → valid (trimmed to empty)
3. ✅ Invalid number ("abc") → error "Value must be a valid number"
4. ✅ Decimal value ("1.5") → error "Value must be a whole number"
5. ✅ Zero ("0") → error "Value must be at least 1"
6. ✅ Negative ("-1") → error "Value must be at least 1"
7. ✅ Minimum boundary ("1") → valid
8. ✅ Maximum boundary ("1000000000") → valid
9. ✅ Above maximum ("1000000001") → error "Value must be 1,000,000,000 or less"

#### Block 2: Life expectancy validation (with units and originalDate)
10. ✅ Valid combination (1000 days from 2020-01-01) → valid
11. ✅ Multiple valid units (100 days, weeks, months) → valid
12. ✅ Exceeds 75 years (100 years) → error "Milestone would exceed human lifetime"
13. ✅ Exceeds 75 years (40000 days ~109 years) → error "Milestone would exceed human lifetime"
14. ✅ Boundary at 75 years (calculate exact value) → valid or invalid depending on precision
15. ✅ Temporal overflow (999999999 years) → error "Invalid combination"
16. ✅ Mixed units (one valid, one exceeds) → error for exceeding unit

#### Block 3: Edge cases and context dependencies
17. ✅ Valid value with no units → valid (no life expectancy check)
18. ✅ Valid value with units but no originalDate → valid (can't check life expectancy)
19. ✅ PlainDate vs PlainDateTime originalDate → both work correctly
20. ✅ Very large but valid value (500000000 seconds ~15.8 years) → valid with days unit

**Test fixtures:**
```typescript
const today = Temporal.Now.plainDateISO();
const dateInPast = Temporal.PlainDate.from("2020-01-01");
const dateTimeInPast = Temporal.PlainDateTime.from("2020-01-01T12:00:00");
```

**Assertion pattern:**
```typescript
const result = validateCustomMilestoneValue("1", ["days"], dateInPast);
expect(result.isValid).toBe(true);
expect(result.error).toBe(null);
```

**Output:** ~20 passing unit tests in <3s (added to existing ~2.5s suite → target <6s total)

---

### Phase 6.3: Refactor modal to use utility

**File:** `src/components/modals/CustomMilestoneModal.tsx` (modify)

**Changes:**
1. Import new utility:
   ```typescript
   import { validateCustomMilestoneValue } from "../../utils/customMilestoneValidation";
   ```

2. Replace `validateValue` function (lines 113-190) with utility call:
   ```typescript
   const validateValue = (val: string): boolean => {
	 const result = validateCustomMilestoneValue(
	   val,
	   Array.from(selectedUnits),
	   originalDate
	 );

	 setValidationError(result.error);
	 setIsValueError(!result.isValid);

	 return result.isValid;
   };
   ```

3. Update `handleSubmit` originalDate check (lines 196-200) — keep as-is since it's submit-specific:
   ```typescript
   if (!originalDate) {
	 setValidationError("Please calculate milestones first before adding custom values");
	 setIsValueError(false);
	 return;
   }
   ```

**Output:** Modal behavior unchanged, validation logic now testable

---

### Phase 6.4: Verify and document

**Verification steps:**
1. Run `npm test` → all Phase 1 tests (54) + Phase 6 tests (~20) pass
2. Run `npm run build` → no TypeScript errors
3. Run `npm run lint` → no ESLint warnings
4. Manual smoke test: Open app → Calculate → Custom Milestone modal → test validation messages

**Documentation updates:**
1. Update `test-plan.md` §2 Phase 6 status to `complete`
2. Update `test-plan.md` §6 cookbook with custom validation examples:
   - Link to `customMilestoneValidation.test.ts`
   - Pattern: "Test pure utility functions for complex validation rules before UI integration"
   - Example: Value-only vs. context-dependent validation

**Output:** Phase 6 complete, ready for git commit

---

## Success Criteria

**Must have:**
- ✅ `src/utils/customMilestoneValidation.ts` created with extracted validation logic
- ✅ `src/utils/__tests__/customMilestoneValidation.test.ts` created with 15-20 passing tests
- ✅ `CustomMilestoneModal.tsx` refactored to use utility (no behavior change)
- ✅ All Phase 1 tests (54) still pass
- ✅ All Phase 6 tests (~20) pass
- ✅ `npm run build` and `npm run lint` pass
- ✅ Test suite runs in <6s total
- ✅ `test-plan.md` §2 Phase 6 marked `complete`
- ✅ `test-plan.md` §6 cookbook updated with custom validation examples

**Quality gates:**
- No new TypeScript errors
- No new ESLint warnings
- Modal validation behavior unchanged (manual smoke test)
- All error messages match existing UI strings

---

## Risk Analysis

### Risk: Extracted validation behaves differently from original
**Likelihood:** Low  
**Mitigation:** Copy exact logic from modal; test error messages match exactly; manual smoke test modal behavior

### Risk: Temporal arithmetic edge cases not covered
**Likelihood:** Medium  
**Mitigation:** Test very large values (999999999), Temporal overflow, and boundary at 75 years; rely on Temporal library correctness

### Risk: Modal refactor breaks UI state management
**Likelihood:** Low  
**Mitigation:** Keep validation state logic (`setValidationError`, `setIsValueError`) in modal; only replace validation logic itself

---

## Cost × Signal Analysis

**Development cost:** ~30-45 minutes
- Extract utility: 10 min
- Write tests: 20-30 min
- Refactor modal: 5 min
- Verify + document: 5-10 min

**Execution cost:** <1s per test run (add ~20 tests × ~0.05s each = ~1s to existing 2.5s suite)

**Signal quality:** High
- Covers R6 (custom milestone validation) completely
- Tests complex validation rules (6 value rules + life expectancy + Temporal overflow)
- Enables regression detection for future PRD changes to validation

**Maintenance cost:** Low
- Pure function, no React/UI dependencies
- Tests use deterministic dates (no `Temporal.Now` in assertions)
- Error message strings stable (from existing UI)

**Overall:** High value — Low cost, high signal, low maintenance; enables UI integration tests in Phase 2

---

## Open Questions

### Q: Should we test unit-disabling logic (`checkUnitExceedsLimit`)?
**Decision:** No — unit disabling is UI-specific logic (checkbox disabled state) and should be tested in Phase 2 integration tests. Phase 6 focuses on validation logic only.

### Q: Should we extract `checkUnitExceedsLimit` to utility as well?
**Decision:** No — that function is tightly coupled to modal state (`value` state variable) and checkbox rendering. Keep in component for now; refactor in Phase 2 if needed.

### Q: Should we handle `null` vs `undefined` for `originalDate`?
**Decision:** Use `null` as "no date" (matches existing code); TypeScript union type `Temporal.PlainDate | Temporal.PlainDateTime | null` handles both original date types.

---

## Implementation Order Rationale

**Why extract before testing?**
- Can't write pure unit tests for logic inside React component
- Extraction is low-risk (copy-paste + parameter conversion)

**Why refactor modal after testing?**
- Tests validate extracted logic works correctly
- If tests fail, we know extraction has bugs before touching modal
- Modal refactor is simple function call replacement

**Why verify at end?**
- Ensures no regression in Phase 1 tests
- Catches any TypeScript/lint issues from new imports

---

**Plan Status:** Ready for `/10x-implement test-phase-6-custom-values phase 6`