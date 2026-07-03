import { CalendarProvider } from "./enums/CalendarProvider";
import Milestone from "./classes/Milestone";
import { Temporal } from "@js-temporal/polyfill";

/**
 * Generate a calendar deep link URL or ICS content for the specified provider
 * For Apple, returns a data URL for .ics file download
 */
export function generateCalendarUrl(
  event: Milestone, 
  label: string, 
  provider: CalendarProvider,
  originalDate: Temporal.PlainDate | Temporal.PlainDateTime,
  locale: string
): string {
  const title = formatEventTitle(event, label, originalDate, locale);
  const isAllDay = event.date instanceof Temporal.PlainDate;

  switch (provider) {
    case CalendarProvider.Apple: {
      // Apple: Generate .ics file content
      return generateIcsFile(event, title, isAllDay);
    }
    case CalendarProvider.Outlook: {
      // Outlook
      const outlookStartDate = formatDateForOutlook(event.date, false);
      const outlookEndDate = formatDateForOutlook(event.date, true);
      return buildOutlookCalendarUrl(title, outlookStartDate, outlookEndDate, isAllDay);
    }
    case CalendarProvider.Google: {
      // Google
      const googleStartDate = formatDateForGoogle(event.date, false);
      const googleEndDate = formatDateForGoogle(event.date, true);
      return buildGoogleCalendarUrl(title, googleStartDate, googleEndDate);
    }
    default: {
      throw new Error(`Unsupported calendar provider: ${provider}`);
    }
  }
}

/**
 * Format event title: "[event.label] since [user label] ([original date])"
 * Example: "10,000 days since Wedding (2000-01-15)"
 */
export function formatEventTitle(
  event: Milestone, 
  userLabel: string,
  originalDate: Temporal.PlainDate | Temporal.PlainDateTime,
  locale: string
): string {
  const formattedOriginalDate = originalDate.toLocaleString(locale);
  return `${event.label} since ${userLabel} (${formattedOriginalDate})`;
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

/**
 * Generate ICS file content for Apple Calendar
 * Returns a data URL that triggers download
 */
export function generateIcsFile(event: Milestone, title: string, isAllDay: boolean): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let dtstart: string;
  let dtend: string;

  if (isAllDay) {
    // All-day event: use DATE format (YYYYMMDD)
    dtstart = formatDateForIcs(event.date as Temporal.PlainDate, false);
    dtend = formatDateForIcs(event.date as Temporal.PlainDate, true);
  } else {
    // Timed event: use DATE-TIME format (YYYYMMDDTHHmmss)
    dtstart = formatDateTimeForIcs(event.date as Temporal.PlainDateTime, false);
    dtend = formatDateTimeForIcs(event.date as Temporal.PlainDateTime, true);
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jublio//Milestone Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${timestamp}@jublio.app`,
    `DTSTAMP:${timestamp}`,
    isAllDay ? `DTSTART;VALUE=DATE:${dtstart}` : `DTSTART:${dtstart}`,
    isAllDay ? `DTEND;VALUE=DATE:${dtend}` : `DTEND:${dtend}`,
    `SUMMARY:${title}`,
    'DESCRIPTION:Calculated with Jublio',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  // Create blob and return data URL
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

/**
 * Format date for ICS file (all-day events)
 * PlainDate → YYYYMMDD
 */
function formatDateForIcs(date: Temporal.PlainDate, isEnd: boolean): string {
  // For all-day events, end date should be the next day
  const actualDate = isEnd ? date.add({ days: 1 }) : date;
  const year = actualDate.year.toString().padStart(4, '0');
  const month = actualDate.month.toString().padStart(2, '0');
  const day = actualDate.day.toString().padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Format date-time for ICS file (timed events)
 * PlainDateTime → YYYYMMDDTHHmmss (local timezone)
 */
function formatDateTimeForIcs(dateTime: Temporal.PlainDateTime, isEnd: boolean): string {
  // For timed events, end time is 1 hour after start
  const actualDateTime = isEnd ? dateTime.add({ hours: 1 }) : dateTime;
  const year = actualDateTime.year.toString().padStart(4, '0');
  const month = actualDateTime.month.toString().padStart(2, '0');
  const day = actualDateTime.day.toString().padStart(2, '0');
  const hour = actualDateTime.hour.toString().padStart(2, '0');
  const minute = actualDateTime.minute.toString().padStart(2, '0');
  const second = actualDateTime.second.toString().padStart(2, '0');
  return `${year}${month}${day}T${hour}${minute}${second}`;
}
