/**
 * @file 支部上下文，管理支部相关的全局状态
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Branch, BranchDetail } from '../types';
import api from '../services/api';

// 支部上下文类型
interface BranchContextType {
  branches: Branch[];
  selectedBranch: Branch | null;
  selectedBranchId: string | null;
  loading: boolean;
  error: string | null;
  selectBranch: (id: string) => Promise<void>;
  refreshBranches: () => Promise<void>;
}

// 创建支部上下文
const BranchContext = createContext<BranchContextType | undefined>(undefined);

// 支部上下文提供者属性
interface BranchProviderProps {
  children: React.ReactNode;
}

/**
 * 支部上下文提供者组件
 * @param {BranchProviderProps} props 组件属性
 * @returns {JSX.Element} 支部上下文提供者
 */
export const BranchProvider: React.FC<BranchProviderProps> = ({ children }) => {
  // 状态
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取所有支部
   */
  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.branch.getAllBranches();
      setBranches(data);

      // 如果有支部数据但没有选中的支部，则选择第一个支部
      if (data.length > 0 && !selectedBranchId) {
        await selectBranch(data[0].id);
      }
    } catch (err) {
      setError('获取支部列表失败');
      console.error(err);

      // 生成模拟数据
      const mockBranches = generateMockBranches();
      setBranches(mockBranches);

      // 选择第一个模拟支部
      if (mockBranches.length > 0 && !selectedBranchId) {
        setSelectedBranch(generateMockBranchDetail(mockBranches[0].id));
        setSelectedBranchId(mockBranches[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedBranchId]);

  /**
   * 生成模拟支部列表
   * @returns {Branch[]} 模拟支部列表
   */
  const generateMockBranches = (): Branch[] => {
    return Array.from({ length: 11 }, (_, i) => ({
      id: `mock-${i + 1}`,
      name: `第${i + 1}党支部`,
      secretary: `书记${i + 1}`,
      deputySecretary: `副书记${i + 1}`,
      memberCount: 20 + i,
      foundingDate: '2020-01-01',
      description: `这是第${i + 1}党支部的简介`
    }));
  };

  /**
   * 生成模拟支部详情
   * @param {string} id 支部ID
   * @returns {Branch} 模拟支部详情
   */
  const generateMockBranchDetail = (id: string): Branch => {
    const index = parseInt(id.split('-')[1]) - 1;
    return {
      id,
      name: `第${index + 1}党支部`,
      secretary: `书记${index + 1}`,
      deputySecretary: `副书记${index + 1}`,
      memberCount: 20 + index,
      foundingDate: '2020-01-01',
      description: `这是第${index + 1}党支部的简介`,
      organizationalCommissioner: `组织委员${index + 1}`,
      disciplinaryCommissioner: `纪检委员${index + 1}`,
      propagandaCommissioner: `宣传委员${index + 1}`,
      learningCommissioner: `学习委员${index + 1}`,
      averageAge: 35 + (index % 5),
      ageDistribution: [
        { ageGroup: '18-28岁', count: 5, percentage: 25 + (index % 10) },
        { ageGroup: '28-35岁', count: 7, percentage: 35 - (index % 10) },
        { ageGroup: '35-50岁', count: 6, percentage: 30 },
        { ageGroup: '50-60岁', count: 2, percentage: 10 }
      ],
      educationDistribution: [
        { educationLevel: '大专及以下', count: 3, percentage: 15 },
        { educationLevel: '本科', count: 11, percentage: 55 },
        { educationLevel: '硕士', count: 5, percentage: 25 },
        { educationLevel: '博士', count: 1, percentage: 5 }
      ],
      partyAgeDistribution: [
        { partyAgeGroup: '1-3年', count: 4, percentage: 20 },
        { partyAgeGroup: '3-5年', count: 6, percentage: 30 },
        { partyAgeGroup: '5-10年', count: 7, percentage: 35 },
        { partyAgeGroup: '10年以上', count: 3, percentage: 15 }
      ],
      positionDistribution: [
        { position: '普通党员', count: 12, percentage: 60 },
        { position: '支委委员', count: 5, percentage: 25 },
        { position: '支部书记', count: 2, percentage: 10 },
        { position: '其他', count: 1, percentage: 5 }
      ]
    };
  };

  /**
   * 选择支部
   * @param {string} id 支部ID
   */
  const selectBranch = useCallback(async (id: string) => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await api.branch.getBranchById(id);

      if (data) {
        setSelectedBranch(data);
        setSelectedBranchId(id);
      } else {
        setError(`获取支部(ID: ${id})详情失败`);

        // 如果是模拟数据ID，生成模拟详情
        if (id.startsWith('mock-')) {
          const mockDetail = generateMockBranchDetail(id);
          setSelectedBranch(mockDetail);
          setSelectedBranchId(id);
          setError(null);
        }
      }
    } catch (err) {
      setError(`获取支部(ID: ${id})详情失败`);
      console.error(err);

      // 如果是模拟数据ID，生成模拟详情
      if (id.startsWith('mock-')) {
        const mockDetail = generateMockBranchDetail(id);
        setSelectedBranch(mockDetail);
        setSelectedBranchId(id);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新支部列表
   */
  const refreshBranches = useCallback(async () => {
    await fetchBranches();
  }, [fetchBranches]);

  // 初始化时获取支部列表
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // 上下文值
  const contextValue: BranchContextType = {
    branches,
    selectedBranch,
    selectedBranchId,
    loading,
    error,
    selectBranch,
    refreshBranches
  };

  return (
    <BranchContext.Provider value={contextValue}>
      {children}
    </BranchContext.Provider>
  );
};

/**
 * 使用支部上下文的Hook
 * @returns {BranchContextType} 支部上下文
 * @throws {Error} 如果在BranchProvider外部使用则抛出错误
 */
export const useBranch = (): BranchContextType => {
  const context = useContext(BranchContext);

  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }

  return context;
};
