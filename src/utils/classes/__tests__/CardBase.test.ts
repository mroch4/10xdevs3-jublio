import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import DateCard from "../DateCard";
import { type CustomMilestone } from "../../../types/CustomMilestone";

describe("CardBase (via DateCard)", () => {
  describe("Custom milestone generation", () => {
    it("generates custom milestone with value 420", () => {
      // Arrange: Start date with custom milestone
      const startDate = Temporal.PlainDate.from("2020-01-01");
      const customMilestones: CustomMilestone[] = [
        { unit: "days", value: 420, id: "custom-420" },
      ];
      const card = new DateCard(startDate, "en-US", customMilestones);

      // Act: Access the pre-generated events (created in constructor)
      const events = card.events;

      // Assert: Find custom milestone
      const custom420 = events.find(
        (e) => e.isCustom && e.customId === "custom-420"
      );
      expect(custom420).toBeDefined();
      expect(custom420!.isCustom).toBe(true);
      expect(custom420!.customId).toBe("custom-420");

      // Expected date: 2020-01-01 + 420 days = 2021-02-24
      const expectedDate = Temporal.PlainDate.from("2021-02-24");
      expect(Temporal.PlainDate.compare(custom420!.date as Temporal.PlainDate, expectedDate)).toBe(0);
    });

    it("generates multiple custom milestones (420, 2137)", () => {
      // Arrange: Start date with multiple custom milestones
      const startDate = Temporal.PlainDate.from("2020-01-01");
      const customMilestones: CustomMilestone[] = [
        { unit: "days", value: 420, id: "custom-420" },
        { unit: "days", value: 2137, id: "custom-2137" },
      ];
      const card = new DateCard(startDate, "en-US", customMilestones);

      // Act: Access the pre-generated events
      const events = card.events;

      // Assert: Find both custom milestones
      const custom420 = events.find((e) => e.customId === "custom-420");
      const custom2137 = events.find((e) => e.customId === "custom-2137");

      expect(custom420).toBeDefined();
      expect(custom2137).toBeDefined();

      // Expected dates
      const expected420 = Temporal.PlainDate.from("2021-02-24");
      const expected2137 = Temporal.PlainDate.from("2025-11-07");

      expect(Temporal.PlainDate.compare(custom420!.date as Temporal.PlainDate, expected420)).toBe(0);
      expect(Temporal.PlainDate.compare(custom2137!.date as Temporal.PlainDate, expected2137)).toBe(0);
    });

    it("generates custom milestones alongside default power-of-10 milestones", () => {
      // Arrange: Start date with custom milestone
      const startDate = Temporal.PlainDate.from("2020-01-01");
      const customMilestones: CustomMilestone[] = [
        { unit: "days", value: 500, id: "custom-500" },
      ];
      const card = new DateCard(startDate, "en-US", customMilestones);

      // Act: Access the pre-generated events
      const events = card.events;

      // Assert: Should have both default and custom milestones
      const defaultMilestones = events.filter((e) => !e.isCustom);
      const customMilestonesList = events.filter((e) => e.isCustom);

      expect(defaultMilestones.length).toBeGreaterThan(0);
      expect(customMilestonesList.length).toBe(1);
      expect(customMilestonesList[0].customId).toBe("custom-500");
    });

    it("generates custom milestone with different unit (weeks)", () => {
      // Arrange: Custom milestone in weeks
      const startDate = Temporal.PlainDate.from("2020-01-01");
      const customMilestones: CustomMilestone[] = [
        { unit: "weeks", value: 52, id: "custom-52weeks" },
      ];
      const card = new DateCard(startDate, "en-US", customMilestones);

      // Act: Access the pre-generated events
      const events = card.events;

      // Assert: Find custom milestone
      const custom52weeks = events.find((e) => e.customId === "custom-52weeks");
      expect(custom52weeks).toBeDefined();

      // Expected: 2020-01-01 + 52 weeks = 2020-12-30
      const expectedDate = Temporal.PlainDate.from("2020-12-30");
      expect(Temporal.PlainDate.compare(custom52weeks!.date as Temporal.PlainDate, expectedDate)).toBe(0);
    });

    it("handles large custom values (25000 days)", () => {
      // Arrange: Large custom value
      const startDate = Temporal.PlainDate.from("2000-01-01");
      const customMilestones: CustomMilestone[] = [
        { unit: "days", value: 25000, id: "custom-25000" },
      ];
      const card = new DateCard(startDate, "en-US", customMilestones);

      // Act: Access the pre-generated events
      const events = card.events;

      // Assert: Find custom milestone
      const custom25000 = events.find((e) => e.customId === "custom-25000");
      expect(custom25000).toBeDefined();

      // Expected: 2000-01-01 + 25,000 days = 2068-06-12
      const expectedDate = Temporal.PlainDate.from("2068-06-12");
      expect(Temporal.PlainDate.compare(custom25000!.date as Temporal.PlainDate, expectedDate)).toBe(0);
    });
  });

  describe("Default power-of-10 milestone generation", () => {
    it("generates default milestones at power-of-10 intervals", () => {
      // Arrange: Basic DateCard
      const startDate = Temporal.PlainDate.from("2020-01-01");
      const card = new DateCard(startDate, "en-US");

      // Act: Access the pre-generated events
      const events = card.events;

      // Assert: Should have power-of-10 milestones (10, 100, 1000, 10000, 100000)
      const has10Days = events.some((e) => e.label.includes("10 ") && e.label.includes("day"));
      const has100Days = events.some((e) => e.label.includes("100 ") && e.label.includes("day"));
      const has1000Days = events.some((e) => e.label.includes("1,000 ") && e.label.includes("day"));

      expect(has10Days).toBe(true);
      expect(has100Days).toBe(true);
      expect(has1000Days).toBe(true);
    });
  });
});

