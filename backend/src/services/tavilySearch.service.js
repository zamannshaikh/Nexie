import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { tavily } from "@tavily/core";

// 1. Setup the Tavily Client
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// 2. Create the MCP Server
const server = new McpServer({
  name: "Nexie-Tavily-Search",
  version: "1.0.0",
});

// 3. Define the Search Tool
server.tool(
  "web_search",
  {
    query: z.string().describe("The search query to find information about"),
    days: z.number().optional().describe("Number of days back to search (for news)"),
  },
  async ({ query, days }) => {
    try {
      console.log(`🔍 Searching Tavily for: ${query}`);
      
      const response = await tvly.search(query, {
        search_depth: "basic", // use "advanced" for deeper research (costs more credits)
        max_results: 5,
        include_answer: true, // Tavily will generate a short answer for you!
        include_raw_content: false,
        ...(days && { days }), // Filter by date if provided
      });

      // Format the output for the LLM
      const answer = response.answer ? `Direct Answer: ${response.answer}\n\n` : "";
      const sources = response.results.map(r => 
        `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`
      ).join("\n\n---\n\n");

      return {
        content: [{ type: "text", text: answer + sources }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error searching web: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// 4. Start the Server (Standard IO for local/embedded use)
const transport = new StdioServerTransport();
await server.connect(transport);