# Plan Review: bookmark-and-manage

**Reviewed:** 2026-07-03  
**Plan version:** Initial (pre-implementation)  
**Reviewer:** AI Agent (pre-code readiness check per M2L2)

---

## Summary

**Overall readiness:** ✅ **APPROVED** with 2 minor observations

The plan is well-structured, comprehensive, and ready for implementation. It correctly interprets the north star outcome (bookmark input dates, not milestones) and provides clear phase boundaries with manual gates. File contracts are specific, risks are identified with mitigations, and success criteria are testable.

**Strengths:**
- Clear separation: user bookmarks input date/time (not milestone dates)
- Autofill-from-portfolio design reuses existing calculation flow elegantly
- Real-time sync via Firestore `onSnapshot()` addresses NFR (cross-device <5 sec)
- Manual gates at each phase enable incremental verification
- All PRD requirements (FR-010 to FR-014, US-02, US-04) covered
- Explicit "What We're NOT Doing" section maintains scope discipline

**Minor observations:**
1. Phase 3 file contract lists edit/delete icons in `BookmarkCard` but those are Phase 4/5 features (premature reference)
2. Progress table shows "Phase 4: Edit Bookmark with Recomputation" but actual phase title is "Edit Bookmark" (no recomputation in portfolio per design)

---

## Checklist

### ✅ End State Clarity
- [x] Desired outcome clearly stated (bookmark input dates, portfolio view, edit/delete, autofill calculator)
- [x] User experience flow described for both anonymous and logged-in users
- [x] UI structure diagram shows component hierarchy and data flow
- [x] Success criteria are specific and testable (e.g., "real-time sync <5 sec", "bookmark saved with input date NOT milestone")

### ✅ Scope Alignment
- [x] Covers FR-010 (bookmark with label), FR-011 (view portfolio), FR-012 (edit date/label), FR-013 (remove), FR-014 (cross-device sync)
- [x] Aligns with US-02 (manage saved dates) and US-04 (edit/remove portfolio)
- [x] Respects prerequisites: F-01 (auth), F-02 (schema), S-01 (calculation) all marked done
- [x] "What We're NOT Doing" explicitly defers S-05 (custom milestones), social sharing, offline mode

### ✅ Phase Structure
- [x] 6 phases with clear boundaries and outcomes
- [x] Each phase has file contracts, success criteria, and manual gate
- [x] Phases build incrementally: bookmark button → tabs → portfolio view → edit → delete → polish
- [x] No phase mixes multiple orthogonal features
- [x] Progress table template ready for implementation tracking

### ⚠️ File Contracts
- [x] All key files listed with specific changes per phase
- [x] New files marked explicitly (e.g., `BookmarkModal.tsx` (new))
- [x] Existing files identified for modification (e.g., `App.tsx`, `MilestoneCalculator.tsx`)
- [⚠️] **Minor issue:** Phase 3 contract lists "Edit icon → opens `BookmarkEditModal` (Phase 4)" and "Delete icon → opens confirmation modal (Phase 5)" in `BookmarkCard` file contract, but edit/delete are Phase 4/5. Phase 3 should only create placeholder icons or defer them entirely. **Impact: low** (clarify during Phase 3 implementation whether to render disabled icons or wait until Phase 4/5)

### ✅ Dependencies & Risks
- [x] Prerequisites clearly listed and verified (F-01, F-02, S-01 done)
- [x] 6 risks identified with mitigations (real-time sync latency, state management, autofill timing, etc.)
- [x] Open questions resolved with explicit decisions (inline errors, dedicated modals, bookmark button placement)
- [x] No cycles or blocking unknowns

### ⚠️ Success Criteria
- [x] Automated: build/lint/typecheck pass, no console errors
- [x] Manual: per-phase verification steps (e.g., "verify bookmark in Firebase Console", "two-tab sync test")
- [⚠️] **Minor inconsistency:** Progress table Phase 4 title says "Edit Bookmark with Recomputation" but actual phase title is "Edit Bookmark" (plan correctly removes recomputation from portfolio per design decision). **Impact: minimal** (just a naming mismatch in progress table vs. phase heading)

### ✅ Scope Discipline
- [x] No feature creep (sorting, filtering, bulk delete explicitly deferred)
- [x] No premature optimization (milestone preview computation removed from portfolio)
- [x] No invented requirements (all features trace to PRD FR/US)

---

## Findings

### 1. Phase 3 file contract references future phase features (edit/delete icons)

**Severity:** Minor  
**Category:** Ordering clarity  
**Location:** `plan.md` lines 221-222, 232

**Context:**
Phase 3 "Portfolio View with Real-time Sync" file contract for `BookmarkCard.tsx` states:
- "Edit icon → opens `BookmarkEditModal` (Phase 4)"
- "Delete icon → opens confirmation modal (Phase 5)"

But Phase 3 success criteria only mentions "No milestone computation in portfolio cards (just label + date/time)" and autofill functionality. Edit/delete are Phase 4 and 5.

**Question:** Should Phase 3 render placeholder (disabled) icons for edit/delete, or should `BookmarkCard` be created without them and Phase 4/5 add them?

**Recommendation:** Clarify in Phase 3 manual gate:
- **Option A (cleaner):** Phase 3 creates `BookmarkCard` with only label, date/time display, and click-to-autofill. Phase 4 adds edit icon, Phase 5 adds delete icon.
- **Option B (preview):** Phase 3 renders disabled/placeholder icons to establish UI layout, Phase 4/5 wire them up.

**Impact if unresolved:** Low. Agent will decide during Phase 3 implementation, but explicit guidance prevents back-and-forth.

---

### 2. Progress table Phase 4 title mismatch

**Severity:** Trivial  
**Category:** Naming consistency  
**Location:** `plan.md` line 343

**Context:**
Progress table row 4 says: `| 4. Edit Bookmark with Recomputation | pending | | |`

But actual Phase 4 heading (line 247) says: `### Phase 4: Edit Bookmark`

The plan correctly removed "with Recomputation" from the phase because portfolio doesn't compute milestones; editing a bookmark updates Firestore, and clicking it autofills Calculator to recalculate.

**Recommendation:** Update progress table to match phase heading:
```
| 4. Edit Bookmark | pending | | |
```

**Impact if unresolved:** None (cosmetic only; doesn't affect implementation).

---

## Recommendations

### Must address before Phase 1:
- None. Plan is approved as-is.

### Nice to clarify during Phase 3:
1. **Edit/delete icon placement:** Decide whether Phase 3 renders placeholder icons or Phase 4/5 add them from scratch. Document decision in Phase 3 manual gate.

### Optional polish (post-implementation):
2. Fix progress table Phase 4 title to match phase heading ("Edit Bookmark" not "Edit Bookmark with Recomputation").

---

## Approval

**Status:** ✅ **APPROVED**

This plan is ready for `/10x-implement bookmark-and-manage phase 1`.

**Minor observations** (findings #1 and #2) do not block implementation. The agent can resolve #1 during Phase 3 execution, and #2 is a trivial naming mismatch with zero functional impact.

---

## Lessons Applied

✅ No lodash (per `context/foundation/lessons.md`)  
✅ Foundation references checked (F-01, F-02, S-01 all archived and complete)  
✅ PRD requirements mapped (FR-010 to FR-014, US-02, US-04)  
✅ Roadmap north star outcome addressed (portfolio-as-multiplier hypothesis)
