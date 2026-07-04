import "../Animations.css";

import type { FormEvent } from "react";
import { useState, useEffect, useCallback } from "react";
import { Temporal } from "@js-temporal/polyfill";
import Bookmark from "../../utils/classes/Bookmark";
import { updateBookmark, checkTitleUniqueness } from "../../firebase/firestoreService";
import { MAX_LABEL_LENGTH } from "../../utils/constants";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useFocusTrap } from "../../hooks/useFocusTrap";

interface BookmarkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookmark: Bookmark;
  userEmail: string;
}

export function BookmarkEditModal({ isOpen, onClose, onSuccess, bookmark, userEmail }: BookmarkEditModalProps) {
  const [label, setLabel] = useState(bookmark.title);
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Track original values to detect changes
  const [originalLabel, setOriginalLabel] = useState(bookmark.title);
  const [originalDateValue, setOriginalDateValue] = useState("");
  const [originalTimeValue, setOriginalTimeValue] = useState("");

  // Parse bookmark date on mount and when bookmark changes
  useEffect(() => {
    queueMicrotask(() => {
      try {
        if (bookmark.date.includes("T")) {
          const dateTime = Temporal.PlainDateTime.from(bookmark.date);
          const dateStr = dateTime.toPlainDate().toString();
          const timeStr = dateTime.toPlainTime().toString().slice(0, 5); // HH:MM
          setDateValue(dateStr);
          setTimeValue(timeStr);
          setOriginalDateValue(dateStr);
          setOriginalTimeValue(timeStr);
        } else {
          const date = Temporal.PlainDate.from(bookmark.date);
          const dateStr = date.toString();
          setDateValue(dateStr);
          setTimeValue("");
          setOriginalDateValue(dateStr);
          setOriginalTimeValue("");
        }
      } catch (err) {
        console.error("Failed to parse bookmark date:", err);
        setError("Invalid date format");
      }
      setLabel(bookmark.title);
      setOriginalLabel(bookmark.title);
    });
  }, [bookmark]);

  const handleClose = useCallback(() => {
    setLabel(bookmark.title);
    setValidationError(null);
    setError(null);
    onClose();
  }, [bookmark.title, onClose]);

  // Handle ESC key to close modal
  useEscapeKey(handleClose, isOpen, loading);

  // Handle focus trap and return focus
  const modalRef = useFocusTrap(isOpen);

  const validateLabel = async (value: string): Promise<boolean> => {
    setValidationError(null);

    if (value.trim().length === 0) {
      setValidationError("Label is required");
      return false;
    }

    if (value.length > MAX_LABEL_LENGTH) {
      setValidationError(`Label must be ${MAX_LABEL_LENGTH} characters or less`);
      return false;
    }

    // Check uniqueness (exclude current bookmark)
    if (value.toLowerCase() !== bookmark.title.toLowerCase()) {
      const isUnique = await checkTitleUniqueness(userEmail, value);
      if (!isUnique) {
        setValidationError("A bookmark with this label already exists (case-insensitive)");
        return false;
      }
    }

    return true;
  };

  const handleLabelChange = (value: string) => {
    setLabel(value);
    setValidationError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate label
      const isValid = await validateLabel(label);
      if (!isValid) {
        setLoading(false);
        return;
      }

      // Parse and validate date/time
      let date: Temporal.PlainDate;
      try {
        date = Temporal.PlainDate.from(dateValue);
      } catch {
        setValidationError("Invalid date format");
        setLoading(false);
        return;
      }

      let time: Temporal.PlainTime | undefined;
      if (timeValue.trim() !== "") {
        try {
          time = Temporal.PlainTime.from(timeValue);
        } catch {
          setValidationError("Invalid time format");
          setLoading(false);
          return;
        }
      }

      // Create updated bookmark
      const dateString = time ? date.toPlainDateTime(time).toString() : date.toString();
      const updatedBookmark = new Bookmark(label.trim(), dateString);
      updatedBookmark.createdAt = bookmark.createdAt; // Preserve creation timestamp
      updatedBookmark.titleLowercase = label.trim().toLowerCase();

      // Update in Firestore - use createdAt as document ID
      await updateBookmark(userEmail, String(bookmark.createdAt), updatedBookmark);

      // Reset and close
      setLabel("");
      setDateValue("");
      setTimeValue("");
      setLoading(false);
      onClose();
      onSuccess();
    } catch (err) {
      console.error("Failed to update bookmark:", err);
      setError("Failed to update bookmark. Please try again.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const charCount = label.length;

  // Check if any field has changed
  const hasChanges =
    label !== originalLabel || dateValue !== originalDateValue || timeValue !== originalTimeValue;

  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog" aria-labelledby="editBookmarkModalLabel" ref={modalRef}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="editBookmarkModalLabel">
              Update Bookmark
            </h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Label Input */}
              <div className="mb-3">
                <label htmlFor="editBookmarkLabel" className="form-label fw-bold">
                  Label (required)
                </label>
                <input
                  type="text"
                  className={`form-control ${validationError ? "is-invalid" : ""}`}
                  id="editBookmarkLabel"
                  placeholder="e.g., Wedding, Quit Smoking, Company Launch"
                  value={label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  maxLength={MAX_LABEL_LENGTH}
                  required
                  autoFocus
                />
                <div className="d-flex justify-content-between mt-1">
                  {validationError ? (
                    <div className="invalid-feedback d-block">{validationError}</div>
                  ) : (
                    <div></div>
                  )}
                  <small className="text-muted">
                    {charCount}/{MAX_LABEL_LENGTH} characters
                  </small>
                </div>
              </div>

              {/* Date Input */}
              <div className="mb-3">
                <label htmlFor="editBookmarkDate" className="form-label fw-bold">
                  Date (required)
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="editBookmarkDate"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  required
                />
              </div>

              {/* Time Input */}
              <div className="mb-3">
                <label htmlFor="editBookmarkTime" className="form-label fw-bold">
                  Time (optional)
                </label>
                <input
                  type="time"
                  className="form-control"
                  id="editBookmarkTime"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || !hasChanges}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop show" style={{ zIndex: -1 }}></div>
    </div>
  );
}
