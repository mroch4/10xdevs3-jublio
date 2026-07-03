import DateCard from "../utils/classes/DateCard";
import DateTimeCard from "../utils/classes/DateTimeCard";
import DateTimeInput from "./DateTimeInput";
import Milestone from "../utils/classes/Milestone";
import MilestoneResults from "./MilestoneResults";
import { Temporal } from "@js-temporal/polyfill";
import { useState } from "react";

export default function MilestoneCalculator() {
  const [events, setEvents] = useState<Milestone[] | null>(null);
  const [originalDate, setOriginalDate] = useState<Temporal.PlainDate | Temporal.PlainDateTime | null>(null);
  const locale = navigator.language;

  const handleCalculate = (date: Temporal.PlainDate, time?: Temporal.PlainTime) => {
    let calculatedEvents: Milestone[];
    let inputDate: Temporal.PlainDate | Temporal.PlainDateTime;

    if (time) {
      // Time provided: use DateTimeCard for all milestone units
      const dateTime = date.toPlainDateTime(time);
      inputDate = dateTime;
      const card = new DateTimeCard(dateTime, locale);
      calculatedEvents = card.getEvents();
    } else {
      // Time not provided: use DateCard for day-level milestones only
      inputDate = date;
      const card = new DateCard(date, locale);
      calculatedEvents = card.getEvents();
    }

    setOriginalDate(inputDate);
    setEvents(calculatedEvents);
  };

  const handleReset = () => {
    setEvents(null);
    setOriginalDate(null);
  };

  return (
    <div>
      <div className="mb-4">
        <DateTimeInput onCalculate={handleCalculate} onReset={handleReset} />
      </div>

      {events === null ? (
        <div className="alert alert-info" role="alert">
          Enter a date and time to calculate milestones
        </div>
      ) : (
        <MilestoneResults events={events} locale={locale} originalDate={originalDate} />
      )}
    </div>
  );
}
