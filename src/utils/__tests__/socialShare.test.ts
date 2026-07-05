import { describe, it, expect } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { generateShareUrl } from "../socialShare";
import { SocialProvider } from "../enums/SocialProvider";
import Milestone from "../classes/Milestone";
import { ATTRIBUTION_URL } from "../constants";

describe("generateShareUrl - Context-aware text generation", () => {
  const originalDate = Temporal.PlainDate.from("2020-01-01");
  const fixedNow = Temporal.PlainDateTime.from("2026-07-05T12:00:00");

  it("should generate 'Today's exactly' for Today category", () => {
    const milestoneDate = Temporal.PlainDate.from("2026-07-05");
    const milestone = new Milestone(milestoneDate, "days", 1000, "en-US", fixedNow);

    const result = generateShareUrl(milestone, "Wedding", SocialProvider.Copy, originalDate, "en-US");
    expect(result).toContain("Today's exactly");
    expect(result).toContain("1,000 days");
    expect(result).toContain("Wedding");
  });

  it("should generate 'On {date}, it will be exactly' for ThisWeek category", () => {
    const milestoneDate = Temporal.PlainDateTime.from("2026-07-10T14:00:00");
    const milestone = new Milestone(milestoneDate, "hours", 10000, "en-US", fixedNow);

    const result = generateShareUrl(milestone, "Practice", SocialProvider.Copy, originalDate, "en-US");
    expect(result).toMatch(/On .*, it will be exactly/);
    expect(result).toContain("10,000 hours");
  });

  it("should generate 'On {date}, it will be exactly' for NextMonth category", () => {
    const milestoneDate = Temporal.PlainDate.from("2026-08-15");
    const milestone = new Milestone(milestoneDate, "weeks", 500, "en-US", fixedNow);

    const result = generateShareUrl(milestone, "Project", SocialProvider.Copy, originalDate, "en-US");
    expect(result).toMatch(/On .*, it will be exactly/);
  });

  it("should generate 'On {date}, it will be exactly' for Further category", () => {
    const milestoneDate = Temporal.PlainDate.from("2030-01-01");
    const milestone = new Milestone(milestoneDate, "days", 20000, "en-US", fixedNow);

    const result = generateShareUrl(milestone, "Birthday", SocialProvider.Copy, originalDate, "en-US");
    expect(result).toMatch(/On .*, it will be exactly/);
  });

  it("should generate 'On {date}, it will be exactly' for BeyondHumanLifeExpectancy category", () => {
    // Milestone > 75 years from fixedNow (2026-07-05 + 75 years = 2101-07-05)
    const milestoneDate = Temporal.PlainDate.from("2110-01-01");
    const milestone = new Milestone(milestoneDate, "days", 40000, "en-US", fixedNow);

    const result = generateShareUrl(milestone, "Ancient Event", SocialProvider.Copy, originalDate, "en-US");
    expect(result).toMatch(/On .*, it will be exactly/);
  });

  it("should generate 'On {date}, it was exactly' for AlreadyPassed category", () => {
    const milestoneDate = Temporal.PlainDate.from("2021-07-05"); // Past date
    const milestone = new Milestone(milestoneDate, "years", 5, "en-US", fixedNow);

    const result = generateShareUrl(milestone, "Anniversary", SocialProvider.Copy, originalDate, "en-US");
    expect(result).toMatch(/On .*, it was exactly/);
  });
});

describe("generateShareUrl - Provider URL formats", () => {
  const originalDate = Temporal.PlainDate.from("2020-01-01");
  const fixedNow = Temporal.PlainDateTime.from("2026-07-05T12:00:00");
  const milestoneDate = Temporal.PlainDate.from("2026-07-05");
  const todayMilestone = new Milestone(milestoneDate, "days", 1000, "en-US", fixedNow);

  it("should generate WhatsApp URL with encoded text", () => {
    const result = generateShareUrl(todayMilestone, "Wedding", SocialProvider.WhatsApp, originalDate, "en-US");
    expect(result).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(result).toContain("Today"); // Text is encoded
    expect(result).toContain("exactly");
    expect(result).toContain("%20"); // Spaces encoded
  });

  it("should generate Twitter URL with encoded text", () => {
    const result = generateShareUrl(todayMilestone, "Wedding", SocialProvider.Twitter, originalDate, "en-US");
    expect(result).toMatch(/^https:\/\/twitter\.com\/intent\/tweet\?text=/);
    expect(result).toContain("Today");
    expect(result).toContain("%20"); // Spaces encoded
  });

  it("should generate SMS URL with encoded text", () => {
    const result = generateShareUrl(todayMilestone, "Wedding", SocialProvider.SMS, originalDate, "en-US");
    expect(result).toMatch(/^sms:\?&body=/);
    expect(result).toContain("Today");
    expect(result).toContain("%20"); // Spaces encoded
  });

  it("should generate Facebook URL with encoded URL (no custom text)", () => {
    const result = generateShareUrl(todayMilestone, "Wedding", SocialProvider.Facebook, originalDate, "en-US");
    expect(result).toMatch(/^https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=/);
    expect(result).toContain(encodeURIComponent(ATTRIBUTION_URL));
    expect(result).not.toContain("Wedding"); // Facebook only shares URL
  });

  it("should generate Messenger URL with encoded URL (no custom text)", () => {
    const result = generateShareUrl(todayMilestone, "Wedding", SocialProvider.Messenger, originalDate, "en-US");
    expect(result).toMatch(/^https:\/\/www\.facebook\.com\/dialog\/send\?link=/);
    expect(result).toContain(encodeURIComponent(ATTRIBUTION_URL));
  });

  it("should generate LinkedIn URL with encoded URL (no custom text)", () => {
    const result = generateShareUrl(todayMilestone, "Wedding", SocialProvider.LinkedIn, originalDate, "en-US");
    expect(result).toMatch(/^https:\/\/www\.linkedin\.com\/sharing\/share-offsite\/\?url=/);
    expect(result).toContain(encodeURIComponent(ATTRIBUTION_URL));
  });

  it("should return text directly for Copy provider (no URL)", () => {
    const result = generateShareUrl(todayMilestone, "Wedding", SocialProvider.Copy, originalDate, "en-US");
    expect(result).not.toMatch(/^https?:\/\//); // Not a URL
    expect(result).toContain("Today's exactly"); // Plain text (not encoded)
    expect(result).toContain("Wedding");
  });
});

describe("generateShareUrl - Character encoding", () => {
  const originalDate = Temporal.PlainDate.from("2020-01-01");
  const fixedNow = Temporal.PlainDateTime.from("2026-07-05T12:00:00");
  const milestoneDate = Temporal.PlainDate.from("2026-07-05");
  const todayMilestone = new Milestone(milestoneDate, "days", 1000, "en-US", fixedNow);

  it("should properly encode special characters in URL providers", () => {
    const result = generateShareUrl(todayMilestone, "Company Launch & New \"Era\" @ 2026", SocialProvider.WhatsApp, originalDate, "en-US");
    expect(result).toContain("%26"); // & encoded
    expect(result).toContain("%22"); // " encoded
    expect(result).toContain("%40"); // @ encoded
  });

  it("should NOT encode text for Copy provider", () => {
    const result = generateShareUrl(todayMilestone, "Company Launch & New \"Era\" @ 2026", SocialProvider.Copy, originalDate, "en-US");
    expect(result).toContain("Company Launch & New \"Era\" @ 2026"); // Plain text
    expect(result).not.toContain("%26");
    expect(result).not.toContain("%22");
  });

  it("should properly encode emoji in URL providers", () => {
    const result = generateShareUrl(todayMilestone, "🎉 Wedding 🎉", SocialProvider.Twitter, originalDate, "en-US");
    expect(result).toContain("%F0%9F%8E%89"); // 🎉 encoded
  });
});

describe("generateShareUrl - Attribution URL", () => {
  const originalDate = Temporal.PlainDate.from("2020-01-01");
  const fixedNow = Temporal.PlainDateTime.from("2026-07-05T12:00:00");
  const milestoneDate = Temporal.PlainDate.from("2026-07-05");
  const todayMilestone = new Milestone(milestoneDate, "days", 1000, "en-US", fixedNow);

  it("should include attribution URL in all providers", () => {
    const providers = [
      SocialProvider.WhatsApp,
      SocialProvider.Twitter,
      SocialProvider.SMS,
      SocialProvider.Facebook,
      SocialProvider.Messenger,
      SocialProvider.LinkedIn,
      SocialProvider.Copy,
    ];

    providers.forEach((provider) => {
      const result = generateShareUrl(todayMilestone, "Wedding", provider, originalDate, "en-US");
      // Attribution URL should appear either encoded or plain
      const containsEncoded = result.includes(encodeURIComponent(ATTRIBUTION_URL));
      const containsPlain = result.includes(ATTRIBUTION_URL);
      expect(containsEncoded || containsPlain).toBe(true);
    });
  });
});

describe("generateShareUrl - Edge cases", () => {
  const originalDate = Temporal.PlainDate.from("2020-01-01");
  const fixedNow = Temporal.PlainDateTime.from("2026-07-05T12:00:00");

  it("should handle very long label without truncation", () => {
    const milestoneDate = Temporal.PlainDate.from("2026-07-05");
    const todayMilestone = new Milestone(milestoneDate, "days", 1000, "en-US", fixedNow);

    const longLabel = "My Amazing Once-In-A-Lifetime Super Special Event That Changed Everything Forever And Ever And Ever And Even More Text To Make It Really Long";
    const result = generateShareUrl(todayMilestone, longLabel, SocialProvider.Copy, originalDate, "en-US");

    expect(result).toContain(longLabel); // Function doesn't truncate, returns full text
    // Note: Character limit enforcement happens in UI (ShareModal), not in this function
  });

  it("should format originalDate according to locale", () => {
    const milestoneDate = Temporal.PlainDate.from("2026-07-05");
    const todayMilestone = new Milestone(milestoneDate, "days", 1000, "en-US", fixedNow);

    const dateTime = Temporal.PlainDateTime.from("2020-01-15T14:30:00");

    const enResult = generateShareUrl(todayMilestone, "Wedding", SocialProvider.Copy, dateTime, "en-US");
    const plResult = generateShareUrl(todayMilestone, "Wedding", SocialProvider.Copy, dateTime, "pl-PL");

    expect(enResult).toContain("1/15/2020"); // US format
    expect(plResult).toContain("15.01.2020"); // Polish format
  });

  it("should handle PlainDate vs PlainDateTime originalDate", () => {
    const milestoneDate = Temporal.PlainDate.from("2026-07-05");
    const todayMilestone = new Milestone(milestoneDate, "days", 1000, "en-US", fixedNow);

    const plainDate = Temporal.PlainDate.from("2020-01-01");
    const plainDateTime = Temporal.PlainDateTime.from("2020-01-01T12:30:00");

    const dateResult = generateShareUrl(todayMilestone, "Wedding", SocialProvider.Copy, plainDate, "en-US");
    const dateTimeResult = generateShareUrl(todayMilestone, "Wedding", SocialProvider.Copy, plainDateTime, "en-US");

    expect(dateResult).toContain("1/1/2020"); // Date only
    expect(dateTimeResult).toContain("1/1/2020"); // DateTime includes time
    expect(dateTimeResult).toContain("12:30");
  });
});
