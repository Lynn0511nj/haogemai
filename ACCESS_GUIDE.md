# 访问指南

## 🎯 当前运行状态

✅ **后端服务器**：http://localhost:3001
- 健康检查：http://localhost:3001/api/health
- 豆包 API 代理：http://localhost:3001/api/doubao
- API Key 状态：已配置

✅ **前端应用**：http://localhost:3000
- 本地访问：http://localhost:3000/
- 网络访问：http://10.64.16.20:3000/

## 🚀 启动命令

### 方式一：分别启动（推荐）

```bash
# 终端 1：启动后端服务器
npm run server

# 终端 2：启动前端开发服务器
npm run dev
```

### 方式二：使用 Kiro 启动

后端和前端服务器已通过 Kiro 的 `controlBashProcess` 工具启动，会在后台持续运行。

## 🔍 检查服务状态

```bash
# 检查后端健康状态
curl http://localhost:3001/api/health

# 检查端口占用
lsof -ti:3001  # 后端
lsof -ti:3000  # 前端（Vite 默认 5173，但当前使用 3000）
```

## 🛠️ 故障排查

### 问题：无法访问后端 API

1. 检查服务器是否运行：
   ```bash
   curl http://localhost:3001/api/health
   ```

2. 检查环境变量：
   ```bash
   cat .env.local | grep DOUBAO_API_KEY
   ```

3. 重启后端服务器：
   ```bash
   # 停止现有进程
   lsof -ti:3001 | xargs kill -9
   
   # 重新启动
   npm run server
   ```

### 问题：前端无法连接后端

1. 检查 `.env.local` 中的 `VITE_API_BASE_URL`：
   ```
   VITE_API_BASE_URL=http://localhost:3001
   ```

2. 检查 `services/geminiService.ts` 中的 API 地址配置

3. 重启前端服务器（环境变量更改后需要重启）

## 📝 开发模式

当前已启用开发模式，可以：
- 绕过 24 小时诊断限制
- 查看详细的控制台日志
- 使用模拟支付功能

## 🔗 相关文档

- [快速开始](./QUICK_START.md)
- [设置指南](./SETUP_GUIDE.md)
- [调试指南](./DEBUG_GUIDE.md)
- [开发模式说明](./DEV_MODE.md)
