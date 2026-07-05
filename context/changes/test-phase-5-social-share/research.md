# Phase 5 Research: Social Share Text & Clipboard

**Research Date:** 2026-07-05  
**Phase:** 5 — Social share text & clipboard (integration tests)  
**Risk Coverage:** R5 (Social share generates truncated/broken text or copy-to-clipboard fails)

## Research Questions

### Q1: Where is social share text generation logic?

**Primary file:** `src/utils/socialShare.ts` — Pure function `generateShareUrl(milestone, label, provider, originalDate, locale)`

**Secondary file:** `src/components/modals/ShareModal.tsx` — Duplicate text generation logic for live preview (lines 53-92)

**Key logic:**
1. **Context-aware text generation** (lines 28-51 in `socialShare.ts`):
   - `EventCategory.Today` → `"Today's exactly"`
   - `EventCategory.ThisWeek` through `BeyondHumanLifeExpectancy` → `"On {date}, it will be exactly"`
   - `EventCategory.AlreadyPassed` → `"On {date}, it was exactly"`
   - Default → `"Today's exactly"`

2. **Text template** (line 53):
   ```typescript
   `${contextPhrase} ${milestone.label} since ${label.trim()} (${formattedOriginalDate}) - Calculated with Jublio at ${ATTRIBUTION_URL}`
   ```

3. **Provider-specific behavior** (lines 60-92):
   - **Full text support:** WhatsApp, Twitter, SMS, Copy
   - **URL-only:** Facebook, Messenger, LinkedIn (clipboard workaround used)

**Duplication note:** ShareModal lines 53-92 duplicate the context phrase logic from `socialShare.ts`. This is intentional for live preview, but creates maintenance burden.

---

### Q2: How is clipboard integration implemented?

**Location:** `src/components/MilestoneResults.tsx` lines 102-146 (`handleShare` function)

**Copy provider (lines 107-116):**
```typescript
if (provider === SocialProvider.Copy) {
  const shareText = generateShareUrl(selectedShareEvent, label, provider, originalDate, locale);
  navigator.clipboard.writeText(shareText).then(() => {
	setToastMessage("Copied to clipboard! Paste it anywhere to share.");
  }).catch((err) => {
	console.error("Failed to copy to clipboard:", err);
	setToastMessage("Failed to copy to clipboard. Please try again.");
  });
  return;
}
```

**URL-only providers clipboard workaround (lines 118-128):**
```typescript
const clipboardProviders = [SocialProvider.Facebook, SocialProvider.Messenger, SocialProvider.LinkedIn];
const needsClipboard = clipboardProviders.includes(provider);

if (needsClipboard) {
  const shareText = generateShareUrl(selectedShareEvent, label, SocialProvider.Copy, originalDate, locale);
  navigator.clipboard.writeText(shareText).catch((err) => {
	console.error("Failed to copy to clipboard:", err);
  });
}
```

**Error handling:**
- Copy provider: Shows error toast "Failed to copy to clipboard. Please try again."
- URL-only providers: Silent catch (error logged to console, but share window still opens)

**Browser API dependency:** `navigator.clipboard.writeText()` — requires HTTPS or localhost, may be blocked by permissions

---

### Q3: What character limit enforcement exists?

**Constant:** `MAX_SHARE_TEXT_LENGTH = 280` (from `src/utils/constants.ts` line 16)

**Enforcement locations:**

1. **ShareModal input field** (line 132):
   ```typescript
   <input
	 maxLength={maxLabelLength}
   ```
   - Calculates `maxLabelLength` dynamically (lines 95-98):
	 ```typescript
	 const fixedParts = [contextPhrase, " ", event.label, " since ", " (", formattedOriginalDate, ") - Calculated with Jublio at ", ATTRIBUTION_URL];
	 const fixedPartLength = fixedParts.reduce((sum, part) => sum + part.length, 0);
	 const maxLabelLength = Math.max(1, MAX_SHARE_TEXT_LENGTH - fixedPartLength);
	 ```

2. **Live character counter** (lines 145-149):
   ```typescript
   <small id="label-help" className="text-muted">
	 {currentTextLength}/{MAX_SHARE_TEXT_LENGTH} characters
   </small>
   ```

3. **Validation** (line 101):
   ```typescript
   const isLabelValid = label.trim().length > 0 && currentTextLength <= MAX_SHARE_TEXT_LENGTH;
   ```

**Truncation behavior:** Input field prevents typing beyond `maxLabelLength`, so total text *should* never exceed 280 chars. However, if milestone label or original date is very long, the calculated `maxLabelLength` could be < 1 (line 98 uses `Math.max(1, ...)` to prevent this).

**Edge case:** If fixed parts (context phrase + milestone label + date + attribution) exceed 279 chars, `maxLabelLength = 1`, so user can only enter 1 character for their label. This could produce text > 280 chars if milestone label itself is very long.

---

### Q4: What are the provider-specific differences?

**Provider matrix:**

| Provider | Text Support | URL Format | Clipboard Used | Window Opens |
|----------|--------------|------------|----------------|--------------|
| WhatsApp | Full | `https://wa.me/?text={encodedText}` | No | Yes |
| Twitter | Full | `https://twitter.com/intent/tweet?text={encodedText}` | No | Yes |
| SMS | Full | `sms:?&body={encodedText}` | No | Yes (mobile) |
| Facebook | URL-only | `https://www.facebook.com/sharer/sharer.php?u={encodedUrl}` | Yes (workaround) | Yes |
| Messenger | URL-only | `https://www.facebook.com/dialog/send?link={encodedUrl}&app_id=&redirect_uri={encodedUrl}` | Yes (workaround) | Yes |
| LinkedIn | URL-only | `https://www.linkedin.com/sharing/share-offsite/?url={encodedUrl}` | Yes (workaround) | Yes |
| Copy | N/A | Returns text directly (no URL) | Yes (primary) | No |

**Key insights:**
- Only 4 of 7 providers support custom text pre-filling
- 3 providers require clipboard workaround (Facebook, Messenger, LinkedIn)
- Copy provider is the only one that doesn't open a window

**Test implications:**
- Need to test all 7 provider URL formats
- Need to test clipboard behavior for Copy + URL-only providers
- Need to mock `window.open()` for integration tests
- Need to mock `navigator.clipboard.writeText()` for integration tests

---

### Q5: What edge cases exist?

**Identified edge cases:**

1. **Very long milestone label** (e.g., "1,000,000 seconds")
   - Could push fixed parts over 279 chars → `maxLabelLength = 1`
   - User can still type 1 char, but total text might exceed 280

2. **Very long original date** (e.g., full locale string "Saturday, July 5, 2026 at 2:30:00 PM GMT+1")
   - Same issue as long milestone label

3. **Empty label** (user clicks share without typing)
   - Modal validation prevents this (line 101: `label.trim().length > 0`)
   - ShareModal buttons disabled until label is valid

4. **Special characters in label** (e.g., emoji, quotes, ampersands)
   - `encodeURIComponent()` handles URL encoding (line 56)
   - But clipboard text is NOT encoded → could break in some contexts

5. **Clipboard API blocked** (e.g., HTTP site, user denied permission)
   - Copy provider: Shows error toast (line 111-113)
   - URL-only providers: Silent failure (line 125-127, error only logged)

6. **Popup blocker enabled**
   - Handled by `window.open()` returning `null` (lines 134-140)
   - Shows toast: "Please allow popups for this site to share on social media."

7. **Context phrase for default case**
   - Lines 49-50 (socialShare.ts) and 75-76 (ShareModal.tsx): `default: contextPhrase = "Today's exactly";`
   - Fallback is reasonable, but should this ever trigger?

**Missing safeguards:**
- No truncation if fixed parts > 279 chars (relies on milestone label being reasonable)
- No validation that generated text is <= 280 chars in `socialShare.ts` (only in ShareModal UI)
- Clipboard silent failure for URL-only providers (no user feedback)

---

### Q6: Are there existing tests for social share?

**Search results:** No existing unit or integration tests found.

**Archive evidence:** `context/archive/2026-07-05-social-share-with-ai/` documents manual testing but no automation.

**Gap:** No tests for:
- Text generation logic (context-aware phrases)
- Character limit enforcement
- Clipboard API behavior
- Provider URL format correctness
- Edge cases (long labels, special characters, empty states)
- Error handling (clipboard blocked, popup blocked)

**Phase 5 scope:** Fill this gap with integration tests.

---

## Test Surface Map

### Pure function: `generateShareUrl(milestone, label, provider, originalDate, locale)`

**Input boundaries:**
- `milestone`: Different `EventCategory` values (Today, ThisWeek, AlreadyPassed, etc.)
- `label`: Empty, short, long (near 280 limit), special characters (emoji, quotes, ampersands)
- `provider`: All 7 providers (WhatsApp, Twitter, SMS, Facebook, Messenger, LinkedIn, Copy)
- `originalDate`: `PlainDate` vs `PlainDateTime`, different locales
- `locale`: `"en-US"`, `"pl-PL"`, etc.

**Output:** String (URL or text)

**Test categories:**

1. **Context-aware text generation (7 tests):**
   - Today → "Today's exactly"
   - Future categories → "On {date}, it will be exactly"
   - AlreadyPassed → "On {date}, it was exactly"
   - Default fallback

2. **Provider URL formats (7 tests):**
   - WhatsApp → `https://wa.me/?text=...`
   - Twitter → `https://twitter.com/intent/tweet?text=...`
   - SMS → `sms:?&body=...`
   - Facebook → `https://www.facebook.com/sharer/sharer.php?u=...`
   - Messenger → `https://www.facebook.com/dialog/send?link=...`
   - LinkedIn → `https://www.linkedin.com/sharing/share-offsite/?url=...`
   - Copy → Returns text directly (no URL)

3. **Character encoding (3 tests):**
   - Special characters → properly encoded with `encodeURIComponent()`
   - Emoji → encoded correctly
   - Quotes and ampersands → encoded correctly

4. **Attribution URL (1 test):**
   - All URLs include `ATTRIBUTION_URL` constant

5. **Edge cases (3 tests):**
   - Very long label → still generates valid text
   - Empty label (trimmed) → generates text with empty label
   - Different locales → `originalDate.toLocaleString(locale)` produces different formats

---

## Design Decisions (From PRD & Roadmap)

### D1: Social share text is context-aware (today/future/past)
**Source:** PRD FR-019 ("Share milestone to social media with context"); Roadmap S-04 implementation notes ("context-aware text and clipboard workarounds discovered during testing")  
**Rationale:** Makes shared content more engaging ("Today's exactly 1000 days..." vs. "On July 5, 2026, it was exactly...")  
**Test impact:** Assert correct context phrase for each `EventCategory`

### D2: Character limit is 280 (Twitter/LinkedIn max)
**Source:** `src/utils/constants.ts` line 16; Roadmap S-04 "character limits (280) enforced client-side only"  
**Rationale:** Twitter's character limit; LinkedIn also has similar limit  
**Test impact:** Test edge cases near 280 char boundary

### D3: Attribution URL always included
**Source:** PRD FR-021 ("Include attribution link in shared content"); `ATTRIBUTION_URL = "https://jublio.pl"`  
**Rationale:** Viral growth loop; user shares → friends click → new users  
**Test impact:** Assert attribution URL present in all generated text

### D4: URL-only providers use clipboard workaround
**Source:** Roadmap S-04 implementation notes ("clipboard workarounds discovered during testing"); ShareModal.tsx note (lines 154-157)  
**Rationale:** Facebook/Messenger/LinkedIn APIs don't support pre-filled text; clipboard is best UX compromise  
**Test impact:** Test clipboard is called for Facebook/Messenger/LinkedIn providers

### D5: Duplicate text generation in ShareModal for live preview
**Source:** ShareModal.tsx lines 53-92 duplicate `socialShare.ts` lines 28-51  
**Rationale:** Live preview needs real-time updates as user types; can't call async function on every keystroke  
**Test impact:** Both implementations should be tested; future refactor could deduplicate

---

## Existing Code Dependencies

### Files to test:
1. **`src/utils/socialShare.ts`** — Pure function, easy to unit test
2. **`src/components/modals/ShareModal.tsx`** — Integration test with mocked clipboard/window
3. **`src/components/MilestoneResults.tsx`** — Integration test for `handleShare` function

### Files to read (reference only):
- `src/utils/constants.ts` — MAX_SHARE_TEXT_LENGTH, ATTRIBUTION_URL
- `src/utils/enums/SocialProvider.ts` — Provider enum values
- `src/utils/enums/EventCategory.ts` — Category enum values
- `src/utils/classes/Milestone.ts` — Milestone class structure

---

## Recommended Test Fixtures

### Test milestones:
- `todayMilestone`: `EventCategory.Today`, label "1,000 days"
- `futureMilestone`: `EventCategory.ThisMonth`, label "10,000 hours", date "2026-07-15"
- `pastMilestone`: `EventCategory.AlreadyPassed`, label "5 years", date "2021-07-05"
- `longLabelMilestone`: label "1,000,000,000 seconds" (pushes char limit)

### Test labels:
- `shortLabel`: "Wedding"
- `longLabel`: "My Amazing Once-In-A-Lifetime Super Special Event That Changed Everything Forever And Ever"
- `emojiLabel`: "🎉 Wedding 🎉"
- `specialCharsLabel`: "Company Launch & New \"Era\" @ 2026"

### Test dates:
- `plainDate`: `Temporal.PlainDate.from("2020-01-01")`
- `plainDateTime`: `Temporal.PlainDateTime.from("2020-01-01T12:30:00")`

### Test locales:
- `"en-US"`: "1/1/2020, 12:30:00 PM"
- `"pl-PL"`: "1.01.2020, 12:30:00"

---

## Open Questions

### Q: Should we test ShareModal duplicate text generation logic separately?
**Current:** ShareModal lines 53-92 duplicate `socialShare.ts` logic for live preview  
**Decision:** **Test both** — `socialShare.ts` as pure unit tests, ShareModal as integration test with rendering. Flag duplication as tech debt for future refactor.

### Q: Should we test clipboard API with real browser API or mock?
**Current:** `navigator.clipboard.writeText()` is browser API (not available in Node)  
**Decision:** **Mock** — Use Vitest's `vi.spyOn(navigator.clipboard, 'writeText')` to mock; verify it's called with correct text. E2E tests (Phase 4) can test real clipboard if needed.

### Q: Should we test window.open() behavior?
**Current:** `window.open(url, "_blank", "noopener,noreferrer")` opens share URL in new window  
**Decision:** **Mock** — Use `vi.spyOn(window, 'open')` to mock; verify correct URL is passed. E2E tests can validate real window behavior.

### Q: Should we test all 7 providers or just representative samples?
**Decision:** **Test all 7** — Each provider has different URL format; missing one could break that provider. Low cost (7 simple tests).

### Q: Should we test character limit edge case (fixed parts > 279 chars)?
**Current:** `Math.max(1, MAX_SHARE_TEXT_LENGTH - fixedPartLength)` ensures `maxLabelLength >= 1`  
**Decision:** **Yes** — Test scenario where milestone label + date + attribution = 279 chars; verify user can still type 1 char; verify total text <= 280 (or document known limitation).

---

## Phase 5 Scope Summary

**In scope:**
- ✅ Unit tests for `generateShareUrl()` function (15-20 tests)
  - Context-aware text generation (7 tests)
  - Provider URL formats (7 tests)
  - Character encoding (3 tests)
  - Attribution URL (1 test)
  - Edge cases (3 tests)
- ✅ Integration tests for `handleShare()` in MilestoneResults (5-10 tests)
  - Clipboard API mocked (Copy provider)
  - Clipboard API mocked (URL-only providers: Facebook, Messenger, LinkedIn)
  - window.open() mocked (all URL providers)
  - Error handling (clipboard blocked, popup blocked)
- ✅ Integration tests for ShareModal text generation (3-5 tests)
  - Live preview matches `socialShare.ts` output
  - Character counter updates correctly
  - Validation disables buttons when invalid

**Out of scope:**
- ❌ E2E tests for real social platform sharing (external services)
- ❌ Cross-browser clipboard quirks (deferred to Phase 4 e2e)
- ❌ ShareModal UI layout/styling tests
- ❌ Analytics tracking for share events
- ❌ Refactoring duplicate text generation logic (tech debt, not test scope)

**Success criteria:**
- All R5 risk scenarios covered
- ~20-30 tests total (unit + integration)
- Tests run in <5s (add to existing ~2.5s suite → target <7.5s total)
- Clipboard and window APIs mocked for deterministic behavior
- All 7 social providers tested

---

**Research Status:** Complete — Ready for `/10x-plan`