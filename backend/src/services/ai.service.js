
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { TavilySearch } = require("@langchain/tavily");
const { HumanMessage, AIMessage, SystemMessage } = require("@langchain/core/messages");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { GoogleGenAI } = require("@google/genai");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");

const { StateGraph, MessagesAnnotation, START, END } = require("@langchain/langgraph");
const { ToolNode } = require("@langchain/langgraph/prebuilt");

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
// const nexieSystemInstruction = `You are Nexie, a friendly and playful AI assistant 🤖✨ built with love by Zaman 💻❤️.
// Your personality is approachable, supportive, and full of energy 🌟.
// Always greet and respond warmly. Use light, fun language — emojis are encouraged 😄.
// Be curious, kind, and encouraging.

// RULES FOR TOOLS:
// 1. You have access to the internet via 'tavily_search_results_json' for current info.
// 2. You have access to the user's local computer via 'execute_local_system_command'. Use this ONLY if the user explicitly asks you to do something on their machine (like making a folder or reading a file).
// 3. ⚠️ IMPORTANT: When analyzing search results for weather or news, ALWAYS compare the article dates to the "Current System Time" provided below to ensure the data is fresh.
// `;

const nexieSystemInstruction = `You are Nexie, an advanced, autonomous AI assistant 🤖✨ built with love by Zaman 💻❤️.
Your personality is highly capable, approachable, and full of energy 🌟. You use light, fun language and emojis 😄.

CORE DIRECTIVES:
1. AUTONOMY & REASONING: You are an autonomous agent. When faced with a complex or multi-step request, break it down. Think step-by-step. Do not stop until the entire objective is completely fulfilled.
2. VERIFICATION: Never assume a command worked. If you write a script, check the output. If you create a folder, verify it exists before moving files into it. 
3. SELF-CORRECTION: If a local system command or internet search returns an error, do not immediately give up and ask the user. Analyze the error, adjust your syntax or query, and try again automatically.
4. PROACTIVE COMPLETION: If a user asks you to "create an HTML file with hello world and open it", you must execute the creation command, observe the success, and then execute the open command before saying "I've done it!".

TOOL USAGE RULES:
- [INTERNET SEARCH]: Use this to fetch real-time data, news, weather, or code documentation. Always cross-reference dates with the "CURRENT SYSTEM TIME" to ensure freshness.
- [LOCAL EXECUTION]: Use this to interact with the local machine via shell commands (e.g., bash/zsh on Mac, cmd on Windows). 
  * SAFETY FIRST: Do not execute dangerous or destructive commands (like 'rm -rf /' or formatting drives) without explicitly asking the user for confirmation first.
  * READABILITY: If reading a file that is too large, use commands like 'head' or 'tail' to grab just what you need to avoid overwhelming your context window.

You have the power to loop and use tools multiple times in the background before giving your final conversational response to the user. Use this power to be genuinely helpful.`;





/**
 * Generates a response using a Custom LangGraph StateGraph.
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



  if (gatewaySocket) {
    const osName = gatewaySocket.clientOS || "unknown";
    finalSystemInstruction += `\n\nSTATUS: The user's local computer IS connected.`;
    finalSystemInstruction += `\nOPERATING SYSTEM: ${osName.toUpperCase()}. You MUST write your local execution commands specifically for this OS (e.g., use 'cmd'/'powershell' syntax for Windows, 'bash'/'zsh' syntax for macOS).`;
  } else {
    finalSystemInstruction += `\n\nSTATUS: The user's local computer is NOT connected. Do not attempt to use the local execution tool.`;
  }
  const messagesWithSystem = [
    new SystemMessage(finalSystemInstruction),
    ...langchainMessages,
  ];

  // 1. Assemble tools
  const currentTools = [tavilyTool];
  if (gatewaySocket) {
    console.log("🔌 Local Gateway detected. Adding local execution tool to Nexie's toolbelt.");
    currentTools.push(createLocalExecutionTool(gatewaySocket));
  } else {
    console.log("⚠️ No Local Gateway detected for this request.");
  }

  // 2. Bind tools to the LLM
  const llmWithTools = llm.bindTools(currentTools);

  // 3. Define the Agent Node (The Brain)
  const callModel = async (state) => {
    const response = await llmWithTools.invoke(state.messages);
    return { messages: [response] };
  };

  // 4. Define the Tool Node (The Hands)
  const toolNode = new ToolNode(currentTools);

  // 5. Define the Routing Logic (The Loop)
  const shouldContinue = (state) => {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];
    
    // If the LLM didn't call a tool, we are done and can reply to the user.
    if (!lastMessage.tool_calls?.length) {
      return END;
    }
    // Otherwise, route to the tool node to execute the command.
    return "tools";
  };

  // 6. Construct the Graph
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  // Compile the graph into a runnable application
  const app = workflow.compile();

  try {
    // Run the multi-step graph
    const responseState = await app.invoke({
      messages: messagesWithSystem,
    });

    // 👇 DEBUGGING BLOCK 👇
    console.log("🔍 AGENT THINKING PROCESS:");
    responseState.messages.forEach((msg) => {
      if (msg._getType() === "ai" && msg.tool_calls?.length > 0) {
        console.log(`🤖 AI Decided to call tool: ${msg.tool_calls[0].name}`);
        console.log(`   Query: ${JSON.stringify(msg.tool_calls[0].args)}`);
      }
      if (msg._getType() === "tool") {
        console.log(`📦 RAW TOOL RESULTS (${msg.name}):\n${msg.content.substring(0, 200)}...`);
      }
    });
    console.log("-----------------------------");
    // 👆 END DEBUGGING BLOCK 👆

    // The final message in the state array is the AI's final answer to the user
    const lastMessage = responseState.messages[responseState.messages.length - 1];
    return lastMessage.content;
    
  } catch (error) {
    console.error("LangGraph Agent Error:", error);
    return "Oops! I tripped over a wire. 🔌 Can you ask me that again?";
  }
}

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








// async function generateResponse(langchainMessages, username, gatewaySocket) {
//   console.log(`Generating response for ${username}...`);
//   const now = new Date();
//   const timeString = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

//   let finalSystemInstruction = nexieSystemInstruction;
//   finalSystemInstruction += `\n\n🕒 CURRENT SYSTEM TIME: ${timeString}`;
//   finalSystemInstruction += `\n(Use this date to verify if search results are up-to-date)`;
  
//   if (username) {
//     finalSystemInstruction += `\n\nCONTEXT: You are chatting with ${username}. Use their name warmly!`;
//   }

//   // Check if the user is connected via the Rust app
//   if (gatewaySocket) {
//     finalSystemInstruction += `\n\nSTATUS: The user's local computer IS connected. You may use the local execution tool.`;
//   } else {
//     finalSystemInstruction += `\n\nSTATUS: The user's local computer is NOT connected. Do not attempt to use the local execution tool.`;
//   }

//   const messagesWithSystem = [
//     new SystemMessage(finalSystemInstruction),
//     ...langchainMessages,
//   ];

//   // 5. Assemble the tools array dynamically for this specific request
//   const currentTools = [tavilyTool];
//   if (gatewaySocket) {
//     console.log("🔌 Local Gateway detected. Adding local execution tool to Nexie's toolbelt.");
//     currentTools.push(createLocalExecutionTool(gatewaySocket));
//   } else {
//     console.log("⚠️ No Local Gateway detected for this request.");
//   }

//   // 6. Create the LangGraph Agent for this specific request
//   const agent = createReactAgent({
//     llm,
//     tools: currentTools,
//   });

//   try {
//     const response = await agent.invoke({
//       messages: messagesWithSystem,
//     });

//     // 👇 DEBUGGING BLOCK 👇
//     console.log("🔍 AGENT THINKING PROCESS:");
//     response.messages.forEach((msg) => {
//       if (msg._getType() === "ai" && msg.tool_calls?.length > 0) {
//         console.log(`🤖 AI Decided to call tool: ${msg.tool_calls[0].name}`);
//         console.log(`   Query: ${JSON.stringify(msg.tool_calls[0].args)}`);
//       }
//       if (msg._getType() === "tool") {
//         console.log(`📦 RAW TOOL RESULTS (${msg.name}):`);
//         try {
//           console.log(JSON.stringify(JSON.parse(msg.content), null, 2)); 
//         } catch (e) {
//           console.log(msg.content);
//         }
//       }
//     });
//     console.log("-----------------------------");
//     // 👆 END DEBUGGING BLOCK 👆

//     const lastMessage = response.messages[response.messages.length - 1];
//     return lastMessage.content;
    
//   } catch (error) {
//     console.error("LangGraph Agent Error:", error);
//     return "Oops! I tripped over a wire. 🔌 Can you ask me that again?";
//   }
// }