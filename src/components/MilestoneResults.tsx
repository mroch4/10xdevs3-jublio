import "./MilestoneResults.css";

import { filterEvents, getCategoryOrder, groupByCategory, sortEventsByDate } from "../utils/eventGrouping";

import CalendarExportModal from "./CalendarExportModal";
import { CalendarProvider } from "../utils/enums/CalendarProvider";
import Event from "../utils/classes/Event";
import { EventCategory } from "../utils/enums/EventCategory";
import Toast from "./Toast";
import { generateCalendarUrl } from "../utils/calendarExport";
import { useState } from "react";

interface MilestoneResultsProps {
  events: Event[];
  locale: string; // Used by parent to create Event objects with locale-aware formatting
}

export default function MilestoneResults({ events }: MilestoneResultsProps) {
  // Note: locale is used by parent to create Event objects with locale-formatted dateString
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
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

  const handleExportClick = (event: Event) => {
    setSelectedEvent(event);
    setExportModalOpen(true);
  };

  const handleExport = (provider: CalendarProvider, label: string) => {
    if (!selectedEvent) return;

    try {
      const url = generateCalendarUrl(selectedEvent, label, provider);
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");

      if (newWindow === null) {
        // Popup blocked
        setToastMessage("Please allow popups for this site to export to calendar.");
      } else {
        // Success
        const providerName = provider === CalendarProvider.Google ? "Google Calendar" : provider === CalendarProvider.Apple ? "Apple Calendar" : "Outlook";
        setToastMessage(`Opening ${providerName}... Please log in if the calendar doesn't open.`);
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
                    <div>
                      <h6 className="mb-1">+ {event.label}</h6>
                      <small>{event.dateString}</small>
                    </div>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {selectedEvent && <CalendarExportModal isOpen={exportModalOpen} onClose={handleCloseModal} event={selectedEvent} onExport={handleExport} />}

      <Toast message={toastMessage || ""} show={toastMessage !== null} onClose={handleCloseToast} />
    </div>
  );
}
