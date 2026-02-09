# 输出结构优化 V3.0

## 核心变化

### 一、输出分为两大部分（一次性生成）

#### Part A：快速诊断结果（Preview）
用户立即可见的核心诊断，包含：
- 账号定性（clarityPhase）
- 核心卡点（phaseInspiration）
- 共情信息（empathyMessage）
- 立即可改进的方向（primaryImprovement）
- 5 个维度评分（dimensions）

#### Part B：完整诊断报告（Full Report）
深度分析和详细建议，包含：
- 整体状态深度解读（statusDeepDive）
- 定位与内容方向拆解（positioningAnalysis）
- 选题能力评估（contentStructure）
- 信任感与专业度评估（trustFactor）
- 避坑提醒（pitfalls）
- 7天行动清单（sevenDayPlan）
- 陪伴总结（closingMessage）

### 二、关键约束

1. **两部分一次性生成**
   - 不要分两次调用 API
   - 必须在一个 JSON 中同时返回 preview 和 fullReport
   - 减少 API 调用次数，提升用户体验

2. **不出现"免费/付费"字样**
   - 用"快速诊断"和"完整报告"等中性词汇
   - 避免商业化气息过重
   - 保持专业和温和的语气

3. **每部分独立可读**
   - Part A 和 Part B 都必须是完整的、可独立阅读的内容
   - 用户只看 Part A 也能获得价值
   - 用户看 Part B 时不需要回看 Part A

4. **避免重复**
   - Part B 不要简单重复 Part A 的内容
   - Part B 应该深化和扩展 Part A 的观点
   - 提供更多细节、示例和执行步骤

## 数据结构

### 用户输入（UserContext）

```typescript
interface UserContext {
  accountStage?: string;      // 账号阶段（选择或自定义）
  mainGoal?: string;          // 创作重心
  stressPoint?: string;       // 当前迷茫点
  profileImage?: string;      // 主页截图（必填，Base64）
  supplementImage?: string;   // 补充截图（选填，Base64）
}
```

### 输出结构（DiagnosisResult）

```typescript
interface DiagnosisResult {
  // ========== Part A：快速诊断结果 ==========
  clarityPhase: string;                    // 账号定性（生动比喻，15字内）
  phaseInspiration: string;                // 核心卡点（一句话指出最致命问题）
  empathyMessage: string;                  // 共情信息（缓解焦虑）
  
  primaryImprovement: {
    title: string;                         // 立即可改进的方向
    whyItMatters: string;                  // 为什么这样改
    actionableStep: string;                // 具体示例
    actionableExample: string;             // 执行提示
  };
  
  dimensions: Array<{
    name: string;                          // 维度名称
    score: number;                         // 分数 (1-10)
    description: string;                   // 具体诊断
  }>;
  
  // ========== Part B：完整诊断报告 ==========
  fullReport: {
    statusDeepDive: string;                // 整体状态深度解读 (200-300字)
    positioningAnalysis: string;           // 定位与内容方向拆解 (200-300字)
    contentStructure: string;              // 选题能力评估 (150-200字)
    trustFactor: string;                   // 信任感与专业度评估 (150-200字)
    pitfalls: string;                      // 避坑提醒 (100-150字)
    
    sevenDayPlan: Array<{
      day: string;                         // 时间段 (如：Day 1-2)
      action: string;                      // 具体行动
      goal: string;                        // 预期目标
    }>;
    
    closingMessage: string;                // 陪伴总结 (100字左右)
  };
}
```

## 内容要求

### Part A：快速诊断（Preview）

#### clarityPhase（账号定性）
- **长度**：15字内
- **要求**：用生动比喻直击现状
- **示例**：
  - ✅ "一辆动力十足但没有方向盘的赛车"
  - ✅ "有货但不会吆喝的小摊贩"
  - ❌ "起步探索期"（太平淡）

#### phaseInspiration（核心卡点）
- **要求**：一句话指出最致命的问题，必须具体
- **格式**：你目前最大的迷茫点在于 [具体问题A] 与 [具体问题B] 的错位
- **示例**：
  - ✅ "算法给你打的标签是生活记录，但你想做的是职场干货"
  - ❌ "定位不够清晰，内容方向分散"（太泛）

#### primaryImprovement（立即可改进的方向）
- **title**：一句话说明改进方向
- **whyItMatters**：爆款逻辑拆解
- **actionableStep**：具体改写示例
- **actionableExample**：执行提示

**示例**：
```json
{
  "title": "优先调整标题结构",
  "whyItMatters": "强化利益钩子「3个月到部门骨干」+ 制造认知差「小白也能做到」+ 真实感「真实复盘」",
  "actionableStep": "原标题「今天的日常」→ 优化后「3个月从职场小白到部门骨干的真实复盘」",
  "actionableExample": "标题格式：[时间周期] + [身份转变] + [内容类型]，让用户一眼看出能获得什么"
}
```

#### dimensions（维度评分）
每个维度必须：
- 给出具体分数 (1-10)
- 指出具体问题（不能说"需要优化"）
- 说明是否常见或给出匹配得分

**示例**：
```json
{
  "name": "定位清晰度",
  "score": 6,
  "description": "算法目前给你的标签是 [生活记录] 和 [日常分享]，但这与你想做的 [职场干货] 存在偏离，导致推送给的都是泛娱乐用户，而非你的目标人群（当前定位清晰度 35%，建议目标 80%+）"
}
```

### Part B：完整诊断报告（Full Report）

#### statusDeepDive（整体状态深度解读）
- **长度**：200-300字
- **要求**：深入分析账号现状、问题根源、影响范围
- **注意**：不要重复 Part A 的内容，而是深化和扩展

**示例**：
```
从你的主页可以看出，你在内容方向上做了很多尝试——既有职场经验分享，也有日常生活记录，还有一些情感感悟。这种探索精神是好的，说明你在积极寻找适合自己的方向。

但问题在于，算法无法判断你到底是谁、想做什么。它看到的是：这个账号一会儿发职场干货，一会儿发生活vlog，一会儿又发心情感悟。结果就是，算法给你打的标签非常分散，推送给你的用户也很杂。

具体表现在：你的粉丝画像可能包括职场新人、生活博主的粉丝、情感类内容的受众，但这些人群的需求完全不同。职场新人想要的是可复用的方法论，生活博主的粉丝想看的是精致的日常，情感类受众想要的是共鸣和治愈。你很难同时满足这三类人的需求。
```

#### positioningAnalysis（定位与内容方向拆解）
- **长度**：200-300字
- **要求**：详细分析定位问题、算法标签、目标人群错位、如何调整
- **必须**：给出具体的调整路径（第一步...第二步...第三步...）

#### contentStructure（选题能力评估）
- **长度**：150-200字
- **要求**：分析选题方向、内容结构、价值密度
- **必须**：指出具体的选题问题 + 给出 2-3 个选题示例

#### trustFactor（信任感与专业度评估）
- **长度**：150-200字
- **要求**：分析简介、人设、专业度塑造
- **必须**：指出具体的信任感缺失点 + 给出改进建议和示例

#### pitfalls（避坑提醒）
- **长度**：100-150字
- **要求**：指出当前阶段最容易踩的 2-3 个坑
- **必须**：每个坑都要具体说明为什么是坑、如何避免

#### sevenDayPlan（7天行动清单）
- **要求**：3-5 个具体行动项
- **格式**：每项包含时间段、具体行动、预期目标
- **必须**：行动必须具体可执行，不能是"优化内容"这种空话

**示例**：
```json
[
  {
    "day": "Day 1-2",
    "action": "调整账号简介和头像，明确身份标签",
    "goal": "让新访客 3 秒内知道你是谁、做什么的"
  },
  {
    "day": "Day 3-4",
    "action": "梳理过往内容，删除或隐藏与定位不符的笔记",
    "goal": "让主页呈现统一的内容风格，强化算法标签"
  },
  {
    "day": "Day 5-7",
    "action": "发布 2-3 篇符合新定位的内容，使用优化后的标题结构",
    "goal": "测试新方向的数据反馈，验证定位调整是否有效"
  }
]
```

#### closingMessage（陪伴总结）
- **长度**：100字左右
- **要求**：温和鼓励，强调「慢慢来，比较快」的理念
- **必须**：说明这份完整报告的价值 + 引导深度服务（但不能出现"付费"字样）

**示例**：
```
账号的成长不是一蹴而就的，每一次调整都需要时间去验证。这份完整报告为你提供了详细的执行方案和 7 天行动清单，按照这个节奏去做，你会看到明显的改善。

如果你在执行过程中遇到困难，或想要更深入的指导（包括信任感深度诊断、变现路径图、私域链路设计等），可以考虑一对一陪跑服务。我们会根据你的具体情况，提供持续的反馈和修正。

慢慢来，比较快。
```

## 技术实现

### API 调用优化

```typescript
// 增加 max_tokens 以支持更长的输出
const requestBody = {
  model: 'doubao-seed-1-8-251228',
  messages,
  temperature: 0.7,
  max_tokens: 6000  // 从 4000 增加到 6000
};
```

### 用户提示优化

```typescript
const userContentParts = [
  {
    type: 'text',
    text: `【用户信息】
    - 阶段：${context.accountStage || '未指定'}
    - 重心：${context.mainGoal || '未指定'}
    - 焦虑点：${context.stressPoint || '未指定'}
    
    请基于以上信息和提供的截图进行深度诊断分析，一次性生成快速诊断和完整报告两部分内容。`
  }
];
```

## 用户体验优化

### 1. 减少等待时间
- 一次性生成两部分内容，避免二次加载
- 用户可以先看 Part A，Part B 作为"解锁"内容

### 2. 降低商业化气息
- 不出现"免费"、"付费"等字样
- 用"快速诊断"和"完整报告"等中性词汇
- 自然引导而非强制推销

### 3. 提升内容价值
- Part A 提供立即可用的建议
- Part B 提供完整的执行方案
- 两部分都有独立价值，不互相依赖

### 4. 保持一致性
- 两部分语气一致
- 两部分风格一致
- 避免 Part B 简单重复 Part A

## 测试检查清单

- [ ] AI 是否一次性返回了 preview 和 fullReport？
- [ ] 是否没有出现"免费"、"付费"等字样？
- [ ] Part A 是否独立可读？
- [ ] Part B 是否独立可读？
- [ ] Part B 是否深化了 Part A 的内容（而非简单重复）？
- [ ] clarityPhase 是否用了生动比喻？
- [ ] phaseInspiration 是否指出了具体的错位问题？
- [ ] primaryImprovement 是否给出了具体的改写示例？
- [ ] dimensions 的 description 是否具体指出了问题？
- [ ] fullReport 的每个字段是否达到了字数要求？
- [ ] sevenDayPlan 的行动是否具体可执行？
- [ ] closingMessage 是否温和引导（而非强制推销）？

## 实施状态

✅ 已更新 `services/geminiService.ts`
✅ 优化输出结构为两部分（一次性生成）
✅ 移除"免费/付费"字样
✅ 增加 max_tokens 到 6000
✅ 优化用户提示，明确要求一次性生成
✅ 保持向后兼容性

## 备份

原文件已备份到 `services/geminiService_backup.ts`
