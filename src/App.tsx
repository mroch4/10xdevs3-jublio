import MilestoneCalculator from "./components/MilestoneCalculator";

function App() {
  return (
    <>
      <div className="container-md">
        <header className="my-3">
          <h1 className="text-center">Jublio</h1>
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
