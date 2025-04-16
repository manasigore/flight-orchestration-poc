import React, { useState } from "react";

type EvalResult = {
  ruleId: string;
  message: string;
};

export const EvaluateForm: React.FC = () => {
  const [flightId, setFlightId] = useState("");
  const [results, setResults] = useState<EvalResult[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:3000/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flightId }),
    });

    if (!response.ok) {
      const error = await response.json();
      setResults(null);
      alert(error.error || "Failed to evaluate flight");
      return;
    }

    const data = await response.json();
    setResults(data.results);
  };

  return (
    <div>
      <h2>Evaluate Flight Automation</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Flight ID"
          value={flightId}
          onChange={(e) => setFlightId(e.target.value)}
        />
        <button type="submit">Evaluate</button>
      </form>

      {results && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Matching Rule:</h3>
          {results.length === 0 ? (
            <p>No rules matched.</p>
          ) : (
            <ul>
              {results.map((r) => (
                <li key={r.ruleId}>
                  <strong>{r.ruleId}</strong>: {r.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
