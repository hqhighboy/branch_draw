/**
 * @file BranchContext 测试
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BranchProvider, useBranch } from './BranchContext';
import api from '../services/api';

// 模拟 API 服务
jest.mock('../services/api', () => ({
  branch: {
    getAllBranches: jest.fn(),
    getBranchById: jest.fn()
  }
}));

// 测试组件
const TestComponent = () => {
  const { branches, selectedBranch, loading, error, selectBranch } = useBranch();
  
  return (
    <div>
      {loading && <div data-testid="loading">加载中...</div>}
      {error && <div data-testid="error">{error}</div>}
      
      {branches.length > 0 && (
        <div data-testid="branches-count">{branches.length}</div>
      )}
      
      {selectedBranch && (
        <div data-testid="selected-branch">{selectedBranch.name}</div>
      )}
      
      <button 
        data-testid="select-branch-button" 
        onClick={() => selectBranch('2')}
      >
        选择支部2
      </button>
    </div>
  );
};

describe('BranchContext', () => {
  // 模拟数据
  const mockBranches = [
    { id: '1', name: '支部1', secretary: '张三', deputySecretary: '李四', memberCount: 30, foundingDate: '2020-01-01', description: '描述1' },
    { id: '2', name: '支部2', secretary: '王五', deputySecretary: '赵六', memberCount: 25, foundingDate: '2019-05-01', description: '描述2' }
  ];
  
  const mockBranchDetail = {
    ...mockBranches[0],
    ageDistribution: [{ ageGroup: '20-30岁', count: 10, percentage: 33.33 }],
    educationDistribution: [{ educationLevel: '本科', count: 20, percentage: 66.67 }],
    partyAgeDistribution: [{ partyAgeGroup: '1-5年', count: 15, percentage: 50 }],
    positionDistribution: [{ position: '普通党员', count: 25, percentage: 83.33 }]
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 模拟 API 响应
    (api.branch.getAllBranches as jest.Mock).mockResolvedValue(mockBranches);
    (api.branch.getBranchById as jest.Mock).mockResolvedValue(mockBranchDetail);
  });
  
  test('初始加载状态', async () => {
    render(
      <BranchProvider>
        <TestComponent />
      </BranchProvider>
    );
    
    // 初始应该显示加载状态
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // 等待数据加载完成
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // 应该显示支部数量
    expect(screen.getByTestId('branches-count')).toHaveTextContent('2');
    
    // 应该自动选择第一个支部
    expect(screen.getByTestId('selected-branch')).toHaveTextContent('支部1');
    
    // 验证 API 调用
    expect(api.branch.getAllBranches).toHaveBeenCalledTimes(1);
    expect(api.branch.getBranchById).toHaveBeenCalledWith('1');
  });
  
  test('选择支部', async () => {
    // 模拟第二个支部的详情
    const mockBranchDetail2 = {
      ...mockBranches[1],
      ageDistribution: [{ ageGroup: '20-30岁', count: 8, percentage: 32 }],
      educationDistribution: [{ educationLevel: '本科', count: 15, percentage: 60 }],
      partyAgeDistribution: [{ partyAgeGroup: '1-5年', count: 12, percentage: 48 }],
      positionDistribution: [{ position: '普通党员', count: 20, percentage: 80 }]
    };
    
    // 第二次调用返回第二个支部的详情
    (api.branch.getBranchById as jest.Mock).mockResolvedValueOnce(mockBranchDetail)
      .mockResolvedValueOnce(mockBranchDetail2);
    
    render(
      <BranchProvider>
        <TestComponent />
      </BranchProvider>
    );
    
    // 等待初始数据加载完成
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // 点击选择支部2按钮
    act(() => {
      screen.getByTestId('select-branch-button').click();
    });
    
    // 应该显示加载状态
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // 等待数据加载完成
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // 应该显示选中的支部2
    expect(screen.getByTestId('selected-branch')).toHaveTextContent('支部2');
    
    // 验证 API 调用
    expect(api.branch.getBranchById).toHaveBeenCalledWith('2');
  });
  
  test('处理API错误', async () => {
    // 模拟 API 错误
    (api.branch.getAllBranches as jest.Mock).mockRejectedValue(new Error('获取支部列表失败'));
    
    render(
      <BranchProvider>
        <TestComponent />
      </BranchProvider>
    );
    
    // 等待错误显示
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByTestId('error')).toHaveTextContent('获取支部列表失败');
    });
  });
});
