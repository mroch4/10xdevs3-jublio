import { Temporal } from "@js-temporal/polyfill";
import Bookmark from "../utils/classes/Bookmark";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onLoadBookmark: (date: string) => void;
}

export default function BookmarkCard({ bookmark, onLoadBookmark }: BookmarkCardProps) {
  const locale = navigator.language;

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      // Check if it's a datetime (has 'T') or just a date
      if (dateString.includes("T")) {
        const dateTime = Temporal.PlainDateTime.from(dateString);
        return dateTime.toLocaleString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      } else {
        const date = Temporal.PlainDate.from(dateString);
        return date.toLocaleString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    } catch {
      return dateString; // Fallback if parsing fails
    }
  };

  return (
    <div
      className="list-group-item list-group-item-action"
      role="button"
      tabIndex={0}
      onClick={() => onLoadBookmark(bookmark.date)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onLoadBookmark(bookmark.date);
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-1">{bookmark.title}</h6>
          <small className="text-muted">{formatDate(bookmark.date)}</small>
        </div>
        <span className="text-muted">→</span>
      </div>
    </div>
  );
}
