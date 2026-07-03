import { Temporal } from "@js-temporal/polyfill";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  date?: Temporal.PlainDate;
  time?: Temporal.PlainTime;
}

/**
 * Validates date and optional time inputs
 * @param dateString - Date string from HTML5 date input (YYYY-MM-DD format)
 * @param timeString - Optional time string from HTML5 time input (HH:MM format)
 * @returns Validation result with parsed Temporal objects or error message
 */
export function validateDateTime(dateString: string, timeString?: string): ValidationResult {
  // Check date is provided
  if (!dateString || dateString.trim() === "") {
    return {
      isValid: false,
      error: "Date is required",
    };
  }

  // Parse date
  let date: Temporal.PlainDate;
  try {
    date = Temporal.PlainDate.from(dateString);
  } catch {
    return {
      isValid: false,
      error: "Invalid date format",
    };
  }

  // Parse time if provided
  let time: Temporal.PlainTime | undefined;
  if (timeString && timeString.trim() !== "") {
    try {
      time = Temporal.PlainTime.from(timeString);
    } catch {
      return {
        isValid: false,
        error: "Invalid time format",
      };
    }
  }

  // Check if date (and time if provided) is not in the future
  const now = Temporal.Now.plainDateTimeISO();
  const nowDate = now.toPlainDate();

  if (Temporal.PlainDate.compare(date, nowDate) > 0) {
    return {
      isValid: false,
      error: "Please enter a past or present date",
    };
  }

  // If date is today and time is provided, check if time is in the future
  if (Temporal.PlainDate.compare(date, nowDate) === 0 && time) {
    const nowTime = now.toPlainTime();
    if (Temporal.PlainTime.compare(time, nowTime) > 0) {
      return {
        isValid: false,
        error: "Please enter a past or present date and time",
      };
    }
  }

  return {
    isValid: true,
    date,
    time,
  };
}
