# 🚀 快速启动指南

## ✅ 当前状态

- ✅ 服务端代码已创建
- ✅ 前端代码已修改
- ✅ 服务端依赖已安装
- ✅ 服务端已启动（端口 3001）
- ⚠️ 需要配置豆包 API 密钥

---

## 📝 立即配置（3 步）

### 步骤 1：获取豆包 API 密钥

访问：https://console.volcengine.com/ark

获取：
- Access Key ID
- Secret Access Key

### 步骤 2：配置环境变量

编辑项目根目录的 `.env.local` 文件，替换以下内容：

```bash
# 豆包 API 配置（服务端使用）
DOUBAO_ACCESS_KEY=你的_Access_Key_ID_这里
DOUBAO_SECRET_KEY=你的_Secret_Access_Key_这里

# 服务器端口
SERVER_PORT=3001

# 前端 API 地址（Vite 使用）
VITE_API_BASE_URL=http://localhost:3001
```

### 步骤 3：重启服务

#### 终端 1：重启服务端
```bash
# 停止当前服务端（如果正在运行）
# 按 Ctrl+C

# 重新启动
npm run server
```

应该看到：
```
🚀 服务器运行在 http://localhost:3001
📋 环境变量状态:
   - ACCESS_KEY: ✅ 已配置
   - SECRET_KEY: ✅ 已配置
```

#### 终端 2：重启前端
```bash
# 停止当前前端（如果正在运行）
# 按 Ctrl+C

# 重新启动
npm run dev
```

---

## 🧪 验证

### 1. 检查服务端健康

浏览器访问：http://localhost:3001/api/health

应该返回：
```json
{
  "status": "ok",
  "hasAccessKey": true,
  "hasSecretKey": true,
  "timestamp": "..."
}
```

### 2. 测试完整流程

1. 打开：http://localhost:3000
2. 点击"开启今日问诊"
3. 上传截图
4. 填写信息
5. 点击"开始诊断"
6. 查看结果

### 3. 查看日志

**浏览器控制台（F12）**：
```
ℹ️ [豆包 API 信息] 开始诊断
ℹ️ [豆包 API 信息] 发送请求到服务端
ℹ️ [豆包 API 信息] 收到服务端响应
  status: 200
```

**服务端终端**：
```
📥 收到前端请求
📤 准备调用豆包 API
🔐 签名生成完成
📡 豆包 API 响应: 200 OK
✅ 豆包 API 调用成功
```

---

## ✅ 验收标准

- [x] 服务端成功启动在 3001 端口
- [x] 前端成功启动在 3000 端口
- [ ] 环境变量配置完成（ACCESS_KEY 和 SECRET_KEY）
- [ ] `/api/health` 返回 `hasAccessKey: true`
- [ ] 诊断功能不再出现 401 错误
- [ ] 诊断结果正常显示

---

## 🎯 架构说明

```
┌─────────────────┐
│   浏览器前端     │  http://localhost:3000
│  (React + Vite) │
└────────┬────────┘
         │ fetch('/api/doubao')
         ↓
┌─────────────────┐
│  Node.js 服务端  │  http://localhost:3001
│    (Express)    │
└────────┬────────┘
         │ HMAC-SHA256 签名
         ↓
┌─────────────────┐
│   豆包 API      │  https://ark.cn-beijing.volces.com
│  (火山引擎)      │
└─────────────────┘
```

**关键点**：
- ❌ 前端不再直接调用豆包 API
- ✅ 前端只调用本地服务端 `/api/doubao`
- ✅ 服务端处理签名和鉴权
- ✅ AccessKey/SecretKey 只在服务端使用

---

## 📂 文件变更清单

### 新增文件
- `server/index.js` - Express 服务器 + 签名逻辑
- `server/package.json` - 服务端依赖配置
- `SETUP_GUIDE.md` - 完整配置文档
- `QUICK_START.md` - 本文件

### 修改文件
- `services/geminiService.ts` - 改为调用本地服务端
- `.env.local` - 新增 AccessKey/SecretKey 配置
- `vite-env.d.ts` - 更新环境变量类型
- `package.json` - 新增 server 启动脚本

---

## 🆘 遇到问题？

### 问题：服务端显示"未配置"

**解决**：
1. 检查 `.env.local` 文件是否在项目根目录
2. 检查变量名是否正确：`DOUBAO_ACCESS_KEY` 和 `DOUBAO_SECRET_KEY`
3. 重启服务端

### 问题：前端无法连接服务端

**解决**：
1. 确认服务端正在运行（终端 1）
2. 访问 http://localhost:3001/api/health 测试
3. 检查端口 3001 是否被占用

### 问题：仍然出现 401 错误

**解决**：
1. 确认 AccessKey 和 SecretKey 正确
2. 查看服务端终端的错误日志
3. 确认系统时间正确

---

## 📚 更多文档

- `SETUP_GUIDE.md` - 完整配置和部署指南
- `DEBUG_GUIDE.md` - 调试和日志说明
- `DOUBAO_API_SETUP.md` - 原始 API 配置文档（已过时）

---

**现在就开始配置吧！** 🎉
