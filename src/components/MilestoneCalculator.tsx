import DateCard from "../utils/classes/DateCard";
import DateTimeCard from "../utils/classes/DateTimeCard";
import DateTimeInput from "./DateTimeInput";
import Milestone from "../utils/classes/Milestone";
import MilestoneResults from "./MilestoneResults";
import { Temporal } from "@js-temporal/polyfill";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { BookmarkModal } from "./BookmarkModal";
import Toast from "./Toast";

export default function MilestoneCalculator() {
  const [events, setEvents] = useState<Milestone[] | null>(null);
  const [originalDate, setOriginalDate] = useState<Temporal.PlainDate | Temporal.PlainDateTime | null>(null);
  const locale = navigator.language;

  const { user } = useAuth();
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handlePinClick = (date: Temporal.PlainDate, time?: Temporal.PlainTime) => {
    // Store the date/time for bookmarking (even if user hasn't calculated yet)
    const inputDate = time ? date.toPlainDateTime(time) : date;
    setOriginalDate(inputDate);
    setBookmarkModalOpen(true);
  };

  const handleBookmarkSuccess = () => {
    setToastMessage("Bookmark saved successfully!");
    // TODO Phase 2: Switch to Portfolio tab
  };

  const handleCloseToast = () => {
    setToastMessage(null);
  };

  return (
    <div>
      <div className="mb-4">
        <DateTimeInput onCalculate={handleCalculate} onReset={handleReset} onPinClick={handlePinClick} />
      </div>

      {events === null ? (
        <div className="alert alert-info" role="alert">
          Enter a date and time to calculate milestones
        </div>
      ) : (
        <MilestoneResults events={events} locale={locale} originalDate={originalDate} />
      )}

      {/* BookmarkModal */}
      {user && originalDate && (
        <BookmarkModal
          isOpen={bookmarkModalOpen}
          onClose={() => setBookmarkModalOpen(false)}
          onSuccess={handleBookmarkSuccess}
          inputDate={originalDate}
          userEmail={user.email || ""}
        />
      )}

      {/* Toast */}
      <Toast message={toastMessage || ""} show={toastMessage !== null} onClose={handleCloseToast} />
    </div>
  );
}
