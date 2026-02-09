# 豆包 API 配置说明

## 已完成的修改

✅ 已将 AI 分析服务从 Gemini API 切换为火山引擎豆包大模型 API
✅ 保持了原有的函数名、参数和返回结构
✅ 支持图片输入（使用 base64 格式）
✅ 添加了完整的错误处理

## 配置步骤

### 1. 获取豆包 API Key

1. 访问 [火山方舟](https://console.volcengine.com/ark)
2. 注册/登录账号
3. 创建 API Key
4. 复制您的 API Key

### 2. 配置环境变量

在项目根目录的 `.env.local` 文件中，将 `PLACEHOLDER_DOUBAO_API_KEY` 替换为您的实际 API Key：

```bash
VITE_DOUBAO_API_KEY=your_actual_api_key_here
```

### 3. 启动项目

```bash
# 安装依赖（如果还没有安装）
npm install

# 启动开发服务器
npm run dev
```

## API 配置详情

- **API 端点**: `https://ark.cn-beijing.volces.com/api/v3/chat/completions`
- **模型**: `doubao-pro`
- **消息格式**: `{ role, content }` (兼容 OpenAI 格式)
- **图片支持**: 支持 base64 格式的图片输入
- **温度参数**: 0.7
- **最大 tokens**: 4000

## 注意事项

1. **图片格式**: 应用会自动将用户上传的图片转换为 base64 格式发送给 API
2. **错误处理**: 如果 API 请求失败，会返回友好的错误提示，不会破坏应用运行
3. **环境变量**: 必须使用 `VITE_` 前缀，因为这是 Vite 项目
4. **重启服务器**: 修改 `.env.local` 后需要重启开发服务器

## 测试

启动应用后：

1. 点击"开启今日问诊"
2. 上传主页截图（必填）
3. 填写账号信息
4. 点击"开始诊断"
5. 等待 AI 分析结果

如果配置正确，应该能看到诊断结果。如果出现错误，请检查：

- API Key 是否正确配置
- 网络连接是否正常
- 浏览器控制台是否有错误信息

## 与 Gemini 的区别

| 特性 | Gemini API | 豆包 API |
|------|-----------|----------|
| API 格式 | Google 专有格式 | OpenAI 兼容格式 |
| 图片输入 | 支持 | 支持 |
| JSON 输出 | 原生支持 schema | 需要在 prompt 中指定 |
| 环境变量 | `process.env.API_KEY` | `import.meta.env.VITE_DOUBAO_API_KEY` |

## 故障排查

### 问题：API 返回 401 错误
**解决方案**: 检查 API Key 是否正确配置

### 问题：API 返回 404 错误
**解决方案**: 检查 API 端点 URL 是否正确

### 问题：图片无法识别
**解决方案**: 确保图片是 base64 格式，且大小不超过限制

### 问题：返回的 JSON 格式不正确
**解决方案**: 这是正常的，代码会捕获错误并返回友好提示
