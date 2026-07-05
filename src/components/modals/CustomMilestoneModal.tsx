import "../Animations.css";

import type { FormEvent } from "react";
import { useState, useCallback, useEffect } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { DateTimeUnit } from "../../utils/enums/DateTimeUnit";
import { MIN_CUSTOM_MILESTONE_VALUE, MAX_CUSTOM_MILESTONE_VALUE } from "../../utils/constants";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import type { CustomMilestone } from "../../types/CustomMilestone";
import { validateCustomMilestoneValue } from "../../utils/customMilestoneValidation";

interface CustomMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCustomMilestones: (milestones: CustomMilestone[]) => void;
  existingCustomMilestones: CustomMilestone[];
  hasTimeInput: boolean;
  originalDate: Temporal.PlainDate | Temporal.PlainDateTime | null;
}

export function CustomMilestoneModal({ 
  isOpen, 
  onClose, 
  onUpdateCustomMilestones, 
  existingCustomMilestones, 
  hasTimeInput,
  originalDate
}: CustomMilestoneModalProps) {
  const [value, setValue] = useState("");
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValueError, setIsValueError] = useState(false); // Track if error is about the value field

  // Initialize from existing custom milestones
  useEffect(() => {
    if (isOpen && existingCustomMilestones.length > 0) {
      // Get the value from the first existing milestone
      const firstValue = existingCustomMilestones[0].value;

      // Get all units from existing milestones with this value
      const units = new Set(
        existingCustomMilestones
          .filter(cm => cm.value === firstValue)
          .map(cm => cm.unit)
      );

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(firstValue.toString());
      setSelectedUnits(units);
    }
  }, [isOpen, existingCustomMilestones]);

  const handleClose = useCallback(() => {
    // Don't clear state on close - keep it for next open
    setValidationError(null);
    setIsValueError(false);
    onClose();
  }, [onClose]);

  // Handle ESC key to close modal
  useEscapeKey(handleClose, isOpen, false);

  // Handle focus trap and return focus
  const modalRef = useFocusTrap(isOpen);

  // Get available units based on input type (sorted shortest to longest)
  const availableUnits = hasTimeInput
    ? [
        DateTimeUnit.Seconds,
        DateTimeUnit.Minutes,
        DateTimeUnit.Hours,
        DateTimeUnit.Days,
        DateTimeUnit.Weeks,
        DateTimeUnit.Months,
        DateTimeUnit.Years,
      ]
    : [DateTimeUnit.Days, DateTimeUnit.Weeks, DateTimeUnit.Months, DateTimeUnit.Years];

  // Check if a unit would exceed 75-year limit for a given value
  const checkUnitExceedsLimit = (checkValue: string, checkUnit: string): boolean => {
    if (!originalDate || checkValue.trim().length === 0) {
      return false;
    }

    const numValue = parseInt(checkValue, 10);
    if (isNaN(numValue)) {
      return false;
    }

    try {
      let milestoneDate: Temporal.PlainDate | Temporal.PlainDateTime;

      if (originalDate instanceof Temporal.PlainDateTime) {
        milestoneDate = originalDate.add({ [checkUnit]: numValue });
      } else {
        milestoneDate = originalDate.add({ [checkUnit]: numValue });
      }

      const now = Temporal.Now.plainDateTimeISO();
      const limit = now.add({ years: 75 });
      return Temporal.PlainDate.compare(milestoneDate, limit) > 0;
    } catch {
      // If calculation fails, disable the unit
      return true;
    }
  };

  // Check if a unit would exceed limit with current value
  const isUnitDisabled = (checkUnit: string): boolean => {
    return checkUnitExceedsLimit(value, checkUnit);
  };

  const validateValue = (val: string): boolean => {
    const result = validateCustomMilestoneValue(
      val,
      Array.from(selectedUnits),
      originalDate
    );

    setValidationError(result.error);
    setIsValueError(!result.isValid);

    return result.isValid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Check if a calculation has been done first
    if (!originalDate) {
      setValidationError("Please calculate milestones first before adding custom values");
      setIsValueError(false);
      return;
    }

    // Check if at least one unit is selected
    if (selectedUnits.size === 0) {
      setValidationError("Please select at least one time unit");
      setIsValueError(false); // This is a unit selection error, not a value error
      return;
    }

    if (!validateValue(value)) {
      return;
    }

    const numValue = parseInt(value, 10);

    // Create new milestone list from selected units
    const newMilestones: CustomMilestone[] = Array.from(selectedUnits).map(unit => ({
      id: `${numValue}-${unit}`,
      value: numValue,
      unit
    }));

    onUpdateCustomMilestones(newMilestones);
    handleClose();
  };

  const handleResetCustomMilestones = () => {
    // Clear all custom milestones
    setValue("");
    setSelectedUnits(new Set());
    setValidationError(null);
    setIsValueError(false);
    onUpdateCustomMilestones([]);
    handleClose();
  };

  const handleValueChange = (val: string) => {
    setValue(val);

    if (val.trim().length > 0) {
      validateValue(val);
    } else {
      setValidationError(null);
    }
  };

  const handleUnitToggle = (unit: string) => {
    const newSelectedUnits = new Set(selectedUnits);
    if (newSelectedUnits.has(unit)) {
      newSelectedUnits.delete(unit);
    } else {
      newSelectedUnits.add(unit);
    }
    setSelectedUnits(newSelectedUnits);

    if (value.trim().length > 0) {
      // Re-validate with updated units
      setTimeout(() => validateValue(value), 0);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={handleClose} style={{ zIndex: 1040 }} />

      {/* Modal */}
      <div className="modal show fade-in" style={{ display: "block", zIndex: 1050 }} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="customMilestoneModalLabel">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content" ref={modalRef}>
          <div className="modal-header">
            <h5 className="modal-title" id="customMilestoneModalLabel">
              Custom Milestones
            </h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {!originalDate && (
                <div className="alert alert-info mb-3" role="alert">
                  ℹ️ Calculate milestones first, then you can add custom values here
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="milestoneValue" className="form-label fw-bold">
                  Value <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${validationError && isValueError ? "is-invalid" : ""}`}
                  id="milestoneValue"
                  value={value}
                  onChange={(e) => handleValueChange(e.target.value)}
                  placeholder="e.g., 420, 25000"
                  min={MIN_CUSTOM_MILESTONE_VALUE}
                  max={MAX_CUSTOM_MILESTONE_VALUE}
                  required
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Time Units <span className="text-danger">*</span>
                </label>
                <div className="form-text mb-2">
                  Select one or more time units to create multiple milestones at once
                </div>
                <div className="d-flex flex-column gap-2">
                  {availableUnits.map((u) => {
                    const isDisabled = value.trim().length > 0 && isUnitDisabled(u);
                    const isChecked = selectedUnits.has(u);
                    return (
                      <div key={u} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`unit-${u}`}
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => handleUnitToggle(u)}
                        />
                        <label className="form-check-label" htmlFor={`unit-${u}`}>
                          {u}
                          {isDisabled && <span className="text-muted ms-2">(exceeds human lifetime)</span>}
                        </label>
                      </div>
                    );
                  })}
                </div>
                {!hasTimeInput && (
                  <div className="form-text mt-2">
                    Time-based units (hours, minutes, seconds) require a time input
                  </div>
                )}
              </div>

              {validationError && (
                <div className="alert alert-danger mb-0" role="alert">
                  {validationError}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-danger me-auto" onClick={handleResetCustomMilestones}>
                Reset Custom Milestones
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!!validationError || value.trim().length === 0 || selectedUnits.size === 0}>
                Apply
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
