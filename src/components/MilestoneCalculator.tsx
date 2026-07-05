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
  const [hasTimeInput, setHasTimeInput] = useState(false); // Track time input for unit filtering

  const handleCalculate = useCallback(
    (date: Temporal.PlainDate, time?: Temporal.PlainTime) => {
      let calculatedEvents: Milestone[];
      let inputDate: Temporal.PlainDate | Temporal.PlainDateTime;

      // Track whether time input is provided
      setHasTimeInput(time !== undefined);

      if (time) {
        // Time provided: use DateTimeCard for all milestone units
        const dateTime = date.toPlainDateTime(time);
        inputDate = dateTime;
        const card = new DateTimeCard(dateTime, locale, customMilestones);
        calculatedEvents = card.events;
      } else {
        // Time not provided: use DateCard for day-level milestones only
        inputDate = date;
        const card = new DateCard(date, locale, customMilestones);
        calculatedEvents = card.events;
      }

      setOriginalDate(inputDate);
      setEvents(calculatedEvents);
    },
    [locale, customMilestones]
  );

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

  // Recalculate when custom milestones change (after initial calculation)
  useEffect(() => {
    if (!originalDate || !inputDateStr) return;

    // Re-run calculation with updated custom milestones
    try {
      const date = Temporal.PlainDate.from(inputDateStr);
      const time = inputTimeStr ? Temporal.PlainTime.from(inputTimeStr) : undefined;

      let calculatedEvents: Milestone[];
      if (time) {
        const dateTime = date.toPlainDateTime(time);
        const card = new DateTimeCard(dateTime, locale, customMilestones);
        calculatedEvents = card.events;
      } else {
        const card = new DateCard(date, locale, customMilestones);
        calculatedEvents = card.events;
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEvents(calculatedEvents);
    } catch {
      // If parsing fails, skip recalculation
    }
  }, [customMilestones, originalDate, inputDateStr, inputTimeStr, locale]);

  const handleReset = () => {
    // Clear calculation but preserve custom milestones
    setEvents(null);
    setOriginalDate(null);
    setInputDateStr(null);
    setInputTimeStr(null);
    setHasTimeInput(false);
  };

  const handleSetToNow = () => {
    // Same as reset - clear calculation but preserve custom milestones
    setEvents(null);
    setOriginalDate(null);
    setInputDateStr(null);
    setInputTimeStr(null);
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

  const handleCustomMilestoneSubmit = (milestones: CustomMilestone[]) => {
    setCustomMilestones(milestones);
  };

  const handleCloseToast = () => {
    setToastMessage(null);
  };

  const handleValidationError = () => {
    setEvents(null);
    setOriginalDate(null);
  };

  return (
    <div>
      <div className="mb-4">
        <DateTimeInput 
          onCalculate={handleCalculate} 
          onReset={handleReset}
          onSetToNow={handleSetToNow}
          onPinClick={handlePinClick} 
          onCustomMilestonesClick={() => setCustomMilestoneModalOpen(true)}
          onValidationError={handleValidationError}
          autofillDate={inputDateStr} 
          autofillTime={inputTimeStr}
          hasCalculation={!!originalDate}
        />
      </div>

      <MilestoneResults events={events || []} locale={locale} originalDate={originalDate} />

      {/* BookmarkModal */}
      {user && originalDate && (
        <BookmarkModal isOpen={bookmarkModalOpen} onClose={() => setBookmarkModalOpen(false)} onSuccess={handleBookmarkSuccess} inputDate={originalDate} userEmail={user.email || ""} />
      )}

      {/* CustomMilestoneModal */}
      <CustomMilestoneModal
        isOpen={customMilestoneModalOpen}
        onClose={() => setCustomMilestoneModalOpen(false)}
        onUpdateCustomMilestones={handleCustomMilestoneSubmit}
        existingCustomMilestones={customMilestones}
        hasTimeInput={hasTimeInput}
        originalDate={originalDate}
      />

      {/* Toast */}
      <Toast message={toastMessage || ""} show={toastMessage !== null} onClose={handleCloseToast} />
    </div>
  );
}
