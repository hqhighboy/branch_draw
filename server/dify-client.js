/**
 * Dify API客户端
 *
 * 此模块提供了与Dify平台交互的API客户端
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

class DifyClient {
  /**
   * 创建Dify API客户端
   * @param {Object} config 配置对象
   * @param {string} config.apiKey Dify API密钥
   * @param {string} config.baseUrl Dify API基础URL
   */
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'http://localhost/api/v1';

    // 创建axios实例
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Dify客户端已初始化，API基础URL: ${this.baseUrl}`);
  }

  /**
   * 创建工作流
   * @param {Object} workflow 工作流定义
   * @returns {Promise<Object>} 创建结果
   */
  async createWorkflow(workflow) {
    try {
      const response = await this.client.post('/workflows', workflow);
      return response.data;
    } catch (error) {
      console.error('创建工作流失败:', error.response?.data || error.message);
      throw new Error(`创建工作流失败: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 获取工作流列表
   * @param {Object} options 查询选项
   * @param {number} options.page 页码
   * @param {number} options.limit 每页数量
   * @returns {Promise<Object>} 工作流列表
   */
  async getWorkflows(options = {}) {
    try {
      const response = await this.client.get('/workflows', {
        params: {
          page: options.page || 1,
          limit: options.limit || 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('获取工作流列表失败:', error.response?.data || error.message);
      throw new Error(`获取工作流列表失败: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 获取工作流详情
   * @param {string} workflowId 工作流ID
   * @returns {Promise<Object>} 工作流详情
   */
  async getWorkflow(workflowId) {
    try {
      const response = await this.client.get(`/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('获取工作流详情失败:', error.response?.data || error.message);
      throw new Error(`获取工作流详情失败: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 更新工作流
   * @param {string} workflowId 工作流ID
   * @param {Object} workflow 工作流定义
   * @returns {Promise<Object>} 更新结果
   */
  async updateWorkflow(workflowId, workflow) {
    try {
      const response = await this.client.put(`/workflows/${workflowId}`, workflow);
      return response.data;
    } catch (error) {
      console.error('更新工作流失败:', error.response?.data || error.message);
      throw new Error(`更新工作流失败: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 删除工作流
   * @param {string} workflowId 工作流ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteWorkflow(workflowId) {
    try {
      const response = await this.client.delete(`/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('删除工作流失败:', error.response?.data || error.message);
      throw new Error(`删除工作流失败: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 执行工作流
   * @param {string} workflowId 工作流ID
   * @param {Object} data 输入数据
   * @returns {Promise<Object>} 执行结果
   */
  async executeWorkflow(workflowId, data) {
    try {
      const response = await this.client.post(`/workflows/${workflowId}/execute`, data);
      return response.data;
    } catch (error) {
      console.error('执行工作流失败:', error.response?.data || error.message);
      throw new Error(`执行工作流失败: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 上传文件
   * @param {string} filePath 文件路径
   * @returns {Promise<Object>} 上传结果
   */
  async uploadFile(filePath) {
    try {
      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      // 发送请求
      const response = await axios.post(`${this.baseUrl}/files`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('上传文件失败:', error.response?.data || error.message);
      throw new Error(`上传文件失败: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 获取工作流执行历史
   * @param {string} workflowId 工作流ID
   * @param {Object} options 查询选项
   * @param {number} options.page 页码
   * @param {number} options.limit 每页数量
   * @returns {Promise<Object>} 执行历史
   */
  async getWorkflowExecutions(workflowId, options = {}) {
    try {
      const response = await this.client.get(`/workflows/${workflowId}/executions`, {
        params: {
          page: options.page || 1,
          limit: options.limit || 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('获取工作流执行历史失败:', error.response?.data || error.message);
      throw new Error(`获取工作流执行历史失败: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * 获取工作流执行详情
   * @param {string} workflowId 工作流ID
   * @param {string} executionId 执行ID
   * @returns {Promise<Object>} 执行详情
   */
  async getWorkflowExecution(workflowId, executionId) {
    try {
      const response = await this.client.get(`/workflows/${workflowId}/executions/${executionId}`);
      return response.data;
    } catch (error) {
      console.error('获取工作流执行详情失败:', error.response?.data || error.message);
      throw new Error(`获取工作流执行详情失败: ${error.response?.data?.message || error.message}`);
    }
  }
}

module.exports = DifyClient;
