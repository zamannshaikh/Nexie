// import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// import { z } from "zod";
// import { tavily } from "@tavily/core";

// // 1. Setup the Tavily Client
// const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// // 2. Create the MCP Server
// const server = new McpServer({
//   name: "Nexie-Tavily-Search",
//   version: "1.0.0",
// });

// // 3. Define the Search Tool
// server.tool(
//   "web_search",
//   {
//     query: z.string().describe("The search query to find information about"),
//     days: z.number().optional().describe("Number of days back to search (for news)"),
//   },
//   async ({ query, days }) => {
//     try {
//       console.log(`🔍 Searching Tavily for: ${query}`);
      
//       const response = await tvly.search(query, {
//         search_depth: "basic", // use "advanced" for deeper research (costs more credits)
//         max_results: 5,
//         include_answer: true, // Tavily will generate a short answer for you!
//         include_raw_content: false,
//         ...(days && { days }), // Filter by date if provided
//       });

//       // Format the output for the LLM
//       const answer = response.answer ? `Direct Answer: ${response.answer}\n\n` : "";
//       const sources = response.results.map(r => 
//         `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`
//       ).join("\n\n---\n\n");

//       return {
//         content: [{ type: "text", text: answer + sources }],
//       };
//     } catch (error) {
//       return {
//         content: [{ type: "text", text: `Error searching web: ${error.message}` }],
//         isError: true,
//       };
//     }
//   }
// );

// // 4. Start the Server (Standard IO for local/embedded use)
// const transport = new StdioServerTransport();
// await server.connect(transport);

















// tavilySearch.service.js (CommonJS)
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { tavily } = require("@tavily/core");

// Simple guard to ensure API key present
if (!process.env.TAVILY_API_KEY) {
  console.warn("Warning: TAVILY_API_KEY is not set. Tavily searches will fail if you try to call them.");
}

// Create the Tavily client
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// Create MCP server
const server = new McpServer({
  name: "Nexie-Tavily-Search",
  version: "1.0.0",
});

// Define web_search tool
server.tool(
  "web_search",
  {
    query: z.string().describe("The search query to find information about"),
    days: z.number().optional().describe("Number of days back to search (for news)"),
  },
  async ({ query, days }) => {
    try {
      console.log(`🔍 Tavily: searching for: ${query} (days=${days})`);

      const response = await tvly.search(query, {
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
        include_raw_content: false,
        ...(days && { days }),
      });

      // Construct a human-readable text
      const answer = response.answer ? `Direct Answer: ${response.answer}\n\n` : "";
      const sources = Array.isArray(response.results)
        ? response.results.map((r) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join("\n\n---\n\n")
        : "";

      // Return as MCP content shape
      return {
        content: [{ type: "text", text: answer + sources }],
      };
    } catch (error) {
      console.error("Tavily search error:", error);
      return {
        content: [{ type: "text", text: `Error searching web: ${error && error.message ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Connect server over stdio transport inside an async IIFE so this file can be run as "node tavilySearch.service.js"
(async () => {
  try {
    const transport = new StdioServerTransport();
    console.log("🔌 Tavily MCP Server starting on stdio transport...");
    await server.connect(transport);
    console.log("🔌 Tavily MCP Server connected and ready.");
  } catch (err) {
    console.error("Failed to start Tavily MCP server:", err);
    // If this process is the child spawned by parent, exit so parent knows it failed
    process.exit(1);
  }
})();
