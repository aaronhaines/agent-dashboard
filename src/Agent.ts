import { OpenAI } from "openai";
import { useDashboardStore } from "./dashboardStore";

type ToolFunction = (args: unknown) => Promise<unknown>;

interface AgentOptions {
  model?: string;
  systemPrompt: string;
  tools: OpenAI.ChatCompletionTool[];
  toolFunctions: Record<string, ToolFunction>;
  apiKey: string;
  toolTimeoutMs?: number;
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
    });
    this.model = options.model || "gpt-4o";
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

  public async run(userPrompt: string): Promise<string> {
    let scratchpad = `User: ${userPrompt}\n`;

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "",
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    // Step 1: Ask the agent to generate a plan (chain of thought)
    messages[0].content = `${
      this.systemPrompt
    }\n\nConversation history scratchpad::\n${JSON.stringify(
      scratchpad,
      null,
      2
    )}`;

    // Get the plan from the agent
    const planResponse = await this.openai.chat.completions.create({
      model: this.model,
      messages,
      tools: this.tools,
      tool_choice: "none", // Only want a plan, not tool calls yet
      temperature: 0,
    });

    const planMessage = planResponse.choices[0].message.content || "";
    scratchpad += `\nAgent plan:\n${planMessage}\n`;
    messages.push({ role: "assistant", content: planMessage });

    // Step 2: Execute the plan (allow tool calls)
    while (true) {
      // Always get the latest dashboard state
      const latestSnapshot = useDashboardStore
        .getState()
        .modules.map(({ id, moduleType, config }) => ({
          id,
          moduleType,
          config,
        }));
      scratchpad += `\nDashboard state::\n${JSON.stringify(
        latestSnapshot,
        null,
        2
      )}\n`;

      messages[0].content = `${
        this.systemPrompt
      }\n\nConversation history scratchpad::\n${JSON.stringify(
        scratchpad,
        null,
        2
      )}`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        tools: this.tools,
        tool_choice: "auto",
        temperature: 0,
      });

      const choice = response.choices[0];

      if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
        // Add assistant message to history
        messages.push(choice.message);

        const toolCallPromises = choice.message.tool_calls.map(
          async (toolCall) => {
            const { name, arguments: argsString } = toolCall.function;
            const args = JSON.parse(argsString);

            const toolFn = this.toolFunctions[name];
            if (!toolFn) {
              console.error(`Tool ${name} not implemented locally.`);
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
              console.error(`Error calling tool ${name}:`, error);

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
        scratchpad += `\nAssistant: ${choice.message.content}\n`;
        console.log(scratchpad);
        // Add the final summary to the conversation
        messages.push({
          role: "assistant",
          content: choice.message.content || "",
        });
        return choice.message.content || "";
      }

      break;
    }

    throw new Error("AgentRunner: unexpected exit without final message");
  }
}
