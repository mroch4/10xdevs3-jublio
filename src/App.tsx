import DateTimeInput from "./components/DateTimeInput";
import { Temporal } from "@js-temporal/polyfill";

function App() {
  const handleCalculate = (date: Temporal.PlainDate, time?: Temporal.PlainTime) => {
    console.log("Calculate called with:", { date: date.toString(), time: time?.toString() });
  };

  return (
    <>
      <div className="container-md">
        <header className="my-3">
          <h1 className="text-center">Jublio</h1>
          <h5 className="text-center">Calculate when your next milestone moment arrives</h5>
        </header>

        <div className="my-4">
          <DateTimeInput onCalculate={handleCalculate} />
        </div>
      </div>
    </>
  );
}

export default App;
