# 腾讯云服务器部署指南

## 服务器信息
- IP: 106.54.18.254
- 需要开放端口: 3000 (前端), 3001 (后端)

## 部署步骤

### 1. 连接到服务器
```bash
ssh root@106.54.18.254
# 或使用你的用户名
ssh ubuntu@106.54.18.254
```

### 2. 在服务器上安装 Node.js（如果未安装）
```bash
# 使用 nvm 安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 或使用 apt（Ubuntu/Debian）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. 上传代码到服务器

#### 方法 A: 使用 Git（推荐）
```bash
# 在服务器上
cd ~
git clone https://github.com/你的用户名/号个脉.git
cd 号个脉
```

#### 方法 B: 使用 scp 上传
```bash
# 在本地 Mac 上执行
cd /Users/lynn/Documents/号个脉
tar -czf app.tar.gz --exclude=node_modules --exclude=.git --exclude=dist .
scp app.tar.gz root@106.54.18.254:~/

# 在服务器上解压
ssh root@106.54.18.254
mkdir -p ~/号个脉
cd ~/号个脉
tar -xzf ~/app.tar.gz
```

### 4. 在服务器上配置环境变量
```bash
# 在服务器上创建 .env.local
cd ~/号个脉
cat > .env.local << 'EOF'
GEMINI_API_KEY=PLACEHOLDER_API_KEY
DOUBAO_API_KEY=ca14e372-ae2e-4b85-987b-2d88281d81e1
SERVER_PORT=3001
EOF
```

### 5. 安装依赖
```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 6. 构建前端
```bash
npm run build
```

### 7. 使用 PM2 启动服务（推荐）

#### 安装 PM2
```bash
npm install -g pm2
```

#### 创建 PM2 配置文件
在服务器上创建 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [
    {
      name: 'backend',
      script: './server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'frontend',
      script: 'npx',
      args: 'serve -s dist -l 3000',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

#### 启动服务
```bash
# 安装 serve（用于提供静态文件）
npm install -g serve

# 启动所有服务
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 设置开机自启
pm2 startup
pm2 save
```

### 8. 配置腾讯云安全组

在腾讯云控制台：
1. 进入 "云服务器" → "安全组"
2. 添加入站规则：
   - 端口 3000 (TCP)
   - 端口 3001 (TCP)
   - 来源：0.0.0.0/0（允许所有 IP）

### 9. 访问应用
```
http://106.54.18.254:3000
```

## 常用命令

### PM2 管理
```bash
pm2 list              # 查看所有进程
pm2 restart all       # 重启所有服务
pm2 stop all          # 停止所有服务
pm2 logs              # 查看日志
pm2 logs backend      # 查看后端日志
pm2 logs frontend     # 查看前端日志
```

### 更新代码
```bash
cd ~/号个脉
git pull              # 拉取最新代码
npm install           # 更新依赖
npm run build         # 重新构建
pm2 restart all       # 重启服务
```

## 故障排查

### 检查端口是否监听
```bash
netstat -tlnp | grep -E "3000|3001"
```

### 检查防火墙
```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 3000
sudo ufw allow 3001

# CentOS/RHEL
sudo firewall-cmd --list-all
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --add-port=3001/tcp --permanent
sudo firewall-cmd --reload
```

### 查看服务日志
```bash
pm2 logs
```
