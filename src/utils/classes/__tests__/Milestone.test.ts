import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import Milestone from "../Milestone";
import { EventCategory } from "../../enums/EventCategory";

describe("Milestone Categorization", () => {
  describe("AlreadyPassed", () => {
    it("categorizes date in the past as AlreadyPassed", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00");
      const milestoneDate = Temporal.PlainDate.from("2026-07-04");

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.AlreadyPassed);
    });

    it("categorizes datetime in the past as AlreadyPassed", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00");
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-05T13:59:59");

      const milestone = new Milestone(milestoneDate, "seconds", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.AlreadyPassed);
    });

    it("categorizes far past date as AlreadyPassed", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00");
      const milestoneDate = Temporal.PlainDate.from("2020-01-01");

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.AlreadyPassed);
    });
  });

  describe("Today", () => {
    it("categorizes same date as Today", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00");
      const milestoneDate = Temporal.PlainDate.from("2026-07-05");

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.Today);
    });

    it("categorizes datetime with same date but future time as Today", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00");
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-05T23:59:59");

      const milestone = new Milestone(milestoneDate, "hours", 10, "en-US", now);

      expect(milestone.category).toBe(EventCategory.Today);
    });

    it("categorizes datetime with same date but earlier time as Today", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00");
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-05T23:59:59"); // Later today

      const milestone = new Milestone(milestoneDate, "hours", 10, "en-US", now);

      expect(milestone.category).toBe(EventCategory.Today);
    });
  });

  describe("ThisWeek", () => {
    // Week: Monday July 5 - Sunday July 6, 2026
    it("categorizes remaining days of current week as ThisWeek", () => {
      const now = Temporal.PlainDateTime.from("2026-07-02T14:00:00"); // Thursday July 2
      const milestoneDate = Temporal.PlainDate.from("2026-07-04"); // Saturday July 4 (in current week)

      const milestone = new Milestone(milestoneDate, "days", 2, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisWeek);
    });

    it("categorizes Sunday of current week at start of day as ThisWeek", () => {
      const now = Temporal.PlainDateTime.from("2026-07-04T14:00:00"); // Saturday July 4
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-05T00:00:01"); // Sunday July 5 at 00:00:01

      const milestone = new Milestone(milestoneDate, "hours", 10, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisWeek);
    });

    it("categorizes Sunday of current week at end of day as ThisWeek", () => {
      const now = Temporal.PlainDateTime.from("2026-07-04T14:00:00"); // Saturday July 4
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-05T23:59:59"); // Sunday July 5 at 23:59:59

      const milestone = new Milestone(milestoneDate, "hours", 33, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisWeek);
    });

    it("categorizes Tuesday when today is Monday as ThisWeek", () => {
      const now = Temporal.PlainDateTime.from("2026-06-29T10:00:00"); // Monday
      const milestoneDate = Temporal.PlainDate.from("2026-06-30"); // Tuesday

      const milestone = new Milestone(milestoneDate, "days", 1, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisWeek);
    });

    it("categorizes Friday when today is Monday as ThisWeek", () => {
      const now = Temporal.PlainDateTime.from("2026-06-29T10:00:00"); // Monday
      const milestoneDate = Temporal.PlainDate.from("2026-07-03"); // Friday

      const milestone = new Milestone(milestoneDate, "days", 4, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisWeek);
    });
  });

  describe("NextWeek", () => {
    // Current week: June 29 - July 5, 2026
    // Next week: July 7 - July 13, 2026
    it("categorizes Monday of next week as NextWeek", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // Saturday
      const milestoneDate = Temporal.PlainDate.from("2026-07-07"); // Next Monday

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.NextWeek);
    });

    it("categorizes Sunday of next week at start of day as NextWeek", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // Sunday (last day of current week)
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-13T00:00:01"); // Next Sunday 00:00:01 (8 days later)

      const milestone = new Milestone(milestoneDate, "days", 8, "en-US", now);

      // July 13 is beyond next week (which ends on July 12)
      expect(milestone.category).toBe(EventCategory.ThisMonth);
    });

    it("categorizes last hour of next week Sunday as NextWeek", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // Sunday
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-12T23:59:59"); // Next Sunday (July 12) 23:59:59

      const milestone = new Milestone(milestoneDate, "minutes", 10000, "en-US", now);

      expect(milestone.category).toBe(EventCategory.NextWeek);
    });

    it("categorizes Wednesday of next week as NextWeek", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // Saturday
      const milestoneDate = Temporal.PlainDate.from("2026-07-09"); // Next Wednesday

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.NextWeek);
    });
  });

  describe("ThisMonth", () => {
    it("categorizes date in same month after next week as ThisMonth", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // Saturday, July 5
      const milestoneDate = Temporal.PlainDate.from("2026-07-14"); // July 14 (Monday, 2 weeks away)

      const milestone = new Milestone(milestoneDate, "minutes", 12345, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisMonth);
    });

    it("categorizes date late in current month as ThisMonth", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5
      const milestoneDate = Temporal.PlainDate.from("2026-07-28"); // July 28

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisMonth);
    });

    it("categorizes last day of current month as ThisMonth", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5
      const milestoneDate = Temporal.PlainDate.from("2026-07-31"); // July 31

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisMonth);
    });

    it("categorizes early in month when today is late in month as ThisMonth", () => {
      const now = Temporal.PlainDateTime.from("2026-01-28T14:00:00"); // January 28
      const milestoneDate = Temporal.PlainDate.from("2026-01-05"); // January 5 (in past)

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.AlreadyPassed);
    });
  });

  describe("NextMonth", () => {
    it("categorizes first day of next month as NextMonth", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5
      const milestoneDate = Temporal.PlainDate.from("2026-08-01"); // August 1

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.NextMonth);
    });

    it("categorizes middle of next month as NextMonth", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5
      const milestoneDate = Temporal.PlainDate.from("2026-08-15"); // August 15

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.NextMonth);
    });

    it("categorizes last day of next month as NextMonth", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5
      const milestoneDate = Temporal.PlainDate.from("2026-08-31"); // August 31

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.NextMonth);
    });
  });

  describe("ThisYear", () => {
    it("categorizes date 3 months away in same year as ThisYear", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5
      const milestoneDate = Temporal.PlainDate.from("2026-10-15"); // October 15

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisYear);
    });

    it("categorizes December when in July as ThisYear", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5
      const milestoneDate = Temporal.PlainDate.from("2026-12-25"); // December 25

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisYear);
    });

    it("categorizes last day of current year as ThisYear", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5
      const milestoneDate = Temporal.PlainDate.from("2026-12-31"); // December 31

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisYear);
    });
  });

  describe("NextYear", () => {
    it("categorizes first day of next year as NextYear", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5, 2026
      const milestoneDate = Temporal.PlainDate.from("2027-01-01"); // January 1, 2027

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.NextYear);
    });

    it("categorizes middle of next year as NextYear", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5, 2026
      const milestoneDate = Temporal.PlainDate.from("2027-06-15"); // June 15, 2027

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.NextYear);
    });

    it("categorizes last day of next year as NextYear", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5, 2026
      const milestoneDate = Temporal.PlainDate.from("2027-12-31"); // December 31, 2027

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.NextYear);
    });
  });

  describe("Further", () => {
    it("categorizes date 2 years away as Further", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5, 2026
      const milestoneDate = Temporal.PlainDate.from("2028-07-05"); // July 5, 2028

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.Further);
    });

    it("categorizes date 10 years away as Further", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5, 2026
      const milestoneDate = Temporal.PlainDate.from("2036-07-05"); // July 5, 2036

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.Further);
    });

    it("categorizes date 50 years away as Further", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // July 5, 2026
      const milestoneDate = Temporal.PlainDate.from("2076-07-05"); // July 5, 2076

      const milestone = new Milestone(milestoneDate, "days", 100, "en-US", now);

      expect(milestone.category).toBe(EventCategory.Further);
    });

    it("categorizes date exactly 75 years away as Further (not beyond)", () => {
      const now = Temporal.PlainDateTime.from("2000-01-01T00:00:00");
      const milestoneDate = Temporal.PlainDate.from("2075-01-01"); // Exactly 75 years

      const milestone = new Milestone(milestoneDate, "days", 27375, "en-US", now);

      expect(milestone.category).toBe(EventCategory.Further);
    });
  });

  describe("BeyondHumanLifeExpectancy", () => {
    it("categorizes date 76 years away as BeyondHumanLifeExpectancy", () => {
      const now = Temporal.PlainDateTime.from("2000-01-01T00:00:00");
      const milestoneDate = Temporal.PlainDate.from("2076-01-02"); // Just over 75 years

      const milestone = new Milestone(milestoneDate, "days", 27758, "en-US", now);

      expect(milestone.category).toBe(EventCategory.BeyondHumanLifeExpectancy);
    });

    it("categorizes date 100 years away as BeyondHumanLifeExpectancy", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00");
      const milestoneDate = Temporal.PlainDate.from("2126-07-05"); // 100 years

      const milestone = new Milestone(milestoneDate, "days", 100000, "en-US", now);

      expect(milestone.category).toBe(EventCategory.BeyondHumanLifeExpectancy);
    });

    it("categorizes date 273 years away as BeyondHumanLifeExpectancy", () => {
      const startDate = Temporal.PlainDate.from("2000-01-01");
      const milestoneDate = startDate.add({ days: 100000 }); // 2273-12-05
      const now = Temporal.PlainDateTime.from("2026-01-15T12:00:00");

      const milestone = new Milestone(milestoneDate, "days", 100000, "en-US", now);

      expect(milestone.category).toBe(EventCategory.BeyondHumanLifeExpectancy);
    });
  });

  describe("Edge Cases - Week Boundaries", () => {
    it("handles event on Sunday when today is Saturday (last day of current week)", () => {
      const now = Temporal.PlainDateTime.from("2026-07-04T14:00:00"); // Saturday July 4
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-05T04:15:00"); // Sunday July 5 at 4:15 AM

      const milestone = new Milestone(milestoneDate, "hours", 14, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisWeek);
    });

    it("handles event at 23:59 on Sunday (end of current week)", () => {
      const now = Temporal.PlainDateTime.from("2026-07-04T14:00:00"); // Saturday July 4
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-05T23:59:00"); // Sunday July 5 at 23:59

      const milestone = new Milestone(milestoneDate, "hours", 33, "en-US", now);

      expect(milestone.category).toBe(EventCategory.ThisWeek);
    });

    it("handles event at 00:00 on Monday (start of next week)", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // Sunday July 5
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-06T00:00:00"); // Monday July 6 at 00:00

      const milestone = new Milestone(milestoneDate, "hours", 10, "en-US", now);

      expect(milestone.category).toBe(EventCategory.NextWeek);
    });

    it("handles event on Monday when today is Sunday", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T14:00:00"); // Sunday July 5
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-06T04:15:00"); // Monday July 6 at 4:15 AM

      const milestone = new Milestone(milestoneDate, "minutes", 1000, "en-US", now);

      expect(milestone.category).toBe(EventCategory.NextWeek);
    });

    it("handles Sunday as today", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T10:00:00"); // Sunday July 5 morning
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-05T15:00:00"); // Sunday July 5 afternoon

      const milestone = new Milestone(milestoneDate, "hours", 5, "en-US", now);

      expect(milestone.category).toBe(EventCategory.Today);
    });

    it("handles Monday as today", () => {
      const now = Temporal.PlainDateTime.from("2026-06-29T10:00:00"); // Monday morning
      const milestoneDate = Temporal.PlainDateTime.from("2026-06-29T15:00:00"); // Monday afternoon

      const milestone = new Milestone(milestoneDate, "hours", 5, "en-US", now);

      expect(milestone.category).toBe(EventCategory.Today);
    });
  });

  describe("Edge Cases - Month Boundaries", () => {
    it("handles last hour of month", () => {
      const now = Temporal.PlainDateTime.from("2026-07-31T20:00:00");
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-31T23:59:59");

      const milestone = new Milestone(milestoneDate, "hours", 4, "en-US", now);

      expect(milestone.category).toBe(EventCategory.Today);
    });

    it("handles first hour of next month when it falls in current week", () => {
      const now = Temporal.PlainDateTime.from("2026-07-31T20:00:00"); // Friday
      const milestoneDate = Temporal.PlainDateTime.from("2026-08-01T00:00:01"); // Saturday (still in current week)

      const milestone = new Milestone(milestoneDate, "hours", 4, "en-US", now);

      // Aug 1 is Saturday, which is in the current week (Mon July 27 - Sun Aug 2)
      // Week takes precedence over month
      expect(milestone.category).toBe(EventCategory.ThisWeek);
    });

    it("handles February 28 in non-leap year", () => {
      const now = Temporal.PlainDateTime.from("2027-02-28T12:00:00"); // Sunday
      const milestoneDate = Temporal.PlainDate.from("2027-03-01"); // Monday (start of next week)

      const milestone = new Milestone(milestoneDate, "days", 1, "en-US", now);

      // Mar 1 is Monday (start of next week), week takes precedence over month
      expect(milestone.category).toBe(EventCategory.NextWeek);
    });

    it("handles February 29 in leap year", () => {
      const now = Temporal.PlainDateTime.from("2028-02-29T12:00:00"); // Tuesday Feb 29
      const milestoneDate = Temporal.PlainDate.from("2028-03-01"); // Wednesday Mar 1

      const milestone = new Milestone(milestoneDate, "days", 1, "en-US", now);

      // March 1 is tomorrow (Wednesday), which is still in "This Week" (Mon Feb 28 - Sun Mar 5)
      expect(milestone.category).toBe(EventCategory.ThisWeek);
    });
  });

  describe("Edge Cases - Year Boundaries", () => {
    it("handles last day of year", () => {
      const now = Temporal.PlainDateTime.from("2026-12-31T12:00:00");
      const milestoneDate = Temporal.PlainDateTime.from("2026-12-31T23:59:59");

      const milestone = new Milestone(milestoneDate, "hours", 12, "en-US", now);

      expect(milestone.category).toBe(EventCategory.Today);
    });

    it("handles first second of next year", () => {
      const now = Temporal.PlainDateTime.from("2026-12-31T23:59:00"); // Wednesday Dec 31
      const milestoneDate = Temporal.PlainDateTime.from("2027-01-01T00:00:01"); // Thursday Jan 1

      const milestone = new Milestone(milestoneDate, "minutes", 1, "en-US", now);

      // Jan 1 is tomorrow (Thursday), which is still in "This Week" (Mon Dec 28 - Sun Jan 3)
      expect(milestone.category).toBe(EventCategory.ThisWeek);
    });
  });

  describe("Edge Cases - Time Precision", () => {
    it("handles events one second apart across day boundary", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T23:59:59"); // Sunday 23:59:59
      const milestone1 = new Milestone(
        Temporal.PlainDateTime.from("2026-07-05T23:59:59"), // Sunday (today)
        "seconds", 0, "en-US", now
      );
      const milestone2 = new Milestone(
        Temporal.PlainDateTime.from("2026-07-06T00:00:00"), // Monday (next week)
        "seconds", 1, "en-US", now
      );

      expect(milestone1.category).toBe(EventCategory.Today);
      expect(milestone2.category).toBe(EventCategory.NextWeek); // July 6 is start of next week
    });

    it("handles midnight precisely", () => {
      const now = Temporal.PlainDateTime.from("2026-07-05T00:00:00");
      const milestoneDate = Temporal.PlainDateTime.from("2026-07-05T00:00:00");

      const milestone = new Milestone(milestoneDate, "seconds", 0, "en-US", now);

      expect(milestone.category).toBe(EventCategory.Today);
    });
  });

  describe("Real World Scenario - July 2026", () => {
    // Today is July 5, 2026 (Sunday - last day of current week)
    // This Week: June 29 (Mon) - July 5 (Sun)
    // Next Week: July 6 (Mon) - July 12 (Sun)
    const NOW = Temporal.PlainDateTime.from("2026-07-05T15:21:40");

    it("correctly categorizes +100,000 seconds → July 6, 15:21:40 (Monday)", () => {
      const milestoneDate = NOW.add({ seconds: 100000 }); // ~27.7 hours later
      const milestone = new Milestone(milestoneDate, "seconds", 100000, "en-US", NOW);

      // July 6 is Monday (first day of next week)
      expect(milestone.category).toBe(EventCategory.NextWeek);
    });

    it("correctly categorizes +100 hours → July 9, 15:35:00 (Thursday)", () => {
      const milestoneDate = NOW.add({ hours: 100 });
      const milestone = new Milestone(milestoneDate, "hours", 100, "en-US", NOW);

      // July 9 is Thursday of next week
      expect(milestone.category).toBe(EventCategory.NextWeek);
    });

    it("correctly categorizes +10,000 minutes → July 12, 10:15:00 (Sunday)", () => {
      const milestoneDate = NOW.add({ minutes: 10000 }); // ~6.9 days later
      const milestone = new Milestone(milestoneDate, "minutes", 10000, "en-US", NOW);

      // July 12 is Sunday (last day of next week)
      expect(milestone.category).toBe(EventCategory.NextWeek);
    });

    it("correctly categorizes +1000 minutes → July 6, 04:15:00 (Monday)", () => {
      const milestoneDate = NOW.add({ minutes: 1000 }); // ~16.7 hours later
      const milestone = new Milestone(milestoneDate, "minutes", 1000, "en-US", NOW);

      // July 6 at 4:15 AM is Monday (first day of next week)
      expect(milestone.category).toBe(EventCategory.NextWeek);
    });

    it("correctly categorizes +12,345 minutes → July 14, 01:20:00 (Tuesday)", () => {
      const milestoneDate = NOW.add({ minutes: 12345 }); // ~8.6 days later
      const milestone = new Milestone(milestoneDate, "minutes", 12345, "en-US", NOW);

      // July 14 is Tuesday (after next week ends on July 12)
      expect(milestone.category).toBe(EventCategory.ThisMonth);
    });
  });
});
