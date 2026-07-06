import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";

import Bookmark from "../utils/classes/Bookmark";
import BookmarkCard from "./BookmarkCard";
import { COLLECTIONS } from "../utils/constants";
import { STORAGE_KEYS } from "../constants/storageKeys";
import Sorting from "../utils/enums/Sorting";
import Toast from "./Toast";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";

interface BookmarksViewProps {
  onLoadBookmark: (date: string, title?: string) => void;
  onSwitchToCalculator: () => void;
}

export default function BookmarksView({ onLoadBookmark, onSwitchToCalculator }: BookmarksViewProps) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(!!user?.email);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>(() => {
    if (typeof window === "undefined") return Sorting.DateDescending;
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS_SORTING);
    return saved || Sorting.DateDescending;
  });

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    // Subscribe to real-time updates
    const bookmarksRef = collection(db, COLLECTIONS.MILESTONES, user.email, COLLECTIONS.BOOKMARKS);
    const q = query(bookmarksRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedBookmarks = snapshot.docs.map((doc) => {
          const data = doc.data();
          const bookmark = new Bookmark(data.title, data.date);
          bookmark.createdAt = data.createdAt;
          bookmark.updatedAt = data.updatedAt;
          bookmark.titleLowercase = data.titleLowercase;
          return bookmark;
        });
        setBookmarks(fetchedBookmarks);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Failed to fetch bookmarks:", err);
        setError("Failed to load bookmarks. Please refresh the page.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.email]);

  // Save sorting preference to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS_SORTING, sortBy);
    }
  }, [sortBy]);

  const handleEditSuccess = () => {
    setToastMessage("Bookmark updated successfully!");
  };

  const handleDeleteSuccess = () => {
    setToastMessage("Bookmark deleted successfully!");
  };

  const handleCloseToast = () => {
    setToastMessage(null);
  };

  const getSortedBookmarks = (bookmarksToSort: Bookmark[]): Bookmark[] => {
    const sorted = [...bookmarksToSort];

    switch (sortBy) {
      case Sorting.TitleAscending:
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case Sorting.TitleDescending:
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case Sorting.DateAscending:
        return sorted.sort((a, b) => a.date.localeCompare(b.date));
      case Sorting.DateDescending:
        return sorted.sort((a, b) => b.date.localeCompare(a.date));
      case Sorting.CreatedDateAscending:
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
      case Sorting.CreatedDateDescending:
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      default:
        return sorted;
    }
  };

  if (!user) {
    return (
      <div className="alert alert-info" role="alert">
        <h5 className="alert-heading">Sign in to view your bookmarks</h5>
        <p className="mb-0">Your bookmarked dates will appear here after you sign in.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Loading your bookmarks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-5">
        <h5 className="text-muted mb-3">No bookmarks yet</h5>
        <button className="btn btn-primary" onClick={onSwitchToCalculator}>
          Go to Calculator
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
        <h5>Your Bookmarked Dates</h5>
        <div className="w-auto">
          <label htmlFor="sortSelect" className="form-label mb-0 me-2" style={{ display: "inline-block" }}>
            Sort by:
          </label>
          <select id="sortSelect" className="form-select" style={{ display: "inline-block", width: "auto" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value={Sorting.TitleAscending}>{Sorting.TitleAscending}</option>
            <option value={Sorting.TitleDescending}>{Sorting.TitleDescending}</option>
            <option value={Sorting.DateAscending}>{Sorting.DateAscending}</option>
            <option value={Sorting.DateDescending}>{Sorting.DateDescending}</option>
            <option value={Sorting.CreatedDateAscending}>{Sorting.CreatedDateAscending}</option>
            <option value={Sorting.CreatedDateDescending}>{Sorting.CreatedDateDescending}</option>
          </select>
        </div>
      </div>
      <div className="list-group">
        {getSortedBookmarks(bookmarks).map((bookmark) => (
          <BookmarkCard
            key={bookmark.createdAt}
            bookmark={bookmark}
            onLoadBookmark={onLoadBookmark}
            onEditSuccess={handleEditSuccess}
            onDeleteSuccess={handleDeleteSuccess}
            userEmail={user.email || ""}
          />
        ))}
      </div>

      {/* Toast */}
      <Toast message={toastMessage || ""} show={toastMessage !== null} onClose={handleCloseToast} />
    </div>
  );
}
