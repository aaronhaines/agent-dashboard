import { useState, useRef, useEffect } from "react";
import { Dashboard } from "./Dashboard";
import { Agent } from "./Agent";
import { Tools } from "./tools";
import type { ToolFunction } from "./Agent";
import type { ModuleConfig } from "./tools";
import { systemPrompt } from "./systemPrompt";
import { useChatStore } from "./chatStore";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.error("OpenAI API key not found in environment variables");
}

const useAzure = import.meta.env.VITE_USE_AZURE === "true";
const azureOptions = useAzure
  ? {
      azure: {
        apiVersion: import.meta.env.VITE_AZURE_API_VERSION,
        endpoint: import.meta.env.VITE_AZURE_BASE_URL,
        deploymentName: import.meta.env.VITE_AZURE_OPENAI_MODEL,
      },
    }
  : undefined;

// Default configurations for each module type
const defaultConfigs: Record<string, ModuleConfig> = {
  portfolioChart: { timeRange: "1M" },
  expensesTable: { limit: 10 },
  netWorthSummary: { showChart: true },
  stockPriceChart: { tickers: ["AAPL", "GOOGL", "MSFT"], timeRange: "1M" },
  marketMovers: { limit: 5 },
  companyNews: { company: "AAPL", limit: 5 },
  financialSnapshot: { showChart: true },
  marketAnalysis: { showChart: true },
};

const toolList = Object.values(Tools).map((tool) => ({
  type: "function" as const,
  function: tool.schema,
}));

const toolFunctions = Object.fromEntries(
  Object.entries(Tools).map(([name, tool]) => [name, tool.handler])
) as Record<string, ToolFunction>;

const dashboardAgent = new Agent({
  apiKey: apiKey,
  systemPrompt,
  tools: toolList,
  toolFunctions: toolFunctions,
  toolTimeoutMs: 5000,
  ...azureOptions,
});

export default function App() {
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    // Add user message to chat
    addMessage({ role: "user", content: userPrompt });
    setLoading(true);

    try {
      // Pass chat history to the agent
      const history = messages.slice(-20);
      const agentResponse = await dashboardAgent.run(userPrompt, history);
      addMessage({ role: "agent", content: agentResponse });
    } catch {
      addMessage({
        role: "agent",
        content: "[Error: Failed to get response from agent]",
      });
    } finally {
      setLoading(false);
      setUserPrompt("");
    }
  }

  return (
    <div className="min-h-screen h-screen bg-gray-900 flex flex-col text-gray-100 font-sans">
      {/* Title Bar */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 flex-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle sidebar menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-white">Workspace 360</h1>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-400">Add Module:</span>
            <button
              onClick={() =>
                Tools.addModule.handler({
                  moduleType: "portfolioChart",
                  config: defaultConfigs.portfolioChart,
                })
              }
              className="px-2 py-1 text-sm text-blue-300 hover:text-blue-200 hover:bg-gray-600 rounded transition-colors"
              title="Add Portfolio Chart"
            >
              Portfolio
            </button>
            <button
              onClick={() =>
                Tools.addModule.handler({
                  moduleType: "expensesTable",
                  config: defaultConfigs.expensesTable,
                })
              }
              className="px-2 py-1 text-sm text-green-300 hover:text-green-200 hover:bg-gray-600 rounded transition-colors"
              title="Add Expenses Table"
            >
              Expenses
            </button>
            <button
              onClick={() =>
                Tools.addModule.handler({
                  moduleType: "netWorthSummary",
                  config: defaultConfigs.netWorthSummary,
                })
              }
              className="px-2 py-1 text-sm text-purple-300 hover:text-purple-200 hover:bg-gray-600 rounded transition-colors"
              title="Add Net Worth Summary"
            >
              Net Worth
            </button>
            <button
              onClick={() =>
                Tools.addModule.handler({
                  moduleType: "stockPriceChart",
                  config: defaultConfigs.stockPriceChart,
                })
              }
              className="px-2 py-1 text-sm text-yellow-300 hover:text-yellow-200 hover:bg-gray-600 rounded transition-colors"
              title="Add Stock Price Chart"
            >
              Stocks
            </button>
            <button
              onClick={() =>
                Tools.addModule.handler({
                  moduleType: "marketMovers",
                  config: defaultConfigs.marketMovers,
                })
              }
              className="px-2 py-1 text-sm text-red-300 hover:text-red-200 hover:bg-gray-600 rounded transition-colors"
              title="Add Market Movers"
            >
              Movers
            </button>
            <button
              onClick={() =>
                Tools.addModule.handler({
                  moduleType: "companyNews",
                  config: defaultConfigs.companyNews,
                })
              }
              className="px-2 py-1 text-sm text-orange-300 hover:text-orange-200 hover:bg-gray-600 rounded transition-colors"
              title="Add Company News"
            >
              News
            </button>
            <button
              onClick={() =>
                Tools.addModule.handler({
                  moduleType: "financialSnapshot",
                  config: defaultConfigs.financialSnapshot,
                })
              }
              className="px-2 py-1 text-sm text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded transition-colors"
              title="Add Financial Snapshot"
            >
              Financials
            </button>
            <button
              onClick={() =>
                Tools.addModule.handler({
                  moduleType: "marketAnalysis",
                  config: defaultConfigs.marketAnalysis,
                })
              }
              className="px-2 py-1 text-sm text-purple-400 hover:text-purple-300 hover:bg-gray-600 rounded transition-colors"
              title="Add Market Analysis"
            >
              Market
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={() =>
              Tools.exportToPdf.handler({
                filename: `dashboard-${
                  new Date().toISOString().split("T")[0]
                }.pdf`,
              })
            }
            className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 transition-colors"
            title="Export dashboard to PDF"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export PDF
          </button>

          <button
            className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
            aria-label="User profile"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`w-64 bg-gray-800 border-r border-gray-700 flex-none transition-all duration-300 ${
            sidebarOpen ? "" : "-ml-64"
          }`}
        >
          <div className="p-4">
            <nav className="space-y-2">
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Analytics
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Investments
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Calendar
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-row p-6 overflow-hidden relative">
          {/* Dashboard */}
          <div
            className={`flex-1 min-w-0 h-full overflow-auto transition-all duration-300 ${
              chatOpen ? "pr-[calc(400px+1.5rem)]" : "pr-0"
            } xl:${chatOpen ? "pr-[calc(450px+1.5rem)]" : "pr-0"}`}
          >
            <Dashboard />
          </div>

          {/* Chat Toggle Button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="fixed right-0 top-1/2 -translate-y-1/2 bg-gray-800 p-2 rounded-l-lg shadow-lg text-gray-400 hover:text-white transition-colors z-10"
            aria-label={chatOpen ? "Hide chat" : "Show chat"}
          >
            <svg
              className={`w-5 h-5 transition-transform ${
                chatOpen ? "rotate-0" : "rotate-180"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Chat panel */}
          <div
            className={`fixed right-0 top-[5.5rem] bottom-6 w-[400px] xl:w-[450px] flex flex-col bg-gray-800 rounded-lg shadow-lg p-4 transition-transform duration-300 ${
              chatOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-blue-300">
                Agent Chat
              </h2>
              <button
                onClick={() => useChatStore.getState().clearHistory()}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Clear History
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mb-2 space-y-3 pr-1">
              {messages.length === 0 && (
                <div className="text-gray-400 text-sm">
                  No conversation yet. Ask the agent something!
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={msg.role === "user" ? "text-right" : "text-left"}
                >
                  <div
                    className={
                      "inline-block px-3 py-2 rounded-lg " +
                      (msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-100")
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-left">
                  <div className="inline-block px-3 py-2 rounded-lg bg-gray-700 text-gray-400 animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex-none">
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Ask the agent to help you..."
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
