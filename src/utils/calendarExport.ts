import { CalendarProvider } from "./enums/CalendarProvider";
import Milestone from "./classes/Milestone";
import { Temporal } from "@js-temporal/polyfill";

/**
 * Generate a calendar deep link URL for the specified provider
 */
export function generateCalendarUrl(event: Milestone, label: string, provider: CalendarProvider): string {
  const title = formatEventTitle(event, label);
  const isAllDay = event.date instanceof Temporal.PlainDate;

  let startDate: string;
  let endDate: string;

  if (provider === CalendarProvider.Outlook) {
    // Outlook
    startDate = formatDateForOutlook(event.date, false);
    endDate = formatDateForOutlook(event.date, true);
    return buildOutlookCalendarUrl(title, startDate, endDate, isAllDay);
  } else {
    // Google and Apple (Apple uses Google Calendar URL)
    startDate = formatDateForGoogle(event.date, false);
    endDate = formatDateForGoogle(event.date, true);
    return buildGoogleCalendarUrl(title, startDate, endDate);
  }
}

/**
 * Format event title: "[event.label] milestone of [user label]"
 * Example: "10,000 days milestone of Wedding"
 */
export function formatEventTitle(event: Milestone, userLabel: string): string {
  return `${event.label} milestone of ${userLabel}`;
}

/**
 * Format date for Google Calendar URL
 * PlainDate → YYYYMMDD
 * PlainDateTime → YYYYMMDDTHHmmss (local timezone, no Z suffix)
 */
export function formatDateForGoogle(date: Temporal.PlainDate | Temporal.PlainDateTime, isEnd: boolean): string {
  let dateToFormat = date;

  // For timed events, add 1 hour if this is the end date
  if (dateToFormat instanceof Temporal.PlainDateTime && isEnd) {
    dateToFormat = dateToFormat.add({ hours: 1 });
  }

  // For all-day events, add 1 day if this is the end date (Google uses exclusive end)
  if (dateToFormat instanceof Temporal.PlainDate && isEnd) {
    dateToFormat = dateToFormat.add({ days: 1 });
  }

  if (dateToFormat instanceof Temporal.PlainDate) {
    // All-day format: YYYYMMDD
    const year = dateToFormat.year.toString().padStart(4, "0");
    const month = dateToFormat.month.toString().padStart(2, "0");
    const day = dateToFormat.day.toString().padStart(2, "0");
    return `${year}${month}${day}`;
  } else {
    // Timed format: YYYYMMDDTHHmmss (no Z suffix = local time)
    // Verify format produces "YYYY-MM-DDTHH:mm:ss"
    const isoString = dateToFormat.toString({ smallestUnit: "second" });
    // Remove separators: YYYY-MM-DDTHH:mm:ss → YYYYMMDDTHHmmss
    return isoString.replace(/[-:]/g, "");
  }
}

/**
 * Format date for Outlook Calendar URL
 * PlainDate → YYYY-MM-DD
 * PlainDateTime → YYYY-MM-DDTHH:mm:ss (local timezone, no Z suffix)
 */
export function formatDateForOutlook(date: Temporal.PlainDate | Temporal.PlainDateTime, isEnd: boolean): string {
  let dateToFormat = date;

  // For timed events, add 1 hour if this is the end date
  if (dateToFormat instanceof Temporal.PlainDateTime && isEnd) {
    dateToFormat = dateToFormat.add({ hours: 1 });
  }

  // For all-day events, add 1 day if this is the end date (Outlook uses exclusive end)
  if (dateToFormat instanceof Temporal.PlainDate && isEnd) {
    dateToFormat = dateToFormat.add({ days: 1 });
  }

  if (dateToFormat instanceof Temporal.PlainDate) {
    // All-day format: YYYY-MM-DD
    const year = dateToFormat.year.toString().padStart(4, "0");
    const month = dateToFormat.month.toString().padStart(2, "0");
    const day = dateToFormat.day.toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  } else {
    // Timed format: YYYY-MM-DDTHH:mm:ss (no Z suffix = local time)
    // Verify format produces "YYYY-MM-DDTHH:mm:ss"
    return dateToFormat.toString({ smallestUnit: "second" });
  }
}

/**
 * Build Google Calendar URL
 * https://calendar.google.com/calendar/render?action=TEMPLATE&text={TITLE}&dates={START}/{END}
 */
export function buildGoogleCalendarUrl(title: string, start: string, end: string): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Build Outlook Calendar URL
 * https://outlook.live.com/calendar/0/deeplink/compose?subject={TITLE}&startdt={START}&enddt={END}&allday={true|false}
 */
export function buildOutlookCalendarUrl(title: string, start: string, end: string, isAllDay: boolean): string {
  const params = new URLSearchParams({
    subject: title,
    startdt: start,
    enddt: end,
    allday: isAllDay.toString(),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
