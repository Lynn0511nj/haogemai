# Prompt 架构说明

## 整体架构

系统使用**两个完全独立的 Prompt**，实现免费版和付费版的功能分离。

```
┌─────────────────────────────────────────────────────────┐
│                    用户上传截图                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Prompt A: 极速初判   │
         │   (免费版，10秒内)     │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   展示快速诊断结果     │
         │   - 账号定性           │
         │   - 核心卡点           │
         │   - 维度评分           │
         │   - 1个具体示例        │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   用户选择付费解锁     │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Prompt B: 完整诊断   │
         │   (付费版，深度分析)   │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   展示完整诊断报告     │
         │   - 深度定性           │
         │   - 核心矛盾           │
         │   - 可实操示例         │
         │   - 算法视角           │
         │   - 7天行动清单        │
         │   - 1对1陪跑引导       │
         └───────────────────────┘
```

## Prompt A: 极速初判（免费版）

### 文件位置
`services/promptA_quickDiagnosis.ts`

### 特点
- ⚡ **速度**: 10秒内完成
- 🎯 **目标**: 快速建立"被看懂感"
- 📦 **输出**: 核心诊断 + 1个具体示例
- 🚫 **限制**: 不提供完整方案

### 输出内容
```typescript
{
  clarityPhase: "账号定性（生动比喻）",
  phaseInspiration: "核心卡点（具体问题）",
  empathyMessage: "共情信息",
  primaryImprovement: {
    title: "立即可改进的方向",
    whyItMatters: "为什么这样改",
    actionableStep: "具体示例",
    actionableExample: "执行提示"
  },
  dimensions: [
    { name: "定位清晰度", score: 7, description: "..." },
    { name: "内容价值", score: 6, description: "..." },
    // ... 5个维度
  ]
}
```

### 调用方式
```typescript
import { quickDiagnosis } from './services/diagnosisService';

const result = await quickDiagnosis(context);
```

## Prompt B: 完整深度诊断（付费版）

### 文件位置
`services/promptB_fullDiagnosis.ts`

### 特点
- 🔬 **深度**: 多模态深度分析
- 📋 **完整**: 提供完整执行方案
- 📅 **行动**: 7天详细行动清单
- 🤝 **转化**: 1对1陪跑引导

### 输出内容
```typescript
{
  title: "你的完整账号诊断报告",
  coreStatus: "一句话定性（强断言）",
  coreProblem: "核心矛盾诊断",
  actionableExample: {
    title: "下一步，你可以这样试一次",
    context: "背景说明",
    example: "可直接模仿的示例",
    constraint: "执行限制"
  },
  algorithmPerspective: "算法眼中的你",
  coachingSection: {
    title: "1 对 1 陪跑：把判断真正变成结果",
    intro: "陪跑说明",
    cta: {
      type: "wechat",
      text: "添加微信，进入1对1账号陪跑",
      wechatId: "haogm2025",
      note: "备注「账号诊断」即可"
    }
  },
  sevenDayPlan: [
    { day: "Day 1-2", action: "具体行动", goal: "预期目标" },
    { day: "Day 3-4", action: "具体行动", goal: "预期目标" },
    { day: "Day 5-7", action: "具体行动", goal: "预期目标" }
  ],
  closingMessage: "陪伴总结"
}
```

### 调用方式
```typescript
import { fullDiagnosis } from './services/diagnosisService';

const fullReport = await fullDiagnosis(context);
```

## 关键原则

### ⚠️ 完全隔离
- Prompt A **绝不能**调用 Prompt B 的任何能力
- 两者逻辑**必须完全独立**
- 不能在 Prompt A 中提及完整报告的具体内容

### 🎯 各司其职
- **Prompt A**: 快速判断 + 建立信任 + 引导付费
- **Prompt B**: 深度分析 + 完整方案 + 转化陪跑

### 💰 付费触发
- 用户点击"解锁查看我的账号调整方案（￥29.9）"
- 模拟支付成功后，触发 Prompt B
- 加载完整报告并展示

## 代码结构

```
services/
├── diagnosisService.ts          # 统一服务入口
├── promptA_quickDiagnosis.ts    # Prompt A 定义
├── promptB_fullDiagnosis.ts     # Prompt B 定义
└── geminiService.ts             # 旧版本（已废弃）

types.ts                          # 类型定义
├── UserContext                   # 用户输入
├── DiagnosisResult              # 快速诊断结果
└── FullReport                   # 完整报告结果
```

## 使用流程

### 1. 初次诊断（免费）
```typescript
// App.tsx - handleSubmit
const data = await diagnoseAccount(context);  // 调用 Prompt A
setResult(data);  // fullReport 为 undefined
setStep(AppStep.RESULT);
```

### 2. 付费解锁（完整报告）
```typescript
// App.tsx - handleUnlockFullReport
const fullReport = await fullDiagnosis(context);  // 调用 Prompt B
setResult({
  ...result,
  fullReport  // 添加完整报告
});
setIsUnlocked(true);
setStep(AppStep.FULL_REPORT);
```

## 性能优化

### Prompt A（极速）
- 使用轻量模型
- 限制输出长度
- 10秒内完成

### Prompt B（深度）
- 可使用更强大的模型
- 允许更长的分析时间
- 提供更详细的内容

## 测试建议

### 测试 Prompt A
1. 上传截图
2. 填写基本信息
3. 点击"开始诊断"
4. 验证快速诊断结果
5. 确认不包含完整报告内容

### 测试 Prompt B
1. 完成 Prompt A 诊断
2. 点击"解锁查看我的账号调整方案"
3. 模拟支付成功
4. 验证完整报告加载
5. 确认包含所有深度内容

## 注意事项

1. **不要混淆**: Prompt A 和 Prompt B 是完全独立的
2. **不要泄露**: Prompt A 不能透露 Prompt B 的具体内容
3. **保持一致**: 两个 Prompt 的语气和风格应该一致
4. **明确价值**: 让用户清楚付费后能获得什么
