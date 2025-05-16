import React, { useState, useEffect } from 'react';
import { Tabs, Spin, Select } from 'antd';
import { Radar, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement
} from 'chart.js';
import BranchRadarGrid from './BranchRadarGrid';
import { createDefaultEvaluationModel } from '../models/evaluationModel';
import { generateBranchesEvaluationData, generateHistoricalData } from '../utils/mockDataGenerator';
import './BranchCapabilityPortrait.css';

// 注册 ChartJS 组件
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement
);

const { TabPane } = Tabs;
const { Option } = Select;

// 定义支部数据类型
interface Branch {
  id: string;
  name: string;
}

interface BranchCapabilityPortraitProps {
  branches: Branch[];
  selectedBranch: Branch | null;
}

/**
 * 支部综合能力画像组件
 */
const BranchCapabilityPortrait: React.FC<BranchCapabilityPortraitProps> = ({ branches, selectedBranch }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('grid');
  const [branchesData, setBranchesData] = useState<any>({});
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('current');

  // 颜色配置
  const dimensionColors = {
    M: { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' }, // 蓝色
    P: { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' }, // 红色
    T: { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' }, // 青色
    B: { bg: 'rgba(255, 206, 86, 0.2)', border: 'rgba(255, 206, 86, 1)' }, // 黄色
    F: { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' }, // 紫色
    S: { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' }, // 橙色
    L: { bg: 'rgba(201, 203, 207, 0.2)', border: 'rgba(201, 203, 207, 1)' }, // 灰色
    D: { bg: 'rgba(106, 176, 76, 0.2)', border: 'rgba(106, 176, 76, 1)' }, // 绿色
  };

  // 初始化数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 创建默认评价模型
        const defaultModel = createDefaultEvaluationModel();

        // 生成所有支部的评价数据
        const allBranchesData = generateBranchesEvaluationData(defaultModel, branches.length);

        // 生成历史数据 (最近6个月)
        const histData = generateHistoricalData(defaultModel, selectedBranch?.id || 'branch_1', 6);

        // 更新状态
        setBranchesData(allBranchesData);
        setHistoricalData(histData);

        // 默认选择前3个支部进行对比
        setSelectedBranches(branches.slice(0, 3).map(b => b.id));
      } catch (error) {
        console.error('获取支部能力数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [branches, selectedBranch]);

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 处理支部选择变化
  const handleBranchSelectionChange = (values: string[]) => {
    setSelectedBranches(values);
  };

  // 处理月份选择变化
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  // 生成雷达图数据
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getRadarData = (branchId: string) => {
    const branchData = branchesData[branchId];
    if (!branchData) return null;

    const dimensions = branchData.dimensions;
    return {
      labels: dimensions.map((d: any) => d.name),
      datasets: [
        {
          label: branches.find(b => b.id === branchId)?.name || branchId,
          data: dimensions.map((d: any) => d.score),
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

  // 生成对比雷达图数据
  const getComparisonRadarData = () => {
    // 检查 branchesData 是否存在
    if (!branchesData || Object.keys(branchesData).length === 0) {
      console.error('branchesData is null or empty');
      // 返回默认数据结构，避免null错误
      return {
        labels: ['管理水平', '指标执行', '人才培养', '党建成效', '任务跟进', '安全合规'],
        datasets: [{
          label: '暂无数据',
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(200, 200, 200, 0.2)',
          borderColor: 'rgba(200, 200, 200, 1)',
          borderWidth: 1,
          pointBackgroundColor: 'rgba(200, 200, 200, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(200, 200, 200, 1)'
        }]
      };
    }

    // 检查是否有选中的支部
    if (!selectedBranches || selectedBranches.length === 0) {
      console.error('No branches selected');
      return {
        labels: ['管理水平', '指标执行', '人才培养', '党建成效', '任务跟进', '安全合规'],
        datasets: [{
          label: '暂无数据',
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(200, 200, 200, 0.2)',
          borderColor: 'rgba(200, 200, 200, 1)',
          borderWidth: 1,
          pointBackgroundColor: 'rgba(200, 200, 200, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(200, 200, 200, 1)'
        }]
      };
    }

    const firstBranchId = Object.keys(branchesData)[0];
    if (!firstBranchId) {
      console.error('No branch IDs found in branchesData');
      return {
        labels: ['管理水平', '指标执行', '人才培养', '党建成效', '任务跟进', '安全合规'],
        datasets: [{
          label: '暂无数据',
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(200, 200, 200, 0.2)',
          borderColor: 'rgba(200, 200, 200, 1)',
          borderWidth: 1,
          pointBackgroundColor: 'rgba(200, 200, 200, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(200, 200, 200, 1)'
        }]
      };
    }

    const dimensions = branchesData[firstBranchId]?.dimensions;

    if (!dimensions || dimensions.length === 0) {
      console.error(`Dimensions for branch ID ${firstBranchId} not found or empty`);
      // 如果维度数据不存在，返回默认数据
      return {
        labels: ['管理水平', '指标执行', '人才培养', '党建成效', '任务跟进', '安全合规'],
        datasets: [{
          label: '暂无数据',
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(200, 200, 200, 0.2)',
          borderColor: 'rgba(200, 200, 200, 1)',
          borderWidth: 1,
          pointBackgroundColor: 'rgba(200, 200, 200, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(200, 200, 200, 1)'
        }]
      };
    }

    // 确保 dimensions 中的每个元素都有 name 属性
    const dimensionLabels = dimensions.map((d: any) => {
      if (!d || typeof d !== 'object') {
        console.error('Invalid dimension object:', d);
        return '未知维度';
      }
      return d.name || '未知维度';
    });

    return {
      labels: dimensionLabels,
      datasets: selectedBranches.map((branchId, index) => {
        const branchData = branchesData[branchId];
        if (!branchData || !branchData.dimensions) {
          console.error(`Branch data for ID ${branchId} not found or missing dimensions`);
          // 如果特定支部数据不存在，返回null，后面会被filter过滤掉
          return null;
        }

        // 循环使用颜色
        const colorKeys = Object.keys(dimensionColors);
        const colorKey = colorKeys[index % colorKeys.length];
        const color = dimensionColors[colorKey as keyof typeof dimensionColors];

        // 确保每个维度都有 score 属性
        const dimensionScores = branchData.dimensions.map((d: any) => {
          if (!d || typeof d !== 'object') {
            console.error('Invalid dimension object:', d);
            return 0;
          }
          return typeof d.score === 'number' ? d.score : 0;
        });

        return {
          label: branches.find(b => b.id === branchId)?.name || branchId,
          data: dimensionScores,
          backgroundColor: color.bg,
          borderColor: color.border,
          borderWidth: 1,
          pointBackgroundColor: color.border,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: color.border
        };
      }).filter(Boolean)
    };
  };

  // 生成维度得分柱状图数据
  const getDimensionBarData = (branchId: string) => {
    // 检查 branchesData 是否存在
    if (!branchesData || Object.keys(branchesData).length === 0) {
      console.error('branchesData is null or empty');
      // 返回默认数据结构，避免null错误
      return {
        labels: ['管理水平', '指标执行', '人才培养', '党建成效', '任务跟进', '安全合规'],
        datasets: [
          {
            label: '维度得分',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: Array(6).fill('rgba(200, 200, 200, 0.2)'),
            borderColor: Array(6).fill('rgba(200, 200, 200, 1)'),
            borderWidth: 1
          }
        ]
      };
    }

    // 检查 branchId 是否有效
    if (!branchId) {
      console.error('Invalid branch ID');
      return {
        labels: ['管理水平', '指标执行', '人才培养', '党建成效', '任务跟进', '安全合规'],
        datasets: [
          {
            label: '维度得分',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: Array(6).fill('rgba(200, 200, 200, 0.2)'),
            borderColor: Array(6).fill('rgba(200, 200, 200, 1)'),
            borderWidth: 1
          }
        ]
      };
    }

    const branchData = branchesData[branchId];
    if (!branchData || !branchData.dimensions) {
      console.error(`Branch data for ID ${branchId} not found or missing dimensions`);
      // 返回默认数据结构，避免null错误
      return {
        labels: ['管理水平', '指标执行', '人才培养', '党建成效', '任务跟进', '安全合规'],
        datasets: [
          {
            label: '维度得分',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: Array(6).fill('rgba(200, 200, 200, 0.2)'),
            borderColor: Array(6).fill('rgba(200, 200, 200, 1)'),
            borderWidth: 1
          }
        ]
      };
    }

    const dimensions = branchData.dimensions;

    // 确保 dimensions 中的每个元素都有 name 和 id 属性
    const dimensionLabels = dimensions.map((d: any) => {
      if (!d || typeof d !== 'object') {
        console.error('Invalid dimension object:', d);
        return '未知维度';
      }
      return d.name || '未知维度';
    });

    // 确保每个维度都有 score 属性
    const dimensionScores = dimensions.map((d: any) => {
      if (!d || typeof d !== 'object') {
        console.error('Invalid dimension object:', d);
        return 0;
      }
      return typeof d.score === 'number' ? d.score : 0;
    });

    // 确保每个维度都有 id 属性，用于获取颜色
    const dimensionBackgroundColors = dimensions.map((d: any) => {
      if (!d || typeof d !== 'object' || !d.id) {
        return 'rgba(54, 162, 235, 0.2)';
      }
      return dimensionColors[d.id as keyof typeof dimensionColors]?.bg || 'rgba(54, 162, 235, 0.2)';
    });

    const dimensionBorderColors = dimensions.map((d: any) => {
      if (!d || typeof d !== 'object' || !d.id) {
        return 'rgba(54, 162, 235, 1)';
      }
      return dimensionColors[d.id as keyof typeof dimensionColors]?.border || 'rgba(54, 162, 235, 1)';
    });

    return {
      labels: dimensionLabels,
      datasets: [
        {
          label: '维度得分',
          data: dimensionScores,
          backgroundColor: dimensionBackgroundColors,
          borderColor: dimensionBorderColors,
          borderWidth: 1
        }
      ]
    };
  };

  // 生成历史趋势图数据
  const getHistoricalTrendData = () => {
    // 检查历史数据是否存在
    if (!historicalData || historicalData.length === 0) {
      console.error('Historical data is null or empty');
      // 返回默认数据结构，避免null错误
      return {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
          {
            label: '综合得分',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(200, 200, 200, 0.2)',
            borderColor: 'rgba(200, 200, 200, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }
        ]
      };
    }

    // 确保每个历史数据项都有 month 属性
    const labels = historicalData.map((item) => {
      if (!item || typeof item !== 'object') {
        console.error('Invalid historical data item:', item);
        return '未知月份';
      }
      return item.month || '未知月份';
    }).reverse();

    // 确保每个历史数据项都有 data.totalScore 属性
    const scores = historicalData.map((item) => {
      if (!item || typeof item !== 'object' || !item.data) {
        console.error('Invalid historical data item or missing data property:', item);
        return 0;
      }
      return typeof item.data.totalScore === 'number' ? item.data.totalScore : 0;
    }).reverse();

    return {
      labels: labels,
      datasets: [
        {
          label: '综合得分',
          data: scores,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }
      ]
    };
  };

  // 生成维度历史趋势图数据
  const getDimensionHistoricalTrendData = () => {
    // 检查历史数据是否存在
    if (!historicalData || historicalData.length === 0) {
      console.error('Historical data is null or empty');
      // 返回默认数据结构，避免null错误
      return {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
          {
            label: '管理水平',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: false
          },
          {
            label: '指标执行',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: false
          }
        ]
      };
    }

    // 获取所有维度，确保数据存在
    if (!historicalData[0]?.data?.dimensions) {
      console.error('First month data is missing or has no dimensions');
      return {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
          {
            label: '暂无数据',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: 'rgba(200, 200, 200, 0.2)',
            borderColor: 'rgba(200, 200, 200, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: false
          }
        ]
      };
    }

    // 确保每个历史数据项都有 month 属性
    const labels = historicalData.map((item) => {
      if (!item || typeof item !== 'object') {
        console.error('Invalid historical data item:', item);
        return '未知月份';
      }
      return item.month || '未知月份';
    }).reverse();

    const dimensions = historicalData[0].data.dimensions;

    return {
      labels: labels,
      datasets: dimensions.map((dimension: any, index: number) => {
        const colorKey = dimension.id as keyof typeof dimensionColors;
        const color = dimensionColors[colorKey] || { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' };

        // 检查维度对象是否有效
        if (!dimension || typeof dimension !== 'object') {
          console.error('Invalid dimension object:', dimension);
          return {
            label: `未知维度${index + 1}`,
            data: Array(labels.length).fill(0),
            backgroundColor: 'rgba(200, 200, 200, 0.2)',
            borderColor: 'rgba(200, 200, 200, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: false
          };
        }

        return {
          label: dimension.name || `维度${index + 1}`,
          data: historicalData.map((item) => {
            if (!item || !item.data || !item.data.dimensions) {
              console.error('Invalid historical data item or missing dimensions:', item);
              return 0;
            }
            const dim = item.data.dimensions.find((d: any) => d.id === dimension.id);
            if (!dim || typeof dim !== 'object') {
              return 0;
            }
            return typeof dim.score === 'number' ? dim.score : 0;
          }).reverse(),
          backgroundColor: color.bg,
          borderColor: color.border,
          borderWidth: 2,
          tension: 0.3,
          fill: false
        };
      })
    };
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
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true
      }
    },
    maintainAspectRatio: false
  };

  // 柱状图配置
  const barOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    },
    plugins: {
      legend: {
        display: false
      }
    },
    maintainAspectRatio: false
  };

  // 线图配置
  const lineOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    },
    plugins: {
      legend: {
        position: 'top' as const
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

  return (
    <div className="branch-capability-portrait">
      <Tabs activeKey={activeTab} onChange={handleTabChange} type="card" className="capability-tabs">
        <TabPane tab="全部支部视图" key="grid">
          <div className="tab-content">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" tip="加载数据中..." />
              </div>
            ) : (
              <BranchRadarGrid
                branches={branches}
                branchesData={branchesData}
                radarOptions={radarOptions}
              />
            )}
          </div>
        </TabPane>
        <TabPane tab="雷达图对比" key="radar">
          <div className="tab-content">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" tip="加载数据中..." />
              </div>
            ) : (
              <>
                <div className="controls">
                  <Select
                    mode="multiple"
                    placeholder="选择要对比的支部"
                    value={selectedBranches}
                    onChange={handleBranchSelectionChange}
                    style={{ width: '100%', maxWidth: 500 }}
                  >
                    {branches.map(branch => (
                      <Option key={branch.id} value={branch.id}>{branch.name}</Option>
                    ))}
                  </Select>
                </div>
                <div className="chart-container radar-chart-container">
                  <Radar data={getComparisonRadarData() as any} options={radarOptions} />
                </div>
              </>
            )}
          </div>
        </TabPane>
        <TabPane tab="维度得分分析" key="dimension">
          <div className="tab-content">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" tip="加载数据中..." />
              </div>
            ) : (
              <div className="chart-container bar-chart-container">
                <Bar data={getDimensionBarData(selectedBranch?.id || 'branch_1') as any} options={barOptions} />
              </div>
            )}
          </div>
        </TabPane>
        <TabPane tab="历史趋势分析" key="trend">
          <div className="tab-content">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" tip="加载数据中..." />
              </div>
            ) : (
              <>
                <div className="controls">
                  <Select
                    placeholder="选择查看的数据"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    style={{ width: 200 }}
                  >
                    <Option value="current">综合得分趋势</Option>
                    <Option value="dimensions">维度得分趋势</Option>
                  </Select>
                </div>
                <div className="chart-container line-chart-container">
                  {selectedMonth === 'current' ? (
                    <Line data={getHistoricalTrendData() as any} options={lineOptions} />
                  ) : (
                    <Line data={getDimensionHistoricalTrendData() as any} options={lineOptions} />
                  )}
                </div>
              </>
            )}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BranchCapabilityPortrait;
