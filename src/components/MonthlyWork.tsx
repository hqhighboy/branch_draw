import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Select } from 'antd';
import './MonthlyWork.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Branch {
  id?: string;
  name: string;
}

interface MonthlyWorkProps {
  branches: Branch[];
  showAllBranches?: boolean;
}

/**
 * 月度工作完成情况组件
 */
const MonthlyWork: React.FC<MonthlyWorkProps> = ({ branches = [], showAllBranches = false }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('6');
  const [localBranches, setLocalBranches] = useState<Branch[]>(branches);

  // 在 useEffect 中模拟数据加载
  useEffect(() => {
    if (!localBranches || localBranches.length === 0) {
      console.log('Branches 数据为空，加载模拟数据...');
      setLocalBranches([
        { id: '1', name: '支部1' },
        { id: '2', name: '支部2' },
        { id: '3', name: '支部3' },
        { id: '4', name: '支部4' },
        { id: '5', name: '支部5' },
      ]);
    }
  }, [localBranches]);

  // 添加数据加载状态检查
  if (!localBranches || localBranches.length === 0) {
    return <div className="no-data-message">暂无数据，请检查数据源。</div>;
  }

  // 月份选项
  const monthOptions = [
    { value: '1', label: '1月' },
    { value: '2', label: '2月' },
    { value: '3', label: '3月' },
    { value: '4', label: '4月' },
    { value: '5', label: '5月' },
    { value: '6', label: '6月' },
    { value: '7', label: '7月' },
    { value: '8', label: '8月' },
    { value: '9', label: '9月' },
    { value: '10', label: '10月' },
    { value: '11', label: '11月' },
    { value: '12', label: '12月' },
  ];

  // 生成随机数据
  const generateRandomData = () => {
    return localBranches.map(() => {
      // 生成40-90之间的随机数，使柱状图更合理
      return Math.floor(Math.random() * 50) + 40;
    });
  };

  // 生成工作类型数据
  const generateWorkTypeData = () => {
    // 为每个支部生成5种不同类型工作的随机完成率
    return localBranches.map(() => {
      return {
        planning: Math.floor(Math.random() * 40) + 50, // 计划工作
        execution: Math.floor(Math.random() * 30) + 60, // 执行工作
        inspection: Math.floor(Math.random() * 35) + 55, // 检查工作
        evaluation: Math.floor(Math.random() * 25) + 65, // 评估工作
        improvement: Math.floor(Math.random() * 45) + 45, // 改进工作
      };
    });
  };

  // 获取工作类型数据
  const workTypeData = generateWorkTypeData();

  // 定义工作类型颜色 - 使用与参考图片一致的颜色方案
  const workTypeColors = {
    planning: {
      bg: 'rgba(65, 148, 246, 0.8)',
      border: 'rgba(65, 148, 246, 1)',
    },
    execution: {
      bg: 'rgba(75, 192, 120, 0.8)',
      border: 'rgba(75, 192, 120, 1)',
    },
    inspection: {
      bg: 'rgba(255, 206, 86, 0.8)',
      border: 'rgba(255, 206, 86, 1)',
    },
    evaluation: {
      bg: 'rgba(255, 99, 132, 0.8)',
      border: 'rgba(255, 99, 132, 1)',
    },
    improvement: {
      bg: 'rgba(153, 102, 255, 0.8)',
      border: 'rgba(153, 102, 255, 1)',
    },
  };

  // 图表数据
  const chartData = {
    labels: localBranches.map((branch) => branch.name),
    datasets: showAllBranches
      ? [
          {
            label: '计划工作',
            data: workTypeData.map((data) => data.planning),
            backgroundColor: workTypeColors.planning.bg,
            borderColor: workTypeColors.planning.border,
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            borderRadius: 0,
          },
          {
            label: '执行工作',
            data: workTypeData.map((data) => data.execution),
            backgroundColor: workTypeColors.execution.bg,
            borderColor: workTypeColors.execution.border,
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            maxBarThickness: 25,
            borderRadius: 0,
          },
          {
            label: '检查工作',
            data: workTypeData.map((data) => data.inspection),
            backgroundColor: workTypeColors.inspection.bg,
            borderColor: workTypeColors.inspection.border,
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            maxBarThickness: 25,
            borderRadius: 0,
          },
          {
            label: '评估工作',
            data: workTypeData.map((data) => data.evaluation),
            backgroundColor: workTypeColors.evaluation.bg,
            borderColor: workTypeColors.evaluation.border,
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            maxBarThickness: 25,
            borderRadius: 0,
          },
          {
            label: '改进工作',
            data: workTypeData.map((data) => data.improvement),
            backgroundColor: workTypeColors.improvement.bg,
            borderColor: workTypeColors.improvement.border,
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            maxBarThickness: 25,
            borderRadius: 0,
          },
        ]
      : [
          {
            label: `${selectedMonth}月工作完成率`,
            data: generateRandomData(),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            maxBarThickness: 25,
            borderRadius: 0,
          },
        ],
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
        left: 10,
      },
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
          z: -1,
        },
        border: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 10,
          },
          color: '#666',
          stepSize: 10,
          padding: 5,
          maxTicksLimit: 11,
          callback: function (value: any) {
            return value;
          },
        },
        title: {
          display: false,
          text: '完成率',
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 10,
          },
          color: '#333',
          maxRotation: 45,
          minRotation: 45,
          padding: 5,
          autoSkip: false,
          callback: function (value: any) {
            const label = String(value);
            return label.length > 10 ? label.substring(0, 10) + '..' : label;
          },
        },
        title: {
          display: false,
          text: '支部',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: 12,
          },
          usePointStyle: false,
        },
        align: 'start',
        maxHeight: 25,
        onClick: (event: any, legendItem: any) => {
          // 保留默认图例点击行为
          const chart = event.chart;
          const index = legendItem.datasetIndex;
          const meta = chart.getDatasetMeta(index);
          meta.hidden = !meta.hidden;
          chart.update();
        },
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
          label: function (context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          },
        },
      },
      title: {
        display: false,
      },
    },
  } as const;

  // 处理月份变化
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

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
