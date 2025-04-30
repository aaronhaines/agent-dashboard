import type { OpenAI } from "openai";

export type ToolFunction = (args: unknown) => Promise<unknown>;

interface AgentOptions {
  model?: string;
  systemPrompt: string;
  tools: OpenAI.ChatCompletionTool[];
  toolFunctions: Record<string, ToolFunction>;
  toolTimeoutMs?: number;
}

interface RunOptions {
  initialState?: Record<string, unknown>;
}

export class Agent {
  private systemPrompt: string;
  private tools: OpenAI.ChatCompletionTool[];
  private toolFunctions: Record<string, ToolFunction>;
  private toolTimeoutMs: number;
  private apiUrl: string;

  constructor(options: AgentOptions) {
    this.systemPrompt = options.systemPrompt;
    this.tools = options.tools;
    this.toolFunctions = options.toolFunctions;
    this.toolTimeoutMs = options.toolTimeoutMs || 5000;
    this.apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  }

  private async callWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Tool execution timed out"));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId!);
      return result;
    } catch (error) {
      clearTimeout(timeoutId!);
      throw error;
    }
  }

  private async summarizeScratchpad(scratchpad: string): Promise<string> {
    // Only summarize if over 2000 chars
    if (scratchpad.length <= 2000) return scratchpad;
    // Keep the last 1000 chars verbatim
    const recent = scratchpad.slice(-1000);
    const toSummarize = scratchpad.slice(0, -1000);

    const response = await fetch(`${this.apiUrl}/agent/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes agent reasoning and tool call history.",
          },
          {
            role: "user",
            content:
              "Summarize the following agent history, focusing on key actions, tool calls, and results. Be concise but preserve important details.",
          },
          {
            role: "assistant",
            content:
              "I'll summarize the history, focusing on key actions and outcomes.",
          },
          {
            role: "user",
            content: toSummarize,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to summarize scratchpad");
    }

    const data = await response.json();
    const summary = data.response?.response || "";
    return `Summary of earlier history: ${summary}\n\nRecent history:\n${recent}`;
  }

  public async run(
    userPrompt: string,
    history: { role: "user" | "agent"; content: string }[],
    options: RunOptions = {}
  ): Promise<string> {
    console.log("\n🤖 Agent Run Started");
    console.log("📝 User Prompt:", userPrompt);

    let scratchpad = `User: ${userPrompt}\n`;
    if (options.initialState) {
      scratchpad += `Initial dashboard state: ${JSON.stringify(
        options.initialState,
        null,
        2
      )}\n`;
    }

    try {
      const response = await fetch(`${this.apiUrl}/agent/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt,
          history,
          options,
          systemPrompt: this.systemPrompt,
          tools: this.tools,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get agent response");
      }

      const data = await response.json();

      if (data.type === "tool_calls") {
        const toolCallPromises = data.toolCalls.map(
          async (toolCall: OpenAI.ChatCompletionMessageToolCall) => {
            const { name, arguments: argsString } = toolCall.function;
            const args = JSON.parse(argsString);
            console.log(`\n🔧 Executing tool: ${name}`);
            console.log("📥 Arguments:", args);

            const toolFn = this.toolFunctions[name];
            if (!toolFn) {
              console.error(`❌ Tool ${name} not implemented locally.`);
              return null;
            }

            try {
              const toolResult = await this.callWithTimeout(
                toolFn(args),
                this.toolTimeoutMs
              );

              scratchpad += `\nTool ${name} called with args ${JSON.stringify(
                args
              )}.\nResult: ${JSON.stringify(toolResult)}\n`;

              return {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(toolResult),
              } as OpenAI.ChatCompletionMessageParam;
            } catch (error) {
              console.error(`❌ Error executing tool ${name}:`, error);
              return {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  error: (error as Error).message || "Unknown error",
                }),
              } as OpenAI.ChatCompletionMessageParam;
            }
          }
        );

        const toolResults = (await Promise.all(toolCallPromises)).filter(
          (msg): msg is OpenAI.ChatCompletionMessageParam => msg !== null
        );

        // Send tool results back to continue the conversation
        const continueResponse = await fetch(
          `${this.apiUrl}/agent/tool-result`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: data.messages,
              toolResults,
              scratchpad,
              tools: this.tools,
            }),
          }
        );

        if (!continueResponse.ok) {
          throw new Error("Failed to process tool results");
        }

        const continueData = await continueResponse.json();
        const message = continueData.message;

        // Check if the message contains tool calls
        if (message.tool_calls) {
          // Continue with tool execution
          return this.handleToolCalls(message, scratchpad, history, options);
        } else {
          // Final response
          return JSON.stringify({
            response: message.content,
            thoughts: data.thoughts,
            isDisplay: true,
          });
        }
      }

      if (data.type === "final") {
        return JSON.stringify(data.response);
      }

      throw new Error("Unexpected response type from agent");
    } catch (error) {
      console.error("Error in agent run:", error);
      throw error;
    }
  }

  private async handleToolCalls(
    message: OpenAI.ChatCompletionMessage,
    scratchpad: string,
    history: { role: "user" | "agent"; content: string }[],
    options: RunOptions
  ): Promise<string> {
    const toolCallPromises = message.tool_calls!.map(
      async (toolCall: OpenAI.ChatCompletionMessageToolCall) => {
        const { name, arguments: argsString } = toolCall.function;
        const args = JSON.parse(argsString);
        console.log(`\n🔧 Executing tool: ${name}`);
        console.log("📥 Arguments:", args);

        const toolFn = this.toolFunctions[name];
        if (!toolFn) {
          console.error(`❌ Tool ${name} not implemented locally.`);
          return null;
        }

        try {
          const toolResult = await this.callWithTimeout(
            toolFn(args),
            this.toolTimeoutMs
          );

          scratchpad += `\nTool ${name} called with args ${JSON.stringify(
            args
          )}.\nResult: ${JSON.stringify(toolResult)}\n`;

          return {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          } as OpenAI.ChatCompletionMessageParam;
        } catch (error) {
          console.error(`❌ Error executing tool ${name}:`, error);
          return {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              error: (error as Error).message || "Unknown error",
            }),
          } as OpenAI.ChatCompletionMessageParam;
        }
      }
    );

    const toolResults = (await Promise.all(toolCallPromises)).filter(
      (msg): msg is OpenAI.ChatCompletionMessageParam => msg !== null
    );

    // Send tool results back to continue the conversation
    const continueResponse = await fetch(`${this.apiUrl}/agent/tool-result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [message],
        toolResults,
        scratchpad,
        tools: this.tools,
      }),
    });

    if (!continueResponse.ok) {
      throw new Error("Failed to process tool results");
    }

    const continueData = await continueResponse.json();
    const nextMessage = continueData.message;

    // Check if we need to continue with more tool calls
    if (nextMessage.tool_calls) {
      return this.handleToolCalls(nextMessage, scratchpad, history, options);
    }

    // Final response
    return JSON.stringify({
      response: nextMessage.content,
      thoughts: [],
      isDisplay: true,
    });
  }
}
