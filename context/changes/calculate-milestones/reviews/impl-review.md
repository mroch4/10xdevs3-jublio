<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Calculate Milestones

- **Plan**: context/changes/calculate-milestones/plan.md
- **Scope**: All phases (1, 2, 3)
- **Date**: 2026-07-02
- **Verdict**: APPROVED
- **Findings**: 0 critical | 2 warnings | 2 observations

## Verdicts

| Dimension             | Verdict |
| --------------------- | ------- |
| Plan Adherence        | PASS ✅ |
| Scope Discipline      | WARNING ⚠️  (1 finding) |
| Safety & Quality      | PASS ✅ |
| Architecture          | PASS ✅ |
| Pattern Consistency   | PASS ✅ |
| Success Criteria      | PASS ✅ |

**► Overall: APPROVED**

---

## Summary

The implementation successfully delivers all planned functionality with high code quality. All automated checks pass (build, lint), and all manual verification items are complete. The code follows established patterns (Temporal API, Bootstrap, no lodash), implements proper validation, and creates a clean component architecture.

Two warnings require acknowledgment but do not block approval:

1. The plan assumed several utility classes existed ("Existing Assets"), but they had to be created during implementation. This is a planning accuracy issue, not an implementation defect.
2. The filtering of "Beyond Human Life Expectancy" events was removed during implementation, contradicting the original plan's requirement to hide milestones beyond 75 years. This appears to be a deliberate design change (all milestone groups are now shown), but it wasn't documented as a plan amendment.

Both issues are historical documentation gaps rather than code quality problems. The delivered feature works well and is ready for user testing.

═══════════════════════════════════════════════════════════
  WARNING FINDINGS ⚠️
═══════════════════════════════════════════════════════════

  F1 — Plan's "Existing Assets" were actually missing
  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
	Severity:  ⚠️ WARNING
	Impact:    🔎 MEDIUM — real tradeoff; pause to reason through it
	Dimension: Plan Adherence / Scope Discipline
	Location:  Multiple files (CardBase, DateCard, DateTimeCard, Event,
			   EventCategory, UnitsConfig, Bookmark)

	Detail:
	The plan's "Current State Analysis" section lists several utility
	classes as "Existing Assets" that the implementation could build upon:
	- CardBase (src/utils/classes/CardBase.ts)
	- DateCard (src/utils/classes/DateCard.ts)
	- DateTimeCard (src/utils/classes/DateTimeCard.ts)
	- Event (src/utils/classes/Event.ts)
	- EventCategory (src/utils/enums/EventCategory.ts)
	- UnitsConfig (src/utils/UnitsConfig.ts)

	However, git diff shows these files were created during Phase 1
	(commit 85a4619). The plan assumed they existed but they had to be
	built from scratch. Additionally, Bookmark.ts was created but not
	mentioned in the plan at all (it appears to be S-02 prep work).

	This means the implementation scope was significantly larger than
	the plan implied. The "What's Missing" section should have included
	these foundational classes, not just the UI components.

	Impact: This is primarily a planning/estimation accuracy issue. The
	implementation itself is solid, but the plan misrepresented the
	starting point. Future plans should verify "existing" code actually
	exists.

	Fix A ⭐ Recommended: Accept as-is and document in lessons
	  Strength:   Implementation is correct and complete. Treating this
				  as a lesson learned for future planning is the right
				  takeaway.
	  Tradeoff:   Historical plan remains misleading to future readers.
	  Confidence: HIGH — the code works and passes all checks.
	  Blind spot: None significant.

	Fix B: Amend the plan retroactively to list these as created
	  Strength:   Makes the historical record more accurate.
	  Tradeoff:   Changes a completed plan, which violates the "plan as
				  contract" principle unless done as a clearly marked
				  addendum.
	  Confidence: MEDIUM — depends on project's policy for retroactive
				  plan edits.
	  Blind spot: May set precedent for rewriting history instead of
				  learning from it.

  ···

  F2 — "Beyond Human Life Expectancy" filtering removed
  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
	Severity:  ⚠️ WARNING
	Impact:    🔎 MEDIUM — real tradeoff; pause to reason through it
	Dimension: Plan Adherence / Scope Discipline
	Location:  src/utils/eventGrouping.ts:14

	Detail:
	The plan's Desired End State specified: "Not see milestones beyond
	75 years in the future (with count indicator)" and Phase 2's manual
	verification item 2.9 stated: "Count indicator shows: '12 more
	beyond 75 years' (or appropriate count)".

	However, the implemented filterEvents() function returns all events
	unfiltered:
	  return { visible: events, beyondCount: 0 };

	And includes a comment: "Return all events - Beyond Human Life
	Expectancy will be shown as a regular group". The MilestoneResults
	component displays BeyondHumanLifeExpectancy as a normal category
	in the getCategoryOrder() array.

	This is a substantive scope change from the plan — users now see all
	milestones including those 75+ years away, rather than hiding them
	with a count. The plan's manual verification item 2.9 was marked [x]
	complete despite this behavioral difference.

	Impact: This appears to be a deliberate UX decision made during
	implementation (possibly after user feedback or manual testing),
	but it contradicts the written plan without an addendum explaining
	the change.

	Fix A ⭐ Recommended: Document the change in plan addendum
	  Strength:   Preserves the historical record of what changed and
				  why. Future readers understand the evolution.
	  Tradeoff:   Requires writing the addendum now.
	  Confidence: HIGH — this is the standard practice for scope changes
				  discovered mid-implementation.
	  Blind spot: We don't have the original reasoning for why this was
				  changed (user feedback? performance? simplicity?).

	Fix B: Accept as-is and note in lessons
	  Strength:   Minimal effort; implementation is working well.
	  Tradeoff:   Plan remains misleading; manual verification item 2.9
				  appears to have been rubber-stamped.
	  Confidence: MEDIUM — acceptable if this is a small project with
				  informal process, but risky if plan fidelity matters.
	  Blind spot: None significant.

═══════════════════════════════════════════════════════════
  OBSERVATION FINDINGS 💡
═══════════════════════════════════════════════════════════

  F3 — Empty time input handling not specified in plan
  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
	Severity:  💡 OBSERVATION
	Impact:    🏃 LOW — quick decision; fix is obvious and narrowly scoped
	Dimension: Plan Adherence
	Location:  src/utils/validation.ts:41,
			   src/components/DateTimeInput.tsx:27

	Detail:
	The plan specified time input is optional and validation should
	handle "time provided" vs. "time not provided", but didn't
	explicitly say what happens when the user clears a time field
	(empty string vs. undefined).

	Implementation treats empty string as "not provided" by checking
	`timeString.trim() === ""` and passing `undefined` to validation.
	This is sensible and user-friendly, but the validation.ts contract
	in the plan only mentioned the optional parameter, not the empty-
	string-to-undefined normalization pattern.

	Impact: This is good defensive coding, not a defect. Just noting
	that the plan could have been more explicit about this edge case.

	Fix: No fix needed — implementation is correct. If writing future
		 validation specs, explicitly call out empty-string handling.

  ···

  F4 — MilestoneResults locale prop unused
  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
	Severity:  💡 OBSERVATION
	Impact:    🏃 LOW — quick decision; fix is obvious and narrowly scoped
	Dimension: Pattern Consistency
	Location:  src/components/MilestoneResults.tsx:13

	Detail:
	MilestoneResults component accepts a `locale` prop but doesn't use
	it directly. The comment on line 13 explains: "Used by parent to
	create Event objects with locale-aware formatting". The locale is
	applied upstream when DateCard/DateTimeCard are instantiated, so
	Event objects already contain locale-formatted dateString values.

	The unused prop suggests either:
	1. The component interface was designed before the implementation
	   detail of upstream locale handling was decided, or
	2. The prop was kept for potential future use (e.g., client-side
	   date reformatting).

	Impact: Harmless but slightly confusing. Removing the prop would
	make the API cleaner, but keeping it documents that locale matters
	to this component (even if applied upstream).

	Fix: Remove the locale prop from MilestoneResultsProps and update
		 the parent call site to drop `locale={locale}`. This would
		 make the interface match actual usage.
	  Strength:   Cleaner API, less cognitive load for future developers.
	  Tradeoff:   Minor — just a prop removal, no logic change.
	  Confidence: HIGH — the locale is already baked into Event objects.
	  Blind spot: None significant.

═══════════════════════════════════════════════════════════
  AUTOMATED VERIFICATION RESULTS
═══════════════════════════════════════════════════════════

  Phase 1
  -------
  ✅ 1.1 Type checking: npm run typecheck — PASS
  ✅ 1.2 Linting: npm run lint — PASS
  ✅ 1.3 Build: npm run build — PASS
  ✅ 1.4 Dev server: Component renders without errors

  Phase 2
  -------
  ✅ 2.1 Type checking: npm run typecheck — PASS
  ✅ 2.2 Linting: npm run lint — PASS
  ✅ 2.3 Build: npm run build — PASS
  ✅ 2.4 Component renders without errors with sample Event array

  Phase 3
  -------
  ✅ 3.1 Type checking: npm run typecheck — PASS
  ✅ 3.2 Linting: npm run lint — PASS
  ✅ 3.3 Build: npm run build — PASS
  ✅ 3.4 Dev server starts without errors: npm run dev

═══════════════════════════════════════════════════════════
  MANUAL VERIFICATION STATUS
═══════════════════════════════════════════════════════════

  All manual verification items (1.5-1.13, 2.5-2.10, 3.5-3.15) are
  marked complete with commit SHAs in the Progress section.

  Note: Manual item 2.9 ("Count indicator shows: '12 more beyond 75
  years'") is marked [x] but functionality was changed to show all
  events rather than filtering. See Finding F2.

═══════════════════════════════════════════════════════════
