# S-05: Custom Milestone Values - Implementation Plan

## Overview

Enable **any user** (anonymous or logged-in) to add custom milestone values (e.g., 25,000 days, 420 hours, 2137 seconds) on-the-fly during calculation. Custom milestones are **session-only** (stored in React state, NOT Firebase), appear sorted alongside default power-of-10 milestones (nearest first), and are lost on page refresh. This increases celebration opportunities per the product hypothesis.

## Current State Analysis

**What exists:**
- ✅ Milestone calculation engine (S-01) - `DateCard`/`DateTimeCard` generate power-of-10 milestones via `CardBase.getEvents()`
- ✅ `MilestoneResults` component displays sorted milestones grouped by category
- ✅ `MilestoneCalculator` manages date input and calculation state
- ✅ Anonymous + logged-in users can calculate milestones
- ✅ Bootstrap 5.3.3 UI components and modals

**What's missing:**
- No UI to add custom milestone values (value + unit) during calculation
- No React state to store custom milestones for current session
- No logic to merge custom milestones with default power-of-10 milestones
- No visual distinction between custom and default milestones in results
- No validation for custom milestone values (min/max, duplicates within session)
- No way to remove individual custom milestones from current session

**Key constraints:**
- Custom milestones are **session-only** (React state, NOT Firebase)
- Available to **all users** (anonymous + logged-in)
- Lost on page refresh/navigation (user can re-add if needed)
- Must integrate seamlessly with existing calculation/display logic
- Must respect same filters: future-only, within life expectancy (~120 years)
- Must sort custom milestones alongside defaults (nearest first)
- No lodash (per `context/foundation/lessons.md`)

## Desired End State

### User Experience:

**Any user (anonymous or logged-in):**
1. Inputs date (e.g., wedding: 2020-06-15) in Calculator tab
2. Sees default milestones: 10 days, 100 days, 1K days, etc.
3. Clicks "Add Custom Milestone" button (below results or in header)
4. Modal prompts for: value (number, e.g., 420) + time unit (dropdown: days, hours, etc.)
5. Submits → custom milestone added to **React state** (session-only)
6. Results update immediately to show merged list:
   - Default power-of-10: `inputDate + 10 days`, `inputDate + 100 days`, etc.
   - Custom: `inputDate + 420 days`, `inputDate + 25000 hours`, etc.
   - All calculated at display time, sorted by proximity (nearest first)
7. Custom milestones visually distinguished (e.g., "Custom" badge + remove button)
8. Can remove individual custom milestones (click X icon → removed from state)
9. **Page refresh → all custom milestones lost** (user can re-add if needed)
10. Changing input date → all milestones (default + custom) recalculate automatically

**Session-only behavior:**
- Custom milestones stored in `MilestoneCalculator` component state
- Survive: date changes, switching between Calculator/Bookmarks tabs (if state lifted to App)
- Lost on: page refresh, closing browser, navigating away

### Data Model:

**NO Firebase storage** - Custom milestones live in React state only:

```typescript
// In MilestoneCalculator component state
const [customMilestones, setCustomMilestones] = useState<CustomMilestone[]>([]);

interface CustomMilestone {
  id: string;           // Local ID for React key (e.g., `${value}-${unit}`)
  value: number;        // e.g., 420, 25000 (the OFFSET, not a date)
  unit: string;         // "days", "hours", "seconds", etc.
}
```

**Critical: What gets stored vs. calculated**
- **Stored in React state:** value + unit (e.g., 420 days) - a **relative offset**
- **NOT stored:** The calculated milestone date
- **Calculation happens at display time:** Current input date + custom offset = milestone date
- Example: Input date `2020-06-15` + custom `420 days` = milestone date `2021-08-09`

**Validation:**
- Value: positive integer, min 1, max 1,000,000,000
- Unit: one of DateTimeUnit enum values
- No duplicate value+unit pairs in current session
- Compatible unit for input type (e.g., no hours/minutes/seconds if input is date-only)

### UI Structure:

```
MilestoneCalculator
├── DateTimeInput (existing)
├── Calculate button (existing)
├── "Add Custom Milestone" button (NEW)
│   └── Opens CustomMilestoneModal
└── MilestoneResults (UPDATED)
	└── Milestone items with:
		├── "Custom" badge for custom milestones (NEW)
		└── Remove button (X icon) for custom milestones (NEW)

CustomMilestoneModal (NEW)
├── Value input (number, 1-1,000,000,000)
├── Unit dropdown (years, months, weeks, days, hours*, minutes*, seconds*)
│   *Only if input date includes time
├── Submit button
└── Validation: positive integer, no duplicates, unit compatibility
```

### Calculation Flow:

**Current (S-01) - Default power-of-10 milestones:**
1. User inputs date: `2020-06-15`
2. `DateCard`/`DateTimeCard` → `CardBase.getEvents()` loops through `UnitsConfig`
3. For each unit (days, weeks, months...) and exponent (10, 100, 1K, 10K...):
   - Calculate: `inputDate + exponent [unit]` = milestone date
   - Example: `2020-06-15 + 10000 days` = `2047-10-01`
4. Return array of `Milestone` objects with calculated dates

**New (S-05) - Merging custom milestones:**
1. User inputs date `2020-06-15` and adds custom milestone `420 days` (stored in state)
2. On recalculation (date change or custom milestone added):
   - Fetch custom milestones from component state: `[{id: "420-days", value: 420, unit: "days"}]`
   - Pass to `DateCard`/`DateTimeCard` constructor
3. `CardBase.getEvents(customMilestones)`:
   - Generate default milestones (existing logic): `inputDate + 10 days`, `inputDate + 100 days`, etc.
   - Generate custom milestones (NEW logic): `inputDate + 420 days` = `2021-08-09`
   - Each custom milestone creates a `Milestone` object with `isCustom: true`
4. Merge arrays → filter (future-only, life expectancy) → sort by date (nearest first)
5. Return combined list to `MilestoneResults`

**Key insight:** Custom milestones are **session-only offsets** (value + unit), NOT persisted. Calculation happens at display time, so changing input date automatically recalculates all custom milestones.

### Verification:

**Automated:**
- `npm run build` succeeds
- `npm run lint` passes
- TypeScript compilation passes
- No console errors

**Manual:**
- Any user (anonymous or logged-in) sees "Add Custom Milestone" button after calculating
- Modal validates input (positive integer, no duplicates, unit compatibility)
- Custom milestone added to results immediately (no page refresh needed)
- Custom milestones visually distinguished ("Custom" badge + remove button)
- Removing custom milestone updates results immediately
- Custom milestones merge with defaults, sorted by proximity
- Custom milestones respect same filters (future-only, life expectancy)
- Changing input date recalculates all milestones (default + custom)
- **Page refresh clears all custom milestones** (session-only behavior confirmed)
- Unit dropdown filtered based on input type (date-only vs. date+time)

## What We're NOT Doing

- **Persisting custom milestones to Firebase** - Session-only, lost on refresh (per PRD design)
- **Authentication requirement** - Available to all users (anonymous + logged-in)
- **Per-bookmark custom milestones** - Session state is independent of bookmarks
- **Real-time sync across devices** - No persistence = no sync
- Storing calculated milestone dates (we store value+unit offsets only)
- Editing custom milestone values (delete + re-add is sufficient for MVP)
- Bulk add/delete custom milestones
- Custom milestone templates or presets (e.g., "Popular custom milestones")
- Importing custom milestones from external sources
- Custom milestone history or analytics
- Smart unit suggestions based on date age (e.g., auto-hide seconds for old dates)
- Custom milestone preview before adding (live results update is sufficient)
- Undo delete for custom milestones (just re-add if needed)

## Implementation Approach

### Phase 1: Custom Milestone State & Type
**Outcome:** MilestoneCalculator manages custom milestones in React state

**Changes:**
- Create TypeScript interface `CustomMilestone`:
  ```typescript
  interface CustomMilestone {
	id: string;           // Local ID: `${value}-${unit}` for React key + removal
	value: number;        // Offset value (e.g., 420)
	unit: string;         // Time unit from DateTimeUnit enum (e.g., "days")
  }
  ```
- Add state to `MilestoneCalculator`:
  ```typescript
  const [customMilestones, setCustomMilestones] = useState<CustomMilestone[]>([]);
  const [hasTimeInput, setHasTimeInput] = useState(false); // Track if time is provided
  ```
- Add helper functions in `MilestoneCalculator`:
  - `addCustomMilestone(value: number, unit: string): void` - Adds to state with ID=`${value}-${unit}`
  - `removeCustomMilestone(id: string): void` - Removes by ID from state
  - `isDuplicateCustomMilestone(value: number, unit: string): boolean` - Checks for ID collision
  - `clearCustomMilestones(): void` - Clears all custom milestones (called on reset)
- Update `handleCalculate` to track `hasTimeInput`:
  ```typescript
  const handleCalculate = useCallback((date, time?) => {
	setHasTimeInput(time !== undefined); // Track time presence
	// ... existing calculation logic
  }, [locale, customMilestones]); // Add customMilestones to deps
  ```
- Update `handleReset` to clear custom milestones:
  ```typescript
  const handleReset = () => {
	// ... existing reset logic
	setCustomMilestones([]);
	setHasTimeInput(false);
  };
  ```
- Update `src/utils/constants.ts` with validation constants:
  - `MIN_CUSTOM_MILESTONE_VALUE = 1`
  - `MAX_CUSTOM_MILESTONE_VALUE = 1000000000`

**File contracts:**
- `src/types/CustomMilestone.ts` (new) - TypeScript interface
- `src/components/MilestoneCalculator.tsx` - Add state + helper functions + update handleCalculate/handleReset
- `src/utils/constants.ts` - Add validation constants
- `src/utils/enums/DateTimeUnit.ts` (existing, verify) - Import for type checking

**Success criteria:**
- CustomMilestone interface compiles
- State initialized in MilestoneCalculator
- Helper functions typed correctly
- `hasTimeInput` tracked when calculation runs
- Custom milestones cleared on reset
- No build errors

**Manual gate:** Add console.log in helper functions, verify they're callable, test reset behavior

---

### Phase 2: Add Custom Milestone Modal
**Outcome:** User can add custom milestones via modal

**Changes:**
- Create `CustomMilestoneModal` component:
  - Props: `isOpen`, `onClose`, `onSubmit(value, unit)`, `existingCustomMilestones`, `hasTimeInput` (boolean)
  - Value input: number, min=1, max=1B, required
  - Unit dropdown: populated from DateTimeUnit enum (import from `src/utils/enums/DateTimeUnit.ts`)
	- If `hasTimeInput === false`: show Years, Months, Weeks, Days only
	- If `hasTimeInput === true`: show all units (Years...Seconds)
  - Real-time duplicate validation using `${value}-${unit}` ID format
  - Submit button: calls `onSubmit`, closes modal
  - Cancel button: closes modal without saving
  - Bootstrap modal styling with proper accessibility (focus trap, ESC close)
- Add "Add Custom Milestone" button to `MilestoneCalculator`:
  - Placement: below MilestoneResults or in a toolbar above results
  - Only visible when `events !== null` (after calculation)
  - Opens `CustomMilestoneModal`
  - Passes: `customMilestones`, `hasTimeInput`, submit handler
- Wire modal submit to `addCustomMilestone()` helper, trigger recalculation

**File contracts:**
- `src/components/modals/CustomMilestoneModal.tsx` (new) - Modal component
- `src/components/MilestoneCalculator.tsx` - Add button + modal integration + state management
- `src/utils/enums/DateTimeUnit.ts` (existing) - Import for dropdown options

**Success criteria:**
- "Add Custom Milestone" button visible after calculation
- Modal opens with value input + unit dropdown
- Unit dropdown filtered based on `hasTimeInput` (date vs. datetime)
- Validation prevents: negative values, values >1B, duplicate ID (`${value}-${unit}`)
- Submit adds custom milestone to state (verify in React DevTools)
- Modal closes on submit
- Results recalculate automatically after adding custom milestone
- Inline validation error messages

**Manual gate:** 
1. Calculate date-only, open modal, verify units = Years/Months/Weeks/Days only
2. Calculate date+time, open modal, verify all units visible
3. Add "420 days", verify it's in state
4. Try to add "420 days" again, verify duplicate error

---

### Phase 3: Merge Custom Milestones in Calculation
**Outcome:** Calculator displays merged default + custom milestones

**Changes:**
- Update `Milestone` class:
  - Add optional constructor parameter: `isCustom?: boolean, customId?: string`
  - Add instance fields: `this.isCustom = isCustom ?? false; this.customId = customId`
  - Store custom milestone ID for removal later
- Update `CardBase.getEvents()`:
  - Add optional parameter: `customMilestones?: CustomMilestone[]`
  - After generating default milestones (existing logic):
	- Loop through `customMilestones` if provided
	- For each: calculate `base.add({ [cm.unit]: cm.value })`
	- Create `Milestone` instance with `isCustom: true, customId: cm.id`
	- Push to events array
  - Continue with existing filter + sort logic
- Update `DateCard` constructor:
  - Add optional parameter: `customMilestones?: CustomMilestone[]`
  - Pass to `this.events = this.getEvents(customMilestones)` (note: getEvents is called in constructor currently)
- Update `DateTimeCard` constructor:
  - Add optional parameter: `customMilestones?: CustomMilestone[]`
  - Pass to `this.events = this.getEvents(customMilestones)`
- Update `MilestoneCalculator.handleCalculate()`:
  - When creating `DateCard`/`DateTimeCard`, pass `customMilestones` from state
  - Add `customMilestones` to `useCallback` dependency array to trigger recalculation

**Critical implementation notes:**
- Custom milestones stored as `{id: "420-days", value: 420, unit: "days"}` in state
- Calculation at display time: `inputDate + customMilestone.value [customMilestone.unit]`
- Example: input date `2020-06-15` + custom `{value: 420, unit: "days"}` = milestone `2021-08-09`
- Changing input date automatically recalculates all custom milestones (no stale dates)
- Custom milestone ID stored in Milestone object for safe removal (no label parsing needed)

**File contracts:**
- `src/utils/classes/Milestone.ts` - Add `isCustom` and `customId` fields + constructor parameters
- `src/utils/classes/CardBase.ts` - Extend `getEvents()` to merge custom milestones
- `src/utils/classes/DateCard.ts` - Update constructor signature
- `src/utils/classes/DateTimeCard.ts` - Update constructor signature
- `src/components/MilestoneCalculator.tsx` - Pass custom milestones to card constructors, add to useCallback deps
- `src/types/CustomMilestone.ts` (from Phase 1) - Import in CardBase

**Success criteria:**
- Calculator displays merged milestones (default + custom)
- Custom milestones calculated as `inputDate + value [unit]` at display time
- Custom milestones sorted alongside defaults (nearest first)
- Custom milestones respect same filters (future-only, life expectancy)
- `isCustom` field correctly set (false for defaults, true for custom)
- `customId` field populated for custom milestones only
- Changing input date recalculates custom milestones
- Adding/removing custom milestone triggers recalculation

**Manual gate:** 
1. Add custom milestone `{value: 420, unit: "days"}` for input date `2020-06-15`
2. Verify milestone appears with calculated date `2021-08-09`
3. Change input date to `2020-01-01`, verify custom milestone recalculates to `2021-02-25`
4. Check React DevTools: Milestone objects have `isCustom: true` and `customId: "420-days"`

---

### Phase 4: Visual Distinction & Remove Button
**Outcome:** Custom milestones visually distinguished with remove functionality

**Changes:**
- Update `MilestoneResults` component:
  - Check `milestone.isCustom` field for each milestone
  - If true, render:
	- "Custom" badge (Bootstrap `badge bg-info` or `bg-secondary`)
	- Remove button (X icon, e.g., `×` or trash icon)
  - Remove button onClick: calls `onRemoveCustomMilestone(milestone.customId)` passed from parent
- Update `MilestoneCalculator`:
  - Add `handleRemoveCustomMilestone(customId: string)` function
	- Calls `removeCustomMilestone(customId)` (from Phase 1)
	- Recalculation happens automatically via `useCallback` dependency
  - Pass handler to `MilestoneResults` as prop `onRemoveCustomMilestone`
- Add prop interface to `MilestoneResults`:
  ```typescript
  interface MilestoneResultsProps {
	events: Milestone[];
	locale: string;
	originalDate: Temporal.PlainDate | Temporal.PlainDateTime | null;
	onRemoveCustomMilestone?: (customId: string) => void; // NEW
  }
  ```
- Style considerations:
  - Badge should be inline with label (e.g., "+ 420 days **[Custom]**")
  - Remove button should be visually distinct from calendar export icon
  - Only show remove button on hover (or always visible on mobile)

**File contracts:**
- `src/components/MilestoneResults.tsx` - Add badge + remove button for custom milestones, accept callback prop
- `src/components/MilestoneCalculator.tsx` - Add remove handler, pass to MilestoneResults

**Success criteria:**
- Custom milestones display "Custom" badge (e.g., blue or gray)
- Remove button (X icon) visible on custom milestones only
- Clicking remove button removes custom milestone from state
- Results update immediately (removed milestone disappears)
- Default milestones have no badge or remove button
- Badge accessible (aria-label if needed)
- Remove button accessible (aria-label, keyboard support)

**Manual gate:** 
1. Add 3 custom milestones (420 days, 1000 hours, 25000 days)
2. Verify each shows "Custom" badge
3. Verify remove button (X) on each custom milestone
4. Click remove on "1000 hours", verify it disappears
5. Verify default milestones have no badge or remove button

---

### Phase 5: Unit Compatibility Validation
**Outcome:** Modal prevents incompatible units based on input type

**Changes:**
- Update `MilestoneCalculator`:
  - `hasTimeInput` state already tracked in Phase 1 via `handleCalculate`
  - Pass `hasTimeInput` to `CustomMilestoneModal` as prop
- Update `CustomMilestoneModal`:
  - Accept `hasTimeInput: boolean` prop
  - Filter unit dropdown options based on `hasTimeInput`:
	- If `false`: show DateTimeUnit.Years, Months, Weeks, Days only
	- If `true`: show all DateTimeUnit values
  - Add helper text: "Time-based units (hours, minutes, seconds) require a time input"
  - Validation is implicit (filtered units can't be selected)

**File contracts:**
- `src/components/MilestoneCalculator.tsx` - Pass `hasTimeInput` to modal (already tracking from Phase 1)
- `src/components/modals/CustomMilestoneModal.tsx` - Filter units, add helper text

**Success criteria:**
- Date-only input: unit dropdown shows Years, Months, Weeks, Days only
- Date+time input: unit dropdown shows all units (Years...Seconds)
- Helper text visible explaining unit requirements
- Modal cannot submit with incompatible unit (filtered out)

**Manual gate:** 
1. Calculate with date-only (e.g., 2020-06-15), open modal
2. Verify unit dropdown = [Years, Months, Weeks, Days] only
3. Add time (e.g., 14:00), recalculate, open modal
4. Verify unit dropdown = [Years, Months, Weeks, Days, Hours, Minutes, Seconds]
5. Verify helper text present

---

## Progress

| Phase | Status | Commits | Notes |
|-------|--------|---------|-------|
| Phase 1: Custom Milestone State & Type | ✅ completed | c29892d | React state + TypeScript interface. Build passing. Lint warning expected (customMilestones dep used in Phase 3). |
| Phase 2: Add Custom Milestone Modal | ✅ completed | 6141fa9 | Modal + validation + button. Units filtered by hasTimeInput. Toast notifications. Build passing. |
| Phase 3: Merge Custom Milestones in Calculation | pending | | Update CardBase, Milestone class |
| Phase 4: Visual Distinction & Remove Button | pending | | Badge + remove functionality |
| Phase 5: Unit Compatibility Validation | pending | | Filter units by input type |

## Risk Assessment

**Technical risks:**
1. **React state persistence** - Custom milestones lost on page refresh (expected behavior)
   - Mitigation: Clear UX messaging that custom milestones are session-only
   - Future enhancement: Add "Save custom milestones" feature (requires bookmarks)
2. **Merging algorithm complexity** - Combining default + custom milestones while maintaining sort order
   - Mitigation: Reuse existing sort logic from `CardBase`, test with edge cases
3. **Unit compatibility** - User tries to add hours/minutes/seconds for date-only input
   - Mitigation: Filter unit dropdown based on input type, validation in modal

**Product risks:**
1. **User confusion** - Users expect custom milestones to persist after refresh
   - Mitigation: Add tooltip/help text: "Custom milestones are session-only and will reset on page refresh"
   - Future enhancement: "Save custom milestones" button (requires login + bookmark)
2. **UI complexity** - Adding custom milestones increases cognitive load
   - Mitigation: Keep UI minimal (badge + remove button only), no separate "manage" panel
3. **Empty state** - User adds custom milestone but doesn't see it in results (if date is in past or beyond life expectancy)
   - Mitigation: Add validation warning in modal if computed milestone would be filtered out

**Open questions:**
1. Should duplicate value+unit pairs be allowed in the same session?
   - Recommendation: Prevent duplicates via validation
2. Should custom milestones survive tab switching (Calculator ↔ Bookmarks)?
   - Recommendation: Yes, lift state to App.tsx if needed
3. Should there be a "Clear all custom milestones" button?
   - Recommendation: Not needed for MVP (user can remove individually or refresh page)
4. Should we show a count of custom milestones currently added?
   - Recommendation: Nice-to-have, add if Phase 4 has time budget

## Notes

- This change unlocks FR-006 and US-06 from PRD
- **Session-only design** per PRD Open Question #5: starting with on-the-fly custom values, persistence could be added later as enhancement
- Available to **all users** (anonymous + logged-in) - no auth requirement
- Custom milestones stored as value+unit **offsets in React state**, calculated at display time
- No Firebase storage = simpler implementation, faster MVP delivery
- Future enhancement path: "Save custom milestones" button (requires login + associates with bookmark)
- Calendar export (S-03) should work with custom milestones (label format already dynamic)
- Changing input date automatically recalculates all custom milestones (no stale dates)
