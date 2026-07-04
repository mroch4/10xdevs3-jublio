import "../Animations.css";

import type { FormEvent } from "react";
import { useState, useCallback } from "react";
import { DateTimeUnit } from "../../utils/enums/DateTimeUnit";
import { MIN_CUSTOM_MILESTONE_VALUE, MAX_CUSTOM_MILESTONE_VALUE } from "../../utils/constants";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import type { CustomMilestone } from "../../types/CustomMilestone";

interface CustomMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: number, unit: string) => void;
  existingCustomMilestones: CustomMilestone[];
  hasTimeInput: boolean;
}

export function CustomMilestoneModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  existingCustomMilestones, 
  hasTimeInput 
}: CustomMilestoneModalProps) {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState(DateTimeUnit.Days);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setValue("");
    setUnit(DateTimeUnit.Days);
    setValidationError(null);
    onClose();
  }, [onClose]);

  // Handle ESC key to close modal
  useEscapeKey(handleClose, isOpen, false);

  // Handle focus trap and return focus
  const modalRef = useFocusTrap(isOpen);

  // Get available units based on input type
  const availableUnits = hasTimeInput
    ? [
        DateTimeUnit.Years,
        DateTimeUnit.Months,
        DateTimeUnit.Weeks,
        DateTimeUnit.Days,
        DateTimeUnit.Hours,
        DateTimeUnit.Minutes,
        DateTimeUnit.Seconds,
      ]
    : [DateTimeUnit.Years, DateTimeUnit.Months, DateTimeUnit.Weeks, DateTimeUnit.Days];

  const validateValue = (val: string, selectedUnit: string): boolean => {
    setValidationError(null);

    // Check if value is empty
    if (val.trim().length === 0) {
      setValidationError("Value is required");
      return false;
    }

    // Parse as integer
    const numValue = parseInt(val, 10);

    // Check if valid number
    if (isNaN(numValue)) {
      setValidationError("Value must be a valid number");
      return false;
    }

    // Check if integer (no decimals)
    if (val.includes(".")) {
      setValidationError("Value must be a whole number");
      return false;
    }

    // Check minimum
    if (numValue < MIN_CUSTOM_MILESTONE_VALUE) {
      setValidationError(`Value must be at least ${MIN_CUSTOM_MILESTONE_VALUE}`);
      return false;
    }

    // Check maximum
    if (numValue > MAX_CUSTOM_MILESTONE_VALUE) {
      setValidationError(`Value must be ${MAX_CUSTOM_MILESTONE_VALUE.toLocaleString()} or less`);
      return false;
    }

    // Check for duplicate
    const id = `${numValue}-${selectedUnit}`;
    const isDuplicate = existingCustomMilestones.some((cm) => cm.id === id);
    if (isDuplicate) {
      setValidationError(`Custom milestone "${numValue} ${selectedUnit}" already exists`);
      return false;
    }

    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateValue(value, unit)) {
      return;
    }

    const numValue = parseInt(value, 10);
    onSubmit(numValue, unit);
    handleClose();
  };

  const handleValueChange = (val: string) => {
    setValue(val);
    if (val.trim().length > 0) {
      validateValue(val, unit);
    } else {
      setValidationError(null);
    }
  };

  const handleUnitChange = (selectedUnit: string) => {
    setUnit(selectedUnit as DateTimeUnit);
    if (value.trim().length > 0) {
      validateValue(value, selectedUnit);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show fade-in" style={{ display: "block" }} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="customMilestoneModalLabel">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content" ref={modalRef}>
          <div className="modal-header">
            <h5 className="modal-title" id="customMilestoneModalLabel">
              Add Custom Milestone
            </h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="milestoneValue" className="form-label fw-bold">
                  Value <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${validationError ? "is-invalid" : ""}`}
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
                <label htmlFor="milestoneUnit" className="form-label fw-bold">
                  Time Unit <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  id="milestoneUnit"
                  value={unit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  required
                >
                  {availableUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                {!hasTimeInput && (
                  <div className="form-text">
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
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!!validationError || value.trim().length === 0}>
                Add Milestone
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop show fade-in" onClick={handleClose}></div>
    </div>
  );
}
