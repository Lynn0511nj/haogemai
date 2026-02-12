/**
 * 诊断服务 - 统一管理 Prompt A 和 Prompt B
 */

import { UserContext, DiagnosisResult, FullReport } from "../types";
import { PROMPT_A_SYSTEM, buildPromptAUserMessage } from "./promptA_quickDiagnosis";
import { PROMPT_B_SYSTEM, buildPromptBUserMessage } from "./promptB_fullDiagnosis";
import { MODEL_CONFIG } from "./modelConfig";

// 使用本地服务端代理
// 动态获取当前主机，支持通过 IP 访问
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // 使用当前访问的主机和端口 3001
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3001`;
};

const API_BASE_URL = getApiBaseUrl();
const DOUBAO_API_ENDPOINT = `${API_BASE_URL}/api/doubao`;

// 开发环境日志辅助函数
const isDev = import.meta.env.DEV;

const logError = (title: string, data: any) => {
  if (isDev) {
    console.group(`🔴 [豆包 API 错误] ${title}`);
    console.error(data);
    console.groupEnd();
  }
};

const logInfo = (title: string, data: any) => {
  if (isDev) {
    console.group(`ℹ️ [豆包 API 信息] ${title}`);
    console.log(data);
    console.groupEnd();
  }
};

/**
 * 调用豆包 API 的通用函数
 */
async function callDoubaoAPI(
  systemPrompt: string,
  userMessage: string,
  images: string[],
  modelName: string = 'doubao-seed-1-8-251228',
  options?: { temperature?: number; maxTokens?: number }
): Promise<any> {
  // 构建用户消息内容（支持文本和图片）
  const userContentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    { type: 'text', text: userMessage }
  ];

  // 添加图片
  images.forEach(img => {
    if (img) {
      userContentParts.push({
        type: 'image_url',
        image_url: { url: img }
      });
    }
  });

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContentParts }
  ];

  const requestBody = {
    model: modelName,
    messages,
    temperature: options?.temperature ?? 0.5, // 默认 0.5，更快更稳定
    max_tokens: options?.maxTokens ?? 1000, // 默认 1000，适合 Prompt A
    stream: false
  };

  logInfo('发送请求到服务端', {
    endpoint: DOUBAO_API_ENDPOINT,
    model: requestBody.model,
    promptType: systemPrompt.includes('极速初判') ? 'Prompt A' : 'Prompt B',
    hasImages: images.filter(Boolean).length
  });

  // 调用本地服务端代理（添加超时控制）
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 150000); // 150秒超时

  try {
    const response = await fetch(DOUBAO_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();

    if (!response.ok) {
      logError('服务端请求失败', {
        status: response.status,
        responseBody: responseText
      });
      throw new Error(`服务端请求失败 [${response.status}]: ${responseText}`);
    }

    const data = JSON.parse(responseText);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      logError('服务端返回数据格式异常', { data });
      throw new Error('服务端返回数据格式异常');
    }

    const content = data.choices[0].message.content;
    
    logInfo('AI 原始响应', {
      contentLength: content.length,
      contentPreview: content.substring(0, 200)
    });
    
    try {
      const parsedResult = JSON.parse(content);
      
      // 验证返回的数据结构
      if (isDev) {
        console.log('✅ AI 响应解析成功');
        console.log('📊 数据结构检查:', {
          hasClarityPhase: !!parsedResult.clarityPhase,
          hasPhaseInspiration: !!parsedResult.phaseInspiration,
          hasEmpathyMessage: !!parsedResult.empathyMessage,
          dimensionsCount: parsedResult.dimensions?.length || 0,
          dimensions: parsedResult.dimensions?.map((d: any) => ({
            name: d.name,
            score: d.score,
            hasDescription: !!d.description,
            hasDetailedAnalysis: !!d.detailedAnalysis,
            detailedAnalysisLength: d.detailedAnalysis?.length || 0
          }))
        });
      }
      
      return parsedResult;
    } catch (parseError) {
      logError('AI 响应 JSON 解析失败', {
        error: parseError,
        content: content.substring(0, 500)
      });
      throw new Error('AI 响应格式错误，无法解析 JSON');
    }

  } catch (fetchError) {
    clearTimeout(timeoutId);
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      throw new Error('诊断请求超时，请稍后重试');
    }
    throw fetchError;
  }
}

/**
 * Prompt A: 极速初判（免费版）
 * 10秒内完成，只提供核心诊断
 */
export async function quickDiagnosis(context: UserContext): Promise<Partial<DiagnosisResult>> {
  try {
    logInfo('🚀 开始极速初判 (Prompt A)', {
      accountStage: context.accountStage,
      mainGoal: context.mainGoal,
      stressPoint: context.stressPoint
    });

    const userMessage = buildPromptAUserMessage(context);
    const images = [context.profileImage, context.supplementImage].filter(Boolean) as string[];

    const result = await callDoubaoAPI(
      PROMPT_A_SYSTEM, 
      userMessage, 
      images,
      MODEL_CONFIG.PROMPT_A.model,
      { 
        temperature: MODEL_CONFIG.PROMPT_A.temperature, 
        maxTokens: MODEL_CONFIG.PROMPT_A.maxTokens 
      }
    );

    logInfo('✅ 极速初判完成', {
      clarityPhase: result.clarityPhase,
      dimensionsCount: result.dimensions?.length
    });
    
    // 验证维度数据
    if (!result.dimensions || !Array.isArray(result.dimensions)) {
      console.error('❌ AI 未返回 dimensions 数组');
      throw new Error('AI 响应格式错误：缺少 dimensions 字段');
    }
    
    // 检查维度数量
    if (result.dimensions.length < 5) {
      console.warn(`⚠️ AI 只返回了 ${result.dimensions.length} 个维度，应该是 5 个`);
      console.warn('返回的维度:', result.dimensions.map(d => d.name));
      
      // 补充缺失的维度
      const expectedDimensions = ['定位清晰度', '内容价值', '表达清晰度', '信任感', '更新节奏'];
      const existingNames = new Set(result.dimensions.map(d => d.name));
      
      expectedDimensions.forEach((name, index) => {
        if (!existingNames.has(name)) {
          console.warn(`⚠️ 补充缺失的维度: ${name}`);
          result.dimensions.push({
            name,
            score: 5,
            description: '数据不完整'
          });
        }
      });
    }

    return result;

  } catch (error) {
    logError('极速初判失败', error);
    throw error;
  }
}

/**
 * Prompt B: 完整深度诊断（付费版）
 * 深度分析，提供完整报告
 */
export async function fullDiagnosis(context: UserContext): Promise<FullReport> {
  try {
    logInfo('🔬 开始完整诊断 (Prompt B)', {
      accountStage: context.accountStage,
      mainGoal: context.mainGoal,
      stressPoint: context.stressPoint
    });

    const userMessage = buildPromptBUserMessage(context);
    const images = [context.profileImage, context.supplementImage].filter(Boolean) as string[];

    const result = await callDoubaoAPI(
      PROMPT_B_SYSTEM, 
      userMessage, 
      images,
      MODEL_CONFIG.PROMPT_B.model,
      { 
        temperature: MODEL_CONFIG.PROMPT_B.temperature, 
        maxTokens: MODEL_CONFIG.PROMPT_B.maxTokens 
      }
    );

    logInfo('✅ 完整诊断完成', {
      title: result.title,
      hasCoreStatus: !!result.coreStatus,
      sevenDayPlanLength: result.sevenDayPlan?.length
    });

    return result;

  } catch (error) {
    logError('完整诊断失败', error);
    throw error;
  }
}

/**
 * 兼容旧版本的统一诊断函数
 * 现在只调用 Prompt A（免费版）
 */
export async function diagnoseAccount(context: UserContext): Promise<DiagnosisResult> {
  const quickResult = await quickDiagnosis(context);
  
  // 返回快速诊断结果，fullReport 为 undefined（需要付费解锁）
  return {
    ...quickResult,
    fullReport: undefined
  } as DiagnosisResult;
}
