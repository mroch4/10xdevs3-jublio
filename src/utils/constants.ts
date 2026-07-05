// UI-related constants
export const MAX_LABEL_LENGTH = 50;
export const MAX_EVENT_TITLE_LENGTH = 100; // Total calendar event title length (includes all parts)

// Custom milestone validation constants
export const MIN_CUSTOM_MILESTONE_VALUE = 1;
export const MAX_CUSTOM_MILESTONE_VALUE = 1000000000;

// Firestore collection name constants
export const COLLECTIONS = {
  MILESTONES: "milestones",
  BOOKMARKS: "bookmarks",
} as const;

// Social sharing constants
export const MAX_SHARE_TEXT_LENGTH = 280; // Twitter/LinkedIn limit
export const ATTRIBUTION_URL = "https://jublio.pl";
