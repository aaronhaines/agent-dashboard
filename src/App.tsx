import { useState } from "react";
import { useDashboardStore } from "./dashboardStore";
import { Dashboard } from "./Dashboard";
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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-white">
          Wealth Management Dashboard
        </h1>
        <form onSubmit={handleSubmit} className="flex items-center mt-4 gap-2">
          <input
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Ask the agent..."
            className="w-80 px-3 py-2 rounded bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Submit
          </button>
        </form>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Dashboard />
      </div>
    </div>
  );
}
