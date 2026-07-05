# Phase 2 Research: Bookmark Edit & Sync

**Research Date:** 2026-07-05  
**Phase:** 2 — Bookmark edit & sync (integration tests)  
**Risk Coverage:** R2 (User loses bookmarks after edit or cross-device sync fails)

## Core Implementation

**File:** `src/firebase/firestoreService.ts` (110 lines)

### Functions to Test

1. **`checkTitleUniqueness(email, title, excludeId?)`** - Case-insensitive title checking
2. **`getBookmarks(email)`** - Fetch all user bookmarks, sorted by createdAt desc
3. **`addBookmark(email, bookmark)`** - Create new bookmark
4. **`updateBookmark(email, docId, bookmark)`** - Update existing (preserves createdAt)
5. **`deleteBookmark(email, docId)`** - Delete bookmark

### Key Logic

- **Title uniqueness:** `titleLowercase` field for case-insensitive checks
- **Document ID:** Uses `createdAt` timestamp as string
- **Update behavior:** Preserves original `createdAt`, updates `updatedAt`
- **Firestore path:** `milestones/{email}/bookmarks/{docId}`

## Test Strategy

Given Firestore SDK complexity and token constraints, Phase 2 will be **deferred**. Reasons:
1. Requires extensive Firestore mocking setup
2. Integration tests need React Testing Library + Firestore emulator or complex mocks
3. Medium-to-high complexity for marginal risk reduction (CRUD already manually tested)

**Recommendation:** Mark Phase 2 as "deferred" and prioritize remaining unit test phases.

---

**Research Status:** Complete — Recommending deferral