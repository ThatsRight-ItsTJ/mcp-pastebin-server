import dotenv from 'dotenv';
import { MCPServer, Tool } from '@la-rebelion/mcp-server';
import { z } from 'zod';
import { createPaste } from './tools/createPaste.js';
import { readPaste } from './tools/readPaste.js';
import { listPastes } from './tools/listPastes.js';

dotenv.config();

// Create tool classes that extend the abstract Tool class
class CreatePasteTool extends Tool {
  init() {
    this.toolSchema = {
      name: 'create_paste',
      description: 'Create a new paste on Pastebin',
      inputSchema: z.object({
        title: z.string().optional().describe('Title of the paste'),
        content: z.string().describe('Content of the paste (required)'),
        format: z.string().optional().describe('Format/language of the paste (optional, e.g., javascript, python, text)').default('text'),
        visibility: z.enum(['public', 'unlisted', 'private']).describe('Visibility of the paste').default('public')
      })
    };
  }

  async execute(input) {
    try {
      const result = await createPaste(input);
      return result;
    } catch (error) {
      return {
        error: `Unexpected error: ${error.message}`,
        details: error.stack
      };
    }
  }
}

class ReadPasteTool extends Tool {
  init() {
    this.toolSchema = {
      name: 'read_paste',
      description: 'Read a paste from Pastebin by its key',
      inputSchema: z.object({
        pasteKey: z.string().describe('The key of the paste to read (required)')
      })
    };
  }

  async execute(input) {
    try {
      const result = await readPaste(input);
      return result;
    } catch (error) {
      return {
        error: `Unexpected error: ${error.message}`,
        details: error.stack
      };
    }
  }
}

class ListUserPastesTool extends Tool {
  init() {
    this.toolSchema = {
      name: 'list_user_pastes',
      description: 'List user\'s pastes from Pastebin',
      inputSchema: z.object({
        limit: z.number().min(1).max(100).optional().describe('Maximum number of pastes to return (optional, default 10, max 100)').default(10)
      })
    };
  }

  async execute(input) {
    try {
      const result = await listPastes(input);
      return result;
    } catch (error) {
      return {
        error: `Unexpected error: ${error.message}`,
        details: error.stack
      };
    }
  }
}

// Initialize MCP server
const server = new MCPServer('pastebin-server', '1.0.0');

// Register tools
const createPasteTool = new CreatePasteTool();
const readPasteTool = new ReadPasteTool();
const listUserPastesTool = new ListUserPastesTool();

server.registerTool('create_paste', createPasteTool);
server.registerTool('read_paste', readPasteTool);
server.registerTool('list_user_pastes', listUserPastesTool);

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
console.log('Starting Pastebin MCP Server...');
console.log('Available tools: create_paste, read_paste, list_user_pastes');

server.run().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});