import { OpenAI } from "openai";
import { agentFunctions } from "./agentFunctions";
import { availableTools } from "./agentFunctions";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.error("OpenAI API key not found in environment variables");
}

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

async function callWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Tool call timed out")), ms)
  );

  return Promise.race([promise, timeout]);
}

export async function realAgentCall(
  userPrompt: string,
  dashboardSnapshot: any
) {
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an intelligent financial dashboard assistant. 
  The dashboard consists of modules (charts, tables, summaries). 
  You can add, remove, or update modules based on the user's input.

  Available module types are: portfolioChart, expensesTable, netWorthSummary

  If a tool response contains {error: "timeout"}, you may attempt to retry once.
  
  Current dashboard state:
  ${JSON.stringify(dashboardSnapshot, null, 2)}`,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ];

  while (true) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: availableTools,
      tool_choice: "auto",
      temperature: 0,
    });

    const choice = response.choices[0];

    // If model wants to call tools
    if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
      // Map all tool calls to promises
      const TOOL_TIMEOUT_MS = 5000; // 5 seconds timeout per tool

      const toolCallPromises = choice.message.tool_calls.map(
        async (toolCall) => {
          const { name, arguments: argsString } = toolCall.function;
          const args = JSON.parse(argsString);

          const toolFn = (agentFunctions as any)[name];
          if (!toolFn) {
            console.error(`Tool ${name} not implemented locally.`);
            return null;
          }

          try {
            const toolResult = await callWithTimeout(
              toolFn(args),
              TOOL_TIMEOUT_MS
            );

            return {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolResult),
            };
          } catch (error) {
            console.error(`Error calling tool ${name}:`, error);

            // Still respond with an error message to the model
            return {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                error: (error as Error).message || "Unknown error",
              }),
            };
          }
        }
      );

      // Wait for all tools
      const toolMessages = (await Promise.all(toolCallPromises)).filter(
        Boolean
      );
      messages.push(...toolMessages);

      // After executing all tools, loop and let model think again
      continue;
    }

    // Otherwise model is done, return final message
    if (choice.finish_reason === "stop") {
      return choice.message.content;
    }

    break;
  }
}
