---
change_id: test-phase-6-custom-values
phase: 6
status: complete
created: 2026-07-05
completed: 2026-07-05
test_plan_section: "§2 Phase 6"
risk_coverage: R6
---

# Phase 6: Custom Milestone Validation (Unit Tests)

## Change Brief

**Goal:** Cover **R6 (Custom milestone values fail validation or produce out-of-bounds dates)** with unit tests for validation boundary cases.

**Scope:**
- Unit tests for custom milestone validation logic (positive integers, boundary values, life-expectancy filter)
- Test edge cases: very large values (999,999,999), zero, negative, fractional, boundary at 75-year cutoff
- Add tests to existing test suite (Vitest already configured in Phase 1)
- Update `test-plan.md` §6 cookbook with custom validation examples

**Out of scope:**
- UI testing for `CustomMilestoneModal.tsx` (Phase 2 integration tests)
- E2E testing of custom milestone workflow (Phase 4)
- Performance testing of large custom values

## Risk Coverage

### R6: Custom milestone values fail validation or produce out-of-bounds dates
- **Impact:** Medium — User frustration; weird celebration opportunities (core UX promise) break
- **Likelihood:** Low — Validation logic exists but no test coverage for boundary cases
- **Source:** PRD FR-006 (custom milestone values); US-06 (custom values respect filters); Roadmap S-05 archived 2026-07-05
- **Evidence:** Roadmap S-05 "validation rules" but no regression test; PRD "within life expectancy" filter must apply to custom values

**Test surface (from Phase 1 research + CardBase tests):**
- Custom milestone generation already tested in `CardBase.test.ts` (420, 2137, 25000, 52 weeks)
- Validation logic needs testing for:
  - Boundary values: 0, 1, max safe integer
  - Invalid inputs: negative, fractional, non-numeric
  - Life expectancy filter: values that produce dates >75 years from now
  - Edge cases: 999,999,999 seconds, 100,000,000 days

## Quality Signal

**Success criteria (what "done" looks like):**
1. ✅ At least 10 additional tests for custom milestone validation
2. ✅ Tests run in <10s (add to existing ~2.5s suite → target <5s total)
3. ✅ Coverage for boundary cases:
   - Zero value → error or skip
   - Negative value → error
   - Fractional value → error or round
   - Very large values (999,999,999) → calculated correctly or filtered
   - Values producing dates >75 years → category `BeyondHumanLifeExpectancy`
4. ✅ `test-plan.md` §6 updated with custom validation examples
5. ✅ All existing 54 tests still pass

**Non-goals (defer to later phases):**
- UI validation in modal → Phase 2 integration tests
- User journey testing → Phase 4 E2E tests
- Performance benchmarks for large values → Out of scope

## Questions for Research

Since Phase 1 already explored the codebase, we know:
- Custom milestones use `CardBase.getEvents()` with `customMilestones?: CustomMilestone[]` parameter
- `CustomMilestone` type: `{ unit: string, value: number, id: string }`
- Validation happens in UI (`CustomMilestoneModal.tsx`) — need to find validation logic

**Research needed:**
1. **Where is custom milestone validation logic?**  
   - Is it in `CustomMilestoneModal.tsx` (UI component)?
   - Is there a separate validation function (like `validateDateTime` for date/time)?
   - Or is validation inline in the modal component?

2. **What validation rules exist?**  
   - Positive integers only?
   - Min/max value constraints?
   - Per-unit constraints (e.g., seconds vs. days)?
   - Life expectancy filter applied?

3. **Should we extract validation to testable function?**  
   - If validation is inline in UI, extract to `src/utils/customMilestoneValidation.ts`?
   - Or test via component integration tests (Phase 2)?

4. **What error messages are shown?**  
   - "Value must be positive"?
   - "Value too large"?
   - Document expected messages for test assertions

## Next Steps

1. `/10x-research` (quick scan — most context from Phase 1 research)
2. `/10x-plan` (may include extraction of validation logic if inline)
3. `/10x-implement test-phase-6-custom-values phase 6`
4. `/10x-test-plan` to mark complete

---

**Status:** `change_opened` → Ready for research (or skip to plan if validation logic is obvious)