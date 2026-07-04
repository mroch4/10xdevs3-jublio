# S-02: Bookmark and Manage Portfolio - Implementation Plan

## Overview

Implement the north star slice: logged-in users can bookmark calculated milestones, view their persistent portfolio, edit bookmarked dates (triggering recomputation), and remove dates. Portfolio syncs across devices via Firestore real-time listeners. This proves the core product hypothesis: portfolio-as-multiplier creates more celebration opportunities than single-use calculators.

## Current State Analysis

**What exists:**
- ✅ Firebase Auth configured (F-01) - magic link + Google OAuth, `AuthContext` + `useAuth` hook
- ✅ Firestore collections & schema (F-02) - `Bookmark` class, `firestoreService` with CRUD operations
- ✅ Milestone calculation (S-01) - `DateCard`/`DateTimeCard` generate power-of-10 milestones
- ✅ `MilestoneCalculator` component renders `MilestoneResults` with calculated milestones
- ✅ `MilestoneResults` displays milestones grouped by category with calendar export
- ✅ Bootstrap 5.3.3 for UI components

**What's missing:**
- No bookmark button in milestone results
- No portfolio view component to display saved dates
- No edit/delete UI for bookmarked dates
- No navigation between calculator and portfolio views
- No real-time Firestore listeners for cross-device sync
- No recomputation flow when editing a bookmarked date
- No loading/error states for Firestore operations
- No empty state for portfolio when user has no bookmarks

**Key constraints:**
- Must use existing `Bookmark` class & `firestoreService` (F-02 foundation)
- Must reuse `MilestoneCalculator` logic for recomputation on edit
- Must respect label uniqueness (case-insensitive) per F-02 schema
- Must use Bootstrap 5.3.3 for UI consistency
- No lodash (per `context/foundation/lessons.md`)
- Auth required for all bookmark operations (anonymous users see prompts to log in)

## Desired End State

### User Experience:

**Anonymous user:**
1. Calculates milestones (existing flow)
2. Sees bookmark button with "Log in to save" tooltip
3. Clicking bookmark opens auth modal

**Logged-in user:**
1. Calculates milestones (existing flow)
2. Sees bookmark button on milestone results
3. Clicks bookmark → modal prompts for unique label → saves **input date/datetime** to Firestore
4. Navigates to "My Portfolio" tab
5. Sees all bookmarked dates (label + date/time) sorted by creation date
6. Clicks a bookmarked date → **switches to Calculator tab** and **autofills the input** → triggers automatic recalculation
7. Edits date/time/label via edit icon → updates Firestore
8. Deletes date via delete icon → confirmation modal → removes from Firestore
9. Portfolio syncs across devices in real-time (<5 seconds per NFR)

### UI Structure:

```
App.tsx
├── AuthHeader (existing)
└── Tabs: [Calculator | My Portfolio]
	├── Calculator Tab (existing MilestoneCalculator)
	│   └── MilestoneResults with Bookmark button
	└── Portfolio Tab (new)
		├── Empty state: "No bookmarks yet. Calculate a milestone to get started!"
		└── BookmarkList
			└── BookmarkCard (per saved date)
				├── Label, date/time display
				├── Click card → switch to Calculator tab + autofill input → recalculate
				├── Edit icon → BookmarkEditModal
				└── Delete icon → confirmation modal
```

### Data Flow:

**Bookmark creation:**
1. User clicks bookmark button in Calculator tab (above or below MilestoneResults)
2. `BookmarkModal` opens, prompts for label (max 50 chars)
3. Validates label uniqueness via `firestoreService.checkTitleUniqueness()`
4. Creates `Bookmark` instance with **input date/datetime** from calculator (NOT a milestone date)
5. Calls `firestoreService.addBookmark(user.email, bookmark)`
6. Shows success toast, switches to Portfolio tab

**Portfolio view:**
1. `PortfolioView` component mounts
2. Subscribes to Firestore real-time listener via `onSnapshot()`
3. Renders `BookmarkCard` for each bookmark, sorted by `createdAt` descending
4. Each card shows: label and date/time (no milestone computation)

**Autofill from portfolio:**
1. User clicks a `BookmarkCard` in Portfolio tab
2. App switches to Calculator tab
3. Passes bookmark's date/time to `MilestoneCalculator` to autofill input
4. `MilestoneCalculator` triggers automatic recalculation with autofilled date/time
5. User sees milestone results for the bookmarked date

**Edit flow:**
1. User clicks edit icon on `BookmarkCard`
2. `BookmarkEditModal` opens with pre-filled date/time/label
3. User modifies values
4. Validates new label uniqueness (exclude current bookmark ID)
5. Calls `firestoreService.updateBookmark(user.email, docId, updatedBookmark)`
6. Real-time listener auto-updates UI
7. Shows success toast

**Delete flow:**
1. User clicks delete icon on `BookmarkCard`
2. Confirmation modal: "Delete '[Label]'? This cannot be undone."
3. User confirms → calls `firestoreService.deleteBookmark(user.email, docId)`
4. Real-time listener auto-removes from UI
5. Shows success toast

### Verification:

**Automated:**
- `npm run build` succeeds
- `npm run lint` passes
- TypeScript compilation passes
- No console errors

**Manual:**
- Anonymous user sees "Log in to save" on bookmark button
- Logged-in user can bookmark input date with unique label
- Portfolio tab shows all bookmarked dates (label + date/time only)
- Clicking a bookmarked date switches to Calculator tab and autofills input → triggers recalculation
- Real-time sync works (open two browser tabs, bookmark on one, see update on other within 5 seconds)
- Edit date/time/label updates Firestore
- Delete removes bookmark from Firestore and UI
- Label uniqueness enforced (case-insensitive)
- Empty state renders when no bookmarks
- UI loading states during Firestore operations
- Toast notifications for success/error

## What We're NOT Doing

- Sorting options (default: `createdAt` descending per F-02)
- Filtering or search in portfolio (deferred, not MVP)
- Bulk delete (one-at-a-time sufficient for MVP)
- Undo delete (confirmation modal sufficient)
- Export multiple bookmarks to calendar at once (deferred)
- Custom milestone values (S-05, separate change)
- Sharing bookmarks with other users (PRD Non-Goal: collaborative portfolios)
- Offline mode (PRD Non-Functional Non-Goal)
- Advanced timezone picker (default to browser timezone, can override in edit modal)
- Drag-and-drop reordering (not in PRD)
- Computing milestone previews in portfolio cards (portfolio just shows saved dates; click to recalculate in Calculator tab)

## Implementation Approach

### Phase 1: Bookmark Button & Modal
**Outcome:** Logged-in user can bookmark input date from calculation results

**Changes:**
- Add bookmark button in `MilestoneCalculator` component (below input, above results)
- Show button with tooltip "Log in to save" for anonymous users (click opens `AuthModal`)
- For logged-in users, click opens `BookmarkModal`
- Create `BookmarkModal` component:
  - Input: current date/time from calculator input, user.email
  - Form: label input (max 50 chars), real-time uniqueness validation
  - Submit: creates `Bookmark` with **input date/datetime** (NOT a milestone date), calls `addBookmark()`
  - Success: toast notification, switches to Portfolio tab
  - Error: toast notification
- Pass input date/time state from `DateTimeInput` up to `MilestoneCalculator` so bookmark button can access it

**File contracts:**
- `src/components/MilestoneCalculator.tsx` - add bookmark button, lift date/time state, conditional rendering based on auth
- `src/components/DateTimeInput.tsx` - ensure date/time state is available to parent
- `src/components/BookmarkModal.tsx` (new) - form with label input, uniqueness validation, submit handler
- `src/components/Toast.tsx` (existing) - reuse for success/error messages

**Success criteria:**
- Bookmark button visible below input in `MilestoneCalculator`
- Anonymous users see tooltip "Log in to save"
- Logged-in users see `BookmarkModal` on click
- Label uniqueness enforced (case-insensitive)
- Bookmark saved to Firestore with **input date/datetime** (NOT milestone date)
- Toast notification on success/error

**Manual gate:** Verify bookmark creation in Firebase Console with input date, not milestone date

---

### Phase 2: Portfolio Tab Navigation
**Outcome:** User can switch between Calculator and Portfolio tabs

**Changes:**
- Refactor `App.tsx` to use Bootstrap tabs
- Two tabs: "Calculator" (existing `MilestoneCalculator`) and "My Portfolio" (new `PortfolioView`)
- Portfolio tab only accessible to logged-in users (anonymous users see "Log in to view your portfolio")
- Tab state managed in `App.tsx` (default: Calculator)
- `BookmarkModal` success switches to Portfolio tab

**File contracts:**
- `src/App.tsx` - add tab navigation, render `MilestoneCalculator` or `PortfolioView` based on active tab
- `src/components/PortfolioView.tsx` (new) - placeholder component, will be populated in Phase 3

**Success criteria:**
- Two tabs visible: Calculator | My Portfolio
- Default tab: Calculator
- Clicking My Portfolio switches to `PortfolioView`
- Anonymous users see "Log in to view your portfolio" on My Portfolio tab
- Bookmarking a milestone switches to My Portfolio tab

**Manual gate:** Verify tab switching works, anonymous users see login prompt

---

### Phase 3: Portfolio View with Real-time Sync
**Outcome:** Logged-in user sees all bookmarked dates, click to autofill Calculator and recalculate

**Changes:**
- Implement `PortfolioView` component:
  - Subscribe to Firestore real-time listener via `onSnapshot()` on mount
  - Fetch all bookmarks via `firestoreService.getBookmarks(user.email)`
  - Render `BookmarkCard` for each bookmark, sorted by `createdAt` descending
  - Empty state: "No bookmarks yet. Calculate a milestone to get started!" with "Go to Calculator" button
  - Loading state: spinner while fetching
  - Error state: toast notification
- Create `BookmarkCard` component:
  - Display: label and date/time only (no milestone computation)
  - Clickable card → switches to Calculator tab and autofills input → triggers recalculation
  - Placeholder for edit/delete icons (to be wired in Phase 4/5) OR defer icons entirely
- Real-time sync: `onSnapshot()` listener auto-updates UI on Firestore changes
- Add `onLoadBookmark` callback from `App.tsx` → `PortfolioView` → `BookmarkCard` to handle autofill:
  - Switch to Calculator tab
  - Pass bookmark date/time to `MilestoneCalculator`
  - Trigger automatic recalculation

**File contracts:**
- `src/App.tsx` - add `onLoadBookmark` callback to switch tabs and pass date to `MilestoneCalculator`
- `src/components/PortfolioView.tsx` - real-time listener, renders `BookmarkCard` list, empty/loading/error states
- `src/components/BookmarkCard.tsx` (new) - displays bookmark (label + date/time), click handler calls `onLoadBookmark`, decide: placeholder icons or defer until Phase 4/5
- `src/components/MilestoneCalculator.tsx` - accept optional initial date/time prop to autofill input and trigger calculation

**Success criteria:**
- Portfolio displays all bookmarked dates, sorted by `createdAt` descending
- Empty state renders when no bookmarks, "Go to Calculator" button works
- Loading spinner during initial fetch
- Real-time sync: bookmark added in one tab appears in another within 5 seconds
- Clicking a `BookmarkCard` switches to Calculator tab, autofills input, shows milestone results
- No milestone computation in portfolio cards (just label + date/time)

**Manual gate:** Open two browser tabs, bookmark on one, verify it appears on the other within 5 seconds. Click bookmark in portfolio, verify Calculator autofills and recalculates.

---

### Phase 4: Edit Bookmark
**Outcome:** User can edit bookmarked date (label, date, time)

**Changes:**
- Create `BookmarkEditModal` component:
  - Pre-fill form with existing bookmark data (label, date, time)
  - Date/time picker (reuse logic from `DateTimeInput`)
  - Label input with uniqueness validation (exclude current bookmark ID)
  - Submit: calls `firestoreService.updateBookmark(user.email, docId, updatedBookmark)`
  - Success: toast notification, real-time listener auto-updates UI
  - Error: toast notification
- `BookmarkCard` edit icon opens `BookmarkEditModal`

**File contracts:**
- `src/components/BookmarkEditModal.tsx` (new) - form with pre-filled data, uniqueness validation, update handler
- `src/components/BookmarkCard.tsx` - add edit button, opens `BookmarkEditModal`

**Success criteria:**
- Edit icon on `BookmarkCard` opens `BookmarkEditModal`
- Form pre-filled with existing data
- Label uniqueness enforced (exclude current bookmark)
- Update triggers real-time sync across devices
- Toast notification on success/error

**Manual gate:** Edit a bookmark, verify Firestore document updated, verify UI updates in real-time

---

### Phase 5: Delete Bookmark
**Outcome:** User can delete bookmarked dates with confirmation

**Changes:**
- Create `DeleteConfirmationModal` component:
  - Message: "Delete '[Label]'? This cannot be undone."
  - Buttons: Cancel | Delete (danger style)
  - Delete: calls `firestoreService.deleteBookmark(user.email, docId)`
  - Success: toast notification, real-time listener auto-removes from UI
  - Error: toast notification
- Add delete icon to `BookmarkCard` → opens `DeleteConfirmationModal`

**File contracts:**
- `src/components/DeleteConfirmationModal.tsx` (new) - confirmation dialog, delete handler
- `src/components/BookmarkCard.tsx` - add delete button, opens `DeleteConfirmationModal`

**Success criteria:**
- Delete icon on `BookmarkCard` opens confirmation modal
- Confirmation modal shows bookmark label
- Cancel closes modal without deleting
- Delete removes bookmark from Firestore and UI
- Real-time sync removes bookmark from other devices
- Toast notification on success/error

**Manual gate:** Delete a bookmark, verify Firestore document deleted, verify UI updates

---

### Phase 6: Polish & Error Handling
**Outcome:** Production-ready UX with loading states, error handling, accessibility

**Changes:**
- Add loading spinners for all Firestore operations
- Error boundaries for React components
- Accessible ARIA labels for icons (bookmark, edit, delete, expand)
- Keyboard navigation (Enter/Space for icon buttons)
- Focus management (modal open → focus input, modal close → return focus)
- Validate label length (max 50 chars) with character counter
- Responsive design for mobile (Bootstrap grid)
- Empty state with call-to-action: "Go to Calculator" button

**File contracts:**
- All components - add ARIA labels, keyboard handlers, focus management
- `src/components/BookmarkModal.tsx` - character counter for label input
- `src/components/PortfolioView.tsx` - error boundary, loading states
- `src/components/BookmarkCard.tsx` - responsive layout

**Success criteria:**
- All icon buttons have ARIA labels
- Keyboard navigation works (Tab, Enter, Space, Escape)
- Focus management in modals
- Label input shows character counter (0/50)
- Responsive layout on mobile (test in Chrome DevTools)
- Error boundaries catch React errors
- Loading spinners during Firestore operations
- Empty state with "Go to Calculator" button switches to Calculator tab

**Manual gate:** Test keyboard navigation, screen reader compatibility (if available), mobile responsiveness

---

## Progress

| Phase | Status | SHA | Notes |
|-------|--------|-----|-------|
| 1. Bookmark Button & Modal | completed | 669cf8f | Reused existing Pin Date button, validates without Calculate |
| 2. Portfolio Tab Navigation | completed | 30184af | Tab content visually connected, consistent Sign In terminology |
| 3. Portfolio View with Real-time Sync | completed | bdf9079 | Real-time onSnapshot, BookmarkCard with locale formatting, autofill to Calculator, Tab enum extracted |
| 4. Edit Bookmark | pending | | |
| 5. Delete Bookmark | pending | | |
| 6. Polish & Error Handling | pending | | |

---

## Key Files

- `src/App.tsx` - tab navigation, `onLoadBookmark` callback to switch tabs and autofill calculator
- `src/components/MilestoneCalculator.tsx` - add bookmark button, accept optional date/time prop for autofill
- `src/components/DateTimeInput.tsx` - lift date/time state to parent
- `src/components/BookmarkModal.tsx` - form to create bookmark with label, saves input date/time
- `src/components/PortfolioView.tsx` - real-time listener, renders bookmark list, empty/loading/error states
- `src/components/BookmarkCard.tsx` - displays bookmark (label + date/time), clickable to autofill calculator, edit/delete icons
- `src/components/BookmarkEditModal.tsx` - form to edit bookmark
- `src/components/DeleteConfirmationModal.tsx` - confirmation dialog
- `src/firebase/firestoreService.ts` - CRUD operations (already exists from F-02)
- `src/utils/classes/Bookmark.ts` - data model (already exists from F-02)
- `src/hooks/useAuth.ts` - access user state (already exists from F-01)

---

## Open Questions

1. **Label validation UI feedback:** Should we show inline error messages below the input, or toast notifications?
   - **Decision:** Inline error messages (Bootstrap `.invalid-feedback`) for immediate feedback, toasts for async errors (Firestore failures)

2. **Edit mode:** Should we use inline editing (click label → editable input) or a dedicated modal?
   - **Decision:** Dedicated modal (`BookmarkEditModal`) for consistency with bookmark creation flow

3. **Portfolio sorting:** Default is `createdAt` descending (newest first). Should we add sorting options (alphabetical by label, by date)?
   - **Decision:** Deferred to post-MVP. Default is sufficient for north star validation.

4. **Delete confirmation:** Modal vs. inline confirmation vs. undo toast?
   - **Decision:** Modal confirmation (safer, more explicit) + success toast (no undo in MVP)

5. **Bookmark button placement:** Should the bookmark button be in `MilestoneCalculator` (above/below input) or on each milestone in `MilestoneResults`?
   - **Decision:** In `MilestoneCalculator` below input. User bookmarks the input date/time, not individual milestones. Simpler UX.

6. **Portfolio card content:** Should cards show next milestone preview or just label + date/time?
   - **Decision:** Just label + date/time. Click to autofill calculator and recalculate. Avoids redundant computation, reuses existing flow.

7. **Autofill mechanism:** How to pass date from portfolio to calculator?
   - **Decision:** Lift `onLoadBookmark` callback from `App.tsx`, pass down to `PortfolioView` → `BookmarkCard`. Callback switches tabs and passes date to `MilestoneCalculator` as prop.

---

## Risks

1. **Real-time sync latency:** NFR requires cross-device sync within 5 seconds. Firestore `onSnapshot()` typically delivers updates in <1 second, but network latency or client offline scenarios could delay. Mitigation: test with slow 3G throttling in Chrome DevTools.

2. **Date/time state management:** Must lift date/time state from `DateTimeInput` to `MilestoneCalculator` so bookmark button can access it. Also need to accept date/time as prop for autofill from portfolio. Risk: prop drilling complexity. Mitigation: keep state in `MilestoneCalculator`, pass callbacks cleanly.

3. **State management complexity:** Multiple modals (`BookmarkModal`, `BookmarkEditModal`, `DeleteConfirmationModal`, `AuthModal`) + real-time listeners + tab state + autofill callback. Risk: prop drilling or stale state. Mitigation: lift state to `App.tsx`, pass callbacks explicitly (avoid Context for now unless needed).

4. **Label uniqueness race condition:** Two tabs bookmarking simultaneously with the same label could bypass uniqueness check. Firestore security rules enforce uniqueness server-side, so client validation is UX-only. Mitigation: acceptable risk for MVP (Firestore will reject duplicate, show error toast).

5. **Autofill and recalculation:** When user clicks a bookmark, must switch tabs, autofill input, AND trigger automatic recalculation. Risk: timing issues or missing recalculation. Mitigation: pass date/time as prop to `MilestoneCalculator`, use `useEffect` to detect prop change and trigger calculation.

6. **Empty state call-to-action:** "Go to Calculator" button must switch tabs programmatically. Requires passing tab-switching callback from `App.tsx` → `PortfolioView`. Ensure event handler wiring is correct.

---

## Foundation References

- **PRD:** FR-010 to FR-014, US-02, US-04
- **Roadmap:** S-02 (north star slice)
- **Lessons:** `context/foundation/lessons.md` (no lodash)
- **F-01 Auth:** `context/archive/2026-07-03-firebase-auth-scaffold/`
- **F-02 Schema:** `context/archive/2026-07-03-firestore-portfolio-schema/`
- **S-01 Calculate:** `context/archive/2026-07-02-calculate-milestones/`
