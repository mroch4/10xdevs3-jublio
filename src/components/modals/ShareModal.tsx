import "./ShareModal.css";

import { useCallback, useState } from "react";

import { SocialProvider } from "../../utils/enums/SocialProvider";
import type { FormEvent } from "react";
import { MAX_SHARE_TEXT_LENGTH } from "../../utils/constants";
import Milestone from "../../utils/classes/Milestone";
import { Temporal } from "@js-temporal/polyfill";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { useFocusTrap } from "../../hooks/useFocusTrap";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Milestone;
  onShare: (provider: SocialProvider, label: string) => void;
  originalDate: Temporal.PlainDate | Temporal.PlainDateTime | null;
  locale: string;
}

export default function ShareModal({ isOpen, onClose, event, onShare, originalDate, locale }: ShareModalProps) {
  const [label, setLabel] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  const handleProviderClick = (provider: SocialProvider) => {
    const trimmedLabel = label.trim();
    if (trimmedLabel) {
      onShare(provider, trimmedLabel);
      // Note: Modal does NOT close after share (user can share to multiple platforms)
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

  // Build share text from parts
  // Format: "Today's [milestone.label] since [user label] ([formattedOriginalDate]) - Calculated with Jublio at https://jublio.pl"
  const textParts = [
    "Today's ",
    event.label,
    " since ",
    label.trim() || "[your label]",
    " (",
    formattedOriginalDate,
    ") - Calculated with Jublio at https://jublio.pl",
  ];

  const previewText = textParts.join("");
  const currentTextLength = textParts.reduce((sum, part) => sum + part.length, 0);

  // Calculate max label length to ensure total text ≤ 280 chars
  const fixedParts = ["Today's ", event.label, " since ", " (", formattedOriginalDate, ") - Calculated with Jublio at https://jublio.pl"];
  const fixedPartLength = fixedParts.reduce((sum, part) => sum + part.length, 0);
  const maxLabelLength = Math.max(1, MAX_SHARE_TEXT_LENGTH - fixedPartLength);

  const isLabelValid = label.trim().length > 0 && currentTextLength <= MAX_SHARE_TEXT_LENGTH;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={handleClose} style={{ zIndex: 1040 }} />

      {/* Modal */}
      <div className="modal fade show" style={{ display: "block", zIndex: 1050 }} tabIndex={-1} role="dialog" aria-labelledby="share-modal-title" aria-modal="true" ref={modalRef}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="share-modal-title">
                Share Milestone
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
                    <strong>Share text preview:</strong>
                    <div className="preview-text" id="preview-text">
                      {previewText}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between">
                    <div></div>
                    <small id="label-help" className="text-muted">
                      {currentTextLength}/{MAX_SHARE_TEXT_LENGTH} characters
                    </small>
                  </div>
                </div>

                <div className="provider-buttons" role="group" aria-label="Social sharing providers">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleProviderClick(SocialProvider.Facebook)}
                    disabled={!isLabelValid}
                    aria-label="Share to Facebook"
                  >
                    Facebook
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleProviderClick(SocialProvider.Messenger)}
                    disabled={!isLabelValid}
                    aria-label="Share to Messenger"
                  >
                    Messenger
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleProviderClick(SocialProvider.WhatsApp)}
                    disabled={!isLabelValid}
                    aria-label="Share to WhatsApp"
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleProviderClick(SocialProvider.Twitter)}
                    disabled={!isLabelValid}
                    aria-label="Share to X (Twitter)"
                  >
                    X (Twitter)
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleProviderClick(SocialProvider.LinkedIn)}
                    disabled={!isLabelValid}
                    aria-label="Share to LinkedIn"
                  >
                    LinkedIn
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleProviderClick(SocialProvider.SMS)}
                    disabled={!isLabelValid}
                    aria-label="Share via SMS"
                  >
                    SMS
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => handleProviderClick(SocialProvider.Copy)}
                    disabled={!isLabelValid}
                    aria-label="Copy to clipboard"
                  >
                    📋 Copy
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
