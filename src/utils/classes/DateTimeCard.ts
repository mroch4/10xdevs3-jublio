import { CardBase } from "./CardBase";
import { DateTimeUnit } from "../enums/DateTimeUnit";
import { Temporal } from "@js-temporal/polyfill";

export default class DateTimeCard extends CardBase {
  dateTime: Temporal.PlainDateTime;
  members: string[] = [DateTimeUnit.Seconds, DateTimeUnit.Minutes, DateTimeUnit.Hours, DateTimeUnit.Days, DateTimeUnit.Weeks, DateTimeUnit.Months];

  constructor(dateTime: Temporal.PlainDateTime, locale: string) {
    super(locale);
    this.date = dateTime.toPlainDate();
    this.dateTime = dateTime;
    this.events = this.getEvents();
  }

  getBase(unit: string): Temporal.PlainDateTime {
    if (this.shouldIncludeUnit(unit)) {
      return this.dateTime;
    } else {
      throw new Error(`Invalid unit '${unit}' for DateTimeCard.`);
    }
  }
}
