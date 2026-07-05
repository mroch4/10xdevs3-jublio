# S-05: Custom Milestone Values - Brief

**Change ID:** custom-milestone-values  
**Roadmap:** S-05  
**Prerequisites:** S-01 (calculate-milestones) ✅  

## Goal

Enable **any user** (anonymous or logged-in) to add custom milestone values (e.g., 420 days, 25,000 hours) on-the-fly during calculation. Custom milestones stored in **React state only** (session-only, NOT Firebase), calculated at display time as `inputDate + value [unit]`, then merged with default power-of-10 milestones and sorted by proximity. Lost on page refresh.

## Approach

5 phases: (1) React state + TypeScript type in MilestoneCalculator, (2) Add custom milestone modal + validation, (3) Merge custom milestones in calculation engine (calculate `inputDate + value [unit]` at display time, extend CardBase.getEvents()), (4) Visual distinction (badge) + remove button, (5) Unit compatibility validation (filter by input type).

## Key Files

- `src/types/CustomMilestone.ts` - NEW interface (id, value, unit)
- `src/components/MilestoneCalculator.tsx` - React state for custom milestones, helper functions, modal integration
- `src/components/modals/CustomMilestoneModal.tsx` - NEW add modal with validation
- `src/utils/classes/CardBase.ts` - Merge logic for custom milestones
- `src/utils/classes/Milestone.ts` - Add `isCustom` field
- `src/utils/classes/DateCard.ts` - Update constructor to accept custom milestones
- `src/utils/classes/DateTimeCard.ts` - Update constructor to accept custom milestones
- `src/components/MilestoneResults.tsx` - Display "Custom" badge + remove button
- `src/utils/constants.ts` - Add min/max validation constants

## Phases

1. **Custom Milestone State & Type** - React state in MilestoneCalculator, TypeScript interface, helper functions
2. **Add Custom Milestone Modal** - Modal with validation, button to open, wire submit handler
3. **Merge Custom Milestones in Calculation** - Calculate `inputDate + value [unit]` at display time, extend CardBase.getEvents(), update Milestone class with `isCustom` field
4. **Visual Distinction & Remove Button** - "Custom" badge + X button in MilestoneResults
5. **Unit Compatibility Validation** - Filter unit dropdown based on input type (date vs. datetime)

## Success Criteria

- Any user (anonymous or logged-in) can add custom milestones
- Custom milestones merge with defaults, sorted by proximity
- "Custom" badge + remove button distinguish custom milestones
- Session-only: lost on page refresh (no Firebase persistence)
- Validation: positive integers, no duplicates, unit compatibility
- Changing input date recalculates all custom milestones

## Risks

- User confusion about session-only behavior (add UX messaging)
- React state lost on refresh (expected, could add "Save" feature later)
- Unit compatibility (filter dropdown by input type)
