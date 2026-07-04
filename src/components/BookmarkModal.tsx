import "./Animations.css";

import type { FormEvent } from "react";
import { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import Bookmark from "../utils/classes/Bookmark";
import { addBookmark, checkTitleUniqueness } from "../firebase/firestoreService";

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inputDate: Temporal.PlainDate | Temporal.PlainDateTime;
  userEmail: string;
}

export function BookmarkModal({ isOpen, onClose, onSuccess, inputDate, userEmail }: BookmarkModalProps) {
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateLabel = async (value: string): Promise<boolean> => {
    setValidationError(null);

    if (value.trim().length === 0) {
      setValidationError("Label is required");
      return false;
    }

    if (value.length > 50) {
      setValidationError("Label must be 50 characters or less");
      return false;
    }

    // Check uniqueness
    const isUnique = await checkTitleUniqueness(userEmail, value);
    if (!isUnique) {
      setValidationError("A bookmark with this label already exists (case-insensitive)");
      return false;
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

    // Validate
    const isValid = await validateLabel(label);
    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      // Convert Temporal date/datetime to ISO string
      let dateString: string;
      if ("hour" in inputDate) {
        // PlainDateTime
        dateString = inputDate.toString(); // "YYYY-MM-DDTHH:mm:ss"
      } else {
        // PlainDate
        dateString = inputDate.toString(); // "YYYY-MM-DD"
      }

      const bookmark = new Bookmark(label, dateString);
      await addBookmark(userEmail, bookmark);

      setLoading(false);
      handleClose();
      onSuccess();
    } catch (err) {
      console.error("Failed to save bookmark:", err);
      setError("Failed to save bookmark. Please try again.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLabel("");
    setError(null);
    setValidationError(null);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const charCount = label.length;
  const charLimit = 50;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={handleClose} style={{ zIndex: 1040 }} />

      {/* Modal */}
      <div className="modal fade show" style={{ display: "block", zIndex: 1050 }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Bookmark Date</h5>
              <button type="button" className="btn-close" onClick={handleClose} aria-label="Close" disabled={loading} />
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="bookmark-label" className="form-label fw-bold">
                    Label (required)
                  </label>
                  <input
                    type="text"
                    className={`form-control ${validationError ? "is-invalid" : ""}`}
                    id="bookmark-label"
                    value={label}
                    onChange={(e) => handleLabelChange(e.target.value)}
                    maxLength={charLimit}
                    disabled={loading}
                    autoFocus
                    placeholder="e.g., Wedding, Quit Smoking, Company Launch"
                  />
                  <div className="form-text">
                    {charCount}/{charLimit} characters
                  </div>
                  {validationError && <div className="invalid-feedback d-block">{validationError}</div>}
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading || label.trim().length === 0}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Saving...
                      </>
                    ) : (
                      "Save Bookmark"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
