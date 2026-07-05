import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import {
  formatEventTitle,
  formatDateForGoogle,
  formatDateForOutlook,
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  generateIcsFile,
} from "../calendarExport";
import Milestone from "../classes/Milestone";

describe("formatEventTitle", () => {
  const fixedNow = Temporal.PlainDateTime.from("2026-07-05T12:00:00");

  it("should format title with PlainDate", () => {
    const milestoneDate = Temporal.PlainDate.from("2026-07-05");
    const milestone = new Milestone(milestoneDate, "days", 1000, "en-US", fixedNow);
    const originalDate = Temporal.PlainDate.from("2020-01-01");

    const result = formatEventTitle(milestone, "Wedding", originalDate, "en-US");
    expect(result).toBe("1,000 days since Wedding (1/1/2020)");
  });

  it("should format title with PlainDateTime", () => {
    const milestoneDate = Temporal.PlainDateTime.from("2026-07-05T14:30:00");
    const milestone = new Milestone(milestoneDate, "hours", 10000, "en-US", fixedNow);
    const originalDateTime = Temporal.PlainDateTime.from("2020-01-15T12:30:00");

    const result = formatEventTitle(milestone, "Project", originalDateTime, "en-US");
    expect(result).toContain("10,000 hours since Project");
    expect(result).toContain("1/15/2020");
    expect(result).toContain("12:30");
  });

  it("should format title with different locale", () => {
    const milestoneDate = Temporal.PlainDate.from("2026-07-05");
    const milestone = new Milestone(milestoneDate, "weeks", 500, "pl-PL", fixedNow);
    const originalDate = Temporal.PlainDate.from("2020-01-15");

    const result = formatEventTitle(milestone, "Ślub", originalDate, "pl-PL");
    expect(result).toContain("500 weeks since Ślub");
    expect(result).toContain("15.01.2020"); // Polish format
  });
});

describe("formatDateForGoogle", () => {
  it("should format all-day start date as YYYYMMDD", () => {
    const date = Temporal.PlainDate.from("2026-07-05");
    const result = formatDateForGoogle(date, false);
    expect(result).toBe("20260705");
  });

  it("should format all-day end date as YYYYMMDD with +1 day", () => {
    const date = Temporal.PlainDate.from("2026-07-05");
    const result = formatDateForGoogle(date, true);
    expect(result).toBe("20260706"); // Next day
  });

  it("should format timed start as YYYYMMDDTHHmmss", () => {
    const dateTime = Temporal.PlainDateTime.from("2026-07-05T14:30:00");
    const result = formatDateForGoogle(dateTime, false);
    expect(result).toBe("20260705T143000");
  });

  it("should format timed end as YYYYMMDDTHHmmss with +1 hour", () => {
    const dateTime = Temporal.PlainDateTime.from("2026-07-05T14:30:00");
    const result = formatDateForGoogle(dateTime, true);
    expect(result).toBe("20260705T153000"); // +1 hour
  });
});

describe("formatDateForOutlook", () => {
  it("should format all-day start date as YYYY-MM-DD", () => {
    const date = Temporal.PlainDate.from("2026-07-05");
    const result = formatDateForOutlook(date, false);
    expect(result).toBe("2026-07-05");
  });

  it("should format all-day end date as YYYY-MM-DD with +1 day", () => {
    const date = Temporal.PlainDate.from("2026-07-05");
    const result = formatDateForOutlook(date, true);
    expect(result).toBe("2026-07-06"); // Next day
  });

  it("should format timed start as YYYY-MM-DDTHH:mm:ss", () => {
    const dateTime = Temporal.PlainDateTime.from("2026-07-05T14:30:00");
    const result = formatDateForOutlook(dateTime, false);
    expect(result).toBe("2026-07-05T14:30:00");
  });

  it("should format timed end as YYYY-MM-DDTHH:mm:ss with +1 hour", () => {
    const dateTime = Temporal.PlainDateTime.from("2026-07-05T14:30:00");
    const result = formatDateForOutlook(dateTime, true);
    expect(result).toBe("2026-07-05T15:30:00"); // +1 hour
  });
});

describe("buildGoogleCalendarUrl", () => {
  it("should generate correct Google Calendar URL structure", () => {
    const result = buildGoogleCalendarUrl("Test Event", "20260705", "20260706");

    expect(result).toContain("https://calendar.google.com/calendar/render");
    expect(result).toContain("action=TEMPLATE");
    expect(result).toContain("text=Test+Event");
    expect(result).toContain("dates=20260705%2F20260706");
  });

  it("should properly encode special characters in title", () => {
    const result = buildGoogleCalendarUrl("Event & \"Special\" @ 2026", "20260705", "20260706");

    expect(result).toContain("Event");
    expect(result).toContain("%26"); // & encoded
    expect(result).toContain("%22"); // " encoded
    expect(result).toContain("%40"); // @ encoded
  });
});

describe("buildOutlookCalendarUrl", () => {
  it("should generate correct Outlook URL structure for all-day", () => {
    const result = buildOutlookCalendarUrl("Test Event", "2026-07-05", "2026-07-06", true);

    expect(result).toContain("https://outlook.live.com/calendar/0/deeplink/compose");
    expect(result).toContain("subject=Test+Event");
    expect(result).toContain("startdt=2026-07-05");
    expect(result).toContain("enddt=2026-07-06");
    expect(result).toContain("allday=true");
  });

  it("should generate correct Outlook URL structure for timed", () => {
    const result = buildOutlookCalendarUrl("Meeting", "2026-07-05T14:30:00", "2026-07-05T15:30:00", false);

    expect(result).toContain("subject=Meeting");
    expect(result).toContain("startdt=2026-07-05T14%3A30%3A00");
    expect(result).toContain("enddt=2026-07-05T15%3A30%3A00");
    expect(result).toContain("allday=false");
  });
});

describe("generateIcsFile", () => {
  const fixedNow = Temporal.PlainDateTime.from("2026-07-05T12:00:00");

  it("should generate ICS content with required VCALENDAR structure", () => {
    const milestoneDate = Temporal.PlainDate.from("2026-07-05");
    const milestone = new Milestone(milestoneDate, "days", 1000, "en-US", fixedNow);

    // Generate ICS file (returns Blob URL)
    const result = generateIcsFile(milestone, "1,000 days since Wedding (1/1/2020)", true);

    // Result should be a Blob URL
    expect(result).toMatch(/^blob:/);
  });

  it("should generate ICS for timed event", () => {
    const milestoneDateTime = Temporal.PlainDateTime.from("2026-07-05T14:30:00");
    const milestone = new Milestone(milestoneDateTime, "hours", 10000, "en-US", fixedNow);

    const result = generateIcsFile(milestone, "10,000 hours since Project", false);

    // Result should be a Blob URL
    expect(result).toMatch(/^blob:/);
  });
});

describe("Calendar export edge cases", () => {
  it("should handle special characters in event titles", () => {
    const title = "Wedding & Anniversary \"Special\" @ Hotel";

    const googleUrl = buildGoogleCalendarUrl(title, "20260705", "20260706");
    const outlookUrl = buildOutlookCalendarUrl(title, "2026-07-05", "2026-07-06", true);

    // URLs should contain encoded special characters
    expect(googleUrl).toContain("%26");
    expect(outlookUrl).toContain("%26");
  });
});
