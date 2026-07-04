# S-02: Bookmark and Manage Portfolio - Brief

## Goal
Logged-in users bookmark input dates, view persistent portfolio, edit/delete dates, click to autofill Calculator and recalculate. Real-time sync across devices via Firestore. North star slice proving portfolio-as-multiplier hypothesis.

## Prerequisites
✅ F-01 (firebase-auth-scaffold) - `AuthContext`, `useAuth` hook
✅ F-02 (firestore-portfolio-schema) - `Bookmark` class, `firestoreService` CRUD
✅ S-01 (calculate-milestones) - `DateCard`/`DateTimeCard` logic

## Phases (6)

### 1. Bookmark Button & Modal
Add bookmark button in `MilestoneCalculator` (below input). Anonymous users see "Log in to save" tooltip. Logged-in users click → `BookmarkModal` → enter label (max 50 chars, unique case-insensitive) → save **input date/datetime** to Firestore → success toast → switch to Portfolio tab. Lift date/time state from `DateTimeInput` to `MilestoneCalculator`.

**Files:** `MilestoneCalculator.tsx`, `DateTimeInput.tsx`, `BookmarkModal.tsx` (new)
**Verify:** Bookmark saved to Firestore with input date (NOT milestone date), toast shown

---

### 2. Portfolio Tab Navigation
Refactor `App.tsx` with Bootstrap tabs: Calculator | My Portfolio. Default: Calculator. Anonymous users on Portfolio see "Log in to view your portfolio". `BookmarkModal` success switches to Portfolio tab.

**Files:** `App.tsx`, `PortfolioView.tsx` (new, placeholder)
**Verify:** Tab switching works, anonymous login prompt

---

### 3. Portfolio View with Real-time Sync
`PortfolioView` subscribes to Firestore `onSnapshot()`, renders `BookmarkCard` list sorted by `createdAt` descending. Each card shows label + date/time only (no milestone computation). Click card → switch to Calculator tab + autofill input → trigger recalculation. Empty/loading/error states. Real-time sync across devices.

**Files:** `App.tsx` (add `onLoadBookmark` callback), `PortfolioView.tsx`, `BookmarkCard.tsx` (new), `MilestoneCalculator.tsx` (accept date/time prop for autofill)
**Verify:** Real-time sync <5 sec (two tabs), click bookmark → autofills calculator and recalculates

---

### 4. Edit Bookmark
`BookmarkCard` edit icon → `BookmarkEditModal` (pre-filled date/time/label). Update calls `firestoreService.updateBookmark()`.

**Files:** `BookmarkEditModal.tsx` (new), `BookmarkCard.tsx` (edit button)
**Verify:** Edit updates Firestore, real-time sync

---

### 5. Delete Bookmark
`BookmarkCard` delete icon → `DeleteConfirmationModal` ("Delete '[Label]'? Cannot be undone."). Confirm → `firestoreService.deleteBookmark()` → real-time sync removes from UI → toast.

**Files:** `DeleteConfirmationModal.tsx` (new), `BookmarkCard.tsx` (delete button)
**Verify:** Delete removes from Firestore & UI, real-time sync

---

### 6. Polish & Error Handling
Loading spinners, ARIA labels, keyboard nav (Tab/Enter/Space/Escape), focus management, label character counter (0/50), responsive mobile layout, error boundaries, empty state "Go to Calculator" button.

**Files:** All components (accessibility, responsive)
**Verify:** Keyboard nav, mobile layout, character counter

---

## Key Contracts

- **`src/App.tsx`** - tab state, `onLoadBookmark` callback to switch tabs + autofill calculator
- **`src/components/MilestoneCalculator.tsx`** - bookmark button, lift date/time state, accept date/time prop for autofill
- **`src/components/DateTimeInput.tsx`** - lift date/time state to parent
- **`src/components/BookmarkModal.tsx`** - form, uniqueness validation, creates `Bookmark` with **input date/time**
- **`src/components/PortfolioView.tsx`** - real-time listener, bookmark list, empty state, loading/error
- **`src/components/BookmarkCard.tsx`** - label + date/time display, click calls `onLoadBookmark`, edit/delete icons
- **`src/components/BookmarkEditModal.tsx`** - form, uniqueness validation (exclude current), update
- **`src/components/DeleteConfirmationModal.tsx`** - confirmation, delete handler
- **`src/firebase/firestoreService.ts`** - CRUD (already exists)
- **`src/utils/classes/Bookmark.ts`** - data model (already exists)

---

## Decisions

1. Store **input date/time** when bookmarking (NOT milestone date) → portfolio shows saved dates, click to recalculate
2. Bookmark button in `MilestoneCalculator` (below input), not per milestone
3. Portfolio cards show label + date/time only (no milestone preview) → click to autofill calculator
4. `onLoadBookmark` callback from `App.tsx` switches tabs and passes date to `MilestoneCalculator` prop
5. Inline errors for validation, toasts for async errors
6. Dedicated modals for edit/delete (not inline)
7. Default sort: `createdAt` descending (no custom sorting in MVP)
8. Portfolio tab visible to anonymous users with "Log in" message (not hidden)

---

## Risks

- Real-time sync latency (NFR: <5 sec) → test with slow 3G
- Date/time state lifting from `DateTimeInput` → `MilestoneCalculator` → bookmark button must access it
- Autofill and recalculation timing → use `useEffect` to detect date prop change in `MilestoneCalculator`
- State management complexity (multiple modals + real-time + tabs + autofill) → lift state to `App.tsx`
- Label uniqueness race condition → Firestore security rules enforce server-side

---

## Success Criteria

- Anonymous: bookmark button shows "Log in to save" tooltip
- Logged-in: bookmark input date → modal → save → Portfolio tab shows bookmark (label + date/time)
- Portfolio: real-time sync <5 sec, click bookmark → switches to Calculator, autofills input, recalculates
- Edit: update date/time/label → real-time sync
- Delete: confirmation → remove → real-time sync
- Keyboard nav, ARIA labels, mobile responsive
- Build/lint/typecheck pass, no console errors
