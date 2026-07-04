import { AuthHeader } from "./components/AuthHeader";
import MilestoneCalculator from "./components/MilestoneCalculator";
import PortfolioView from "./components/PortfolioView";
import { useState } from "react";

type Tab = "calculator" | "portfolio";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");

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
              className={`nav-link ${activeTab === "calculator" ? "active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeTab === "calculator"}
              onClick={() => setActiveTab("calculator")}
            >
              Calculator
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === "portfolio" ? "active" : ""}`}
              type="button"
              role="tab"
              aria-selected={activeTab === "portfolio"}
              onClick={() => setActiveTab("portfolio")}
            >
              My Portfolio
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content border border-top-0 rounded-bottom p-4">
          {activeTab === "calculator" && <MilestoneCalculator onSwitchToPortfolio={() => setActiveTab("portfolio")} />}
          {activeTab === "portfolio" && <PortfolioView />}
        </div>
      </div>
    </>
  );
}

export default App;
