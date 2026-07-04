import { AuthHeader } from "./components/AuthHeader";
import MilestoneCalculator from "./components/MilestoneCalculator";
import PortfolioView from "./components/PortfolioView";
import { useState } from "react";
import Tab from "./utils/enums/Tab";

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
              className={`nav-link ${activeTab === Tab.Portfolio ? "active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeTab === Tab.Portfolio}
              onClick={() => setActiveTab(Tab.Portfolio)}
            >
              My Portfolio
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content border border-top-0 rounded-bottom p-4">
          {activeTab === Tab.Calculator && (
            <MilestoneCalculator onSwitchToPortfolio={() => setActiveTab(Tab.Portfolio)} autofillDate={autofillDate} onAutofillConsumed={handleAutofillConsumed} />
          )}
          {activeTab === Tab.Portfolio && <PortfolioView onLoadBookmark={handleLoadBookmark} onSwitchToCalculator={() => setActiveTab(Tab.Calculator)} />}
        </div>
      </div>
    </>
  );
}

export default App;
