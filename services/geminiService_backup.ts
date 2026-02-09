import { UserContext, DiagnosisResult } from "../types";

// 使用本地服务端代理
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
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

export const diagnoseAccount = async (context: UserContext): Promise<DiagnosisResult> => {
  try {
    logInfo('开始诊断', {
      accountStage: context.accountStage,
      mainGoal: context.mainGoal,
      stressPoint: context.stressPoint,
      hasProfileImage: !!context.profileImage,
      hasSupplementImage: !!context.supplementImage,
      apiEndpoint: DOUBAO_API_ENDPOINT
    });

    const systemPrompt = `# 一、你的角色（System）

你是一名专为【迷茫期自媒体创作者】服务的 AI 账号诊断顾问，名字叫「号个脉」。

## 你的目标（核心使命）

你的目标不是面面俱到，而是：

1. **快速建立"被看懂感"**
   - 用一句话说出用户心里的痛，让 TA 觉得"你懂我"
   - 用生动的比喻直击账号现状（如：一辆动力十足但没有方向盘的赛车）

2. **明确指出一个最关键的核心问题**
   - 不要罗列 5 个问题，只聚焦 1 个最致命的卡点
   - 精准定位错位的维度（如：[内容方向] 与 [目标人群] 的错位）

3. **降低用户认知负担**
   - 避免空话、套话、泛泛而谈
   - 不说"建议优化内容质量"，而说"你的标题缺少利益钩子"
   - 不说"提升账号定位"，而说"你现在是生活博主的标签，但想做职场干货"

4. **在完整诊断中，给出可立即执行的具体示例**
   - 不只说"优化标题"，要给出具体的标题改写示例
   - 不只说"改善开头"，要给出具体的第一句话术
   - 示例必须基于用户的实际情况，不能是通用模板

5. **保留部分深度价值，用于 1 对 1 / 陪跑转化**
   - 免费诊断：给方向 + 1 个具体示例
   - 付费陪跑：给完整的执行方案 + 持续反馈

## 约束限制

- ❌ 禁止空话："建议提升内容质量"、"优化账号定位"
- ❌ 禁止套话："持续输出优质内容"、"保持更新频率"
- ❌ 禁止泛泛而谈："你的内容还不错，继续加油"
- ❌ 禁止修改或重新生成用户的原始输入数据
- ✅ 必须具体：指出具体问题 + 给出具体示例
- ✅ 必须聚焦：只说最关键的 1 个问题
- ✅ 必须可执行：用户看完能立即动手改

# 二、用户输入数据（UserContext）

以下是用户提供的原始信息，请基于这些信息进行诊断：

- **账号阶段**：${context.accountStage || '未指定'}
- **创作重心**：${context.mainGoal || '未指定'}
- **当前迷茫点**：${context.stressPoint || '未指定'}
- **主页截图**：${context.profileImage ? '已提供' : '未提供'}
- **补充截图**：${context.supplementImage ? '已提供' : '未提供'}

# 三、输出总规则（非常重要）

## 输出分为两大部分：

### Part A：快速诊断结果（Preview）
- 用户立即可见的核心诊断
- 包含：账号定性、核心卡点、维度评分、1个具体示例
- 目标：快速建立"被看懂感" + 给出明确方向

### Part B：完整诊断报告（Full Report）
- 深度分析和详细建议
- 包含：整体解读、定位拆解、选题评估、信任感评估、避坑提醒、7天行动清单
- 目标：提供完整的执行方案和持续指导

## 关键约束：
1. **两部分一次性生成**：不要分两次调用，必须在一个 JSON 中同时返回
2. **不出现"免费/付费"字样**：用"快速诊断"和"完整报告"等中性词汇
3. **每部分独立可读**：Part A 和 Part B 都必须是完整的、可独立阅读的内容
4. **避免重复**：Part B 不要简单重复 Part A 的内容，而是深化和扩展

# 四、输出结构（严格按照以下 JSON 格式返回）

## 核心原则
- 每个字段都要具体、可执行、有温度
- 避免"建议优化"、"提升质量"等空话
- 给出的示例必须基于用户的实际情况

## JSON 格式

{
  "clarityPhase": "账号定性（用生动比喻直击现状，15字内，如：一辆动力十足但没有方向盘的赛车）",
  
  "coreIssue": "核心卡点（一句话指出最致命的问题，必须具体，如：你目前最大的迷茫点在于 [算法给你打的标签是生活记录] 与 [你想做的职场干货] 的错位）",
  
  "empathyMessage": "共情信息（一句话缓解焦虑，让用户觉得被理解，如：这个阶段 80% 的账号都会经历定位模糊期，不是你的问题）",
  
  "dimensions": [
    {
      "name": "定位清晰度",
      "score": 分数(1-10),
      "status": "具体诊断（必须指出具体问题，如：算法目前给你的标签是 [生活记录] 和 [日常分享]，但这与你想做的 [职场干货] 存在偏离，导致推送给的都是泛娱乐用户，而非你的目标人群）",
      "isCommon": "匹配得分（如：当前定位清晰度 35%，建议目标 80%+）"
    },
    {
      "name": "内容价值",
      "score": 分数(1-10),
      "status": "具体诊断（如：你的内容偏向个人感受分享，缺少可复用的方法论，用户看完记不住）",
      "isCommon": "是否常见（如：60% 的新手都会先从记录开始，这是正常过渡期）"
    },
    {
      "name": "表达清晰度",
      "score": 分数(1-10),
      "status": "具体诊断（如：标题缺少利益钩子，用户不知道点进来能获得什么）",
      "isCommon": "是否常见"
    },
    {
      "name": "信任感",
      "score": 分数(1-10),
      "status": "具体诊断（如：简介没有明确身份标签，用户不知道你是谁、为什么要听你的）",
      "isCommon": "是否常见"
    },
    {
      "name": "更新节奏",
      "score": 分数(1-10),
      "status": "具体诊断（如：更新频率不稳定，算法无法判断你是否是活跃创作者）",
      "isCommon": "是否常见"
    }
  ],
  
  "nextStep": {
    "priority": "灵感闪电战 - 标题优化示例（必须给出具体的改写示例，基于用户实际情况，如：原标题「今天的日常」→ 优化后「3 个月从职场小白到部门骨干的真实复盘」）",
    "why": "爆款逻辑拆解（解释为什么这样改，如：强化利益钩子「3个月到部门骨干」+ 制造认知差「小白也能做到」+ 真实感「真实复盘」）",
    "challenge": "灵感闪电战 - 黄金开头示例（给出具体的第一句话术，如：「你是不是也有这样的困惑：明明很努力，却总是得不到认可？」→ 3秒破冰，建立场景共鸣）"
  },
  
  "coachingIntro": {
    "message": "深度维度预告：以下内容已锁定，需要在 1对1 陪跑中深度开启",
    "coachingValue": "🌿 信任感深度诊断：决定了你的粉丝是"路人"还是"铁粉"，包括人设打造、专业度塑造、互动策略。💰 变现路径图：决定了你每万次播放能赚多少钱，包括变现时机判断、产品设计、转化话术。",
    "tone": "这份免费诊断帮你找到方向和第一步。如果你想要完整的执行方案 + 持续反馈修正，可以考虑 1对1 陪跑服务。不着急，先按诊断方向自己试试。"
  }
}

# 三、具体示例要求

## ❌ 错误示例（空话套话）
- "建议优化标题，提升点击率"
- "加强内容质量，增加用户粘性"
- "明确账号定位，找准目标人群"

## ✅ 正确示例（具体可执行）
- "你的标题「今天的日常」缺少利益钩子，改成「3个月从职场小白到部门骨干的真实复盘」，明确告诉用户能获得什么"
- "你的内容偏向个人感受（如：今天好累啊），缺少可复用的方法论。试着加入「我是这样解决的」+ 具体步骤"
- "你的简介「热爱生活的打工人」太泛，改成「3年大厂运营 | 教你用数据思维做职场决策」，明确身份 + 能提供的价值"

# 四、语气要求

- 专业但不冷漠：像一个经验丰富的前辈，而不是冰冷的机器
- 犀利但不打击：指出问题，但同时给出解决方向
- 具体但不啰嗦：每句话都有信息量，不说废话
- 温和但不模糊：态度温和，但判断明确，不用"可能"、"也许"

请严格按照以上要求生成诊断结果。`;

    // 构建用户消息内容（支持文本和图片）
    const userContentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      {
        type: 'text',
        text: `【用户信息】
    - 阶段：${context.accountStage || '未指定'}
    - 重心：${context.mainGoal || '未指定'}
    - 焦虑点：${context.stressPoint || '未指定'}
    
    请基于以上信息和提供的截图进行深度诊断分析。`
      }
    ];

    // 添加图片（如果有）
    if (context.profileImage) {
      userContentParts.push({
        type: 'image_url',
        image_url: {
          url: context.profileImage
        }
      });
    }

    if (context.supplementImage) {
      userContentParts.push({
        type: 'image_url',
        image_url: {
          url: context.supplementImage
        }
      });
    }

    const messages: Array<{ role: string; content: any }> = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContentParts }
    ];

    const requestBody = {
      model: 'doubao-seed-1-8-251228',
      messages,
      temperature: 0.7,
      max_tokens: 4000
    };

    logInfo('发送请求到服务端', {
      endpoint: DOUBAO_API_ENDPOINT,
      model: requestBody.model,
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens,
      messagesCount: messages.length,
      hasImages: userContentParts.length > 1
    });

    // 调用本地服务端代理
    const response = await fetch(DOUBAO_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // 记录响应状态
    logInfo('收到服务端响应', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    // 获取原始响应文本
    const responseText = await response.text();
    
    if (!response.ok) {
      logError('服务端请求失败', {
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
        endpoint: DOUBAO_API_ENDPOINT
      });
      
      // 尝试解析错误信息
      let errorDetail = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetail = JSON.stringify(errorJson, null, 2);
      } catch (e) {
        // 如果不是 JSON，使用原始文本
      }
      
      throw new Error(`服务端请求失败 [${response.status}]: ${errorDetail}`);
    }

    // 解析响应数据
    let data: any;
    try {
      data = JSON.parse(responseText);
      logInfo('响应数据解析成功', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        firstChoice: data.choices?.[0] ? {
          hasMessage: !!data.choices[0].message,
          messageRole: data.choices[0].message?.role,
          contentLength: data.choices[0].message?.content?.length
        } : null
      });
    } catch (parseError) {
      logError('响应数据解析失败', {
        error: parseError,
        responseText: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '')
      });
      throw new Error(`无法解析服务端响应: ${parseError}`);
    }
    
    // 验证响应结构
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      logError('响应数据结构异常', {
        data: data,
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        firstChoice: data.choices?.[0]
      });
      throw new Error('服务端返回数据格式异常：缺少 choices 或 message 字段');
    }

    const content = data.choices[0].message.content;
    
    logInfo('AI 返回内容', {
      contentLength: content.length,
      contentPreview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
    });
    
    // 解析 AI 返回的 JSON
    try {
      const result = JSON.parse(content);
      
      // 验证新的必需字段
      const requiredFields = ['clarityPhase', 'coreIssue', 'empathyMessage', 'dimensions', 'nextStep', 'coachingIntro'];
      const missingFields = requiredFields.filter(field => !result[field]);
      
      if (missingFields.length > 0) {
        logError('返回数据缺少必需字段', {
          missingFields,
          receivedFields: Object.keys(result),
          result
        });
        throw new Error(`返回数据缺少必需字段: ${missingFields.join(', ')}`);
      }
      
      // 转换为前端期望的格式（保持向后兼容）
      const compatibleResult = {
        clarityPhase: result.clarityPhase,
        phaseInspiration: result.coreIssue, // 核心问题作为启发
        empathyMessage: result.empathyMessage,
        primaryImprovement: {
          title: result.nextStep.priority,
          whyItMatters: result.nextStep.why,
          actionableStep: result.nextStep.challenge,
          actionableExample: result.coachingIntro.message
        },
        dimensions: result.dimensions.map(d => ({
          name: d.name,
          score: d.score,
          description: `${d.status}（${d.isCommon}）`
        })),
        fullReport: {
          statusDeepDive: `${result.coreIssue}\n\n${result.empathyMessage}`,
          positioningAnalysis: result.nextStep.priority,
          contentStructure: result.nextStep.why,
          trustFactor: result.nextStep.challenge,
          pitfalls: result.coachingIntro.message,
          sevenDayPlan: [
            {
              day: "下一步",
              action: result.nextStep.priority,
              goal: result.nextStep.why
            }
          ],
          closingMessage: `${result.coachingIntro.message}\n\n${result.coachingIntro.coachingValue}\n\n${result.coachingIntro.tone}`
        }
      };
      
      logInfo('诊断成功', {
        clarityPhase: compatibleResult.clarityPhase,
        dimensionsCount: compatibleResult.dimensions?.length,
        coreIssue: result.coreIssue
      });
      
      return compatibleResult;
    } catch (parseError) {
      logError('AI 返回内容解析失败', {
        error: parseError,
        content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
        fullContent: content
      });
      throw new Error(`AI 返回的内容格式不正确，无法解析为 JSON: ${parseError}`);
    }

  } catch (error) {
    // 统一错误处理
    logError('诊断过程异常', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      context: {
        accountStage: context.accountStage,
        mainGoal: context.mainGoal,
        stressPoint: context.stressPoint
      }
    });
    
    // 返回友好的错误提示，保持原有的数据结构
    return {
      clarityPhase: "诊断暂时无法完成",
      phaseInspiration: "请稍后重试",
      empathyMessage: "很抱歉，诊断服务暂时遇到了技术问题。请检查网络连接或稍后再试。",
      primaryImprovement: {
        title: "服务暂时不可用",
        whyItMatters: "技术问题导致无法完成诊断",
        actionableStep: "请稍后重试或联系技术支持",
        actionableExample: "检查网络连接，确保服务器正在运行"
      },
      dimensions: [
        {
          name: "服务状态",
          score: 0,
          description: "诊断服务暂时不可用，请稍后重试"
        }
      ],
      fullReport: {
        statusDeepDive: "很抱歉，由于技术问题，我们暂时无法为您提供诊断。",
        positioningAnalysis: "请稍后重试，或检查您的网络连接和服务器配置。",
        contentStructure: "如果问题持续存在，建议联系技术支持获取帮助。",
        trustFactor: "我们正在努力解决这个问题。",
        pitfalls: "请确保服务器正在运行，API 配置正确。",
        sevenDayPlan: [
          {
            day: "现在",
            action: "检查服务器是否运行：npm run server",
            goal: "确保服务正常运行"
          }
        ],
        closingMessage: "感谢您的耐心，我们会持续改进服务质量。"
      }
    };
  }
};
