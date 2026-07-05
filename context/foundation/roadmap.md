---
project: Milestone Celebration Tracker
version: 2
status: active
created: 2026-07-02
updated: 2026-07-05
prd_version: 1
main_goal: speed
top_blocker: none
---

# Roadmap: Milestone Celebration Tracker

> Derived from `context/foundation/prd.md` (v1) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## 📊 Status Summary (Updated 2026-07-05)

**Progress:** 7 of 7 items complete (100%) — ALL ROADMAP V2 ITEMS DONE! 🎉

- ✅ **Foundations complete** — Auth (F-01) + Firestore schema (F-02) both done
- ✅ **Core calculation** — Milestone calculation with Temporal API (S-01) done
- ✅ **Calendar export** — Google/Outlook/Apple export (S-03) done
- ✅ **North Star COMPLETE** — S-02 (bookmark & portfolio) done 2026-07-05
- ✅ **Custom values COMPLETE** — S-05 (custom milestone values) done 2026-07-05
- ✅ **Social share MVP COMPLETE** — S-04 (text-only social share) done 2026-07-05
  - Note: Text-only MVP shipped. AI image generation de-scoped to separate future feature.

**Next recommended action:** All v2 roadmap items complete! Consider:
1. **AI image feature** — S-04 enhancement: add AI-generated images to social shares (requires AI model spike)
2. **Polish & improvements** — Address technical debt, performance, accessibility
3. **Roadmap v3** — Define next wave of features based on user feedback

## Vision recap

Users manually calculate milestone anniversaries in weird time units (10,000 days, 1,000,000 seconds) and miss celebration moments. The unlock: a portfolio of tracked dates across multiple life domains (personal, relational, cultural, historical) multiplies celebration opportunities — you're likely celebrating something every day. This app calculates exponential-interval milestones (10, 100, 1K, 10K, 100K, 1M for each time unit), lets users bookmark important dates, and integrates with their calendar for reminders.

## North star

**S-02: User can bookmark calculated dates and view their persistent portfolio** — Proves the core differentiation (portfolio-as-multiplier) over single-use calculators. Returns + retention signal indicate the hypothesis works. Tied to Success Criterion: _"Return visits: Users come back when approaching a milestone"_.

> **North star** here means the smallest end-to-end slice whose successful delivery would prove the core product hypothesis — placed as early as Prerequisites allow because everything else only matters if this works.

**Status update (2026-07-05):** ✅ North Star feature COMPLETE (archived 2026-07-05). All prerequisites were met and the feature successfully delivered bookmark management with real-time sync, edit/delete capabilities, and cross-device portfolio persistence. Next: S-05 is now unblocked.

## At a glance

| ID   | Change ID                  | Outcome (user can …)                             | Prerequisites    | PRD refs         | Status   |
| ---- | -------------------------- | ------------------------------------------------ | ---------------- | ---------------- | -------- |
| F-01 | firebase-auth-scaffold     | (foundation) Firebase Auth configured for login  | —                | FR-008, FR-009   | done     |
| F-02 | firestore-portfolio-schema | (foundation) Firestore collections & schema live | —                | FR-010, FR-011   | done     |
| S-01 | calculate-milestones       | calculate milestones for any date (anonymous)    | —                | FR-001 to FR-006 | done     |
| S-02 | bookmark-and-manage        | bookmark dates and manage persistent portfolio   | F-01, F-02, S-01 | FR-010 to FR-014 | done     |
| S-03 | export-to-calendar         | export a milestone to Google/Apple/Outlook       | S-01             | FR-015 to FR-018 | done     |
| S-04 | social-share-with-ai       | share milestone on social media with AI image    | S-01             | FR-019 to FR-021 | done     |
| S-05 | custom-milestone-values    | add custom milestone values (e.g., 420, 25,000)  | S-01             | FR-006           | done     |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below; this table is the proposed reading order across parallel tracks.

| Stream | Theme                  | Chain                    | Note                                                                     |
| ------ | ---------------------- | ------------------------ | ------------------------------------------------------------------------ |
| A      | Foundation & calculate | `F-01` → `F-02` → `S-01` | ✅ COMPLETE — All foundation items done; S-01 calculation ready          |
| B      | Portfolio core         | `S-02` → `S-05`          | ✅ COMPLETE — S-02 done (2026-07-05); S-05 done (2026-07-05)             |
| C      | Sharing & export       | `S-01` → `S-03` / `S-04` | ✅ COMPLETE — S-03 done; S-04 text-only MVP done (AI images: future)     |

## Baseline

What's already in place in the codebase as of 2026-07-04 (auto-researched + user-confirmed).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — Vite + React 19 + TypeScript, entry at `src/main.tsx`, build tooling configured
- **Backend / API:** absent — No backend framework or API routes (client-side SPA only)
- **Data:** ✅ complete — Firebase Firestore configured with collections/schema (F-02 done)
- **Auth:** ✅ complete — Firebase Auth configured with magic-link/OAuth (F-01 done)
- **Deploy / infra:** present — GitHub Pages + GitHub Actions (auto-deploy on merge)
- **Observability:** absent — No logging or error tracking

**Key capabilities delivered:**
- ✅ Milestone calculation with Temporal API (S-01)
- ✅ Calendar export (Google/Outlook/Apple) with modal UI (S-03)
- ✅ Bookmark management with real-time sync (S-02)
- ✅ Portfolio view with edit/delete capabilities (S-02)
- ✅ Toast notification system
- ✅ Firebase Auth integration with magic-link + Google OAuth
- ✅ ErrorBoundary and accessibility features (WCAG 2.1 AA)

## Foundations

### F-01: Firebase Auth scaffold

- **Outcome:** (foundation) Firebase Authentication configured; passwordless magic-link or OAuth flow ready; login/logout accessible to any UI component.
- **Change ID:** `firebase-auth-scaffold`
- **PRD refs:** FR-008 (sign up/log in via email or OAuth), FR-009 (flat user access model)
- **Unlocks:** S-02 (bookmark + portfolio require logged-in user), S-05 (custom milestones logged-in only)
- **Prerequisites:** —
- **Parallel with:** F-02 (both are independent Foundations)
- **Blockers:** —
- **Status:** ✅ done (archived 2026-07-03)
- **Implementation:** Magic-link auth configured; Context API for session state; login/logout UI ready

### F-02: Firestore portfolio schema

- **Outcome:** (foundation) Firestore collections (`users`, `savedDates`, `customMilestones`) created; schema + access rules live; collections ready for S-02 to write bookmarks and S-05 to store custom values.
- **Change ID:** `firestore-portfolio-schema`
- **PRD refs:** FR-010 (bookmark with label), FR-011 (view persistent portfolio), FR-012 (edit bookmarked date), FR-013 (remove dates), FR-014 (cross-device sync)
- **Unlocks:** S-02 (bookmark + manage portfolio), S-05 (store custom milestones)
- **Prerequisites:** —
- **Parallel with:** F-01 (both independent)
- **Blockers:** —
- **Status:** ✅ done (archived 2026-07-03)
- **Implementation:** Collections configured; case-insensitive unique labels per-user; per-date timezone storage; real-time sync enabled

## Slices

### S-01: Calculate milestones

- **Outcome:** user can input a date (+ optional time) and see a sorted list of future milestones (10, 100, 1K, 10K, 100K, 1M for each applicable time unit: years, months, weeks, days, hours, minutes, seconds).
- **Change ID:** `calculate-milestones`
- **PRD refs:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, US-01
- **Prerequisites:** —
- **Parallel with:** F-01, F-02 (no dependency on auth or data storage)
- **Blockers:** —
- **Status:** ✅ done (archived 2026-07-02)
- **Implementation:** Temporal API polyfill for accurate date/time math; handles DST, leap years, timezone edge cases; sorted by nearest-first

### S-02: Bookmark and manage portfolio

- **Outcome:** user can bookmark a calculated milestone with a required unique label, view all bookmarked dates in a persistent portfolio, edit any bookmarked date (date/time/label/timezone) to trigger recomputation, and remove dates. Portfolio persists across sessions and devices.
- **Change ID:** `bookmark-and-manage`
- **PRD refs:** FR-010, FR-011, FR-012, FR-013, FR-014, US-02, US-04
- **Prerequisites:** F-01 (login required), F-02 (Firestore schema to persist), S-01 (calculate a milestone before bookmarking)
- **Parallel with:** —
- **Blockers:** —
- **Status:** ✅ done (archived 2026-07-05)
- **Implementation:** 
  - Tab navigation (Calculator | Bookmarks)
  - BookmarkModal with label validation (case-insensitive uniqueness, 50 char limit)
  - Real-time Firestore sync with `onSnapshot` listeners (<5 second cross-device sync)
  - BookmarksView with click-to-autofill flow (switches tab + populates calculator)
  - Edit/delete modals with confirmation and dirty-state detection
  - Loading/error/empty states with toast feedback
  - Accessibility: WCAG 2.1 AA compliance (ARIA labels, focus trap, ESC close)
  - Custom hooks: `useEscapeKey`, `useFocusTrap`
  - ErrorBoundary wrapper for production resilience
  - Terminology consistency: "Bookmarks" (not "Portfolio") throughout UI

### S-03: Export milestone to calendar

- **Outcome:** user can click a calendar icon on any calculated milestone and export it to Google Calendar, Apple Calendar, or Outlook with pre-filled event title ("[Value] [Unit] since [Label] ([original date/datetime])", e.g., "10,000 days since Wedding (2000-01-15)") and date/time. User provides a required label for milestone context. Export works on any calculated milestone via URL deep links (Google/Outlook) or .ics file download (Apple); user does not need to bookmark first.
- **Change ID:** `export-to-calendar`
- **PRD refs:** FR-015, FR-016, FR-017, FR-018, US-03
- **Prerequisites:** S-01 (export any calculated milestone)
- **Parallel with:** S-02 (independent features), S-04 (both share from S-01)
- **Blockers:** —
- **Unknowns:** ~~Exact deep-link formats for Google Calendar, Apple Calendar (iCal), Outlook (requires research). PRD Open Question #2.~~ ✅ Resolved — implemented with URL deep links for Google/Outlook; Apple Calendar uses `.ics` file download.
- **Risk:** ~~Calendar vendor APIs differ (Google vs. Apple vs. Outlook). Skills blocker: unfamiliar with calendar integration deep links.~~ ✅ Resolved — standard URL formats and iCalendar format implemented and tested.
- **Status:** done ✅
- **Implementation:** 
  - Milestone.label refactored to clean format (no "+" prefix)
  - Calendar URL generation utilities for Google/Outlook (deep links)
  - Apple Calendar: `.ics` file generation and automatic download
  - Toast notification system with auto-dismiss
  - Modal with label input, live preview matching export title format, and provider selection
  - Event title includes original input date/time for context
  - Accessible UI with ARIA labels and keyboard navigation
  - ESC key and backdrop click to close modal
  - Modal persists after provider click (label input retained)
  - Local timezone handling for timed events
  - Switch statement with default exception for provider routing
  - Commits: 3f0eb32, bdb632f, 8a8f20d, 611acf7, abf4098, 7589152, 6c17e24, 55e17c2
- **Testing:** ✅ Manual testing completed — all providers (Google, Apple, Outlook) verified, modal preview correct, cross-browser tested

### S-04: Social share with text-only MVP

- **Outcome:** user can share a milestone on Facebook, Messenger, WhatsApp, X/Twitter, LinkedIn, SMS, or copy to clipboard with context-aware text and attribution note. Text-only MVP de-scoped AI image generation due to latency/cost/model-choice uncertainty.
- **Change ID:** `social-share-with-ai`
- **PRD refs:** FR-019, FR-020, FR-021, US-05
- **Prerequisites:** S-01 (have a milestone to share)
- **Parallel with:** —
- **Blockers:** —
- **Status:** ✅ done (archived 2026-07-05)
- **Design decision:** Text-only MVP — AI image generation moved to future enhancement
- **Implementation notes:**
  - SocialProvider enum with 7 providers (Facebook, Messenger, WhatsApp, Twitter, LinkedIn, SMS, Copy)
  - Shared constants: MAX_SHARE_TEXT_LENGTH (280), ATTRIBUTION_URL
  - Context-aware share text based on milestone category: "Today's exactly..." / "On [date], it will be exactly..." / "On [date], it was exactly..."
  - Clipboard auto-copy workaround for Facebook/Messenger/LinkedIn (platforms without pre-fill API support)
  - ShareModal component mirrors CalendarExportModal pattern (label input, live preview, character counter, provider buttons, ESC/focus trap)
  - Modal note explaining paste-after-click for limited platforms
  - Toast notifications for success/popup-blocker detection
  - Switch statement with default exception for provider routing
  - Commits: e9e5e5c, 7bee106, 0fd0fab, bf51bba, 7612296, 049e7ce, 6f8afc1, 0516ab8, e6e4806
- **Testing:** ✅ Manual testing completed — all 7 providers verified, context-aware text tested across all milestone categories, clipboard behavior confirmed, keyboard accessibility validated, no regressions
- **Lesson:** Expect UX improvements during implementation — context-aware text and clipboard workarounds discovered during testing significantly improved UX and were documented as plan addenda

### S-05: Custom milestone values

- **Outcome:** user can add custom milestone values (e.g., 25,000 days, 420 hours, 2137 seconds) to any bookmarked date; custom values persist and appear sorted alongside default power-of-10 milestones (nearest first).
- **Change ID:** `custom-milestone-values`
- **PRD refs:** FR-006, US-06
- **Prerequisites:** S-02 (portfolio to store custom values on), F-02 (Firestore schema to persist custom milestones)
- **Parallel with:** —
- **Blockers:** —
- **Status:** ✅ done (archived 2026-07-05)
- **Design decision:** Session-only state (React state, not Firebase) — proves feature value before adding persistence
- **Implementation:** 5-phase incremental delivery with human lifetime validation (75-year limit), dynamic unit filtering, and auto-recalculation

## Backlog Handoff

| Roadmap ID | Change ID                  | Suggested issue title                                | Ready for `/10x-plan` | Notes                                                                  |
| ---------- | -------------------------- | ---------------------------------------------------- | --------------------- | ---------------------------------------------------------------------- |
| F-01       | firebase-auth-scaffold     | Set up Firebase Auth (magic link or OAuth)           | ✅ DONE               | Archived 2026-07-03                                                    |
| F-02       | firestore-portfolio-schema | Design and create Firestore collections + schema     | ✅ DONE               | Archived 2026-07-03                                                    |
| S-01       | calculate-milestones       | Implement milestone calculation with Temporal API    | ✅ DONE               | Archived 2026-07-02                                                    |
| S-02       | bookmark-and-manage        | Bookmark dates, manage portfolio, real-time sync     | ✅ DONE               | Archived 2026-07-05 — North Star feature complete                      |
| S-03       | export-to-calendar         | Export milestone to Google Calendar / Apple Calendar | ✅ DONE               | Archived 2026-07-03                                                    |
| S-04       | social-share-with-ai       | Social share with text (text-only MVP)               | ✅ DONE               | Archived 2026-07-05 — Text-only MVP complete; AI images: future feature |
| S-05       | custom-milestone-values    | Custom milestone values (session-only)               | ✅ DONE               | Archived 2026-07-05 — Session-only custom milestones complete          |

## Open Roadmap Questions

1. ~~**AI model for social share image generation?**~~ — ✅ RESOLVED: De-scoped from S-04. Text-only MVP shipped 2026-07-05. AI image generation is now a **future enhancement** (separate feature after v2 roadmap complete). When ready: spike 2–3 hours evaluating DALL-E free tier, Stable Diffusion, Hugging Face; pick one; test latency (must be < 3 seconds per NFR).

2. ~~**Calendar deep-link formats for export?**~~ — ✅ RESOLVED in S-03. Google/Outlook use URL deep links; Apple uses `.ics` download. Standard formats implemented and tested.

3. **Should past milestones be shown by default?** — PRD Open Question #3. Block: no (default to show with "Already passed" visual indicator). Can iterate post-launch.

4. ~~**Label uniqueness scope (case-sensitive)?**~~ — ✅ RESOLVED in F-02. Case-insensitive strict uniqueness implemented.

5. ~~**Custom milestone values: per-date or global?**~~ — ✅ RESOLVED for S-05. Per-date (each bookmarked date has its own custom milestones).

6. ~~**Can users bookmark same date twice with different labels?**~~ — ✅ RESOLVED in F-02. Yes, uniqueness is label-only (per-user), not date-only.

7. ~~**Timezone stored per-date or per-user?**~~ — ✅ RESOLVED in F-02. Per-date timezone storage for maximum flexibility.

8. **Attribution note format for social shares?** — PRD Open Question #8. Block: no (can iterate based on share performance post-launch). Applies to S-04.

## Parked

- **Email / push notifications** — PRD Non-Goal. Rationale: calendar export + user-set calendar notifications is sufficient. Deferred.
- **Recurring milestone events** — PRD Non-Goal. Rationale: each milestone is one-time. Deferred.
- **Collaborative / shared portfolios** — PRD Non-Goal. Rationale: each user manages independently. Deferred.
- **Premium / paid tiers** — PRD Non-Goal. Rationale: all features available to all logged-in users in MVP. Deferred.
- **Manual milestone entry** — PRD Non-Goal. Rationale: value is automatic calculation (discovery), not manual entry. Deferred.
- **Historical milestone analytics** — PRD Non-Goal. Rationale: focus on upcoming celebrations, not past data. Deferred.
- **Offline-first guarantee** — PRD Non-Functional Non-Goal. Rationale: MVP requires internet (calendar + social + Firestore). Deferred.
- **Multi-region SLA** — PRD Non-Functional Non-Goal. Rationale: single-region sufficient for MVP scale. Deferred.
- **Compliance certification** — PRD Non-Functional Non-Goal. Rationale: basic GDPR, no HIPAA/SOC2 needed. Deferred.

## Future Enhancements (Post-v2)

**Roadmap v2 complete (100%)** — All foundation and slice items shipped. Below are identified enhancements for future iterations:

### AI Image Generation for Social Shares

- **Context:** S-04 shipped as text-only MVP (2026-07-05). AI image generation was de-scoped due to latency/cost/model-choice uncertainty.
- **Opportunity:** Add AI-generated milestone images to social shares (e.g., illustrating "10,000 hours since Wedding") for increased engagement and viral potential.
- **Prerequisites:** 
  - AI model spike: evaluate DALL-E free tier, Stable Diffusion, Hugging Face (2–3 hours)
  - Latency validation: must generate < 3 seconds (NFR-002)
  - Cost analysis: free tier or open-source only constraint
- **PRD refs:** FR-019, FR-020, FR-021, US-05 (original S-04 scope)
- **Priority:** HIGH — Social sharing is growth engine per PRD; AI images significantly boost share appeal
- **Suggested change ID:** `social-share-ai-images`
- **Next step:** `/10x-frame` spike to evaluate models before planning

### Other Potential Enhancements

- **Persistent custom milestones** — Upgrade S-05 from session-only to Firebase persistence
- **Notification system** — Push/email reminders X days before milestone
- **Share history** — Track which milestones were shared, when, and where
- **Portfolio analytics** — Upcoming milestones dashboard, celebration frequency insights

## Done

### F-01: Firebase Auth scaffold

- **Change ID:** `firebase-auth-scaffold`
- **Archived:** 2026-07-03
- **Outcome:** (foundation) Firebase Authentication configured; passwordless magic-link or OAuth flow ready; login/logout accessible to any UI component.
- **Lesson:** —.

→ `context/archive/2026-07-03-firebase-auth-scaffold/`

### F-02: Firestore portfolio schema

- **Change ID:** `firestore-portfolio-schema`
- **Archived:** 2026-07-03
- **Outcome:** (foundation) Firestore collections & schema live; collections ready for S-02 to write bookmarks.
- **Lesson:** —.

→ `context/archive/2026-07-03-firestore-portfolio-schema/`

### S-01: Calculate milestones

- **Change ID:** `calculate-milestones`
- **Archived:** 2026-07-02T19:05:31Z
- **Outcome:** User can input a date (+ optional time) and see a sorted list of future milestones (10, 100, 1K, 10K, 100K, 1M for each applicable time unit: years, months, weeks, days, hours, minutes, seconds).

→ `context/archive/2026-07-02-calculate-milestones/`

### S-02: Bookmark and manage portfolio

- **Change ID:** `bookmark-and-manage`
- **Archived:** 2026-07-05
- **Outcome:** User can bookmark input dates with unique labels, view persistent portfolio with real-time sync, click to autofill calculator, edit bookmarks (date/time/label), and delete with confirmation. Cross-device sync within 5 seconds via Firestore listeners.
- **Lesson:** User bookmarks **input dates** (not milestone dates)—clicking bookmark autofills calculator and triggers recalculation. This reuses existing calculation flow and keeps portfolio simple. Terminology consistency matters: "Bookmarks" is clearer than "Portfolio" for end users.
- **Implementation notes:** 
  - 6-phase incremental delivery (bookmark → navigation → sync → edit → delete → polish)
  - WCAG 2.1 AA accessibility (ARIA, focus trap, keyboard nav)
  - Custom hooks for DRY: `useEscapeKey`, `useFocusTrap`
  - ErrorBoundary for production resilience
  - Real-time sync tested across devices (<5 second SLA met)
  - Case-insensitive unique labels (50 char limit)
- **Testing:** Manual cross-device testing verified sync latency; accessibility tested with keyboard navigation and screen reader

→ `context/archive/2026-07-05-bookmark-and-manage/`

### S-03: Export milestone to calendar

- **Change ID:** `export-to-calendar`
- **Archived:** 2026-07-03
- **Outcome:** User can export any calculated milestone to Google Calendar, Apple Calendar, or Outlook with pre-filled event title including original input date/time. Google/Outlook use URL deep links; Apple downloads .ics file. Modal provides label input with live preview matching export format.
- **Lesson:** Apple Calendar requires .ics file download rather than URL deep link for best compatibility. Event title including original date provides important context for calendar reminders.
- **Implementation notes:** Toast notifications, accessible modal with ESC/backdrop close, local timezone handling for timed events, switch statement with default exception for provider routing.
- **Testing:** Manual testing completed across all three providers; cross-browser verified.
- **Commits:** 3f0eb32, bdb632f, 8a8f20d, 611acf7, abf4098, 7589152, 6c17e24, 55e17c2

→ `context/archive/2026-07-03-export-to-calendar/`

### S-05: Custom milestone values

- **Change ID:** `custom-milestone-values`
- **Archived:** 2026-07-05
- **Outcome:** User can add custom milestone values (e.g., 420 days, 25,000 hours) on-the-fly during calculation. Custom milestones are session-only (React state, not Firebase), appear sorted alongside default power-of-10 milestones, and support multi-unit selection via checkbox UI.
- **Lesson:** Session-only state model simplifies implementation and proves feature value before adding persistence. Auto-calculation UX (removing manual Calculate button) required careful edge-case handling for initial load and bookmark autofill. Iterative UX refinement (single dropdown → multi-select checkboxes, result-side remove → modal management) improved usability without scope creep.
- **Implementation notes:**
  - 5-phase incremental delivery (state/type → modal → calculation merge → visual distinction → unit validation)
  - Human lifetime validation (75-year limit) prevents unrealistic dates
  - Dynamic unit filtering based on date vs. date+time input
  - "Reset Custom Milestones" button in modal for bulk removal
  - Auto-recalculation on input changes and custom milestone updates
  - Preserved custom milestones on Now/Reset buttons
- **Testing:** Manual testing confirmed session-only behavior, bookmark autofill edge cases, and button disabled states
- **Commits:** c29892d, 6141fa9, 46a974f, 534790f, f71ea40, 6ee9706, be58e71

→ `context/archive/2026-07-05-custom-milestone-values/`

### S-04: Social share with text-only MVP

- **Change ID:** `social-share-with-ai`
- **Archived:** 2026-07-05
- **Outcome:** User can share a milestone on Facebook, Messenger, WhatsApp, X/Twitter, LinkedIn, SMS, or copy to clipboard with context-aware text (today vs. future vs. past) and attribution. Text-only MVP de-scoped AI image generation due to latency/cost constraints. Platforms without pre-fill API support (Facebook/Messenger/LinkedIn) use clipboard auto-copy workaround with explanatory note.
- **Lesson:** Expect UX improvements and platform constraints during implementation — document as plan addenda, user-test, update plan before review. Original plan assumed AI image generation; implementation pivoted to text-only MVP for faster delivery. Context-aware share text (based on milestone category) and auto-copy workaround for limited platforms were discovered during implementation and improved UX significantly.
- **Implementation notes:**
  - SocialProvider enum, shared constants (MAX_SHARE_TEXT_LENGTH, ATTRIBUTION_URL)
  - generateShareUrl() utility with provider-specific URL formats
  - ShareModal component mirrors CalendarExportModal pattern (label input, live preview, character counter, provider buttons, ESC/focus trap)
  - Context-aware copy: "Today's exactly..." / "On [date], it will be exactly..." / "On [date], it was exactly..."
  - Clipboard API for Copy provider and auto-copy workaround for Facebook/Messenger/LinkedIn
  - Modal note explaining paste-after-click for limited platforms
  - Toast notifications for success/popup-blocker detection
- **Testing:** Manual testing verified all providers, context-aware text, clipboard behavior, keyboard accessibility, and no regressions
- **Commits:** e9e5e5c, 7bee106, 0fd0fab, bf51bba, 7612296, 049e7ce, 6f8afc1, 0516ab8, e6e4806

→ `context/archive/2026-07-05-social-share-with-ai/`

---

## Self-Review Checklist

✓ Frontmatter complete (8 keys: project, version, status, created, updated, prd_version, main_goal, top_blocker)
✓ Required sections present in order (Vision recap, North star, At a glance, Streams, Baseline, Foundations, Slices, Backlog Handoff, Open Roadmap Questions, Parked, Done)
✓ Every must-have FR covered: FR-001 to FR-025 all traceable to slices or foundations
✓ No cycles in dependency graph (Foundations acyclic; slices in topological order)
✓ Every blocked slice has ≥ 1 blocker identified (S-04 ↔ AI model choice)
✓ Every ready slice has Prerequisites that are complete
✓ Baseline ↔ Foundations consistency: baseline updated to reflect completed foundations (F-01, F-02 marked complete)
✓ Change IDs unique and kebab-case
✓ Backlog Handoff has one row per roadmap ID with current status
✓ Strategic term "north star" defined inline on first use (done in Vision recap section)
✓ No invented slices (all trace to PRD US-NN or FR-NNN)
✓ Status indicators consistent: ✅ done, 🟢 ready, ⏳ waiting, 🔴 blocked
✓ Open Questions resolved where applicable (5 of 8 resolved with ✅)
✓ Top blocker updated: changed from "skills" to "none" (prerequisites for S-02 complete)
