#!/bin/bash

# 快速部署脚本（仅更新代码并重启）
# 使用方法: ./quick-deploy.sh

set -e

echo "⚡ 快速部署到腾讯云服务器..."

SERVER_IP="106.54.18.254"
SERVER_USER="root"

echo "📤 推送代码..."
git add .
git commit -m "快速更新 $(date '+%Y-%m-%d %H:%M:%S')" || echo "没有新的改动"
git push origin main

echo "🔄 更新服务器..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd ~/号个脉
git pull origin main
npm run build
pm2 restart all
pm2 status
ENDSSH

echo "✅ 完成！访问: http://${SERVER_IP}:3000"
