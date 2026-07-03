import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthModal } from './AuthModal';

export function AuthHeader() {
  const { user, loading, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center">
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        />
        <span className="text-muted small">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="d-flex align-items-center gap-3">
        <span className="text-muted small">{user.email}</span>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              />
              Signing out...
            </>
          ) : (
            'Sign Out'
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        className="btn btn-sm btn-primary"
        onClick={() => setShowModal(true)}
      >
        Sign In
      </button>

      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
