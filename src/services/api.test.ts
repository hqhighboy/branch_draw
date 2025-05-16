/**
 * @file API服务测试
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import axios from 'axios';
import api from './api';

// 模拟 axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

describe('API Service', () => {
  // 获取模拟的 axios 实例
  const mockAxios = axios.create() as jest.Mocked<typeof axios>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('branchAPI', () => {
    test('getAllBranches 应该返回支部列表', async () => {
      // 模拟数据
      const mockBranches = [
        { id: '1', name: '支部1' },
        { id: '2', name: '支部2' }
      ];
      
      // 模拟 axios 响应
      mockAxios.get.mockResolvedValue({
        data: { success: true, data: mockBranches }
      });
      
      // 调用 API
      const result = await api.branch.getAllBranches();
      
      // 验证结果
      expect(result).toEqual(mockBranches);
      expect(mockAxios.get).toHaveBeenCalledWith('/branches');
    });
    
    test('getBranchById 应该返回支部详情', async () => {
      // 模拟数据
      const mockBranch = {
        id: '1',
        name: '支部1',
        secretary: '张三'
      };
      
      // 模拟 axios 响应
      mockAxios.get.mockResolvedValue({
        data: { success: true, data: mockBranch }
      });
      
      // 调用 API
      const result = await api.branch.getBranchById('1');
      
      // 验证结果
      expect(result).toEqual(mockBranch);
      expect(mockAxios.get).toHaveBeenCalledWith('/branches/1');
    });
    
    test('updateBranch 应该更新支部信息', async () => {
      // 模拟数据
      const branchData = {
        name: '支部1更新',
        secretary: '李四'
      };
      
      // 模拟 axios 响应
      mockAxios.put.mockResolvedValue({
        data: { success: true }
      });
      
      // 调用 API
      const result = await api.branch.updateBranch('1', branchData);
      
      // 验证结果
      expect(result).toBe(true);
      expect(mockAxios.put).toHaveBeenCalledWith('/branches/1', branchData);
    });
  });
  
  describe('workAPI', () => {
    test('getMonthlyWork 应该返回月度工作数据', async () => {
      // 模拟数据
      const mockMonthlyWork = [
        {
          branchId: '1',
          month: 6,
          year: 2023,
          planningCompletion: 80
        }
      ];
      
      // 模拟 axios 响应
      mockAxios.get.mockResolvedValue({
        data: { success: true, data: mockMonthlyWork }
      });
      
      // 调用 API
      const result = await api.work.getMonthlyWork('1', 2023, 6);
      
      // 验证结果
      expect(result).toEqual(mockMonthlyWork);
      expect(mockAxios.get).toHaveBeenCalledWith('/work/monthly', {
        params: { branchId: '1', year: 2023, month: 6 }
      });
    });
    
    test('getAllBranchesMonthlyWork 应该返回所有支部的月度工作数据', async () => {
      // 模拟数据
      const mockMonthlyWork = [
        { branchId: '1', month: 6, year: 2023 },
        { branchId: '2', month: 6, year: 2023 }
      ];
      
      // 模拟 axios 响应
      mockAxios.get.mockResolvedValue({
        data: { success: true, data: mockMonthlyWork }
      });
      
      // 调用 API
      const result = await api.work.getAllBranchesMonthlyWork(2023, 6);
      
      // 验证结果
      expect(result).toEqual(mockMonthlyWork);
      expect(mockAxios.get).toHaveBeenCalledWith('/work/monthly/all', {
        params: { year: 2023, month: 6 }
      });
    });
  });
  
  describe('capabilityAPI', () => {
    test('getBranchCapability 应该返回支部能力画像', async () => {
      // 模拟数据
      const mockCapability = {
        branchId: '1',
        managementLevel: 85,
        kpiExecution: 80
      };
      
      // 模拟 axios 响应
      mockAxios.get.mockResolvedValue({
        data: { success: true, data: mockCapability }
      });
      
      // 调用 API
      const result = await api.capability.getBranchCapability('1');
      
      // 验证结果
      expect(result).toEqual(mockCapability);
      expect(mockAxios.get).toHaveBeenCalledWith('/capability/1');
    });
  });
  
  describe('aiAPI', () => {
    test('requestAnalysis 应该发送分析请求', async () => {
      // 模拟数据
      const mockResult = {
        branchId: '1',
        analysisText: '分析结果',
        suggestions: ['建议1', '建议2']
      };
      
      // 模拟 axios 响应
      mockAxios.post.mockResolvedValue({
        data: { success: true, data: mockResult }
      });
      
      // 调用 API
      const result = await api.ai.requestAnalysis('1', 'gpt-3.5-turbo');
      
      // 验证结果
      expect(result).toEqual(mockResult);
      expect(mockAxios.post).toHaveBeenCalledWith('/ai/analyze', {
        branchId: '1',
        model: 'gpt-3.5-turbo'
      });
    });
  });
});
