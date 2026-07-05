import { describe, it, expect } from "vitest";
import { validateDateTime } from "../validation";
import { Temporal } from "@js-temporal/polyfill";

describe("validateDateTime", () => {
  describe("Future date validation", () => {
    it("rejects future date (2030-01-01)", () => {
      // Act: Validate a date far in the future
      const result = validateDateTime("2030-01-01");

      // Assert: Should be invalid
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a past or present date");
      expect(result.date).toBeUndefined();
      expect(result.time).toBeUndefined();
    });

    it("rejects date that is tomorrow", () => {
      // Arrange: Get tomorrow's date
      const tomorrow = Temporal.Now.plainDateTimeISO()
        .toPlainDate()
        .add({ days: 1 })
        .toString();

      // Act: Validate tomorrow's date
      const result = validateDateTime(tomorrow);

      // Assert: Should be invalid
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a past or present date");
    });

    it("accepts today's date", () => {
      // Arrange: Get today's date
      const today = Temporal.Now.plainDateTimeISO().toPlainDate().toString();

      // Act: Validate today's date
      const result = validateDateTime(today);

      // Assert: Should be valid
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.date).toBeDefined();
    });

    it("accepts past date", () => {
      // Act: Validate a past date
      const result = validateDateTime("2020-01-01");

      // Assert: Should be valid
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.date).toBeDefined();
      expect(result.date!.toString()).toBe("2020-01-01");
    });
  });

  describe("Future time validation", () => {
    it("rejects today's date with future time", () => {
      // Arrange: Get current date and time 2 hours in the future
      const now = Temporal.Now.plainDateTimeISO();
      const todayDate = now.toPlainDate().toString();
      const futureTime = now.toPlainTime().add({ hours: 2 }).toString().slice(0, 5);

      // Act: Validate today + future time
      const result = validateDateTime(todayDate, futureTime);

      // Assert: Should be invalid
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a past or present date and time");
    });

    it("accepts today's date with past time", () => {
      // Arrange: Get current date and time 2 hours in the past
      const now = Temporal.Now.plainDateTimeISO();
      const todayDate = now.toPlainDate().toString();
      const pastTime = now.toPlainTime().subtract({ hours: 2 }).toString().slice(0, 5);

      // Act: Validate today + past time
      const result = validateDateTime(todayDate, pastTime);

      // Assert: Should be valid
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.date).toBeDefined();
      expect(result.time).toBeDefined();
    });

    it("accepts past date with any time (even future time)", () => {
      // Act: Validate past date with any time (time is in future but date is past)
      const result = validateDateTime("2020-01-01", "23:59");

      // Assert: Should be valid (only checks if date+time combo is past)
      expect(result.isValid).toBe(true);
      expect(result.date).toBeDefined();
      expect(result.time).toBeDefined();
    });
  });

  describe("Empty time string normalization", () => {
    it("treats empty time string as date-only input (time = undefined)", () => {
      // Act: Validate with empty time string
      const result = validateDateTime("2020-01-01", "");

      // Assert: Should be valid with time = undefined
      expect(result.isValid).toBe(true);
      expect(result.date).toBeDefined();
      expect(result.time).toBeUndefined();
    });

    it("treats whitespace-only time string as date-only input", () => {
      // Act: Validate with whitespace time string
      const result = validateDateTime("2020-01-01", "   ");

      // Assert: Should be valid with time = undefined
      expect(result.isValid).toBe(true);
      expect(result.date).toBeDefined();
      expect(result.time).toBeUndefined();
    });

    it("accepts valid time string (not empty)", () => {
      // Act: Validate with valid time
      const result = validateDateTime("2020-01-01", "14:30");

      // Assert: Should be valid with time defined
      expect(result.isValid).toBe(true);
      expect(result.date).toBeDefined();
      expect(result.time).toBeDefined();
      expect(result.time!.toString().slice(0, 5)).toBe("14:30");
    });
  });

  describe("Input validation", () => {
    it("rejects empty date string", () => {
      // Act: Validate empty date
      const result = validateDateTime("");

      // Assert: Should be invalid
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Date is required");
    });

    it("rejects invalid date format", () => {
      // Act: Validate invalid date format
      const result = validateDateTime("2020-13-45"); // Invalid month and day

      // Assert: Should be invalid
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid date format");
    });

    it("rejects invalid time format", () => {
      // Act: Validate invalid time format
      const result = validateDateTime("2020-01-01", "25:99"); // Invalid hour and minute

      // Assert: Should be invalid
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid time format");
    });
  });
});
