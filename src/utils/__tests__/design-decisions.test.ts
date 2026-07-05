import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import DateCard from "../classes/DateCard";
import DateTimeCard from "../classes/DateTimeCard";

describe("Design Decisions", () => {
  describe("Years NOT calculated (design decision #2)", () => {
    it("DateCard does NOT generate year-based milestones", () => {
      // Arrange: Create DateCard
      const startDate = Temporal.PlainDate.from("2000-01-01");
      const card = new DateCard(startDate, "en-US");

      // Act: Generate milestones
      const events = card.getEvents();

      // Assert: No milestone should have unit "years"
      const yearMilestones = events.filter(
        (e) => e.label.toLowerCase().includes("year")
      );
      expect(yearMilestones).toHaveLength(0);
    });

    it("DateTimeCard does NOT generate year-based milestones", () => {
      // Arrange: Create DateTimeCard
      const startDateTime = Temporal.PlainDateTime.from("2000-01-01T12:00:00");
      const card = new DateTimeCard(startDateTime, "en-US");

      // Act: Generate milestones
      const events = card.getEvents();

      // Assert: No milestone should have unit "years"
      const yearMilestones = events.filter(
        (e) => e.label.toLowerCase().includes("year")
      );
      expect(yearMilestones).toHaveLength(0);
    });
  });

  describe("Months ARE calculated (design decision #3)", () => {
    it("DateCard generates month-based milestones", () => {
      // Arrange: Create DateCard
      const startDate = Temporal.PlainDate.from("2000-01-01");
      const card = new DateCard(startDate, "en-US");

      // Act: Generate milestones
      const events = card.getEvents();

      // Assert: At least one milestone should have unit "months"
      const monthMilestones = events.filter(
        (e) => e.label.toLowerCase().includes("month")
      );
      expect(monthMilestones.length).toBeGreaterThan(0);
    });

    it("DateTimeCard generates month-based milestones", () => {
      // Arrange: Create DateTimeCard
      const startDateTime = Temporal.PlainDateTime.from("2000-01-01T12:00:00");
      const card = new DateTimeCard(startDateTime, "en-US");

      // Act: Generate milestones
      const events = card.getEvents();

      // Assert: At least one milestone should have unit "months"
      const monthMilestones = events.filter(
        (e) => e.label.toLowerCase().includes("month")
      );
      expect(monthMilestones.length).toBeGreaterThan(0);
    });
  });

  describe("DST uses wall-clock hours (design decision #4)", () => {
    it("PlainDateTime addition is deterministic (wall-clock hours)", () => {
      // Arrange: Start time (day before DST spring-forward in US)
      // Note: Using PlainDateTime (not ZonedDateTime) means wall-clock hours
      const startTime = Temporal.PlainDateTime.from("2020-03-08T01:00:00");

      // Act: Add 24 hours
      const result = startTime.add({ hours: 24 });

      // Assert: Result is 24 wall-clock hours later (not affected by DST)
      // Expected: 2020-03-09T01:00:00 (not 02:00:00)
      expect(result.toString()).toBe("2020-03-09T01:00:00");
    });

    it("Multiple hour additions are consistent and deterministic", () => {
      // Arrange: Start time
      const startTime = Temporal.PlainDateTime.from("2020-01-01T00:00:00");

      // Act: Add 1,000 hours
      const result = startTime.add({ hours: 1000 });

      // Assert: Result is deterministic
      // 1,000 hours = 41 days + 16 hours = 2020-02-11T16:00:00
      expect(result.toString()).toBe("2020-02-11T16:00:00");
    });
  });

  describe("Time units by input type", () => {
    it("DateCard includes only: days, weeks, months (no time-based units)", () => {
      // Arrange: Create DateCard
      const startDate = Temporal.PlainDate.from("2020-01-01");
      const card = new DateCard(startDate, "en-US");

      // Act: Generate milestones
      const events = card.getEvents();

      // Assert: Should have days, weeks, months
      const hasDays = events.some((e) => e.label.includes("day"));
      const hasWeeks = events.some((e) => e.label.includes("week"));
      const hasMonths = events.some((e) => e.label.includes("month"));

      expect(hasDays).toBe(true);
      expect(hasWeeks).toBe(true);
      expect(hasMonths).toBe(true);

      // Assert: Should NOT have seconds, minutes, hours
      const hasSeconds = events.some((e) => e.label.includes("second"));
      const hasMinutes = events.some((e) => e.label.includes("minute"));
      const hasHours = events.some((e) => e.label.includes("hour"));

      expect(hasSeconds).toBe(false);
      expect(hasMinutes).toBe(false);
      expect(hasHours).toBe(false);
    });

    it("DateTimeCard includes: seconds, minutes, hours, days, weeks, months", () => {
      // Arrange: Create DateTimeCard
      const startDateTime = Temporal.PlainDateTime.from("2020-01-01T12:00:00");
      const card = new DateTimeCard(startDateTime, "en-US");

      // Act: Generate milestones
      const events = card.getEvents();

      // Assert: Should have all time-based units
      const hasSeconds = events.some((e) => e.label.includes("second"));
      const hasMinutes = events.some((e) => e.label.includes("minute"));
      const hasHours = events.some((e) => e.label.includes("hour"));
      const hasDays = events.some((e) => e.label.includes("day"));
      const hasWeeks = events.some((e) => e.label.includes("week"));
      const hasMonths = events.some((e) => e.label.includes("month"));

      expect(hasSeconds).toBe(true);
      expect(hasMinutes).toBe(true);
      expect(hasHours).toBe(true);
      expect(hasDays).toBe(true);
      expect(hasWeeks).toBe(true);
      expect(hasMonths).toBe(true);
    });
  });
});
