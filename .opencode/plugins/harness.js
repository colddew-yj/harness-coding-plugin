/**
 * Harness Engineering Plugin for OpenCode
 * 
 * Core capabilities:
 * - Recursive self-optimization (α/Ω prompt闭环)
 * - Independent evaluation (杜绝既当运动员又当裁判)
 * - Dynamic context management (意图驱动技能装载)
 * - Memory sedimentation (跨任务抗重复犯错)
 * - Architecture guard (静态规则 + 持续清理)
 * - Hallucination reduction (生成→评估→反馈→重试闭环)
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const homeDir = os.homedir();

// 路径定义
const HARNESS_DIR = path.resolve(__dirname, '../..');
const AGENTS_DIR = path.join(HARNESS_DIR, 'agents');
const SKILLS_DIR = path.join(HARNESS_DIR, 'skills');
const MEMORY_DIR = path.join(HARNESS_DIR, 'memory');
const RULES_DIR = path.join(HARNESS_DIR, 'rules');

// 确保目录存在
const ensureDirs = () => {
  [AGENTS_DIR, SKILLS_DIR, MEMORY_DIR, RULES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// 记忆存储抽象
class MemoryStore {
  constructor() {
    this.lessonsFile = path.join(MEMORY_DIR, 'lessons-learned.jsonl');
    this.antiPatternsFile = path.join(MEMORY_DIR, 'anti-patterns.jsonl');
    this.evalHistoryFile = path.join(MEMORY_DIR, 'evaluation-history.jsonl');
    this.hindsightClient = null;
    
    // 检测 Hindsight 服务
    this.initHindsight();
  }

  async initHindsight() {
    try {
      const response = await fetch('http://localhost:8888/health').catch(() => null);
      if (response?.ok) {
        this.hindsightClient = { baseUrl: 'http://localhost:8888' };
        console.log('[Harness] Hindsight service detected');
      }
    } catch {
      console.log('[Harness] Using JSONL memory store');
    }
  }

  async retain(content, context = 'general', metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      content,
      context,
      metadata
    };

    if (this.hindsightClient) {
      try {
        await fetch(`${this.hindsightClient.baseUrl}/v1/default/banks/harness-coding-plugin/memories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ content: `${context}: ${content}` }] })
        });
      } catch {}
      return;
    }

    const file = context === 'anti-pattern' ? this.antiPatternsFile : this.lessonsFile;
    fs.appendFileSync(file, JSON.stringify(entry) + '\n');
  }

  async recall(query, limit = 5) {
    if (this.hindsightClient) {
      try {
        const response = await fetch(`${this.hindsightClient.baseUrl}/v1/default/banks/harness-coding-plugin/memories/recall`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit })
        });
        const data = await response.json();
        return (data.results || []).slice(0, limit).map(r => ({
          content: r.text,
          context: r.type,
          entities: r.entities || []
        }));
      } catch {
        return [];
      }
    }

    const results = [];
    [this.lessonsFile, this.antiPatternsFile].forEach(file => {
      if (fs.existsSync(file)) {
        const lines = fs.readFileSync(file, 'utf-8').split('\n').filter(Boolean);
        lines.forEach(line => {
          try {
            const entry = JSON.parse(line);
            if (entry.content.toLowerCase().includes(query.toLowerCase())) {
              results.push(entry);
            }
          } catch {}
        });
      }
    });

    return results.slice(0, limit);
  }

  async reflect(prompt) {
    if (this.hindsightClient) {
      return null;
    }
    return null;
  }
}

// 主插件导出
export const HarnessPlugin = async ({ client, directory }) => {
  ensureDirs();
  const memory = new MemoryStore();

  const extractTaskIntent = (message) => {
    const text = message.parts.find(p => p.type === 'text')?.text || '';
    const keywords = text.match(/\b\w{4,}\b/g) || [];
    return keywords.slice(0, 10).join(' ');
  };

  const injectMemories = (message, memories) => {
    if (!memories.length) return;
    
    const contextBlock = `
<harness-memory>
# 历史经验（自动召回）
${memories.map(m => `- [${m.context}] ${m.content}`).join('\n')}
</harness-memory>
`;
    
    const ref = message.parts[0];
    message.parts.unshift({ ...ref, type: 'text', text: contextBlock });
  };

  const checkArchitectureRules = (filePath, operation) => {
    const rulesFile = path.join(RULES_DIR, 'architecture-rules.json');
    if (!fs.existsSync(rulesFile)) return true;

    const config = JSON.parse(fs.readFileSync(rulesFile, 'utf-8'));
    const forbiddenPaths = config.forbiddenPaths || [];
    return !forbiddenPaths.some(p => filePath.startsWith(p));
  };

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(SKILLS_DIR)) {
        config.skills.paths.push(SKILLS_DIR);
      }

      // Copy harness agents to global opencode agents directory
      const globalAgentsDir = path.join(homeDir, '.config/opencode/agents');
      if (!fs.existsSync(globalAgentsDir)) {
        fs.mkdirSync(globalAgentsDir, { recursive: true });
      }

      if (fs.existsSync(AGENTS_DIR)) {
        const agentFiles = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md'));
        agentFiles.forEach(file => {
          const src = path.join(AGENTS_DIR, file);
          const dest = path.join(globalAgentsDir, file);
          // Always copy to ensure latest version
          fs.copyFileSync(src, dest);
        });
        console.log(`[Harness] Registered ${agentFiles.length} agents to ${globalAgentsDir}`);
      }
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      const firstUser = output.messages.find(m => m.info?.role === 'user');
      if (!firstUser || !firstUser.parts?.length) return;

      if (firstUser.parts.some(p => p.text?.includes('<harness-memory>'))) return;

      const taskIntent = extractTaskIntent(firstUser);
      const memories = await memory.recall(taskIntent, 5);

      if (memories.length > 0) {
        injectMemories(firstUser, memories);
      }
    },

    'tool.execute.before': async (toolCall) => {
      if (toolCall.name === 'edit' || toolCall.name === 'write') {
        const filePath = toolCall.input?.filePath || '';
        if (!checkArchitectureRules(filePath, toolCall.name)) {
          throw new Error(`[Harness] Architecture rule violated: ${filePath}`);
        }
      }
    },

    'tool.execute.after': async (toolCall, result) => {
      if (result?.error) {
        await memory.retain(
          `Tool ${toolCall.name} failed: ${result.error}`,
          'anti-pattern',
          { tool: toolCall.name }
        );
      } else if (toolCall.name === 'edit' || toolCall.name === 'write') {
        await memory.retain(
          `Successfully ${toolCall.name} file`,
          'success-pattern',
          { tool: toolCall.name }
        );
      }
    },

    event: async (event) => {
      if (event.type === 'session.status' && event.status === 'idle') {
        // Session ended - could trigger reflection here
      }
    },

    tool: {
      'harness-memory': {
        description: 'Query harness memory store for past experiences and lessons',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            limit: { type: 'number', description: 'Max results', default: 5 }
          },
          required: ['query']
        },
        execute: async (input) => {
          const results = await memory.recall(input.query, input.limit || 5);
          return JSON.stringify(results, null, 2);
        }
      },
      'harness-reflect': {
        description: 'Trigger reflection on accumulated memories',
        parameters: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'Reflection prompt' }
          }
        },
        execute: async (input) => {
          const result = await memory.reflect(input.prompt || 'What patterns emerge?');
          return result ? JSON.stringify(result, null, 2) : 'Reflection not available (requires Hindsight service)';
        }
      }
    }
  };
};
