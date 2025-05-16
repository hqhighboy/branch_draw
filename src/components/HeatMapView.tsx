import React, { useState } from 'react';
import { Row, Col, Card, Table, Typography, Tabs, Empty } from 'antd';
import { BranchCapabilityData } from '../interfaces/BranchCapability';

const { Title } = Typography;
const { TabPane } = Tabs;

interface HeatMapViewProps {
  data: BranchCapabilityData;
  allBranchesData?: BranchCapabilityData[];
}

const HeatMapView: React.FC<HeatMapViewProps> = ({ data, allBranchesData = [] }) => {
  const [activeTab, setActiveTab] = useState<string>('dimension');
  const [selectedBranch, setSelectedBranch] = useState<BranchCapabilityData | null>(data);

  // 获取热力图等级
  const getHeatMapLevel = (value: number) => {
    if (value >= 90) return 'excellent';
    if (value >= 80) return 'good';
    if (value >= 70) return 'average';
    if (value >= 60) return 'fair';
    if (value >= 20) return 'poor';
    return 'empty';
  };

  // 生成热力图单元格
  const renderHeatMapCell = (value: number) => {
    if (value === undefined || value === null) {
      return <div className="heat-map-cell heat-map-empty">-</div>;
    }

    const level = getHeatMapLevel(value);
    const className = `heat-map-cell heat-map-${level}`;

    return (
      <div className={className}>
        {value}
      </div>
    );
  };

  // 月度热力图数据
  const monthlyHeatMapColumns = data.trendData.months.map(month => ({
    title: month,
    dataIndex: month,
    key: month,
    render: renderHeatMapCell
  }));

  const monthlyHeatMapData = [
    {
      key: 'baseScore',
      dimension: '基础评价得分',
      ...data.trendData.months.reduce((acc, month, index) => {
        acc[month] = data.trendData.baseScores[index];
        return acc;
      }, {} as Record<string, number>)
    },
    {
      key: 'managementScore',
      dimension: '管理赋值得分',
      ...data.trendData.months.reduce((acc, month, index) => {
        acc[month] = data.trendData.managementScores[index] * 10; // 转换为百分制
        return acc;
      }, {} as Record<string, number>)
    },
    {
      key: 'totalScore',
      dimension: '综合能力得分',
      ...data.trendData.months.reduce((acc, month, index) => {
        acc[month] = data.trendData.totalScores[index];
        return acc;
      }, {} as Record<string, number>)
    }
  ];

  // 维度热力图数据
  const dimensionHeatMapColumns = [
    {
      title: '支部',
      dataIndex: 'branch',
      key: 'branch',
      fixed: 'left' as const,
      width: 200
    },
    {
      title: '组织管理水平',
      dataIndex: 'organizationManagement',
      key: 'organizationManagement',
      render: renderHeatMapCell
    },
    {
      title: '考核指标执行',
      dataIndex: 'kpiExecution',
      key: 'kpiExecution',
      render: renderHeatMapCell
    },
    {
      title: '人才培养创新',
      dataIndex: 'talentDevelopment',
      key: 'talentDevelopment',
      render: renderHeatMapCell
    },
    {
      title: '党建基础工作',
      dataIndex: 'partyBuilding',
      key: 'partyBuilding',
      render: renderHeatMapCell
    },
    {
      title: '任务跟进落实',
      dataIndex: 'taskFollowUp',
      key: 'taskFollowUp',
      render: renderHeatMapCell
    },
    {
      title: '安全廉洁底线',
      dataIndex: 'safetyCompliance',
      key: 'safetyCompliance',
      render: renderHeatMapCell
    },
    {
      title: '群众满意度',
      dataIndex: 'satisfaction',
      key: 'satisfaction',
      render: renderHeatMapCell
    },
    {
      title: '管理赋值',
      dataIndex: 'managementScore',
      key: 'managementScore',
      render: (value: number) => renderHeatMapCell(value * 10) // 转换为百分制
    },
    {
      title: '综合得分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      render: renderHeatMapCell
    }
  ];

  const dimensionHeatMapData = allBranchesData.length > 0
    ? allBranchesData.map(branch => ({
        key: branch.id,
        branch: branch.name,
        organizationManagement: branch.baseDimensions.organizationManagement.score,
        kpiExecution: branch.baseDimensions.kpiExecution.score,
        talentDevelopment: branch.baseDimensions.talentDevelopment.score,
        partyBuilding: branch.baseDimensions.partyBuilding.score,
        taskFollowUp: branch.baseDimensions.taskFollowUp.score,
        safetyCompliance: branch.baseDimensions.safetyCompliance.score,
        satisfaction: branch.baseDimensions.satisfaction.score,
        managementScore: branch.managementScore,
        totalScore: branch.totalScore
      }))
    : [{
        key: data.id,
        branch: data.name,
        organizationManagement: data.baseDimensions.organizationManagement.score,
        kpiExecution: data.baseDimensions.kpiExecution.score,
        talentDevelopment: data.baseDimensions.talentDevelopment.score,
        partyBuilding: data.baseDimensions.partyBuilding.score,
        taskFollowUp: data.baseDimensions.taskFollowUp.score,
        safetyCompliance: data.baseDimensions.safetyCompliance.score,
        satisfaction: data.baseDimensions.satisfaction.score,
        managementScore: data.managementScore,
        totalScore: data.totalScore
      }];

  // 生成月度热力图
  const renderMonthlyHeatMap = (branch: BranchCapabilityData) => {
    if (!branch) return <Empty description="请选择支部" />;

    const monthlyColumns = branch.trendData.months.map(month => ({
      title: month,
      dataIndex: month,
      key: month,
      render: renderHeatMapCell
    }));

    const monthlyData = [
      {
        key: 'baseScore',
        dimension: '基础评价得分',
        ...branch.trendData.months.reduce((acc, month, index) => {
          acc[month] = branch.trendData.baseScores[index];
          return acc;
        }, {} as Record<string, number>)
      },
      {
        key: 'managementScore',
        dimension: '管理赋值得分',
        ...branch.trendData.months.reduce((acc, month, index) => {
          acc[month] = branch.trendData.managementScores[index] * 10; // 转换为百分制
          return acc;
        }, {} as Record<string, number>)
      },
      {
        key: 'totalScore',
        dimension: '综合能力得分',
        ...branch.trendData.months.reduce((acc, month, index) => {
          acc[month] = branch.trendData.totalScores[index];
          return acc;
        }, {} as Record<string, number>)
      }
    ];

    return (
      <Table
        columns={[
          {
            title: '维度',
            dataIndex: 'dimension',
            key: 'dimension',
            width: 150
          },
          ...monthlyColumns
        ]}
        dataSource={monthlyData}
        pagination={false}
        bordered
        className="heat-map-table"
      />
    );
  };

  // 生成支部月度热力图
  const renderBranchMonthlyHeatMap = () => {
    // 获取所有月份
    const months = data.trendData.months;

    // 创建表格列
    const columns = [
      {
        title: '支部',
        dataIndex: 'branch',
        key: 'branch',
        fixed: 'left' as const,
        width: 200
      },
      ...months.map(month => ({
        title: month,
        dataIndex: month,
        key: month,
        render: renderHeatMapCell
      }))
    ];

    // 创建表格数据
    const tableData = allBranchesData.map(branch => {
      const rowData: any = {
        key: branch.id,
        branch: branch.name
      };

      // 添加每个月的数据
      months.forEach((month, index) => {
        rowData[month] = branch.trendData.totalScores[index];
      });

      return rowData;
    });

    return (
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: 'max-content' }}
        bordered
        className="heat-map-table"
      />
    );
  };

  return (
    <div className="heatmap-view">
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="heat-map-tabs">
        <TabPane tab="支部维度能力热力图" key="dimension">
          <div className="heatmap-container">
            <Table
              columns={dimensionHeatMapColumns}
              dataSource={dimensionHeatMapData}
              pagination={false}
              scroll={{ x: 'max-content' }}
              bordered
              className="heat-map-table"
              rowClassName="heat-map-row"
            />
          </div>
        </TabPane>
        <TabPane tab="支部月度完成情况热力图" key="monthly-all">
          <div className="heatmap-container">
            {renderBranchMonthlyHeatMap()}
          </div>
        </TabPane>
        <TabPane tab="单支部月度能力变化热力图" key="monthly-single">
          <div className="heatmap-container">
            <div className="branch-selector">
              <label htmlFor="branch-select">选择支部:</label>
              <select
                id="branch-select"
                className="branch-select"
                value={selectedBranch?.id || data.id}
                onChange={(e) => {
                  const branchId = parseInt(e.target.value);
                  const branch = allBranchesData.find(b => b.id === branchId) || data;
                  setSelectedBranch(branch);
                }}
                aria-label="选择支部"
              >
                {allBranchesData.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
            {renderMonthlyHeatMap(selectedBranch || data)}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default HeatMapView;
