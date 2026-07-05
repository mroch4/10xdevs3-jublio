import "./Animations.css";

import { useEffect, useState } from "react";

import { AuthModal } from "./modals/AuthModal";
import { Temporal } from "@js-temporal/polyfill";
import { useAuth } from "../hooks/useAuth";
import { validateDateTime } from "../utils/validation";

interface DateTimeInputProps {
  onCalculate: (date: Temporal.PlainDate, time?: Temporal.PlainTime) => void;
  onReset?: () => void;
  onSetToNow?: () => void;
  onPinClick?: (date: Temporal.PlainDate, time?: Temporal.PlainTime) => void;
  onCustomMilestonesClick?: () => void;
  onValidationError?: () => void;
  autofillDate?: string | null;
  autofillTime?: string | null;
  hasCalculation?: boolean;
}

// Get current date/time for default values
const getCurrentDateTime = () => {
  const now = Temporal.Now.plainDateTimeISO();
  return {
    date: now.toPlainDate().toString(),
    time: now.toPlainTime().toString().slice(0, 5), // HH:MM format
  };
};

export default function DateTimeInput({ onCalculate, onReset, onSetToNow, onPinClick, onCustomMilestonesClick, onValidationError, autofillDate, autofillTime, hasCalculation }: DateTimeInputProps) {
  const { user } = useAuth();
  const [dateValue, setDateValue] = useState<string>(() => getCurrentDateTime().date);
  const [timeValue, setTimeValue] = useState<string>(() => getCurrentDateTime().time);
  const [error, setError] = useState<string>("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auto-calculate on mount with current date/time
  useEffect(() => {
    const now = Temporal.Now.plainDateTimeISO();
    onCalculate(now.toPlainDate(), now.toPlainTime());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-calculate when date or time changes
  useEffect(() => {
    if (!dateValue) return; // Don't calculate if date is empty

    const timeToValidate = timeValue.trim() === "" ? undefined : timeValue;
    const validation = validateDateTime(dateValue, timeToValidate);

    if (validation.isValid && validation.date) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("");
      onCalculate(validation.date, validation.time);
    } else {
      setError(validation.error || "Invalid date/time");
      if (onValidationError) {
        onValidationError();
      }
    }
  }, [dateValue, timeValue, onCalculate, onValidationError]);

  // Handle autofill from portfolio using scheduled state update
  useEffect(() => {
    if (autofillDate) {
      queueMicrotask(() => {
        setDateValue(autofillDate);
        setError("");
      });
      // When autofillDate is set, also handle time (could be null to clear, or a value)
      if (autofillTime !== undefined) {
        queueMicrotask(() => {
          setTimeValue(autofillTime || "");
        });
      }
    }
  }, [autofillDate, autofillTime]);

  const handleSetToNow = () => {
    const now = Temporal.Now.plainDateTimeISO();
    const nowDate = now.toPlainDate().toString();
    const nowTime = now.toPlainTime().toString().slice(0, 5);

    setDateValue(nowDate);
    setTimeValue(nowTime);
    setError("");
    if (onSetToNow) {
      onSetToNow();
    }
  };

  const handleReset = () => {
    // Clear inputs completely
    setDateValue("");
    setTimeValue("");
    setError("");
    if (onReset) {
      onReset();
    }
  };

  const handlePinDate = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Validate date/time before opening modal
    setError("");
    const validation = validateDateTime(dateValue, timeValue);

    if (!validation.isValid) {
      setError(validation.error || "Please enter a valid date");
      return;
    }

    // Call parent callback with validated date/time
    if (onPinClick && validation.date) {
      onPinClick(validation.date, validation.time);
    }
  };

  const handleAuthSuccess = () => {
    // Don't close modal here - let user see the "Check your email!" message
    // They will close it manually using the X button or close button in the success alert
  };

  return (
    <>
      <div className="row g-3">
        {/* Date Input */}
        <div className="col-md-6">
          <label htmlFor="dateInput" className="form-label fw-bold">
            Date (required)
          </label>
          <input type="date" className={`form-control ${error ? "is-invalid" : ""}`} id="dateInput" value={dateValue} onChange={(e) => setDateValue(e.target.value)} required />
        </div>

        {/* Time Input */}
        <div className="col-md-6">
          <label htmlFor="timeInput" className="form-label">
            Time (optional)
          </label>
          <input type="time" className={`form-control ${error ? "is-invalid" : ""}`} id="timeInput" value={timeValue} onChange={(e) => setTimeValue(e.target.value)} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="col-12">
            <div className="alert alert-danger mb-0" role="alert">
              {error}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="col-12">
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-primary" onClick={handleSetToNow}>
                Now
              </button>
              <button type="button" className="btn btn-danger" onClick={handleReset}>
                Reset
              </button>
            </div>

            <div className="d-flex gap-2">
              <button type="button" className={`btn ${user ? "btn-outline-secondary" : "btn-primary"}`} onClick={handlePinDate} disabled={!dateValue.trim()}>
                {user ? "🔖 Bookmark Date" : "Sign In to Bookmark"}
              </button>
              {onCustomMilestonesClick && (
                <button type="button" className="btn btn-outline-secondary" onClick={onCustomMilestonesClick} disabled={!hasCalculation} title={!hasCalculation ? "Calculate milestones first" : ""}>
                  ⚙️ Custom
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
    </>
  );
}
