// src/App.jsx
import { useState } from "react";
import "./App.css";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [task, setTask] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null); // Reset response before fetching

    try {
      const res = await fetch("http://127.0.0.1:5000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey, task }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      // Parse JSON response
      const data = await res.json();
      setResponse(data); // Store full JSON response
    } catch (error) {
      setResponse({ result: `Error: ${error.message}` });
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Agent Runner</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="apiKey">OpenAI API Key</label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="task">Task for the Agent</label>
          <textarea
            id="task"
            rows="6"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            required
          ></textarea>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Running..." : "Run Agent"}
        </button>
      </form>

      {response && (
        <div className="result">
          <h2>Result</h2>
          {Array.isArray(response.result) ? (
            <ul>
              {response.result.map((action, index) => (
                <li key={index}>
                  <strong>Step {index + 1}:</strong>{" "}
                  <span className="text-content">
                    {action.content || "No content available"}
                  </span>
                  {action.error && (
                    <p style={{ color: "red" }}>Error: {action.error}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-content">{response.result}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
