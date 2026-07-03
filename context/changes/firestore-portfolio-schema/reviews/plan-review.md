<!-- PLAN-REVIEW-REPORT -->
# Plan Review: Firestore Portfolio Schema

- **Plan**: context/changes/firestore-portfolio-schema/plan.md
- **Mode**: Deep
- **Date**: 2026-07-03
- **Verdict**: SOUND
- **Findings**: 0 critical, 2 warnings, 0 observations

## Verdicts

| Dimension | Verdict |
|-----------|---------|
| End-State Alignment | PASS |
| Lean Execution | PASS |
| Architectural Fitness | PASS |
| Blind Spots | WARNING |
| Plan Completeness | WARNING |

## Grounding

4/4 paths ✓ (config.ts, Bookmark.ts exist; firestoreService.ts, firestore.rules are new), Temporal usage ✓, brief↔plan ✓

## Findings

### F1 — No Firestore index for titleLowercase queries

- **Severity**: ⚠️ WARNING
- **Impact**: 🏃 LOW — quick decision; fix is obvious and narrowly scoped
- **Dimension**: Blind Spots
- **Location**: Phase 1 — Firestore Helper Service
- **Detail**: `checkTitleUniqueness()` will query `where('titleLowercase', '==', ...)` on every bookmark create/update. Firestore auto-creates single-field indexes, so this will work, but the plan says "will add composite index for titleLowercase queries if needed" in "What We're NOT Doing". This creates ambiguity: is the index needed now or later?
- **Fix**: Clarify that single-field auto-index is sufficient for MVP (equality queries on one field don't need manual indexes). Remove the "will add composite index" note or reword to "Composite indexes only if we add multi-field queries later."
- **Decision**: PENDING

### F2 — Security rules don't enforce uniqueness

- **Severity**: ⚠️ WARNING
- **Impact**: 🔎 MEDIUM — real tradeoff; pause to reason through it
- **Dimension**: Blind Spots
- **Location**: Phase 1 — Firestore Security Rules
- **Detail**: Security rules validate field types and `titleLowercase` derivation, but don't enforce uniqueness. A malicious/buggy client could write two bookmarks with the same `titleLowercase` if `checkTitleUniqueness()` is bypassed. The plan relies on client-side validation only.
- **Fix A ⭐ Recommended**: Accept client-side validation for MVP
  - Strength: Simpler rules; server-side uniqueness checks in Firestore rules are complex (requires exists() queries that count toward read quota). For a single-user app with trusted clients, client-side validation is acceptable.
  - Tradeoff: Race condition if two requests create the same title simultaneously (low probability in single-user scenario).
  - Confidence: HIGH — this is standard pattern for Firestore uniqueness in trusted client scenarios; server-side enforcement is expensive.
  - Blind spot: None significant for MVP scope.
- **Fix B**: Add server-side uniqueness check via Firestore rules
  - Strength: Enforces uniqueness at database level; prevents malicious clients from bypassing validation.
  - Tradeoff: Complex rules with exists() queries that count toward read quota; harder to debug; race conditions still possible without transactions.
  - Confidence: MEDIUM — server-side uniqueness in Firestore rules is notoriously tricky; may not be worth it for MVP.
  - Blind spot: Quota impact on exists() queries not measured.
- **Decision**: PENDING
