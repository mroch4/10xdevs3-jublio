import DateCard from "./DateCard";
import DateTimeCard from "./DateTimeCard";
import { Temporal } from "@js-temporal/polyfill";

/// <summary>
/// This class is responsible for determining the type of card (DateCard or DateTimeCard) based on the input date string format.
/// It acts as a wrapper that initializes the appropriate card type and provides access to it.
/// </summary>
export default class CardWrapper {
  date: string;
  locale: string;
  card: DateCard | DateTimeCard;

  constructor(date: string, locale: string) {
    this.date = date;
    this.locale = locale;
    this.card = this.getCard();
  }

  private dateFormat: string = "YYYY-MM-DD";
  private datetimeFormat: string = "YYYY-MM-DDTHH:mm:ss";

  private getCard(): DateCard | DateTimeCard {
    if (this.date.length === this.dateFormat.length) {
      return new DateCard(Temporal.PlainDate.from(this.date), this.locale);
    }

    if (this.date.length === this.datetimeFormat.length) {
      return new DateTimeCard(Temporal.PlainDateTime.from(this.date), this.locale);
    }

    throw new Error(`Unknown input format: ${this.date}`);
  }
}
