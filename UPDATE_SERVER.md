# 服务器更新步骤

## 快速更新命令（复制粘贴到终端）

### 步骤 1: 登录服务器
```bash
ssh root@106.54.18.254
```

### 步骤 2: 更新代码（在服务器上执行）
```bash
cd ~/号个脉 && \
git pull origin main && \
npm install && \
npm run build && \
pm2 restart all && \
pm2 status
```

### 步骤 3: 验证服务
访问: http://106.54.18.254:3000

---

## 如果遇到问题

### 检查服务状态
```bash
pm2 status
pm2 logs
```

### 手动重启
```bash
pm2 restart all
```

### 查看端口占用
```bash
netstat -tlnp | grep -E "3000|3001"
```

### 如果项目目录不存在
```bash
cd ~
git clone https://github.com/Lynn0511nj/haogemai.git 号个脉
cd 号个脉
npm install
cd server && npm install && cd ..
npm run build
pm2 start ecosystem.config.js
```

---

## 一键复制命令

**完整更新命令（一次性执行）：**
```bash
ssh root@106.54.18.254 "cd ~/号个脉 && git pull origin main && npm install && npm run build && pm2 restart all && pm2 status"
```

这个命令会：
1. 连接到服务器
2. 进入项目目录
3. 拉取最新代码
4. 安装依赖
5. 重新构建
6. 重启服务
7. 显示服务状态
