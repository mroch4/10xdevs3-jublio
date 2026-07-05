---
project: Milestone Celebration Tracker
version: 1
status: active
created: 2026-01-15
updated: 2026-01-15
prd_version: 1
roadmap_version: 2
---

# Test Plan: Milestone Celebration Tracker

> **Purpose:** This is the **quality contract** for Jubilee. It defines what failure scenarios we test, in what order, using which layers, and what signals "done" for each rollout phase. It is a living document — §1–§5 freeze after first write; §6 (cookbook) fills in as phases ship.

## §1 Risk Map

Risks are **failure scenarios in user/business terms**, not test names. Each risk maps to evidence from PRD, roadmap, archive, or hot-spot scan. Listed by impact × likelihood.

### R1: Milestone calculation produces wrong dates (timezone/DST/leap-year edge cases)
- **Impact:** High — Core value prop breaks; users miss celebrations or plan wrong dates
- **Likelihood:** Medium — Temporal API mitigates but edge cases (DST transitions, leap years, far-future dates) are complex
- **Source:** PRD FR-025 (DST, leap years, timezone edge cases); NFR (accuracy: "mathematically correct across all time units"); Hot-spot: `src/utils/classes/Milestone.ts` (18 commits), `src/utils/classes/DateTimeCard.ts` (7 commits)
- **Evidence:** PRD Success Criteria "Calculation accuracy" guardrail; Roadmap S-01 archived with "handles DST, leap years, timezone edge cases"; No regression test suite exists

### R2: User loses bookmarks after edit or cross-device sync fails
- **Impact:** High — Destroys portfolio value; breaks core differentiation vs. single-use calculators
- **Likelihood:** Medium — Firestore real-time sync working but edit flow complex (label uniqueness, timezone override, recompute); Hot-spot churn in edit/delete logic
- **Source:** PRD FR-012 (edit triggers recompute), FR-014 (cross-device sync); Roadmap S-02 archived 2026-07-05; Hot-spot: `src/components/BookmarksView.tsx` (5 commits), `src/firebase/firestoreService.ts` (4 commits)
- **Evidence:** Roadmap S-02 implementation notes mention "dirty-state detection" and "real-time sync <5 seconds"; No automated test for edit race conditions or sync conflicts

### R3: Calendar export generates invalid event (missing fields, wrong format, 404 deep-link)
- **Impact:** High — Breaks user's celebration reminder flow; high support burden
- **Likelihood:** Medium — Different calendar providers (Google URL vs. Outlook URL vs. Apple .ics); date serialization varies by provider
- **Source:** PRD FR-015 to FR-018 (calendar export); Roadmap S-03 archived with "manual testing completed" but no automated regression suite; Hot-spot: `src/components/CalendarExportModal.tsx` (10 commits), `src/utils/calendarExport.ts` (4 commits)
- **Evidence:** Roadmap S-03 "Testing: Manual testing completed" (no automation); Archive `context/archive/2026-07-03-export-to-calendar/TESTING.md` documents 50+ manual test cases on mobile — high-value flow, no coverage

### R4: Anonymous user blocked from calculation or forced into auth wall
- **Impact:** High — Violates PRD Success Criteria "Anonymous users can calculate without signup friction"; kills viral growth loop
- **Likelihood:** Low — Auth already implemented with correct gating (logged-out can calculate, logged-in can bookmark)
- **Source:** PRD FR-007 (anonymous can calculate without signup); Success Criteria guardrail; Roadmap F-01 (Firebase Auth scaffold) archived
- **Evidence:** PRD explicitly calls out "no auth wall on core calculation"; Roadmap baseline confirms "F-01 done" but no automated check prevents future regression

### R5: Social share generates truncated/broken text or copy-to-clipboard fails
- **Impact:** Medium — Reduces viral acquisition; user shares broken content with attribution link
- **Likelihood:** Medium — Text generation has context-switching logic (today/future/past); clipboard API has cross-browser quirks; character limits (280) enforced client-side only
- **Source:** PRD FR-019 to FR-021 (social share with attribution); Roadmap S-04 archived with "manual testing completed — all 7 providers verified"; Hot-spot: `src/components/modals/ShareModal.tsx` (6 commits), `src/utils/socialShare.ts` (5 commits)
- **Evidence:** Roadmap S-04 implementation notes: "context-aware text and clipboard workarounds discovered during testing"; No automated test for clipboard behavior or character-limit edge cases

### R6: Custom milestone values fail validation or produce out-of-bounds dates
- **Impact:** Medium — User frustration; weird celebration opportunities (core UX promise) break
- **Likelihood:** Low — Validation logic exists (positive integers only, life-expectancy filter) but no test coverage for boundary cases (e.g., 999,999,999 seconds)
- **Source:** PRD FR-006 (custom milestone values); US-06 (custom values respect filters); Roadmap S-05 archived 2026-07-05; Hot-spot: `src/components/modals/CustomMilestoneModal.tsx` (4 commits)
- **Evidence:** Roadmap S-05 implementation notes mention "validation rules" but no regression test; PRD specifies "within life expectancy" filter must apply to custom values

### R7: Auth flow breaks (magic-link expired, OAuth redirect fails, session corrupts)
- **Impact:** Medium — User cannot bookmark or manage portfolio; support burden increases
- **Likelihood:** Low — Firebase Auth is managed service with high reliability; magic-link + Google OAuth both working
- **Source:** PRD FR-008 (sign up/log in via email or OAuth); Roadmap F-01 archived with "magic-link auth configured"; Hot-spot: `src/contexts/AuthContext.tsx` (3 commits), `src/firebase/authService.ts` (2 commits)
- **Evidence:** Roadmap baseline confirms "F-01 done" but no automated check for magic-link expiry or OAuth redirect edge cases; `src/firebase/authErrors.ts` suggests error-handling logic exists but untested

## §2 Phased Rollout

Phases are ordered by **risk coverage** (R1–R7) and **test layer efficiency** (unit → integration → e2e). Each phase has a change ID for tracking in `context/changes/`.

| Phase | Focus | Risks Covered | Effort | Signal | Change ID | Status |
|-------|-------|---------------|--------|--------|-----------|--------|
| Phase 1 | Milestone calculation accuracy (unit) | R1 | Low | High | `test-phase-1-calculation` | complete |
| Phase 2 | Bookmark edit & sync (integration) | R2 | Medium | High | `test-phase-2-bookmarks` | not started |
| Phase 3 | Calendar export format validation (integration) | R3 | Medium | High | `test-phase-3-calendar` | not started |
| Phase 4 | Anonymous access & auth gating (e2e smoke) | R4, R7 | Low | Medium | `test-phase-4-auth-flow` | not started |
| Phase 5 | Social share text & clipboard (integration) | R5 | Low | Medium | `test-phase-5-social-share` | not started |
| Phase 6 | Custom milestone validation (unit) | R6 | Low | Medium | `test-phase-6-custom-values` | not started |

**Rollout sequencing rationale:**
- **Phase 1 first:** R1 (calculation accuracy) is highest-impact and cheapest to test (pure date math, no UI/network/auth). Unblocks all downstream phases.
- **Phase 2–3 parallel candidates:** R2 (bookmarks) and R3 (calendar export) are both high-impact integration tests but independent. Order: R2 first (core differentiation) then R3 (external integration).
- **Phase 4 early:** R4 (anonymous access) + R7 (auth flow) are medium-impact but cheap e2e smoke tests; ship together to validate access control gates before adding more coverage.
- **Phase 5–6 deferred:** R5 (social share) and R6 (custom values) are medium-to-low impact and test new features (S-04, S-05 recently shipped); prioritize after core flows covered.

## §3 Test Stack

Two layers: **classic** (deterministic, fast feedback) and **AI-native** (when classic misses emergent behavior). AI-native is NOT mandatory — include only where justified by cost × signal.

### Classic Layer

| Category | Tools | When to Use | When NOT to Use | Checked |
|----------|-------|-------------|-----------------|---------|
| Unit tests | Vitest (example — not yet configured) | Pure functions (date math, validation, formatting); no DOM/network/auth | UI logic, integration flows, user journeys | 2026-01-15 |
| Integration tests | Vitest + Testing Library (example — not yet configured) | Component behavior with mock Firestore/Auth; multi-step flows within app boundary | External calendar APIs, OAuth redirects, cross-device sync timing | 2026-01-15 |
| E2E tests | Playwright (example — not yet configured) | Critical user journeys (anonymous calculate → login → bookmark → export); access control gates; cross-browser smoke | Fine-grained unit logic, exhaustive permutations (too slow) | 2026-01-15 |
| Linting | ESLint (already configured: `eslint.config.js`) | Code style, common anti-patterns, unused imports | Test strategy, business logic correctness | 2026-01-15 |
| Type checking | TypeScript (`tsconfig.json`) | Compile-time type safety (already strict mode) | Runtime validation, date math edge cases | 2026-01-15 |

**Cost:** Unit/integration < $0.01 per run; E2E ~$0.05–0.10 per full suite (local, no cloud grid).  
**Latency:** Unit/integration <10s; E2E 2–5 min for critical flows.

### AI-Native Layer

| Category | Tools | When to Use | When NOT to Use | Checked |
|----------|-------|-------------|-----------------|---------|
| Multimodal UI review | Claude 3.7 Sonnet (vision API — example, not yet configured) | Calendar export modal, social share modal, bookmark edit flow — detect layout breaks, missing ARIA labels, visual regressions classic tests miss | Static content pages, headless business logic, exhaustive UI permutations (cost prohibitive) | 2026-01-15 |
| Prompt-driven scenario testing | Claude Code with MCP tools (example — not yet configured) | "User bookmarks date with same label as existing → system rejects" — validate UX copy, toast messages, error flows that unit tests don't catch | Happy-path flows already covered by E2E; low-impact edge cases | 2026-01-15 |

**Cost:** Vision API ~$0.01–0.05 per screenshot review; prompt-driven scenario ~$0.10–0.50 per multi-step flow.  
**Latency:** Vision review <5s per screenshot; scenario testing 30s–2 min per flow.  
**When NOT to use AI-native:** (1) Classic layer already gives signal at lower cost (e.g., unit test for date math); (2) Exhaustive coverage (AI cost scales linearly, classic scales sub-linearly); (3) Deterministic assertions needed (AI returns qualitative feedback, not pass/fail).

**Why AI-native for this project:**  
- **Modals & accessibility:** Calendar export, social share, bookmark edit modals have complex keyboard navigation (ESC, focus trap, ARIA labels). Vision API can spot missing focus indicators or broken tab order that ARIA linters miss.
- **Context-aware text generation:** Social share has 3 tense variants (today/future/past) + attribution + character limits. Prompt-driven testing validates UX copy quality (e.g., "Is the past-tense share text grammatically correct?") faster than writing 20 string-match assertions.
- **Visual regressions in calendar provider UX:** Export modal shows live preview matching calendar event title format. Vision API detects if preview diverges from actual export (classic snapshot tests only catch exact pixel diffs, not semantic mismatches).

**When AI-native NOT justified:**  
- Date math (R1): Pure functions → unit tests 100x faster and cheaper than AI.
- Firestore sync (R2): Integration tests with mock Firestore give deterministic pass/fail → AI adds no signal.
- Anonymous access gates (R4): E2E smoke test is <5 lines of code → AI overkill.

## §4 Quality Gates

Gates are **required** checks before merge/deploy. Optional gates are recommendations.

| Gate | Enforcement | Trigger | Failure = Block? | Notes |
|------|-------------|---------|------------------|-------|
| Lint (ESLint) | CI (GitHub Actions) | Every PR | Yes | Already configured: `.github/workflows/deploy.yml` runs `npm run lint` |
| Type check (TypeScript) | CI (GitHub Actions) | Every PR | Yes | Already configured: `npm run build` includes `tsc -b` |
| Unit tests | CI (GitHub Actions) | Every PR | Yes (after Phase 1) | Required after `test-phase-1-calculation` ships; blocks merge if any test fails |
| Integration tests | CI (GitHub Actions) | Every PR | Yes (after Phase 2) | Required after `test-phase-2-bookmarks` ships |
| E2E critical flows | CI (GitHub Actions) | Pre-deploy to `main` | Yes (after Phase 4) | Required after `test-phase-4-auth-flow` ships; runs on merge to `main` before GitHub Pages deploy |
| Pre-commit hook (lint + typecheck) | Local (Husky — not yet configured) | Pre-commit | No (recommended) | Fast feedback (<10s); catches trivial errors before CI; configure in Phase 1 sub-step |
| Multimodal UI review | Manual + CI (selective) | High-risk UI changes (modals, forms) | No (recommended) | Selective: run on 1–3 critical screens (calendar export modal, share modal, bookmark edit modal); document in Phase 3 sub-step |

**Required gates timeline:**
- **Now:** Lint + type check (already enforced)
- **After Phase 1:** Unit tests block merge
- **After Phase 2:** Integration tests block merge
- **After Phase 4:** E2E tests block merge to `main`

**Why no AI gate enforcement?**  
AI-native tests are **signal-enhancing, not deterministic**. They catch emergent UX issues (broken accessibility, unclear copy) but return qualitative feedback, not pass/fail. Use them in PR reviews ("run vision check on this modal screenshot") but don't auto-block CI — human judgment required.

## §5 Negative Space (What We Deliberately DON'T Test)

Documenting what we skip prevents scope creep and anchors "done" for each phase.

### Performance benchmarks
- **Why skip:** PRD NFR specifies "results within 2 seconds on median connection" but no latency budget breakdown. Milestone calculation is client-side (no backend); Firestore sync latency controlled by Firebase (managed service). No performance regression risk identified in hot-spot scan.
- **Re-evaluate if:** User reports mention "slow calculation" or "delayed bookmark sync"; roadmap adds server-side computation or large dataset features.

### Cross-browser compatibility (exhaustive matrix)
- **Why skip:** PRD NFR specifies "latest two major versions of Chrome, Firefox, Safari, Edge" but hot-spot scan shows no browser-specific workarounds in code. Playwright e2e tests (Phase 4) run on Chromium only; manual spot-check on Safari/Firefox for critical flows (calendar export, OAuth redirect) during Phase 3/4 implementation.
- **Re-evaluate if:** User reports mention "doesn't work on Safari" or calendar export .ics download fails on specific browser.

### Mobile-specific testing (native app behaviors)
- **Why skip:** Archive `context/archive/2026-07-03-export-to-calendar/TESTING.md` documents extensive iOS Safari + Android Chrome manual testing for S-03 (calendar export). Current codebase is responsive web app (no native mobile build). E2E tests (Phase 4) run on desktop Chromium; manual mobile spot-check during Phase 3 (calendar export) sufficient.
- **Re-evaluate if:** Roadmap adds Progressive Web App (PWA) features or native mobile wrapper; user reports mention "broken on mobile".

### AI image generation (S-04 future enhancement)
- **Why skip:** Roadmap S-04 archived with "text-only MVP — AI image generation moved to future enhancement." No AI model integrated; no test surface exists. Social share text generation (context-aware tense, character limits) tested in Phase 5; AI image feature requires separate test plan when roadmap re-scopes it.
- **Re-evaluate if:** Roadmap v3 adds AI image generation; spike identifies model choice (DALL-E, Stable Diffusion, etc.) and latency budget.

### Firestore security rules (exhaustive permutations)
- **Why skip:** Roadmap F-02 archived with "collections configured; case-insensitive unique labels per-user; per-date timezone storage; real-time sync enabled." No multi-tenancy or admin roles (PRD FR-009: flat user access). Integration tests (Phase 2) cover bookmark CRUD with mocked Firestore; security rules tested implicitly via Firebase emulator during Phase 2 implementation.
- **Re-evaluate if:** Roadmap adds admin dashboard, user-to-user sharing, or public portfolio features (new access control surface).

### Third-party API mocking (calendar provider endpoints)
- **Why skip:** Calendar export (R3) uses URL deep links (Google/Outlook) and .ics file generation (Apple); no API calls to calendar provider servers. Integration tests (Phase 3) validate URL format and .ics file structure; actual calendar app behavior (e.g., Google Calendar renders event correctly) out of scope (manual spot-check during Phase 3 sufficient).
- **Re-evaluate if:** Roadmap adds calendar sync (bi-directional) or fetches user's existing calendar events (new API surface).

### Load testing / stress testing
- **Why skip:** PRD target scale: "users: medium, qps: low, data_volume: small." Firestore scales automatically (managed service); client-side calculation has no backend bottleneck. No identified risk in hot-spot scan or roadmap that load testing would mitigate.
- **Re-evaluate if:** Success metrics show >10K daily active users; Firestore read/write costs spike; roadmap adds server-side batch processing.

## §6 Testing Cookbook (Fills In Over Time)

This section is **living documentation** — it starts as placeholders and fills in incrementally as rollout phases ship. After Module 3 completes, §6 becomes the canonical answer to "how do I add a test for X in this project?"

### Unit tests (date math, validation, formatting)
**Location:** Colocated with code in `src/utils/__tests__/` and `src/utils/classes/__tests__/`  
**Naming convention:** `*.test.ts` (Vitest default pattern)  
**Reference test:** [`src/utils/__tests__/temporal-edge-cases.test.ts`](../../src/utils/__tests__/temporal-edge-cases.test.ts) — Leap year + month overflow edge cases  
**Run command:** `npm test` (CI mode, runs once) or `npm run test:watch` (dev mode, watch for changes)  
**Coverage target:** 100% for pure date math functions in `src/utils/classes/` (CardBase, DateCard, DateTimeCard, Milestone) and `src/utils/validation.ts`  

**When to add:**
- New date calculation logic (e.g., new time unit, custom milestone filter)
- New validation rule (e.g., label uniqueness, date range constraint)
- New formatting function (e.g., calendar event title, social share text)

**Example scenarios (implemented in Phase 1):**
- ✅ Leap year: `2020-02-29` + 1,000 days → `2022-11-25` ([reference test](../../src/utils/__tests__/temporal-edge-cases.test.ts))
- ✅ 75-year cutoff: Milestone 273.9 years away → category `BeyondHumanLifeExpectancy` ([Milestone.test.ts](../../src/utils/classes/__tests__/Milestone.test.ts))
- ✅ Future date validation: `2030-01-01` → error "Please enter a past or present date" ([validation.test.ts](../../src/utils/__tests__/validation.test.ts))
- ✅ Custom milestones: 420 days → `2021-02-24` with `isCustom = true` ([CardBase.test.ts](../../src/utils/classes/__tests__/CardBase.test.ts))
- ✅ Design decisions: Years NOT calculated, months ARE calculated ([design-decisions.test.ts](../../src/utils/__tests__/design-decisions.test.ts))

**Test structure (arrange-act-assert):**
```typescript
import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import DateCard from "../classes/DateCard";

describe("DateCard", () => {
  it("calculates 1,000 days from start date correctly", () => {
    // Arrange: Set up test data
    const startDate = Temporal.PlainDate.from("2020-01-01");
    const card = new DateCard(startDate, "en-US");

    // Act: Access the pre-generated events (created in constructor)
    const events = card.events;

    // Assert: Verify expected behavior
    const milestone1000 = events.find(e => e.label.includes("1,000") && e.label.includes("days"));
    expect(milestone1000).toBeDefined();
    expect(milestone1000!.date.toString()).toBe("2022-09-27");
  });
});
```

**Key patterns:**
- **Inject `now` parameter** to avoid flaky time-based tests (use optional parameter in `Milestone` constructor)
- **Use `Temporal.PlainDate.compare()`** for date equality (returns 0 if equal)
- **Use `.toString()`** for human-readable assertions (e.g., `"2022-11-25"`)
- **Access `card.events` property** (not `card.getEvents()`) — events are pre-generated in constructor with custom milestones
- **Test edge cases, not happy-path** — basic calculations already work (verified in S-01)


### Integration tests (components with mocked Firestore/Auth)
**Location:** TBD — see §2 Phase 2  
**Naming convention:** TBD — see §2 Phase 2  
**Reference test:** TBD — see §2 Phase 2  
**Run command:** TBD — see §2 Phase 2  
**Coverage target:** TBD — see §2 Phase 2  

**When to add:**
- New bookmark CRUD flow (create, read, update, delete)
- New modal with complex state (label input, live preview, provider selection)
- New Firestore query or mutation (e.g., fetch bookmarks, update custom milestones)
- New auth-gated feature (e.g., logged-in user can X, anonymous user cannot)

**Example scenarios (will update with actual test names):**
- Bookmark create: "User clicks bookmark icon → enters unique label → saves → bookmark appears in portfolio"
- Bookmark edit: "User clicks edit on existing bookmark → changes date → saves → milestones recompute"
- Bookmark delete: "User clicks delete → confirms → bookmark removed from portfolio"
- Label uniqueness: "User bookmarks 'Trip' then tries 'trip' → error toast 'Label already exists'"
- Calendar export URL: "User enters label 'Wedding' for 10,000-day milestone → Google Calendar URL includes 'Wedding' and '10000+days+since+Wedding'"
- Social share text: "User shares future milestone → text starts with 'On [date], it will be exactly...'"

### E2E tests (critical user journeys)
**Location:** TBD — see §2 Phase 4  
**Naming convention:** TBD — see §2 Phase 4  
**Reference test:** TBD — see §2 Phase 4  
**Run command:** TBD — see §2 Phase 4  
**Coverage target:** TBD — see §2 Phase 4  

**When to add:**
- New critical user journey (e.g., anonymous → login → bookmark → export → share)
- New access control gate (e.g., anonymous user blocked from feature X)
- New external integration (e.g., OAuth redirect, calendar provider deep-link)
- Regression fix for high-impact bug (e.g., user lost bookmarks after edit)

**Example scenarios (will update with actual test names):**
- Anonymous user journey: "User visits landing page → enters date → sees milestones sorted nearest-first → no auth prompt"
- Login and bookmark: "User clicks bookmark icon → prompted to log in → completes magic-link flow → bookmarks date with label"
- Cross-device sync: "User logs in on Device A → bookmarks date → logs in on Device B → bookmark appears (within 5 seconds)"
- Calendar export flow: "User clicks calendar icon on milestone → enters label → clicks Google button → new tab opens with pre-filled event"
- Auth gate enforcement: "Anonymous user cannot access 'Bookmarks' tab (button disabled or redirects to login)"

### Multimodal UI review (vision API for modals/forms)
**Location:** TBD — see §2 Phase 3  
**Tool:** TBD — see §2 Phase 3  
**Run command:** TBD — see §2 Phase 3  
**Review checklist:** TBD — see §2 Phase 3  

**When to use:**
- New modal with complex keyboard navigation (e.g., ESC close, focus trap, ARIA labels)
- High-risk UI change (e.g., calendar export modal redesign, social share modal new provider)
- Visual regression concern (e.g., live preview diverges from actual export format)
- Accessibility audit (e.g., missing focus indicators, broken tab order)

**Selective coverage (1–3 critical screens):**
1. Calendar export modal (`CalendarExportModal.tsx`)
2. Social share modal (`ShareModal.tsx`)
3. Bookmark edit modal (`BookmarkEditModal.tsx`)

**Example review prompts (will update with actual vision API calls):**
- "Does this modal have visible focus indicators for keyboard navigation?"
- "Is the live preview text identical to the actual calendar event title format?"
- "Are all interactive elements (buttons, inputs) accessible via Tab key?"
- "Is there a clear 'close' affordance (X button, ESC hint, backdrop click)?"

### Pre-commit hook (lint + typecheck)
**Location:** TBD — see §2 Phase 1 sub-step  
**Tool:** TBD (Husky example — not yet configured)  
**Setup command:** TBD — see §2 Phase 1 sub-step  
**Run time:** <10s (fast feedback)  

**What it catches:**
- ESLint violations (unused imports, common anti-patterns)
- TypeScript errors (type mismatches, missing properties)
- Formatting issues (if Prettier configured — not yet in this project)

**What it does NOT catch:**
- Test failures (too slow for pre-commit; run in CI instead)
- Runtime logic errors (requires test execution)
- Integration/E2E issues (mock Firestore/Auth not available in hook)

---

**Next steps:** Invoke `/10x-test-plan` again (no arguments) to advance to the first rollout phase handoff (`/10x-new test-phase-1-calculation`).