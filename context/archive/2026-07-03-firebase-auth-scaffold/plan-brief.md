# Firebase Auth Scaffold — Plan Brief

> Full plan: `context/changes/firebase-auth-scaffold/plan.md`

## What & Why

Implement Firebase Authentication with passwordless email (magic link) to enable user login/logout. This is F-01 from the roadmap - a foundation that unlocks bookmark portfolio (S-02), calendar export (S-03), and custom milestones (S-05). Users need to sign in to save their important dates and access personalized features.

## Starting Point

Firebase SDK is already installed (`firebase@^12.14.0` in `package.json`), and the GitHub Actions deployment workflow has Firebase environment variable placeholders. However, no Firebase initialization code exists in `src/`, no auth context or state management is present, and the Firebase project hasn't been configured yet.

## Desired End State

Anonymous users can use the milestone calculator freely. When they click "Save" on a milestone, an inline modal prompts them to sign in via email link. After signing in (magic link flow), their auth state persists across sessions and tabs. The header displays their email address with a "Sign Out" button. All error states (network issues, invalid email, expired links) show contextual retry options.

## Key Decisions Made

| Decision                       | Choice                          | Why (1 sentence)                                                                                     | Source |
| ------------------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| Auth method                    | Magic link only (passwordless)  | Lowest friction, follows roadmap recommendation; OAuth can be added later                            | Plan   |
| UI integration                 | Header + auth-gated Save button | "Sign In" in header for discovery; "Save" triggers auth when needed for seamless bookmark flow       | Plan   |
| User display                   | Full email + Sign Out button    | Simple MVP approach; no profile/avatar complexity                                                    | Plan   |
| Auth state persistence         | Persist by default              | Firebase localStorage default; standard web app behavior users expect                                | Plan   |
| Error handling                 | Contextual messages with retry  | Maps Firebase error codes to friendly messages; gives users clear next steps                         | Plan   |
| Loading state                  | Header loading indicator        | Prevents UI flash (Sign In → avatar) on page load; professional feel                                 | Plan   |
| Modal UX                       | Closable with backdrop          | Users can cancel and continue browsing anonymously if they change their mind                         | Plan   |
| Firebase project setup         | Already done (assumed)          | Plan focuses on code implementation; Firebase Console setup is a prerequisite                        | Plan   |

## Scope

**In scope:**
- Firebase SDK initialization with environment variables
- Auth service module (send magic link, complete sign-in, sign-out)
- React Context for global auth state management
- Auth modal component for email sign-in
- Header UI for sign-in/sign-out with loading states
- Auth-gated "Save" button placeholder (integration point for S-02)
- Error handling and user-friendly error messages
- Session persistence across tabs and page reloads

**Out of scope:**
- OAuth providers (Google, GitHub) - can be added in a later phase
- User profile/name collection - email only for MVP
- Password-based auth
- Custom email templates (using Firebase defaults)
- Remember me toggle (always persisted)
- Multi-factor authentication
- Account deletion or email change
- Actual bookmark save logic (that's S-02)

## Architecture / Approach

Three-layer structure:
1. **Firebase layer** (`src/firebase/`) - Configuration, auth service methods, error mapping
2. **Context layer** (`src/contexts/AuthContext.tsx`) - React Context wraps `onAuthStateChanged`, provides auth state to all components
3. **Hooks layer** (`src/hooks/useAuth.ts`) - Custom React hook provides typed access to auth context
4. **UI layer** (`src/components/`) - Auth modal for sign-in, header component for auth state display

Magic link flow: User enters email → `sendSignInLinkToEmail()` + store email in localStorage → user clicks email link → redirect back to app → `isSignInWithEmailLink()` checks URL → `signInWithEmailLink()` completes auth → context updates via `onAuthStateChanged`.

## Phases at a Glance

| Phase                        | What it delivers                                                                 | Key risk                                                       |
| ---------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1. Firebase SDK Setup        | Config module, auth service, error handling utility, environment variable types  | Missing Firebase credentials block local dev                   |
| 2. Auth Context Provider     | Global auth state via React Context, magic link redirect completion             | Auth state sync across tabs requires Firebase SDK to work     |
| 3. UI Components             | Auth modal, header UI with loading states, auth-gated Save button placeholder    | UX friction if modal flow isn't clear or errors aren't helpful |

**Prerequisites:** 
- Firebase project created in Firebase Console
- Email/Password auth provider enabled with Email Link (passwordless) option
- Authorized domains added (jublio.pl, localhost)
- Firebase config values (API key, project ID, etc.) added to GitHub Secrets and `.env.local` for local dev

**Estimated effort:** ~1-2 sessions across 3 phases (assuming Firebase project is already configured)

## Open Risks & Assumptions

- **Firebase project setup assumed complete**: Plan starts with code implementation; if Firebase Console setup isn't done, Phase 1 will block on missing credentials
- **Email deliverability**: Magic link emails must arrive reliably; Firebase handles this, but spam filters or domain reputation could affect delivery
- **Link expiration UX**: Magic links expire after 1 hour (Firebase default); if users delay clicking the link, they'll need to request a new one - error message guides them
- **Session persistence edge cases**: Firebase SDK handles cross-tab sync, but browser privacy modes or aggressive cache clearing may sign users out unexpectedly

## Success Criteria (Summary)

- Anonymous users can calculate milestones without any auth friction
- Users can sign in via email link and see their email in the header
- Auth state persists across page reloads and tabs
- Clicking "Save" on a milestone when signed out triggers auth modal, completing the save after successful sign-in
- All error states show clear, actionable messages with retry options
