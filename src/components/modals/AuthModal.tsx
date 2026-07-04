import "../Animations.css";

import type { FormEvent } from "react";
import { getAuthErrorMessage } from "../../firebase/authErrors";
import { useAuth } from "../../hooks/useAuth";
import { useState, useCallback } from "react";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email);
      setSuccess(true);
      setLoading(false);
      // Don't auto-close - user will close manually
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    setEmail("");
    setSuccess(false);
    setError(null);
    setLoading(false);
    onClose();
  }, [onClose]);

  // Handle ESC key to close modal
  useEscapeKey(handleClose, isOpen, loading);

  const handleRetry = () => {
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={handleClose} style={{ zIndex: 1040 }} />

      {/* Modal */}
      <div className="modal fade show" style={{ display: "block", zIndex: 1050 }} tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Sign In</h5>
              <button type="button" className="btn-close" onClick={handleClose} aria-label="Close" disabled={loading} />
            </div>

            <div className="modal-body">
              {success ? (
                <div className="alert alert-success fade show" role="alert">
                  <strong>Check your email!</strong>
                  <br />
                  We've sent a sign-in link to <strong>{email}</strong>
                  <br />
                  <small className="text-muted">(Link valid for 1 hour. Check spam folder if not received.)</small>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      autoFocus
                      placeholder="you@example.com"
                    />
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                      <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={handleRetry}>
                        Retry
                      </button>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary w-100" disabled={loading || !email}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Sending...
                      </>
                    ) : (
                      "Send Link"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
