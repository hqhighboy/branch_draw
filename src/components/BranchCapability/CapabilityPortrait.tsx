/**
 * @file 支部能力画像雷达图组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { useState } from 'react';
import { Tabs, Select, Row, Col } from 'antd';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { BranchCapability } from '../../types';
import EmptyState from '../common/EmptyState';
import './CapabilityPortrait.css';

// 注册 ChartJS 组件
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// 组件属性
interface CapabilityPortraitProps {
  capabilityData: BranchCapability | null;
  allBranchesCapability: BranchCapability[];
}

/**
 * 支部能力画像雷达图组件
 * @param {CapabilityPortraitProps} props 组件属性
 * @returns {JSX.Element} 支部能力画像雷达图组件
 */
const CapabilityPortrait: React.FC<CapabilityPortraitProps> = ({ 
  capabilityData, 
  allBranchesCapability 
}) => {
  // 状态
  const [activeTab, setActiveTab] = useState<string>('single');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  
  // 颜色配置
  const colors = [
    { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' }, // 蓝色
    { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' }, // 红色
    { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' }, // 青色
    { bg: 'rgba(255, 206, 86, 0.2)', border: 'rgba(255, 206, 86, 1)' }, // 黄色
    { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' }, // 紫色
    { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' }, // 橙色
    { bg: 'rgba(201, 203, 207, 0.2)', border: 'rgba(201, 203, 207, 1)' }, // 灰色
    { bg: 'rgba(106, 176, 76, 0.2)', border: 'rgba(106, 176, 76, 1)' }, // 绿色
  ];
  
  /**
   * 处理标签页切换
   * @param {string} key 标签页键值
   */
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };
  
  /**
   * 处理支部选择变化
   * @param {string[]} values 选中的支部ID数组
   */
  const handleBranchSelectionChange = (values: string[]) => {
    setSelectedBranches(values);
  };
  
  /**
   * 获取单个支部雷达图数据
   * @returns {object} 雷达图数据
   */
  const getSingleRadarData = () => {
    if (!capabilityData) {
      return {
        labels: ['管理水平', 'KPI执行', '人才培养', '党建工作', '任务跟进', '安全合规', '创新能力', '团队协作', '资源利用'],
        datasets: [
          {
            label: '暂无数据',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(200, 200, 200, 0.2)',
            borderColor: 'rgba(200, 200, 200, 1)',
            borderWidth: 1
          }
        ]
      };
    }
    
    return {
      labels: ['管理水平', 'KPI执行', '人才培养', '党建工作', '任务跟进', '安全合规', '创新能力', '团队协作', '资源利用'],
      datasets: [
        {
          label: capabilityData.branchName,
          data: [
            capabilityData.managementLevel,
            capabilityData.kpiExecution,
            capabilityData.talentDevelopment,
            capabilityData.partyBuilding,
            capabilityData.taskFollowUp,
            capabilityData.safetyCompliance,
            capabilityData.innovationCapability,
            capabilityData.teamCollaboration,
            capabilityData.resourceUtilization
          ],
          backgroundColor: colors[0].bg,
          borderColor: colors[0].border,
          borderWidth: 1
        }
      ]
    };
  };
  
  /**
   * 获取多个支部对比雷达图数据
   * @returns {object} 雷达图数据
   */
  const getComparisonRadarData = () => {
    if (selectedBranches.length === 0 || allBranchesCapability.length === 0) {
      return {
        labels: ['管理水平', 'KPI执行', '人才培养', '党建工作', '任务跟进', '安全合规', '创新能力', '团队协作', '资源利用'],
        datasets: [
          {
            label: '暂无数据',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(200, 200, 200, 0.2)',
            borderColor: 'rgba(200, 200, 200, 1)',
            borderWidth: 1
          }
        ]
      };
    }
    
    return {
      labels: ['管理水平', 'KPI执行', '人才培养', '党建工作', '任务跟进', '安全合规', '创新能力', '团队协作', '资源利用'],
      datasets: selectedBranches.map((branchId, index) => {
        const branchData = allBranchesCapability.find(item => item.branchId === branchId);
        
        if (!branchData) {
          return {
            label: `支部${index + 1}`,
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: colors[index % colors.length].bg,
            borderColor: colors[index % colors.length].border,
            borderWidth: 1
          };
        }
        
        return {
          label: branchData.branchName,
          data: [
            branchData.managementLevel,
            branchData.kpiExecution,
            branchData.talentDevelopment,
            branchData.partyBuilding,
            branchData.taskFollowUp,
            branchData.safetyCompliance,
            branchData.innovationCapability,
            branchData.teamCollaboration,
            branchData.resourceUtilization
          ],
          backgroundColor: colors[index % colors.length].bg,
          borderColor: colors[index % colors.length].border,
          borderWidth: 1
        };
      })
    };
  };
  
  /**
   * 获取所有支部雷达图网格
   * @returns {JSX.Element} 雷达图网格
   */
  const getAllBranchesRadarGrid = () => {
    if (allBranchesCapability.length === 0) {
      return <EmptyState description="暂无支部能力画像数据" />;
    }
    
    // 将支部分成两行显示，第一行6个，第二行5个
    const firstRow = allBranchesCapability.slice(0, 6);
    const secondRow = allBranchesCapability.slice(6);
    
    return (
      <div className="radar-grid">
        <Row gutter={[16, 16]}>
          {firstRow.map((branch, index) => (
            <Col key={branch.branchId} xs={24} sm={12} md={8} lg={4}>
              <div className="radar-item">
                <h4 className="radar-title">{branch.branchName}</h4>
                <div className="radar-chart">
                  <Radar 
                    data={{
                      labels: ['管理水平', 'KPI执行', '人才培养', '党建工作', '任务跟进', '安全合规', '创新能力', '团队协作', '资源利用'],
                      datasets: [
                        {
                          label: branch.branchName,
                          data: [
                            branch.managementLevel,
                            branch.kpiExecution,
                            branch.talentDevelopment,
                            branch.partyBuilding,
                            branch.taskFollowUp,
                            branch.safetyCompliance,
                            branch.innovationCapability,
                            branch.teamCollaboration,
                            branch.resourceUtilization
                          ],
                          backgroundColor: colors[index % colors.length].bg,
                          borderColor: colors[index % colors.length].border,
                          borderWidth: 1
                        }
                      ]
                    }}
                    options={radarOptions}
                  />
                </div>
                <div className="radar-score">
                  <span className="score-label">综合得分</span>
                  <span className="score-value">{branch.overallScore}</span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
        
        {secondRow.length > 0 && (
          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            {secondRow.map((branch, index) => (
              <Col key={branch.branchId} xs={24} sm={12} md={8} lg={4}>
                <div className="radar-item">
                  <h4 className="radar-title">{branch.branchName}</h4>
                  <div className="radar-chart">
                    <Radar 
                      data={{
                        labels: ['管理水平', 'KPI执行', '人才培养', '党建工作', '任务跟进', '安全合规', '创新能力', '团队协作', '资源利用'],
                        datasets: [
                          {
                            label: branch.branchName,
                            data: [
                              branch.managementLevel,
                              branch.kpiExecution,
                              branch.talentDevelopment,
                              branch.partyBuilding,
                              branch.taskFollowUp,
                              branch.safetyCompliance,
                              branch.innovationCapability,
                              branch.teamCollaboration,
                              branch.resourceUtilization
                            ],
                            backgroundColor: colors[(index + 6) % colors.length].bg,
                            borderColor: colors[(index + 6) % colors.length].border,
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={radarOptions}
                    />
                  </div>
                  <div className="radar-score">
                    <span className="score-label">综合得分</span>
                    <span className="score-value">{branch.overallScore}</span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>
    );
  };
  
  // 雷达图配置
  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
          color: '#666',
          font: {
            size: 10
          }
        },
        pointLabels: {
          font: {
            size: 10
          },
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    maintainAspectRatio: false
  };
  
  return (
    <div className="capability-portrait">
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        className="portrait-tabs"
        items={[
          {
            key: 'single',
            label: '当前支部',
            children: (
              <div className="single-radar">
                <div className="radar-container">
                  <Radar data={getSingleRadarData()} options={{
                    ...radarOptions,
                    plugins: {
                      ...radarOptions.plugins,
                      legend: {
                        display: true,
                        position: 'top'
                      }
                    },
                    scales: {
                      ...radarOptions.scales,
                      r: {
                        ...radarOptions.scales.r,
                        pointLabels: {
                          ...radarOptions.scales.r.pointLabels,
                          display: true,
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }} />
                </div>
              </div>
            )
          },
          {
            key: 'comparison',
            label: '支部对比',
            children: (
              <div className="comparison-radar">
                <div className="controls">
                  <Select
                    mode="multiple"
                    placeholder="选择要对比的支部"
                    value={selectedBranches}
                    onChange={handleBranchSelectionChange}
                    style={{ width: '100%', maxWidth: 500 }}
                    options={allBranchesCapability.map(branch => ({
                      value: branch.branchId,
                      label: branch.branchName
                    }))}
                  />
                </div>
                <div className="radar-container">
                  <Radar data={getComparisonRadarData()} options={{
                    ...radarOptions,
                    plugins: {
                      ...radarOptions.plugins,
                      legend: {
                        display: true,
                        position: 'top'
                      }
                    },
                    scales: {
                      ...radarOptions.scales,
                      r: {
                        ...radarOptions.scales.r,
                        pointLabels: {
                          ...radarOptions.scales.r.pointLabels,
                          display: true,
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }} />
                </div>
              </div>
            )
          },
          {
            key: 'all',
            label: '全部支部',
            children: getAllBranchesRadarGrid()
          }
        ]}
      />
    </div>
  );
};

export default CapabilityPortrait;
