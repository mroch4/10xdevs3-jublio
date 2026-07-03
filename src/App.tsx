import { AuthHeader } from "./components/AuthHeader";
import MilestoneCalculator from "./components/MilestoneCalculator";

function App() {
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

        <div className="my-4">
          <MilestoneCalculator />
        </div>
      </div>
    </>
  );
}

export default App;
