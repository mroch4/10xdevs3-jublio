# Social Share with Text-Only MVP — Plan Brief

> Full plan: `context/changes/social-share-with-ai/plan.md`
> Research: `context/changes/social-share-with-ai/research.md`

## What & Why

Implement text-only social sharing for milestones, allowing users to share milestone text (e.g., "Today's 10,000 days since Quitting smoking (10th April 2005)") to Facebook, Twitter, WhatsApp, SMS, Messenger, LinkedIn, and copy-to-clipboard. This MVP intentionally excludes AI-generated images due to expected latency concerns—text-only sharing unblocks S-04 and provides immediate user acquisition value through social attribution links pointing to `https://jublio.pl`.

## Starting Point

S-03 (calendar export) established a complete modal-based sharing pattern: icon-triggered modal → label input → live preview → provider buttons → toast feedback. `CalendarExportModal.tsx` serves as the reference implementation with full accessibility compliance (`useEscapeKey`, `useFocusTrap`). `MilestoneResults.tsx` already has icon placement pattern for calendar export (📅). Toast component and accessibility hooks exist and work.

## Desired End State

Users click 🔗 share icon next to any milestone, enter a context label (e.g., "Wedding"), see live preview with attribution (`"Today's 10,000 days since Wedding (2000-01-15) - Calculated with Jublio at https://jublio.pl"`), and share to Facebook/Twitter/WhatsApp/SMS/Messenger/LinkedIn or copy to clipboard. Modal stays open for multi-platform sharing. Character limit (280 chars) enforced with live validation. Popup blockers show helpful toast message. Copy button works independently of popup settings. All accessibility requirements met.

## Key Decisions Made

| Decision                       | Choice                                  | Why (1 sentence)                                                                      | Source   |
| ------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------- | -------- |
| MVP scope                      | Text-only (no AI images)                | AI image latency (3-second target) risks poor UX; text sharing unblocks user acquisition | Research |
| Social providers               | Facebook, Messenger, WhatsApp, Twitter, LinkedIn, SMS, Copy | Broad platform coverage with client-side URLs + clipboard API for maximum reach | Plan     |
| Character limit                | 280 chars (Twitter/LinkedIn limit)      | Works across all platforms without truncation                                         | Plan     |
| Attribution format             | "[text] - Calculated with Jublio at https://jublio.pl" | Clear user acquisition link appended to share text                          | Plan     |
| Share icon                     | 🔗 (link)                                | Generic sharing symbol, matches emoji icon pattern from calendar export               | Plan     |
| Modal behavior                 | Clear label on close, stay open after share | Matches calendar export pattern; enables multi-platform sharing                  | Research |
| Popup blocker handling         | Show toast with instruction             | Matches calendar export pattern; educates user to allow popups                        | Plan     |
| Copy-to-clipboard              | Dedicated Copy button                   | Works independently of popup settings; provides fallback for all platforms            | Plan     |
| Preview format                 | Full share text with attribution        | WYSIWYG approach—user sees exact text that gets shared including char count           | Plan     |

## Scope

**In scope:**
- 🔗 share icon next to calendar icon in milestone list items
- ShareModal component with label input, live preview, character counter
- Provider buttons in order: Facebook, Messenger, WhatsApp, Twitter, LinkedIn, SMS, Copy
- Client-side URL generation for each platform
- Copy-to-clipboard functionality with clipboard API
- Character limit validation (280 chars)
- Popup blocker detection with toast feedback
- Full accessibility (ESC key, focus trap, keyboard nav)
- Attribution link: `https://jublio.pl`

**Out of scope:**
- AI-generated images (deferred to future enhancement)
- Instagram support (no URL-based sharing; use Copy button instead)
- Deep-link pre-filled calculator (homepage URL only)
- Per-milestone label persistence (clears on close)
- Platform-specific character limits (280 enforced globally)
- Clipboard API fallback for older browsers (PRD targets latest two major versions; graceful error toast on failure)

## Architecture / Approach

**Client-side URL generation** following S-03 calendar export pattern:

1. **Infrastructure**: Create `SocialProvider` enum at `src/utils/enums/SocialProvider.ts` with values in display order (Facebook, Messenger, WhatsApp, Twitter, LinkedIn, SMS, Copy), add share text constants (`MAX_SHARE_TEXT_LENGTH = 280`, `ATTRIBUTION_URL = "https://jublio.pl"`), implement `socialShare.ts` utility with URL generation per provider + text return for Copy.

2. **Modal component**: Create `ShareModal.tsx` by mirroring `CalendarExportModal` structure—label input with live preview showing full share text + attribution, character counter (280 limit), provider buttons (disabled until valid), Copy button with clipboard API, accessibility hooks (`useEscapeKey`, `useFocusTrap`), modal persistence after share.

3. **Integration**: Add 🔗 share icon to `MilestoneResults.tsx` next to 📅 calendar icon, wire up modal state, implement share handler with popup detection and Copy-specific logic (clipboard API), toast feedback.

**Data flow**: User enters label → live preview combines milestone data + label + attribution → provider click generates URL client-side → `window.open()` with popup detection → toast feedback.

## Phases at a Glance

| Phase     | What it delivers                                   | Key risk                                    |
| --------- | -------------------------------------------------- | ------------------------------------------- |
| 1. Core Infrastructure | `SocialProvider` enum, share text constants, `socialShare.ts` utility with 7 providers | URL format errors (testable with browser copy-paste); Copy provider returns text not URL |
| 2. ShareModal Component | Modal with label input, preview, 7 provider buttons, Copy button, accessibility | 280-char validation logic complexity, preview formatting, clipboard API browser support |
| 3. Integration | 🔗 icon in milestone list, modal state wiring, Copy handler, toast feedback | Popup blocker handling, clipboard permissions, icon placement next to calendar |

**Prerequisites:** None—all patterns and hooks already exist from S-03 calendar export. Direct implementation can start.

**Estimated effort:** ~1-2 sessions across 3 phases (infrastructure is quick; modal is bulk of work; integration is wiring)

## Open Risks & Assumptions

- **Assumption**: 280-char limit (Twitter) works for typical milestone labels. Risk: Long milestone names (e.g., "1,000,000 seconds") + medium label (e.g., "Anniversary of My Wedding") might exceed limit. Mitigation: Character counter shows red when over limit, buttons disabled—user must shorten label.
- **Assumption**: `https://jublio.pl` is live and accessible. Risk: Dead link if site not deployed. Mitigation: URL is user's decision; plan assumes it's ready.
- **Assumption**: Popup blockers are uncommon (most users allow for known sites). Risk: High popup blocker rate hurts UX. Mitigation: Toast instruction educates user; no automatic fallback needed for MVP.
- **Assumption**: Client-side URL generation URLs are stable (no platform API changes). Risk: Facebook/Twitter/WhatsApp change URL formats. Mitigation: Manual testing per phase will catch issues; URL formats are well-documented and stable.

## Success Criteria (Summary)

- User clicks 🔗 icon → ShareModal opens with correct milestone data
- User enters label → live preview shows full share text with attribution, character counter updates
- User clicks Facebook/Twitter/WhatsApp/SMS/Messenger/LinkedIn → new window opens with pre-filled share text
- User clicks Copy → text copied to clipboard, toast confirms "Copied to clipboard!"
- Modal stays open after share → user can share to multiple platforms with same label
- Character limit validation prevents over-length shares (buttons disabled when > 280 chars)
- Popup blocker shows helpful toast: "Please allow popups for this site..."
- Copy button works even if popups blocked (clipboard API independent)
- All accessibility requirements met (ESC closes, focus trap works, keyboard nav)
