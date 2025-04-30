import { OpenAI } from "openai";

export type ToolFunction = (args: unknown) => Promise<unknown>;

interface AgentOptions {
  model?: string;
  systemPrompt: string;
  tools: OpenAI.ChatCompletionTool[];
  toolFunctions: Record<string, ToolFunction>;
  apiKey: string;
  toolTimeoutMs?: number;
  azure?: {
    apiVersion: string;
    endpoint: string;
    deploymentName: string;
  };
}

interface RunOptions {
  initialState?: Record<string, unknown>;
}

export class Agent {
  private openai: OpenAI;
  private model: string;
  private systemPrompt: string;
  private tools: OpenAI.ChatCompletionTool[];
  private toolFunctions: Record<string, ToolFunction>;
  private toolTimeoutMs: number;

  constructor(options: AgentOptions) {
    this.openai = new OpenAI({
      apiKey: options.apiKey,
      dangerouslyAllowBrowser: true,
      ...(options.azure && {
        baseURL: options.azure.endpoint,
        defaultQuery: { "api-version": options.azure.apiVersion },
        defaultHeaders: { "api-key": options.apiKey },
      }),
    });
    this.model = options.azure?.deploymentName || options.model || "gpt-4o";
    this.systemPrompt = options.systemPrompt;
    this.tools = options.tools;
    this.toolFunctions = options.toolFunctions;
    this.toolTimeoutMs = options.toolTimeoutMs || 5000;
  }

  private async callWithTimeout<T>(
    promise: Promise<T>,
    ms: number
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Tool call timed out")), ms)
    );

    return Promise.race([promise, timeout]);
  }

  // Helper to summarize long scratchpad history
  private async summarizeScratchpad(scratchpad: string): Promise<string> {
    // Only summarize if over 2000 chars
    if (scratchpad.length <= 2000) return scratchpad;
    // Keep the last 1000 chars verbatim
    const recent = scratchpad.slice(-1000);
    const toSummarize = scratchpad.slice(0, -1000);

    const messages: OpenAI.ChatCompletionMessageParam[] = [
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
    ];

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0,
      max_tokens: 256,
    });
    const summary = response.choices[0].message.content || "";
    return `Summary of earlier history: ${summary}\n\nRecent history:\n${recent}`;
  }

  public async run(
    userPrompt: string,
    history: { role: "user" | "agent"; content: string }[],
    options: RunOptions = {}
  ): Promise<string> {
    // Track thought process for the response
    const thoughts: Array<{
      type: "planning" | "reasoning" | "final";
      content: string;
    }> = [];

    console.log("\n🤖 Agent Run Started");
    console.log("📝 User Prompt:", userPrompt);

    // Initialize messages array with system prompt
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: this.systemPrompt },
    ];

    // Add conversation history
    const historyMessages = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })) as OpenAI.ChatCompletionMessageParam[];
    messages.push(...historyMessages);
    console.log(`📚 Added ${historyMessages.length} history messages`);

    // Add current user prompt
    messages.push({ role: "user", content: userPrompt });

    // Initialize scratchpad with initial state if provided
    let scratchpad = `User: ${userPrompt}\n`;
    if (options.initialState) {
      scratchpad += `\nInitial Dashboard State:\n${JSON.stringify(
        options.initialState,
        null,
        2
      )}\n`;
      console.log("📊 Added initial state data to context");
    }

    const scratchpadMessage: OpenAI.ChatCompletionMessageParam = {
      role: "system",
      name: "scratchpad",
      content: scratchpad,
    };
    messages.push(scratchpadMessage);

    // Execute the plan with tool calls enabled from the start
    console.log("\n🔄 Execution Phase Started");
    let iterationCount = 0;
    while (true) {
      iterationCount++;
      console.log(`\n📍 Iteration ${iterationCount}`);

      // Summarize scratchpad if too long
      const originalLength = scratchpad.length;
      scratchpad = await this.summarizeScratchpad(scratchpad);
      if (scratchpad.length < originalLength) {
        console.log(
          `📝 Summarized scratchpad from ${originalLength} to ${scratchpad.length} characters`
        );
      }
      scratchpadMessage.content = scratchpad;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        tools: this.tools,
        tool_choice: "auto",
        temperature: 0,
      });

      const choice = response.choices[0];
      const reasoning = choice.message.content || "(No explanation provided)";

      // For first iteration, treat as planning phase
      if (iterationCount === 1) {
        console.log("\n💭 Assistant's Planning Thoughts:");
        console.log("--------------------------------");
        console.log(reasoning);
        console.log("--------------------------------");
        thoughts.push({ type: "planning", content: reasoning });
      } else {
        console.log("\n💭 Assistant's Reasoning:");
        console.log("--------------------------------");
        console.log(reasoning);
        console.log("--------------------------------");
        thoughts.push({ type: "reasoning", content: reasoning });
      }

      if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
        // Add assistant message to history
        messages.push(choice.message);
        console.log(
          `🛠️ Agent requested ${choice.message.tool_calls.length} tool calls`
        );

        const toolCallPromises = choice.message.tool_calls.map(
          async (toolCall) => {
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
              console.log("📤 Tool result:", toolResult);

              scratchpad += `\nTool ${name} called with args ${JSON.stringify(
                args
              )}.\nResult: ${JSON.stringify(toolResult)}\n`;
              scratchpadMessage.content = scratchpad;

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

        const toolMessages = (await Promise.all(toolCallPromises)).filter(
          (msg): msg is OpenAI.ChatCompletionMessageParam => msg !== null
        );
        messages.push(...toolMessages);
        continue;
      }

      if (choice.finish_reason === "stop") {
        const finalResponse = choice.message.content || "";
        console.log("\n💭 Assistant's Final Thoughts:");
        console.log("--------------------------------");
        console.log(finalResponse);
        console.log("--------------------------------");
        console.log("\n✅ Agent completed task");

        thoughts.push({ type: "final", content: finalResponse });

        scratchpad += `\nAssistant: ${finalResponse}\n`;
        scratchpadMessage.content = scratchpad;

        // Format the response with thoughts for display
        const formattedResponse = JSON.stringify({
          response: finalResponse,
          thoughts: thoughts,
          isDisplay: true, // Flag to indicate this is for display only
        });

        // Add only the final response to the conversation history
        messages.push({
          role: "assistant",
          content: finalResponse,
        });

        return formattedResponse;
      }

      break;
    }

    console.error("❌ Agent exited unexpectedly");
    throw new Error("AgentRunner: unexpected exit without final message");
  }
}
