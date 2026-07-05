---
date: 2026-07-05T10:10:31+01:00
researcher: GitHub Copilot
git_commit: 8ab22db431800c25f677babc097ccca21575fb96
branch: main
repository: 10xdevs3-jublio
topic: "S-04 Social Share - UI/UX patterns from S-03 Calendar Export"
tags: [research, codebase, social-share, modal-patterns, calendar-export]
status: complete
last_updated: 2026-07-05
last_updated_by: GitHub Copilot
---

# Research: S-04 Social Share - UI/UX patterns from S-03 Calendar Export

**Date**: 2026-07-05T10:10:31+01:00
**Researcher**: GitHub Copilot
**Git Commit**: 8ab22db431800c25f677babc097ccca21575fb96
**Branch**: main
**Repository**: 10xdevs3-jublio

## Research Question

How should S-04 (social share with text-only MVP) reuse existing UI/UX patterns from S-03 (calendar export)?

**MVP Scope Decision**: Deliver text-only sharing first (e.g., "Today's 10,000 days since Quitting smoking (10th April 2005)") due to expected latency in AI image generation. AI-generated images deferred to future enhancement.

## Summary

S-03 (calendar export) established a strong modal-based sharing pattern that S-04 can directly reuse:

1. **Icon-triggered modal flow**: Milestone list item has a clickable icon (📅 for calendar, could be 🔗 or 📱 for share) that opens a modal
2. **Label input + preview**: User provides a label (e.g., "Wedding", "Quit Smoking"), sees live preview of the generated share text
3. **Provider selection buttons**: Multiple provider buttons (Google/Apple/Outlook for calendar; Facebook/Twitter/WhatsApp/SMS for share) enabled only when label is valid
4. **Toast feedback**: Success/error messages via Toast component after action completes
5. **Accessibility compliance**: ESC key close (`useEscapeKey`), focus trap (`useFocusTrap`), ARIA labels, keyboard navigation

**Key Discovery**: Calendar export modal keeps the modal open after provider click (user can export to multiple providers with same label). S-04 should follow this pattern for multi-platform sharing.

## Detailed Findings

### CalendarExportModal Component Pattern

**File**: `src/components/modals/CalendarExportModal.tsx`

**Modal Structure** (lines 65-156):
- Backdrop (z-index: 1040) + Modal dialog (z-index: 1050)
- Modal header with title and close button (`btn-close`)
- Modal body with form (label input + preview + provider buttons)
- Modal footer with "Cancel" button

**Label Input + Live Preview** (lines 82-113):
```typescript
// User provides context label
<input
  type="text"
  className="form-control"
  id="milestone-label"
  value={label}
  onChange={(e) => setLabel(e.target.value)}
  placeholder="e.g., Wedding, Quit Smoking, Company Launch"
  maxLength={maxLabelLength}
  autoFocus
  required
  aria-describedby="label-help preview-text"
/>

// Live preview of generated title
<div className="preview-box mt-2" role="status" aria-live="polite">
  <strong>Event title preview:</strong>
  <div className="preview-text" id="preview-text">
	{previewTitle}
  </div>
</div>

// Character counter
<small id="label-help" className="text-muted">
  {currentTitleLength}/{MAX_EVENT_TITLE_LENGTH} characters
</small>
```

**Provider Buttons Pattern** (lines 115-143):
- Button group (`role="group" aria-label="Calendar providers"`)
- Individual buttons: `btn btn-sm btn-outline-secondary`
- Each button disabled until label is valid: `disabled={!isLabelValid}`
- Buttons trigger provider-specific action: `onClick={() => handleProviderClick(provider)}`
- ARIA labels for accessibility: `aria-label="Export to Apple Calendar"`

**Modal Persistence**: Modal does NOT close after provider click (line 29-34). User can click multiple providers with the same label. Modal only closes on explicit "Cancel" or ESC/backdrop click.

**Title Format** (lines 51-56):
```typescript
const titleParts = [
  event.label,           // "10,000 days"
  " since ",
  label.trim() || "[your label]",  // User input
  " (",
  formattedOriginalDate,  // "10th April 2005"
  ")"
];
const previewTitle = titleParts.join("");
```

**S-04 Adaptation**: Share text format should mirror this structure:
- `"Today's [milestone.label] since [user label] ([original date])"`
- Example: `"Today's 10,000 days since Quitting smoking (10th April 2005)"`

### Integration Point: MilestoneResults Component

**File**: `src/components/MilestoneResults.tsx`

**Icon Placement** (lines 124-140):
- Calendar icon (📅) placed to the right of each milestone list item
- Clickable with mouse (`onClick`) and keyboard (`onKeyDown` for Enter/Space)
- `role="button" tabIndex={0} aria-label="Export to calendar"`
- Click opens modal: `setSelectedEvent(event); setExportModalOpen(true);`

**S-04 Integration**: Add a second icon (🔗 or 📱) next to the calendar icon for social sharing. Same pattern: clickable, keyboard-accessible, opens ShareModal.

**Toast Feedback** (lines 22-24, 67-84, 160):
```typescript
const [toastMessage, setToastMessage] = useState<string | null>(null);

// After action completes:
setToastMessage("Calendar file downloaded. Open it to add the event to Apple Calendar.");
// or
setToastMessage("Opening Google Calendar... Please log in if the calendar doesn't open.");

// Render Toast:
<Toast message={toastMessage || ""} show={toastMessage !== null} onClose={handleCloseToast} />
```

**S-04 Adaptation**: Use same Toast pattern for share success/failure messages.

### Accessibility Hooks

**File**: `src/components/modals/CalendarExportModal.tsx` (lines 10-11, 36-45)

**useEscapeKey** (line 42):
```typescript
const handleClose = useCallback(() => {
  setLabel("");  // Reset form state
  onClose();
}, [onClose]);

useEscapeKey(handleClose, isOpen);
```

**useFocusTrap** (line 45):
```typescript
const modalRef = useFocusTrap(isOpen);

// Attach to modal root:
<div className="modal" ref={modalRef}>
```

**S-04 Requirement**: ShareModal MUST use both hooks (per `context/foundation/lessons.md`):
- All modals must close on ESC key
- All modals must trap focus and return focus to trigger element

## Code References

- `src/components/modals/CalendarExportModal.tsx` - Complete modal pattern to replicate
- `src/components/MilestoneResults.tsx:124-140` - Icon placement and click handling
- `src/components/Toast.tsx` - Toast feedback component
- `src/utils/enums/CalendarProvider.ts` - Enum pattern for providers (create `SocialProvider` enum)
- `src/utils/constants.ts` - Constants for limits (MAX_LABEL_LENGTH, MAX_EVENT_TITLE_LENGTH)
- `src/hooks/useEscapeKey.ts` - ESC key handling hook
- `src/hooks/useFocusTrap.ts` - Focus trap hook

## Architecture Insights

### Modal Pattern Convention

The app uses a **controlled modal** pattern:
1. Parent component (`MilestoneResults`) owns modal state (`isOpen`, `selectedEvent`)
2. Parent passes `onClose` callback to modal
3. Modal calls `onClose` when user dismisses it (ESC, backdrop, Cancel button)
4. Parent handles the action logic (`onExport` for calendar, will be `onShare` for social)

### Provider Selection Pattern

Both calendar export and social share follow a **multi-provider button group** pattern:
- User selects label once
- Multiple provider buttons become enabled
- Each button triggers provider-specific URL/action
- Modal stays open so user can share to multiple platforms

### Text Generation Pattern

**Calendar export generates event title client-side** (no backend):
- Combines: milestone label + user label + original date
- Format: `"[10,000 days] since [Wedding] (2000-01-15)"`

**S-04 should follow same client-side pattern**:
- Combines: milestone label + user label + original date
- Format: `"Today's [10,000 days] since [Wedding] (2000-01-15)"`
- No backend/API call needed for MVP text-only sharing

### Social Sharing URLs (Client-Side)

Social platforms support URL-based sharing (no API keys needed for MVP):

**Facebook**:
```typescript
const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
```

**Twitter/X**:
```typescript
const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
```

**WhatsApp**:
```typescript
const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
```

**SMS** (mobile only):
```typescript
const url = `sms:?&body=${encodeURIComponent(shareText)}`;
```

**Instagram**: Does not support URL-based sharing. Need Web Share API or copy-to-clipboard fallback.

All follow the same pattern as calendar export: generate URL client-side, open in new window (`window.open(url, "_blank")`), show toast feedback.

## Historical Context

**S-03 Calendar Export** (archived: `context/archive/2026-07-03-export-to-calendar/`):
- Implemented modal-based export flow with label input + provider selection
- Established pattern: icon in milestone list → modal → label input + preview → provider buttons → action + toast
- **Key decision**: Keep modal open after provider click so user can export to multiple calendars with same label

**S-04 MVP Decision** (this change):
- **Scope reduction**: Text-only sharing (no AI-generated images) to unblock S-04
- **Rationale**: AI image generation latency (3-second target per PRD) risks poor UX; defer to future enhancement
- **Text format**: `"Today's [milestone] since [label] ([date])"` mirrors calendar export title format

## Related Research

- `context/archive/2026-07-03-export-to-calendar/plan.md` - S-03 implementation plan showing modal flow
- `context/foundation/lessons.md` - Modal accessibility requirements (ESC key, focus trap, consistent styling)

## Open Questions

**RESOLVED - User Decisions (2026-07-05)**:

1. ✅ **Social provider list for MVP**: Skip Instagram for MVP (no URL-based sharing support). Include: Facebook, Twitter, WhatsApp, SMS.

2. ✅ **Share URL destination**: Homepage (e.g., `https://yourdomain.com`) — simplest for user acquisition.

3. ✅ **Attribution format**: `"[milestone text] - Calculated with [App] at https://yourdomain.com"`

4. ✅ **Character limit**: Enforce SMS limit (160 chars) globally to ensure compatibility across all platforms.

5. ✅ **Share icon**: 🔗 (link icon)

6. ✅ **Modal behavior**: Keep modal open after provider click (same as calendar export) — user can share to multiple platforms with same label.

## Next Steps

1. Create `SocialProvider` enum (mirror `CalendarProvider.ts`)
2. Create `ShareModal` component (mirror `CalendarExportModal.tsx`)
3. Add share icon to `MilestoneResults.tsx` milestone list items
4. Implement client-side share URL generation utility (mirror `calendarExport.ts`)
5. Add share text format constant to `constants.ts`
6. Wire up Toast feedback for share actions
