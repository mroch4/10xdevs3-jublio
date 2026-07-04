import Milestone from "./Milestone";
import { Temporal } from "@js-temporal/polyfill";
import { UnitsConfig } from "../UnitsConfig";
import { type CustomMilestone } from "../../types/CustomMilestone";

/// <summary>
/// Common base class for DateCard and DateTimeCard
/// </summary>
export abstract class CardBase {
  abstract members: string[];
  abstract getBase(unit: string): Temporal.PlainDate | Temporal.PlainDateTime;

  date!: Temporal.PlainDate;
  events: Milestone[] = [];
  locale: string = "en-US";

  constructor(locale: string) {
    this.locale = locale;
  }

  getEvents(customMilestones?: CustomMilestone[]): Milestone[] {
    const events = new Array<Milestone>();

    // Generate default power-of-10 milestones
    UnitsConfig.forEach((item) => {
      if (this.shouldIncludeUnit(item.unit) && item.minExponent !== undefined && item.maxExponent !== undefined) {
        for (let exp = item.minExponent; exp <= item.maxExponent; exp++) {
          const exponent = 10 ** exp;
          const base = this.getBase(item.unit);

          const event = new Milestone(
            base.add({ [item.unit]: exponent }), 
            item.unit, 
            exponent, 
            this.locale,
            undefined, // now
            false,     // isCustom
            undefined  // customId
          );

          events.push(event);
        }
      }
    });

    // Add custom milestones if provided
    if (customMilestones && customMilestones.length > 0) {
      customMilestones.forEach((cm) => {
        const base = this.getBase(cm.unit);

        const customEvent = new Milestone(
          base.add({ [cm.unit]: cm.value }),
          cm.unit,
          cm.value,
          this.locale,
          undefined, // now
          true,      // isCustom
          cm.id      // customId
        );

        events.push(customEvent);
      });
    }

    return events;
  }

  shouldIncludeUnit(unit: string): boolean {
    return this.members.includes(unit);
  }
}
