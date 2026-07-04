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
