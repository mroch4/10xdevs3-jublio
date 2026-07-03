import Milestone from "./classes/Milestone";
import { EventCategory } from "./enums/EventCategory";

/**
 * Filters events (currently returns all events - no filtering)
 * @param events - Array of milestone events
 * @returns Object with all events (no filtering applied)
 */
export function filterEvents(events: Milestone[]): {
  visible: Milestone[];
  beyondCount: number;
} {
  // Return all events - Beyond Human Life Expectancy will be shown as a regular group
  return { visible: events, beyondCount: 0 };
}

/**
 * Groups events by their category
 * @param events - Array of milestone events
 * @returns Map of category to events array
 */
export function groupByCategory(events: Milestone[]): Map<EventCategory, Milestone[]> {
  const groups = new Map<EventCategory, Milestone[]>();

  events.forEach((event) => {
    const category = event.category as EventCategory;
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(event);
  });

  return groups;
}

/**
 * Sorts events chronologically (nearest first)
 * @param events - Array of milestone events
 * @returns Sorted array of events
 */
export function sortEventsByDate(events: Milestone[]): Milestone[] {
  return [...events].sort((a, b) => {
    return a.date.toString().localeCompare(b.date.toString());
  });
}

/**
 * Returns the display order for event categories
 * @returns Array of categories in temporal order (future first, past last)
 */
export function getCategoryOrder(): EventCategory[] {
  return [
    EventCategory.Today,
    EventCategory.ThisWeek,
    EventCategory.NextWeek,
    EventCategory.ThisMonth,
    EventCategory.NextMonth,
    EventCategory.ThisYear,
    EventCategory.NextYear,
    EventCategory.Further,
    EventCategory.BeyondHumanLifeExpectancy,
    EventCategory.AlreadyPassed,
  ];
}
