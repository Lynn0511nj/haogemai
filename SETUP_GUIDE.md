# 豆包 API 完整配置指南

## 🎯 问题修复说明

**原问题**：前端直接调用豆包 API 导致 401 Unauthorized 错误

**根本原因**：
- 豆包（火山引擎 Ark）API 不支持前端直连
- 不支持简单的 Bearer Token 鉴权
- 必须使用 AccessKey + SecretKey + HMAC-SHA256 签名
- 只能在服务端调用

**解决方案**：
- ✅ 创建 Node.js 服务端中转层
- ✅ 服务端处理签名和鉴权
- ✅ 前端只调用本地服务端接口

---

## 📁 项目结构

```
号个脉/
├── server/                    # 新增：服务端代理层
│   ├── index.js              # Express 服务器 + 签名逻辑
│   └── package.json          # 服务端依赖
├── services/
│   └── geminiService.ts      # 修改：调用本地服务端
├── .env.local                # 修改：新增 AccessKey/SecretKey
├── package.json              # 修改：新增 server 启动脚本
└── vite-env.d.ts            # 修改：环境变量类型定义
```

---

## 🔧 配置步骤

### 步骤 1：获取豆包 API 密钥

1. 访问 [火山引擎控制台](https://console.volcengine.com/ark)
2. 登录账号
3. 进入「访问控制」→「访问密钥」
4. 创建新的 AccessKey，会得到：
   - **Access Key ID**（类似：AKLT...）
   - **Secret Access Key**（类似：M2Y...，只显示一次，请保存）

### 步骤 2：配置环境变量

编辑项目根目录的 `.env.local` 文件：

```bash
# 豆包 API 配置（服务端使用）
DOUBAO_ACCESS_KEY=你的_Access_Key_ID
DOUBAO_SECRET_KEY=你的_Secret_Access_Key

# 服务器端口（可选，默认 3001）
SERVER_PORT=3001

# 前端 API 地址（Vite 使用）
VITE_API_BASE_URL=http://localhost:3001
```

**重要**：
- ⚠️ 不要将 `.env.local` 提交到 Git
- ⚠️ AccessKey 和 SecretKey 只能在服务端使用
- ⚠️ 前端只能访问 `VITE_` 开头的变量

### 步骤 3：安装服务端依赖

```bash
cd server
npm install
cd ..
```

### 步骤 4：启动服务

**需要同时运行两个服务**：

#### 终端 1：启动服务端
```bash
npm run server
```

你应该看到：
```
🚀 服务器运行在 http://localhost:3001
📋 环境变量状态:
   - ACCESS_KEY: ✅ 已配置
   - SECRET_KEY: ✅ 已配置
```

#### 终端 2：启动前端
```bash
npm run dev
```

你应该看到：
```
VITE v6.4.1  ready in 763 ms
➜  Local:   http://localhost:3000/
```

---

## ✅ 验证步骤

### 1. 检查服务端健康状态

在浏览器访问：
```
http://localhost:3001/api/health
```

应该返回：
```json
{
  "status": "ok",
  "hasAccessKey": true,
  "hasSecretKey": true,
  "timestamp": "2024-..."
}
```

如果 `hasAccessKey` 或 `hasSecretKey` 为 `false`，说明环境变量未正确配置。

### 2. 测试完整流程

1. 打开前端：http://localhost:3000
2. 点击"开启今日问诊"
3. 上传主页截图
4. 填写账号信息
5. 点击"开始诊断"
6. 打开浏览器控制台（F12）

**成功的日志应该是**：
```
ℹ️ [豆包 API 信息] 开始诊断
ℹ️ [豆包 API 信息] 发送请求到服务端
ℹ️ [豆包 API 信息] 收到服务端响应
  status: 200
  ok: true
ℹ️ [豆包 API 信息] 诊断成功
```

**服务端终端应该显示**：
```
📥 收到前端请求
📤 准备调用豆包 API
🔐 签名生成完成
📡 豆包 API 响应: 200 OK
✅ 豆包 API 调用成功
```

### 3. 验证问题已修复

✅ **不再出现 401 Unauthorized 错误**
✅ **不再出现 "Invalid API key" 错误**
✅ **诊断结果页面正常显示**
✅ **不会进入"诊断暂时无法完成"的兜底状态**

---

## 🔍 API 调用链路

```
前端 (浏览器)
  ↓ fetch('http://localhost:3001/api/doubao')
服务端 (Node.js Express)
  ↓ 生成 HMAC-SHA256 签名
  ↓ fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions')
豆包 API (火山引擎)
  ↓ 返回 AI 响应
服务端
  ↓ 转发响应
前端
  ↓ 显示诊断结果
```

---

## 🐛 常见问题排查

### 问题 1：服务端启动失败

**错误**：`Cannot find module 'express'`

**解决**：
```bash
cd server
npm install
```

### 问题 2：环境变量未生效

**错误**：服务端显示 `❌ 未配置`

**解决**：
1. 确认 `.env.local` 在项目根目录
2. 确认变量名正确：`DOUBAO_ACCESS_KEY` 和 `DOUBAO_SECRET_KEY`
3. 重启服务端

### 问题 3：前端无法连接服务端

**错误**：`Failed to fetch` 或 `ERR_CONNECTION_REFUSED`

**解决**：
1. 确认服务端正在运行（终端 1）
2. 确认端口 3001 没有被占用
3. 检查 `.env.local` 中的 `VITE_API_BASE_URL`
4. 重启前端开发服务器

### 问题 4：仍然出现 401 错误

**可能原因**：
1. AccessKey 或 SecretKey 错误
2. 签名算法问题
3. 时间戳不同步

**解决**：
1. 重新检查密钥是否正确
2. 查看服务端终端的详细错误日志
3. 确认系统时间正确

### 问题 5：CORS 错误

**错误**：`Access-Control-Allow-Origin`

**解决**：
服务端已配置 CORS，如果仍有问题：
1. 确认前端访问的是 `http://localhost:3001`
2. 不要使用 IP 地址访问
3. 检查浏览器是否有特殊限制

---

## 📝 环境变量清单

### 服务端使用（.env.local）
- `DOUBAO_ACCESS_KEY` - 火山引擎 Access Key ID（必需）
- `DOUBAO_SECRET_KEY` - 火山引擎 Secret Access Key（必需）
- `SERVER_PORT` - 服务端口（可选，默认 3001）

### 前端使用（.env.local）
- `VITE_API_BASE_URL` - 服务端地址（必需）

---

## 🚀 生产环境部署

### 方式一：同一服务器部署

1. 构建前端：
```bash
npm run build
```

2. 配置 Nginx 反向代理：
```nginx
server {
    listen 80;
    
    # 前端静态文件
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理到 Node 服务
    location /api/ {
        proxy_pass http://localhost:3001;
    }
}
```

3. 使用 PM2 运行服务端：
```bash
cd server
pm2 start index.js --name doubao-server
```

### 方式二：分离部署

1. 前端部署到 CDN/静态托管
2. 服务端部署到云服务器
3. 修改 `.env.local` 中的 `VITE_API_BASE_URL` 为服务端域名

---

## 🔒 安全建议

1. ✅ **永远不要**在前端代码中暴露 AccessKey/SecretKey
2. ✅ **永远不要**将 `.env.local` 提交到 Git
3. ✅ 在生产环境使用 HTTPS
4. ✅ 添加请求频率限制
5. ✅ 添加用户认证机制
6. ✅ 定期轮换 API 密钥

---

## 📞 需要帮助？

如果遇到问题：
1. 查看服务端终端的错误日志
2. 查看浏览器控制台的错误日志
3. 访问 `/api/health` 检查服务状态
4. 参考上面的常见问题排查
