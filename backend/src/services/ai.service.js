
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { TavilySearch } = require("@langchain/tavily");
const { HumanMessage, AIMessage, SystemMessage } = require("@langchain/core/messages");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { GoogleGenAI } = require("@google/genai");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const ai = new GoogleGenAI({});

// 1. Initialize the Model
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.5,
  maxOutputTokens: 8192,
});

// 2. Initialize Static Tools (Tavily Search)
const tavilyTool = new TavilySearch({
  maxResults: 3, 
});

// 3. Define the Dynamic Local Execution Tool
// This is wrapped in a function so we can pass the specific user's socket into it when they chat
function createLocalExecutionTool(gatewaySocket) {
  return tool(
    async ({ command }) => {
      console.log(`🛠️ AI decided to run local command: ${command}`);

      return new Promise((resolve) => {
        if (!gatewaySocket) {
          return resolve("System Error: The user's local gateway app is not connected or offline.");
        }

        // Send the command down the WebSocket to the Rust app
        gatewaySocket.emit("execute_command", { command });

        // 15-second timeout so the AI doesn't hang if the user's computer is slow/asleep
        const timeout = setTimeout(() => {
          resolve("Execution timed out after 15 seconds.");
        }, 15000);

        // Wait for the terminal output to come back from Rust
        gatewaySocket.once("command_result", (data) => {
          clearTimeout(timeout);
          console.log("🛠️ Tool received terminal output from user's machine.");
          resolve(data.output || "Command executed successfully with no output.");
        });
      });
    },
    {
      name: "execute_local_system_command",
      description: "Executes a native shell/bash command directly on the user's local machine. Use this ONLY when the user asks you to interact with their computer (e.g., create files, check folders, run scripts).",
      schema: z.object({
        command: z.string().describe("The exact shell command to run (e.g., 'mkdir new_folder', 'ls -la', 'pwd')"),
      }),
    }
  );
}

// 4. Define the System Instruction
const nexieSystemInstruction = `You are Nexie, a friendly and playful AI assistant 🤖✨ built with love by Zaman 💻❤️.
Your personality is approachable, supportive, and full of energy 🌟.
Always greet and respond warmly. Use light, fun language — emojis are encouraged 😄.
Be curious, kind, and encouraging.

RULES FOR TOOLS:
1. You have access to the internet via 'tavily_search_results_json' for current info.
2. You have access to the user's local computer via 'execute_local_system_command'. Use this ONLY if the user explicitly asks you to do something on their machine (like making a folder or reading a file).
3. ⚠️ IMPORTANT: When analyzing search results for weather or news, ALWAYS compare the article dates to the "Current System Time" provided below to ensure the data is fresh.
`;

/**
 * Generates a response using LangGraph.
 * Now accepts gatewaySocket as the 3rd parameter.
 */
async function generateResponse(langchainMessages, username, gatewaySocket) {
  console.log(`Generating response for ${username}...`);
  const now = new Date();
  const timeString = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  let finalSystemInstruction = nexieSystemInstruction;
  finalSystemInstruction += `\n\n🕒 CURRENT SYSTEM TIME: ${timeString}`;
  finalSystemInstruction += `\n(Use this date to verify if search results are up-to-date)`;
  
  if (username) {
    finalSystemInstruction += `\n\nCONTEXT: You are chatting with ${username}. Use their name warmly!`;
  }

  // Check if the user is connected via the Rust app
  if (gatewaySocket) {
    finalSystemInstruction += `\n\nSTATUS: The user's local computer IS connected. You may use the local execution tool.`;
  } else {
    finalSystemInstruction += `\n\nSTATUS: The user's local computer is NOT connected. Do not attempt to use the local execution tool.`;
  }

  const messagesWithSystem = [
    new SystemMessage(finalSystemInstruction),
    ...langchainMessages,
  ];

  // 5. Assemble the tools array dynamically for this specific request
  const currentTools = [tavilyTool];
  if (gatewaySocket) {
    console.log("🔌 Local Gateway detected. Adding local execution tool to Nexie's toolbelt.");
    currentTools.push(createLocalExecutionTool(gatewaySocket));
  } else {
    console.log("⚠️ No Local Gateway detected for this request.");
  }

  // 6. Create the LangGraph Agent for this specific request
  const agent = createReactAgent({
    llm,
    tools: currentTools,
  });

  try {
    const response = await agent.invoke({
      messages: messagesWithSystem,
    });

    // 👇 DEBUGGING BLOCK 👇
    console.log("🔍 AGENT THINKING PROCESS:");
    response.messages.forEach((msg) => {
      if (msg._getType() === "ai" && msg.tool_calls?.length > 0) {
        console.log(`🤖 AI Decided to call tool: ${msg.tool_calls[0].name}`);
        console.log(`   Query: ${JSON.stringify(msg.tool_calls[0].args)}`);
      }
      if (msg._getType() === "tool") {
        console.log(`📦 RAW TOOL RESULTS (${msg.name}):`);
        try {
          console.log(JSON.stringify(JSON.parse(msg.content), null, 2)); 
        } catch (e) {
          console.log(msg.content);
        }
      }
    });
    console.log("-----------------------------");
    // 👆 END DEBUGGING BLOCK 👆

    const lastMessage = response.messages[response.messages.length - 1];
    return lastMessage.content;
    
  } catch (error) {
    console.error("LangGraph Agent Error:", error);
    return "Oops! I tripped over a wire. 🔌 Can you ask me that again?";
  }
}

/**
 * Embeddings Generation
 */
async function generateVector(content) {
    const response = await ai.models.embedContent({
        model:"gemini-embedding-001",
        contents: content,
        config:{
            outputDimensionality:768
        }
    })
    return response.embeddings[0].values
}

module.exports = { generateResponse, generateVector };