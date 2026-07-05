# Phase 3 Plan: Calendar Export Format Validation Tests

**Plan Date:** 2026-07-05  
**Phase:** 3 — Calendar export format validation (integration tests)  
**Risk Coverage:** R3 (Calendar export generates invalid event)  
**Estimated Duration:** 30-40 minutes

## Implementation Steps

### Phase 3.1: Unit tests for calendar export functions

**File:** `src/utils/__tests__/calendarExport.test.ts` (new)

**Test blocks (~18 tests):**

1. **Event title formatting** (3 tests)
2. **Google date formatting** (4 tests: all-day start/end, timed start/end)
3. **Outlook date formatting** (4 tests: all-day start/end, timed start/end)
4. **Google URL builder** (2 tests: structure, encoding)
5. **Outlook URL builder** (2 tests: structure, encoding)
6. **ICS content validation** (2 tests: structure, required fields)
7. **Edge cases** (1 test: special characters)

### Phase 3.2: Verify and document

1. Run `npm test` → all 98 + ~18 Phase 3 tests pass
2. Update `test-plan.md` Phase 3 status to `complete`
3. Git commit

---

**Plan Status:** Ready for implementation