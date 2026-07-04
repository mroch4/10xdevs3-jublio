import { CardBase } from "./CardBase";
import { DateTimeUnit } from "../enums/DateTimeUnit";
import { Temporal } from "@js-temporal/polyfill";
import { type CustomMilestone } from "../../types/CustomMilestone";

export default class DateCard extends CardBase {
  members: string[] = [DateTimeUnit.Days, DateTimeUnit.Weeks, DateTimeUnit.Months];

  constructor(date: Temporal.PlainDate, locale: string, customMilestones?: CustomMilestone[]) {
    super(locale);
    this.date = date;
    this.events = this.getEvents(customMilestones);
  }

  getBase(unit: string): Temporal.PlainDate {
    if (this.shouldIncludeUnit(unit)) {
      return this.date;
    } else {
      throw new Error(`Invalid unit '${unit}' for DateCard.`);
    }
  }
}
