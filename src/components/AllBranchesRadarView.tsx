import React, { useEffect, useState } from 'react';
import { Row, Col, Spin } from 'antd';
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
import './AllBranchesRadarView.css';

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
  branchId: string;
  branchName: string;
  talentEquivalent: number; // 人才当量
  indicatorCompletion: number; // 指标完成
  taskCompletion: number; // 任务完成
  ideologicalLeadership: number; // 思想引领
  propagandaEffectiveness: number; // 宣传成效
  honorAchievement: number; // 荣誉成效
}

const AllBranchesRadarView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [branchesData, setBranchesData] = useState<BranchCapability[]>([]);

  // 颜色配置 - 使用参考图片的配色方案
  const colors = [
    { bg: 'rgba(173, 216, 230, 0.3)', border: 'rgb(135, 206, 250)' },  // 淡蓝色
    { bg: 'rgba(255, 182, 193, 0.3)', border: 'rgb(255, 105, 180)' },  // 粉色
    { bg: 'rgba(152, 251, 152, 0.3)', border: 'rgb(60, 179, 113)' },   // 淡绿色
    { bg: 'rgba(255, 218, 185, 0.3)', border: 'rgb(255, 165, 0)' },    // 橙色
    { bg: 'rgba(221, 160, 221, 0.3)', border: 'rgb(186, 85, 211)' },   // 紫色
    { bg: 'rgba(255, 228, 181, 0.3)', border: 'rgb(255, 215, 0)' },    // 金色
    { bg: 'rgba(176, 224, 230, 0.3)', border: 'rgb(70, 130, 180)' },   // 钢蓝色
    { bg: 'rgba(255, 192, 203, 0.3)', border: 'rgb(255, 20, 147)' },   // 深粉色
    { bg: 'rgba(144, 238, 144, 0.3)', border: 'rgb(46, 139, 87)' },    // 海绿色
    { bg: 'rgba(255, 160, 122, 0.3)', border: 'rgb(255, 99, 71)' },    // 番茄色
    { bg: 'rgba(216, 191, 216, 0.3)', border: 'rgb(153, 50, 204)' }    // 深紫色
  ];

  // 雷达图配置 - 参考图片样式
  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
          font: {
            size: 8 // 刻度字体大小，减小
          },
          showLabelBackdrop: false,
          padding: 5,
          color: '#666',
          display: true
        },
        pointLabels: {
          font: {
            size: 10, // 标签字体大小，减小
            weight: 'bold' as const // 加粗显示
          },
          color: '#0056A4', // 使用南网蓝色
          padding: 8 // 内边距
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.2)', // 线条颜色
          lineWidth: 1 // 线宽
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.15)', // 网格颜色
          circular: false // 设置为false，使用多边形而不是圆形
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 86, 164, 0.8)', // 使用南网蓝色
        titleFont: {
          size: 13,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 12
        },
        padding: 8,
        displayColors: true
      }
    },
    elements: {
      line: {
        tension: 0, // 设置为0，使用直线而不是曲线
        borderWidth: 2 // 线条宽度
      },
      point: {
        hitRadius: 5, // 点击区域
        hoverRadius: 4, // 悬停半径
        radius: 3 // 点的大小
      }
    },
    animation: {
      duration: 1000 // 动画持续时间
    },
    maintainAspectRatio: false,
    responsive: true
  } as const;

  useEffect(() => {
    // 模拟加载数据
    setLoading(true);

    try {
      // 使用参考图片中的支部名称
      const branchNames = [
        '党建人事党支部',
        '综合党支部',
        '生产技术党支部',
        '安监党支部',
        '数字运行党支部',
        '检修试验党支部',
        '继保自动化党支部',
        '500kV科北数字巡维中心党支部',
        '500kV北郊数字巡维中心党支部',
        '220kV罗涌数字巡维中心党支部',
        '220kV田心数字巡维中心党支部'
      ];

      // 生成11个支部的模拟数据
      const mockData: BranchCapability[] = [];

      // 为每个支部生成更加合理的数据，确保数据在40-100之间，模拟真实情况
      for (let i = 0; i < branchNames.length; i++) {
        // 基础值在40-60之间
        const baseValue = 40 + Math.floor(Math.random() * 20);

        // 为每个指标生成不同的随机增量，使数据更加多样化
        mockData.push({
          branchId: `branch-${i + 1}`,
          branchName: branchNames[i],
          talentEquivalent: baseValue + Math.floor(Math.random() * 40),
          indicatorCompletion: baseValue + Math.floor(Math.random() * 40),
          taskCompletion: baseValue + Math.floor(Math.random() * 40),
          ideologicalLeadership: baseValue + Math.floor(Math.random() * 40),
          propagandaEffectiveness: baseValue + Math.floor(Math.random() * 40),
          honorAchievement: baseValue + Math.floor(Math.random() * 40)
        });
      }

      console.log('生成的模拟数据:', mockData);
      setBranchesData(mockData);
    } catch (error) {
      console.error('生成模拟数据时出错:', error);
      // 确保即使出错也设置一个空数组，而不是undefined或null
      setBranchesData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 将支部数据分成两行显示，第一行6个，第二行5个
  // 确保branchesData是数组
  const firstRow = Array.isArray(branchesData) ? branchesData.slice(0, 6) : [];
  const secondRow = Array.isArray(branchesData) ? branchesData.slice(6) : [];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="加载数据中..." />
      </div>
    );
  }

  return (
    <div className="all-branches-radar-view">
      <h2 className="section-title">支部综合能力画像</h2>

      {/* 第一行雷达图 - 6个 */}
      <Row gutter={[16, 16]} className="radar-row">
        {firstRow.map((branch, index) => (
          <Col key={branch.branchId} className="radar-col">
            <div className="radar-card">
              <h3 className="radar-title">{branch.branchName}</h3>
              <div className="radar-chart-container">
                <Radar
                  data={{
                    labels: ['人才当量', '指标完成', '任务完成', '思想引领', '宣传成效', '荣誉成效'],
                    datasets: [
                      {
                        label: branch.branchName,
                        data: [
                          branch.talentEquivalent,
                          branch.indicatorCompletion,
                          branch.taskCompletion,
                          branch.ideologicalLeadership,
                          branch.propagandaEffectiveness,
                          branch.honorAchievement
                        ],
                        backgroundColor: colors[index % colors.length].bg,
                        borderColor: colors[index % colors.length].border,
                        borderWidth: 1.5,
                        pointBackgroundColor: colors[index % colors.length].border,
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: colors[index % colors.length].border,
                        pointRadius: 2,
                        pointHoverRadius: 4,
                        pointBorderWidth: 1
                      }
                    ]
                  }}
                  options={radarOptions}
                />
              </div>
              <div className="button-container">
                <button type="button" className="action-button">详情</button>
                <button type="button" className="action-button">人才画像</button>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* 第二行雷达图 - 5个 */}
      <Row gutter={[16, 16]} className="radar-row">
        {secondRow.map((branch, index) => (
          <Col key={branch.branchId} className="radar-col">
            <div className="radar-card">
              <h3 className="radar-title">{branch.branchName}</h3>
              <div className="radar-chart-container">
                <Radar
                  data={{
                    labels: ['人才当量', '指标完成', '任务完成', '思想引领', '宣传成效', '荣誉成效'],
                    datasets: [
                      {
                        label: branch.branchName,
                        data: [
                          branch.talentEquivalent,
                          branch.indicatorCompletion,
                          branch.taskCompletion,
                          branch.ideologicalLeadership,
                          branch.propagandaEffectiveness,
                          branch.honorAchievement
                        ],
                        backgroundColor: colors[(index + 6) % colors.length].bg,
                        borderColor: colors[(index + 6) % colors.length].border,
                        borderWidth: 1.5,
                        pointBackgroundColor: colors[(index + 6) % colors.length].border,
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: colors[(index + 6) % colors.length].border,
                        pointRadius: 2,
                        pointHoverRadius: 4,
                        pointBorderWidth: 1
                      }
                    ]
                  }}
                  options={radarOptions}
                />
              </div>
              <div className="button-container">
                <button type="button" className="action-button">详情</button>
                <button type="button" className="action-button">人才画像</button>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AllBranchesRadarView;
