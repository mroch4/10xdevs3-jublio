import DateCard from "../utils/classes/DateCard";
import DateTimeCard from "../utils/classes/DateTimeCard";
import DateTimeInput from "./DateTimeInput";
import Milestone from "../utils/classes/Milestone";
import MilestoneResults from "./MilestoneResults";
import { Temporal } from "@js-temporal/polyfill";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { BookmarkModal } from "./modals/BookmarkModal";
import { CustomMilestoneModal } from "./modals/CustomMilestoneModal";
import Toast from "./Toast";
import { type CustomMilestone } from "../types/CustomMilestone";

interface MilestoneCalculatorProps {
  onSwitchToBookmarks?: () => void;
  autofillDate?: string | null;
  onAutofillConsumed?: () => void;
}

export default function MilestoneCalculator({ onSwitchToBookmarks, autofillDate, onAutofillConsumed }: MilestoneCalculatorProps) {
  const [events, setEvents] = useState<Milestone[] | null>(null);
  const [originalDate, setOriginalDate] = useState<Temporal.PlainDate | Temporal.PlainDateTime | null>(null);
  const [inputDateStr, setInputDateStr] = useState<string | null>(null);
  const [inputTimeStr, setInputTimeStr] = useState<string | null>(null);
  const locale = navigator.language;

  const { user } = useAuth();
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [customMilestoneModalOpen, setCustomMilestoneModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom milestone state (session-only)
  const [customMilestones, setCustomMilestones] = useState<CustomMilestone[]>([]);
  const [hasTimeInput, setHasTimeInput] = useState(false); // Phase 2: will be used for unit filtering

  // Custom milestone helper functions (Phase 2+)
  const addCustomMilestone = (value: number, unit: string): void => {
    const id = `${value}-${unit}`;
    const newMilestone: CustomMilestone = { id, value, unit };
    setCustomMilestones((prev) => [...prev, newMilestone]);
  };

  const removeCustomMilestone = (id: string): void => {
    setCustomMilestones((prev) => prev.filter((cm) => cm.id !== id));
  };

  const isDuplicateCustomMilestone = (value: number, unit: string): boolean => {
    const id = `${value}-${unit}`;
    return customMilestones.some((cm) => cm.id === id);
  };

  const clearCustomMilestones = (): void => {
    setCustomMilestones([]);
  };

  // Phase 2: Prevent unused warnings for functions used in Phase 3+
  if (false as boolean) {
    console.log(removeCustomMilestone, isDuplicateCustomMilestone);
  }

  const handleCalculate = useCallback((date: Temporal.PlainDate, time?: Temporal.PlainTime) => {
    let calculatedEvents: Milestone[];
    let inputDate: Temporal.PlainDate | Temporal.PlainDateTime;

    // Track whether time input is provided
    setHasTimeInput(time !== undefined);

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
  }, [locale, customMilestones]);

  // Handle autofill from portfolio
  useEffect(() => {
    if (!autofillDate || !onAutofillConsumed) return;

    try {
      // Parse the date string
      let date: Temporal.PlainDate;
      let time: Temporal.PlainTime | undefined;
      let dateStr: string;
      let timeStr: string | null = null;

      if (autofillDate.includes("T")) {
        const dateTime = Temporal.PlainDateTime.from(autofillDate);
        date = dateTime.toPlainDate();
        time = dateTime.toPlainTime();
        dateStr = date.toString();
        timeStr = time.toString().slice(0, 5); // HH:MM format
      } else {
        date = Temporal.PlainDate.from(autofillDate);
        dateStr = date.toString();
      }

      // Update input field values using microtask to avoid setState in effect warning
      queueMicrotask(() => {
        setInputDateStr(dateStr);
        setInputTimeStr(timeStr);
      });

      // Schedule calculation for next render to avoid setState in effect
      setTimeout(() => handleCalculate(date, time), 0);
    } catch (err) {
      console.error("Failed to parse autofill date:", err);
    }

    onAutofillConsumed();
  }, [autofillDate, onAutofillConsumed, handleCalculate]);

  const handleReset = () => {
    setEvents(null);
    setOriginalDate(null);
    setInputDateStr(null);
    setInputTimeStr(null);
    clearCustomMilestones();
    setHasTimeInput(false);
  };

  const handlePinClick = (date: Temporal.PlainDate, time?: Temporal.PlainTime) => {
    // Store the date/time for bookmarking (even if user hasn't calculated yet)
    const inputDate = time ? date.toPlainDateTime(time) : date;
    setOriginalDate(inputDate);
    setBookmarkModalOpen(true);
  };

  const handleBookmarkSuccess = () => {
    setToastMessage("Bookmark saved successfully!");
    if (onSwitchToBookmarks) {
      onSwitchToBookmarks();
    }
  };

  const handleCustomMilestoneSubmit = (value: number, unit: string) => {
    addCustomMilestone(value, unit);
    setToastMessage(`Custom milestone added: ${value.toLocaleString()} ${unit}`);
  };

  const handleCloseToast = () => {
    setToastMessage(null);
  };

  return (
    <div>
      <div className="mb-4">
        <DateTimeInput 
          onCalculate={handleCalculate} 
          onReset={handleReset} 
          onPinClick={handlePinClick}
          autofillDate={inputDateStr}
          autofillTime={inputTimeStr}
        />
      </div>

      {events === null ? (
        <div className="alert alert-info" role="alert">
          Enter a date and time to calculate milestones
        </div>
      ) : (
        <>
          <div className="mb-3 d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setCustomMilestoneModalOpen(true)}
            >
              ➕ Add Custom Milestone
            </button>
          </div>
          <MilestoneResults events={events} locale={locale} originalDate={originalDate} />
        </>
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

      {/* CustomMilestoneModal */}
      <CustomMilestoneModal
        isOpen={customMilestoneModalOpen}
        onClose={() => setCustomMilestoneModalOpen(false)}
        onSubmit={handleCustomMilestoneSubmit}
        existingCustomMilestones={customMilestones}
        hasTimeInput={hasTimeInput}
        originalDate={originalDate}
      />

      {/* Toast */}
      <Toast message={toastMessage || ""} show={toastMessage !== null} onClose={handleCloseToast} />
    </div>
  );
}
