import { Temporal } from "@js-temporal/polyfill";
import Bookmark from "../utils/classes/Bookmark";
import { useState } from "react";
import { BookmarkEditModal } from "./BookmarkEditModal";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onLoadBookmark: (date: string) => void;
  onEditSuccess: () => void;
  userEmail: string;
}

export default function BookmarkCard({ bookmark, onLoadBookmark, onEditSuccess, userEmail }: BookmarkCardProps) {
  const locale = navigator.language;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsEditModalOpen(true);
  };

  return (
    <>
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
          <div className="flex-grow-1">
            <h6 className="mb-1">{bookmark.title}</h6>
            <small className="text-muted">{formatDate(bookmark.date)}</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span
              role="button"
              tabIndex={0}
              onClick={handleEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleEdit(e);
                }
              }}
              aria-label="Edit bookmark"
              title="Edit"
              style={{ cursor: "pointer", fontSize: "1.2rem" }}
            >
              ✏️
            </span>
            <span className="text-muted">→</span>
          </div>
        </div>
      </div>

      <BookmarkEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={onEditSuccess}
        bookmark={bookmark}
        userEmail={userEmail}
      />
    </>
  );
}
