import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import Milestone from "../Milestone";
import { EventCategory } from "../../enums/EventCategory";

describe("Milestone", () => {
  describe("75-year life expectancy cutoff", () => {
    it("categorizes milestone 273.9 years away as BeyondHumanLifeExpectancy", () => {
      // Arrange: Start date 2000-01-01, milestone 273.9 years later (100,000 days)
      const startDate = Temporal.PlainDate.from("2000-01-01");
      const milestoneDate = startDate.add({ days: 100000 }); // 2273-12-05
      const now = Temporal.PlainDateTime.from("2026-01-15T12:00:00");

      // Act: Create milestone with injected "now"
      const milestone = new Milestone(
        milestoneDate,
        "days",
        100000,
        "en-US",
        now // Inject fixed "now" for determinism
      );

      // Assert: Category should be BeyondHumanLifeExpectancy
      // (2273 - 2026 = 247 years > 75 years)
      expect(milestone.category).toBe(EventCategory.BeyondHumanLifeExpectancy);
    });

    it("categorizes milestone exactly 75 years away as NOT BeyondHumanLifeExpectancy", () => {
      // Arrange: Milestone exactly at 75-year boundary
      const now = Temporal.PlainDateTime.from("2000-01-01T00:00:00");
      const milestoneDate = Temporal.PlainDate.from("2075-01-01"); // Exactly 75 years

      // Act: Create milestone with injected "now"
      const milestone = new Milestone(
        milestoneDate,
        "days",
        27375, // Approximately 75 years in days
        "en-US",
        now
      );

      // Assert: Category should NOT be BeyondHumanLifeExpectancy
      // (exactly at cutoff = included, not beyond)
      expect(milestone.category).not.toBe(EventCategory.BeyondHumanLifeExpectancy);
    });

    it("categorizes milestone 76 years away as BeyondHumanLifeExpectancy", () => {
      // Arrange: Milestone just over 75-year boundary
      const now = Temporal.PlainDateTime.from("2000-01-01T00:00:00");
      const milestoneDate = Temporal.PlainDate.from("2076-01-02"); // Just over 75 years

      // Act: Create milestone
      const milestone = new Milestone(
        milestoneDate,
        "days",
        27758, // ~76 years in days
        "en-US",
        now
      );

      // Assert: Should be BeyondHumanLifeExpectancy
      expect(milestone.category).toBe(EventCategory.BeyondHumanLifeExpectancy);
    });
  });

  describe("Category detection", () => {
    it("categorizes milestone as Today when date matches current date", () => {
      // Arrange: Milestone date = today (ignoring time)
      const now = Temporal.PlainDateTime.from("2026-01-15T12:00:00");
      const milestoneDate = Temporal.PlainDate.from("2026-01-15");

      // Act: Create milestone
      const milestone = new Milestone(
        milestoneDate,
        "days",
        1000,
        "en-US",
        now
      );

      // Assert: Should be categorized as Today
      expect(milestone.category).toBe(EventCategory.Today);
    });

    it("categorizes milestone as ThisWeek when within current week", () => {
      // Arrange: Current date is Wednesday 2026-01-15 (week: Mon 1/13 - Sun 1/19)
      const now = Temporal.PlainDateTime.from("2026-01-15T12:00:00"); // Wednesday
      const milestoneDate = Temporal.PlainDate.from("2026-01-17"); // Friday same week

      // Act: Create milestone
      const milestone = new Milestone(
        milestoneDate,
        "days",
        1000,
        "en-US",
        now
      );

      // Assert: Should be categorized as ThisWeek
      expect(milestone.category).toBe(EventCategory.ThisWeek);
    });

    it("categorizes milestone as AlreadyPassed when date is in the past", () => {
      // Arrange: Milestone in the past
      const now = Temporal.PlainDateTime.from("2026-01-15T12:00:00");
      const milestoneDate = Temporal.PlainDate.from("2020-01-01");

      // Act: Create milestone
      const milestone = new Milestone(
        milestoneDate,
        "days",
        1000,
        "en-US",
        now
      );

      // Assert: Should be categorized as AlreadyPassed
      expect(milestone.category).toBe(EventCategory.AlreadyPassed);
    });

    it("categorizes milestone as ThisMonth when within current month but not this week", () => {
      // Arrange: Current date is 2026-01-05 (Monday), milestone is 2026-01-28 (Wednesday, 3+ weeks later)
      const now = Temporal.PlainDateTime.from("2026-01-05T12:00:00");
      const milestoneDate = Temporal.PlainDate.from("2026-01-28"); // Late in January, definitely not ThisWeek or NextWeek

      // Act: Create milestone
      const milestone = new Milestone(
        milestoneDate,
        "days",
        1000,
        "en-US",
        now
      );

      // Assert: Should be categorized as ThisMonth (not ThisWeek, not NextWeek, not NextMonth)
      expect(milestone.category).toBe(EventCategory.ThisMonth);
    });

    it("handles milestone with PlainDateTime (not just PlainDate)", () => {
      // Arrange: Milestone with time component
      const now = Temporal.PlainDateTime.from("2026-01-15T12:00:00");
      const milestoneDateTime = Temporal.PlainDateTime.from("2026-01-15T14:30:00");

      // Act: Create milestone
      const milestone = new Milestone(
        milestoneDateTime,
        "hours",
        1000,
        "en-US",
        now
      );

      // Assert: Should still be categorized as Today (date-only comparison)
      expect(milestone.category).toBe(EventCategory.Today);
    });
  });
});
