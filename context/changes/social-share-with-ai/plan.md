# Social Share with Text-Only MVP Implementation Plan

## Overview

Implement text-only social sharing for milestones, allowing users to share milestone text (e.g., "Today's 10,000 days since Quitting smoking (10th April 2005)") to Facebook, Twitter, WhatsApp, SMS, Messenger, LinkedIn, and copy-to-clipboard. This MVP intentionally excludes AI-generated images due to expected latency concerns—text-only sharing unblocks S-04 and provides immediate user acquisition value through social attribution links.

**Scope Expansion (2026-07-05)**: Added Messenger, LinkedIn, and copy-to-clipboard to initial provider list for broader platform coverage.

## Current State Analysis

**What exists now:**
- S-03 (calendar export) established a complete modal-based sharing pattern with:
  - Icon-triggered modal flow from milestone list items
  - Label input with live preview
  - Multi-provider button selection
  - Toast feedback for success/error
  - Full accessibility compliance (useEscapeKey, useFocusTrap, ARIA labels)
- `CalendarExportModal.tsx` serves as the reference implementation
- `MilestoneResults.tsx` already has icon placement pattern (📅 for calendar)
- Toast component and accessibility hooks already exist and work

**What's missing:**
- Social provider enum (Facebook, Twitter, WhatsApp, SMS, Messenger, LinkedIn, Copy)
- Share text generation utility with platform-specific URL formats
- Copy-to-clipboard functionality
- ShareModal component for social sharing
- Share icon (🔗) in milestone list items
- Attribution URL constant and character limit for social sharing

**Key constraints discovered:**
- Character limit: 280 chars (Twitter limit) enforced globally
- Attribution URL: `https://jublio.pl` (live site)
- Share text format: `"Today's [milestone] since [label] ([date]) - Calculated with Jublio at https://jublio.pl"`
- Popup blockers must be handled with toast feedback (matches calendar export pattern)
- Modal must clear label on close and stay open after share (multi-platform sharing)

## Desired End State

Users can share any calculated milestone to social platforms:

1. **User clicks 🔗 share icon** next to any milestone in the results list
2. **ShareModal opens** with label input and live preview showing full share text with attribution
3. **User enters label** (e.g., "Quitting smoking") and sees character count update (280 char limit)
4. **Live preview shows**: `"Today's 10,000 days since Quitting smoking (10th April 2005) - Calculated with Jublio at https://jublio.pl"`
5. **Provider buttons enable** when label is valid and text ≤ 280 chars
6. **User clicks provider** (Facebook/Twitter/WhatsApp/SMS/Messenger/LinkedIn) → new window opens with pre-filled share text, OR clicks "Copy" → text copied to clipboard with toast confirmation
7. **Toast shows feedback**: Success message, popup blocker warning, or "Copied to clipboard!"
8. **Modal stays open** so user can share to additional platforms with same label
9. **User closes modal** → label clears for next share

**Verification:**
- Share text appears correctly on each platform with attribution link
- Copy button copies full text to clipboard
- Character limit validation prevents over-length shares
- Popup blocker shows helpful toast message
- All accessibility requirements met (ESC, focus trap, keyboard nav)

### Key Discoveries:

- `CalendarExportModal.tsx:29-34` - Modal does NOT close after provider click, allowing multi-provider sharing with same label. S-04 must follow this pattern.
- `CalendarExportModal.tsx:51-56` - Title format combines event label + user label + original date. S-04 mirrors this with "Today's" prefix.
- `MilestoneResults.tsx:124-140` - Icon placement uses emoji with `role="button"`, `tabIndex={0}`, keyboard handlers (Enter/Space). S-04 adds 🔗 icon following identical pattern.
- Research `social-share-with-ai/research.md` - Social platforms support client-side URL sharing (no API keys needed): Facebook sharer, Twitter intent, WhatsApp API, SMS protocol, Messenger app link, LinkedIn share URL.
- Copy-to-clipboard uses `navigator.clipboard.writeText()` API with fallback for older browsers.
- `lessons.md` - All modals must use `useEscapeKey` and `useFocusTrap` hooks for accessibility compliance.

## What We're NOT Doing

- **AI-generated images** - Deferred to future enhancement due to latency concerns (3-second target per PRD NFR). Text-only sharing is sufficient for MVP user acquisition.
- **Instagram support** - Instagram does not support URL-based sharing; would require Web Share API. Skipped for MVP (use Copy button instead).
- **Deep-link pre-filled calculator** - Share URL points to homepage (`https://jublio.pl`) for user acquisition, not to pre-filled calculator state.
- **Per-milestone label persistence** - Label clears on modal close (matches calendar export behavior). No state preservation across modal opens.
- **Character limit per-platform** - Enforce 280 chars globally (Twitter/LinkedIn limit) rather than varying limits per platform.
- **Clipboard API fallback for older browsers** - Copy button uses `navigator.clipboard.writeText()` which requires HTTPS and modern browsers (Chrome 63+, Firefox 53+, Safari 13.1+, Edge 79+). PRD targets "latest two major versions" of browsers, so older browsers are out of scope. Clipboard failures show graceful error toast: "Failed to copy to clipboard. Please try again."

## Implementation Approach

Follow the proven S-03 calendar export pattern with direct component-level reuse:

1. **Infrastructure first** - Create social provider enum and share text generation utility following the same structure as `CalendarProvider.ts` and `calendarExport.ts`.

2. **Modal component** - Create `ShareModal.tsx` by mirroring `CalendarExportModal.tsx` structure: label input, live preview, provider buttons, accessibility hooks. Replace calendar-specific logic with social share logic.

3. **Integration last** - Add 🔗 share icon to `MilestoneResults.tsx` next to existing 📅 calendar icon, wire up modal state, and connect share handler with toast feedback.

This phased approach ensures each piece can be tested independently before integration, and directly reuses established patterns for consistency.

## Phase 1: Core Infrastructure

### Overview

Create the foundational enums, constants, and utilities for social sharing. This phase establishes the data structures and URL generation logic that the UI will consume in Phase 2.

### Changes Required:

#### 1. SocialProvider Enum

**File**: `src/utils/enums/SocialProvider.ts`

**Intent**: Define social platform identifiers following the established enum pattern (mirror `CalendarProvider.ts`). Provides type-safe provider selection for share URL generation.

**Contract**: Export enum `SocialProvider` with values in this order: `Facebook`, `Messenger`, `WhatsApp`, `Twitter`, `LinkedIn`, `SMS`, `Copy`. One file per enum (per `lessons.md` enum pattern). Place file at `src/utils/enums/SocialProvider.ts` following existing enum structure (mirror `CalendarProvider.ts`).

#### 2. Share Text Constants

**File**: `src/utils/constants.ts`

**Intent**: Add social sharing constants to the existing constants file. Centralizes magic numbers and configuration values.

**Contract**: Append two constants to existing file:
- `MAX_SHARE_TEXT_LENGTH = 280` (Twitter limit)
- `ATTRIBUTION_URL = "https://jublio.pl"`

#### 3. Share URL Generation Utility

**File**: `src/utils/socialShare.ts`

**Intent**: Generate platform-specific share URLs client-side. Mirrors `calendarExport.ts` pattern with switch statement per provider.

**Contract**: Export function `generateShareUrl(milestone: Milestone, label: string, provider: SocialProvider, originalDate: Temporal.PlainDate | Temporal.PlainDateTime | null, locale: string): string`

Function logic:
- Build share text: `"Today's [milestone.label] since [label.trim()] ([formattedOriginalDate]) - Calculated with Jublio at https://jublio.pl"`
- Encode share text with `encodeURIComponent()`
- Switch on provider (in display order):
  - `Facebook`: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ATTRIBUTION_URL)}&quote=${encodeURIComponent(shareText)}`
  - `Messenger`: `fb-messenger://share?link=${encodeURIComponent(ATTRIBUTION_URL)}&quote=${encodeURIComponent(shareText)}`
  - `WhatsApp`: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`
  - `Twitter`: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  - `LinkedIn`: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(ATTRIBUTION_URL)}&summary=${encodeURIComponent(shareText)}`
  - `SMS`: `sms:?&body=${encodeURIComponent(shareText)}`
  - `Copy`: Return the share text directly (handled by clipboard API in parent component)
  - `default`: throw error for unknown provider (per calendar export pattern)

### Success Criteria:

#### Automated Verification:

- Type checking passes: `npm run typecheck`
- Linting passes: `npm run lint`
- File structure matches pattern: `src/utils/enums/SocialProvider.ts` exists with enum export
- Constants file updated: `MAX_SHARE_TEXT_LENGTH` and `ATTRIBUTION_URL` added to `src/utils/constants.ts`
- Utility file created: `src/utils/socialShare.ts` exports `generateShareUrl` function

#### Manual Verification:

- Import `SocialProvider` enum in new file → no TypeScript errors
- Import constants from `constants.ts` → values correct
- Call `generateShareUrl()` with test data → returns valid URL for each provider
- Copy URL to browser → platform opens with pre-filled text

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: ShareModal Component

### Overview

Create the `ShareModal` component mirroring `CalendarExportModal` structure. Implements label input, live preview with attribution, provider buttons, character limit validation, and full accessibility compliance.

### Changes Required:

#### 1. ShareModal Component

**File**: `src/components/modals/ShareModal.tsx`

**Intent**: Modal component for social sharing. Mirrors `CalendarExportModal` structure with social-specific logic. Provides label input, live preview, provider selection, and accessibility compliance.

**Contract**: 

Component interface:
```typescript
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Milestone;
  onShare: (provider: SocialProvider, label: string) => void;
  originalDate: Temporal.PlainDate | Temporal.PlainDateTime | null;
  locale: string;
}
```

Component behavior:
- **State**: `label` (string, cleared on close)
- **Accessibility hooks**: `useEscapeKey(handleClose, isOpen)`, `useFocusTrap(isOpen)` (mandatory per `lessons.md`)
- **Label input**: `maxLength` calculated to fit within 280 char total (share text + attribution), `autoFocus`, `required`, placeholder: `"e.g., Wedding, Quit Smoking, Company Launch"` (matches calendar export)
- **Live preview**: Show full share text with attribution in preview box (`role="status" aria-live="polite"`)
  - Format: `"Today's [milestone.label] since [label || '[your label]'] ([formattedOriginalDate]) - Calculated with Jublio at https://jublio.pl"`
- **Character counter**: Display `{currentLength}/280 characters` below preview
- **Validation**: `isLabelValid = label.trim().length > 0 && currentLength <= 280`
- **Provider buttons**: 7 buttons in display order (Facebook, Messenger, WhatsApp, Twitter, LinkedIn, SMS, Copy) in button group, `disabled={!isLabelValid}`, `btn btn-sm btn-outline-secondary`, ARIA labels per provider. Copy button has distinct visual treatment (e.g., `btn-primary` for emphasis).
- **Modal persistence**: Do NOT close modal after provider click (user can share to multiple platforms)
- **handleClose**: Clear label state, call `onClose()`
- **Modal structure**: Backdrop (z-index: 1040), modal dialog (z-index: 1050), header with title "Share Milestone" + close button, body with form, footer with Cancel button

#### 2. ShareModal CSS

**File**: `src/components/modals/ShareModal.css`

**Intent**: Styling for ShareModal component. Mirror `CalendarExportModal.css` for visual consistency.

**Contract**: Copy structure from `CalendarExportModal.css` with these class names:
- `.preview-box` - Preview container styling
- `.preview-text` - Preview text styling
- `.provider-buttons` - Button group layout (flexbox, gap, wrap)
- Other modal styles as needed for consistency

### Success Criteria:

#### Automated Verification:

- Type checking passes: `npm run typecheck`
- Linting passes: `npm run lint`
- Component imports correctly: `useEscapeKey`, `useFocusTrap`, `SocialProvider`, `Milestone`, `Temporal`
- CSS file exists: `src/components/modals/ShareModal.css`

#### Manual Verification:

- Open modal by directly rendering `<ShareModal isOpen={true} ... />` in dev
- Label input has autofocus, placeholder matches calendar export
- Live preview updates as user types, shows full text with attribution
- Character counter shows `X/280 characters`, updates on input
- Provider buttons disabled when label empty or text > 280 chars
- Provider buttons enable when valid label entered and text ≤ 280 chars
- ESC key closes modal
- Tab key cycles through focusable elements only (focus trap works)
- Modal closes on backdrop click or Cancel button
- Label clears when modal closes
- Modal does NOT close when provider button clicked

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Integration

### Overview

Integrate ShareModal into `MilestoneResults.tsx` by adding 🔗 share icon next to calendar icon, wiring up modal state, implementing share handler with popup detection, and connecting toast feedback.

### Changes Required:

#### 1. Add Share Icon to MilestoneResults

**File**: `src/components/MilestoneResults.tsx`

**Intent**: Add 🔗 share icon next to existing 📅 calendar icon in milestone list items. Follows identical accessibility pattern (clickable with mouse/keyboard, role="button", ARIA label).

**Contract**: 

State additions:
- `const [shareModalOpen, setShareModalOpen] = useState(false);`
- `const [selectedShareEvent, setSelectedShareEvent] = useState<Milestone | null>(null);`

Icon placement (add after calendar icon, line ~140):
```typescript
<span
  className="share-icon"
  onClick={() => handleShareClick(event)}
  onKeyDown={(e) => {
	if (e.key === "Enter" || e.key === " ") {
	  e.preventDefault();
	  handleShareClick(event);
	}
  }}
  role="button"
  tabIndex={0}
  aria-label="Share on social media"
>
  🔗
</span>
```

Handler functions:
- `handleShareClick(event: Milestone)` - Sets `selectedShareEvent` and opens modal
- `handleShare(provider: SocialProvider, label: string)` - Generates URL, opens window, handles popup blocker, shows toast
- `handleCloseShareModal()` - Closes modal, clears `selectedShareEvent`

Share handler logic:
```typescript
const handleShare = (provider: SocialProvider, label: string) => {
  if (!selectedShareEvent || !originalDate) return;

  try {
	// Special handling for Copy provider
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

	// Handle URL-based providers (Facebook, Twitter, WhatsApp, SMS, Messenger, LinkedIn)
	const url = generateShareUrl(selectedShareEvent, label, provider, originalDate, locale);
	const newWindow = window.open(url, "_blank", "noopener,noreferrer");

	if (newWindow === null) {
	  // Popup blocked
	  setToastMessage("Please allow popups for this site to share on social media.");
	} else {
	  // Success
	  const providerName = provider; // "Facebook", "Twitter", etc.
	  setToastMessage(`Opening ${providerName}... Share your milestone!`);
	}
  } catch (error) {
	console.error("Failed to generate share URL:", error);
	setToastMessage("Failed to generate share link. Please try again.");
  }
};
```

Modal render (add after CalendarExportModal, line ~158):
```typescript
{selectedShareEvent && (
  <ShareModal 
	isOpen={shareModalOpen} 
	onClose={handleCloseShareModal} 
	event={selectedShareEvent} 
	onShare={handleShare}
	originalDate={originalDate}
	locale={locale}
  />
)}
```

#### 2. ShareModal Import

**File**: `src/components/MilestoneResults.tsx`

**Intent**: Import ShareModal component and SocialProvider enum at top of file.

**Contract**: Add imports:
```typescript
import ShareModal from "./modals/ShareModal";
import { SocialProvider } from "../utils/enums/SocialProvider";
```

#### 3. CSS for Share Icon

**File**: `src/components/MilestoneResults.css`

**Intent**: Add styling for 🔗 share icon to match calendar icon styling.

**Contract**: Add rule `.share-icon` with same styles as `.calendar-icon` (cursor, hover, focus states).

### Success Criteria:

#### Automated Verification:

- Type checking passes: `npm run typecheck`
- Linting passes: `npm run lint`
- Build succeeds: `npm run build`
- Component imports correctly: `ShareModal`, `SocialProvider`, `generateShareUrl`

#### Manual Verification:

- 🔗 share icon appears next to 📅 calendar icon on each milestone
- Clicking share icon opens ShareModal with correct milestone data
- Entering label and clicking Facebook → new window opens with pre-filled text on Facebook
- Entering label and clicking Twitter → new window opens with pre-filled tweet
- Entering label and clicking WhatsApp → WhatsApp web opens with pre-filled message
- Entering label and clicking SMS → SMS app opens (on mobile) or shows protocol handler prompt (on desktop)
- Popup blocker test: Block popups in browser settings → share click shows toast "Please allow popups..."
- Share one milestone to Facebook → modal stays open → click Twitter → second share works with same label
- Close modal → open again → label is cleared (fresh start)
- Toast shows success message after each share
- Share icon is keyboard accessible (Tab to icon, Enter/Space to open modal)
- No regressions: Calendar export still works, existing features unaffected

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Testing Strategy

### Manual Testing Steps:

1. **Share to Facebook**:
   - Click 🔗 on any milestone
   - Enter label "Test Share"
   - Click Facebook button
   - Verify: New window opens to Facebook sharer with pre-filled text: "Today's [milestone] since Test Share ([date]) - Calculated with Jublio at https://jublio.pl"
   - Verify: Attribution URL (`https://jublio.pl`) appears in share

2. **Share to Twitter**:
   - Same milestone, same label (modal still open)
   - Click Twitter button
   - Verify: Twitter intent page opens with pre-filled tweet matching exact text format
   - Verify: Attribution URL present

3. **Share to WhatsApp**:
   - Click WhatsApp button
   - Verify: WhatsApp Web opens (or mobile app) with pre-filled message
   - Verify: Full text with attribution appears

4. **Share to SMS**:
   - Click SMS button
   - Verify: SMS app opens (mobile) or protocol handler prompt (desktop)
   - Verify: Message body contains full share text

5. **Share to Messenger**:
   - Click Messenger button
   - Verify: Messenger app opens (mobile) or Messenger web (desktop) with pre-filled message
   - Verify: Attribution URL present

6. **Share to LinkedIn**:
   - Click LinkedIn button
   - Verify: LinkedIn share dialog opens with pre-filled post
   - Verify: Attribution URL and share text appear

7. **Copy to clipboard**:
   - Click Copy button
   - Verify: Toast shows "Copied to clipboard! Paste it anywhere to share."
   - Paste into text editor (Ctrl+V / Cmd+V)
   - Verify: Full share text with attribution pasted correctly

8. **Character limit validation**:
   - Enter very long label (e.g., 200+ chars)
   - Verify: Character counter shows `X/280`, turns red when > 280
   - Verify: Provider buttons disabled when > 280 chars
   - Shorten label to under 280
   - Verify: Buttons re-enable

9. **Popup blocker handling**:
   - Block popups in browser settings
   - Click any URL-based provider button (not Copy)
   - Verify: Toast shows "Please allow popups for this site..."
   - Enable popups, retry
   - Verify: Share window opens successfully

10. **Modal persistence**:
	- Share to Facebook → modal stays open
	- Share to Twitter → modal stays open
	- Copy to clipboard → modal stays open
	- Click Cancel → modal closes

11. **Label reset**:
	- Open modal, enter label, close modal
	- Open modal again
	- Verify: Label field is empty (fresh start)

12. **Accessibility**:
	- Tab to 🔗 icon → verify focus visible
	- Press Enter → modal opens
	- Press Tab → cycles through modal elements only
	- Press ESC → modal closes
	- Verify: Focus returns to 🔗 icon after modal closes

13. **Edge cases**:
	- Very short label (1 char) → should work
	- Label with special chars (!@#$%) → should encode correctly in URL
	- Milestone with very long label (e.g., "1,000,000 seconds") → should fit within 280 char limit with reasonable context label
	- Copy button works even if popups are blocked (clipboard API separate from window.open)

## Performance Considerations

- **Client-side URL generation**: All share URLs generated in browser (no backend latency)
- **No API calls**: Sharing uses native platform URLs (no external API dependencies)
- **Modal rendering**: ShareModal only renders when `isOpen={true}` (no unnecessary DOM nodes)
- **State management**: Minimal state (label, modal open/closed) - no performance impact

## Migration Notes

Not applicable - new feature with no data migration.

## References

- Related research: `context/changes/social-share-with-ai/research.md`
- Calendar export implementation: `src/components/modals/CalendarExportModal.tsx`
- Icon placement pattern: `src/components/MilestoneResults.tsx:124-140`
- Accessibility hooks: `src/hooks/useEscapeKey.ts`, `src/hooks/useFocusTrap.ts`
- Lessons learned: `context/foundation/lessons.md` (modal requirements)
- PRD references: FR-019, FR-020 (modified: text-only MVP), FR-021 (attribution)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Core Infrastructure

#### Automated

- [x] 1.1 Type checking passes: `npm run build` (includes TypeScript compilation) — e9e5e5c
- [x] 1.2 Linting passes: `npm run lint` — e9e5e5c
- [x] 1.3 File structure matches pattern: `src/utils/enums/SocialProvider.ts` exists with enum export — e9e5e5c
- [x] 1.4 Constants file updated: `MAX_SHARE_TEXT_LENGTH` and `ATTRIBUTION_URL` added to `src/utils/constants.ts` — e9e5e5c
- [x] 1.5 Utility file created: `src/utils/socialShare.ts` exports `generateShareUrl` function — e9e5e5c

#### Manual

- [x] 1.6 Import `SocialProvider` enum in new file → no TypeScript errors — e9e5e5c
- [x] 1.7 Import constants from `constants.ts` → values correct — e9e5e5c
- [x] 1.8 Call `generateShareUrl()` with test data → returns valid URL for each provider — e9e5e5c
- [~] 1.9 Copy URL to browser → platform opens with pre-filled text (skipped - will test during Phase 3 integration)

### Phase 2: ShareModal Component

#### Automated

- [x] 2.1 Type checking passes: `npm run build` (includes TypeScript compilation) — 7bee106
- [x] 2.2 Linting passes: `npm run lint` — 7bee106
- [x] 2.3 Component imports correctly: `useEscapeKey`, `useFocusTrap`, `SocialProvider`, `Milestone`, `Temporal` — 7bee106
- [x] 2.4 CSS file exists: `src/components/modals/ShareModal.css` — 7bee106

#### Manual

- [ ] 2.5 Open modal by directly rendering `<ShareModal isOpen={true} ... />` in dev
- [ ] 2.6 Label input has autofocus, placeholder matches calendar export
- [ ] 2.7 Live preview updates as user types, shows full text with attribution
- [ ] 2.8 Character counter shows `X/280 characters`, updates on input
- [ ] 2.9 Provider buttons disabled when label empty or text > 280 chars
- [ ] 2.10 Provider buttons enable when valid label entered and text ≤ 280 chars
- [ ] 2.11 ESC key closes modal
- [ ] 2.12 Tab key cycles through focusable elements only (focus trap works)
- [ ] 2.13 Modal closes on backdrop click or Cancel button
- [ ] 2.14 Label clears when modal closes
- [ ] 2.15 Modal does NOT close when provider button clicked

### Phase 3: Integration

#### Automated

- [x] 3.1 Type checking passes: `npm run build` (includes TypeScript compilation) — 0fd0fab
- [x] 3.2 Linting passes: `npm run lint` — 0fd0fab
- [x] 3.3 Build succeeds: `npm run build` — 0fd0fab
- [x] 3.4 Component imports correctly: `ShareModal`, `SocialProvider`, `generateShareUrl` — 0fd0fab

#### Manual

- [ ] 3.5 🔗 share icon appears next to 📅 calendar icon on each milestone
- [ ] 3.6 Clicking share icon opens ShareModal with correct milestone data
- [ ] 3.7 Entering label and clicking Facebook → new window opens with pre-filled text on Facebook
- [ ] 3.8 Entering label and clicking Twitter → new window opens with pre-filled tweet
- [ ] 3.9 Entering label and clicking WhatsApp → WhatsApp web opens with pre-filled message
- [ ] 3.10 Entering label and clicking SMS → SMS app opens (on mobile) or shows protocol handler prompt (on desktop)
- [ ] 3.11 Entering label and clicking Messenger → Messenger app/web opens with pre-filled message
- [ ] 3.12 Entering label and clicking LinkedIn → LinkedIn share dialog opens with pre-filled post
- [ ] 3.13 Entering label and clicking Copy → toast shows "Copied to clipboard!" and text pastes correctly
- [ ] 3.14 Popup blocker test: Block popups in browser settings → share click shows toast "Please allow popups..."
- [ ] 3.15 Share one milestone to Facebook → modal stays open → click Twitter → second share works with same label
- [ ] 3.16 Close modal → open again → label is cleared (fresh start)
- [ ] 3.17 Toast shows success message after each share
- [ ] 3.18 Share icon is keyboard accessible (Tab to icon, Enter/Space to open modal)
- [ ] 3.19 Copy button works even if popups are blocked (clipboard API separate from window.open)
- [ ] 3.20 No regressions: Calendar export still works, existing features unaffected
