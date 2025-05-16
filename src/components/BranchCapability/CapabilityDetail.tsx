/**
 * @file 支部能力画像详细分析组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React from 'react';
import { Row, Col, Progress, Card } from 'antd';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { BranchCapability } from '../../types';
import EmptyState from '../common/EmptyState';
import './CapabilityDetail.css';

// 注册 ChartJS 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// 组件属性
interface CapabilityDetailProps {
  capabilityData: BranchCapability | null;
}

/**
 * 支部能力画像详细分析组件
 * @param {CapabilityDetailProps} props 组件属性
 * @returns {JSX.Element} 支部能力画像详细分析组件
 */
const CapabilityDetail: React.FC<CapabilityDetailProps> = ({ capabilityData }) => {
  // 无数据
  if (!capabilityData) {
    return <EmptyState description="暂无支部能力画像数据" />;
  }

  // 维度数据
  const dimensions = [
    { key: 'managementLevel', name: '管理水平', value: capabilityData.managementLevel, color: '#1890ff' },
    { key: 'kpiExecution', name: 'KPI执行', value: capabilityData.kpiExecution, color: '#f5222d' },
    { key: 'talentDevelopment', name: '人才培养', value: capabilityData.talentDevelopment, color: '#52c41a' },
    { key: 'partyBuilding', name: '党建工作', value: capabilityData.partyBuilding, color: '#faad14' },
    { key: 'taskFollowUp', name: '任务跟进', value: capabilityData.taskFollowUp, color: '#722ed1' },
    { key: 'safetyCompliance', name: '安全合规', value: capabilityData.safetyCompliance, color: '#13c2c2' },
    { key: 'innovationCapability', name: '创新能力', value: capabilityData.innovationCapability, color: '#eb2f96' },
    { key: 'teamCollaboration', name: '团队协作', value: capabilityData.teamCollaboration, color: '#fa541c' },
    { key: 'resourceUtilization', name: '资源利用', value: capabilityData.resourceUtilization, color: '#a0d911' }
  ];

  // 柱状图数据
  const barData = {
    labels: dimensions.map(dim => dim.name),
    datasets: [
      {
        label: '维度得分',
        data: dimensions.map(dim => dim.value),
        backgroundColor: dimensions.map(dim => `${dim.color}99`),
        borderColor: dimensions.map(dim => dim.color),
        borderWidth: 1
      }
    ]
  };

  // 柱状图配置
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}分`;
          }
        }
      }
    }
  };

  // 获取得分等级
  const getScoreLevel = (score: number) => {
    if (score >= 90) return { text: '优秀', color: '#52c41a' };
    if (score >= 80) return { text: '良好', color: '#1890ff' };
    if (score >= 70) return { text: '一般', color: '#faad14' };
    if (score >= 60) return { text: '及格', color: '#fa8c16' };
    return { text: '不及格', color: '#f5222d' };
  };

  // 综合得分等级
  const overallLevel = getScoreLevel(capabilityData.overallScore);

  return (
    <div className="capability-detail">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="综合能力评分" className="score-card">
            <div className="overall-score">
              <div className="score-circle">
                <Progress
                  type="circle"
                  percent={capabilityData.overallScore}
                  format={percent => `${percent}`}
                  width={120}
                  strokeColor={overallLevel.color}
                />
              </div>
              <div className="score-info">
                <div className="score-level" style={{ color: overallLevel.color }}>
                  {overallLevel.text}
                </div>
                <div className="score-desc">
                  {capabilityData.branchName}的综合能力评分为{capabilityData.overallScore}分，
                  处于{overallLevel.text}水平。
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="维度得分分布" className="dimension-card">
            <div className="dimension-chart">
              <Bar data={barData} options={barOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="维度详细分析" className="analysis-card" style={{ marginTop: '16px' }}>
        <Row gutter={[16, 16]}>
          {dimensions.map(dimension => {
            const level = getScoreLevel(dimension.value);
            return (
              <Col key={dimension.key} xs={24} sm={12} md={8}>
                <div className="dimension-item">
                  <div className="dimension-header">
                    <span className="dimension-name">{dimension.name}</span>
                    <span className="dimension-value" style={{ color: dimension.color }}>{dimension.value}</span>
                  </div>
                  <Progress
                    percent={dimension.value}
                    strokeColor={dimension.color}
                    showInfo={false}
                  />
                  <div className="dimension-level">
                    <span className="level-label">等级：</span>
                    <span className="level-value" style={{ color: level.color }}>{level.text}</span>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Card>
    </div>
  );
};

export default CapabilityDetail;
