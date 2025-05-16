import React, { useEffect, useState } from 'react';
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
import { Spin } from 'antd';
import './AllBranchesRadarSection.css';

// 注册 ChartJS 组件
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// 定义支部能力评估数据结构
interface BranchCapability {
  id: string;
  name: string;
  managementLevel: number;
  kpiExecution: number;
  talentDevelopment: number;
  partyBuildingEffectiveness: number;
  taskFollowUp: number;
  safetyCompliance: number;
  overallScore: number;
}

interface Branch {
  id?: string;
  name: string;
}

interface AllBranchesRadarSectionProps {
  branches?: Branch[];
  selectedBranch?: Branch;
}

const AllBranchesRadarSection: React.FC<AllBranchesRadarSectionProps> = ({ selectedBranch }) => {
  const [loading, setLoading] = useState(true);
  const [branchesData, setBranchesData] = useState<BranchCapability[]>([]);

  useEffect(() => {
    // 模拟从API获取数据
    const fetchData = async () => {
      try {
        // 这里应该是实际的API调用
        // const response = await fetch('/api/branches/capabilities');
        // const data = await response.json();

        // 模拟数据
        const mockData: BranchCapability[] = [
          {
            id: '1',
            name: '输电运检党支部',
            managementLevel: 85,
            kpiExecution: 92,
            talentDevelopment: 78,
            partyBuildingEffectiveness: 88,
            taskFollowUp: 90,
            safetyCompliance: 95,
            overallScore: 88
          },
          {
            id: '2',
            name: '变电运检党支部',
            managementLevel: 82,
            kpiExecution: 88,
            talentDevelopment: 75,
            partyBuildingEffectiveness: 85,
            taskFollowUp: 87,
            safetyCompliance: 92,
            overallScore: 85
          },
          {
            id: '3',
            name: '配电运检党支部',
            managementLevel: 80,
            kpiExecution: 85,
            talentDevelopment: 72,
            partyBuildingEffectiveness: 82,
            taskFollowUp: 84,
            safetyCompliance: 90,
            overallScore: 82
          },
          {
            id: '4',
            name: '调控中心党支部',
            managementLevel: 88,
            kpiExecution: 94,
            talentDevelopment: 80,
            partyBuildingEffectiveness: 90,
            taskFollowUp: 92,
            safetyCompliance: 96,
            overallScore: 90
          },
          {
            id: '5',
            name: '营销党支部',
            managementLevel: 83,
            kpiExecution: 89,
            talentDevelopment: 76,
            partyBuildingEffectiveness: 86,
            taskFollowUp: 88,
            safetyCompliance: 93,
            overallScore: 86
          },
          {
            id: '6',
            name: '建设党支部',
            managementLevel: 81,
            kpiExecution: 87,
            talentDevelopment: 74,
            partyBuildingEffectiveness: 84,
            taskFollowUp: 86,
            safetyCompliance: 91,
            overallScore: 84
          },
          {
            id: '7',
            name: '物资党支部',
            managementLevel: 79,
            kpiExecution: 84,
            talentDevelopment: 71,
            partyBuildingEffectiveness: 81,
            taskFollowUp: 83,
            safetyCompliance: 89,
            overallScore: 81
          },
          {
            id: '8',
            name: '信息党支部',
            managementLevel: 84,
            kpiExecution: 90,
            talentDevelopment: 77,
            partyBuildingEffectiveness: 87,
            taskFollowUp: 89,
            safetyCompliance: 94,
            overallScore: 87
          },
          {
            id: '9',
            name: '财务党支部',
            managementLevel: 86,
            kpiExecution: 91,
            talentDevelopment: 79,
            partyBuildingEffectiveness: 89,
            taskFollowUp: 91,
            safetyCompliance: 95,
            overallScore: 89
          },
          {
            id: '10',
            name: '综合党支部',
            managementLevel: 78,
            kpiExecution: 83,
            talentDevelopment: 70,
            partyBuildingEffectiveness: 80,
            taskFollowUp: 82,
            safetyCompliance: 88,
            overallScore: 80
          },
          {
            id: '11',
            name: '安监党支部',
            managementLevel: 87,
            kpiExecution: 93,
            talentDevelopment: 81,
            partyBuildingEffectiveness: 91,
            taskFollowUp: 93,
            safetyCompliance: 97,
            overallScore: 90
          }
        ];

        setBranchesData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('获取支部能力数据失败:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 生成雷达图数据
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getRadarData = (branch: BranchCapability) => {
    return {
      labels: [
        '管理水平',
        '指标执行',
        '人才培养',
        '党建成效',
        '任务跟进',
        '安全合规'
      ],
      datasets: [
        {
          label: branch.name,
          data: [
            branch.managementLevel,
            branch.kpiExecution,
            branch.talentDevelopment,
            branch.partyBuildingEffectiveness,
            branch.taskFollowUp,
            branch.safetyCompliance
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
        }
      ]
    };
  };

  // 雷达图配置
  const options = {
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
          }
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

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="加载数据中..." />
      </div>
    );
  }

  // 将支部分为两行显示：第一行6个，第二行5个
  const firstRowBranches = branchesData.slice(0, 6);
  const secondRowBranches = branchesData.slice(6);

  // 为每个支部分配不同的颜色
  const branchColors = [
    { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' }, // 蓝色
    { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' }, // 红色
    { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' }, // 青色
    { bg: 'rgba(255, 206, 86, 0.2)', border: 'rgba(255, 206, 86, 1)' }, // 黄色
    { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' }, // 紫色
    { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' }, // 橙色
  ];

  // 生成雷达图数据（带颜色）
  const getRadarDataWithColor = (branch: BranchCapability, colorIndex: number) => {
    if (!branch) {
      console.error('Branch data is null or undefined');
      // 返回默认数据结构，避免null错误
      return {
        labels: [
          '管理水平',
          '指标执行',
          '人才培养',
          '党建成效',
          '任务跟进',
          '安全合规'
        ],
        datasets: [
          {
            label: '暂无数据',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(200, 200, 200, 0.2)',
            borderColor: 'rgba(200, 200, 200, 1)',
            borderWidth: 1,
            pointBackgroundColor: 'rgba(200, 200, 200, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(200, 200, 200, 1)'
          }
        ]
      };
    }

    const color = branchColors[colorIndex % branchColors.length];
    return {
      labels: [
        '管理水平',
        '指标执行',
        '人才培养',
        '党建成效',
        '任务跟进',
        '安全合规'
      ],
      datasets: [
        {
          label: branch.name,
          data: [
            branch.managementLevel,
            branch.kpiExecution,
            branch.talentDevelopment,
            branch.partyBuildingEffectiveness,
            branch.taskFollowUp,
            branch.safetyCompliance
          ],
          backgroundColor: color.bg,
          borderColor: color.border,
          borderWidth: 1,
          pointBackgroundColor: color.border,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: color.border
        }
      ]
    };
  };

  return (
    <div className="all-branches-radar-section">
      {/* 第一行雷达图 */}
      <div className="radar-grid">
        {firstRowBranches && firstRowBranches.length > 0 ? (
          firstRowBranches.map((branch, index) => (
            <div key={branch?.id || `first-row-${index}`} className="radar-item">
              <div className="radar-title">{branch?.name || `支部${index + 1}`}</div>
              <div className="radar-chart-container">
                <Radar data={getRadarDataWithColor(branch, index)} options={options} />
                <div className="radar-score">{branch?.overallScore || 0}分</div>
              </div>
              <div className="radar-buttons">
                <button type="button" className="radar-btn">详细分析</button>
                <button type="button" className="radar-btn">人才画像</button>
              </div>
            </div>
          ))
        ) : (
          <div className="radar-item">
            <div className="radar-title">暂无数据</div>
            <div className="radar-chart-container">
              <div className="no-data-message">暂无支部数据</div>
            </div>
          </div>
        )}
      </div>

      {/* 第二行雷达图 */}
      <div className="radar-grid-row-2">
        {secondRowBranches && secondRowBranches.length > 0 ? (
          secondRowBranches.map((branch, index) => (
            <div key={branch?.id || `second-row-${index}`} className="radar-item">
              <div className="radar-title">{branch?.name || `支部${index + firstRowBranches.length + 1}`}</div>
              <div className="radar-chart-container">
                <Radar data={getRadarDataWithColor(branch, index + (firstRowBranches?.length || 0))} options={options} />
                <div className="radar-score">{branch?.overallScore || 0}分</div>
              </div>
              <div className="radar-buttons">
                <button type="button" className="radar-btn">详细分析</button>
                <button type="button" className="radar-btn">人才画像</button>
              </div>
            </div>
          ))
        ) : (
          <div className="radar-item">
            <div className="radar-title">暂无数据</div>
            <div className="radar-chart-container">
              <div className="no-data-message">暂无支部数据</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBranchesRadarSection;
