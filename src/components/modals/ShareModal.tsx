import "./ShareModal.css";

import { useCallback, useState, useEffect } from "react";

import { SocialProvider } from "../../utils/enums/SocialProvider";
import { EventCategory } from "../../utils/enums/EventCategory";
import { MAX_SHARE_TEXT_LENGTH, ATTRIBUTION_URL } from "../../utils/constants";
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
  prefillTitle?: string | null;
}

export default function ShareModal({ isOpen, onClose, event, onShare, originalDate, locale, prefillTitle }: ShareModalProps) {
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

  // Determine the context phrase based on milestone category
  let contextPhrase: string;

  switch (event.category) {
    case EventCategory.Today:
      contextPhrase = "Today's exactly";
      break;
    case EventCategory.ThisWeek:
    case EventCategory.NextWeek:
    case EventCategory.ThisMonth:
    case EventCategory.NextMonth:
    case EventCategory.ThisYear:
    case EventCategory.NextYear:
    case EventCategory.Further:
    case EventCategory.BeyondHumanLifeExpectancy:
      // Use the milestone's actual date for future events
      contextPhrase = `On ${event.dateString}, it will be exactly`;
      break;
    case EventCategory.AlreadyPassed:
      // Use the milestone's actual date for past events
      contextPhrase = `On ${event.dateString}, it was exactly`;
      break;
    default:
      contextPhrase = "Today's exactly";
  }

  // Build share text from parts - always include date in brackets for reference
  const textParts = [
    contextPhrase,
    " ",
    event.label,
    " since ",
    label.trim() || "[your label]",
    " (",
    formattedOriginalDate,
    ") - Calculated with Jublio at ",
    ATTRIBUTION_URL,
  ];

  const previewText = textParts.join("");
  const currentTextLength = textParts.reduce((sum, part) => sum + part.length, 0);

  // Calculate max label length to ensure total text ≤ 280 chars
  const fixedParts = [contextPhrase, " ", event.label, " since ", " (", formattedOriginalDate, ") - Calculated with Jublio at ", ATTRIBUTION_URL];
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

                <div className="alert alert-info py-2 px-3 mb-3" role="note">
                  <small>
                    <strong>Note:</strong> WhatsApp, X (Twitter), and SMS will pre-fill the text. 
                    For Facebook, Messenger, and LinkedIn, the text will be copied to your clipboard — just paste it after clicking!
                  </small>
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
