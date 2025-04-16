import "./App.css";
import { EvaluateForm } from "./components/EvaluateForm";
import { CreateRuleForm } from "./components/CreateRuleForm";
import { RuleList } from "./components/RuleList";
import { FlightList } from "./components/FlightList";

function App() {
  return (
    <div className="App">
      <h1>Flight Messaging Orchestration</h1>
      <EvaluateForm />
      <hr />
      <CreateRuleForm />
      <hr />
      <RuleList />
      <hr />
      <FlightList />
    </div>
  );
}

export default App;
