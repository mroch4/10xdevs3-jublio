---
change_id: test-phase-3-calendar
phase: 3
status: complete
created: 2026-07-05
completed: 2026-07-05
test_plan_section: "§2 Phase 3"
risk_coverage: R3
---

# Phase 3: Calendar Export Format Validation (Integration Tests)

## Change Brief

**Goal:** Cover **R3 (Calendar export generates invalid event with missing fields, wrong format, 404 deep-link)** with integration tests for calendar export formats and URL generation.

**Risk:** High impact — Breaks user's celebration reminder flow; high support burden.

**Likelihood:** Medium — Different calendar providers (Google URL vs. Outlook URL vs. Apple .ics); date serialization varies by provider.

**Test Layer:** Integration (component behavior with mocked calendar export logic)

**Why Phase 3:** High-impact integration test; external calendar APIs need validation; S-03 archived with "manual testing completed" but no automated regression suite.

---

## Scope

**In scope:**
- Calendar event format validation (.ics format for Apple/Outlook)
- Google Calendar URL generation
- Event fields (title, description, start/end dates, location)
- Deep-link URL validation (milestone URL in description)
- Date serialization (ISO format, timezone handling)
- Edge cases: special characters in titles, very long descriptions

**Out of scope:**
- E2E tests for actual calendar platform integration (external services)
- Cross-browser calendar download behavior
- Calendar sync/update after initial export
- Recurring events (not in PRD scope)

---

## Success Criteria

- All R3 risk scenarios covered with integration tests
- .ics format validated (VEVENT structure, required fields)
- Google Calendar URL format validated
- Deep-link URLs tested (correct milestone ID, valid format)
- Date serialization tested (ISO format, UTC conversion)
- Tests run in <5s (add to existing ~3s suite)

---

## Next Steps

1. **Research (`/10x-research`):** Examine calendar export implementation to understand .ics generation and URL formats
2. **Plan (`/10x-plan`):** Design integration test suite structure and test cases
3. **Implement (`/10x-implement`):** Write tests, verify coverage, update test plan

---

**Phase Status:** Research starting...