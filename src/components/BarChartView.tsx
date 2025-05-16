import React from 'react';
import { Row, Col, Card } from 'antd';
import { Bar, Pie } from 'react-chartjs-2';
import { BranchCapabilityData } from '../interfaces/BranchCapability';

interface BarChartViewProps {
  data: BranchCapabilityData;
  averageData?: number[];
  rankData?: { name: string; score: number }[];
}

const BarChartView: React.FC<BarChartViewProps> = ({ 
  data, 
  averageData,
  rankData = []
}) => {
  // 各维度得分对比数据
  const dimensionsData = {
    labels: [
      '组织管理水平',
      '考核指标执行',
      '人才培养创新',
      '党建基础工作',
      '任务跟进落实',
      '安全廉洁底线',
      '群众满意度',
      '管理赋值'
    ],
    datasets: [
      {
        label: data.name,
        data: [
          data.baseDimensions.organizationManagement.score,
          data.baseDimensions.kpiExecution.score,
          data.baseDimensions.talentDevelopment.score,
          data.baseDimensions.partyBuilding.score,
          data.baseDimensions.taskFollowUp.score,
          data.baseDimensions.safetyCompliance.score,
          data.baseDimensions.satisfaction.score,
          data.managementScore * 10 // 将管理赋值转换为百分制
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      },
      ...(averageData ? [{
        label: '平均水平',
        data: averageData,
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }] : [])
    ]
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
        position: 'top' as const
      }
    },
    maintainAspectRatio: false
  };

  // 支部排名数据
  const rankingData = {
    labels: rankData.map(item => item.name),
    datasets: [
      {
        label: '综合得分',
        data: rankData.map(item => item.score),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)'
        ],
        borderWidth: 1
      }
    ]
  };

  // 排名柱状图配置
  const rankOptions = {
    indexAxis: 'y' as const,
    scales: {
      x: {
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

  // 管理赋值分布数据
  const scoreTypes = data.managementScores.reduce((acc, score) => {
    acc[score.type] = (acc[score.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(scoreTypes),
    datasets: [
      {
        data: Object.values(scoreTypes),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)'
        ],
        borderWidth: 1
      }
    ]
  };

  // 饼图配置
  const pieOptions = {
    plugins: {
      legend: {
        position: 'right' as const
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="bar-chart-view">
      <Row gutter={16}>
        <Col span={24}>
          <Card title="各维度得分对比" bordered={false}>
            <div className="bar-container">
              <Bar data={dimensionsData} options={barOptions} />
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="支部排名情况" bordered={false}>
            <div className="rank-container">
              <Bar data={rankingData} options={rankOptions} />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="管理赋值分布" bordered={false}>
            <div className="pie-container">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BarChartView;
