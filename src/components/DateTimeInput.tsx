import { Temporal } from "@js-temporal/polyfill";
import { useState } from "react";
import { validateDateTime } from "../utils/validation";

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
  const [dateValue, setDateValue] = useState<string>(() => getCurrentDateTime().date);
  const [timeValue, setTimeValue] = useState<string>(() => getCurrentDateTime().time);
  const [error, setError] = useState<string>("");

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
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
