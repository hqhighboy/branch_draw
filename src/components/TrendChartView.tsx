import React from 'react';
import { Row, Col, Card, Table } from 'antd';
import { Line } from 'react-chartjs-2';
import { BranchCapabilityData, BaseDimension } from '../interfaces/BranchCapability';

interface TrendChartViewProps {
  data: BranchCapabilityData;
  historicalData?: {
    month: string;
    dimensions: {
      [key: string]: number;
    };
  }[];
}

const TrendChartView: React.FC<TrendChartViewProps> = ({ data, historicalData }) => {
  // 综合能力趋势图数据
  const trendData = {
    labels: data.trendData.months,
    datasets: [
      {
        label: '基础评价得分',
        data: data.trendData.baseScores,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: '管理赋值得分',
        data: data.trendData.managementScores.map(score => score * 10), // 转换为百分制
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: '综合能力得分',
        data: data.trendData.totalScores,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  // 趋势图配置
  const trendOptions = {
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

  // 各维度得分趋势数据
  const dimensionsData = historicalData ? {
    labels: historicalData.map(item => item.month),
    datasets: [
      {
        label: '组织管理水平',
        data: historicalData.map(item => item.dimensions.organizationManagement || 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: '考核指标执行',
        data: historicalData.map(item => item.dimensions.kpiExecution || 0),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: '人才培养创新',
        data: historicalData.map(item => item.dimensions.talentDevelopment || 0),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.1)',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: '党建基础工作',
        data: historicalData.map(item => item.dimensions.partyBuilding || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 2,
        tension: 0.3
      }
    ]
  } : {
    labels: data.trendData.months,
    datasets: [
      {
        label: '组织管理水平',
        data: data.trendData.months.map(() => 
          Math.floor(Math.random() * 10) + data.baseDimensions.organizationManagement.score - 5
        ),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: '考核指标执行',
        data: data.trendData.months.map(() => 
          Math.floor(Math.random() * 10) + data.baseDimensions.kpiExecution.score - 5
        ),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: '人才培养创新',
        data: data.trendData.months.map(() => 
          Math.floor(Math.random() * 10) + data.baseDimensions.talentDevelopment.score - 5
        ),
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.1)',
        borderWidth: 2,
        tension: 0.3
      },
      {
        label: '党建基础工作',
        data: data.trendData.months.map(() => 
          Math.floor(Math.random() * 10) + data.baseDimensions.partyBuilding.score - 5
        ),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  // 表格数据
  const tableColumns = [
    {
      title: '评价维度',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      sorter: (a: BaseDimension, b: BaseDimension) => a.score - b.score,
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => `${weight * 100}%`,
    },
    {
      title: '加权得分',
      dataIndex: 'weightedScore',
      key: 'weightedScore',
      sorter: (a: BaseDimension, b: BaseDimension) => a.weightedScore - b.weightedScore,
    },
    {
      title: '等级',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend: string) => {
        if (trend === 'up') return <span style={{ color: 'green' }}>↑</span>;
        if (trend === 'down') return <span style={{ color: 'red' }}>↓</span>;
        return <span>→</span>;
      },
    },
  ];

  const tableData = [
    data.baseDimensions.organizationManagement,
    data.baseDimensions.kpiExecution,
    data.baseDimensions.talentDevelopment,
    data.baseDimensions.partyBuilding,
    data.baseDimensions.taskFollowUp,
    data.baseDimensions.safetyCompliance,
    data.baseDimensions.satisfaction,
  ];

  return (
    <div className="trend-chart-view">
      <Row gutter={16}>
        <Col span={24}>
          <Card title="综合能力趋势图" bordered={false}>
            <div className="line-container">
              <Line data={trendData} options={trendOptions} />
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="各维度得分趋势" bordered={false}>
            <div className="multi-line-container">
              <Line 
                data={dimensionsData} 
                options={{
                  ...trendOptions,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: 12,
                        font: {
                          size: 10
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="维度评分详情" bordered={false}>
            <Table 
              columns={tableColumns} 
              dataSource={tableData}
              rowKey="name"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TrendChartView;
