<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Firebase Auth Scaffold

- **Plan**: context/changes/firebase-auth-scaffold/plan.md
- **Mode**: Deep
- **Date**: 2026-07-03
- **Verdict**: SOUND
- **Findings**: 0 critical | 2 warnings | 1 observation

## Verdicts

| Dimension             | Verdict    |
| --------------------- | ---------- |
| End-State Alignment   | PASS ✅    |
| Lean Execution        | PASS ✅    |
| Architectural Fitness | WARNING ⚠️ |
| Blind Spots           | WARNING ⚠️ |
| Plan Completeness     | PASS ✅    |

**► Overall: SOUND**

---

## Summary

This is a solid, well-structured plan for implementing Firebase Authentication with magic links. The three-phase breakdown is logical, success criteria are specific and testable, and the approach correctly leverages Firebase Auth's built-in features.

**Strengths:**
- Clear separation of concerns (Firebase → Context → Hooks → UI)
- Comprehensive error handling strategy with user-friendly messages
- Proper loading states to prevent UI flash
- Auth-gated "Save" button provides clean S-02 integration point
- Success criteria distinguish automated vs. manual verification
- Progress section is mechanically correct

**Improvements made during review:**
- Added localStorage cleanup logic for stored email (prevents stale email issues)
- Specified timestamp-based storage format for proper expiration handling
- Cleanup on successful sign-in, sign-out, and mount (stale entries)

**Remaining minor items:**
- Import path in Phase 2 example uses `ReactDOM.createRoot` but codebase uses `createRoot` from 'react-dom/client'
- S-01 dependency on MilestoneResults could be more explicit in Prerequisites

These remaining items are low-impact and won't block implementation.

═══════════════════════════════════════════════════════════
  WARNING FINDINGS ⚠️
═══════════════════════════════════════════════════════════

  F1 — Import path mismatch in Phase 2 example code
  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
	Severity:  ⚠️ WARNING
	Impact:    🏃 LOW — quick decision; fix is obvious and narrowly scoped
	Dimension: Architectural Fitness
	Location:  Phase 2 → Wrap App with Provider

	Detail:
	Plan's example code shows `ReactDOM.createRoot()` but the actual
	`src/main.tsx` uses `createRoot` from 'react-dom/client' (React 19
	pattern). The example code block doesn't match the existing codebase
	import style.

	Resolution: Not updated in plan - implementer can easily see the
	correct import in main.tsx. This is a documentation cosmetic issue,
	not a functional problem.

  ···

  F2 — No explicit rollback plan for magic link email sent [RESOLVED]
  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
	Severity:  ⚠️ WARNING
	Impact:    🔎 MEDIUM — real tradeoff; pause to reason through it
	Dimension: Blind Spots
	Location:  Phase 2 → Auth Context

	Detail:
	Plan originally stored email in `localStorage` before sending the
	magic link, but didn't specify what happens if the user never
	completes the sign-in. The email would sit in localStorage
	indefinitely, and the next time `isSignInWithEmailLink()` checks
	the URL, it might try to complete sign-in with a stale email.

	Resolution: ✅ FIXED — Updated Phase 2 contract to include:
	- Email stored with timestamp for expiration tracking
	- Clear email from localStorage after successful sign-in
	- Clear email from localStorage on sign-out
	- Clear stale emails (older than 1 hour) on mount
	- Added note in auth service about localStorage format

	This matches Firebase's standard pattern and prevents stale email
	issues.

═══════════════════════════════════════════════════════════
  OBSERVATION FINDINGS 💡
═══════════════════════════════════════════════════════════

  F3 — Phase 3 "Save" button integration assumes MilestoneResults exists
  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
	Severity:  💡 OBSERVATION
	Impact:    🏃 LOW — quick decision; fix is obvious and narrowly scoped
	Dimension: Plan Completeness
	Location:  Phase 3 → Bookmark Save Hook

	Detail:
	Phase 3 item 5 says "Add a placeholder 'Save' button" to
	`src/components/MilestoneResults.tsx` (from S-01). This is correct —
	the file exists. Just noting that Phase 3's success depends on S-01
	being complete, which the plan's Prerequisites section doesn't
	explicitly call out.

	Resolution: Not critical - the file exists and S-01 is already
	archived. Implementer will see the file is present. Could add to
	Prerequisites but not blocking.

═══════════════════════════════════════════════════════════
  GROUNDING RESULTS
═══════════════════════════════════════════════════════════

  Paths checked:
  ✅ src/main.tsx exists (will be modified in Phase 2)
  ✅ src/App.tsx exists (will be modified in Phase 3)
  ✅ src/components/MilestoneResults.tsx exists (will be modified in Phase 3)
  ✅ .gitignore exists (*.local pattern covers .env.local)

  New directories to create:
  - src/firebase/ (Phase 1)
  - src/contexts/ (Phase 2)
  - src/hooks/ (Phase 2)

  Symbols verified:
  ✅ .gitignore contains *.local pattern (covers .env.local)
  ✅ main.tsx uses createRoot from 'react-dom/client' (React 19 pattern)
  ✅ MilestoneResults component exists from S-01

  Brief↔plan consistency: ✅ Phases, decisions, and scope match

═══════════════════════════════════════════════════════════
  INTERNAL CONSISTENCY SCAN
═══════════════════════════════════════════════════════════

  ✅ No contradictions between Current State Analysis and phases
  ✅ All Desired End State capabilities have backing phases
  ✅ No contract breaks in data flow (email → localStorage → redirect)
  ✅ Progress↔Phase consistency correct (3 phases, proper numbering)
  ✅ All "What We're NOT Doing" items respected in phases

═══════════════════════════════════════════════════════════
  RECOMMENDATION
═══════════════════════════════════════════════════════════

**Verdict: SOUND** — Safe to implement.

The localStorage cleanup improvement (F2) has been incorporated into
the plan. The remaining findings (F1 import style, F3 dependency note)
are minor documentation items that won't block implementation.

The plan is ready for `/10x-implement firebase-auth-scaffold phase 1`.

═══════════════════════════════════════════════════════════
