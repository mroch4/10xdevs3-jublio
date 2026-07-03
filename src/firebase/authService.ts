import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from './config';

const EMAIL_STORAGE_KEY = 'emailForSignIn';

interface EmailStorage {
  email: string;
  timestamp: number;
}

/**
 * Send a magic link to the user's email for passwordless sign-in
 */
export async function sendMagicLink(email: string): Promise<void> {
  const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);

  // Store email with timestamp for cleanup
  const storage: EmailStorage = {
    email,
    timestamp: Date.now(),
  };
  localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(storage));
}

/**
 * Complete the magic link sign-in flow
 */
export async function completeMagicLinkSignIn(email: string): Promise<void> {
  await signInWithEmailLink(auth, email, window.location.href);

  // Clear the stored email after successful sign-in
  localStorage.removeItem(EMAIL_STORAGE_KEY);
}

/**
 * Check if the current URL is a sign-in link
 */
export function isSignInLink(): boolean {
  return isSignInWithEmailLink(auth, window.location.href);
}

/**
 * Get the stored email for sign-in, if any
 */
export function getStoredEmail(): string | null {
  const stored = localStorage.getItem(EMAIL_STORAGE_KEY);
  if (!stored) return null;

  try {
    const storage: EmailStorage = JSON.parse(stored);
    return storage.email;
  } catch {
    // Invalid format, clear it
    localStorage.removeItem(EMAIL_STORAGE_KEY);
    return null;
  }
}

/**
 * Clear stale emails from localStorage (older than 1 hour)
 */
export function clearStaleEmail(): void {
  const stored = localStorage.getItem(EMAIL_STORAGE_KEY);
  if (!stored) return;

  try {
    const storage: EmailStorage = JSON.parse(stored);
    const oneHourMs = 60 * 60 * 1000;
    const isStale = Date.now() - storage.timestamp > oneHourMs;

    if (isStale) {
      localStorage.removeItem(EMAIL_STORAGE_KEY);
    }
  } catch {
    // Invalid format, clear it
    localStorage.removeItem(EMAIL_STORAGE_KEY);
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  // Clear any stored email on sign-out
  localStorage.removeItem(EMAIL_STORAGE_KEY);
}
