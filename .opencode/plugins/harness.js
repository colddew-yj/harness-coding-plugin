/**
 * Harness Engineering Plugin for OpenCode
 * 
 * Core capabilities:
 * - Memory sedimentation (跨任务抗重复犯错)
 * - Architecture guard (静态规则保护)
 * - Simple planning workflow (自行判断复杂度，用户显性要求时必先出计划)
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const homeDir = os.homedir();

const HARNESS_DIR = path.resolve(__dirname, '../..');
const MEMORY_DIR = path.join(HARNESS_DIR, 'memory');
const RULES_DIR = path.join(HARNESS_DIR, 'rules');

// 确保目录存在
[MEMORY_DIR, RULES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 记忆存储
class MemoryStore {
  constructor() {
    this.lessonsFile = path.join(MEMORY_DIR, 'lessons-learned.jsonl');
    this.antiPatternsFile = path.join(MEMORY_DIR, 'anti-patterns.jsonl');
  }

  async retain(content, context = 'general') {
    const entry = { timestamp: new Date().toISOString(), content, context };
    const file = context === 'anti-pattern' ? this.antiPatternsFile : this.lessonsFile;
    fs.appendFileSync(file, JSON.stringify(entry) + '\n');
  }

  async recall(query, limit = 5) {
    const results = [];
    [this.lessonsFile, this.antiPatternsFile].forEach(file => {
      if (fs.existsSync(file)) {
        fs.readFileSync(file, 'utf-8').split('\n').filter(Boolean).forEach(line => {
          try {
            const entry = JSON.parse(line);
            if (entry.content.toLowerCase().includes(query.toLowerCase())) results.push(entry);
          } catch {}
        });
      }
    });
    return results.slice(0, limit);
  }
}

// 主插件导出
export const HarnessPlugin = async ({ client, directory }) => {
  const memory = new MemoryStore();

  const extractTaskIntent = (message) => {
    const text = message.parts.find(p => p.type === 'text')?.text || '';
    return (text.match(/\b\w{4,}\b/g) || []).slice(0, 10).join(' ');
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

  const checkArchitectureRules = (filePath) => {
    const rulesFile = path.join(RULES_DIR, 'architecture-rules.json');
    if (!fs.existsSync(rulesFile)) return true;
    const config = JSON.parse(fs.readFileSync(rulesFile, 'utf-8'));
    return !(config.forbiddenPaths || []).some(p => filePath.startsWith(p));
  };

  // 判断是否需要做计划：先过滤出编码/项目场景，再判断复杂度
  const needsPlanning = (message) => {
    const text = message.parts.find(p => p.type === 'text')?.text || '';

    // ===== 第一步：判断是否是编码/项目工作场景 =====
    // 只有在真正涉及代码开发、文件修改、项目构建等场景时才启用计划提示
    const codingPatterns = [
      // 中文编码动作 + 对象
      /(?:写|创建|修改|编辑|重构|实现|开发|修复|部署|构建|测试|调试|编码|编程|添加|删除|优化)\s*(?:代码|文件|程序|脚本|功能|模块|组件|页面|接口|服务|API|bug|类|方法|函数)/i,
      // Git/版本控制
      /(?:提交|commit|push|pull|merge|分支|branch|rebase|cherry-pick)/i,
      // 编程语言
      /\b(?:python|javascript|typescript|java|go|golang|rust|c\+\+|cpp|php|ruby|swift|kotlin|scala|dart|elixir|sql|html|css|scss|sass|less|json|yaml|yml|xml|toml)\b/i,
      // 框架/库
      /\b(?:react|vue|angular|svelte|next\.?js|nuxt|remix|gatsby|django|flask|fastapi|tornado|spring|springboot|express|nest\.?js|laravel|symfony|rails|sinatra|phoenix|flutter|electron|tauri)\b/i,
      // 基础设施/工具
      /\b(?:docker|kubernetes|k8s|nginx|redis|mysql|postgres|postgresql|mongodb|sqlite|prisma|typeorm|sequelize|terraform|aws|azure|gcp|vercel|netlify)\b/i,
      // 项目/工程/代码库
      /(?:项目|工程|代码库|repo|repository|workspace|package\.json|cargo\.toml|go\.mod|pom\.xml|build\.gradle)/i,
      // 代码结构关键词
      /\b(?:function|class|component|module|service|controller|model|middleware|hook|api|endpoint|route|handler|util|helper|schema|migration|config)\b/i,
      // 文件扩展名提及
      /\.(?:js|ts|jsx|tsx|py|java|go|rs|php|rb|swift|kt|scala|dart|ex|sql|html|css|scss|json|yaml|yml|md|vue|svelte)\b/i,
      // 代码片段特征
      /(?:import\s+(?:\{|from|type)|export\s+(?:default|const|function|class)|const\s+\w+\s*[:=]|function\s+\w+\s*\(|class\s+\w+|=>\s*\{|return\s+\w+)/i,
      // 技术术语
      /(?:async|await|promise|callback|middleware|decorator|annotation|dependency\s+injection|event\s+driven|microservice|monorepo)/i,
    ];

    const isCodingContext = codingPatterns.some(pattern => pattern.test(text));

    // 如果不是编码/项目场景，直接返回 none（日常对话不触发计划提示）
    if (!isCodingContext) return 'none';

    // ===== 第二步：在编码场景下，判断是否需要计划 =====
    // 用户显性要求做计划
    if (/做.*计划|先.*计划|出.*计划|写.*计划|plan|design\s+doc|spec|架构设计|技术方案/.test(text)) return 'required';

    // 复杂编码任务的信号（需要至少命中 2 个才建议做计划）
    const complexitySignals = [
      // 多步骤/跨模块/跨文件
      /(?:实现|开发|构建|创建).*?(?:模块|组件|服务|页面|功能).*?(?:和|以及|同时|并且|然后|最后|再|接着|之后)/i,
      /(?:需要|要求|必须).*?(?:同时|并且|然后|最后|再|接着|之后).*?(?:实现|开发|修改|创建|添加)/i,
      // 新功能/大型改动
      /(?:新建|新增|新功能|全新|从零|scratch|从零开始)/i,
      /(?:重构|迁移|升级|改造|重写|大规模)/i,
      // 架构/设计相关
      /(?:架构|设计|方案|结构|分层|解耦|抽象|接口设计|数据流|状态管理)/i,
      // 多文件/多模块暗示
      /(?:多个|几个|不同|各个|相关|多个).*?(?:文件|模块|组件|页面|接口)/i,
      // 长且详细的开发需求（>300 字符）
      text.length > 300,
      // 包含多个验证/检查点
      /(?:验证|测试|检查|确认|确保).*?(?:然后|接着|最后|再|之后)/i,
      // 涉及第三方集成
      /(?:集成|对接|调用|引入|接入).*?(?:API|SDK|服务|平台|第三方)/i,
    ];

    const complexityScore = complexitySignals.filter(Boolean).length;
    return complexityScore >= 2 ? 'suggested' : 'none';
  };

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      const firstUser = output.messages.find(m => m.info?.role === 'user');
      if (!firstUser || !firstUser.parts?.length) return;
      if (firstUser.parts.some(p => p.text?.includes('<harness-memory>'))) return;

      const planning = needsPlanning(firstUser);
      if (planning === 'required') {
        const planNote = `\n\n⚠️ 检测到显性计划要求，请先使用 superpowers writing-plans 生成开发计划后再编码。`;
        firstUser.parts.push({ type: 'text', text: planNote });
      } else if (planning === 'suggested') {
        const suggestNote = `\n\n💡 任务较复杂，建议先用 writing-plans 出计划，或直接开始编码（你可自行决定）。`;
        firstUser.parts.push({ type: 'text', text: suggestNote });
      }

      const memories = await memory.recall(extractTaskIntent(firstUser), 5);
      if (memories.length > 0) injectMemories(firstUser, memories);
    },

    'tool.execute.before': async (toolCall) => {
      if (toolCall.name === 'edit' || toolCall.name === 'write') {
        const filePath = toolCall.input?.filePath || '';
        if (!checkArchitectureRules(filePath)) {
          throw new Error(`[Harness] Architecture rule violated: ${filePath}`);
        }
      }
    },

    'tool.execute.after': async (toolCall, result) => {
      if (result?.error) {
        await memory.retain(`Tool ${toolCall.name} failed: ${result.error}`, 'anti-pattern');
      }
    },

    tool: {
      'harness-memory': {
        description: 'Query harness memory for past experiences',
        parameters: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number', default: 5 } }, required: ['query'] },
        execute: async (input) => JSON.stringify(await memory.recall(input.query, input.limit || 5), null, 2)
      }
    }
  };
};


