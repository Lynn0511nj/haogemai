#!/bin/bash

# 腾讯云服务器部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署到腾讯云服务器..."

# 服务器配置
SERVER_IP="106.54.18.254"
SERVER_USER="root"  # 如果不是 root，请修改为你的用户名
PROJECT_PATH="~/号个脉"  # 服务器上的项目路径，根据实际情况修改

echo "📦 步骤 1/5: 本地构建..."
npm run build

echo "✅ 构建完成"

echo "📤 步骤 2/5: 推送代码到 GitHub..."
git add .
git commit -m "部署更新 $(date '+%Y-%m-%d %H:%M:%S')" || echo "没有新的改动需要提交"
git push origin main

echo "✅ 代码已推送"

echo "🔄 步骤 3/5: 连接服务器并拉取最新代码..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd ~/号个脉 || { echo "❌ 项目目录不存在"; exit 1; }

echo "📥 拉取最新代码..."
git pull origin main

echo "📦 安装/更新依赖..."
npm install --production

echo "🔨 重新构建前端..."
npm run build

echo "🔄 重启服务..."
if command -v pm2 &> /dev/null; then
    pm2 restart all || pm2 start ecosystem.config.js
    echo "✅ PM2 服务已重启"
else
    echo "⚠️  未检测到 PM2，请手动重启服务"
fi

echo "📊 服务状态:"
if command -v pm2 &> /dev/null; then
    pm2 status
fi

ENDSSH

echo "✅ 步骤 4/5: 服务器更新完成"

echo "🧪 步骤 5/5: 测试服务..."
sleep 3

# 测试后端
if curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}:3001 | grep -q "200\|404"; then
    echo "✅ 后端服务正常 (端口 3001)"
else
    echo "⚠️  后端服务可能未启动"
fi

# 测试前端
if curl -s -o /dev/null -w "%{http_code}" http://${SERVER_IP}:3000 | grep -q "200"; then
    echo "✅ 前端服务正常 (端口 3000)"
else
    echo "⚠️  前端服务可能未启动"
fi

echo ""
echo "🎉 部署完成！"
echo "📱 访问地址: http://${SERVER_IP}:3000"
echo ""
echo "💡 提示:"
echo "   - 查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs'"
echo "   - 查看状态: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 status'"
