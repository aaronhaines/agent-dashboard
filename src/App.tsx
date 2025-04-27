import { useState, useRef, useEffect } from "react";
import { Dashboard } from "./Dashboard";
import { Agent } from "./Agent";
import { Tools } from "./tools";
import type { ToolFunction } from "./Agent";
import { systemPrompt } from "./systemPrompt";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.error("OpenAI API key not found in environment variables");
}

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
});

export default function App() {
  const [userPrompt, setUserPrompt] = useState("");
  const [chat, setChat] = useState<
    { role: "user" | "agent"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userPrompt.trim()) return;
    setChat((prev) => [...prev, { role: "user", content: userPrompt }]);
    setLoading(true);

    try {
      // Pass chat history (excluding the current user prompt) to the agent
      const history = chat.slice(-20);
      const agentResponse = await dashboardAgent.run(userPrompt, history);
      setChat((prev) => [...prev, { role: "agent", content: agentResponse }]);
    } catch {
      setChat((prev) => [
        ...prev,
        {
          role: "agent",
          content: "[Error: Failed to get response from agent]",
        },
      ]);
    } finally {
      setLoading(false);
      setUserPrompt("");
    }
  }

  return (
    <div className="min-h-screen h-screen bg-gray-900 text-gray-100 p-4 font-sans">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-white">
          Wealth Management Dashboard
        </h1>
      </header>
      <div className="flex flex-row gap-6 h-[calc(100vh-5.5rem)]">
        {" "}
        {/* 5.5rem = header + padding */}
        {/* Dashboard on the left */}
        <div className="flex-1 min-w-0 h-full overflow-auto">
          <Dashboard />
        </div>
        {/* Chat panel on the right */}
        <div className="w-full max-w-[400px] xl:max-w-[450px] flex flex-col bg-gray-800 rounded-lg shadow-lg p-4 h-full">
          <h2 className="text-lg font-semibold mb-2 text-blue-300">
            Agent Chat
          </h2>
          <div className="flex-1 overflow-y-auto mb-2 space-y-3 pr-1">
            {chat.length === 0 && (
              <div className="text-gray-400 text-sm">
                No conversation yet. Ask the agent something!
              </div>
            )}
            {chat.map((msg, idx) => (
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
                  Agent is typing...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
            <input
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Ask the agent..."
              className="flex-1 px-3 py-2 rounded bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              disabled={loading}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
