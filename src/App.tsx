import { useState } from "react";
import { useDashboardStore } from "./dashboardStore";
import { Dashboard } from "./Dashboard";
import { processAgentFunctionCall } from "./agentFunctions";
import { mockAgentCall } from "./mockAgent";
import { realAgentCall } from "./openaiAgent";

export default function App() {
  const [userPrompt, setUserPrompt] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const snapshot = useDashboardStore
      .getState()
      .modules.map(({ id, moduleType, config }) => ({
        id,
        moduleType,
        config,
      }));

    const agentResponse = await realAgentCall(userPrompt, snapshot);
    console.log("Agent final message:", agentResponse);

    setUserPrompt("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Financial Dashboard Playground</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Ask the agent..."
          style={{ width: 400, padding: 8, marginRight: 8 }}
        />
        <button type="submit">Submit</button>
      </form>

      <hr />

      <Dashboard />
    </div>
  );
}
