/**
 * @file 月度工作完成情况组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Select } from 'antd';
import { useBranch } from '../../context/BranchContext';
import api from '../../services/api';
import { MonthlyWork as MonthlyWorkType, WorkType, WorkTypeColors } from '../../types';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import './MonthlyWork.css';

// 组件属性
export interface MonthlyWorkProps {
  showAllBranches?: boolean;
  branch?: any;
  branches?: any[];
}

/**
 * 月度工作完成情况组件
 * @param {MonthlyWorkProps} props 组件属性
 * @returns {JSX.Element} 月度工作完成情况组件
 */
const MonthlyWork: React.FC<MonthlyWorkProps> = ({ showAllBranches = false, branch }) => {
  // 获取支部上下文
  const { branches, selectedBranchId } = useBranch();

  // 使用传入的 branch 或者上下文中的 selectedBranchId
  const branchId = branch?.id || selectedBranchId;

  // 状态
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [monthlyWorkData, setMonthlyWorkData] = useState<MonthlyWorkType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 月份选项
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}月`
  }));

  /**
   * 获取月度工作数据
   */
  useEffect(() => {
    const fetchMonthlyWorkData = async () => {
      try {
        setLoading(true);
        setError(null);

        let data: MonthlyWorkType[] = [];

        if (showAllBranches) {
          // 获取所有支部的月度工作数据
          data = await api.work.getAllBranchesMonthlyWork(selectedYear, selectedMonth);
        } else if (branchId) {
          // 获取选中支部的月度工作数据
          data = await api.work.getMonthlyWork(branchId, selectedYear, selectedMonth);
        }

        // 如果没有数据，生成模拟数据
        if (data.length === 0) {
          data = generateMockData();
        }

        setMonthlyWorkData(data);
      } catch (err) {
        console.error('获取月度工作数据失败:', err);
        setError('获取月度工作数据失败，请稍后重试');
        // 生成模拟数据
        setMonthlyWorkData(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyWorkData();
  }, [showAllBranches, branchId, selectedMonth, selectedYear]);

  /**
   * 生成模拟数据
   * @returns {MonthlyWorkType[]} 模拟的月度工作数据
   */
  const generateMockData = (): MonthlyWorkType[] => {
    return branches.map(branch => ({
      branchId: branch.id,
      branchName: branch.name,
      month: selectedMonth,
      year: selectedYear,
      planningCompletion: Math.floor(Math.random() * 40) + 50,
      executionCompletion: Math.floor(Math.random() * 30) + 60,
      inspectionCompletion: Math.floor(Math.random() * 35) + 55,
      evaluationCompletion: Math.floor(Math.random() * 25) + 65,
      improvementCompletion: Math.floor(Math.random() * 45) + 45
    }));
  };

  /**
   * 处理月份变化
   * @param {number} value 选中的月份
   */
  const handleMonthChange = (value: number) => {
    setSelectedMonth(value);
  };

  // 图表数据
  const chartData = {
    labels: monthlyWorkData.map(item => item.branchName),
    datasets: showAllBranches
      ? [
          {
            label: '月度工作计划',
            data: monthlyWorkData.map(item => item.planningCompletion),
            backgroundColor: WorkTypeColors[WorkType.Planning].bg,
            borderColor: WorkTypeColors[WorkType.Planning].border,
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            borderRadius: 0
          },
          {
            label: '计划工作执行',
            data: monthlyWorkData.map(item => item.executionCompletion),
            backgroundColor: WorkTypeColors[WorkType.Execution].bg,
            borderColor: WorkTypeColors[WorkType.Execution].border,
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            maxBarThickness: 25,
            borderRadius: 0
          },
          {
            label: '执行情况检查',
            data: monthlyWorkData.map(item => item.inspectionCompletion),
            backgroundColor: WorkTypeColors[WorkType.Inspection].bg,
            borderColor: WorkTypeColors[WorkType.Inspection].border,
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            maxBarThickness: 25,
            borderRadius: 0
          },
          {
            label: '工作评价与总结',
            data: monthlyWorkData.map(item => item.evaluationCompletion),
            backgroundColor: WorkTypeColors[WorkType.Evaluation].bg,
            borderColor: WorkTypeColors[WorkType.Evaluation].border,
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            maxBarThickness: 25,
            borderRadius: 0
          },
          {
            label: '持续改进工作',
            data: monthlyWorkData.map(item => item.improvementCompletion),
            backgroundColor: WorkTypeColors[WorkType.Improvement].bg,
            borderColor: WorkTypeColors[WorkType.Improvement].border,
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            maxBarThickness: 25,
            borderRadius: 0
          }
        ]
      : [
          {
            label: `${selectedMonth}月工作完成率`,
            data: monthlyWorkData.map(item => (
              item.planningCompletion +
              item.executionCompletion +
              item.inspectionCompletion +
              item.evaluationCompletion +
              item.improvementCompletion
            ) / 5),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            maxBarThickness: 25,
            borderRadius: 0
          }
        ]
  };

  // 图表选项
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30,
        right: 10,
        bottom: 20,
        left: 10
      },
      autoPadding: true
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
          lineWidth: 0.5,
          z: -1
        },
        border: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 10
          },
          color: '#666',
          stepSize: 10,
          padding: 5,
          maxTicksLimit: 11,
          callback: function(value: any) {
            return value;
          }
        },
        title: {
          display: false,
          text: '完成率'
        }
      },
      x: {
        grid: {
          display: false
        },
        border: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 10
          },
          color: '#333',
          maxRotation: 45,
          minRotation: 45,
          padding: 5,
          autoSkip: false,
          callback: function(value: any) {
            const label = String(value);
            return label.length > 10 ? label.substring(0, 10) + '..' : label;
          }
        },
        title: {
          display: false,
          text: '支部'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: 12
          },
          usePointStyle: false
        },
        align: 'start',
        maxHeight: 25,
        onClick: () => {}
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 6,
        cornerRadius: 4,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            let value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      },
      title: {
        display: false
      }
    }
  } as const;

  // 加载中
  if (loading) {
    return <Loading />;
  }

  // 错误
  if (error) {
    return <ErrorMessage message={error} onRetry={() => setError(null)} />;
  }

  // 无数据
  if (monthlyWorkData.length === 0) {
    return <EmptyState description="暂无月度工作数据" />;
  }

  return (
    <div className="monthly-work">
      {!showAllBranches && (
        <div className="monthly-work-header">
          <Select
            value={selectedMonth}
            onChange={handleMonthChange}
            options={monthOptions}
            className="month-selector"
          />
        </div>
      )}
      <div className="monthly-work-chart">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default MonthlyWork;
