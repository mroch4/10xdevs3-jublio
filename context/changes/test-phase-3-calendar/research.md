# Phase 3 Research: Calendar Export Format Validation

**Research Date:** 2026-07-05  
**Phase:** 3 — Calendar export format validation (integration tests)  
**Risk Coverage:** R3 (Calendar export generates invalid event with missing fields, wrong format, 404 deep-link)

## Research Summary

### Core Implementation
**File:** `src/utils/calendarExport.ts` (219 lines)
- 3 calendar providers: Google, Outlook, Apple (.ics)
- Pure functions for date formatting and URL generation
- Exported functions: `generateCalendarUrl`, `formatEventTitle`, `formatDateForGoogle`, `formatDateForOutlook`, `buildGoogleCalendarUrl`, `buildOutlookCalendarUrl`, `generateIcsFile`

### Key Functions to Test

1. **`formatEventTitle(event, userLabel, originalDate, locale)`**
   - Format: `"{event.label} since {userLabel} ({formattedOriginalDate})"`
   - Example: "10,000 days since Wedding (1/15/2020)"

2. **`formatDateForGoogle(date, isEnd)`**
   - PlainDate → `YYYYMMDD` (all-day)
   - PlainDateTime → `YYYYMMDDTHHmmss` (no Z suffix, local time)
   - End dates: +1 day for all-day, +1 hour for timed

3. **`formatDateForOutlook(date, isEnd)`**
   - PlainDate → `YYYY-MM-DD`
   - PlainDateTime → `YYYY-MM-DDTHH:mm:ss`
   - End dates: +1 day for all-day, +1 hour for timed

4. **`buildGoogleCalendarUrl(title, start, end)`**
   - Format: `https://calendar.google.com/calendar/render?action=TEMPLATE&text={title}&dates={start}/{end}`

5. **`buildOutlookCalendarUrl(title, start, end, isAllDay)`**
   - Format: `https://outlook.live.com/calendar/0/deeplink/compose?subject={title}&startdt={start}&enddt={end}&allday={isAllDay}`

6. **`generateIcsFile(event, title, isAllDay)`**
   - Returns: Blob URL (data URL for download)
   - ICS structure: VCALENDAR → VEVENT with required fields
   - Required fields: UID, DTSTAMP, DTSTART, DTEND, SUMMARY, DESCRIPTION

### Test Surface

**High priority (core risk coverage):**
- ✅ Event title formatting (PRD field)
- ✅ Google date formats (all-day vs timed)
- ✅ Outlook date formats (all-day vs timed)
- ✅ ICS file structure and required fields
- ✅ URL encoding (special characters in titles)
- ✅ End date calculation (+1 day/hour logic)

**Medium priority:**
- ✅ Locale formatting in titles
- ✅ PlainDate vs PlainDateTime handling
- ⚠️ ICS content validation (can test text content, not Blob URL)

**Out of scope:**
- ❌ Real calendar platform integration (E2E)
- ❌ Browser download behavior
- ❌ Deep-link URL validation (no milestone IDs in current implementation)

### Edge Cases
- Very long titles (100-char limit enforced in UI)
- Special characters (quotes, ampersands, emoji)
- Different locales (en-US, pl-PL formatting)
- Leap year dates
- Timezone handling (local time, no UTC conversion)

### Design Decisions
1. **All-day end dates are exclusive** (next day) — Google/Outlook standard
2. **Timed events are 1-hour duration** — matches Google Calendar default
3. **No timezone conversion** — local time preserved (no Z suffix)
4. **ICS uses Blob URL** — triggers download, can't easily test in unit tests (would need to parse Blob content)

---

## Recommended Test Plan

### Unit Tests (~15-20 tests)

**File:** `src/utils/__tests__/calendarExport.test.ts`

1. **Event title formatting (3 tests)**
   - Standard title with PlainDate
   - Title with PlainDateTime
   - Title with different locale

2. **Google date formatting (4 tests)**
   - All-day start date
   - All-day end date (+1 day)
   - Timed start date/time
   - Timed end date/time (+1 hour)

3. **Outlook date formatting (4 tests)**
   - All-day start/end dates
   - Timed start/end date/times

4. **URL builders (4 tests)**
   - Google URL with encoded title
   - Outlook URL with encoded title
   - Google URL with all-day dates
   - Outlook URL with timed dates

5. **ICS file generation (3-5 tests)**
   - ICS text content structure (BEGIN:VCALENDAR, BEGIN:VEVENT)
   - Required fields present
   - All-day vs timed event format
   - Note: Testing Blob URL is complex, may defer or test text generation separately

6. **Edge cases (2 tests)**
   - Special characters in title (encoded)
   - Long title handling

---

## Success Criteria
- ~15-20 unit tests for pure calendar export functions
- All date formatting functions tested (Google, Outlook, ICS)
- URL generation tested with encoding
- ICS structure validated (at minimum, test fields presence)
- Tests run in <2s (add to existing ~3s suite → target <5s total)

---

**Research Status:** Complete — Ready for `/10x-plan`