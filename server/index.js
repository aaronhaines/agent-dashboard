import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate OpenAI configuration
if (!process.env.OPENAI_API_KEY) {
  console.error("⚠️ OpenAI API key not found in environment variables");
}

console.log("🚀 Initializing server with configuration:");
console.log(`- Port: ${port}`);
console.log(`- Model: ${process.env.OPENAI_MODEL || "gpt-4-turbo-preview"}`);
console.log(
  `- Azure: ${process.env.USE_AZURE === "true" ? "enabled" : "disabled"}`
);

// Agent endpoint
app.post("/api/agent/run", async (req, res) => {
  try {
    const { userPrompt, history, options, systemPrompt, tools } = req.body;

    console.log("\n📝 New agent request:");
    console.log(`- Prompt: ${userPrompt}`);
    console.log(`- History length: ${history?.length || 0}`);
    console.log(`- Tools available: ${tools?.length || 0}`);

    // Initialize messages array with system prompt
    const messages = [{ role: "system", content: systemPrompt }];

    // Add conversation history
    const historyMessages = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));
    messages.push(...historyMessages);

    // Add current user prompt
    messages.push({ role: "user", content: userPrompt });

    // Initialize scratchpad
    let scratchpad = `User: ${userPrompt}\n`;
    if (options?.initialState) {
      scratchpad += `Initial dashboard state: ${JSON.stringify(
        options.initialState,
        null,
        2
      )}\n`;
    }

    const scratchpadMessage = {
      role: "system",
      name: "scratchpad",
      content: scratchpad,
    };
    messages.push(scratchpadMessage);

    // Execute the plan with tool calls
    let iterationCount = 0;
    const thoughts = [];

    while (true) {
      iterationCount++;
      console.log(`\n🔄 Iteration ${iterationCount}`);

      // Summarize scratchpad if too long
      if (scratchpad.length > 2000) {
        console.log("📝 Summarizing long scratchpad...");
        const summaryResponse = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
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
              content: scratchpad.slice(0, -1000),
            },
          ],
          temperature: 0,
          max_tokens: 256,
        });

        const summary = summaryResponse.choices[0].message.content || "";
        scratchpad = `Summary of earlier history: ${summary}\n\nRecent history:\n${scratchpad.slice(
          -1000
        )}`;
        scratchpadMessage.content = scratchpad;
        console.log("✅ Scratchpad summarized");
      }

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
        messages,
        tools,
        tool_choice: "auto",
        temperature: 0,
      });

      const choice = response.choices[0];
      const reasoning = choice.message.content || "(No explanation provided)";

      // For first iteration, treat as planning phase
      if (iterationCount === 1) {
        console.log("🤔 Planning phase");
        thoughts.push({ type: "planning", content: reasoning });
      } else {
        console.log("💭 Reasoning phase");
        thoughts.push({ type: "reasoning", content: reasoning });
      }

      if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
        // Add assistant message to history
        messages.push(choice.message);
        console.log(
          `🛠️ Requesting ${choice.message.tool_calls.length} tool calls`
        );

        // Return tool calls to frontend for execution
        return res.json({
          type: "tool_calls",
          toolCalls: choice.message.tool_calls,
          thoughts,
          messages,
        });
      }

      if (choice.finish_reason === "stop") {
        const finalResponse = choice.message.content || "";
        console.log("✅ Final response ready");
        thoughts.push({ type: "final", content: finalResponse });

        scratchpad += `\nAssistant: ${finalResponse}\n`;
        scratchpadMessage.content = scratchpad;

        // Format the response with thoughts for display
        return res.json({
          type: "final",
          response: {
            response: finalResponse,
            thoughts,
            isDisplay: true,
          },
        });
      }

      break;
    }

    throw new Error("AgentRunner: unexpected exit without final message");
  } catch (error) {
    console.error("❌ Error in agent run:", error);
    res.status(500).json({ error: error.message });
  }
});

// Tool result endpoint
app.post("/api/agent/tool-result", async (req, res) => {
  try {
    const {
      messages = [],
      toolResults = [],
      scratchpad = "",
      tools = [],
    } = req.body;

    console.log("\n🔧 Processing tool results:");
    console.log(`- Messages: ${messages?.length || 0}`);
    console.log(`- Tool results: ${toolResults?.length || 0}`);
    console.log(`- Tools available: ${tools?.length || 0}`);

    // Ensure messages is an array
    const messageArray = Array.isArray(messages) ? messages : [];

    // Add tool results to messages if they exist
    if (Array.isArray(toolResults) && toolResults.length > 0) {
      messageArray.push(...toolResults);
      console.log("✅ Tool results added to messages");
    }

    // Update scratchpad
    const scratchpadMessage = messageArray.find(
      (m) => m?.role === "system" && m?.name === "scratchpad"
    );
    if (scratchpadMessage) {
      scratchpadMessage.content = scratchpad;
      console.log("✅ Scratchpad updated");
    }

    // Continue the conversation
    console.log("🤖 Continuing conversation with OpenAI");
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
      messages: messageArray,
      tools: tools,
      tool_choice: "auto",
      temperature: 0,
    });

    console.log("✅ Got response from OpenAI");
    res.json({ message: response.choices[0].message });
  } catch (error) {
    console.error("❌ Error processing tool result:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`\n✨ Server running at http://localhost:${port}`);
});
