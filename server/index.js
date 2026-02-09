import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载项目根目录的 .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// 火山引擎 Ark API 配置
const ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const API_KEY = process.env.DOUBAO_API_KEY;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 豆包 API 代理接口
app.post('/api/doubao', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('📥 收到前端请求');
    
    // 检查环境变量
    if (!API_KEY) {
      console.error('❌ 缺少 API_KEY');
      return res.status(500).json({
        error: 'Server configuration error',
        message: '服务器未配置豆包 API 密钥'
      });
    }
    
    const requestBody = JSON.stringify(req.body);
    console.log('📤 准备调用豆包 API:', {
      model: req.body.model,
      messagesCount: req.body.messages?.length,
      maxTokens: req.body.max_tokens
    });
    
    console.log('🔐 使用 API Key 鉴权');
    
    // 调用豆包 API（添加超时控制和优化的请求头）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时（2分钟）
    
    const response = await fetch(ARK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Connection': 'keep-alive'  // 保持连接以减少握手时间
      },
      body: requestBody,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const elapsed = Date.now() - startTime;
    console.log(`📡 豆包 API 响应: ${response.status} ${response.statusText} (耗时: ${elapsed}ms)`);
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('❌ 豆包 API 错误:', {
        status: response.status,
        body: responseText
      });
      
      return res.status(response.status).json({
        error: 'Doubao API error',
        status: response.status,
        message: responseText
      });
    }
    
    const data = JSON.parse(responseText);
    const totalElapsed = Date.now() - startTime;
    console.log(`✅ 豆包 API 调用成功 (总耗时: ${totalElapsed}ms)`);
    
    res.json(data);
    
  } catch (error) {
    const totalElapsed = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.error(`⏱️ 请求超时 (耗时: ${totalElapsed}ms)`);
      return res.status(504).json({
        error: 'Request timeout',
        message: '豆包 API 请求超时'
      });
    }
    
    console.error(`💥 服务器错误 (耗时: ${totalElapsed}ms):`, error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!API_KEY,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📋 环境变量状态:`);
  console.log(`   - API_KEY: ${API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
});
