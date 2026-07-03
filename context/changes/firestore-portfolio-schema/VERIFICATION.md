# F-02 Manual Verification Guide

This guide covers manual verification steps for the Firestore Portfolio Schema implementation.

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project configured (already done in F-01)
- User authenticated via Firebase Auth (test with existing auth UI)

## Step 1: Deploy Security Rules

1. **Login to Firebase CLI** (if not already logged in):
   ```bash
   firebase login
   ```

2. **Initialize Firestore** (if this is first Firestore setup):
   ```bash
   firebase init firestore
   ```
   - Select your existing Firebase project
   - Accept default `firestore.rules` location
   - Accept default `firestore.indexes.json` location

3. **Deploy security rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Verify deployment**:
   - Open Firebase Console: https://console.firebase.google.com/
   - Navigate to your project
   - Go to Firestore Database → Rules tab
   - Confirm rules show email-scoped bookmark access

## Step 2: Verify Firestore Instance Initialization

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Open browser** at http://localhost:5173/

3. **Open browser console** (F12)

4. **Check for Firestore initialization**:
   - Should see NO errors related to Firestore
   - Firebase should initialize without warnings

## Step 3: Test Bookmark Creation (Manual)

### Using Browser Console

After signing in via the existing auth UI:

```javascript
// Import the service (assumes you expose it for testing or use from DevTools)
import { addBookmark, checkTitleUniqueness } from './src/firebase/firestoreService';
import Bookmark from './src/utils/classes/Bookmark';

// Get authenticated user email
const email = firebase.auth().currentUser.email;

// Test uniqueness check
const isUnique = await checkTitleUniqueness(email, "Test Bookmark");
console.log("Title unique?", isUnique); // Should be true

// Create test bookmark
const bookmark = new Bookmark("Test Bookmark", "2026-07-03T14:30:00");
const docId = await addBookmark(email, bookmark);
console.log("Created bookmark with ID:", docId);

// Verify uniqueness fails for duplicate
const isDuplicate = await checkTitleUniqueness(email, "Test Bookmark");
console.log("Title unique after adding?", isDuplicate); // Should be false

// Case-insensitive check
const isCaseMatch = await checkTitleUniqueness(email, "test bookmark");
console.log("Case-insensitive match?", isCaseMatch); // Should be false
```

### Verify in Firebase Console

1. Open Firebase Console → Firestore Database
2. Navigate to collection: `{your-email}/bookmarks/`
3. Verify document exists with:
   - Document ID: epoch milliseconds
   - Fields: `title`, `titleLowercase`, `date`, `createdAt`, `updatedAt`
   - `titleLowercase` should equal `title.toLowerCase()`

## Step 4: Test Security Rules

### Test Authenticated Access (Should Succeed)

```javascript
// While signed in, try to read your own bookmarks
import { getBookmarks } from './src/firebase/firestoreService';
const bookmarks = await getBookmarks(firebase.auth().currentUser.email);
console.log("My bookmarks:", bookmarks);
```

### Test Unauthenticated Access (Should Fail)

1. Sign out from the auth UI
2. Try to access Firestore in console:
```javascript
// This should throw permission denied error
import { getBookmarks } from './src/firebase/firestoreService';
const bookmarks = await getBookmarks("someone@example.com");
// Expected error: Missing or insufficient permissions
```

### Test Cross-User Access (Should Fail)

Sign in as User A, then try to read User B's bookmarks:
```javascript
// Should throw permission denied
const otherUserBookmarks = await getBookmarks("different-user@example.com");
// Expected error: Missing or insufficient permissions
```

### Test Title Length Validation (Should Fail)

```javascript
const longTitle = "a".repeat(51); // 51 characters
const invalidBookmark = new Bookmark(longTitle, "2026-07-03");
await addBookmark(email, invalidBookmark);
// Expected error: Title exceeds max length
```

## Step 5: Verification Checklist

Mark each item as you verify:

- [ ] Security rules deployed successfully
- [ ] No Firestore initialization errors in console
- [ ] Can create bookmark when authenticated
- [ ] Bookmark visible in Firebase Console
- [ ] Document ID matches `createdAt` timestamp
- [ ] `titleLowercase` field correctly derived
- [ ] Title uniqueness check works (case-insensitive)
- [ ] Cannot create duplicate titles (case-insensitive)
- [ ] Cannot access bookmarks without authentication
- [ ] Cannot access other users' bookmarks
- [ ] Title max length (50 chars) enforced by security rules
- [ ] `createdAt` preserved on updates (test with `updateBookmark`)

## Troubleshooting

### "Permission denied" on writes

- Verify security rules deployed: `firebase deploy --only firestore:rules`
- Check Firebase Console → Rules tab shows correct rules
- Verify user is authenticated: `firebase.auth().currentUser` should not be null

### "Missing index" error

- Firestore should auto-create single-field index for `titleLowercase`
- If error persists, check Firebase Console → Firestore → Indexes tab
- Follow Firebase prompt to create missing index

### Title uniqueness not enforcing

- Verify `titleLowercase` field exists in Firestore documents
- Check case: `"Test"` and `"test"` should both be rejected as duplicates
- Verify `checkTitleUniqueness()` is called before `addBookmark()`

## Next Steps

Once all verification passes:
1. Update plan progress in `context/changes/firestore-portfolio-schema/plan.md`
2. Mark change as `implemented` in `change.md`
3. Commit changes with message: "feat: implement F-02 Firestore portfolio schema"
4. Ready for S-02 implementation (bookmark UI)
