/**
 * @file 支部人员分析组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Row, Col } from 'antd';
import { useBranch } from '../../context/BranchContext';
import { ChartColors, Branch } from '../../types';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import './PersonnelAnalysis.css';

// 组件属性
export interface PersonnelAnalysisProps {
  branch?: Branch | null;
  vertical?: boolean;
}

/**
 * 支部人员分析组件
 * @param {PersonnelAnalysisProps} props 组件属性
 * @returns {JSX.Element} 支部人员分析组件
 */
const PersonnelAnalysis: React.FC<PersonnelAnalysisProps> = ({ branch, vertical = false }) => {
  // 获取支部上下文
  const { selectedBranch, loading, error } = useBranch();

  // 使用传入的 branch 或者上下文中的 selectedBranch
  const branchData = branch || selectedBranch;

  // 图表选项
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
            let label = context.label || '';
            let value = context.raw || 0;
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

  // 加载中
  if (loading && !branch) {
    return <Loading />;
  }

  // 错误
  if (error && !branch) {
    return <ErrorMessage message={error} />;
  }

  // 无数据
  if (!branchData) {
    return <EmptyState description="暂无支部数据" />;
  }

  // 确保branch对象包含所需的数据
  const hasData = branchData &&
                  branchData.ageDistribution &&
                  branchData.educationDistribution &&
                  branchData.partyAgeDistribution &&
                  branchData.positionDistribution;

  if (!hasData) {
    return <EmptyState description="暂无人员分析数据" />;
  }

  // 年龄分布数据
  const ageData = {
    labels: branchData.ageDistribution && Array.isArray(branchData.ageDistribution)
      ? branchData.ageDistribution.map((item: { ageGroup: string }) => item.ageGroup)
      : ['18-28岁', '28-35岁', '35-50岁', '50-60岁'],
    datasets: [
      {
        data: branchData.ageDistribution && Array.isArray(branchData.ageDistribution)
          ? branchData.ageDistribution.map((item: { percentage: number }) => item.percentage)
          : [25, 35, 30, 10],
        backgroundColor: [
          ChartColors.primary,
          ChartColors.success,
          ChartColors.warning,
          ChartColors.error,
          ChartColors.purple
        ],
        borderColor: [
          ChartColors.primary.replace('0.8', '1'),
          ChartColors.success.replace('0.8', '1'),
          ChartColors.warning.replace('0.8', '1'),
          ChartColors.error.replace('0.8', '1'),
          ChartColors.purple.replace('0.8', '1')
        ],
        borderWidth: 1,
      },
    ],
  };

  // 学历分布数据
  const educationData = {
    labels: branchData.educationDistribution && Array.isArray(branchData.educationDistribution)
      ? branchData.educationDistribution.map((item: { educationLevel: string }) => item.educationLevel)
      : ['大专及以下', '本科', '硕士', '博士'],
    datasets: [
      {
        data: branchData.educationDistribution && Array.isArray(branchData.educationDistribution)
          ? branchData.educationDistribution.map((item: { percentage: number }) => item.percentage)
          : [15, 55, 25, 5],
        backgroundColor: [
          ChartColors.purple,
          ChartColors.primary,
          ChartColors.success,
          ChartColors.orange,
          ChartColors.cyan
        ],
        borderColor: [
          ChartColors.purple.replace('0.8', '1'),
          ChartColors.primary.replace('0.8', '1'),
          ChartColors.success.replace('0.8', '1'),
          ChartColors.orange.replace('0.8', '1'),
          ChartColors.cyan.replace('0.8', '1')
        ],
        borderWidth: 1,
      },
    ],
  };

  // 党龄分布数据
  const partyAgeData = {
    labels: branchData.partyAgeDistribution && Array.isArray(branchData.partyAgeDistribution)
      ? branchData.partyAgeDistribution.map((item: { partyAgeGroup: string }) => item.partyAgeGroup)
      : ['1-3年', '3-5年', '5-10年', '10年以上'],
    datasets: [
      {
        data: branchData.partyAgeDistribution && Array.isArray(branchData.partyAgeDistribution)
          ? branchData.partyAgeDistribution.map((item: { percentage: number }) => item.percentage)
          : [20, 30, 35, 15],
        backgroundColor: [
          ChartColors.error,
          ChartColors.primary,
          ChartColors.warning,
          ChartColors.success,
          ChartColors.purple,
        ],
        borderColor: [
          ChartColors.error.replace('0.8', '1'),
          ChartColors.primary.replace('0.8', '1'),
          ChartColors.warning.replace('0.8', '1'),
          ChartColors.success.replace('0.8', '1'),
          ChartColors.purple.replace('0.8', '1'),
        ],
        borderWidth: 1,
      },
    ],
  };

  // 职务分布数据
  const positionData = {
    labels: branchData.positionDistribution && Array.isArray(branchData.positionDistribution)
      ? branchData.positionDistribution.map((item: { position: string }) => item.position)
      : ['普通党员', '支委委员', '支部书记', '其他'],
    datasets: [
      {
        data: branchData.positionDistribution && Array.isArray(branchData.positionDistribution)
          ? branchData.positionDistribution.map((item: { percentage: number }) => item.percentage)
          : [60, 25, 10, 5],
        backgroundColor: [
          ChartColors.orange,
          ChartColors.error,
          ChartColors.primary,
          ChartColors.success,
          ChartColors.geekblue
        ],
        borderColor: [
          ChartColors.orange.replace('0.8', '1'),
          ChartColors.error.replace('0.8', '1'),
          ChartColors.primary.replace('0.8', '1'),
          ChartColors.success.replace('0.8', '1'),
          ChartColors.geekblue.replace('0.8', '1')
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
              <h3 className="chart-title">党龄分析</h3>
              <div className="chart-wrapper">
                <Pie data={partyAgeData} options={options} />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} style={{ marginTop: '-20px' }}>
            <div className="chart-container">
              <h3 className="chart-title">职务分析</h3>
              <div className="chart-wrapper">
                <Pie data={positionData} options={options} />
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
              <h3 className="chart-title">党龄分析</h3>
              <div className="chart-wrapper">
                <Pie data={partyAgeData} options={options} />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="chart-container">
              <h3 className="chart-title">职务分析</h3>
              <div className="chart-wrapper">
                <Pie data={positionData} options={options} />
              </div>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default PersonnelAnalysis;
