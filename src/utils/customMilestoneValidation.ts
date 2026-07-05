import { Temporal } from "@js-temporal/polyfill";
import { MIN_CUSTOM_MILESTONE_VALUE, MAX_CUSTOM_MILESTONE_VALUE } from "./constants";

export interface CustomMilestoneValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates a custom milestone value against validation rules and life expectancy limits.
 * 
 * Validation rules:
 * 1. Empty value is allowed (returns valid)
 * 2. Value must be a valid integer (no decimals, no non-numeric characters)
 * 3. Value must be >= MIN_CUSTOM_MILESTONE_VALUE (1)
 * 4. Value must be <= MAX_CUSTOM_MILESTONE_VALUE (1,000,000,000)
 * 5. If originalDate and selectedUnits provided: milestone date must be within 75 years from now
 * 6. If originalDate and selectedUnits provided: Temporal arithmetic must not overflow
 * 
 * @param value - The custom milestone value as a string (e.g., "1000")
 * @param selectedUnits - Array of selected unit strings (e.g., ["days", "weeks"])
 * @param originalDate - The base date/datetime for calculating milestone dates
 * @returns Validation result with isValid flag and error message (if invalid)
 */
export function validateCustomMilestoneValue(
  value: string,
  selectedUnits: string[] = [],
  originalDate: Temporal.PlainDate | Temporal.PlainDateTime | null = null
): CustomMilestoneValidationResult {
  // Check if value is empty
  if (value.trim().length === 0) {
    return { isValid: true, error: null }; // Empty value allowed during input
  }

  // Parse as integer
  const numValue = parseInt(value, 10);

  // Check if valid number
  if (isNaN(numValue)) {
    return { isValid: false, error: "Value must be a valid number" };
  }

  // Check if integer (no decimals)
  if (value.includes(".")) {
    return { isValid: false, error: "Value must be a whole number" };
  }

  // Check minimum
  if (numValue < MIN_CUSTOM_MILESTONE_VALUE) {
    return { isValid: false, error: `Value must be at least ${MIN_CUSTOM_MILESTONE_VALUE}` };
  }

  // Check maximum
  if (numValue > MAX_CUSTOM_MILESTONE_VALUE) {
    return { isValid: false, error: `Value must be ${MAX_CUSTOM_MILESTONE_VALUE.toLocaleString()} or less` };
  }

  // Only validate units if we have a valid value and units are selected
  if (selectedUnits.length === 0) {
    return { isValid: true, error: null }; // No units to check, value is valid
  }

  // Check human lifetime limits for each selected unit
  if (originalDate) {
    for (const selectedUnit of selectedUnits) {
      try {
        // Calculate milestone date by adding the value to original date
        let milestoneDate: Temporal.PlainDate | Temporal.PlainDateTime;

        if (originalDate instanceof Temporal.PlainDateTime) {
          milestoneDate = originalDate.add({ [selectedUnit]: numValue });
        } else {
          milestoneDate = originalDate.add({ [selectedUnit]: numValue });
        }

        // Check if milestone exceeds 75-year life expectancy limit
        const now = Temporal.Now.plainDateTimeISO();
        const limit = now.add({ years: 75 });
        const exceeds = Temporal.PlainDate.compare(milestoneDate, limit) > 0;

        if (exceeds) {
          return {
            isValid: false,
            error: `Milestone would exceed human lifetime (${numValue.toLocaleString()} ${selectedUnit} is too far in the future)`,
          };
        }
      } catch {
        // If calculation fails (e.g., Temporal overflow), show error
        return {
          isValid: false,
          error: `Invalid combination: ${numValue.toLocaleString()} ${selectedUnit}`,
        };
      }
    }
  }

  return { isValid: true, error: null };
}
