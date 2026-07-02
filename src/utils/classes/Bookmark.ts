import { Temporal } from "@js-temporal/polyfill";

/// <summary>
/// This class represents an event saved by a user as a bookmark (to the firebase database).
/// It contains:
/// 1) The unique title of the event (friendly to the user) - required, max 50 chars
/// 2) The input date/datetime string associated with the user's event - required, can be either 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm:ss' format
/// 3) The createdAt timestamp (in milliseconds) when the bookmark was created (Document ID) - required, firebase unique document ID is generated from this timestamp
/// 4) The updatedAt timestamp (in milliseconds) when the bookmark was last updated - optional, if not provided, it will be set to the createdAt timestamp
/// </summary>
export default class Bookmark {
  date: string;
  title: string;
  createdAt: number;
  updatedAt: number;

  constructor(title: string, date: string) {
    this.title = title;
    this.date = date;
    this.createdAt = Temporal.Now.instant().epochMilliseconds;
    this.updatedAt = this.createdAt; // Initialize to createdAt per comment in class description
  }
}
