/**
 * 豆包模型配置
 * 
 * 根据实际测试数据选择最优模型
 */

export const MODEL_CONFIG = {
  // Prompt A：极速初判（免费版）
  PROMPT_A: {
    model: 'ep-20260206152604-mkmg8', // Doubao-1.6 flash - 更快的版本
    temperature: 0.3,
    maxTokens: 800,
    description: 'Flash 版本，极速响应'
  },

  // Prompt B：完整诊断（付费版）
  PROMPT_B: {
    model: 'ep-20260206152604-mkmg8', // Doubao-1.6 flash - 更快的版本
    temperature: 0.6,
    maxTokens: 3000,
    description: 'Flash 版本，快速生成完整报告'
  },

  // 备选方案
  FALLBACK: {
    model: 'ep-20260206152604-mkmg8',
    temperature: 0.5,
    maxTokens: 2000,
    description: 'Flash 版本备用'
  }
};

/**
 * 当前使用模型
 * 
 * 接入点名称: Doubao-1.6 flash
 * 接入点 ID: ep-20260206152604-mkmg8
 * 模型: Doubao-Seed-1.6-flash (端点ID: 250828)
 * 状态: 健康 ✅
 * 
 * 特点:
 * - Flash 版本，速度极快（比 Lite 更快）
 * - 适合需要快速响应的场景
 * - 成本适中
 * - 使用 API Key: ca14e372-ae2e-4b85-987b-2d88281d81e1
 * 
 * 预期性能:
 * - Prompt A: 3-5秒
 * - Prompt B: 15-20秒
 */
