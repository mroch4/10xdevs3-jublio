import "./Animations.css";

import { AuthModal } from "./AuthModal";
import { Temporal } from "@js-temporal/polyfill";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { validateDateTime } from "../utils/validation";

interface DateTimeInputProps {
  onCalculate: (date: Temporal.PlainDate, time?: Temporal.PlainTime) => void;
  onReset?: () => void;
  onPinClick?: (date: Temporal.PlainDate, time?: Temporal.PlainTime) => void; // Pass validated date/time to parent
  autofillDate?: string | null;
  autofillTime?: string | null;
}

// Get current date/time for default values
const getCurrentDateTime = () => {
  const now = Temporal.Now.plainDateTimeISO();
  return {
    date: now.toPlainDate().toString(),
    time: now.toPlainTime().toString().slice(0, 5), // HH:MM format
  };
};

export default function DateTimeInput({ onCalculate, onReset, onPinClick, autofillDate, autofillTime }: DateTimeInputProps) {
  const { user } = useAuth();
  const [dateValue, setDateValue] = useState<string>(() => getCurrentDateTime().date);
  const [timeValue, setTimeValue] = useState<string>(() => getCurrentDateTime().time);
  const [error, setError] = useState<string>("");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle autofill from portfolio using scheduled state update
  useEffect(() => {
    if (autofillDate) {
      queueMicrotask(() => {
        setDateValue(autofillDate);
        setError("");
      });
    }
    if (autofillTime !== undefined) {
      queueMicrotask(() => {
        setTimeValue(autofillTime || "");
      });
    }
  }, [autofillDate, autofillTime]);

  // Check if current inputs are valid
  const isValid = () => {
    // Pass undefined if time is empty, not empty string
    const timeToValidate = timeValue.trim() === "" ? undefined : timeValue;
    const validation = validateDateTime(dateValue, timeToValidate);
    return validation.isValid;
  };

  const handleSetToNow = () => {
    const now = Temporal.Now.plainDateTimeISO();
    const nowDate = now.toPlainDate().toString();
    const nowTime = now.toPlainTime().toString().slice(0, 5);

    setDateValue(nowDate);
    setTimeValue(nowTime);
    setError("");

    // Trigger calculation immediately
    onCalculate(now.toPlainDate(), now.toPlainTime());
  };

  const handleReset = () => {
    setDateValue("");
    setTimeValue("");
    setError("");
    if (onReset) {
      onReset();
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = validateDateTime(dateValue, timeValue);

    if (!validation.isValid) {
      setError(validation.error || "Validation failed");
      return;
    }

    if (validation.date) {
      onCalculate(validation.date, validation.time);
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
      <form onSubmit={handleCalculate}>
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
            <div className="flex-center flex-wrap gap-2">
              <button type="submit" className="btn btn-success" disabled={!isValid()}>
                Calculate
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSetToNow}>
                Now
              </button>
              <button type="button" className="btn btn-danger" onClick={handleReset}>
                Reset
              </button>
              <button type="button" className={`btn ${user ? "btn-warning" : "btn-outline-primary"}`} onClick={handlePinDate}>
                {user ? "📌 Pin Date" : "Sign In to Pin"}
              </button>
            </div>
          </div>
        </div>
      </form>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
    </>
  );
}
