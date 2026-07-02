import Event from "./Event";
import { Temporal } from "@js-temporal/polyfill";
import { UnitsConfig } from "../UnitsConfig";

/// <summary>
/// Common base class for DateCard and DateTimeCard
/// </summary>
export abstract class CardBase {
  abstract members: string[];
  abstract getBase(unit: string): Temporal.PlainDate | Temporal.PlainDateTime;

  date!: Temporal.PlainDate;
  events: Event[] = [];
  locale: string = "en-US";

  constructor(locale: string) {
    this.locale = locale;
  }

  getEvents(): Event[] {
    const events = new Array<Event>();

    UnitsConfig.forEach((item) => {
      if (this.shouldIncludeUnit(item.unit) && item.minExponent !== undefined && item.maxExponent !== undefined) {
        for (let exp = item.minExponent; exp <= item.maxExponent; exp++) {
          const exponent = 10 ** exp;
          const base = this.getBase(item.unit);

          const event = new Event(base.add({ [item.unit]: exponent }), item.unit, exponent, this.locale);

          events.push(event);
        }
      }
    });

    return events;
  }

  shouldIncludeUnit(unit: string): boolean {
    return this.members.includes(unit);
  }
}
