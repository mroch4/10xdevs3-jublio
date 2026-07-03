import { Temporal } from "@js-temporal/polyfill";
import { useState } from "react";
import { validateDateTime } from "../utils/validation";
import { useAuth } from "../hooks/useAuth";
import { AuthModal } from "./AuthModal";
import "./Animations.css";

interface DateTimeInputProps {
  onCalculate: (date: Temporal.PlainDate, time?: Temporal.PlainTime) => void;
  onReset?: () => void;
}

// Get current date/time for default values
const getCurrentDateTime = () => {
  const now = Temporal.Now.plainDateTimeISO();
  return {
    date: now.toPlainDate().toString(),
    time: now.toPlainTime().toString().slice(0, 5), // HH:MM format
  };
};

export default function DateTimeInput({ onCalculate, onReset }: DateTimeInputProps) {
  const { user } = useAuth();
  const [dateValue, setDateValue] = useState<string>(() => getCurrentDateTime().date);
  const [timeValue, setTimeValue] = useState<string>(() => getCurrentDateTime().time);
  const [error, setError] = useState<string>("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPinSuccess, setShowPinSuccess] = useState(false);

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

    // Placeholder: actual pin logic will be implemented in S-02
    setShowPinSuccess(true);
    setTimeout(() => setShowPinSuccess(false), 3000);
  };

  const handleAuthSuccess = () => {
    // Don't close modal here - let user see the "Check your email!" message
    // They will close it manually using the X button or close button in the success alert
  };

  return (
    <div className="card bg-light shadow-sm">
      <div className="card-body">
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
              <label htmlFor="timeInput" className="form-label fw-bold">
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
              {showPinSuccess && (
                <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
                  <strong>Success!</strong> Date pinned to your account.
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowPinSuccess(false)}
                    aria-label="Close"
                  />
                </div>
              )}
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
                <button
                  type="button"
                  className={`btn ${user ? 'btn-warning' : 'btn-outline-primary'}`}
                  onClick={handlePinDate}
                  disabled={!isValid()}
                >
                  {user ? 'Pin Date' : 'Sign In to Pin'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
