---
project: Milestone Celebration Tracker
context_type: greenfield
checkpoint:
  current_phase: 7
  phases_completed: [1, 2, 3, 4, 5, 6]
  frs_drafted: 0
  quality_check_status: pending
---

# Shape Notes: Milestone Celebration Tracker

## Vision & Problem Statement

**The Pain:**
People who love celebrating meaningful moments face three compounding problems:

1. **Manual calculation is painful** — adding 1,000,000 seconds to May 24, 2025 requires mental gymnastics or spreadsheet work
2. **No portfolio management** — existing milestone calculators handle single dates, not a collection of important dates across different life domains
3. **Missing the moment** — without calendar integration, users forget milestones they calculated

**The Cost Today:**
Users manually calculate weird time units (10,000 days since X, 1,000,000 seconds since Y), maintain mental or spreadsheet-based tracking across scattered sources, and miss celebration opportunities because there's no systematic reminder flow. The more dates they care about, the worse the friction.

**The Insight:**
Existing apps do single calculations but don't let you **manage a portfolio of dates**. The unlock: the more dates you track (relationship milestones + personal milestones + cultural/historical events), the higher the chance of celebrating something **every day**. This isn't a calculator — it's a celebration-opportunity multiplier.

**The Vision:**
A web app where users input memorable dates (birthday, wedding, quit smoking, album release, historical event), see upcoming weird milestones (100 weeks, 1000 days, 10,000 hours), save them as bookmarks, and add one-click reminders to their calendar. The goal: turn everyday dates into surprise celebration moments by surfacing non-obvious anniversaries.

## User & Persona

**Primary Persona: The Date Nerd / Numberophile**

Someone who:

- Loves surprising others with fun facts ("Today is the 10,000th day since _this album_ dropped!")
- Tracks milestones across multiple life domains (personal, relational, cultural, historical)
- Values unique celebration moments over predictable yearly anniversaries
- Wants to maximize celebration opportunities by tracking a portfolio of important dates

**Examples:**

- Wants to celebrate 1,000 days since quitting smoking
- Tracks relationship milestones (first date, engagement, wedding) in weird units (weeks, hours, seconds)
- Celebrates cultural milestones (10,000 months since a war ended, 1,000,000 seconds since a movie premiere)
- Wants to surprise loved ones with "It's been exactly 100 weeks since we adopted our dog!"

**Access Pattern:**
Logged-in users can save important dates as bookmarks and get calendar reminders. Anonymous users can do one-off calculations but can't persist data or set reminders.

## Access Control

**Model: Hybrid (Anonymous + Login)**

- **Anonymous users** can:

  - Input a date and see calculated milestones (100 weeks, 1000 days, 10,000 hours, etc.)
  - Play with the calculator without any signup friction
  - **Cannot** save dates or add calendar reminders

- **Logged-in users** (flat model — no roles) can:
  - Everything anonymous users can do
  - Save important dates as bookmarks (persistent portfolio across sessions/devices)
  - Add one-click calendar reminders for upcoming milestones
  - Access their saved date portfolio from any device

**Authentication:**

- Login via email (passwordless magic link or OAuth recommended to reduce friction)
- No admin, premium, or multi-tier roles in MVP — all logged-in users have identical capabilities

**Smallest viable model:**
One user type (logged-in), no role hierarchy. Calendar integration is the key unlock that justifies requiring login.

## Core Flow

**Anonymous User (Calculator Mode):**

1. **Landing page**

   - Date picker (required) + Time picker (optional)
   - If date only → calculate milestones in: years, months, weeks, days
   - If date + time → calculate milestones in: years, months, weeks, days, hours, minutes, seconds

2. **Milestone calculation**

   - For each available time unit, compute: 10, 100, 1,000, 10,000, 100,000, 1,000,000
   - **Filter rules:**
     - Only show future dates (skip past milestones)
     - Only show dates within human life expectancy (~120 years max — no "million months")
   - **Display:** sorted list, nearest milestone first

3. **Results display**
   - List of calculated milestone dates (e.g., "1,000 days: March 11, 2027")
   - Each milestone has:
     - 📌 Bookmark icon (requires login)
     - 📅 Calendar icon (requires login)
   - Clicking either icon → prompt to log in

**Success moment for anonymous user:**
"I see that my 10,000-day anniversary is March 11, 2027"

**Logged-In User (Portfolio Mode):**

4. **Bookmark a date**

   - Click bookmark icon → date saved to user's favorites
   - User can bookmark multiple dates across different life domains

5. **Manage favorites**

   - View all saved dates (persistent portfolio)
   - **Edit** a saved date → triggers recompute of all milestones
   - **Remove** dates no longer needed

6. **Add to calendar**
   - Click calendar icon on any milestone → one-click export to Google Calendar / iCal
   - Reminder includes: milestone description (e.g., "10,000 hours since quit smoking")

**Success moment for logged-in user:**
"I bookmarked 5 important dates, and my calendar has reminders for the next 3 weird anniversaries coming up"

## Data Model & Edge Cases

**Saved Date Structure (for logged-in users):**

- **Label** (required, unique per user): Human-friendly name (e.g., "Wedding Anniversary", "Quit Smoking", "Abbey Road Release")
  - Uniqueness constraint: prevents duplicate labels within one user's portfolio
- **Date** (required): The memorable date
- **Time** (optional): If provided, enables hour/minute/second milestone calculations
- **Timezone**: User's current timezone as default, but user can override in the picker

**Edge Case Handling:**

1. **Past milestones**

   - If a milestone has already passed (e.g., "1,000 days" was 6 months ago), still display it but mark visually:
     - Different font color or strikethrough
     - Tag label: "Already passed" or similar indicator
   - Allows users to see the full milestone history, not just future celebrations

2. **All milestones in the past**

   - If user enters a date where ALL milestones (up to 1,000,000 units) have passed, still show the list
   - Mark all as "Already passed"
   - User can still bookmark for historical reference

3. **Timezone handling**

   - Time picker defaults to user's current timezone
   - User can change timezone in picker (e.g., "I quit smoking at 3 PM Berlin time")
   - All milestone calculations respect the chosen timezone

4. **Calendar export format**

   - Event title: `[Milestone] since [Label] ([Original Date])`
   - Example: **"10,000 hours since Wedding (June 15, 2020)"**
   - Includes both the milestone description and the original date for context

5. **Life expectancy filter**
   - Max milestone date: ~120 years from original date
   - Prevents showing milestones like "1,000,000 months" that are impossible to reach

**Data Constraints:**

- Labels must be unique within a user's portfolio (prevents confusion)
- Dates can be in the past or future
- Time is optional (changes available milestone units)

## Scope & Non-Goals

**✅ In Scope for MVP:**

1. **Social sharing**

   - Share buttons for: Facebook, Instagram, Twitter, WhatsApp, SMS
   - AI-generated image based on event context (e.g., "10,000 hours since Wedding" with visual)
   - Shareable milestone calculations (both anonymous and logged-in users)

2. **Custom milestones**

   - Default: show rounded power-of-10 milestones (10, 100, 1,000, 10,000, 100,000, 1,000,000)
   - **User customization:** allow adding custom milestone values (e.g., 25,000, 50,000, 420, 2137)
   - Purpose: create more occasions to celebrate beyond standard intervals

3. **Multi-calendar support**

   - Export to: Google Calendar, Apple Calendar, Outlook
   - One-click export with pre-filled event details

4. **One-time milestones only**
   - Each milestone is a single date/time (not recurring)
   - User can bookmark multiple dates, but each generates one-time milestones

**❌ Out of Scope for MVP (defer to later):**

1. **Email/push notifications**

   - No reminder emails or push notifications from the app
   - Rationale: calendar export + user-set calendar reminders/notifications is sufficient
   - Users control notification timing via their own calendar app

2. **Recurring milestone events**

   - No "every 100 days since X" recurring celebrations
   - Each milestone is calculated once

3. **Collaborative features**

   - No shared milestone portfolios (e.g., family/team shared dates)
   - Each user manages their own portfolio independently

4. **Premium/paid tiers**
   - All features available to all logged-in users
   - No freemium model in MVP

**Key MVP Boundary:**
The app calculates and tracks milestones, exports to calendar, and enables social sharing. It does NOT become a notification service — users leverage their existing calendar apps for reminders.

## Success Metrics & Risks

**Primary Success Metrics:**

1. **Return visits** (engagement indicator)

   - How often do users come back to check new milestones or manage their portfolio?
   - Target: users return when approaching a milestone (natural cadence)

2. **Social shares** (virality & organic growth)
   - How often do users share milestone calculations on social media?
   - Shared content includes attribution (calculation origin note) — built-in user acquisition

**Secondary signals:**

- Number of bookmarked dates per user (portfolio size)
- Calendar exports (conversion from browsing to committed use)

**Key Hypothesis:**
If users return regularly AND share milestones socially, the app is delivering value. Social shares with attribution drive organic discovery.

---

**Risks & Mitigations:**

1. **Calendar integration complexity**

   - **Risk:** Google/Apple/Outlook have different auth flows; could be complex
   - **Mitigation:** Keep it simple
     - If user is logged in to their calendar → easy one-click add
     - If not logged in → advise to download calendar app or log in to successfully add event
     - No custom auth/sync logic — leverage native calendar deep links where possible

2. **AI image generation cost/quality**

   - **Risk:** High-quality AI images could be expensive or slow
   - **Mitigation:** Use free models (e.g., DALL-E free tier, Stable Diffusion open models)
     - Images don't need to be high quality — fun/whimsical is enough for social sharing
     - Focus on speed over perfection

3. **Timezone & date calculation complexity**

   - **Risk:** Timezone edge cases (DST, leap years) could cause bugs
   - **Mitigation:** Use **Temporal API** (recently released in JS/TS)
     - Modern standard for robust date/time math
     - Handles timezones, DST, leap years natively
     - Reduces custom calculation logic

4. **User acquisition**
   - **Risk:** How do people discover the app?
   - **Mitigation:** Not a primary concern
     - Shared milestone content includes note about calculation origin (built-in attribution)
     - Each social share acts as organic marketing
     - Viral loop: user shares → friends see → friends use → friends share

**Biggest Assumption:**
Users will share milestone calculations socially if the AI-generated images are fun/shareable. This is the growth engine — if sharing doesn't happen organically, acquisition will be slow.
