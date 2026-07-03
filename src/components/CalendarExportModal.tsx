import "./CalendarExportModal.css";

import { useCallback, useEffect, useState } from "react";

import { CalendarProvider } from "../utils/enums/CalendarProvider";
import Milestone from "../utils/classes/Milestone";
import type { FormEvent } from "react";

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Milestone;
  onExport: (provider: CalendarProvider, label: string) => void;
}

export default function CalendarExportModal({ isOpen, onClose, event, onExport }: CalendarExportModalProps) {
  const [label, setLabel] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const handleProviderClick = (provider: CalendarProvider) => {
    const trimmedLabel = label.trim();
    if (trimmedLabel) {
      onExport(provider, trimmedLabel);
    }
  };

  const handleClose = useCallback(() => {
    setLabel("");
    onClose();
  }, [onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const isLabelValid = label.trim().length > 0;
  const previewTitle = label.trim() ? `${event.label} milestone of ${label.trim()}` : `${event.label} milestone of [your label]`;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={handleClose} style={{ zIndex: 1040 }} />

      {/* Modal */}
      <div className="modal fade show" style={{ display: "block", zIndex: 1050 }} tabIndex={-1} role="dialog" aria-labelledby="calendar-export-title" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="calendar-export-title">
                Export to Calendar
              </h5>
              <button type="button" className="btn-close" onClick={handleClose} aria-label="Close" />
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="milestone-label" className="form-label">
                    What is this milestone about?
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="milestone-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., Wedding, Quit Smoking, Company Launch"
                    maxLength={100}
                    autoFocus
                    required
                    aria-describedby="label-help preview-text"
                  />
                  <small id="label-help" className="text-muted">
                    {label.length}/100 characters
                  </small>
                </div>

                <div className="preview-box mb-3" role="status" aria-live="polite">
                  <strong>Event title:</strong>
                  <div className="preview-text" id="preview-text">
                    {previewTitle}
                  </div>
                </div>

                <div className="provider-buttons" role="group" aria-label="Calendar providers">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleProviderClick(CalendarProvider.Apple)}
                    disabled={!isLabelValid}
                    aria-label="Export to Apple Calendar"
                  >
                    Apple
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleProviderClick(CalendarProvider.Google)}
                    disabled={!isLabelValid}
                    aria-label="Export to Google Calendar"
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleProviderClick(CalendarProvider.Outlook)}
                    disabled={!isLabelValid}
                    aria-label="Export to Outlook Calendar"
                  >
                    Outlook
                  </button>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
