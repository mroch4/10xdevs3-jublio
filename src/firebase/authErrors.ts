import { FirebaseError } from 'firebase/app';

/**
 * Map Firebase auth error codes to user-friendly messages
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'An unexpected error occurred. Please try again.';
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Invalid email format';

    case 'auth/network-request-failed':
      return 'Network error - please try again';

    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'This link has expired - send a new one';

    case 'auth/user-disabled':
      return 'This account has been disabled';

    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';

    case 'auth/invalid-continue-uri':
    case 'auth/unauthorized-continue-uri':
      return 'Invalid redirect URL. Please contact support';

    case 'auth/missing-email':
      return 'Email is required';

    default:
      return 'Sign-in failed. Please try again';
  }
}
