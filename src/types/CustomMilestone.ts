/**
 * Custom milestone interface for session-only milestone values.
 * Custom milestones are stored as value+unit offsets (e.g., 420 days)
 * and calculated at display time as inputDate + value [unit].
 */
export interface CustomMilestone {
  id: string; // Local ID: `${value}-${unit}` for React key and removal
  value: number; // Offset value (e.g., 420)
  unit: string; // Time unit from DateTimeUnit enum (e.g., "days")
}
