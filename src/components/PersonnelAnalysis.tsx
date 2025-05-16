import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Row, Col } from 'antd';
import './PersonnelAnalysis.css';

interface Branch {
  id?: string;
  name: string;
  ageDistribution?: { [key: string]: number };
  educationDistribution?: { [key: string]: number };
  skillDistribution?: { [key: string]: number };
  titleDistribution?: { [key: string]: number };
}

interface PersonnelAnalysisProps {
  branch?: Branch;
  vertical?: boolean;
}

/**
 * 支部人员分析组件
 */
const PersonnelAnalysis: React.FC<PersonnelAnalysisProps> = ({ branch, vertical = false }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { font: { size: 10 } },
        display: true
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return label + ': ' + value + '%';
          }
        }
      }
    },
    layout: {
      padding: 0
    },
    cutout: '30%' // 减小中心空白区域，使饼图更大
  };

  // 确保branch对象存在并且包含所需的数据
  const hasData = branch && branch.ageDistribution && branch.educationDistribution &&
                  branch.skillDistribution && branch.titleDistribution;

  if (!hasData) {
    return <div className="no-data">暂无人员分析数据</div>;
  }

  // 年龄分布数据
  const ageData = {
    labels: Object.keys(branch.ageDistribution!),
    datasets: [
      {
        data: Object.values(branch.ageDistribution!),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 学历分布数据
  const educationData = {
    labels: Object.keys(branch.educationDistribution!),
    datasets: [
      {
        data: Object.values(branch.educationDistribution!),
        backgroundColor: [
          'rgba(153, 102, 255, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(153, 102, 255, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 技能情况数据
  const skillData = {
    labels: Object.keys(branch.skillDistribution!),
    datasets: [
      {
        data: Object.values(branch.skillDistribution!),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 职称情况数据
  const titleData = {
    labels: Object.keys(branch.titleDistribution!),
    datasets: [
      {
        data: Object.values(branch.titleDistribution!),
        backgroundColor: [
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="personnel-analysis">
      {vertical ? (
        // 垂直布局 - 上下结构
        <Row gutter={[8, 0]}>
          <Col xs={24} sm={12} style={{ marginBottom: '0' }}>
            <div className="chart-container">
              <h3 className="chart-title">年龄分析</h3>
              <div className="chart-wrapper">
                <Pie data={ageData} options={options} />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} style={{ marginBottom: '0' }}>
            <div className="chart-container">
              <h3 className="chart-title">学历分析</h3>
              <div className="chart-wrapper">
                <Pie data={educationData} options={options} />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} style={{ marginTop: '-20px' }}>
            <div className="chart-container">
              <h3 className="chart-title">技能情况</h3>
              <div className="chart-wrapper">
                <Pie data={skillData} options={options} />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} style={{ marginTop: '-20px' }}>
            <div className="chart-container">
              <h3 className="chart-title">职称情况</h3>
              <div className="chart-wrapper">
                <Pie data={titleData} options={options} />
              </div>
            </div>
          </Col>
        </Row>
      ) : (
        // 水平布局 - 默认
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={12} md={6}>
            <div className="chart-container">
              <h3 className="chart-title">年龄分析</h3>
              <div className="chart-wrapper">
                <Pie data={ageData} options={options} />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="chart-container">
              <h3 className="chart-title">学历分析</h3>
              <div className="chart-wrapper">
                <Pie data={educationData} options={options} />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="chart-container">
              <h3 className="chart-title">技能情况</h3>
              <div className="chart-wrapper">
                <Pie data={skillData} options={options} />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="chart-container">
              <h3 className="chart-title">职称情况</h3>
              <div className="chart-wrapper">
                <Pie data={titleData} options={options} />
              </div>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default PersonnelAnalysis;
