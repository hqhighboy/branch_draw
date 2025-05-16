/**
 * AI集成路由
 * 
 * 此模块提供了与AI服务交互的API路由
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const aiService = require('../ai-service');
const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

/**
 * 获取AI配置
 * GET /api/ai/config
 */
router.get('/config', (req, res) => {
  try {
    const config = aiService.loadConfig();
    
    // 不返回API密钥
    const safeConfig = {
      ...config,
      apiKey: config.apiKey ? '********' : ''
    };
    
    res.json({
      success: true,
      config: safeConfig
    });
  } catch (error) {
    console.error('获取AI配置失败:', error);
    res.status(500).json({
      success: false,
      message: `获取AI配置失败: ${error.message}`
    });
  }
});

/**
 * 保存AI配置
 * POST /api/ai/config
 */
router.post('/config', (req, res) => {
  try {
    const { provider, apiKey, model, baseUrl, temperature, maxTokens } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        message: '请提供AI提供商'
      });
    }

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: '请提供API密钥'
      });
    }

    const config = {
      provider,
      apiKey,
      model: model || 'gpt-3.5-turbo',
      baseUrl: baseUrl || 'https://api.openai.com/v1',
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 2000
    };

    const success = aiService.saveConfig(config);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: '保存配置失败'
      });
    }

    res.json({
      success: true,
      message: '配置已保存'
    });
  } catch (error) {
    console.error('保存AI配置失败:', error);
    res.status(500).json({
      success: false,
      message: `保存AI配置失败: ${error.message}`
    });
  }
});

/**
 * 测试AI连接
 * GET /api/ai/test-connection
 */
router.get('/test-connection', async (req, res) => {
  try {
    const connected = await aiService.testConnection();
    
    if (connected) {
      res.json({
        success: true,
        message: 'AI连接成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'AI连接失败'
      });
    }
  } catch (error) {
    console.error('测试AI连接失败:', error);
    res.status(500).json({
      success: false,
      message: `测试AI连接失败: ${error.message}`
    });
  }
});

/**
 * 分析党支部能力
 * POST /api/ai/analyze-branch-capability
 */
router.post('/analyze-branch-capability', async (req, res) => {
  try {
    const { branchData } = req.body;

    if (!branchData) {
      return res.status(400).json({
        success: false,
        message: '请提供党支部数据'
      });
    }

    const analysis = await aiService.analyzeBranchCapability(branchData);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('分析党支部能力失败:', error);
    res.status(500).json({
      success: false,
      message: `分析党支部能力失败: ${error.message}`
    });
  }
});

/**
 * 预测党支部发展趋势
 * POST /api/ai/predict-branch-trend
 */
router.post('/predict-branch-trend', async (req, res) => {
  try {
    const { branchData, historicalData } = req.body;

    if (!branchData) {
      return res.status(400).json({
        success: false,
        message: '请提供党支部数据'
      });
    }

    if (!historicalData || !Array.isArray(historicalData)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的历史数据'
      });
    }

    const prediction = await aiService.predictBranchTrend(branchData, historicalData);

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('预测党支部发展趋势失败:', error);
    res.status(500).json({
      success: false,
      message: `预测党支部发展趋势失败: ${error.message}`
    });
  }
});

/**
 * 从文档中提取数据
 * POST /api/ai/extract-data-from-document
 */
router.post('/extract-data-from-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传文档'
      });
    }

    const fields = req.body.fields ? JSON.parse(req.body.fields) : [];
    
    // 读取文档内容
    const documentText = fs.readFileSync(req.file.path, 'utf8');
    
    // 提取数据
    const extractedData = await aiService.extractDataFromDocument(documentText, fields);
    
    // 删除上传的文件
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: extractedData
    });
  } catch (error) {
    console.error('从文档中提取数据失败:', error);
    
    // 如果上传了文件，删除它
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: `从文档中提取数据失败: ${error.message}`
    });
  }
});

/**
 * 自然语言查询
 * POST /api/ai/natural-language-query
 */
router.post('/natural-language-query', async (req, res) => {
  try {
    const { query, context } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: '请提供查询语句'
      });
    }

    // 构建提示词
    let prompt = `基于以下党支部数据，回答这个问题: "${query}"\n\n`;
    
    if (context && context.branches) {
      prompt += "党支部数据:\n";
      context.branches.forEach(branch => {
        prompt += `\n支部名称: ${branch.name}\n`;
        prompt += `基础评价得分: ${branch.baseScore}\n`;
        prompt += `基础评价等级: ${branch.baseGrade}\n`;
        prompt += `管理赋值得分: ${branch.managementScore}\n`;
        prompt += `综合能力得分: ${branch.totalScore}\n`;
        prompt += `综合等级: ${branch.grade}\n`;
        
        prompt += "各维度得分:\n";
        Object.entries(branch.baseDimensions).forEach(([key, dimension]) => {
          prompt += `${dimension.name}: ${dimension.score}\n`;
        });
      });
    }

    const answer = await aiService.generateText(prompt);

    res.json({
      success: true,
      answer
    });
  } catch (error) {
    console.error('自然语言查询失败:', error);
    res.status(500).json({
      success: false,
      message: `自然语言查询失败: ${error.message}`
    });
  }
});

/**
 * 生成改进建议
 * POST /api/ai/generate-recommendations
 */
router.post('/generate-recommendations', async (req, res) => {
  try {
    const { branchData, comparisonData } = req.body;

    if (!branchData) {
      return res.status(400).json({
        success: false,
        message: '请提供党支部数据'
      });
    }

    // 构建提示词
    let prompt = `为以下党支部生成详细的改进建议:\n\n`;
    
    prompt += `支部名称: ${branchData.name}\n`;
    prompt += `基础评价得分: ${branchData.baseScore}\n`;
    prompt += `基础评价等级: ${branchData.baseGrade}\n`;
    prompt += `管理赋值得分: ${branchData.managementScore}\n`;
    prompt += `综合能力得分: ${branchData.totalScore}\n`;
    prompt += `综合等级: ${branchData.grade}\n`;
    
    prompt += "各维度得分:\n";
    Object.entries(branchData.baseDimensions).forEach(([key, dimension]) => {
      prompt += `${dimension.name}: ${dimension.score}\n`;
    });
    
    if (comparisonData) {
      prompt += "\n与其他支部的比较:\n";
      prompt += `平均基础评价得分: ${comparisonData.averageBaseScore}\n`;
      prompt += `平均综合能力得分: ${comparisonData.averageTotalScore}\n`;
      prompt += `最高得分支部: ${comparisonData.highestScoreBranch}\n`;
      prompt += `最高得分: ${comparisonData.highestScore}\n`;
    }
    
    prompt += "\n请提供以下内容:\n";
    prompt += "1. 总体评价\n";
    prompt += "2. 优势分析\n";
    prompt += "3. 不足分析\n";
    prompt += "4. 针对各维度的具体改进建议\n";
    prompt += "5. 可借鉴的先进经验\n";
    prompt += "6. 长期发展规划建议\n";

    const recommendations = await aiService.generateText(prompt);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('生成改进建议失败:', error);
    res.status(500).json({
      success: false,
      message: `生成改进建议失败: ${error.message}`
    });
  }
});

module.exports = router;
