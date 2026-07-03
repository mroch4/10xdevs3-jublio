import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './config';
import Bookmark from '../utils/classes/Bookmark';

/**
 * Check if a title is unique for a user (case-insensitive).
 * @param email - User's email address (collection key)
 * @param title - Title to check
 * @param excludeId - Optional document ID to exclude from the check (for updates)
 * @returns true if title is available (unique), false if already exists
 */
export async function checkTitleUniqueness(
  email: string,
  title: string,
  excludeId?: string
): Promise<boolean> {
  const titleLower = title.toLowerCase();
  const bookmarksRef = collection(db, 'milestones', email, 'bookmarks');
  const q = query(bookmarksRef, where('titleLowercase', '==', titleLower));

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return true; // No duplicates found
  }

  // If excludeId provided, check if the only match is the document being updated
  if (excludeId && snapshot.size === 1 && snapshot.docs[0].id === excludeId) {
    return true;
  }

  return false; // Duplicate found
}

/**
 * Get all bookmarks for a user, sorted by createdAt descending.
 * @param email - User's email address (collection key)
 * @returns Array of Bookmark instances
 */
export async function getBookmarks(email: string): Promise<Bookmark[]> {
  const bookmarksRef = collection(db, 'milestones', email, 'bookmarks');
  const q = query(bookmarksRef, orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    const bookmark = new Bookmark(data.title, data.date);
    // Restore timestamps from Firestore
    bookmark.createdAt = data.createdAt;
    bookmark.updatedAt = data.updatedAt;
    bookmark.titleLowercase = data.titleLowercase;
    return bookmark;
  });
}

/**
 * Add a new bookmark for a user.
 * @param email - User's email address (collection key)
 * @param bookmark - Bookmark instance to save
 * @returns Document ID (same as bookmark.createdAt)
 */
export async function addBookmark(email: string, bookmark: Bookmark): Promise<string> {
  const docId = bookmark.createdAt.toString();
  const bookmarkRef = doc(db, 'milestones', email, 'bookmarks', docId);

  await setDoc(bookmarkRef, {
    title: bookmark.title,
    titleLowercase: bookmark.titleLowercase,
    date: bookmark.date,
    createdAt: bookmark.createdAt,
    updatedAt: bookmark.updatedAt,
  });

  return docId;
}

/**
 * Update an existing bookmark for a user.
 * @param email - User's email address (collection key)
 * @param docId - Document ID to update
 * @param bookmark - Updated Bookmark instance (createdAt will be preserved)
 */
export async function updateBookmark(
  email: string,
  docId: string,
  bookmark: Bookmark
): Promise<void> {
  const bookmarkRef = doc(db, 'milestones', email, 'bookmarks', docId);

  // Get existing document to preserve createdAt
  const existingDoc = await getDoc(bookmarkRef);
  if (!existingDoc.exists()) {
    throw new Error(`Bookmark with ID ${docId} not found`);
  }

  const existingData = existingDoc.data();

  await setDoc(bookmarkRef, {
    title: bookmark.title,
    titleLowercase: bookmark.titleLowercase,
    date: bookmark.date,
    createdAt: existingData.createdAt, // Preserve original createdAt
    updatedAt: bookmark.updatedAt,
  });
}

/**
 * Delete a bookmark for a user.
 * @param email - User's email address (collection key)
 * @param docId - Document ID to delete
 */
export async function deleteBookmark(email: string, docId: string): Promise<void> {
  const bookmarkRef = doc(db, 'milestones', email, 'bookmarks', docId);
  await deleteDoc(bookmarkRef);
}
