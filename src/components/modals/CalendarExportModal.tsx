import "./CalendarExportModal.css";

import { useCallback, useState, useEffect } from "react";

import { CalendarProvider } from "../../utils/enums/CalendarProvider";
import { MAX_EVENT_TITLE_LENGTH } from "../../utils/constants";
import Milestone from "../../utils/classes/Milestone";
import { Temporal } from "@js-temporal/polyfill";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useFocusTrap } from "../../hooks/useFocusTrap";

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Milestone;
  onExport: (provider: CalendarProvider, label: string) => void;
  originalDate: Temporal.PlainDate | Temporal.PlainDateTime | null;
  locale: string;
  prefillTitle?: string | null;
}

export default function CalendarExportModal({ isOpen, onClose, event, onExport, originalDate, locale, prefillTitle }: CalendarExportModalProps) {
  const [label, setLabel] = useState<string>("");

  // Prefill label if coming from a bookmark
  useEffect(() => {
    if (isOpen && prefillTitle) {
      queueMicrotask(() => {
        setLabel(prefillTitle);
      });
    }
  }, [isOpen, prefillTitle]);

  const handleSubmit = (e: React.FormEvent) => {
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
  useEscapeKey(handleClose, isOpen);

  // Handle focus trap and return focus
  const modalRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  const formattedOriginalDate = originalDate ? originalDate.toLocaleString(locale) : "";

  // Build event title from parts
  // Format: "[event.label] since [user label] ([formattedOriginalDate])"
  const titleParts = [event.label, " since ", label.trim() || "[your label]", " (", formattedOriginalDate, ")"];

  const previewTitle = titleParts.join("");
  const currentTitleLength = titleParts.reduce((sum, part) => sum + part.length, 0);

  // Calculate max label length to ensure total title ≤ 100 chars
  const fixedParts = [event.label, " since ", " (", formattedOriginalDate, ")"];
  const fixedPartLength = fixedParts.reduce((sum, part) => sum + part.length, 0);
  const maxLabelLength = Math.max(1, MAX_EVENT_TITLE_LENGTH - fixedPartLength);

  const isLabelValid = label.trim().length > 0 && currentTitleLength <= MAX_EVENT_TITLE_LENGTH;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={handleClose} style={{ zIndex: 1040 }} />

      {/* Modal */}
      <div className="modal fade show" style={{ display: "block", zIndex: 1050 }} tabIndex={-1} role="dialog" aria-labelledby="calendar-export-title" aria-modal="true" ref={modalRef}>
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
                    maxLength={maxLabelLength}
                    autoFocus
                    required
                    aria-describedby="label-help preview-text"
                  />

                  <div className="preview-box mt-2" role="status" aria-live="polite">
                    <strong>Event title preview:</strong>
                    <div className="preview-text" id="preview-text">
                      {previewTitle}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between">
                    <div></div>
                    <small id="label-help" className="text-muted">
                      {currentTitleLength}/{MAX_EVENT_TITLE_LENGTH} characters
                    </small>
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
