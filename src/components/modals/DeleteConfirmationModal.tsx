import "../Animations.css";

import { useState, useCallback } from "react";
import { deleteBookmark } from "../../firebase/firestoreService";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookmarkTitle: string;
  bookmarkId: string;
  userEmail: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onSuccess,
  bookmarkTitle,
  bookmarkId,
  userEmail,
}: DeleteConfirmationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setError(null);
    onClose();
  }, [onClose]);

  // Handle ESC key to close modal
  useEscapeKey(handleClose, isOpen, loading);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteBookmark(userEmail, bookmarkId);
      setLoading(false);
      onClose();
      onSuccess();
    } catch (err) {
      console.error("Failed to delete bookmark:", err);
      setError("Failed to delete bookmark. Please try again.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog" aria-labelledby="deleteBookmarkModalLabel">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="deleteBookmarkModalLabel">
              Delete Bookmark
            </h5>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close" disabled={loading}></button>
          </div>

          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <p>
              Delete <strong>"{bookmarkTitle}"</strong>? This cannot be undone.
            </p>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" style={{ zIndex: -1 }}></div>
    </div>
  );
}
