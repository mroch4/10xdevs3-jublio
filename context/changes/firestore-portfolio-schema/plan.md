# Firestore Portfolio Schema Implementation Plan

## Overview

Establish minimal Firestore schema for bookmark storage. Collection structure: `{userEmail}/bookmarks/{epochMs}` with `title` (max 50 chars) and `date` (YYYY-MM-DD or YYYY-MM-DDTHH:MM string). MVP uses power-of-10 milestones only (no custom values). This is F-02 from the roadmap — unlocks S-02 (bookmark and manage portfolio).

## Current State Analysis

**What exists:**
- Firebase SDK (`firebase@^12.14.0`) installed and configured (`src/firebase/config.ts`)
- Firebase Auth working (F-01 complete: magic link sign-in, auth state management via `AuthContext`)
- React 19 + TypeScript + Vite frontend
- Milestone calculation working (S-01 complete)
- No Firestore initialization yet

**What's missing:**
- No Firestore instance initialization
- No bookmark collection schema (but `Bookmark` class exists in `src/utils/classes/Bookmark.ts`)
- No security rules
- Need to align existing `Bookmark` class with Firestore schema (add `titleLowercase` field)
- No helper functions for Firestore operations

**Key constraints:**
- Must use native JS/TS (no lodash per `context/foundation/lessons.md`)
- Schema must support S-02 requirements (bookmark, edit, remove, cross-device sync)
- User email is collection key (Firestore path: `{email}/bookmarks/{epochMs}`)
- Document ID is epoch milliseconds (same as `createdAt` timestamp)
- Titles must be unique per user (case-insensitive)
- Existing `Bookmark` class in `src/utils/classes/Bookmark.ts` should be reused/extended
- Custom milestones deferred (not in MVP scope)

## Desired End State

### Data Model:

**Collection path**: `{userEmail}/bookmarks/{docId}`

Example: `rochowski.marcin@gmail.com/bookmarks/1746000000`

```typescript
{
  title: string;          // Max 50 chars, e.g., "Engagement Anniversary" (must be unique per user, case-insensitive)
  titleLowercase: string; // Lowercase version for case-insensitive uniqueness queries
  date: string;           // ISO date "2026-06-01" or datetime "2026-06-01T14:00:00"
  createdAt: number;      // Epoch milliseconds when bookmark was created (matches document ID)
  updatedAt: number;      // Epoch milliseconds when bookmark was last updated
}
```

**Document ID**: Epoch milliseconds (`createdAt` value) serves as the Firestore document ID.

**Uniqueness**: `titleLowercase` field enforces case-insensitive unique titles per user (e.g., "Wedding" and "wedding" are considered duplicates).

### Security Rules:

- Users can only read/write bookmarks under their own email collection
- All writes require authentication
- Anonymous users cannot access Firestore (calculation-only mode)
- Title max length 50 chars enforced
- Title must be unique per user (case-insensitive via `titleLowercase`)
- Date must be a non-empty string
- `createdAt` cannot be modified after initial write
- `updatedAt` must be updated on every write

### Verification:

**Automated:**
- `npm run build` succeeds
- `npm run lint` passes
- Type checking passes
- No console errors when initializing Firestore

**Manual:**
- Firestore instance initialized without errors
- Can write a bookmark to `{email}/bookmarks/{epochMs}`
- Bookmark visible in Firebase Console
- Security rules deployed and working
- TypeScript types compile without errors

## What We're NOT Doing

- Custom milestone values (deferred, not MVP)
- User profile documents (not needed; email is the collection key)
- Timezone field (not needed for MVP; client-side calculation handles local time)
- Firestore indexes beyond auto-generated (will add composite index for titleLowercase queries if needed)
- Firestore emulator setup
- Real-time listeners (S-02 will add when implementing portfolio view)
- Batch operations or transactions

## Implementation Approach

Single-phase implementation:

1. **Firestore Setup** - Initialize Firestore instance, create TypeScript type, write helper functions, deploy security rules

**Key technical decisions:**

- **Firestore initialization:** Extend `src/firebase/config.ts` to export `db` instance via `getFirestore()`
- **Collection structure:** `{userEmail}/bookmarks/{epochMs}` (email as top-level collection key)
- **Document ID:** Use epoch milliseconds as document ID (same as `createdAt` value from `Bookmark` class)
- **TypeScript type:** Reuse existing `Bookmark` class from `src/utils/classes/Bookmark.ts`, extend with `titleLowercase` field
- **Helper functions:** Create `src/firebase/firestoreService.ts` with CRUD operations + uniqueness check
- **Uniqueness enforcement:** Before writes, query `titleLowercase` field to check for duplicates

## Phase 1: Firestore Setup

### Overview

Initialize Firestore, define bookmark type, create helper functions, and deploy security rules. All in one phase.

### Changes Required:

#### 1. Firestore Instance

**File**: `src/firebase/config.ts`

**Intent**: Export Firestore instance alongside existing auth instance.

**Contract**: Exports `db` (Firestore instance). Uses Firebase SDK v12's modular imports (`firebase/firestore`). Instance uses same Firebase app already initialized for auth.

```typescript
import { getFirestore } from 'firebase/firestore';

// ... existing auth code ...

export const db = getFirestore(app);
```

#### 2. Extend Bookmark Class

**File**: `src/utils/classes/Bookmark.ts`

**Intent**: Add `titleLowercase` field for case-insensitive uniqueness checks.

**Contract**: Extends existing `Bookmark` class to include `titleLowercase: string` field. This field is automatically computed from `title.toLowerCase()` in the constructor.

```typescript
export default class Bookmark {
  date: string;
  title: string;
  titleLowercase: string;  // NEW: for case-insensitive uniqueness
  createdAt: number;
  updatedAt: number;

  constructor(title: string, date: string) {
    this.title = title;
    this.titleLowercase = title.toLowerCase();  // NEW
    this.date = date;
    this.createdAt = Temporal.Now.instant().epochMilliseconds;
    this.updatedAt = this.createdAt;
  }
}
```

#### 3. Firestore Helper Service

**File**: `src/firebase/firestoreService.ts`

**Intent**: Provide helper functions for bookmark CRUD operations.

**Contract**: Exports async functions:
- `checkTitleUniqueness(email: string, title: string, excludeId?: string): Promise<boolean>` - Returns true if title is available (case-insensitive), optionally excluding a specific document ID (for updates)
- `getBookmarks(email: string): Promise<Bookmark[]>` - Get all bookmarks for user, sorted by `createdAt` descending
- `addBookmark(email: string, bookmark: Bookmark): Promise<string>` - Add bookmark, returns document ID (same as `bookmark.createdAt`)
- `updateBookmark(email: string, docId: string, bookmark: Bookmark): Promise<void>` - Update existing bookmark (preserves `createdAt`, updates `updatedAt`)
- `deleteBookmark(email: string, docId: string): Promise<void>` - Delete bookmark

**Note**: Functions throw Firebase errors; caller is responsible for error handling.

Implementation notes:
- Document ID for new bookmarks: `bookmark.createdAt.toString()` (epoch milliseconds from `Bookmark` class)
- Collection path: `${email}/bookmarks`
- Use `setDoc`, `getDoc`, `getDocs`, `deleteDoc`, `query`, `where` from `firebase/firestore`
- `checkTitleUniqueness`: Query `where('titleLowercase', '==', title.toLowerCase())` to check for duplicates

#### 4. Firestore Security Rules

**File**: `firestore.rules`

**Intent**: Define security rules that allow users to read/write only their own bookmarks.

**Contract**: Rules enforce:
- Authentication required for all reads/writes
- Users can only access bookmarks under their own email
- Title must be a string with max 50 chars
- `titleLowercase` must equal `title.toLowerCase()`
- Date must be a non-empty string
- `createdAt` cannot be modified after initial write
- `updatedAt` must be updated on every write

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
	// User bookmarks collection
	match /{email}/bookmarks/{docId} {
	  allow read, delete: if request.auth != null && request.auth.token.email == email;
	  allow create: if request.auth != null 
		&& request.auth.token.email == email
		&& request.resource.data.title is string
		&& request.resource.data.title.size() <= 50
		&& request.resource.data.titleLowercase == request.resource.data.title.lower()
		&& request.resource.data.date is string
		&& request.resource.data.date.size() > 0
		&& request.resource.data.createdAt is number
		&& request.resource.data.updatedAt is number;
	  allow update: if request.auth != null 
		&& request.auth.token.email == email
		&& request.resource.data.title is string
		&& request.resource.data.title.size() <= 50
		&& request.resource.data.titleLowercase == request.resource.data.title.lower()
		&& request.resource.data.date is string
		&& request.resource.data.date.size() > 0
		&& request.resource.data.createdAt == resource.data.createdAt  // Cannot modify createdAt
		&& request.resource.data.updatedAt is number;
	}
  }
}
```

#### 5. Deploy Security Rules

**Manual step**: Deploy Firestore security rules to Firebase project.

**Steps**:
1. Ensure Firebase CLI installed: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize Firestore (if not already): `firebase init firestore` (select existing project)
4. Deploy rules: `firebase deploy --only firestore:rules`
5. Verify in Firebase Console → Firestore → Rules tab

**Note**: This is a one-time setup step. Rules are stored in `firestore.rules` for version control.

### Success Criteria:

#### Automated Verification:

- Type checking passes: `tsc -b`
- Linting passes: `npm run lint`
- Build succeeds: `npm run build`
- Dev server starts: `npm run dev`

#### Manual Verification:

- Security rules deployed to Firebase project (visible in Firebase Console)
- Can write a bookmark to `{email}/bookmarks/{epochMs}` when authenticated
- Bookmark visible in Firebase Console at correct path
- Attempting to read another user's bookmarks returns permission denied
- Writing without auth fails with permission error
- Title max length validation works (51+ chars rejected)

---

## References

- PRD: `context/foundation/prd.md` (FR-010 to FR-014 for bookmarks)
- Roadmap: `context/foundation/roadmap.md` (F-02 details)
- Lessons: `context/foundation/lessons.md` (no lodash rule)
- Firebase Firestore docs: https://firebase.google.com/docs/firestore
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Firestore Setup

#### Automated

- [x] 1.1 Type checking passes: `tsc -b` (via build) — 979ac22
- [x] 1.2 Linting passes: `npm run lint` — 979ac22
- [x] 1.3 Build succeeds: `npm run build` — 979ac22
- [x] 1.4 Dev server starts: `npm run dev` — 979ac22

#### Manual

- [x] 1.5 Firestore instance initialized (no console errors) — 979ac22
- [x] 1.6 TypeScript types compile — 979ac22
- [x] 1.7 Helper functions importable — 979ac22
- [x] 1.8 Security rules deployed — dd004a3
- [x] 1.9 Can write bookmark when authenticated — dd004a3
- [x] 1.10 Cannot write bookmark without auth — dd004a3
- [x] 1.11 Bookmark visible in Firebase Console — dd004a3
- [x] 1.12 Title uniqueness check works (case-insensitive) — dd004a3
- [x] 1.13 Cannot create duplicate titles (case-insensitive) — dd004a3
