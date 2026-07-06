import "./MilestoneResults.css";

import { filterEvents, getCategoryOrder, groupByCategory, sortEventsByDate } from "../utils/eventGrouping";

import CalendarExportModal from "./modals/CalendarExportModal";
import ShareModal from "./modals/ShareModal";
import { CalendarProvider } from "../utils/enums/CalendarProvider";
import { SocialProvider } from "../utils/enums/SocialProvider";
import Milestone from "../utils/classes/Milestone";
import { EventCategory } from "../utils/enums/EventCategory";
import Toast from "./Toast";
import { generateCalendarUrl } from "../utils/calendarExport";
import { generateShareUrl } from "../utils/socialShare";
import { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";

interface MilestoneResultsProps {
  events: Milestone[];
  locale: string; // Used by parent to create Milestone objects with locale-aware formatting
  originalDate: Temporal.PlainDate | Temporal.PlainDateTime | null;
  prefillTitle?: string | null;
}

export default function MilestoneResults({ events, locale, originalDate, prefillTitle }: MilestoneResultsProps) {
  // Note: locale is used by parent to create Milestone objects with locale-formatted dateString
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Milestone | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedShareEvent, setSelectedShareEvent] = useState<Milestone | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // No longer filtering - all events are visible
  const { visible } = filterEvents(events);

  // Group by category
  const groupedEvents = groupByCategory(visible);

  // Get category order
  const categoryOrder = getCategoryOrder();

  // Empty state
  if (visible.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        No milestones to display.
      </div>
    );
  }

  const handleExportClick = (event: Milestone) => {
    setSelectedEvent(event);
    setExportModalOpen(true);
  };

  const handleExport = (provider: CalendarProvider, label: string) => {
    if (!selectedEvent || !originalDate) return;

    try {
      const url = generateCalendarUrl(selectedEvent, label, provider, originalDate, locale);

      if (provider === CalendarProvider.Apple) {
        // Apple Calendar: Download .ics file
        const link = document.createElement('a');
        link.href = url;
        link.download = `${label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_milestone.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        setTimeout(() => URL.revokeObjectURL(url), 100);

        setToastMessage("Calendar file downloaded. Open it to add the event to Apple Calendar.");
      } else {
        // Google Calendar / Outlook: Open in new tab
        const newWindow = window.open(url, "_blank", "noopener,noreferrer");

        if (newWindow === null) {
          // Popup blocked
          setToastMessage("Please allow popups for this site to export to calendar.");
        } else {
          // Success
          const providerName = provider === CalendarProvider.Google ? "Google Calendar" : "Outlook";
          setToastMessage(`Opening ${providerName}... Please log in if the calendar doesn't open.`);
        }
      }
    } catch (error) {
      console.error("Failed to generate calendar URL:", error);
      setToastMessage("Failed to generate calendar link. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setExportModalOpen(false);
    setSelectedEvent(null);
  };

  const handleShareClick = (event: Milestone) => {
    setSelectedShareEvent(event);
    setShareModalOpen(true);
  };

  const handleShare = (provider: SocialProvider, label: string) => {
    if (!selectedShareEvent || !originalDate) return;

    try {
      // Special handling for Copy provider
      if (provider === SocialProvider.Copy) {
        const shareText = generateShareUrl(selectedShareEvent, label, provider, originalDate, locale);
        navigator.clipboard.writeText(shareText).then(() => {
          setToastMessage("Copied to clipboard! Paste it anywhere to share.");
        }).catch((err) => {
          console.error("Failed to copy to clipboard:", err);
          setToastMessage("Failed to copy to clipboard. Please try again.");
        });
        return;
      }

      // Providers that need clipboard support (don't support pre-filled text)
      const clipboardProviders = [SocialProvider.Facebook, SocialProvider.Messenger, SocialProvider.LinkedIn];
      const needsClipboard = clipboardProviders.includes(provider);

      // Copy text to clipboard for Facebook, Messenger, LinkedIn
      if (needsClipboard) {
        const shareText = generateShareUrl(selectedShareEvent, label, SocialProvider.Copy, originalDate, locale);
        navigator.clipboard.writeText(shareText).catch((err) => {
          console.error("Failed to copy to clipboard:", err);
        });
      }

      // Handle URL-based providers (Facebook, Twitter, WhatsApp, SMS, Messenger, LinkedIn)
      const url = generateShareUrl(selectedShareEvent, label, provider, originalDate, locale);
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");

      if (newWindow === null) {
        // Popup blocked
        setToastMessage("Please allow popups for this site to share on social media.");
      } else {
        // Success
        const providerName = provider; // "Facebook", "Twitter", etc.
        setToastMessage(`Opening ${providerName}... Share your milestone!`);
      }
    } catch (error) {
      console.error("Failed to generate share URL:", error);
      setToastMessage("Failed to generate share link. Please try again.");
    }
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
    setSelectedShareEvent(null);
  };

  const handleCloseToast = () => {
    setToastMessage(null);
  };

  return (
    <div className="milestone-results">
      {categoryOrder.map((category) => {
        const categoryEvents = groupedEvents.get(category);
        if (!categoryEvents || categoryEvents.length === 0) {
          return null;
        }

        // Sort events within category
        const sortedEvents = sortEventsByDate(categoryEvents);
        const isPastCategory = category === EventCategory.AlreadyPassed;

        return (
          <div key={category}>
            <h4 className="category-header">{category}</h4>
            <div className="list-group mb-3">
              {sortedEvents.map((event, index) => (
                <div key={`${category}-${index}`} className={`list-group-item ${isPastCategory ? "milestone-past" : ""}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className="mb-0">+ {event.label}</h6>
                        {event.isCustom && (
                          <span className="badge bg-primary custom-badge">Custom</span>
                        )}
                      </div>
                      <small>{event.dateString}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="calendar-icon"
                        onClick={() => handleExportClick(event)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleExportClick(event);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Export to calendar"
                      >
                        📅
                      </span>
                      <span
                        className="share-icon"
                        onClick={() => handleShareClick(event)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleShareClick(event);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Share on social media"
                      >
                        🔗
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {selectedEvent && (
        <CalendarExportModal 
          isOpen={exportModalOpen} 
          onClose={handleCloseModal} 
          event={selectedEvent} 
          onExport={handleExport}
          originalDate={originalDate}
          locale={locale}
          prefillTitle={prefillTitle}
        />
      )}

      {selectedShareEvent && (
        <ShareModal 
          isOpen={shareModalOpen} 
          onClose={handleCloseShareModal} 
          event={selectedShareEvent} 
          onShare={handleShare}
          originalDate={originalDate}
          locale={locale}
          prefillTitle={prefillTitle}
        />
      )}

      <Toast message={toastMessage || ""} show={toastMessage !== null} onClose={handleCloseToast} />
    </div>
  );
}
