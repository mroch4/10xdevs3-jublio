# F-02: Firestore Portfolio Schema — Plan Brief

**Change**: firestore-portfolio-schema  
**Status**: planned  
**Created**: 2026-07-03  

## The Ask

Establish minimal Firestore schema for bookmark storage. Collection structure: `{userEmail}/bookmarks/{epochMs}` with `title` (max 50 chars) and `date` (YYYY-MM-DD or YYYY-MM-DDTHH:MM string). MVP uses power-of-10 milestones only (no custom values). This is F-02 from the roadmap — unlocks S-02 (bookmark and manage portfolio).

## What Changes

### Single Phase: Firestore Setup

| File | Change |
|------|--------|
| `src/firebase/config.ts` | Export Firestore instance (`db`) via `getFirestore()` |
| `src/utils/classes/Bookmark.ts` | Add `titleLowercase` field for case-insensitive uniqueness |
| `src/firebase/firestoreService.ts` | **NEW** — CRUD helpers + title uniqueness check |
| `firestore.rules` | **NEW** — Security rules with uniqueness enforcement |

## Data Model

**Path**: `{userEmail}/bookmarks/{epochMs}`

**Example**: `rochowski.marcin@gmail.com/bookmarks/1746000000`

**Fields**:
- `title: string` — Max 50 chars, must be unique per user (case-insensitive)
- `titleLowercase: string` — Lowercase version for uniqueness queries
- `date: string` — ISO date `"2026-06-01"` or datetime `"2026-06-01T14:00:00"`
- `createdAt: number` — Epoch milliseconds when created (matches document ID)
- `updatedAt: number` — Epoch milliseconds when last updated

**Document ID**: Epoch milliseconds (`createdAt` value from existing `Bookmark` class).

## Key Decisions

- **Collection structure**: User email as top-level collection key (not subcollection)
- **Reuse existing `Bookmark` class**: Extend with `titleLowercase` field
- **Timestamps included**: `createdAt` and `updatedAt` from existing `Bookmark` class
- **Title uniqueness**: Case-insensitive enforcement via `titleLowercase` field + Firestore query
- **Document ID**: Epoch milliseconds (same as `createdAt`) from `Bookmark` class
- **No timezone field**: Client-side calculation handles local time
- **Security**: Users can only read/write their own bookmarks (email-based ACL)

## Validation

**Automated**: `tsc -b`, `npm run lint`, `npm run build`, dev server starts  
**Manual**: Security rules deployed, can write authenticated bookmark, title uniqueness enforced, permission checks work, bookmark visible in Firebase Console

## Dependencies

**Before F-02**: F-01 (Firebase Auth scaffold) ✅ done  
**After F-02**: S-02 (bookmark and manage portfolio) — blocked until F-02 complete

## Duration Estimate

**Optimistic**: 1 hour (minimal schema, no complex logic)  
**Realistic**: 1.5 hours (includes Firebase CLI setup, security rules deployment)  
**Pessimistic**: 2 hours (Firebase CLI issues, security rule debugging)

## Success Signal

User signs in → Can create bookmark via helper functions → Title uniqueness enforced (case-insensitive) → Bookmark appears in Firebase Console at `{email}/bookmarks/{createdAt}` → Security rules prevent unauthorized access → S-02 can build portfolio UI on this foundation.
