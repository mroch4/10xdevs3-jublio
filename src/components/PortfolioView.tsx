import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import Bookmark from "../utils/classes/Bookmark";
import BookmarkCard from "./BookmarkCard";

interface PortfolioViewProps {
  onLoadBookmark: (date: string) => void;
  onSwitchToCalculator: () => void;
}

export default function PortfolioView({ onLoadBookmark, onSwitchToCalculator }: PortfolioViewProps) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(!!user?.email); // Only show loading if user is logged in
  const [error, setError] = useState<string | null>(null);

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

  if (!user) {
    return (
      <div className="alert alert-info" role="alert">
        <h5 className="alert-heading">Sign in to view your portfolio</h5>
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
        <p className="text-muted mb-4">Start by calculating milestones for a date you care about!</p>
        <button className="btn btn-primary" onClick={onSwitchToCalculator}>
          Go to Calculator
        </button>
      </div>
    );
  }

  return (
    <div>
      <h5 className="mb-3">Your Bookmarked Dates</h5>
      <div className="list-group">
        {bookmarks.map((bookmark) => (
          <BookmarkCard key={bookmark.createdAt} bookmark={bookmark} onLoadBookmark={onLoadBookmark} />
        ))}
      </div>
    </div>
  );
}
