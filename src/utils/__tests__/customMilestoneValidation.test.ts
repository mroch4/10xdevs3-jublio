import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { validateCustomMilestoneValue } from "../customMilestoneValidation";

describe("validateCustomMilestoneValue - Value-only validation", () => {
  it("should allow empty string", () => {
    const result = validateCustomMilestoneValue("");
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });

  it("should allow whitespace-only string (trimmed to empty)", () => {
    const result = validateCustomMilestoneValue("  ");
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });

  it("should reject invalid number (non-numeric string)", () => {
    const result = validateCustomMilestoneValue("abc");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Value must be a valid number");
  });

  it("should reject decimal values", () => {
    const result = validateCustomMilestoneValue("1.5");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Value must be a whole number");
  });

  it("should reject zero", () => {
    const result = validateCustomMilestoneValue("0");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Value must be at least 1");
  });

  it("should reject negative values", () => {
    const result = validateCustomMilestoneValue("-1");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Value must be at least 1");
  });

  it("should accept minimum boundary value (1)", () => {
    const result = validateCustomMilestoneValue("1");
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });

  it("should accept maximum boundary value (1000000000)", () => {
    const result = validateCustomMilestoneValue("1000000000");
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });

  it("should reject value above maximum (1000000001)", () => {
    const result = validateCustomMilestoneValue("1000000001");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Value must be 1,000,000,000 or less");
  });

  it("should accept valid value with no units (no life expectancy check)", () => {
    const result = validateCustomMilestoneValue("1000", []);
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });
});

describe("validateCustomMilestoneValue - Life expectancy validation", () => {
  const dateInPast = Temporal.PlainDate.from("2020-01-01");
  const dateTimeInPast = Temporal.PlainDateTime.from("2020-01-01T12:00:00");

  it("should accept valid combination (1000 days from 2020-01-01)", () => {
    const result = validateCustomMilestoneValue("1000", ["days"], dateInPast);
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });

  it("should accept multiple valid units (100 with days, weeks, months)", () => {
    const result = validateCustomMilestoneValue("100", ["days", "weeks", "months"], dateInPast);
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });

  it("should reject value exceeding 75 years (100 years)", () => {
    const result = validateCustomMilestoneValue("100", ["years"], dateInPast);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Milestone would exceed human lifetime");
    expect(result.error).toContain("100 years");
  });

  it("should reject value exceeding 75 years (40000 days ~109 years)", () => {
    const result = validateCustomMilestoneValue("40000", ["days"], dateInPast);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Milestone would exceed human lifetime");
    expect(result.error).toContain("40,000 days");
  });

  it("should reject when any selected unit exceeds 75 years", () => {
    // 1000 days is valid (~2.7 years), but 1000 years exceeds limit
    const result = validateCustomMilestoneValue("1000", ["days", "years"], dateInPast);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Milestone would exceed human lifetime");
    expect(result.error).toContain("1,000 years");
  });

  it("should reject Temporal overflow (999999999 years)", () => {
    const result = validateCustomMilestoneValue("999999999", ["years"], dateInPast);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid combination");
    expect(result.error).toContain("999,999,999 years");
  });

  it("should work with PlainDateTime as originalDate", () => {
    const result = validateCustomMilestoneValue("1000", ["hours"], dateTimeInPast);
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });

  it("should accept very large seconds value that stays within 75 years (500000000 seconds ~15.8 years)", () => {
    const result = validateCustomMilestoneValue("500000000", ["seconds"], dateTimeInPast);
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });

  it("should accept value with units but no originalDate (cannot check life expectancy)", () => {
    const result = validateCustomMilestoneValue("1000", ["days"], null);
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });
});

describe("validateCustomMilestoneValue - Edge cases", () => {
  const dateInPast = Temporal.PlainDate.from("2020-01-01");

  it("should reject large value with months that exceeds 75 years", () => {
    // 1000 months = 83.3 years
    const result = validateCustomMilestoneValue("1000", ["months"], dateInPast);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Milestone would exceed human lifetime");
  });

  it("should accept value near but under 75-year boundary", () => {
    // Calculate a value that's just under 75 years from now
    const now = Temporal.Now.plainDateISO();
    const almostLimit = now.add({ years: 74 });
    const daysDiff = now.until(almostLimit).total({ unit: "days" });
    const safeDays = Math.floor(daysDiff * 0.9); // Use 90% of the limit to be safe

    const result = validateCustomMilestoneValue(safeDays.toString(), ["days"], now);
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });

  it("should handle very large value with small unit (999999999 seconds ~31.7 years)", () => {
    const result = validateCustomMilestoneValue("999999999", ["seconds"], dateInPast);
    expect(result.isValid).toBe(true);
    expect(result.error).toBe(null);
  });

  it("should handle Temporal overflow gracefully with multiple units", () => {
    // Both should overflow, error should mention first unit that fails
    const result = validateCustomMilestoneValue("999999999", ["years", "months"], dateInPast);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid combination");
  });

  it("should format large numbers with thousands separators in error messages", () => {
    const result = validateCustomMilestoneValue("1000000001");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Value must be 1,000,000,000 or less");
  });
});
