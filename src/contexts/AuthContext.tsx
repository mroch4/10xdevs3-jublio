import { clearStaleEmail, completeMagicLinkSignIn, signOut as firebaseSignOut, getStoredEmail, isSignInLink, sendMagicLink } from "../firebase/authService";
import { createContext, useEffect, useState } from "react";

import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Context is exported for useAuth hook
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear stale emails on mount
    clearStaleEmail();

    // Check if URL contains a sign-in link
    if (isSignInLink()) {
      const email = getStoredEmail();
      if (email) {
        completeMagicLinkSignIn(email).catch((error) => {
          console.error("Failed to complete sign-in:", error);
        });
      }
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string): Promise<void> => {
    await sendMagicLink(email);
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut();
  };

  const value: AuthContextValue = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
