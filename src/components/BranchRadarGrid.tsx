import React from 'react';
import { Row, Col, Card } from 'antd';
import { Radar } from 'react-chartjs-2';
import './BranchRadarGrid.css';

interface Branch {
  id: string;
  name: string;
}

interface BranchRadarGridProps {
  branches: Branch[];
  branchesData: any;
  radarOptions: any;
}

/**
 * 支部雷达图网格组件 - 以网格形式显示所有支部的雷达图
 * 第一行显示6个支部，第二行显示5个支部
 */
const BranchRadarGrid: React.FC<BranchRadarGridProps> = ({ branches, branchesData, radarOptions }) => {
  // 生成单个支部的雷达图数据
  const getSingleBranchRadarData = (branchId: string) => {
    // 检查 branchesData 是否存在
    if (!branchesData || Object.keys(branchesData).length === 0) {
      console.error('branchesData is null or empty');
      return {
        labels: ['暂无数据'],
        datasets: [{
          label: '暂无数据',
          data: [0],
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

    const branchData = branchesData[branchId];
    if (!branchData) {
      console.error(`Branch data for ID ${branchId} not found`);
      return {
        labels: ['暂无数据'],
        datasets: [{
          label: '暂无数据',
          data: [0],
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

    const dimensions = branchData.dimensions;

    // 检查 dimensions 是否存在
    if (!dimensions || dimensions.length === 0) {
      console.error(`Dimensions for branch ID ${branchId} not found or empty`);
      return {
        labels: ['暂无数据'],
        datasets: [{
          label: '暂无数据',
          data: [0],
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

  // 将支部分为两行
  const firstRowBranches = branches.slice(0, 6);
  const secondRowBranches = branches.slice(6);

  return (
    <div className="branch-radar-grid">
      {/* 第一行 - 6个支部 */}
      <Row gutter={[16, 16]} className="radar-row">
        {firstRowBranches.map(branch => (
          <Col xs={24} sm={12} md={8} lg={4} key={branch.id} className="radar-col">
            <Card
              title={branch.name}
              className="radar-card"
              headStyle={{ padding: '0 8px', fontSize: '14px', textAlign: 'center' }}
              bodyStyle={{ padding: '8px' }}
            >
              <div className="radar-container">
                <Radar
                  data={getSingleBranchRadarData(branch.id) as any}
                  options={{
                    ...radarOptions,
                    plugins: {
                      ...radarOptions.plugins,
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 第二行 - 5个支部 */}
      <Row gutter={[16, 16]} className="radar-row">
        <Col xs={0} sm={0} md={0} lg={2} className="radar-col"></Col>
        {secondRowBranches.map(branch => (
          <Col xs={24} sm={12} md={8} lg={4} key={branch.id} className="radar-col">
            <Card
              title={branch.name}
              className="radar-card"
              headStyle={{ padding: '0 8px', fontSize: '14px', textAlign: 'center' }}
              bodyStyle={{ padding: '8px' }}
            >
              <div className="radar-container">
                <Radar
                  data={getSingleBranchRadarData(branch.id) as any}
                  options={{
                    ...radarOptions,
                    plugins: {
                      ...radarOptions.plugins,
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </Card>
          </Col>
        ))}
        <Col xs={0} sm={0} md={0} lg={2} className="radar-col"></Col>
      </Row>
    </div>
  );
};

export default BranchRadarGrid;
