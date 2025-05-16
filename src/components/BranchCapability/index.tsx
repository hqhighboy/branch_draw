/**
 * @file 支部能力画像组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { useState, useEffect } from 'react';
import { Tabs, Button, Tooltip } from 'antd';
import { 
  BarChartOutlined, 
  RadarChartOutlined, 
  LineChartOutlined, 
  TableOutlined, 
  RobotOutlined 
} from '@ant-design/icons';
import { useBranch } from '../../context/BranchContext';
import api from '../../services/api';
import { BranchCapability as BranchCapabilityType } from '../../types';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import CapabilityPortrait from './CapabilityPortrait';
import CapabilityDetail from './CapabilityDetail';
import ManagementScore from './ManagementScore';
import './BranchCapability.css';

/**
 * 支部能力画像组件
 * @returns {JSX.Element} 支部能力画像组件
 */
const BranchCapability: React.FC = () => {
  // 获取支部上下文
  const { branches, selectedBranch, selectedBranchId, loading: branchLoading, error: branchError } = useBranch();
  
  // 状态
  const [activeTab, setActiveTab] = useState<string>('portrait');
  const [capabilityData, setCapabilityData] = useState<BranchCapabilityType | null>(null);
  const [allBranchesCapability, setAllBranchesCapability] = useState<BranchCapabilityType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 获取支部能力画像数据
  useEffect(() => {
    const fetchCapabilityData = async () => {
      if (!selectedBranchId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 获取选中支部的能力画像
        const data = await api.capability.getBranchCapability(selectedBranchId);
        setCapabilityData(data);
        
        // 获取所有支部的能力画像
        const allData = await api.capability.getAllBranchesCapability();
        setAllBranchesCapability(allData);
      } catch (err) {
        console.error('获取支部能力画像数据失败:', err);
        setError('获取支部能力画像数据失败，请稍后重试');
        // 生成模拟数据
        generateMockData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchCapabilityData();
  }, [selectedBranchId]);
  
  /**
   * 生成模拟数据
   */
  const generateMockData = () => {
    if (!selectedBranchId || !selectedBranch) return;
    
    // 生成选中支部的模拟数据
    const mockData: BranchCapabilityType = {
      branchId: selectedBranchId,
      branchName: selectedBranch.name,
      managementLevel: Math.floor(Math.random() * 25) + 70,
      kpiExecution: Math.floor(Math.random() * 25) + 70,
      talentDevelopment: Math.floor(Math.random() * 25) + 70,
      partyBuilding: Math.floor(Math.random() * 25) + 70,
      taskFollowUp: Math.floor(Math.random() * 25) + 70,
      safetyCompliance: Math.floor(Math.random() * 25) + 70,
      innovationCapability: Math.floor(Math.random() * 25) + 70,
      teamCollaboration: Math.floor(Math.random() * 25) + 70,
      resourceUtilization: Math.floor(Math.random() * 25) + 70,
      overallScore: 0
    };
    
    // 计算综合得分
    mockData.overallScore = Math.round(
      (mockData.managementLevel + mockData.kpiExecution + mockData.talentDevelopment + 
       mockData.partyBuilding + mockData.taskFollowUp + mockData.safetyCompliance + 
       mockData.innovationCapability + mockData.teamCollaboration + mockData.resourceUtilization) / 9
    );
    
    setCapabilityData(mockData);
    
    // 生成所有支部的模拟数据
    const mockAllData: BranchCapabilityType[] = branches.map(branch => {
      const data: BranchCapabilityType = {
        branchId: branch.id,
        branchName: branch.name,
        managementLevel: Math.floor(Math.random() * 25) + 70,
        kpiExecution: Math.floor(Math.random() * 25) + 70,
        talentDevelopment: Math.floor(Math.random() * 25) + 70,
        partyBuilding: Math.floor(Math.random() * 25) + 70,
        taskFollowUp: Math.floor(Math.random() * 25) + 70,
        safetyCompliance: Math.floor(Math.random() * 25) + 70,
        innovationCapability: Math.floor(Math.random() * 25) + 70,
        teamCollaboration: Math.floor(Math.random() * 25) + 70,
        resourceUtilization: Math.floor(Math.random() * 25) + 70,
        overallScore: 0
      };
      
      // 计算综合得分
      data.overallScore = Math.round(
        (data.managementLevel + data.kpiExecution + data.talentDevelopment + 
         data.partyBuilding + data.taskFollowUp + data.safetyCompliance + 
         data.innovationCapability + data.teamCollaboration + data.resourceUtilization) / 9
      );
      
      return data;
    });
    
    setAllBranchesCapability(mockAllData);
  };
  
  /**
   * 处理标签页切换
   * @param {string} key 标签页键值
   */
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };
  
  /**
   * 处理导出数据
   */
  const handleExportData = () => {
    // 导出数据逻辑
    console.warn('导出数据功能尚未实现');
  };
  
  /**
   * 处理AI分析
   */
  const handleAIAnalysis = () => {
    // AI分析逻辑
    console.warn('AI分析功能尚未实现');
  };
  
  // 加载中
  if (branchLoading || loading) {
    return <Loading />;
  }
  
  // 错误
  if (branchError || error) {
    return <ErrorMessage message={branchError || error || '加载数据失败'} />;
  }
  
  // 无数据
  if (!selectedBranch) {
    return <EmptyState description="暂无支部数据" />;
  }
  
  return (
    <div className="branch-capability">
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange} 
        type="card"
        className="capability-tabs"
        tabBarExtraContent={
          <div className="tab-extra-content">
            <Tooltip title="导出数据">
              <Button type="text" icon={<TableOutlined />} onClick={handleExportData}>导出</Button>
            </Tooltip>
            <Tooltip title="AI分析">
              <Button type="primary" icon={<RobotOutlined />} onClick={handleAIAnalysis}>AI分析</Button>
            </Tooltip>
          </div>
        }
        items={[
          {
            key: 'portrait',
            label: <span><RadarChartOutlined /> 能力画像</span>,
            children: (
              <CapabilityPortrait 
                capabilityData={capabilityData} 
                allBranchesCapability={allBranchesCapability}
              />
            )
          },
          {
            key: 'detail',
            label: <span><BarChartOutlined /> 详细分析</span>,
            children: (
              <CapabilityDetail 
                capabilityData={capabilityData}
              />
            )
          },
          {
            key: 'management',
            label: <span><LineChartOutlined /> 管理人员赋值</span>,
            children: (
              <ManagementScore 
                branchId={selectedBranchId}
                branchName={selectedBranch.name}
              />
            )
          }
        ]}
      />
    </div>
  );
};

export default BranchCapability;
