/**
 * AI服务集成模块
 *
 * 此模块提供了与各种AI服务的集成，包括OpenAI、本地模型等
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置文件路径
const configPath = path.join(__dirname, 'config/ai-config.json');

/**
 * AI服务类
 */
class AIService {
  /**
   * 构造函数
   */
  constructor() {
    this.config = this.loadConfig();
    this.client = null;
    this.initClient();
  }

  /**
   * 加载配置
   * @returns {Object} 配置对象
   */
  loadConfig() {
    try {
      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configData);
      }

      return {
        provider: 'ollama',
        model: 'deepseek-r1:14b',
        baseUrl: 'http://localhost:11434/api',
        temperature: 0.7,
        maxTokens: 2000
      };
    } catch (error) {
      console.error('加载AI配置失败:', error);
      return {
        provider: 'ollama',
        model: 'deepseek-r1:14b',
        baseUrl: 'http://localhost:11434/api',
        temperature: 0.7,
        maxTokens: 2000
      };
    }
  }

  /**
   * 保存配置
   * @param {Object} config 配置对象
   */
  saveConfig(config) {
    try {
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // 对于 Ollama，确保使用默认配置
      if (config.provider === 'ollama') {
        config.baseUrl = 'http://localhost:11434/api';
        config.apiKey = '';
      }

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      this.config = config;
      this.initClient();

      return true;
    } catch (error) {
      console.error('保存AI配置失败:', error);
      return false;
    }
  }

  /**
   * 初始化客户端
   */
  initClient() {
    // 对于 Ollama，不需要 API 密钥
    if (this.config.provider !== 'ollama' && !this.config.apiKey) {
      console.warn('未配置API密钥，AI服务不可用');
      return;
    }

    if (this.config.provider === 'openai') {
      this.client = axios.create({
        baseURL: this.config.baseUrl,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
    } else if (this.config.provider === 'dify') {
      this.client = axios.create({
        baseURL: this.config.baseUrl,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
    } else if (this.config.provider === 'ollama') {
      // Ollama 配置 - 使用默认本地地址
      const ollamaBaseUrl = 'http://localhost:11434/api';
      this.client = axios.create({
        baseURL: ollamaBaseUrl,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else if (this.config.provider === 'local') {
      // 本地模型配置
      this.client = axios.create({
        baseURL: this.config.baseUrl,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }

  /**
   * 测试连接
   * @returns {Promise<boolean>} 连接是否成功
   */
  async testConnection() {
    try {
      if (!this.client) {
        return false;
      }

      if (this.config.provider === 'openai') {
        const response = await this.client.get('/models');
        return response.status === 200;
      } else if (this.config.provider === 'dify') {
        // Dify API测试
        const response = await this.client.get('/workflows');
        return response.status === 200;
      } else if (this.config.provider === 'ollama') {
        // Ollama API测试
        try {
          // 直接使用本地 Ollama 地址
          const response = await axios.get('http://localhost:11434/api/tags');
          return response.status === 200 && response.data && response.data.models;
        } catch (error) {
          console.error('Ollama连接测试失败:', error);
          return false;
        }
      } else if (this.config.provider === 'local') {
        // 本地模型测试
        const response = await this.client.get('/health');
        return response.status === 200;
      }

      return false;
    } catch (error) {
      console.error('测试AI连接失败:', error);
      return false;
    }
  }

  /**
   * 生成文本
   * @param {string} prompt 提示词
   * @param {Object} options 选项
   * @returns {Promise<string>} 生成的文本
   */
  async generateText(prompt, options = {}) {
    try {
      if (!this.client) {
        throw new Error('AI客户端未初始化');
      }

      const temperature = options.temperature || this.config.temperature;
      const maxTokens = options.maxTokens || this.config.maxTokens;

      if (this.config.provider === 'openai') {
        const response = await this.client.post('/chat/completions', {
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens
        });

        return response.data.choices[0].message.content;
      } else if (this.config.provider === 'dify') {
        // Dify API调用
        const response = await this.client.post('/chat-messages', {
          inputs: {},
          query: prompt,
          response_mode: 'blocking'
        });

        return response.data.answer;
      } else if (this.config.provider === 'ollama') {
        // Ollama API调用
        try {
          // 直接使用本地 Ollama 地址
          const response = await axios.post('http://localhost:11434/api/generate', {
            model: this.config.model,
            prompt,
            stream: false,
            options: {
              temperature,
              num_predict: maxTokens
            }
          });

          return response.data.response;
        } catch (error) {
          console.error('Ollama生成文本失败:', error);
          if (error.response && error.response.data) {
            console.error('Ollama错误详情:', error.response.data);
          }
          throw error;
        }
      } else if (this.config.provider === 'local') {
        // 本地模型调用
        const response = await this.client.post('/generate', {
          prompt,
          temperature,
          max_tokens: maxTokens
        });

        return response.data.text;
      }

      throw new Error('不支持的AI提供商');
    } catch (error) {
      console.error('生成文本失败:', error);
      throw new Error(`生成文本失败: ${error.message}`);
    }
  }

  /**
   * 分析党支部能力数据
   * @param {Object} branchData 党支部数据
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeBranchCapability(branchData) {
    try {
      const prompt = `
分析以下党支部能力评价数据，并提供改进建议：

支部名称: ${branchData.name}
基础评价得分: ${branchData.baseScore}
基础评价等级: ${branchData.baseGrade}
管理赋值得分: ${branchData.managementScore}
综合能力得分: ${branchData.totalScore}
综合等级: ${branchData.grade}

各维度得分:
组织管理水平: ${branchData.baseDimensions.organizationManagement.score}
考核指标执行: ${branchData.baseDimensions.kpiExecution.score}
人才培养创新: ${branchData.baseDimensions.talentDevelopment.score}
党建基础工作: ${branchData.baseDimensions.partyBuilding.score}
任务跟进落实: ${branchData.baseDimensions.taskFollowUp.score}
安全廉洁底线: ${branchData.baseDimensions.safetyCompliance.score}
群众满意度: ${branchData.baseDimensions.satisfaction.score}

请提供以下分析:
1. 该支部的优势和不足
2. 针对性的改进建议（针对得分较低的维度）
3. 未来发展潜力评估
4. 可以借鉴的先进经验
`;

      const analysisText = await this.generateText(prompt);

      // 解析分析文本
      const sections = analysisText.split(/\d+\.\s+/).filter(Boolean);

      return {
        strengths: sections[0] || '',
        recommendations: sections[1] || '',
        potentialAssessment: sections[2] || '',
        bestPractices: sections[3] || ''
      };
    } catch (error) {
      console.error('分析党支部能力数据失败:', error);
      throw new Error(`分析党支部能力数据失败: ${error.message}`);
    }
  }

  /**
   * 预测党支部发展趋势
   * @param {Object} branchData 党支部数据
   * @param {Array} historicalData 历史数据
   * @returns {Promise<Object>} 预测结果
   */
  async predictBranchTrend(branchData, historicalData) {
    try {
      const historicalDataText = historicalData.map(data =>
        `${data.date}: 总分=${data.totalScore}, 组织管理=${data.organizationManagement}, 考核指标=${data.kpiExecution}, 人才培养=${data.talentDevelopment}`
      ).join('\n');

      const prompt = `
基于以下党支部历史数据，预测未来3个月的发展趋势：

支部名称: ${branchData.name}
当前综合能力得分: ${branchData.totalScore}
当前等级: ${branchData.grade}

历史数据:
${historicalDataText}

请预测:
1. 未来3个月的综合能力得分趋势
2. 各维度得分的变化趋势
3. 可能影响发展的关键因素
4. 建议关注的重点领域
`;

      const predictionText = await this.generateText(prompt);

      // 解析预测文本
      const sections = predictionText.split(/\d+\.\s+/).filter(Boolean);

      return {
        scoresTrend: sections[0] || '',
        dimensionsTrend: sections[1] || '',
        keyFactors: sections[2] || '',
        focusAreas: sections[3] || ''
      };
    } catch (error) {
      console.error('预测党支部发展趋势失败:', error);
      throw new Error(`预测党支部发展趋势失败: ${error.message}`);
    }
  }

  /**
   * 从文档中提取数据
   * @param {string} documentText 文档文本
   * @param {Array} fields 要提取的字段
   * @returns {Promise<Object>} 提取的数据
   */
  async extractDataFromDocument(documentText, fields) {
    try {
      const fieldsText = fields.join(', ');

      const prompt = `
从以下文档中提取这些字段的信息: ${fieldsText}

文档内容:
${documentText}

请以JSON格式返回提取的数据，格式如下:
{
  "field1": "value1",
  "field2": "value2",
  ...
}
`;

      const extractionText = await this.generateText(prompt);

      // 解析JSON
      try {
        // 查找JSON部分
        const jsonMatch = extractionText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }

        throw new Error('无法解析提取的数据');
      } catch (parseError) {
        console.error('解析提取数据失败:', parseError);
        throw new Error(`解析提取数据失败: ${parseError.message}`);
      }
    } catch (error) {
      console.error('从文档中提取数据失败:', error);
      throw new Error(`从文档中提取数据失败: ${error.message}`);
    }
  }
}

module.exports = new AIService();
