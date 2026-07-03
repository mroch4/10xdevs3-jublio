import { useState } from "react";
import type { FormEvent } from "react";
import Event from "../utils/classes/Event";
import { CalendarProvider } from "../utils/enums/CalendarProvider";
import "./CalendarExportModal.css";

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onExport: (provider: CalendarProvider, label: string) => void;
}

export default function CalendarExportModal({
  isOpen,
  onClose,
  event,
  onExport,
}: CalendarExportModalProps) {
  const [label, setLabel] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const handleProviderClick = (provider: CalendarProvider) => {
    const trimmedLabel = label.trim();
    if (trimmedLabel) {
      onExport(provider, trimmedLabel);
      setLabel(""); // Reset for next use
    }
  };

  const handleClose = () => {
    setLabel("");
    onClose();
  };

  if (!isOpen) return null;

  const isLabelValid = label.trim().length > 0;
  const previewTitle = label.trim()
    ? `${event.label} milestone of ${label.trim()}`
    : `${event.label} milestone of [your label]`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={handleClose}
        style={{ zIndex: 1040 }}
      />

      {/* Modal */}
      <div
        className="modal fade show"
        style={{ display: "block", zIndex: 1050 }}
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Export to Calendar</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
              />
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
                  />
                  <small className="text-muted">
                    {label.length}/100 characters
                  </small>
                </div>

                <div className="preview-box mb-3">
                  <strong>Preview:</strong>
                  <div className="preview-text">{previewTitle}</div>
                </div>

                <div className="provider-buttons">
                  <button
                    type="button"
                    className="btn btn-provider btn-google"
                    onClick={() => handleProviderClick(CalendarProvider.Google)}
                    disabled={!isLabelValid}
                  >
                    <span className="provider-icon">🟦</span>
                    Google Calendar
                  </button>
                  <button
                    type="button"
                    className="btn btn-provider btn-apple"
                    onClick={() => handleProviderClick(CalendarProvider.Apple)}
                    disabled={!isLabelValid}
                  >
                    <span className="provider-icon">🍎</span>
                    Apple Calendar
                  </button>
                  <button
                    type="button"
                    className="btn btn-provider btn-outlook"
                    onClick={() => handleProviderClick(CalendarProvider.Outlook)}
                    disabled={!isLabelValid}
                  >
                    <span className="provider-icon">📧</span>
                    Outlook
                  </button>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
