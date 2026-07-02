import DateTimeCard from "./utils/classes/DateTimeCard";
import DateTimeInput from "./components/DateTimeInput";
import MilestoneResults from "./components/MilestoneResults";
import { Temporal } from "@js-temporal/polyfill";

function App() {
  // Create sample events for testing MilestoneResults
  const sampleDateTime = Temporal.PlainDateTime.from("2026-06-15T14:30:00");
  const locale = navigator.language;
  const sampleCard = new DateTimeCard(sampleDateTime, locale);
  const sampleEvents = sampleCard.getEvents();

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

        <div className="my-4">
          <h3>Sample Milestone Results (2026-06-15 14:30)</h3>
          <MilestoneResults events={sampleEvents} locale={locale} />
        </div>
      </div>
    </>
  );
}

export default App;
