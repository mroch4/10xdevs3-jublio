import { useState } from "react";
import MilestoneCalculator from "./components/MilestoneCalculator";
import { AuthHeader } from "./components/AuthHeader";
import { useAuth } from "./hooks/useAuth";
import Bookmark from "./utils/classes/Bookmark";
import { addBookmark, getBookmarks, checkTitleUniqueness } from "./firebase/firestoreService";

function App() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<string>("");

  const handleTestAdd = async () => {
    if (!user?.email) {
      setTestResult("❌ Not signed in");
      return;
    }

    try {
      const bookmark = new Bookmark("Test Bookmark", "2026-07-03T14:30:00");
      const docId = await addBookmark(user.email, bookmark);
      setTestResult(`✅ Added bookmark with ID: ${docId}`);
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleTestGet = async () => {
    if (!user?.email) {
      setTestResult("❌ Not signed in");
      return;
    }

    try {
      const bookmarks = await getBookmarks(user.email);
      setTestResult(`✅ Found ${bookmarks.length} bookmark(s): ${bookmarks.map(b => b.title).join(", ")}`);
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleTestUniqueness = async () => {
    if (!user?.email) {
      setTestResult("❌ Not signed in");
      return;
    }

    try {
      const isUnique = await checkTitleUniqueness(user.email, "Test Bookmark");
      setTestResult(`✅ Title "Test Bookmark" is ${isUnique ? "unique" : "NOT unique (duplicate)"}`);
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <>
      <div className="container-md">
        <header className="my-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="mb-0">Jublio</h1>
            </div>
            <AuthHeader />
          </div>
          <h5 className="text-center">Calculate when your next milestone moment arrives</h5>
        </header>

        {/* Temporary Test Buttons */}
        {user && (
          <div className="alert alert-info my-3">
            <h6 className="mb-2">🧪 Firestore Test (Temporary)</h6>
            <div className="d-flex gap-2 mb-2">
              <button className="btn btn-sm btn-primary" onClick={handleTestAdd}>
                Add Test Bookmark
              </button>
              <button className="btn btn-sm btn-secondary" onClick={handleTestGet}>
                Get Bookmarks
              </button>
              <button className="btn btn-sm btn-info" onClick={handleTestUniqueness}>
                Check Uniqueness
              </button>
            </div>
            {testResult && (
              <div className="mt-2">
                <small>{testResult}</small>
              </div>
            )}
          </div>
        )}

        <div className="my-4">
          <MilestoneCalculator />
        </div>
      </div>
    </>
  );
}

export default App;
