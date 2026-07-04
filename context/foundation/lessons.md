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
