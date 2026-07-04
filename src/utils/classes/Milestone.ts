import { EventCategory } from "../enums/EventCategory";
import { Temporal } from "@js-temporal/polyfill";

export default class Milestone {
  date: Temporal.PlainDate | Temporal.PlainDateTime;
  dateString: string;
  label: string;
  category: string;
  isCustom: boolean;
  customId?: string;

  constructor(
    date: Temporal.PlainDate | Temporal.PlainDateTime, 
    unit: string, 
    exponent: number, 
    locale: string, 
    now?: Temporal.PlainDateTime,
    isCustom?: boolean,
    customId?: string
  ) {
    this.date = date;
    this.dateString = this.date.toLocaleString(locale);
    this.label = `${new Intl.NumberFormat(locale).format(exponent)} ${unit}`;
    this.category = this.getCategory(now);
    this.isCustom = isCustom ?? false;
    this.customId = customId;
  }

  private getCategory(now?: Temporal.PlainDateTime) {
    const currentTime: Temporal.PlainDateTime = now ?? Temporal.Now.plainDateTimeISO();

    if (this.isPast(currentTime)) {
      return EventCategory.AlreadyPassed;
    }

    if (this.isBeyondLimit(currentTime.add({ years: 75 }))) {
      return EventCategory.BeyondHumanLifeExpectancy;
    }

    if (this.isToday(currentTime)) {
      return EventCategory.Today;
    }

    const currentWeekStarts: Temporal.PlainDateTime = currentTime.subtract({ days: currentTime.dayOfWeek - 1 });
    const currentWeekEnds: Temporal.PlainDateTime = currentWeekStarts.add({ days: 6 });

    if (this.isThisWeek(currentWeekStarts, currentWeekEnds)) {
      return EventCategory.ThisWeek;
    }

    const nextWeekStarts: Temporal.PlainDateTime = currentWeekStarts.add({ days: 7 });
    const nextWeekEnds: Temporal.PlainDateTime = currentWeekEnds.add({ days: 7 });

    if (this.isNextWeek(nextWeekStarts, nextWeekEnds)) {
      return EventCategory.NextWeek;
    }

    if (this.isThisMonth(currentTime)) {
      return EventCategory.ThisMonth;
    }

    if (this.isNextMonth(currentTime.add({ months: 1 }))) {
      return EventCategory.NextMonth;
    }

    if (this.isThisYear(currentTime)) {
      return EventCategory.ThisYear;
    }

    if (this.isNextYear(currentTime)) {
      return EventCategory.NextYear;
    }

    return EventCategory.Further;
  }

  private isBeyondLimit(limit: Temporal.PlainDateTime): boolean {
    return Temporal.PlainDate.compare(this.date, limit) > 0;
  }

  //isNext

  private isNextMonth(nextMonth: Temporal.PlainDateTime): boolean {
    return this.date.year === nextMonth.year && this.date.month === nextMonth.month;
  }

  private isNextWeek(weekStarts: Temporal.PlainDateTime, weekEnds: Temporal.PlainDateTime): boolean {
    return this.isWeek(weekStarts, weekEnds);
  }

  private isNextYear(now: Temporal.PlainDateTime): boolean {
    return this.date.year === now.add({ years: 1 }).year;
  }

  //isThis

  private isThisMonth(now: Temporal.PlainDateTime): boolean {
    return this.date.year === now.year && this.date.month === now.month;
  }

  private isThisWeek(weekStarts: Temporal.PlainDateTime, weekEnds: Temporal.PlainDateTime): boolean {
    return this.isWeek(weekStarts, weekEnds);
  }

  private isThisYear(now: Temporal.PlainDateTime): boolean {
    return this.date.year === now.year;
  }

  //other

  private isPast(now: Temporal.PlainDateTime): boolean {
    if (this.date instanceof Temporal.PlainDateTime) {
      return Temporal.PlainDateTime.compare(this.date, now) < 0;
    }
    return Temporal.PlainDate.compare(this.date, now) < 0;
  }

  private isToday(now: Temporal.PlainDateTime): boolean {
    if (this.date instanceof Temporal.PlainDateTime) {
      return Temporal.PlainDate.compare(this.date, now) === 0;
    }
    return Temporal.PlainDate.compare(this.date, now) === 0;
  }

  private isWeek(weekStarts: Temporal.PlainDateTime, weekEnds: Temporal.PlainDateTime): boolean {
    if (this.date instanceof Temporal.PlainDateTime) {
      return Temporal.PlainDateTime.compare(this.date, weekStarts) >= 0 && Temporal.PlainDateTime.compare(this.date, weekEnds) <= 0;
    }
    return Temporal.PlainDate.compare(this.date, weekStarts) >= 0 && Temporal.PlainDate.compare(this.date, weekEnds) <= 0;
  }
}
