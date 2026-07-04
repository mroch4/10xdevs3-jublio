# Lessons Learned

> Append-only register of recurring rules and patterns. Re-read at start by /10x-frame, /10x-research, /10x-plan, /10x-plan-review, /10x-implement, /10x-impl-review.

## Don't add lodash without explicit justification

- **Context**: Implementation of functions in TypeScript application on frontend and backend.
- **Problem**: Agent used `_.filter()` even though lodash is not part of the project. This would add an unnecessary dependency and violate the local convention of working with native APIs.
- **Rule**: Never add lodash without a clear indication. The project prefers native JS/TS functions in the 2026+ standard.
- **Applies to**: plan, implement, impl-review

## Maintain consistent styling for same HTML elements across components

- **Context**: Form inputs for the same data type (e.g., event labels) across different components (CalendarExportModal, BookmarkModal, etc.).
- **Problem**: Inconsistent styling breaks user experience - different placeholders, label formats (e.g., "Label *" vs "Label (required)"), missing bold (`fw-bold`), or different CSS classes for the same input type reduce UI coherence.
- **Rule**: When creating new form inputs, check existing components for the same data type and reuse:
  - **CSS classes**: e.g., `form-label fw-bold` for labels, `form-control` for inputs
  - **Placeholders**: Use the same examples (e.g., `"e.g., Wedding, Quit Smoking, Company Launch"` for event labels)
  - **Label format**: Use consistent pattern (e.g., "Label (required)" not "Label *")
  - **Character counters**: Same format and position (e.g., `{count}/{limit} characters`)
- **Applies to**: implement, impl-review

## Use consistent terminology throughout the app

- **Context**: Authentication and user actions across UI components (buttons, messages, tooltips, etc.).
- **Problem**: Mixing "Sign In" / "Sign Out" with "Log in" / "Log out" creates inconsistent UX and looks unprofessional (e.g., "Sign In" button but "Log in to view your portfolio" message).
- **Rule**: Use **"Sign In" / "Sign Out"** consistently everywhere:
  - Buttons: "Sign In", "Sign Out"
  - Modal titles: "Sign In"
  - Messages: "Sign in to view..." (lowercase mid-sentence)
  - Never mix with "Log in" / "Log out"
- **Applies to**: implement, impl-review

## Always use enums for string constants to prevent typos

- **Context**: String literals used throughout the codebase for states, tabs, types, identifiers, etc.
- **Problem**: String literals like `"calculator"`, `"portfolio"`, `"month"` are prone to typos (`"calculatro"`, `"monht"`) that TypeScript won't catch, leading to runtime bugs.
- **Rule**: 
  - Create enums in dedicated files (e.g., `src/types/enums.ts` or `src/enums/`) for any string constants that:
    - Appear in multiple places
    - Have a fixed set of valid values
    - Could cause bugs if misspelled
  - Examples: tab names, states, units, action types, collection names
  - **Pattern**: One enum per file for easy imports and maintainability
  - **Benefit**: TypeScript autocomplete + compile-time validation prevents typos
- **Applies to**: plan, implement, impl-review

## Keep button text simple and extract magic numbers to constants

- **Context**: Action buttons in modals and forms (e.g., "Save Bookmark", "Update Bookmark"), and hardcoded limits like character lengths scattered across components.
- **Problem**: 
  - Verbose button text ("Save Bookmark" instead of "Save") adds visual noise and inconsistency.
  - Magic numbers like `50` for max label length appear in multiple places, making updates error-prone and harder to maintain.
- **Rule**: 
  - **Button text**: Use simple, single-word or two-word labels: "Save", "Update", "Delete", "Cancel" (not "Save Bookmark", "Update Bookmark", etc.)
  - **Constants**: Extract all magic numbers and repeated limits to a constants file (e.g., `src/utils/constants.ts`):
    - Example: `export const MAX_LABEL_LENGTH = 50;`
    - Import and use the constant everywhere instead of hardcoding values
  - **Benefit**: Consistent UX, single source of truth for limits, easier global changes
- **Applies to**: implement, impl-review

## All modals must close on ESC key

- **Context**: Modal dialogs throughout the application (BookmarkModal, BookmarkEditModal, DeleteConfirmationModal, AuthModal, CalendarExportModal, etc.).
- **Problem**: Inconsistent keyboard behavior across modals - some close on ESC, others don't. Users expect ESC to close any modal, following standard UX conventions.
- **Rule**: Every modal component must use the `useEscapeKey` custom hook:
  ```typescript
  import { useEscapeKey } from "../../hooks/useEscapeKey";

  // In your modal component:
  const handleClose = useCallback(() => {
    // cleanup logic
    onClose();
  }, [onClose]);

  useEscapeKey(handleClose, isOpen, loading);
  ```
  - **Parameters:**
    - `onClose`: Callback to close the modal (wrap in `useCallback`)
    - `isOpen`: Boolean indicating if modal is open
    - `isBlocked`: (optional) Boolean to block ESC, typically `loading` state
  - **Benefits:**
    - DRY principle - single implementation of ESC handling
    - Consistent behavior across all modals
    - Proper dependency management handled in one place
- **Applies to**: implement, impl-review

## Modals must trap focus and return focus to trigger element

- **Context**: Modal dialogs where keyboard users navigate with Tab key.
- **Problem**: Without focus trapping, Tab can move focus outside the modal to background elements, confusing keyboard and screen reader users. When modal closes, focus is lost and user doesn't know where they are in the page.
- **Rule**: Every modal component must use the `useFocusTrap` custom hook:
  ```typescript
  import { useFocusTrap } from "../../hooks/useFocusTrap";

  // In your modal component:
  const modalRef = useFocusTrap(isOpen);

  // Attach ref to modal root element:
  <div className="modal" ref={modalRef}>
  ```
  - **Behavior:**
    - When modal opens: stores reference to element that opened it
    - Tab key: cycles through focusable elements within modal only
    - Shift+Tab: reverse cycle, wraps from first to last element
    - When modal closes: returns focus to the trigger element (e.g., edit icon)
  - **Benefits:**
    - WCAG 2.1 AA compliance for keyboard accessibility
    - Screen reader users stay oriented within modal content
    - Closing modal returns user to their previous context
    - Works seamlessly with `useEscapeKey` hook
- **Applies to**: implement, impl-review

## Disable submit buttons in edit modals until changes are made

- **Context**: Edit/update modal forms where users can modify existing data (e.g., BookmarkEditModal editing saved bookmarks).
- **Problem**: Users can click "Update" without making any changes, triggering unnecessary Firestore writes and potentially confusing the user about whether something was updated.
- **Rule**: Track original values and disable the submit button until at least one field changes:
  - Store original values in separate state variables (e.g., `originalLabel`, `originalDateValue`, `originalTimeValue`)
  - Initialize these values when the modal opens or data loads
  - Compute a `hasChanges` boolean by comparing current form values to originals
  - Add `!hasChanges` to the submit button's disabled condition: `disabled={loading || !hasChanges}`
  - Re-enable the button as soon as any field differs from the original
- **Benefit**: Prevents no-op updates, clearer user feedback, reduced Firestore writes
- **Applies to**: implement, impl-review

