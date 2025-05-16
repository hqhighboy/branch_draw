/**
 * @file API服务模块，集中管理所有API调用
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // 统一处理错误
    if (error.response) {
      // 服务器返回错误状态码
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // 请求发送但没有收到响应
      console.error('API Error: No response received', error.request);
    } else {
      // 请求配置出错
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 支部类型定义
export interface Branch {
  id: string;
  name: string;
  secretary: string;
  deputySecretary: string;
  memberCount: number;
  foundingDate: string;
  description: string;
}

// 支部详情类型定义
export interface BranchDetail extends Branch {
  ageDistribution: { ageGroup: string; count: number; percentage: number }[];
  educationDistribution: { educationLevel: string; count: number; percentage: number }[];
  partyAgeDistribution: { partyAgeGroup: string; count: number; percentage: number }[];
  positionDistribution: { position: string; count: number; percentage: number }[];
}

// 月度工作类型定义
export interface MonthlyWork {
  branchId: string;
  branchName: string;
  month: number;
  year: number;
  planningCompletion: number;
  executionCompletion: number;
  inspectionCompletion: number;
  evaluationCompletion: number;
  improvementCompletion: number;
}

// 年度重点工作类型定义
export interface AnnualWork {
  id: string;
  branchId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completion: number;
  priority: 'low' | 'medium' | 'high';
}

// 支部能力画像类型定义
export interface BranchCapability {
  branchId: string;
  branchName: string;
  managementLevel: number;
  kpiExecution: number;
  talentDevelopment: number;
  partyBuilding: number;
  taskFollowUp: number;
  safetyCompliance: number;
  innovationCapability: number;
  teamCollaboration: number;
  resourceUtilization: number;
  overallScore: number;
}

// AI分析结果类型定义
export interface AIAnalysisResult {
  branchId: string;
  analysisText: string;
  suggestions: string[];
  timestamp: string;
}

// 支部相关API
export const branchAPI = {
  /**
   * 获取所有支部列表
   * @returns {Promise<Branch[]>} 支部列表
   */
  getAllBranches: async (): Promise<Branch[]> => {
    try {
      const response = await apiClient.get<ApiResponse<Branch[]>>('/branches');
      return response.data.data || [];
    } catch (error) {
      console.error('获取支部列表失败:', error);
      return [];
    }
  },
  
  /**
   * 获取指定支部详情
   * @param {string} id 支部ID
   * @returns {Promise<BranchDetail | null>} 支部详情
   */
  getBranchById: async (id: string): Promise<BranchDetail | null> => {
    try {
      const response = await apiClient.get<ApiResponse<BranchDetail>>(`/branches/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`获取支部(ID: ${id})详情失败:`, error);
      return null;
    }
  },
  
  /**
   * 更新支部信息
   * @param {string} id 支部ID
   * @param {Partial<Branch>} data 要更新的支部数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  updateBranch: async (id: string, data: Partial<Branch>): Promise<boolean> => {
    try {
      const response = await apiClient.put<ApiResponse<any>>(`/branches/${id}`, data);
      return response.data.success || false;
    } catch (error) {
      console.error(`更新支部(ID: ${id})信息失败:`, error);
      return false;
    }
  }
};

// 工作相关API
export const workAPI = {
  /**
   * 获取支部月度工作完成情况
   * @param {string} branchId 支部ID
   * @param {number} year 年份
   * @param {number} month 月份，不传则返回全年数据
   * @returns {Promise<MonthlyWork[]>} 月度工作完成情况
   */
  getMonthlyWork: async (branchId: string, year: number, month?: number): Promise<MonthlyWork[]> => {
    try {
      const params: any = { branchId, year };
      if (month) params.month = month;
      
      const response = await apiClient.get<ApiResponse<MonthlyWork[]>>('/work/monthly', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('获取月度工作完成情况失败:', error);
      return [];
    }
  },
  
  /**
   * 获取所有支部的月度工作完成情况
   * @param {number} year 年份
   * @param {number} month 月份
   * @returns {Promise<MonthlyWork[]>} 所有支部的月度工作完成情况
   */
  getAllBranchesMonthlyWork: async (year: number, month: number): Promise<MonthlyWork[]> => {
    try {
      const response = await apiClient.get<ApiResponse<MonthlyWork[]>>('/work/monthly/all', {
        params: { year, month }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('获取所有支部月度工作完成情况失败:', error);
      return [];
    }
  },
  
  /**
   * 获取支部年度重点工作
   * @param {string} branchId 支部ID
   * @param {number} year 年份
   * @returns {Promise<AnnualWork[]>} 年度重点工作列表
   */
  getAnnualWork: async (branchId: string, year: number): Promise<AnnualWork[]> => {
    try {
      const response = await apiClient.get<ApiResponse<AnnualWork[]>>('/work/annual', {
        params: { branchId, year }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('获取年度重点工作失败:', error);
      return [];
    }
  }
};

// 支部能力画像API
export const capabilityAPI = {
  /**
   * 获取支部能力画像
   * @param {string} branchId 支部ID
   * @returns {Promise<BranchCapability | null>} 支部能力画像
   */
  getBranchCapability: async (branchId: string): Promise<BranchCapability | null> => {
    try {
      const response = await apiClient.get<ApiResponse<BranchCapability>>(`/capability/${branchId}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`获取支部(ID: ${branchId})能力画像失败:`, error);
      return null;
    }
  },
  
  /**
   * 获取所有支部的能力画像
   * @returns {Promise<BranchCapability[]>} 所有支部的能力画像
   */
  getAllBranchesCapability: async (): Promise<BranchCapability[]> => {
    try {
      const response = await apiClient.get<ApiResponse<BranchCapability[]>>('/capability/all');
      return response.data.data || [];
    } catch (error) {
      console.error('获取所有支部能力画像失败:', error);
      return [];
    }
  }
};

// AI相关API
export const aiAPI = {
  /**
   * 获取AI分析结果
   * @param {string} branchId 支部ID
   * @returns {Promise<AIAnalysisResult | null>} AI分析结果
   */
  getAnalysisResult: async (branchId: string): Promise<AIAnalysisResult | null> => {
    try {
      const response = await apiClient.get<ApiResponse<AIAnalysisResult>>(`/ai/analysis/${branchId}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`获取支部(ID: ${branchId})AI分析结果失败:`, error);
      return null;
    }
  },
  
  /**
   * 请求AI分析
   * @param {string} branchId 支部ID
   * @param {string} model AI模型名称
   * @returns {Promise<AIAnalysisResult | null>} AI分析结果
   */
  requestAnalysis: async (branchId: string, model: string): Promise<AIAnalysisResult | null> => {
    try {
      const response = await apiClient.post<ApiResponse<AIAnalysisResult>>('/ai/analyze', {
        branchId,
        model
      });
      return response.data.data || null;
    } catch (error) {
      console.error(`请求支部(ID: ${branchId})AI分析失败:`, error);
      return null;
    }
  },
  
  /**
   * 获取可用的AI模型列表
   * @returns {Promise<string[]>} AI模型列表
   */
  getAvailableModels: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<ApiResponse<string[]>>('/ai/models');
      return response.data.data || [];
    } catch (error) {
      console.error('获取可用AI模型列表失败:', error);
      return [];
    }
  }
};

// 导出默认API对象
export default {
  branch: branchAPI,
  work: workAPI,
  capability: capabilityAPI,
  ai: aiAPI
};
