import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import DateCard from "../classes/DateCard";

describe("Temporal API Edge Cases", () => {
  describe("Leap year handling", () => {
    it("calculates 1,000 days from leap day (2020-02-29) correctly", () => {
      // Arrange: Start from leap day
      const startDate = Temporal.PlainDate.from("2020-02-29");
      const card = new DateCard(startDate, "en-US");

      // Act: Generate milestones
      const events = card.getEvents();

      // Assert: Find 1,000-day milestone
      const milestone1000 = events.find(
        (e) => e.label.includes("1,000") && e.label.includes("days")
      );
      expect(milestone1000).toBeDefined();

      // Expected: 2020-02-29 + 1,000 days = 2022-11-25
      // (crosses 2021 non-leap year, so Feb has 28 days)
      const expectedDate = Temporal.PlainDate.from("2022-11-25");
      expect(Temporal.PlainDate.compare(milestone1000!.date as Temporal.PlainDate, expectedDate)).toBe(0);
    });

    it("handles adding 1 year from leap day (rounds to Feb 28)", () => {
      // Note: This test documents Temporal API behavior
      // Years are NOT calculated in milestones (design decision #2)
      // but Temporal API handles this case if used elsewhere
      const leapDay = Temporal.PlainDate.from("2020-02-29");
      const nextYear = leapDay.add({ years: 1 });

      // Expected: 2021-02-28 (not 2021-03-01)
      expect(nextYear.toString()).toBe("2021-02-28");
    });

    it("handles leap year in middle of calculation (1000 days from 2019-01-01)", () => {
      // Arrange: Start before leap year
      const startDate = Temporal.PlainDate.from("2019-01-01");
      const card = new DateCard(startDate, "en-US");

      // Act: Generate milestones
      const events = card.getEvents();

      // Assert: Find 1,000-day milestone
      const milestone1000 = events.find(
        (e) => e.label.includes("1,000") && e.label.includes("days")
      );
      expect(milestone1000).toBeDefined();

      // Expected: 2019-01-01 + 1,000 days = 2021-09-27
      // (crosses 2020 leap year, so 366 days in 2020)
      const expectedDate = Temporal.PlainDate.from("2021-09-27");
      expect(Temporal.PlainDate.compare(milestone1000!.date as Temporal.PlainDate, expectedDate)).toBe(0);
    });
  });

  describe("Month boundary overflow", () => {
    it("handles adding 1 month from Jan 31 (overflows to Feb 29 in leap year)", () => {
      const jan31 = Temporal.PlainDate.from("2020-01-31");
      const oneMonthLater = jan31.add({ months: 1 });

      // Expected: 2020-02-29 (February has fewer days, leap year)
      expect(oneMonthLater.toString()).toBe("2020-02-29");
    });

    it("handles adding 1 month from Jan 31 (overflows to Feb 28 in non-leap year)", () => {
      const jan31 = Temporal.PlainDate.from("2021-01-31");
      const oneMonthLater = jan31.add({ months: 1 });

      // Expected: 2021-02-28 (February has fewer days, non-leap year)
      expect(oneMonthLater.toString()).toBe("2021-02-28");
    });
  });
});
