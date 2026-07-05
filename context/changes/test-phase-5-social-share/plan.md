# Phase 5 Plan: Social Share Text & Clipboard Integration Tests

**Plan Date:** 2026-07-05  
**Phase:** 5 — Social share text & clipboard (integration tests)  
**Risk Coverage:** R5 (Social share generates truncated/broken text or copy-to-clipboard fails)  
**Estimated Duration:** 45-60 minutes

---

## Plan Overview

**Goal:** Add integration tests for social share text generation and clipboard behavior to ensure text is correctly formatted, character limits are enforced, and clipboard API works across all providers.

**Approach:** Two-layer testing:
1. **Unit tests** for `generateShareUrl()` pure function (context phrases, URL formats, encoding)
2. **Integration tests** for `handleShare()` with mocked clipboard and window APIs

**Why this order?**
- Unit tests first → validates core text generation logic independently
- Integration tests after → validates clipboard/window integration and error handling
- No component refactoring needed → existing logic is testable with mocks

---

## Implementation Steps

### Phase 5.1: Unit tests for `generateShareUrl()`

**File:** `src/utils/__tests__/socialShare.test.ts` (new)

**Test structure (~18 tests across 5 describe blocks):**

#### Block 1: Context-aware text generation (7 tests)
1. ✅ EventCategory.Today → "Today's exactly"
2. ✅ EventCategory.ThisWeek → "On {date}, it will be exactly"
3. ✅ EventCategory.NextMonth → "On {date}, it will be exactly"
4. ✅ EventCategory.Further → "On {date}, it will be exactly"
5. ✅ EventCategory.BeyondHumanLifeExpectancy → "On {date}, it will be exactly"
6. ✅ EventCategory.AlreadyPassed → "On {date}, it was exactly"
7. ✅ Default fallback (unknown category) → "Today's exactly"

#### Block 2: Provider URL formats (7 tests)
8. ✅ WhatsApp → `https://wa.me/?text={encodedText}`
9. ✅ Twitter → `https://twitter.com/intent/tweet?text={encodedText}`
10. ✅ SMS → `sms:?&body={encodedText}`
11. ✅ Facebook → `https://www.facebook.com/sharer/sharer.php?u={encodedUrl}`
12. ✅ Messenger → `https://www.facebook.com/dialog/send?link={encodedUrl}`
13. ✅ LinkedIn → `https://www.linkedin.com/sharing/share-offsite/?url={encodedUrl}`
14. ✅ Copy → Returns text directly (no URL)

#### Block 3: Character encoding (2 tests)
15. ✅ Special characters (emoji, quotes, ampersands) → properly encoded in URL
16. ✅ Copy provider text → NOT encoded (raw text for clipboard)

#### Block 4: Attribution URL (1 test)
17. ✅ All providers include `ATTRIBUTION_URL` ("https://jublio.pl")

#### Block 5: Edge cases (2 tests)
18. ✅ Very long label → generates text (no truncation in function)
19. ✅ Different locales → `originalDate.toLocaleString(locale)` formats correctly

**Test fixtures:**
```typescript
const todayMilestone = new Milestone({
  label: "1,000 days",
  category: EventCategory.Today,
  dateString: "2026-07-05",
  // ... other props
});

const futureMilestone = new Milestone({
  label: "10,000 hours",
  category: EventCategory.ThisMonth,
  dateString: "2026-07-15",
  // ... other props
});

const pastMilestone = new Milestone({
  label: "5 years",
  category: EventCategory.AlreadyPassed,
  dateString: "2021-07-05",
  // ... other props
});

const originalDate = Temporal.PlainDate.from("2020-01-01");
const originalDateTime = Temporal.PlainDateTime.from("2020-01-01T12:30:00");
```

**Assertion pattern:**
```typescript
const result = generateShareUrl(todayMilestone, "Wedding", SocialProvider.WhatsApp, originalDate, "en-US");
expect(result).toContain("Today's exactly");
expect(result).toContain("1,000 days");
expect(result).toContain("Wedding");
expect(result).toContain("https://jublio.pl");
expect(result).toMatch(/^https:\/\/wa\.me\/\?text=/);
```

---

### Phase 5.2: Integration tests for clipboard behavior

**File:** `src/components/__tests__/MilestoneResults.test.tsx` (new)

**Setup:**
```typescript
// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
	writeText: mockWriteText,
  },
});

// Mock window.open
const mockWindowOpen = vi.fn();
vi.stubGlobal('open', mockWindowOpen);
```

**Test structure (~8 tests across 3 describe blocks):**

#### Block 1: Copy provider clipboard behavior (3 tests)
1. ✅ Copy provider → calls `navigator.clipboard.writeText()` with correct text
2. ✅ Copy provider success → shows toast "Copied to clipboard! Paste it anywhere to share."
3. ✅ Copy provider failure → shows toast "Failed to copy to clipboard. Please try again."

#### Block 2: URL-only providers clipboard workaround (3 tests)
4. ✅ Facebook → calls clipboard AND window.open
5. ✅ Messenger → calls clipboard AND window.open
6. ✅ LinkedIn → calls clipboard AND window.open

#### Block 3: Full-text providers (2 tests)
7. ✅ WhatsApp → calls window.open only (no clipboard)
8. ✅ Twitter → calls window.open only (no clipboard)

**Assertion pattern:**
```typescript
// Test Copy provider
handleShare(SocialProvider.Copy, "Wedding");
expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining("Wedding"));
expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining("https://jublio.pl"));

// Test Facebook (URL-only with clipboard)
handleShare(SocialProvider.Facebook, "Wedding");
expect(mockWriteText).toHaveBeenCalled(); // Clipboard workaround
expect(mockWindowOpen).toHaveBeenCalledWith(
  expect.stringContaining("facebook.com/sharer"),
  "_blank",
  "noopener,noreferrer"
);

// Test WhatsApp (full-text, no clipboard)
handleShare(SocialProvider.WhatsApp, "Wedding");
expect(mockWriteText).not.toHaveBeenCalled(); // No clipboard
expect(mockWindowOpen).toHaveBeenCalledWith(
  expect.stringContaining("wa.me"),
  "_blank",
  "noopener,noreferrer"
);
```

---

### Phase 5.3: Integration tests for ShareModal text generation

**File:** `src/components/modals/__tests__/ShareModal.test.tsx` (new)

**Test structure (~5 tests across 2 describe blocks):**

#### Block 1: Live preview text generation (3 tests)
1. ✅ Preview text matches `socialShare.ts` output for Today milestone
2. ✅ Preview text updates when label changes
3. ✅ Preview text includes attribution URL

#### Block 2: Character counter and validation (2 tests)
4. ✅ Character counter updates correctly (e.g., "150/280 characters")
5. ✅ Buttons disabled when label empty or text > 280 chars

**Setup:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareModal from '../ShareModal';

const mockOnShare = vi.fn();
const mockOnClose = vi.fn();

const todayMilestone = new Milestone({
  label: "1,000 days",
  category: EventCategory.Today,
  dateString: "2026-07-05",
  // ... other props
});
```

**Assertion pattern:**
```typescript
render(<ShareModal
  isOpen={true}
  onClose={mockOnClose}
  event={todayMilestone}
  onShare={mockOnShare}
  originalDate={Temporal.PlainDate.from("2020-01-01")}
  locale="en-US"
/>);

const input = screen.getByLabelText(/What is this milestone about/i);
await userEvent.type(input, "Wedding");

const preview = screen.getByText(/Today's exactly 1,000 days since Wedding/i);
expect(preview).toBeInTheDocument();

const counter = screen.getByText(/\/280 characters/i);
expect(counter).toBeInTheDocument();
```

---

### Phase 5.4: Verify and document

**Verification steps:**
1. Run `npm test` → all Phase 1 (54) + Phase 6 (24) + Phase 5 (~30) tests pass
2. Run `npm run build` → no TypeScript errors
3. Run `npm run lint` → no ESLint warnings
4. Manual smoke test: Open app → Calculate → Share modal → verify preview text and copy button

**Documentation updates:**
1. Update `test-plan.md` §2 Phase 5 status to `complete`
2. Update `test-plan.md` §6 cookbook with integration test patterns:
   - Mocking clipboard API
   - Mocking window.open()
   - Testing React components with @testing-library
   - Link to `socialShare.test.ts` and `MilestoneResults.test.tsx`

**Output:** Phase 5 complete, ready for git commit

---

## Success Criteria

**Must have:**
- ✅ `src/utils/__tests__/socialShare.test.ts` created with ~18 unit tests
- ✅ `src/components/__tests__/MilestoneResults.test.tsx` created with ~8 integration tests
- ✅ `src/components/modals/__tests__/ShareModal.test.tsx` created with ~5 integration tests
- ✅ All Phase 1 (54) + Phase 6 (24) + Phase 5 (~30) tests pass
- ✅ `npm run build` and `npm run lint` pass
- ✅ Test suite runs in <8s total
- ✅ `test-plan.md` §2 Phase 5 marked `complete`
- ✅ `test-plan.md` §6 cookbook updated with integration test patterns

**Quality gates:**
- No new TypeScript errors
- No new ESLint warnings
- All clipboard API calls mocked (no real browser API in Node tests)
- All window.open() calls mocked
- Preview text matches `socialShare.ts` output exactly

---

## Risk Analysis

### Risk: @testing-library/react not installed
**Likelihood:** High (no React component tests exist yet)  
**Mitigation:** Install `@testing-library/react` and `@testing-library/user-event` as dev dependencies; configure Vitest for React component testing

### Risk: Clipboard API mocking doesn't work in Node environment
**Likelihood:** Medium  
**Mitigation:** Use `vi.stubGlobal()` or `Object.assign(navigator, ...)` to mock; if fails, skip integration tests and document as E2E-only

### Risk: ShareModal duplicate logic diverges from socialShare.ts
**Likelihood:** Low (both recently implemented)  
**Mitigation:** Test both implementations; flag duplication as tech debt for future refactor

### Risk: Character limit edge case (fixed parts > 279 chars) not testable
**Likelihood:** Low  
**Mitigation:** Create fixture with very long milestone label and date; verify `maxLabelLength` calculation; document known limitation if found

---

## Cost × Signal Analysis

**Development cost:** ~45-60 minutes
- Unit tests for `socialShare.ts`: 15-20 min
- Integration tests for `MilestoneResults`: 15-20 min
- Integration tests for `ShareModal`: 10-15 min
- Setup @testing-library: 5-10 min
- Verify + document: 5-10 min

**Execution cost:** ~1-2s per test run (add ~30 tests × ~0.05-0.1s each = ~1.5-3s to existing 2.5s suite)

**Signal quality:** High
- Covers R5 (social share text and clipboard) completely
- Tests all 7 social providers
- Tests clipboard API integration (mocked for determinism)
- Enables regression detection for future changes

**Maintenance cost:** Medium
- Component tests with @testing-library require React rendering
- Clipboard/window mocks could break if Vitest environment changes
- Duplicate text generation in ShareModal increases test surface

**Overall:** High value — Medium cost, high signal, medium maintenance; enables E2E tests in Phase 4

---

## Open Questions

### Q: Should we install @testing-library/react or use different approach?
**Decision:** Install @testing-library/react + user-event — Industry standard for React component testing; Vitest supports it; low cost (~2-3 npm packages).

### Q: Should we test ShareModal duplicate text generation or just flag it?
**Decision:** Test both — ShareModal preview text should match `socialShare.ts` output. Add test comment flagging duplication as tech debt.

### Q: Should we test error handling for clipboard blocked scenario?
**Decision:** Yes — Mock `navigator.clipboard.writeText()` to reject Promise; verify error toast is shown.

### Q: Should we test character limit edge case (fixed parts > 279 chars)?
**Decision:** Yes — Create fixture with 280-char milestone label; verify `maxLabelLength = 1`; verify total text <= 280 (or document if > 280).

---

## Implementation Order Rationale

**Why unit tests first?**
- `generateShareUrl()` is pure function (easy to test, no dependencies)
- Unit tests validate core logic before integration layer
- Faster feedback loop (no React rendering)

**Why clipboard integration second?**
- `handleShare()` is simpler than ShareModal (fewer UI interactions)
- Clipboard mocking is shared setup for later tests
- Validates clipboard workaround for URL-only providers

**Why ShareModal integration last?**
- Requires @testing-library setup (one-time cost)
- Tests duplicate text generation (lower priority than core logic)
- Most complex test surface (React rendering + user events)

**Why verify at end?**
- Ensures no regression in Phase 1/6 tests
- Catches any TypeScript/lint issues from new imports

---

**Plan Status:** Ready for `/10x-implement test-phase-5-social-share phase 5`