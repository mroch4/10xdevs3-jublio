import { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { validateDateTime } from "../utils/validation";

interface DateTimeInputProps {
  onCalculate: (date: Temporal.PlainDate, time?: Temporal.PlainTime) => void;
}

// Get current date/time for default values
const getCurrentDateTime = () => {
  const now = Temporal.Now.plainDateTimeISO();
  return {
    date: now.toPlainDate().toString(),
    time: now.toPlainTime().toString().slice(0, 5), // HH:MM format
  };
};

export default function DateTimeInput({ onCalculate }: DateTimeInputProps) {
  const [dateValue, setDateValue] = useState<string>(() => getCurrentDateTime().date);
  const [timeValue, setTimeValue] = useState<string>(() => getCurrentDateTime().time);
  const [error, setError] = useState<string>("");

  const handleSetToNow = () => {
    const now = Temporal.Now.plainDateTimeISO();
    setDateValue(now.toPlainDate().toString());
    setTimeValue(now.toPlainTime().toString().slice(0, 5));
    setError("");
  };

  const handleReset = () => {
    setDateValue("");
    setTimeValue("");
    setError("");
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
    <div className="card shadow-sm">
      <div className="card-body">
        <form onSubmit={handleCalculate}>
          <div className="row g-3">
            {/* Date Input */}
            <div className="col-md-6">
              <label htmlFor="dateInput" className="form-label">
                Date
              </label>
              <input
                type="date"
                className={`form-control ${error ? "is-invalid" : ""}`}
                id="dateInput"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                required
              />
            </div>

            {/* Time Input */}
            <div className="col-md-6">
              <label htmlFor="timeInput" className="form-label">
                Time <span className="text-muted">(optional)</span>
              </label>
              <input
                type="time"
                className={`form-control ${error ? "is-invalid" : ""}`}
                id="timeInput"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
              />
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
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  Calculate Milestones
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleSetToNow}
                >
                  Set to Now
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleReset}
                >
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
