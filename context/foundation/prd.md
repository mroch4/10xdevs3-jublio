---
project: Milestone Celebration Tracker
version: 1
status: draft
created: 2026-05-25
context_type: greenfield
product_type: web-app
target_scale:
  users: medium
  qps: low
  data_volume: small
timeline_budget:
  mvp_weeks: 4
  hard_deadline: null
  after_hours_only: true
---

# PRD: Milestone Celebration Tracker

## Vision & Problem Statement

People who love celebrating meaningful moments face three compounding problems: manual calculation is painful (adding 1,000,000 seconds to a date requires mental gymnastics or spreadsheet work), no portfolio management (existing milestone calculators handle single dates, not a collection across different life domains), and missing the moment (without calendar integration, users forget milestones they calculated).

Users today manually calculate weird time units (10,000 days since X, 1,000,000 seconds since Y), maintain mental or spreadsheet-based tracking across scattered sources, and miss celebration opportunities because there's no systematic reminder flow. The more dates they care about, the worse the friction.

The insight: existing apps do single calculations but don't let you manage a portfolio of dates. The unlock is that the more dates you track (relationship milestones + personal milestones + cultural/historical events), the higher the chance of celebrating something every day. This isn't a calculator — it's a celebration-opportunity multiplier.

## User & Persona

**Primary Persona: The Date Nerd / Numberophile**

Someone who loves surprising others with fun facts ("Today is the 10,000th day since this album dropped!"), tracks milestones across multiple life domains (personal, relational, cultural, historical), values unique celebration moments over predictable yearly anniversaries, and wants to maximize celebration opportunities by tracking a portfolio of important dates.

Examples:
- Wants to celebrate 1,000 days since quitting smoking
- Tracks relationship milestones (first date, engagement, wedding) in weird units (weeks, hours, seconds)
- Celebrates cultural milestones (10,000 months since a war ended, 1,000,000 seconds since a movie premiere)
- Wants to surprise loved ones with "It's been exactly 100 weeks since we adopted our dog!"

## Success Criteria

### Primary

- **Return visits**: Users come back when approaching a milestone (natural engagement cadence indicates the portfolio is working)
- **Social shares**: Users share milestone calculations with attribution, creating viral loop (user shares → friends see → friends use → friends share)

### Secondary

- Portfolio size: Average logged-in user bookmarks 3+ important dates across different life domains
- Calendar exports: 60%+ of logged-in users export at least one milestone to their calendar

### Guardrails

- Anonymous users can calculate and view milestones without signup friction (no auth wall on core calculation)
- Calculation accuracy: milestone dates are mathematically correct for all time units (years, months, weeks, days, hours, minutes, seconds) including timezone, DST, and leap year handling
- Page load: results appear within 2 seconds of date input on median connection

## User Stories

### US-01: Anonymous user calculates milestones

- **Given** an anonymous user arrives at the landing page
- **When** they input a memorable date (e.g., wedding date June 15, 2020) with optional time
- **Then** they see a sorted list of future milestones (1,000 days, 10,000 hours, etc.) nearest first

#### Acceptance Criteria
- Date picker is required, time picker is optional
- Date-only input shows milestones in: years, months, weeks, days
- Date+time input additionally shows: hours, minutes, seconds
- Milestones computed: 10, 100, 1,000, 10,000, 100,000, 1,000,000 for each applicable unit
- Only future milestones shown (past milestones optionally displayed with visual indicator)
- Milestones beyond ~120 years (human life expectancy) are filtered out
- Results sorted: nearest milestone first

### US-02: User bookmarks important dates

- **Given** a logged-in user viewing milestone results
- **When** they click the bookmark icon on a calculated date
- **Then** the date is saved to their portfolio with a required unique label

#### Acceptance Criteria
- User must provide a human-friendly label (e.g., "Wedding Anniversary", "Quit Smoking")
- Labels must be unique within the user's portfolio
- User can bookmark multiple dates across different life domains
- Bookmarked dates persist across sessions and devices

### US-03: User exports milestone to calendar

- **Given** a logged-in user viewing milestone results
- **When** they click the calendar icon on a specific milestone
- **Then** they can export it to Google Calendar, Apple Calendar, or Outlook with pre-filled event details

#### Acceptance Criteria
- Calendar event title format: "[Milestone] since [Label] ([Original Date])" (e.g., "10,000 hours since Wedding (June 15, 2020)")
- One-click export for users already logged into their calendar provider
- For users not logged in: advise to log in to calendar provider or download calendar app
- No custom calendar sync/auth logic — leverage native calendar deep links where possible

### US-04: User manages saved date portfolio

- **Given** a logged-in user with bookmarked dates
- **When** they view their portfolio
- **Then** they can edit or remove saved dates, triggering milestone recomputation

#### Acceptance Criteria
- View all saved dates in persistent portfolio
- Edit date/time/label → triggers automatic recompute of all milestones
- Remove dates no longer needed
- Portfolio accessible from any device (cross-device sync)

### US-05: User shares milestone socially

- **Given** any user (anonymous or logged-in) viewing milestone results
- **When** they click a social share button (Facebook, Instagram, Twitter, WhatsApp, SMS)
- **Then** they share the milestone with an AI-generated image and attribution note

#### Acceptance Criteria
- Share buttons available for: Facebook, Instagram, Twitter, WhatsApp, SMS
- AI-generated image based on event context (e.g., "10,000 hours since Wedding")
- Shared content includes calculation origin attribution (built-in user acquisition)
- Images generated quickly (prefer speed over high quality — fun/whimsical is sufficient)

### US-06: User adds custom milestone values

- **Given** a logged-in user viewing milestone results
- **When** they add a custom milestone value (e.g., 25,000 days, 420 hours, 2137 seconds)
- **Then** the custom milestone appears alongside default power-of-10 milestones

#### Acceptance Criteria
- Default milestones: 10, 100, 1,000, 10,000, 100,000, 1,000,000 for each time unit
- Users can add custom values to increase celebration opportunities
- Custom milestones sorted with defaults (nearest first)
- Custom milestones respect same filters (future-only, within life expectancy)

## Functional Requirements

### Milestone Calculation

- FR-001: Anonymous user can input a date (required) and time (optional) to calculate milestones. Priority: must-have
- FR-002: System calculates milestones at 10, 100, 1K, 10K, 100K, 1M for each applicable time unit (years, months, weeks, days, and hours/minutes/seconds if time provided). Priority: must-have
- FR-003: System filters milestones to show only future dates within ~120 years (human life expectancy). Priority: must-have
- FR-004: System displays milestones sorted by proximity (nearest first). Priority: must-have
- FR-005: System marks past milestones visually (different color/strikethrough + "Already passed" tag) if shown. Priority: nice-to-have
- FR-006: User can add custom milestone values (e.g., 25,000, 50,000, 420, 2137) to create more celebration opportunities. Priority: must-have

### Authentication & Access Control

- FR-007: Anonymous user can calculate and view milestones without signup. Priority: must-have
- FR-008: User can sign up / log in via email (passwordless magic link or OAuth). Priority: must-have
- FR-009: Logged-in user has flat access (no admin/premium roles in MVP). Priority: must-have

### Portfolio Management

- FR-010: Logged-in user can bookmark a calculated date with a required unique label. Priority: must-have
- FR-011: Logged-in user can view all bookmarked dates (persistent portfolio). Priority: must-have
- FR-012: Logged-in user can edit a bookmarked date (label, date, time, timezone), triggering milestone recompute. Priority: must-have
- FR-013: Logged-in user can remove bookmarked dates. Priority: must-have
- FR-014: Bookmarked dates sync across devices for the same user. Priority: must-have

### Calendar Integration

- FR-015: Logged-in user can export a specific milestone to Google Calendar, Apple Calendar, or Outlook. Priority: must-have
- FR-016: Calendar event title follows format: "[Milestone] since [Label] ([Original Date])". Priority: must-have
- FR-017: System uses native calendar deep links (no custom calendar auth/sync). Priority: must-have
- FR-018: System advises users not logged into calendar provider to log in or download app. Priority: must-have

### Social Sharing

- FR-019: Any user can share milestone results on Facebook, Instagram, Twitter, WhatsApp, SMS. Priority: must-have
- FR-020: System generates AI image based on milestone context for social shares. Priority: must-have
- FR-021: Shared content includes attribution note (calculation origin) for user acquisition. Priority: must-have

### Timezone & Date Handling

- FR-022: Time picker defaults to user's current timezone. Priority: must-have
- FR-023: User can override timezone in picker (e.g., "3 PM Berlin time"). Priority: must-have
- FR-024: System respects chosen timezone for all milestone calculations. Priority: must-have
- FR-025: System handles DST, leap years, and timezone edge cases correctly. Priority: must-have

## Non-Functional Requirements

- **Performance**: Milestone calculation results appear within 2 seconds of date input on median connection.
- **Accuracy**: All milestone dates are mathematically correct across all time units (years, months, weeks, days, hours, minutes, seconds), respecting timezone, DST, and leap years.
- **Cross-device**: Logged-in user's bookmarked dates sync across all devices within 5 seconds of change.
- **Signup friction**: Anonymous user can calculate and view milestones without any authentication prompt.
- **Calendar compatibility**: Export works for Google Calendar, Apple Calendar, and Outlook without custom auth flows (leverage native deep links).
- **AI image generation**: Social share images generate within 3 seconds; quality is fun/whimsical (speed over perfection).
- **Browser support**: Product remains usable on the latest two major versions of Chrome, Firefox, Safari, Edge.

## Business Logic

The core domain rule: **for any memorable date, compute milestone anniversaries at exponentially increasing intervals across multiple time units, then surface the nearest upcoming celebration opportunities in a unified timeline**.

The calculation consumes a user-provided date (and optional time + timezone), applies exponential milestone intervals (10, 100, 1K, 10K, 100K, 1M) across applicable time units (years, months, weeks, days, and optionally hours/minutes/seconds), filters for future dates within human life expectancy (~120 years), and presents them sorted by proximity. The user encounters this when they input a memorable date and immediately see a sorted list of weird anniversaries they've never thought to calculate before — the "10,000-day mark" or "1,000,000-second anniversary" that creates novel celebration moments.

The differentiation from single-use calculators is portfolio management: users can bookmark multiple important dates across different life domains (personal, relational, cultural, historical), increasing the likelihood of having a celebration-worthy milestone every day. Each bookmarked date maintains its own milestone timeline, and the calendar integration ensures users don't miss the moment when a weird anniversary arrives.

## Access Control

**Model: Hybrid (Anonymous + Login)**

Anonymous users can:
- Input a date and calculate milestones
- View calculated milestone results
- Share milestones socially
- **Cannot** save dates or export to calendar

Logged-in users (flat model — no roles):
- Everything anonymous users can do
- Bookmark dates with unique labels
- View and manage persistent portfolio
- Export milestones to calendar (Google Calendar, Apple Calendar, Outlook)
- Access saved portfolio from any device (cross-device sync)

Authentication:
- Login via email (passwordless magic link or OAuth recommended for low friction)
- No admin, premium, or multi-tier roles in MVP
- All logged-in users have identical capabilities

## Non-Goals

**Functional non-goals (MVP will NOT do):**

1. **Email/push notifications** — The app will not send reminder emails or push notifications. Rationale: calendar export + user-set calendar notifications is sufficient. Users control notification timing via their own calendar app.

2. **Recurring milestone events** — The app will not support "every 100 days since X" recurring celebrations. Rationale: each milestone is a single date/time calculation. Users can bookmark multiple dates, but each generates one-time milestones only.

3. **Collaborative features** — No shared milestone portfolios (e.g., family/team shared dates). Rationale: each user manages their own portfolio independently. Sharing happens via social media, not within the app.

4. **Premium/paid tiers** — All features available to all logged-in users. Rationale: no freemium model in MVP. Monetization is deferred.

5. **Manual milestone entry** — Users cannot manually add arbitrary milestone dates. Rationale: the value is in automatic calculation of exponential intervals. Manual entry defeats the "discovery" aspect.

6. **Historical milestone analytics** — No aggregate statistics like "total milestones celebrated" or "most popular milestone types". Rationale: focus on upcoming celebrations, not past data analysis.

**Non-functional non-goals (MVP will NOT aim for):**

1. **Offline-first guarantee** — The app requires an internet connection. Rationale: calendar export and social sharing are core features that need connectivity.

2. **Multi-region SLA** — No geographic redundancy or multi-region deployment. Rationale: single-region deployment is sufficient for MVP scale.

3. **Compliance certification** — No HIPAA, SOC2, or other compliance certifications beyond baseline GDPR (if applicable). Rationale: the app handles dates and labels, not sensitive personal data requiring certification.

4. **Real-time collaboration** — No live updates when another user shares a milestone. Rationale: sharing is one-way (to social media), not collaborative editing.

## Open Questions

1. **What AI model should be used for social share image generation?** — TBD by team. Constraint: must use free models (e.g., DALL-E free tier, Stable Diffusion open models) for cost efficiency. Non-blocking: can launch with placeholder images and add AI generation in a follow-up iteration.

2. **What is the exact format for calendar deep links (Google Calendar, Apple Calendar, Outlook)?** — TBD by implementation. Block: no (standard iCal/CalDAV formats exist). Research needed during stack selection.

3. **Should past milestones be shown by default, or hidden behind a toggle?** — TBD by user. Recommendation: show past milestones with visual indicator (different color + "Already passed" tag) to give users full milestone history. Non-blocking: can iterate based on user feedback.

4. **What is the uniqueness scope for labels?** — Currently: unique per user. Question: should labels also prevent near-duplicates (e.g., "Wedding" vs "wedding" vs "Wedding Anniversary")? TBD by team during implementation. Non-blocking: strict uniqueness (case-insensitive) is a safe default.

5. **How should custom milestone values be stored?** — TBD by implementation. Per-date custom values, or global user preferences? Recommendation: per-date to allow different custom milestones for different event types. Non-blocking: can start with global preferences and migrate later.

6. **What happens if a user bookmarks the same date twice with different labels?** — TBD by team. Recommendation: allow it (multiple labels for same date might be intentional, e.g., "Wedding" and "Engagement" on same day for different milestone tracking). Non-blocking: enforce label uniqueness only, not date uniqueness.

7. **Should timezone be stored per bookmarked date, or globally per user?** — TBD by implementation. Recommendation: per-date (user might track events in different timezones). Non-blocking: can default to user's current timezone and add per-date override later.

8. **What is the attribution note format for social shares?** — TBD by team. Should include: app name, link to app, brief description. Example: "Calculated with [App Name] — track your weird anniversaries at [URL]". Non-blocking: can iterate based on share performance.
