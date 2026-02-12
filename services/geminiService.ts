import { UserContext, DiagnosisResult } from "../types";

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

4. **给出可立即执行的具体示例**
   - 不只说"优化标题"，要给出具体的标题改写示例
   - 不只说"改善开头"，要给出具体的第一句话术
   - 示例必须基于用户的实际情况，不能是通用模板

5. **保留部分深度价值，用于转化**
   - 快速诊断：给方向 + 1 个具体示例
   - 完整报告：给完整的执行方案 + 持续指导

## 约束限制

- ❌ 禁止空话："建议提升内容质量"、"优化账号定位"
- ❌ 禁止套话："持续输出优质内容"、"保持更新频率"
- ❌ 禁止泛泛而谈："你的内容还不错，继续加油"
- ❌ 禁止修改或重新生成用户的原始输入数据
- ❌ 禁止出现"免费"、"付费"等字样
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

## 输出分为两大部分，必须一次性生成：

### Part A：快速诊断结果（Preview）
- 用户立即可见的核心诊断
- 包含：账号定性、核心卡点、维度评分、1个具体示例
- 目标：快速建立"被看懂感" + 给出明确方向

### Part B：完整诊断报告（Full Report）
- 深度分析和详细建议
- 包含：整体解读、定位拆解、选题评估、信任感评估、避坑提醒、7天行动清单
- 目标：提供完整的执行方案和持续指导

## 关键约束：
1. **两部分一次性生成**：必须在一个 JSON 中同时返回 preview 和 fullReport
2. **不出现"免费/付费"字样**：用"快速诊断"和"完整报告"等中性词汇
3. **每部分独立可读**：Part A 和 Part B 都必须是完整的、可独立阅读的内容
4. **避免重复**：Part B 不要简单重复 Part A 的内容，而是深化和扩展

# 四、输出结构（严格按照以下 JSON 格式返回）

{
  "clarityPhase": "账号定性（用生动比喻直击现状，15字内）",
  "phaseInspiration": "核心卡点（一句话指出最致命的问题，必须具体）",
  "empathyMessage": "共情信息（一句话缓解焦虑）",
  "primaryImprovement": {
    "title": "立即可改进的方向（一句话）",
    "whyItMatters": "为什么这样改（爆款逻辑拆解）",
    "actionableStep": "具体示例（必须给出具体改写）",
    "actionableExample": "执行提示（如何落地）"
  },
  "dimensions": [
    {
      "name": "定位清晰度",
      "score": 分数(1-10),
      "description": "具体诊断（必须指出具体问题 + 匹配得分）"
    },
    {
      "name": "内容价值",
      "score": 分数(1-10),
      "description": "具体诊断"
    },
    {
      "name": "表达清晰度",
      "score": 分数(1-10),
      "description": "具体诊断"
    },
    {
      "name": "信任感",
      "score": 分数(1-10),
      "description": "具体诊断"
    },
    {
      "name": "更新节奏",
      "score": 分数(1-10),
      "description": "具体诊断"
    }
  ],
  "fullReport": {
    "title": "你的完整账号诊断报告",
    
    "coreStatus": "一句话定性（强断言，判断账号所处核心状态，具备"被看懂感"。示例：你的账号目前处在「内容不差，但还没被算法当成一个人」的阶段。）",
    
    "coreProblem": "核心矛盾诊断（只说一个最大的问题，明确指出：最大的问题是【核心问题】，而不是其他维度。给一句判断依据。示例：你的内容横跨多个方向，导致算法无法判断该把你推给哪一类人。）",
    
    "actionableExample": {
      "title": "下一步，你可以这样试一次",
      "context": "基于核心问题的背景说明（1-2句话，如：你现在不需要重新规划定位，而是先做一次身份收敛测试。）",
      "example": "可直接模仿的内容示例或句式（具体到可以直接套用，如：发一条内容，只讲你在 ___ 经历中踩过的一个坑，以及你现在的判断。）",
      "constraint": "执行限制（偏内容/表达/结构层，≤120字，如：不要讲方法论，只讲你的个人视角。）"
    },
    
    "coachingSection": {
      "title": "1 对 1 陪跑：把判断真正变成结果",
      "intro": "这份诊断能帮你看清问题，但真正难的是「改的过程中不跑偏」。1 对 1 陪跑，就是在你真实创作时，帮你把每一步校准到对的方向上。",
      "cta": {
        "type": "wechat",
        "text": "添加微信，进入1对1账号陪跑",
        "wechatId": "请填写实际微信号",
        "note": "备注「账号诊断」即可"
      }
    },
    
    "sevenDayPlan": [
      {
        "day": "Day 1-2",
        "action": "具体行动（如：调整账号简介和头像，明确身份标签）",
        "goal": "预期目标（如：让新访客 3 秒内知道你是谁、做什么的）"
      },
      {
        "day": "Day 3-4",
        "action": "具体行动",
        "goal": "预期目标"
      },
      {
        "day": "Day 5-7",
        "action": "具体行动",
        "goal": "预期目标"
      }
    ],
    
    "closingMessage": "陪伴总结（100字左右，温和鼓励，像经验型顾问而不是说明书。不打鸡血、不说教，不使用"建议你考虑""如果你愿意"。核心感受：清晰、笃定、可执行。强调：诊断 ≠ 改变，陪跑 = 把这份诊断真正落地。）"
  }
}

# 五、语言与风格统一要求

- **像经验型顾问，而不是说明书**：用第一人称视角，分享观察和判断
- **不打鸡血、不说教**：避免"你一定可以的"、"只要坚持就能成功"
- **不使用模糊词汇**：不用"建议你考虑"、"如果你愿意"、"可能"、"也许"
- **核心感受**：清晰、笃定、可执行

# 六、转化逻辑与原则

## 核心逻辑
**1 对 1 陪跑不是卖服务，是承接「你已经被说准了之后的下一步」**

## 禁止内容
❌ "我们还分析了……更适合在 1 对 1 中拆解"
❌ "留白 / 隐藏价值 / 未展开维度"等概念性说明
❌ 偏产品说明、偏方法论解释的段落
❌ 抽象词：「深度拆解 / 全面优化 / 系统规划」
❌ 模糊词：「如果你愿意」、「可以考虑」

## 转化原则
✅ 不制造焦虑，但要制造"现在不动会继续卡住"的清晰感
✅ 不强调名额稀缺，不搞套路
✅ 明确：诊断 ≠ 改变，陪跑 = 把这份诊断真正落地
✅ 让用户理解：这是为了解决"一个人做不到的那部分"

# 七、具体示例要求

## ❌ 错误示例（空话套话）
- "建议优化标题，提升点击率"
- "加强内容质量，增加用户粘性"
- "明确账号定位，找准目标人群"

## ✅ 正确示例（具体可执行）
- "你的标题「今天的日常」缺少利益钩子，改成「3个月从职场小白到部门骨干的真实复盘」，明确告诉用户能获得什么"
- "你的内容偏向个人感受（如：今天好累啊），缺少可复用的方法论。试着加入「我是这样解决的」+ 具体步骤"
- "你的简介「热爱生活的打工人」太泛，改成「3年大厂运营 | 教你用数据思维做职场决策」，明确身份 + 能提供的价值"

# 六、语气要求

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
    
    请基于以上信息和提供的截图进行深度诊断分析，一次性生成快速诊断和完整报告两部分内容。`
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
      max_tokens: 6000,  // 增加 token 限制以支持更长的输出
      stream: false  // 明确禁用流式响应以获得更快的完整响应
    };

    logInfo('发送请求到服务端', {
      endpoint: DOUBAO_API_ENDPOINT,
      model: requestBody.model,
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens,
      messagesCount: messages.length,
      hasImages: userContentParts.length > 1
    });

    // 调用本地服务端代理（添加超时控制）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 150000); // 150秒超时（2.5分钟）
    
    try {
      const response = await fetch(DOUBAO_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
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
      
      // 验证必需字段
      const requiredFields = ['clarityPhase', 'phaseInspiration', 'empathyMessage', 'primaryImprovement', 'dimensions', 'fullReport'];
      const missingFields = requiredFields.filter(field => !result[field]);
      
      if (missingFields.length > 0) {
        logError('返回数据缺少必需字段', {
          missingFields,
          receivedFields: Object.keys(result),
          result
        });
        throw new Error(`返回数据缺少必需字段: ${missingFields.join(', ')}`);
      }
      
      logInfo('诊断成功', {
        clarityPhase: result.clarityPhase,
        dimensionsCount: result.dimensions?.length,
        hasFullReport: !!result.fullReport
      });
      
      return result;
    } catch (parseError) {
      logError('AI 返回内容解析失败', {
        error: parseError,
        content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
        fullContent: content
      });
      throw new Error(`AI 返回的内容格式不正确，无法解析为 JSON: ${parseError}`);
    }
    } catch (fetchError) {
      // 处理 fetch 超时或网络错误
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        logError('请求超时', { timeout: '60秒' });
        throw new Error('诊断请求超时，请稍后重试');
      }
      throw fetchError;
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
      dimensions: [
        {
          name: "服务状态",
          score: 0,
          description: "诊断服务暂时不可用，请稍后重试"
        }
      ],
      fullReport: {
        title: "诊断报告",
        coreStatus: "很抱歉，由于技术问题，我们暂时无法为您提供诊断。",
        coreProblem: "请稍后重试，或检查您的网络连接和服务器配置。",
        actionableExample: {
          title: "下一步操作",
          context: "如果问题持续存在，建议联系技术支持获取帮助。",
          example: "检查服务器是否运行：npm run server",
          constraint: "确保服务器正在运行，API 配置正确。"
        },
        coachingSection: {
          title: "技术支持",
          intro: "当前遇到技术问题，需要技术支持协助。",
          cta: {
            type: "wechat",
            text: "如需技术支持，请联系我们",
            wechatId: "技术支持",
            note: "备注「技术问题」"
          }
        },
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
