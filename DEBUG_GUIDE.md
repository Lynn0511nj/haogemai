# 豆包 API 调试指南

## 新增的错误日志功能

已在 `services/geminiService.ts` 中添加了详细的错误日志输出，帮助快速定位问题。

## 日志类型

### 1. 信息日志（蓝色 ℹ️）

显示正常的执行流程信息：

- **开始诊断**：显示用户输入的基本信息
- **发送请求**：显示 API 请求参数
- **收到响应**：显示 HTTP 响应状态
- **响应数据解析成功**：显示解析后的数据结构
- **AI 返回内容**：显示 AI 返回的内容预览
- **诊断成功**：显示最终结果摘要

### 2. 错误日志（红色 🔴）

显示错误详情：

- **HTTP 请求失败**：显示状态码、响应体
- **响应数据解析失败**：显示原始响应文本
- **响应数据结构异常**：显示缺失的字段
- **AI 返回内容解析失败**：显示无法解析的内容
- **返回数据缺少必需字段**：显示缺失的字段列表
- **诊断过程异常**：显示完整的错误堆栈

## 如何查看日志

### 1. 打开浏览器开发者工具

- **Chrome/Edge**: 按 `F12` 或 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Firefox**: 按 `F12` 或 `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)
- **Safari**: 按 `Cmd+Option+C`

### 2. 切换到 Console 标签

所有日志都会输出到浏览器控制台。

### 3. 触发诊断

在应用中点击"开始诊断"，然后观察控制台输出。

## 日志示例

### 成功的请求流程

```
ℹ️ [豆包 API 信息] 开始诊断
  {
    accountStage: "刚起步的新手",
    mainGoal: "打造个人IP",
    stressPoint: "没流量",
    hasProfileImage: true,
    hasSupplementImage: false,
    apiKey: "sk-abc123..."
  }

ℹ️ [豆包 API 信息] 发送请求
  {
    url: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    model: "doubao-pro",
    temperature: 0.7,
    max_tokens: 4000,
    messagesCount: 2,
    hasImages: true
  }

ℹ️ [豆包 API 信息] 收到响应
  {
    status: 200,
    statusText: "OK",
    ok: true,
    headers: {...}
  }

ℹ️ [豆包 API 信息] 响应数据解析成功
  {
    hasChoices: true,
    choicesLength: 1,
    firstChoice: {
      hasMessage: true,
      messageRole: "assistant",
      contentLength: 2345
    }
  }

ℹ️ [豆包 API 信息] AI 返回内容
  {
    contentLength: 2345,
    contentPreview: "{\"clarityPhase\":\"起步探索期\"..."
  }

ℹ️ [豆包 API 信息] 诊断成功
  {
    clarityPhase: "起步探索期",
    dimensionsCount: 5,
    sevenDayPlanCount: 7
  }
```

### 错误的请求流程

```
🔴 [豆包 API 错误] HTTP 请求失败
  {
    status: 401,
    statusText: "Unauthorized",
    responseBody: "{\"error\":{\"message\":\"Invalid API key\"}}",
    url: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    model: "doubao-pro"
  }

🔴 [豆包 API 错误] 诊断过程异常
  {
    errorType: "Error",
    errorMessage: "API 请求失败 [401]: {\"error\":{\"message\":\"Invalid API key\"}}",
    errorStack: "Error: API 请求失败...",
    context: {
      accountStage: "刚起步的新手",
      mainGoal: "打造个人IP",
      stressPoint: "没流量"
    }
  }
```

## 常见错误及解决方案

### 1. API Key 未配置或错误

**错误日志**:
```
🔴 HTTP 请求失败
  status: 401
  responseBody: "Invalid API key"
```

**解决方案**:
- 检查 `.env.local` 文件中的 `VITE_DOUBAO_API_KEY` 是否正确
- 确保 API Key 没有多余的空格或引号
- 重启开发服务器

### 2. 网络连接问题

**错误日志**:
```
🔴 诊断过程异常
  errorMessage: "Failed to fetch"
```

**解决方案**:
- 检查网络连接
- 确认可以访问火山引擎 API 端点
- 检查防火墙或代理设置

### 3. 模型返回格式错误

**错误日志**:
```
🔴 AI 返回内容解析失败
  content: "这是一段文本而不是 JSON..."
```

**解决方案**:
- 检查 prompt 是否明确要求返回 JSON 格式
- 尝试调整 temperature 参数
- 检查模型是否支持结构化输出

### 4. 响应数据缺少字段

**错误日志**:
```
🔴 返回数据缺少必需字段
  missingFields: ["fullReport", "dimensions"]
```

**解决方案**:
- 检查 AI 返回的数据结构
- 调整 prompt 使其更明确
- 增加 max_tokens 限制

### 5. 图片过大

**错误日志**:
```
🔴 HTTP 请求失败
  status: 413
  responseBody: "Request entity too large"
```

**解决方案**:
- 压缩图片大小
- 降低图片分辨率
- 检查 API 的图片大小限制

## 仅在开发环境启用

日志功能仅在开发环境（`npm run dev`）中启用，生产环境不会输出日志，确保：

- ✅ 不影响生产性能
- ✅ 不泄露敏感信息
- ✅ 保持控制台清洁

## 日志包含的信息

### 请求信息
- API 端点 URL
- 模型名称
- 请求参数（temperature, max_tokens）
- 消息数量
- 是否包含图片

### 响应信息
- HTTP 状态码
- 响应头
- 原始响应体
- 解析后的数据结构

### 错误信息
- 错误类型
- 错误消息
- 完整堆栈跟踪
- 用户上下文信息

### 安全性
- API Key 只显示前 10 个字符
- 敏感信息会被脱敏处理
- 仅在开发环境输出

## 调试技巧

1. **使用 Console 过滤器**
   - 在控制台搜索框输入 `豆包 API` 只显示相关日志

2. **保存日志**
   - 右键点击控制台 → "Save as..." 保存完整日志

3. **清除日志**
   - 点击控制台左上角的 🚫 图标清除旧日志

4. **查看完整对象**
   - 点击日志中的对象可以展开查看完整内容

5. **复制日志**
   - 右键点击日志 → "Copy object" 复制完整数据

## 生产环境

在生产环境（`npm run build`）中：
- 所有日志都会被自动禁用
- 不会影响性能
- 不会暴露敏感信息

## 需要帮助？

如果遇到问题：
1. 查看控制台的完整错误日志
2. 检查上面的常见错误列表
3. 复制错误信息寻求技术支持
