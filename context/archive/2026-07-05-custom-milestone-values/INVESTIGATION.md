# S-05 Codebase Investigation Report

**Date:** 2026-07-04  
**Change ID:** custom-milestone-values

## Investigation Summary

Investigated codebase to verify plan assumptions and identify implementation details for custom milestone feature (session-only, all users).

---

## Findings

### ✅ 1. DateTimeUnit Enum - CONFIRMED

**Location:** `src/utils/enums/DateTimeUnit.ts`

**Values:**

```typescript
export enum DateTimeUnit {
  Seconds = "seconds",
  Minutes = "minutes",
  Hours = "hours",
  Days = "days",
  Weeks = "weeks",
  Months = "months",
  Years = "years",
}
```

**Impact:** Can be imported directly for unit dropdown in CustomMilestoneModal. Already used in UnitsConfig.

**Plan Update:** Added file contract to Phase 2, explicit import reference.

---

### ⚠️ 2. Input Type Tracking - NEEDS NEW STATE

**Current:** `DateTimeInput` calls `onCalculate(date, time?)` where `time` is optional.

**Issue:** `MilestoneCalculator` doesn't currently track whether time is present.

**Solution:** Track in state via `handleCalculate` callback:

```typescript
const [hasTimeInput, setHasTimeInput] = useState(false);
const handleCalculate = useCallback(
  (date, time?) => {
    setHasTimeInput(time !== undefined); // NEW
    // ... existing logic
  },
  [locale, customMilestones]
);
```

**Impact:** Required for Phase 5 unit filtering.

**Plan Update:** Added `hasTimeInput` state to Phase 1, updated `handleCalculate` logic.

---

### ⚠️ 3. Milestone Class - NEEDS MODIFICATION

**Current Constructor:**

```typescript
constructor(
  date: Temporal.PlainDate | Temporal.PlainDateTime,
  unit: string,
  exponent: number,
  locale: string,
  now?: Temporal.PlainDateTime
)
```

**Current Fields:** `date`, `dateString`, `label`, `category`

**Missing:** `isCustom` field, custom milestone ID

**Solution:** Add optional parameters + fields:

```typescript
constructor(
  date, unit, exponent, locale, now?,
  isCustom?: boolean,      // NEW
  customId?: string        // NEW - for safe removal
)
{
  // ... existing logic
  this.isCustom = isCustom ?? false;
  this.customId = customId;
}
```

**Impact:** Required for Phase 3 (calculation) and Phase 4 (remove button).

**Plan Update:** Updated Phase 3 to add both `isCustom` and `customId` fields.

---

### ✅ 4. Remove Button Logic - SOLVED

**Original Plan Issue:** Parse label "10,000 days" → value=10000, unit="days" (locale-dependent)

**Problem Examples:**

- English: "10,000 days"
- German: "10.000 days"
- French: "10 000 days"

**Solution:** Store custom milestone ID in Milestone object:

```typescript
// In CardBase.getEvents()
for (const cm of customMilestones) {
  // ...
  const milestone = new Milestone(
    calculatedDate,
    cm.unit,
    cm.value,
    locale,
    undefined,
    true,
    cm.id // isCustom=true, customId=cm.id
  );
}
```

**Removal:**

```typescript
// In MilestoneCalculator
const handleRemoveCustomMilestone = (customId: string) => {
  removeCustomMilestone(customId); // Direct ID lookup, no parsing!
};
```

**Impact:** Safe, locale-independent removal.

**Plan Update:** Phase 3 stores `customId`, Phase 4 removes by ID (not label parsing).

---

### ✅ 5. Recalculation Pattern - CLEAR

**Current Pattern:**

```typescript
const handleCalculate = useCallback(
  (date, time?) => {
    // ... create DateCard/DateTimeCard
    setEvents(calculatedEvents);
  },
  [locale]
); // Dependencies
```

**Solution for Custom Milestones:**

```typescript
const handleCalculate = useCallback(
  (date, time?) => {
    // ... pass customMilestones to DateCard/DateTimeCard
    const card = new DateCard(date, locale, customMilestones); // NEW param
    setEvents(card.events);
  },
  [locale, customMilestones]
); // Add customMilestones to deps
```

**Impact:** Changing `customMilestones` state triggers automatic recalculation.

**Plan Update:** Phase 1 includes adding `customMilestones` to `useCallback` deps.

---

### ✅ 6. Reset Behavior - DECISION MADE

**Question:** Should custom milestones clear on reset button?

**Current Reset:**

```typescript
const handleReset = () => {
  setEvents(null);
  setOriginalDate(null);
  setInputDateStr(null);
  setInputTimeStr(null);
};
```

**Decision:** YES - custom milestones are tied to calculation lifecycle.

**Solution:**

```typescript
const handleReset = () => {
  // ... existing logic
  setCustomMilestones([]); // NEW
  setHasTimeInput(false); // NEW
};
```

**Impact:** Clearing input clears everything (consistent UX).

**Plan Update:** Phase 1 includes updating `handleReset` to clear custom milestones.

---

## Plan Changes Made

### Phase 1: Custom Milestone State & Type

- ✅ Added `hasTimeInput` state tracking
- ✅ Updated `handleCalculate` to set `hasTimeInput`
- ✅ Updated `handleReset` to clear custom milestones
- ✅ Added `customMilestones` to `useCallback` dependencies

### Phase 2: Add Custom Milestone Modal

- ✅ Prop renamed: `inputType` → `hasTimeInput` (boolean)
- ✅ Added file contract for `DateTimeUnit.ts` import
- ✅ Clarified unit filtering logic

### Phase 3: Merge Custom Milestones in Calculation

- ✅ Added `customId` field to Milestone class
- ✅ Store custom milestone ID in Milestone objects
- ✅ Explicit import of `CustomMilestone` type in CardBase

### Phase 4: Visual Distinction & Remove Button

- ✅ Remove by `customId` (not label parsing)
- ✅ Handler signature: `onRemoveCustomMilestone(customId: string)`
- ✅ Added prop interface documentation

### Phase 5: Unit Compatibility Validation

- ✅ Simplified: `hasTimeInput` already tracked in Phase 1
- ✅ No changes needed to `DateTimeInput` (already provides time via callback)

---

## File Audit

| File                                             | Exists | Needs Changes | Phase                             |
| ------------------------------------------------ | ------ | ------------- | --------------------------------- |
| `src/utils/enums/DateTimeUnit.ts`                | ✅ Yes | ❌ No         | Import only                       |
| `src/components/DateTimeInput.tsx`               | ✅ Yes | ❌ No         | Already exposes time via callback |
| `src/components/MilestoneCalculator.tsx`         | ✅ Yes | ✅ Yes        | Phases 1, 2, 4                    |
| `src/utils/classes/Milestone.ts`                 | ✅ Yes | ✅ Yes        | Phase 3                           |
| `src/utils/classes/CardBase.ts`                  | ✅ Yes | ✅ Yes        | Phase 3                           |
| `src/utils/classes/DateCard.ts`                  | ✅ Yes | ✅ Yes        | Phase 3                           |
| `src/utils/classes/DateTimeCard.ts`              | ✅ Yes | ✅ Yes        | Phase 3                           |
| `src/components/MilestoneResults.tsx`            | ✅ Yes | ✅ Yes        | Phase 4                           |
| `src/types/CustomMilestone.ts`                   | ❌ No  | ✅ Create     | Phase 1                           |
| `src/components/modals/CustomMilestoneModal.tsx` | ❌ No  | ✅ Create     | Phase 2                           |
| `src/utils/constants.ts`                         | ✅ Yes | ✅ Yes        | Phase 1                           |

---

## Risks Mitigated

1. ✅ **Label parsing locale issue** - Solved by storing `customId` in Milestone
2. ✅ **Input type tracking** - Solved by adding `hasTimeInput` state
3. ✅ **Recalculation trigger** - Solved by `useCallback` dependencies
4. ✅ **Reset behavior** - Clarified: custom milestones clear on reset
5. ✅ **DateTimeUnit availability** - Confirmed exists, can import

---

## Ready for Implementation

✅ All plan issues resolved  
✅ File contracts verified  
✅ Implementation patterns clear  
✅ No blocking unknowns

**Recommendation:** Proceed to `/10x-implement custom-milestone-values phase 1`
