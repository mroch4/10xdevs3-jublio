# Firebase Auth Scaffold Implementation Plan

## Overview

Implement Firebase Authentication with passwordless email (magic link) to enable user login/logout. This is F-01 from the roadmap - a foundation that unlocks S-02 (bookmark portfolio), S-03 (calendar export), and S-05 (custom milestones). Users will be able to sign in via email link, with auth state persisted across sessions and accessible to any UI component.

## Current State Analysis

**What exists:**
- Firebase SDK (`firebase@^12.14.0`) already installed in `package.json`
- GitHub Actions deployment workflow (`.github/workflows/deploy.yml`) has Firebase environment variable placeholders (`VITE_FIREBASE_*`)
- Tech stack confirms `has_auth: true` and Firebase as the chosen backend
- React 19 + TypeScript + Vite frontend with no auth code yet

**What's missing:**
- No Firebase initialization code in `src/`
- No auth context or state management
- No UI components for sign-in/sign-out
- Firebase project not yet configured (auth provider enablement, authorized domains)

**Key constraints:**
- Must use native JS/TS (no lodash per `context/foundation/lessons.md`)
- Must work with existing Bootstrap 5 styling
- Anonymous users must be able to use the milestone calculator without sign-in friction

## Desired End State

### User Experience:

**Anonymous user:**
- Sees "Sign In" button in the app header
- Can use the milestone calculator freely without authentication
- When clicking "Save" on a milestone, sees an inline modal prompting for email to sign in

**Authenticated user:**
- Sees their email address + "Sign Out" button in the header
- Auth state persists across browser sessions and tabs
- When clicking "Save" on a milestone, immediately proceeds to save (no auth prompt)
- Can sign out from the header

**Magic link flow:**
1. User enters email in modal → clicks "Send Link"
2. Modal shows: "Check your email for a sign-in link (valid for 1 hour)"
3. User clicks link in email → redirected back to app → auto-signed in
4. If user was trying to save a milestone, that action completes automatically

**Error handling:**
- Network errors: "Network error - please try again" with retry button
- Invalid email: "Invalid email format"
- Expired link: "This link has expired - send a new one" with retry button
- All errors shown inline in the auth modal with contextual retry actions

**Loading states:**
- On app mount: small loading indicator in header until Firebase Auth reports ready (prevents "Sign In" → avatar UI flash)
- During sign-in: "Sending..." button state + spinner
- During sign-out: brief loading state

### Verification:

**Automated:**
- `npm run build` succeeds
- `npm run lint` passes
- `npm run typecheck` passes
- No console errors on page load

**Manual:**
- Anonymous user can calculate milestones without signing in
- Clicking "Sign In" opens modal with email input
- Entering valid email + clicking "Send Link" shows success message
- Email link redirects back and signs user in
- Header shows user's email + "Sign Out" button when authenticated
- "Sign Out" logs user out and returns to "Sign In" button state
- Auth state persists across page reload and new tabs
- Invalid email shows error message
- Clicking "Save" while signed out opens auth modal, completing save after successful auth

## What We're NOT Doing

- OAuth providers (Google, GitHub) - MVP is magic link only; OAuth can be added later
- User profile/name collection - displaying email only
- Password-based auth - passwordless only
- Custom email templates - using Firebase default magic link email
- Remember me toggle - persistence is always on (Firebase default)
- Multi-factor authentication
- Email verification workflow beyond the magic link itself
- Account deletion or email change (post-MVP features)
- Loading states for the entire app - only header auth UI has loading indicator

## Implementation Approach

Build Firebase Auth integration in three phases:

1. **Firebase SDK Setup** - Initialize Firebase with environment variables, create auth service module with sign-in/sign-out methods, establish auth state listener

2. **Auth Context Provider** - Create React Context to manage auth state globally, provide hooks for components to access current user and auth loading state, handle sign-in link completion on redirect

3. **UI Components** - Build auth modal for email sign-in, add header UI for sign-in/sign-out with loading states, integrate auth check into future "Save" button flow (hook for S-02)

**Key technical decisions:**

- **Firebase initialization:** Single `src/firebase/config.ts` module exports `auth` instance; environment variables via Vite's `import.meta.env`
- **Auth state management:** React Context (`AuthContext`) wraps the entire app in `main.tsx`, providing `{ user, loading, signIn, signOut }` to all components
- **Sign-in flow:** `sendSignInLinkToEmail()` → user clicks email link → `isSignInWithEmailLink()` checks URL → `signInWithEmailLink()` completes auth → Firebase `onAuthStateChanged` updates context
- **Persistence:** Firebase Auth uses `localStorage` by default (browserLocalPersistence) - no additional config needed
- **Error handling:** Map Firebase error codes to user-friendly messages via error utility function

## Phase 1: Firebase SDK Setup

### Overview

Initialize Firebase SDK, create auth service module, and establish the foundation for authentication. This phase focuses on server-side configuration and low-level Firebase integration - no UI yet.

### Changes Required:

#### 1. Firebase Configuration Module

**File**: `src/firebase/config.ts`

**Intent**: Initialize Firebase app with environment variables and export the auth instance for use throughout the application.

**Contract**: Exports `auth` (FirebaseAuth instance). Reads `VITE_FIREBASE_*` env vars from Vite's `import.meta.env` object. Uses Firebase SDK v12's modular imports (`firebase/app`, `firebase/auth`).

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

#### 2. Auth Service Module

**File**: `src/firebase/authService.ts`

**Intent**: Provide clean API for sign-in and sign-out operations, encapsulating Firebase Auth SDK calls and email link configuration.

**Contract**: Exports async functions `sendMagicLink(email: string): Promise<void>`, `completeMagicLinkSignIn(email: string): Promise<void>`, `signOut(): Promise<void>`. Uses `sendSignInLinkToEmail`, `isSignInWithEmailLink`, `signInWithEmailLink` from Firebase Auth. Magic link action code settings specify `url` (redirect back to app) and `handleCodeInApp: true`.

**Note**: Email storage in localStorage should include a timestamp for cleanup. Suggested key format: `{ email: string, timestamp: number }` stored under a known key (e.g., `'emailForSignIn'`).

#### 3. Error Handling Utility

**File**: `src/firebase/authErrors.ts`

**Intent**: Map Firebase error codes to user-friendly error messages.

**Contract**: Exports function `getAuthErrorMessage(error: unknown): string` that handles Firebase auth error codes (`auth/invalid-email`, `auth/network-request-failed`, `auth/invalid-action-code`, etc.) and returns readable strings like "Invalid email format", "Network error - please try again", "This link has expired - send a new one".

#### 4. Environment Variable Types

**File**: `src/vite-env.d.ts`

**Intent**: Add TypeScript declarations for Vite environment variables so `import.meta.env.VITE_FIREBASE_*` is type-safe.

**Contract**: Extend `ImportMetaEnv` interface with `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` as string properties.

#### 5. Local Environment Variables (Development)

**File**: `.env.local`

**Intent**: Provide local development Firebase config values (create file, add to `.gitignore` if not already there).

**Contract**: Contains `VITE_FIREBASE_*` key-value pairs. This file is not committed; developer must create it manually with their Firebase project credentials.

**Note**: `.env.local` should already be in `.gitignore` (standard Vite practice). Verify and add if missing.

### Success Criteria:

#### Automated Verification:

- Type checking passes: `npm run typecheck`
- Linting passes: `npm run lint`
- Build succeeds: `npm run build`
- No runtime errors when importing `src/firebase/config.ts` (verify via dev server)

#### Manual Verification:

- `.env.local` file exists with Firebase credentials (developer creates this manually)
- Firebase config loads without errors in browser console when app starts
- Auth instance is accessible (can verify by temporarily logging `auth.app.name` in console)
- Error utility correctly maps common Firebase error codes to friendly messages (unit test or manual check)

---

## Phase 2: Auth Context Provider

### Overview

Create React Context to manage authentication state globally, providing hooks for components to access the current user, loading state, and auth methods. Handle the magic link redirect completion.

### Changes Required:

#### 1. Auth Context

**File**: `src/contexts/AuthContext.tsx`

**Intent**: Provide global authentication state management using React Context, wrapping Firebase's `onAuthStateChanged` listener and exposing sign-in/sign-out methods.

**Contract**: Exports `AuthProvider` component. Does NOT export the hook - that lives in `src/hooks/useAuth.ts`. Context value type:

```typescript
{
  user: User | null;           // Firebase User object
  loading: boolean;            // true during initial auth check
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

The provider:
- Calls `onAuthStateChanged` on mount, setting `loading: false` once Firebase reports initial state
- Stores the current user in state
- On mount, checks if URL contains a sign-in link via `isSignInWithEmailLink()` - if yes, retrieves email from `localStorage` (stored before sending link), calls `completeMagicLinkSignIn()`, and clears the email from localStorage after successful sign-in
- Provides `signIn` method that calls `sendMagicLink()`, stores email in `localStorage` with a timestamp (needed for redirect completion), and shows success message state
- Provides `signOut` method that calls Firebase `signOut()` and clears any stored email from localStorage
- On mount, clears stale emails from localStorage (older than 1 hour, matching Firebase link expiration)

#### 2. Auth Hook

**File**: `src/hooks/useAuth.ts`

**Intent**: Export a custom React hook that provides access to authentication state and methods.

**Contract**: Exports `useAuth(): AuthContextValue` hook that consumes `AuthContext` and throws an error if used outside `AuthProvider`. This prevents runtime errors from missing context. Returns `{ user, loading, signIn, signOut }` from the context.

**Note**: Creates `src/hooks/` directory for custom React hooks. This establishes a standard location for hooks alongside `src/contexts/` and `src/components/`.

#### 3. Wrap App with Provider

**File**: `src/main.tsx`

**Intent**: Wrap the root `<App />` component with `<AuthProvider>` so all components can access auth state.

**Contract**: Imports `AuthProvider` from `src/contexts/AuthContext` and wraps `<App />`:

```typescript
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
	<AuthProvider>
	  <App />
	</AuthProvider>
  </React.StrictMode>
);
```

### Success Criteria:

#### Automated Verification:

- Type checking passes: `npm run typecheck`
- Linting passes: `npm run lint`
- Build succeeds: `npm run build`
- Dev server starts without errors: `npm run dev`

#### Manual Verification:

- App loads without console errors
- Auth context initializes: `loading` starts `true`, then becomes `false` after Firebase checks session
- `useAuth` hook is accessible from any component (verify by temporarily logging `useAuth()` in `App.tsx`)
- If a sign-in link is in the URL on page load, auth completes automatically (test by manually triggering magic link flow in next phase)

---

## Phase 3: UI Components

### Overview

Build the auth modal for email sign-in, integrate sign-in/sign-out UI into the header, and add loading states. This phase completes the user-facing authentication experience.

### Changes Required:

#### 1. Auth Modal Component

**File**: `src/components/AuthModal.tsx`

**Intent**: Render a Bootstrap modal with email input for magic link sign-in, showing success/error states inline.

**Contract**: Accepts props:

```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Optional callback after successful sign-in (for bookmark flow)
}
```

Renders a Bootstrap modal (`modal` + `modal-dialog`) with:
- Email input field (`<input type="email">`)
- "Send Link" button (calls `signIn()` from `useAuth`)
- Loading state during send ("Sending...")
- Success message: "Check your email for a sign-in link (valid for 1 hour)"
- Error message area (uses `getAuthErrorMessage()` for Firebase errors)
- "Try Again" button on error
- Close button / backdrop click closes modal (calls `onClose()`)

#### 2. Auth Header UI

**File**: `src/components/AuthHeader.tsx`

**Intent**: Display auth state in the app header - "Sign In" button when signed out, email + "Sign Out" button when signed in, with loading indicator during initial auth check.

**Contract**: Uses `useAuth()` hook to access `{ user, loading, signOut }`. Renders:

- If `loading === true`: small spinner or "Loading..." text
- If `user === null`: "Sign In" button that opens `AuthModal`
- If `user !== null`: display `user.email` + "Sign Out" button (calls `signOut()`)

Uses Bootstrap button classes (`btn btn-outline-primary` for Sign In, `btn btn-outline-secondary` for Sign Out).

#### 3. Integrate Auth Header into App

**File**: `src/App.tsx`

**Intent**: Add `<AuthHeader />` to the existing app header so auth UI is always visible.

**Contract**: Import `AuthHeader` and render it in the existing `<header>` section, likely as a flex item aligned to the right of the "Jublio" title.

#### 4. Auth Modal State Management

**File**: `src/App.tsx` (or `AuthHeader.tsx` if keeping state local)

**Intent**: Manage the open/closed state of the `AuthModal`.

**Contract**: Use `useState<boolean>` for modal open state. "Sign In" button in `AuthHeader` sets state to `true`, modal's `onClose` sets it to `false`.

#### 5. Bookmark Save Hook (Integration Point for S-02)

**File**: `src/components/MilestoneResults.tsx` (where "Save" button will eventually appear)

**Intent**: Add a placeholder "Save" button that checks auth state and opens the auth modal if user is signed out. This prepares for S-02 (bookmark feature) without implementing the actual save logic.

**Contract**: Add a "Save" button to each milestone result item. On click:
- If `user === null`: open `AuthModal` with `onSuccess` callback that will eventually trigger the bookmark save
- If `user !== null`: show a placeholder toast: "Save feature coming soon (S-02)" (actual bookmark save will be implemented in S-02)

This provides the UX flow now and a clear integration point for S-02's bookmark logic later.

### Success Criteria:

#### Automated Verification:

- Type checking passes: `npm run typecheck`
- Linting passes: `npm run lint`
- Build succeeds: `npm run build`
- Dev server starts without errors: `npm run dev`

#### Manual Verification:

- Header shows "Loading..." briefly on page load, then "Sign In" button
- Clicking "Sign In" opens the auth modal
- Entering a valid email and clicking "Send Link" shows "Sending..." then success message
- Email link arrives (check email inbox)
- Clicking email link redirects back to app and signs user in
- Header updates to show user's email + "Sign Out" button
- Auth state persists: refresh page → still signed in
- Open new tab → signed in there too
- Clicking "Sign Out" logs user out, header returns to "Sign In" button
- Invalid email shows error: "Invalid email format"
- Network error (simulate by going offline) shows: "Network error - please try again" with retry button
- Clicking "Save" on a milestone when signed out opens auth modal
- After successful sign-in via "Save" button flow, modal closes (placeholder toast shows "Save feature coming soon")
- Clicking "Save" when already signed in shows placeholder toast immediately
- Modal can be closed via backdrop click or close button, canceling the sign-in attempt

---

## Testing Strategy

### Unit Tests:

(Future work - not in this phase scope)

- `getAuthErrorMessage()` maps all Firebase error codes correctly
- `AuthContext` state transitions (loading → user/null) work as expected
- `sendMagicLink()` and `completeMagicLinkSignIn()` handle errors gracefully

### Integration Tests:

(Future work - not in this phase scope)

- Full magic link flow: send → click email link → redirect → signed in
- Auth persistence: sign in → refresh page → still signed in
- Sign out → refresh → signed out

### Manual Testing Steps:

1. **Happy path - magic link sign-in**:
   - Start signed out
   - Click "Sign In" → enter email → click "Send Link"
   - Check email → click link → redirected back → signed in
   - Verify header shows email + "Sign Out"

2. **Auth persistence**:
   - Sign in → refresh page → verify still signed in
   - Open new tab → verify signed in there too
   - Close browser → reopen → verify still signed in (localStorage persistence)

3. **Sign out**:
   - Click "Sign Out" → verify header returns to "Sign In" button
   - Refresh page → verify still signed out

4. **Error handling**:
   - Enter invalid email (e.g., "notanemail") → verify error message
   - Go offline → try to send link → verify network error message
   - Wait 1+ hour after sending link → click expired link → verify "This link has expired" error

5. **Save button flow (auth gate)**:
   - Signed out → click "Save" on a milestone → verify auth modal opens
   - Enter email → complete sign-in → verify modal closes and placeholder toast shows
   - Signed in → click "Save" → verify placeholder toast shows immediately (no modal)

6. **Modal UX**:
   - Click "Sign In" → modal opens
   - Click backdrop or X button → modal closes, no sign-in attempt
   - Open modal → enter email → send link → verify success message appears inline
   - Cause an error → verify error message appears inline with "Try Again" button

7. **Loading states**:
   - Hard refresh page → verify "Loading..." appears briefly in header before "Sign In" / user email
   - Click "Send Link" → verify button shows "Sending..." state
   - Click "Sign Out" → verify brief loading state (may be too fast to see)

8. **Edge cases**:
   - Sign in → navigate around the app → verify auth state persists
   - Sign in in Tab 1 → open Tab 2 → verify signed in there too
   - Sign out in Tab 1 → verify Tab 2 also signs out (Firebase syncs across tabs)

## Performance Considerations

- Firebase Auth initialization is lazy - only loads when auth state is first checked, minimizing initial bundle size
- `onAuthStateChanged` listener is established once in `AuthProvider`, not per-component
- Auth state updates trigger React Context updates, re-rendering only components that use `useAuth()` (not the entire app)
- Magic link email delivery is handled by Firebase servers, no client-side performance impact
- Persistence via `localStorage` is synchronous but extremely fast (< 1ms) for auth tokens

## References

- Roadmap: `context/foundation/roadmap.md` (F-01 section, lines 63-80)
- PRD: `context/foundation/prd.md` (FR-008 sign-in, FR-009 flat access model)
- Tech stack: `context/foundation/tech-stack.md` (confirms Firebase Auth)
- Lessons: `context/foundation/lessons.md` (no lodash rule)
- Firebase Auth docs: https://firebase.google.com/docs/auth/web/email-link-auth (magic link implementation)
- Vite env vars: https://vitejs.dev/guide/env-and-mode.html (`import.meta.env` usage)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Firebase SDK Setup

#### Automated

- [x] 1.1 Type checking passes: `tsc -b` (via build)
- [x] 1.2 Linting passes: `npm run lint`
- [x] 1.3 Build succeeds: `npm run build`
- [x] 1.4 No runtime errors when importing `src/firebase/config.ts` (verify via dev server)

#### Manual

- [ ] 1.5 `.env.local` file exists with Firebase credentials (developer creates this manually)
- [ ] 1.6 Firebase config loads without errors in browser console when app starts
- [ ] 1.7 Auth instance is accessible (can verify by temporarily logging `auth.app.name` in console)
- [ ] 1.8 Error utility correctly maps common Firebase error codes to friendly messages

### Phase 2: Auth Context Provider

#### Automated

- [ ] 2.1 Type checking passes: `npm run typecheck`
- [ ] 2.2 Linting passes: `npm run lint`
- [ ] 2.3 Build succeeds: `npm run build`
- [ ] 2.4 Dev server starts without errors: `npm run dev`

#### Manual

- [ ] 2.5 App loads without console errors
- [ ] 2.6 Auth context initializes: `loading` starts `true`, then becomes `false` after Firebase checks session
- [ ] 2.7 `useAuth` hook is accessible from any component (verify by temporarily logging `useAuth()` in `App.tsx`)
- [ ] 2.8 If a sign-in link is in the URL on page load, auth completes automatically

### Phase 3: UI Components

#### Automated

- [ ] 3.1 Type checking passes: `npm run typecheck`
- [ ] 3.2 Linting passes: `npm run lint`
- [ ] 3.3 Build succeeds: `npm run build`
- [ ] 3.4 Dev server starts without errors: `npm run dev`

#### Manual

- [ ] 3.5 Header shows "Loading..." briefly on page load, then "Sign In" button
- [ ] 3.6 Clicking "Sign In" opens the auth modal
- [ ] 3.7 Entering a valid email and clicking "Send Link" shows "Sending..." then success message
- [ ] 3.8 Email link arrives (check email inbox)
- [ ] 3.9 Clicking email link redirects back to app and signs user in
- [ ] 3.10 Header updates to show user's email + "Sign Out" button
- [ ] 3.11 Auth state persists: refresh page → still signed in
- [ ] 3.12 Open new tab → signed in there too
- [ ] 3.13 Clicking "Sign Out" logs user out, header returns to "Sign In" button
- [ ] 3.14 Invalid email shows error: "Invalid email format"
- [ ] 3.15 Network error shows: "Network error - please try again" with retry button
- [ ] 3.16 Clicking "Save" on a milestone when signed out opens auth modal
- [ ] 3.17 After successful sign-in via "Save" button flow, modal closes (placeholder toast shows)
- [ ] 3.18 Clicking "Save" when already signed in shows placeholder toast immediately
- [ ] 3.19 Modal can be closed via backdrop click or close button
