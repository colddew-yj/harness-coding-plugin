#!/usr/bin/env node
/**
 * Harness Memory MCP Server
 *
 * Provides memory query/retention tools for Trae integration.
 * Reads/writes to harness-coding-plugin/memory/ directory.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Resolve memory directory
// Priority: HARNESS_MEMORY_DIR env > ~/.harness-coding-plugin/memory > ../../memory
const MEMORY_DIR = process.env.HARNESS_MEMORY_DIR
  || (() => {
    const homePlugin = path.join(os.homedir(), 'projects', 'harness-coding-plugin', 'memory');
    if (fs.existsSync(homePlugin)) return homePlugin;
    // Fallback: relative to this file (adapters/trae/mcps/harness-memory/)
    return path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..', '..', 'memory');
  })();

const LESSONS_FILE = path.join(MEMORY_DIR, 'lessons-learned.jsonl');
const ANTI_PATTERNS_FILE = path.join(MEMORY_DIR, 'anti-patterns.jsonl');

// Ensure directory exists
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

function readEntries(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

function appendEntry(filePath, entry) {
  fs.appendFileSync(filePath, JSON.stringify(entry) + '\n');
}

function searchEntries(query, limit = 5) {
  const all = [
    ...readEntries(LESSONS_FILE),
    ...readEntries(ANTI_PATTERNS_FILE),
  ];
  const q = query.toLowerCase();
  return all
    .filter(e => e.content && e.content.toLowerCase().includes(q))
    .slice(0, limit);
}

const server = new Server(
  {
    name: 'harness-memory',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'harness_memory_query',
        description: 'Query harness memory for past experiences and lessons. Returns relevant historical entries matching the query.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to find relevant memories (e.g., "react hooks", "database migration", "api design")',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 5)',
              default: 5,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'harness_memory_retain',
        description: 'Record a new lesson, anti-pattern, or success pattern to harness memory for future retrieval.',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'The experience/lesson to record. Should be actionable and general.',
            },
            context: {
              type: 'string',
              description: 'Category: "lesson", "anti-pattern", "success-pattern", or "architecture-decision"',
              enum: ['lesson', 'anti-pattern', 'success-pattern', 'architecture-decision'],
              default: 'lesson',
            },
          },
          required: ['content'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'harness_memory_query') {
    const { query, limit = 5 } = args;
    const results = searchEntries(query, limit);

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No memories found for query: "${query}"`,
          },
        ],
      };
    }

    const formatted = results
      .map((e, i) => `${i + 1}. [${e.context || 'general'}] ${e.content}`)
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `Found ${results.length} relevant memories for "${query}":\n\n${formatted}`,
        },
      ],
    };
  }

  if (name === 'harness_memory_retain') {
    const { content, context = 'lesson' } = args;
    const entry = {
      timestamp: new Date().toISOString(),
      content,
      context,
    };
    const file = context === 'anti-pattern' ? ANTI_PATTERNS_FILE : LESSONS_FILE;
    appendEntry(file, entry);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Memory recorded [${context}]: ${content.slice(0, 100)}${content.length > 100 ? '...' : ''}`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Harness Memory MCP Server running on stdio');
}

main().catch(console.error);
