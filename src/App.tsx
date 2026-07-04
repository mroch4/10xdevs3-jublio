import { AuthHeader } from "./components/AuthHeader";
import { ErrorBoundary } from "./components/ErrorBoundary";
import MilestoneCalculator from "./components/MilestoneCalculator";
import BookmarksView from "./components/BookmarksView";
import Tab from "./utils/enums/Tab";
import { useState } from "react";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Calculator);
  const [autofillDate, setAutofillDate] = useState<string | null>(null);

  const handleLoadBookmark = (date: string) => {
    setAutofillDate(date);
    setActiveTab(Tab.Calculator);
  };

  const handleAutofillConsumed = () => {
    setAutofillDate(null);
  };

  return (
    <ErrorBoundary>
      <div className="container-md">
        <header className="my-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="mb-0">Jublio</h1>
            </div>
            <AuthHeader />
          </div>
          <h5 className="text-center">Calculate when your next milestone moment arrives!</h5>
        </header>

        {/* Tab Navigation */}
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === Tab.Calculator ? "active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeTab === Tab.Calculator}
              onClick={() => setActiveTab(Tab.Calculator)}
            >
              Calculator
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === Tab.Bookmarks ? "active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeTab === Tab.Bookmarks}
              onClick={() => setActiveTab(Tab.Bookmarks)}
            >
              My Bookmarks
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content border border-top-0 rounded-bottom p-4">
          {activeTab === Tab.Calculator && <MilestoneCalculator onSwitchToBookmarks={() => setActiveTab(Tab.Bookmarks)} autofillDate={autofillDate} onAutofillConsumed={handleAutofillConsumed} />}
          {activeTab === Tab.Bookmarks && <BookmarksView onLoadBookmark={handleLoadBookmark} onSwitchToCalculator={() => setActiveTab(Tab.Calculator)} />}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
