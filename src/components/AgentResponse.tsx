import React, { useState } from "react";

interface Thought {
  type: "planning" | "reasoning" | "final";
  content: string;
}

interface AgentResponseProps {
  content: string;
}

export const AgentResponse: React.FC<AgentResponseProps> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  let response: string;
  let thoughts: Thought[] = [];
  let hasThoughts = false;
  let isSuggestion = false;

  try {
    const parsed = JSON.parse(content);
    // Only process as a display message if it has the isDisplay flag
    if (parsed.isDisplay) {
      response = parsed.response;
      thoughts = parsed.thoughts;
      hasThoughts = thoughts.length > 0;
      isSuggestion = parsed.isSuggestion || false;
    } else {
      response = content;
    }
  } catch {
    response = content;
  }

  const getThoughtIcon = (type: Thought["type"]) => {
    switch (type) {
      case "planning":
        return "🤔";
      case "reasoning":
        return "💭";
      case "final":
        return "✅";
      default:
        return "📝";
    }
  };

  const getThoughtTitle = (type: Thought["type"]) => {
    switch (type) {
      case "planning":
        return "Planning";
      case "reasoning":
        return "Reasoning";
      case "final":
        return "Final Thoughts";
      default:
        return "Note";
    }
  };

  // Special styling for suggestions
  if (isSuggestion) {
    return (
      <div className="flex flex-col gap-2 p-4 rounded-lg bg-gray-800 border border-indigo-500/30">
        <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-1">
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
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span>Suggested Action</span>
        </div>
        <div className="prose prose-invert max-w-none text-gray-100">
          {response}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg bg-gray-700">
      <div className="prose prose-invert max-w-none text-gray-100">
        {response}
      </div>

      {hasThoughts && (
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
          >
            {isExpanded ? "▼" : "▶"} Show Thought Process
          </button>

          {isExpanded && (
            <div className="mt-4 space-y-4">
              {thoughts.map((thought, index) => (
                <div key={index} className="p-4 rounded-lg bg-gray-600">
                  <div className="flex items-center gap-2 mb-2 font-medium text-gray-200">
                    <span>{getThoughtIcon(thought.type)}</span>
                    <span>{getThoughtTitle(thought.type)}</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap text-gray-300">
                    {thought.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
