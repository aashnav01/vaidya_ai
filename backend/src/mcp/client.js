const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
require('dotenv').config();

let mcpClient = null;

async function initMCPClient() {
  if (mcpClient) return mcpClient;
  
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not found. Cannot start MongoDB MCP Server.');
    return null;
  }

  console.log('🔌 Starting MongoDB MCP Server...');
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-mongodb', process.env.MONGODB_URI],
  });

  const client = new Client(
    { name: 'vaidya-ai-agent', version: '1.0.0' },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    console.log('✅ Connected to MongoDB MCP Server');
    mcpClient = client;
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to MCP Server:', error);
    return null;
  }
}

async function getMongoTools() {
  const client = await initMCPClient();
  if (!client) return [];
  
  try {
    const response = await client.listTools();
    return response.tools;
  } catch (error) {
    console.error('Failed to list tools:', error);
    return [];
  }
}

async function callMongoTool(name, args) {
  const client = await initMCPClient();
  if (!client) throw new Error('MCP client not connected');

  try {
    console.log(`🛠️  Calling MCP Tool: ${name}`, args);
    const result = await client.callTool({ name, arguments: args });
    return result.content;
  } catch (error) {
    console.error(`Tool execution failed (${name}):`, error);
    throw error;
  }
}

module.exports = { initMCPClient, getMongoTools, callMongoTool };
