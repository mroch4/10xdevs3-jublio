import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import DateTimeCard from "../DateTimeCard";

describe("DateTimeCard", () => {
  describe("Basic date+time calculation (happy-path)", () => {
    it("calculates 1,000 seconds from 2020-01-01T12:00:00 correctly", () => {
      // Arrange
      const startDateTime = Temporal.PlainDateTime.from("2020-01-01T12:00:00");
      const card = new DateTimeCard(startDateTime, "en-US");

      // Act
      const events = card.getEvents();

      // Assert: Find 1,000-second milestone
      const milestone1000 = events.find(
        (e) => e.label.includes("1,000") && e.label.includes("second")
      );
      expect(milestone1000).toBeDefined();

      // Expected: 2020-01-01T12:00:00 + 1,000 seconds = 2020-01-01T12:16:40
      const expectedDateTime = Temporal.PlainDateTime.from("2020-01-01T12:16:40");
      expect(Temporal.PlainDateTime.compare(milestone1000!.date as Temporal.PlainDateTime, expectedDateTime)).toBe(0);
    });

    it("calculates 10,000 minutes from 2020-01-01T12:00:00 correctly", () => {
      // Arrange
      const startDateTime = Temporal.PlainDateTime.from("2020-01-01T12:00:00");
      const card = new DateTimeCard(startDateTime, "en-US");

      // Act
      const events = card.getEvents();

      // Assert: Find 10,000-minute milestone
      const milestone10000 = events.find(
        (e) => e.label.includes("10,000") && e.label.includes("minute")
      );
      expect(milestone10000).toBeDefined();

      // Expected: 2020-01-01T12:00:00 + 10,000 minutes (6 days, 22 hours, 40 minutes) = 2020-01-08T10:40:00
      const expectedDateTime = Temporal.PlainDateTime.from("2020-01-08T10:40:00");
      expect(Temporal.PlainDateTime.compare(milestone10000!.date as Temporal.PlainDateTime, expectedDateTime)).toBe(0);
    });

    it("calculates 10,000 hours from 2020-01-01T12:00:00 correctly", () => {
      // Arrange
      const startDateTime = Temporal.PlainDateTime.from("2020-01-01T12:00:00");
      const card = new DateTimeCard(startDateTime, "en-US");

      // Act
      const events = card.getEvents();

      // Assert: Find 10,000-hour milestone
      const milestone10000 = events.find(
        (e) => e.label.includes("10,000") && e.label.includes("hour")
      );
      expect(milestone10000).toBeDefined();

      // Expected: 2020-01-01T12:00:00 + 10,000 hours = 2021-02-21T04:00:00
      const expectedDateTime = Temporal.PlainDateTime.from("2021-02-21T04:00:00");
      expect(Temporal.PlainDateTime.compare(milestone10000!.date as Temporal.PlainDateTime, expectedDateTime)).toBe(0);
    });

    it("includes all time-based units (seconds, minutes, hours, days, weeks, months)", () => {
      // Arrange
      const startDateTime = Temporal.PlainDateTime.from("2020-01-01T12:00:00");
      const card = new DateTimeCard(startDateTime, "en-US");

      // Act
      const events = card.getEvents();

      // Assert: Should have milestones for all time units
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

    it("returns Temporal.PlainDateTime from getBase()", () => {
      // Arrange
      const startDateTime = Temporal.PlainDateTime.from("2020-01-01T12:00:00");
      const card = new DateTimeCard(startDateTime, "en-US");

      // Act
      const base = card.getBase("hours");

      // Assert: Should return PlainDateTime
      expect(base).toBeInstanceOf(Temporal.PlainDateTime);
      expect(base.toString()).toBe("2020-01-01T12:00:00");
    });

    it("throws error for invalid unit", () => {
      // Arrange
      const startDateTime = Temporal.PlainDateTime.from("2020-01-01T12:00:00");
      const card = new DateTimeCard(startDateTime, "en-US");

      // Act & Assert: Should throw for invalid unit
      expect(() => card.getBase("years")).toThrow("Invalid unit 'years' for DateTimeCard.");
    });
  });

  describe("Date+time edge cases", () => {
    it("handles midnight start time correctly", () => {
      // Arrange: Start at midnight
      const startDateTime = Temporal.PlainDateTime.from("2020-01-01T00:00:00");
      const card = new DateTimeCard(startDateTime, "en-US");

      // Act
      const events = card.getEvents();

      // Assert: Find 1000-second milestone (should be 00:16:40)
      const milestone1000 = events.find(
        (e) => e.label.includes("1,000") && e.label.includes("second")
      );
      expect(milestone1000).toBeDefined();

      const expectedDateTime = Temporal.PlainDateTime.from("2020-01-01T00:16:40");
      expect(Temporal.PlainDateTime.compare(milestone1000!.date as Temporal.PlainDateTime, expectedDateTime)).toBe(0);
    });

    it("handles time crossing midnight boundary", () => {
      // Arrange: Start at 23:00
      const startDateTime = Temporal.PlainDateTime.from("2020-01-01T23:00:00");
      const card = new DateTimeCard(startDateTime, "en-US");

      // Act
      const events = card.getEvents();

      // Assert: Find 10,000-second milestone (should cross midnight)
      const milestone10000 = events.find(
        (e) => e.label.includes("10,000") && e.label.includes("second")
      );
      expect(milestone10000).toBeDefined();

      // Expected: 2020-01-01T23:00:00 + 10,000 seconds (2h 46m 40s) = 2020-01-02T01:46:40
      const expectedDateTime = Temporal.PlainDateTime.from("2020-01-02T01:46:40");
      expect(Temporal.PlainDateTime.compare(milestone10000!.date as Temporal.PlainDateTime, expectedDateTime)).toBe(0);
    });
  });
});
