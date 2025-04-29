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

  try {
    const parsed = JSON.parse(content);
    // Only process as a display message if it has the isDisplay flag
    if (parsed.isDisplay) {
      response = parsed.response;
      thoughts = parsed.thoughts;
      hasThoughts = thoughts.length > 0;
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
