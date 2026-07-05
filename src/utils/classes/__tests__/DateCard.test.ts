import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import DateCard from "../DateCard";

describe("DateCard", () => {
  describe("Basic date-only calculation (happy-path)", () => {
    it("calculates 10 days from 2020-01-01 correctly", () => {
      // Arrange
      const startDate = Temporal.PlainDate.from("2020-01-01");
      const card = new DateCard(startDate, "en-US");

      // Act
      const events = card.getEvents();

      // Assert: Find 10-day milestone
      const milestone10 = events.find(
        (e) => e.label.includes("10 ") && e.label.includes("day") && !e.label.includes("10,")
      );
      expect(milestone10).toBeDefined();

      // Expected: 2020-01-01 + 10 days = 2020-01-11
      const expectedDate = Temporal.PlainDate.from("2020-01-11");
      expect(Temporal.PlainDate.compare(milestone10!.date as Temporal.PlainDate, expectedDate)).toBe(0);
    });

    it("calculates 100 days from 2020-01-01 correctly", () => {
      // Arrange
      const startDate = Temporal.PlainDate.from("2020-01-01");
      const card = new DateCard(startDate, "en-US");

      // Act
      const events = card.getEvents();

      // Assert: Find 100-day milestone
      const milestone100 = events.find(
        (e) => e.label.includes("100 ") && e.label.includes("day") && !e.label.includes(",")
      );
      expect(milestone100).toBeDefined();

      // Expected: 2020-01-01 + 100 days = 2020-04-10
      const expectedDate = Temporal.PlainDate.from("2020-04-10");
      expect(Temporal.PlainDate.compare(milestone100!.date as Temporal.PlainDate, expectedDate)).toBe(0);
    });

    it("calculates 1,000 days from 2020-01-01 correctly", () => {
      // Arrange
      const startDate = Temporal.PlainDate.from("2020-01-01");
      const card = new DateCard(startDate, "en-US");

      // Act
      const events = card.getEvents();

      // Assert: Find 1,000-day milestone
      const milestone1000 = events.find(
        (e) => e.label.includes("1,000") && e.label.includes("day")
      );
      expect(milestone1000).toBeDefined();

      // Expected: 2020-01-01 + 1,000 days = 2022-09-27
      const expectedDate = Temporal.PlainDate.from("2022-09-27");
      expect(Temporal.PlainDate.compare(milestone1000!.date as Temporal.PlainDate, expectedDate)).toBe(0);
    });

    it("calculates week-based milestones", () => {
      // Arrange
      const startDate = Temporal.PlainDate.from("2020-01-01");
      const card = new DateCard(startDate, "en-US");

      // Act
      const events = card.getEvents();

      // Assert: Find 10-week milestone
      const milestone10weeks = events.find(
        (e) => e.label.includes("10 ") && e.label.includes("week")
      );
      expect(milestone10weeks).toBeDefined();

      // Expected: 2020-01-01 + 10 weeks (70 days) = 2020-03-11
      const expectedDate = Temporal.PlainDate.from("2020-03-11");
      expect(Temporal.PlainDate.compare(milestone10weeks!.date as Temporal.PlainDate, expectedDate)).toBe(0);
    });

    it("returns Temporal.PlainDate from getBase()", () => {
      // Arrange
      const startDate = Temporal.PlainDate.from("2020-01-01");
      const card = new DateCard(startDate, "en-US");

      // Act
      const base = card.getBase("days");

      // Assert: Should return PlainDate
      expect(base).toBeInstanceOf(Temporal.PlainDate);
      expect(base.toString()).toBe("2020-01-01");
    });

    it("throws error for invalid unit", () => {
      // Arrange
      const startDate = Temporal.PlainDate.from("2020-01-01");
      const card = new DateCard(startDate, "en-US");

      // Act & Assert: Should throw for invalid unit
      expect(() => card.getBase("hours")).toThrow("Invalid unit 'hours' for DateCard.");
    });
  });
});
