---
change_id: test-phase-2-bookmarks
phase: 2
status: deferred
created: 2026-07-05
deferred: 2026-07-05
test_plan_section: "§2 Phase 2"
risk_coverage: R2
---

# Phase 2: Bookmark Edit & Sync (Integration Tests)

## Change Brief

**Goal:** Cover **R2 (User loses bookmarks after edit or cross-device sync fails)** with integration tests for Firestore operations.

**Risk:** High impact — Destroys portfolio value; breaks core differentiation.

**Test Layer:** Integration (Firestore service functions with mocked Firestore SDK)

**Why Phase 2:** High-impact integration test; bookmark CRUD is core value prop.

---

## Scope

**In scope:**
- Firestore CRUD operations (add, get, update, delete)
- Title uniqueness validation
- Timestamp handling (createdAt preserved on update)
- Case-insensitive title checking

**Out of scope:**
- Real Firestore connections (use mocks)
- Cross-device sync timing
- Real-time listener tests
- UI component integration

---

## Success Criteria

- All R2 risk scenarios covered
- CRUD operations tested with mocked Firestore
- Title uniqueness edge cases tested
- Tests run in <3s

---

**Phase Status:** Research starting...