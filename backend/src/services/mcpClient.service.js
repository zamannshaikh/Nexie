// CommonJS file

const path = require("path");

let client = null;

async function getMcpClient() {
  if (client) return client;

  // Dynamically import the ESM-only SDK modules
  // (works from CommonJS; avoid top-level import to keep compatibility)
  const clientModule = await import("@modelcontextprotocol/sdk/client/index.js");
  const stdioModule = await import("@modelcontextprotocol/sdk/client/stdio.js");

  const { Client } = clientModule;
  const { StdioClientTransport } = stdioModule;

  // __dirname is available in CommonJS — no need for fileURLToPath(import.meta.url)
  const serverScriptPath = path.resolve(__dirname, "./tavilySearch.service.js");

  const transport = new StdioClientTransport({
    command: "node",
    args: [serverScriptPath],
    env: { ...process.env },
  });

  client = new Client({ name: "Nexie-Backend", version: "1.0.0" }, { capabilities: {} });

  console.log("🔌 Spawning Tavily MCP Server...");
  await client.connect(transport);
  return client;
}

async function performWebSearch(query) {
  try {
    const mcp = await getMcpClient();

    const result = await mcp.callTool({
      name: "web_search",
      arguments: { query },
    });

    // safe access and return text
    return result?.content?.[0]?.text ?? "No results";
  } catch (error) {
    console.error("MCP Search Error:", error);
    return "Error: Could not perform search.";
  }
}

module.exports = {
  getMcpClient,
  performWebSearch,
};
