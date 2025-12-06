import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

// Helper to get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let client = null;

export const getMcpClient = async () => {
  // If we already have a connection, reuse it (Singleton pattern)
  if (client) return client;

  // 1. Point to your specific server file
  // Make sure the filename matches exactly what you created!
  const serverScriptPath = path.resolve(__dirname, "./tavilySearch.service.js");

  // 2. Spawn the server as a background process
  // This runs: "node services/tavilySearchService.js"
  const transport = new StdioClientTransport({
    command: "node",
    args: [serverScriptPath],
    env: { ...process.env } // Pass environment variables (API Keys) to the child process
  });

  client = new Client(
    { name: "Nexie-Backend", version: "1.0.0" },
    { capabilities: {} }
  );

  console.log("🔌 Spawning Tavily MCP Server...");
  await client.connect(transport);
  return client;
};

// Wrapper function to make calling it easy
export const performWebSearch = async (query) => {
  try {
    const mcp = await getMcpClient();
    
    // Call the 'web_search' tool defined in your server file
    const result = await mcp.callTool({
      name: "web_search",
      arguments: { query: query }
    });

    return result.content[0].text;
  } catch (error) {
    console.error("MCP Search Error:", error);
    return "Error: Could not perform search.";
  }
};