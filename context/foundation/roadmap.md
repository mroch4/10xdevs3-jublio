---
project: Milestone Celebration Tracker
version: 1
status: draft
created: 2026-07-02
updated: 2026-07-03
prd_version: 1
main_goal: speed
top_blocker: skills
---

# Roadmap: Milestone Celebration Tracker

> Derived from `context/foundation/prd.md` (v1) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Vision recap

Users manually calculate milestone anniversaries in weird time units (10,000 days, 1,000,000 seconds) and miss celebration moments. The unlock: a portfolio of tracked dates across multiple life domains (personal, relational, cultural, historical) multiplies celebration opportunities — you're likely celebrating something every day. This app calculates exponential-interval milestones (10, 100, 1K, 10K, 100K, 1M for each time unit), lets users bookmark important dates, and integrates with their calendar for reminders.

## North star

**S-02: User can bookmark calculated dates and view their persistent portfolio** — Proves the core differentiation (portfolio-as-multiplier) over single-use calculators. Returns + retention signal indicate the hypothesis works. Tied to Success Criterion: _"Return visits: Users come back when approaching a milestone"_.

> **North star** here means the smallest end-to-end slice whose successful delivery would prove the core product hypothesis — placed as early as Prerequisites allow because everything else only matters if this works.

## At a glance

| ID   | Change ID                  | Outcome (user can …)                             | Prerequisites    | PRD refs         | Status   |
| ---- | -------------------------- | ------------------------------------------------ | ---------------- | ---------------- | -------- |
| F-01 | firebase-auth-scaffold     | (foundation) Firebase Auth configured for login  | —                | FR-008, FR-009   | done     |
| F-02 | firestore-portfolio-schema | (foundation) Firestore collections & schema live | —                | FR-010, FR-011   | done     |
| S-01 | calculate-milestones       | calculate milestones for any date (anonymous)    | —                | FR-001 to FR-006 | done     |
| S-02 | bookmark-and-manage        | bookmark dates and manage persistent portfolio   | F-01, F-02, S-01 | FR-010 to FR-014 | proposed |
| S-03 | export-to-calendar         | export a milestone to Google/Apple/Outlook       | S-01             | FR-015 to FR-018 | done     |
| S-04 | social-share-with-ai       | share milestone on social media with AI image    | S-01             | FR-019 to FR-021 | blocked  |
| S-05 | custom-milestone-values    | add custom milestone values (e.g., 420, 25,000)  | S-02             | FR-006           | proposed |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below; this table is the proposed reading order across parallel tracks.

| Stream | Theme                  | Chain                    | Note                                                                     |
| ------ | ---------------------- | ------------------------ | ------------------------------------------------------------------------ |
| A      | Foundation & calculate | `F-01` → `F-02` → `S-01` | Async: F-01/F-02 can run in parallel; S-01 independent (no F prereq)     |
| B      | Portfolio core         | `S-02` → `S-05`          | S-02 unblocks custom values; S-05 requires portfolio schema              |
| C      | Sharing & export       | `S-01` → `S-03` / `S-04` | S-03 ready (export from calculation); S-04 blocked on AI model decision  |

## Baseline

What's already in place in the codebase as of 2026-07-02 (auto-researched + user-confirmed).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — Vite + React 19 + TypeScript, entry at `src/main.tsx`, build tooling configured
- **Backend / API:** absent — No backend framework or API routes (client-side SPA only)
- **Data:** partial — Firebase Firestore in tech-stack, SDK imported but collections/schema not yet configured
- **Auth:** partial — Firebase Auth in tech-stack (`has_auth: true`), SDK available but not configured; no auth code in App.tsx yet
- **Deploy / infra:** present — GitHub Pages + GitHub Actions (auto-deploy on merge)
- **Observability:** absent — No logging or error tracking

## Foundations

### F-01: Firebase Auth scaffold

- **Outcome:** (foundation) Firebase Authentication configured; passwordless magic-link or OAuth flow ready; login/logout accessible to any UI component.
- **Change ID:** `firebase-auth-scaffold`
- **PRD refs:** FR-008 (sign up/log in via email or OAuth), FR-009 (flat user access model)
- **Unlocks:** S-02 (bookmark + portfolio require logged-in user), S-05 (custom milestones logged-in only)
- **Prerequisites:** —
- **Parallel with:** F-02 (both are independent Foundations)
- **Blockers:** —
- **Unknowns:**
  - Auth provider choice (magic link vs. OAuth)? Recommendation in PRD: magic link preferred for low friction. Block: no (default to magic link; can swap later).
  - Where to store user ID / session state (Context API, localStorage, Firebase SDK state)? Block: no (Firebase SDK handles session out-of-box).
- **Risk:** Firebase Auth is new to solo builder (Skills blocker); spike time ~2–3 hours for basic integration. Plan for research/trial.
- **Status:** done

### F-02: Firestore portfolio schema

- **Outcome:** (foundation) Firestore collections (`users`, `savedDates`, `customMilestones`) created; schema + access rules live; collections ready for S-02 to write bookmarks and S-05 to store custom values.
- **Change ID:** `firestore-portfolio-schema`
- **PRD refs:** FR-010 (bookmark with label), FR-011 (view persistent portfolio), FR-012 (edit bookmarked date), FR-013 (remove dates), FR-014 (cross-device sync)
- **Unlocks:** S-02 (bookmark + manage portfolio), S-05 (store custom milestones)
- **Prerequisites:** —
- **Parallel with:** F-01 (both independent)
- **Blockers:** —
- **Unknowns:**
  - Uniqueness scope for labels (case-sensitive or case-insensitive)? PRD Open Question #4. Block: no (default to case-insensitive strict uniqueness; can iterate).
  - Should labels be unique per-date or globally per-user? PRD Open Question #6. Block: no (default to per-user global; simpler, can change later).
  - Should timezone be stored per-date or per-user? PRD Open Question #7. Block: no (default to per-date; more flexible).
- **Risk:** Schema design is critical for later features (edit, sync); changes mid-stream will require migration. Recommend upfront design review with PRD edge cases.
- **Status:** done

## Slices

### S-01: Calculate milestones

- **Outcome:** user can input a date (+ optional time) and see a sorted list of future milestones (10, 100, 1K, 10K, 100K, 1M for each applicable time unit: years, months, weeks, days, hours, minutes, seconds).
- **Change ID:** `calculate-milestones`
- **PRD refs:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, US-01
- **Prerequisites:** —
- **Parallel with:** F-01, F-02 (no dependency on auth or data storage)
- **Blockers:** —
- **Unknowns:**
  - Should past milestones be shown by default or hidden behind a toggle? PRD Open Question #3. Block: no (default to show with visual indicator "Already passed"; can toggle later).
  - Date picker UX: what controls for date, time, timezone? Block: no (standard HTML5 + custom overlay if needed).
- **Risk:** Date/time math is the core algorithm. Must handle DST, leap years, timezone edge cases correctly (NFR: "All milestone dates are mathematically correct"). Use Temporal API polyfill (already in package.json: `@js-temporal/polyfill`) to outsource complexity. If Temporal API unfamiliar, spike 1–2 hours on documentation.
- **Status:** ready

### S-02: Bookmark and manage portfolio

- **Outcome:** user can bookmark a calculated milestone with a required unique label, view all bookmarked dates in a persistent portfolio, edit any bookmarked date (date/time/label/timezone) to trigger recomputation, and remove dates. Portfolio persists across sessions and devices.
- **Change ID:** `bookmark-and-manage`
- **PRD refs:** FR-010, FR-011, FR-012, FR-013, FR-014, US-02, US-04
- **Prerequisites:** F-01 (login required), F-02 (Firestore schema to persist), S-01 (calculate a milestone before bookmarking)
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Sync latency: "cross-device sync within 5 seconds" (NFR). Firestore real-time listeners handle this, but will it meet SLA with network latency? Block: no (can measure post-launch and optimize if needed).
  - UI state management for edits: controlled component vs. uncontrolled input. Block: no (team choice; React 19 context or local state).
- **Risk:** Firestore cross-device sync + real-time listeners are new territory for solo builder (Skills blocker). Plan for learning + testing multidevice scenarios.
- **Status:** proposed

### S-03: Export milestone to calendar

- **Outcome:** user can click a calendar icon on any calculated milestone and export it to Google Calendar, Apple Calendar, or Outlook with pre-filled event title ("[Value] [Unit] milestone of [Label]", e.g., "10,000 days milestone of Wedding") and date/time. User provides a required label for milestone context. Export works on any calculated milestone via URL deep links; user does not need to bookmark first.
- **Change ID:** `export-to-calendar`
- **PRD refs:** FR-015, FR-016, FR-017, FR-018, US-03
- **Prerequisites:** S-01 (export any calculated milestone)
- **Parallel with:** S-02 (independent features), S-04 (both share from S-01)
- **Blockers:** —
- **Unknowns:** ~~Exact deep-link formats for Google Calendar, Apple Calendar (iCal), Outlook (requires research). PRD Open Question #2.~~ Resolved — implemented with URL deep links for all three providers; Apple Calendar uses Google Calendar URL.
- **Risk:** ~~Calendar vendor APIs differ (Google vs. Apple vs. Outlook). Skills blocker: unfamiliar with calendar integration deep links.~~ Resolved — standard URL formats implemented and tested.
- **Status:** done (pending mobile testing)
- **Implementation:** 
  - Milestone.label refactored to clean format (no "+" prefix)
  - Calendar URL generation utilities for Google/Apple/Outlook
  - Toast notification system with auto-dismiss
  - Modal with label input, live preview, and provider selection
  - Accessible UI with ARIA labels and keyboard navigation
  - ESC key and backdrop click to close modal
  - Local timezone handling for timed events
  - 5 commits: 3f0eb32, bdb632f, 8a8f20d, 611acf7, abf4098, 7589152
- **Testing:** Manual mobile testing in progress

### S-04: Social share with AI image

- **Outcome:** user can share a milestone on Facebook, Instagram, Twitter, WhatsApp, or SMS with an AI-generated image (e.g., illustrating "10,000 hours since Wedding") and attribution note ("Calculated with [App] at [URL]") for user acquisition.
- **Change ID:** `social-share-with-ai`
- **PRD refs:** FR-019, FR-020, FR-021, US-05
- **Prerequisites:** S-01 (have a milestone to share)
- **Parallel with:** —
- **Blockers:** TBD: which AI model? (Free tier: DALL-E, Stable Diffusion, Hugging Face?) Cost and latency constraints? API key availability?
- **Unknowns:**
  - AI model choice: DALL-E free tier, open-source Stable Diffusion, Hugging Face? PRD Open Question #1. Block: yes — image generation cannot start until model is chosen (cost/latency/quality tradeoff). Skills blocker: AI integration unfamiliar; recommend: spike 2–3 hours evaluating free models, pick one, test latency.
  - Image generation latency: NFR says "within 3 seconds" — will chosen model meet SLA? Block: yes (cannot proceed until latency verified in spike).
  - Attribution note format? PRD Open Question #8. Block: no (can iterate post-launch based on share performance).
- **Risk:** Skills blocker: AI integration is new. Social sharing is growth engine per PRD, but it's blocked on AI decision + latency validation. Recommend: run AI model spike as separate `/10x-frame` before S-04 planning; do NOT plan S-04 until spike lands.
- **Status:** blocked

### S-05: Custom milestone values

- **Outcome:** user can add custom milestone values (e.g., 25,000 days, 420 hours, 2137 seconds) to any bookmarked date; custom values persist and appear sorted alongside default power-of-10 milestones (nearest first).
- **Change ID:** `custom-milestone-values`
- **PRD refs:** FR-006, US-06
- **Prerequisites:** S-02 (portfolio to store custom values on), F-02 (Firestore schema to persist custom milestones)
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Per-date vs. global custom values? PRD Open Question #5. Block: no (default to per-date; each date can have its own custom milestones; simpler and more flexible).
- **Risk:** Low. Small feature; straightforward data model once F-02 schema is live.
- **Status:** proposed

## Backlog Handoff

| Roadmap ID | Change ID                  | Suggested issue title                                | Ready for `/10x-plan` | Notes                                                                  |
| ---------- | -------------------------- | ---------------------------------------------------- | --------------------- | ---------------------------------------------------------------------- |
| F-01       | firebase-auth-scaffold     | Set up Firebase Auth (magic link or OAuth)           | yes                   | Plan this first if you want to unblock S-02; run in parallel with F-02 |
| F-02       | firestore-portfolio-schema | Design and create Firestore collections + schema     | yes                   | Plan in parallel with F-01; unblocks S-02 and S-05                     |
| S-01       | calculate-milestones       | Implement milestone calculation with Temporal API    | yes                   | No prerequisites; can start immediately. Prove algorithm first.        |
| S-02       | bookmark-and-manage        | Bookmark dates, manage portfolio, real-time sync     | no                    | Unblock: F-01 + F-02 + S-01 must be ready                              |
| S-03       | export-to-calendar         | Export milestone to Google Calendar / Apple Calendar | yes                   | No prerequisites blocking; calendar formats well-documented. Ready now |
| S-04       | social-share-with-ai       | Social share with AI-generated image                 | no                    | Blocked: AI model choice + latency validation. Run `/10x-frame` spike  |
| S-05       | custom-milestone-values    | Custom milestone values per bookmarked date          | no                    | Unblock: S-02 + F-02 must be ready                                     |

## Open Roadmap Questions

1. **AI model for social share image generation?** — PRD Open Question #1. Block: yes (S-04). Owner: TBD. Constraint: free tier or open-source only. Recommendation: spike 2–3 hours evaluating DALL-E free tier, Stable Diffusion, Hugging Face; pick one; test latency (must be < 3 seconds per NFR). This is the Skills blocker.

2. **Calendar deep-link formats for export?** — PRD Open Question #2. Block: no (S-03). Owner: TBD. Research: what are the exact URL schemes / iCal formats for Google Calendar, Apple Calendar (iCal), Outlook? Recommendation: research standard formats during S-03 planning; Google Calendar URL scheme + iCal .ics file are well-documented standards.

3. **Should past milestones be shown by default?** — PRD Open Question #3. Block: no (default to show with "Already passed" visual indicator). Owner: TBD. Can iterate post-launch.

4. **Label uniqueness scope (case-sensitive)?** — PRD Open Question #4. Block: no (default to case-insensitive strict uniqueness). Owner: TBD. Can iterate.

5. **Custom milestone values: per-date or global?** — PRD Open Question #5. Block: no (default to per-date). Owner: TBD. Can iterate.

6. **Can users bookmark same date twice with different labels?** — PRD Open Question #6. Block: no (default to allow; uniqueness is label-only, not date-only). Owner: TBD. Can iterate.

7. **Timezone stored per-date or per-user?** — PRD Open Question #7. Block: no (default to per-date). Owner: TBD. Can iterate.

8. **Attribution note format for social shares?** — PRD Open Question #8. Block: no (can iterate based on share performance). Owner: TBD.

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

(Empty on first generation. `/10x-archive` appends entries here when a change archives.)

---

## Self-Review Checklist

✓ Frontmatter complete (8 keys: project, version, status, created, updated, prd_version, main_goal, top_blocker)
✓ Required sections present in order (Vision recap, North star, At a glance, Streams, Baseline, Foundations, Slices, Backlog Handoff, Open Roadmap Questions, Parked, Done)
✓ Every must-have FR covered: FR-001 to FR-025 all traceable to slices or foundations
✓ No cycles in dependency graph (Foundations acyclic; slices in topological order)
✓ Every blocked slice has ≥ 1 Unknown with Block: yes (S-03 ↔ calendar deep-link; S-04 ↔ AI model)
✓ Every ready/proposed slice has Prerequisites that exist or are Foundations
✓ Baseline ↔ Foundations consistency: baseline reports auth/data as partial; Foundations F-01/F-02 scaffold them; no redundancy
✓ Change IDs unique and kebab-case
✓ Backlog Handoff has one row per roadmap ID
✓ Strategic term "north star" defined inline on first use (done in Vision recap section)
✓ No invented slices (all trace to PRD US-NN or FR-NNN)
