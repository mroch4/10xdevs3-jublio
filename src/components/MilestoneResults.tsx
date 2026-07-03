import Event from "../utils/classes/Event";
import { EventCategory } from "../utils/enums/EventCategory";
import {
  filterEvents,
  groupByCategory,
  sortEventsByDate,
  getCategoryOrder,
} from "../utils/eventGrouping";
import "./MilestoneResults.css";

interface MilestoneResultsProps {
  events: Event[];
  locale: string; // Used by parent to create Event objects with locale-aware formatting
}

export default function MilestoneResults({
  events,
}: MilestoneResultsProps) {
  // Note: locale is used by parent to create Event objects with locale-formatted dateString

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
                <div
                  key={`${category}-${index}`}
                  className={`list-group-item ${
                    isPastCategory ? "milestone-past" : ""
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">+ {event.label}</h6>
                      <small>{event.dateString}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
