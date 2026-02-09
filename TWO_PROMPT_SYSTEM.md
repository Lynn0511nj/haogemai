# 双 Prompt 系统完整说明

## 系统架构

```
用户上传截图
     ↓
┌─────────────────────────────────────┐
│  Prompt A: 极速初判（免费，10秒）    │
│  - 快速下判断                        │
│  - 200字以内                         │
│  - 只判断一个核心问题                │
│  - 留悬念引导付费                    │
└─────────────────────────────────────┘
     ↓
展示快速诊断结果
     ↓
用户选择付费解锁（￥29.9）
     ↓
┌─────────────────────────────────────┐
│  Prompt B: 完整诊断（付费，深度）    │
│  - 给方法、给例子、给清单            │
│  - 可执行、不过载                    │
│  - 7天独立行动清单                   │
│  - 对标案例启发                      │
└─────────────────────────────────────┘
     ↓
展示完整诊断报告
```

## Prompt A: 极速初判（免费版）

### 定位
**自媒体账号极速诊断助手**

### 核心目标
- ⚡ 10秒内完成
- 📝 200字以内
- 🎯 快速下判断，不写长文
- 🔍 只判断一个核心问题

### 输出内容
1. **当前阶段判断**（15字内）
   - 新手探索期
   - 内容已产出但方向不稳
   - 有流量但难以沉淀
   - 明显遇到增长瓶颈
   - 记录型账号

2. **核心卡点结论**（断言式）
   - 格式："你目前最大的卡点不是【A】，而是【B】"
   - 必须是单一结论

3. **判断依据**（80字内）
   - 使用「因为……所以……」句式
   - 1-2条依据
   - 不使用专业术语

4. **未展开的诊断维度**
   - 列出2-3个深层维度
   - 制造悬念
   - 引导付费

5. **维度评分**
   - 5个维度：定位清晰度、内容价值、表达清晰度、信任感、更新节奏
   - 每个维度简短判断（10字内）

### 语气特点
- 笃定
- 克制
- 不安抚、不推销
- 像一个已经看过很多账号的人

### 文件位置
- `services/promptA_quickDiagnosis.ts`
- `PROMPT_A_UPDATE.md`

## Prompt B: 完整深度诊断（付费版）

### 定位
**自媒体账号深度陪跑诊断师**

### 核心目标
- 🎯 给方法、给例子、给清单
- 💰 让人觉得钱花对了
- 🚀 每个结论都能转化为行动
- 🎓 不追求全面，只解决最关键问题

### 输出内容

#### 1. 一句话总判断（≤20字）
- 概括账号当前状态
- 示例："内容有价值但缺少稳定标签"

#### 2. 核心矛盾拆解（≤100字）
- 当前最优先解决的问题
- 为什么不先解决其他问题
- 示例："你目前最优先解决的是「账号标签混乱」，而不是内容质量。因为算法需要先判断你是谁，才能决定推给谁。"

#### 3. 对标案例启发（≤80字）
- 同类型账号的常见做法
- 重点放在「怎么改」
- 示例："同类型账号通常会在简介中明确「身份+领域+价值」，然后前10条内容只讲一个方向。"

#### 4. 下一步可执行操作
- **今天可以做的**: 具体、低门槛、可马上执行
- **本周可以完成的**: 具体行动
- **容易被忽略但很关键的点**: 避坑指南

#### 5. 算法眼中的你（≤60字）
- 用算法视角描述关键现象
- 展示专业能力

#### 6. 7天优化行动清单
- Day 1 – Day 7，每天独立任务
- 格式：一句话任务 + 预期结果
- 不解释原理，只给行动

#### 7. 留白与陪跑引导（≤80字）
- 说明哪些问题适合在 1 对 1 中拆解
- 强调"持续校准，而不是一次建议"
- 不推销，只说明价值

### 语气特点
- 冷静、有经验
- 像一个在旁边看你实操的人
- 不夸张、不制造焦虑

### 文件位置
- `services/promptB_fullDiagnosis.ts`
- `PROMPT_B_UPDATE.md`

## 关键原则

### ⚠️ 完全隔离
- Prompt A **绝不能**调用 Prompt B 的任何能力
- 两者逻辑**必须完全独立**
- Prompt A 不能透露 Prompt B 的具体内容

### 🎯 各司其职
| 维度 | Prompt A | Prompt B |
|------|----------|----------|
| 速度 | 10秒内 | 不限 |
| 长度 | 200字内 | 完整方案 |
| 深度 | 快速判断 | 深度分析 |
| 目标 | 建立信任 | 提供价值 |
| 转化 | 引导付费 | 引导陪跑 |

### 💰 付费触发
1. 用户点击"解锁查看我的账号调整方案（￥29.9）"
2. 模拟支付成功
3. 触发 Prompt B
4. 加载完整报告

## 技术实现

### 服务层
```typescript
// services/diagnosisService.ts

// Prompt A: 极速初判
export async function quickDiagnosis(context: UserContext): Promise<Partial<DiagnosisResult>>

// Prompt B: 完整诊断
export async function fullDiagnosis(context: UserContext): Promise<FullReport>

// 兼容旧版本
export async function diagnoseAccount(context: UserContext): Promise<DiagnosisResult>
```

### 类型定义
```typescript
// types.ts

export interface DiagnosisResult {
  clarityPhase: string;
  phaseInspiration: string;
  empathyMessage: string;
  primaryImprovement: { ... };
  dimensions: DimensionScore[];
  fullReport?: FullReport;  // 付费后才有
}

export interface FullReport {
  title: string;
  coreStatus: string;
  coreProblem: string;
  benchmarkInsight?: string;  // 新增
  actionableExample: { ... };
  algorithmPerspective: string;
  coachingSection: { ... };
  sevenDayPlan: { ... }[];
  closingMessage: string;
}
```

### UI 流程
```typescript
// App.tsx

// 1. 初次诊断（免费）
const handleSubmit = async () => {
  const data = await diagnoseAccount(context);  // 调用 Prompt A
  setResult(data);  // fullReport 为 undefined
  setStep(AppStep.RESULT);
}

// 2. 付费解锁（完整报告）
const handleUnlockFullReport = async () => {
  const fullReport = await fullDiagnosis(context);  // 调用 Prompt B
  setResult({ ...result, fullReport });
  setIsUnlocked(true);
  setStep(AppStep.FULL_REPORT);
}
```

## 性能对比

| 指标 | Prompt A | Prompt B |
|------|----------|----------|
| 响应时间 | 10秒内 | 30-60秒 |
| Token 使用 | 500-800 | 2000-3000 |
| 输出长度 | 200字 | 800-1200字 |
| 成本 | 低 | 中 |

## 用户体验

### Prompt A（免费版）
**用户感受**:
- "这个诊断很快！"
- "说得挺准的"
- "想看完整的方案"

**转化点**:
- 未展开的诊断维度（悬念）
- 明确的付费价值说明
- 低价格（￥29.9）

### Prompt B（付费版）
**用户感受**:
- "这个我能做！"
- "原来可以这样"
- "钱花对了"

**价值点**:
- 对标案例（降低门槛）
- 可执行操作（今天就能做）
- 7天清单（明确路径）
- 留白引导（持续价值）

## 测试清单

### Prompt A 测试
- [ ] 10秒内返回结果
- [ ] 输出在200字以内
- [ ] 断言式结论清晰
- [ ] 判断依据合理
- [ ] 未展开维度有吸引力
- [ ] 不包含 Prompt B 的内容

### Prompt B 测试
- [ ] 每个建议都可执行
- [ ] 门槛足够低
- [ ] 对标案例有启发
- [ ] 7天清单完整
- [ ] 留白引导自然
- [ ] 用户觉得"钱花对了"

### 整体流程测试
- [ ] 免费诊断流畅
- [ ] 付费流程顺畅
- [ ] 完整报告加载正常
- [ ] 两个 Prompt 完全隔离
- [ ] 转化引导自然

## 优化建议

### 短期优化
1. 根据用户反馈调整 Prompt A 的悬念设置
2. 优化 Prompt B 的可执行性
3. 测试不同价格点的转化率

### 长期优化
1. 根据数据分析优化两个 Prompt 的内容
2. A/B 测试不同的输出格式
3. 增加更多对标案例库
4. 优化 7 天清单的个性化程度

## 文档索引

- `PROMPT_ARCHITECTURE.md` - 整体架构说明
- `PROMPT_A_UPDATE.md` - Prompt A 详细说明
- `PROMPT_B_UPDATE.md` - Prompt B 详细说明
- `TWO_PROMPT_SYSTEM.md` - 本文档（总体说明）
- `services/promptA_quickDiagnosis.ts` - Prompt A 实现
- `services/promptB_fullDiagnosis.ts` - Prompt B 实现
- `services/diagnosisService.ts` - 统一服务入口
