import { OpenAI } from "openai";

type ToolFunction = (args: any) => Promise<any>;

interface AgentRunnerOptions {
  model?: string;
  systemPrompt: string;
  tools: OpenAI.ChatCompletionTool[];
  toolFunctions: Record<string, ToolFunction>;
  apiKey: string;
  toolTimeoutMs?: number;
}

export class AgentRunner {
  private openai: OpenAI;
  private model: string;
  private systemPrompt: string;
  private tools: OpenAI.ChatCompletionTool[];
  private toolFunctions: Record<string, ToolFunction>;
  private toolTimeoutMs: number;

  constructor(options: AgentRunnerOptions) {
    this.openai = new OpenAI({ apiKey: options.apiKey });
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

  public async run(userPrompt: string, contextSnapshot: any): Promise<string> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `${this.systemPrompt}\n\nContext:\n${JSON.stringify(
          contextSnapshot,
          null,
          2
        )}`,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    while (true) {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        tools: this.tools,
        tool_choice: "auto",
        temperature: 0,
      });

      const choice = response.choices[0];

      if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
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

              return {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(toolResult),
              };
            } catch (error) {
              console.error(`Error calling tool ${name}:`, error);

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

        const toolMessages = (await Promise.all(toolCallPromises)).filter(
          Boolean
        );
        messages.push(...toolMessages);
        continue;
      }

      if (choice.finish_reason === "stop") {
        return choice.message.content || "";
      }

      break;
    }

    throw new Error("AgentRunner: unexpected exit without final message");
  }
}
