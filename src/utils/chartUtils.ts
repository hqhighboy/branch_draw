/**
 * @file 图表工具函数
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import { ChartData, ChartOptions } from 'chart.js';
import { BranchCapability, ChartColors } from '../types';

/**
 * 创建雷达图数据
 * @param {BranchCapability} capability 支部能力画像数据
 * @param {string} label 数据标签
 * @param {number} colorIndex 颜色索引
 * @returns {ChartData} 雷达图数据
 */
export const createRadarData = (
  capability: BranchCapability,
  label: string = capability.branchName,
  colorIndex: number = 0
): ChartData<'radar'> => {
  // 颜色配置
  const colors = [
    { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' }, // 蓝色
    { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' }, // 红色
    { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' }, // 青色
    { bg: 'rgba(255, 206, 86, 0.2)', border: 'rgba(255, 206, 86, 1)' }, // 黄色
    { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' }, // 紫色
    { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' }, // 橙色
    { bg: 'rgba(201, 203, 207, 0.2)', border: 'rgba(201, 203, 207, 1)' }, // 灰色
    { bg: 'rgba(106, 176, 76, 0.2)', border: 'rgba(106, 176, 76, 1)' }, // 绿色
  ];
  
  const color = colors[colorIndex % colors.length];
  
  return {
    labels: ['管理水平', 'KPI执行', '人才培养', '党建工作', '任务跟进', '安全合规', '创新能力', '团队协作', '资源利用'],
    datasets: [
      {
        label,
        data: [
          capability.managementLevel,
          capability.kpiExecution,
          capability.talentDevelopment,
          capability.partyBuilding,
          capability.taskFollowUp,
          capability.safetyCompliance,
          capability.innovationCapability,
          capability.teamCollaboration,
          capability.resourceUtilization
        ],
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 1
      }
    ]
  };
};

/**
 * 创建雷达图选项
 * @param {boolean} showLegend 是否显示图例
 * @param {boolean} showLabels 是否显示标签
 * @returns {ChartOptions} 雷达图选项
 */
export const createRadarOptions = (
  showLegend: boolean = true,
  showLabels: boolean = true
): ChartOptions<'radar'> => {
  return {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
          color: '#666',
          font: {
            size: 10
          }
        },
        pointLabels: {
          font: {
            size: 10
          },
          display: showLabels
        }
      }
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            let value = context.raw || 0;
            return `${label}: ${value}分`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };
};

/**
 * 创建柱状图数据
 * @param {string[]} labels 标签数组
 * @param {number[]} values 数值数组
 * @param {string} datasetLabel 数据集标签
 * @returns {ChartData} 柱状图数据
 */
export const createBarData = (
  labels: string[],
  values: number[],
  datasetLabel: string = '得分'
): ChartData<'bar'> => {
  return {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: values,
        backgroundColor: Object.values(ChartColors).map(color => color),
        borderColor: Object.values(ChartColors).map(color => color.replace('0.8', '1')),
        borderWidth: 1
      }
    ]
  };
};

/**
 * 创建柱状图选项
 * @param {boolean} showLegend 是否显示图例
 * @param {number} maxValue 最大值
 * @returns {ChartOptions} 柱状图选项
 */
export const createBarOptions = (
  showLegend: boolean = true,
  maxValue: number = 100
): ChartOptions<'bar'> => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: maxValue,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            let value = context.raw || 0;
            return `${label}: ${value}分`;
          }
        }
      }
    }
  };
};

/**
 * 创建饼图数据
 * @param {string[]} labels 标签数组
 * @param {number[]} values 数值数组
 * @returns {ChartData} 饼图数据
 */
export const createPieData = (
  labels: string[],
  values: number[]
): ChartData<'pie'> => {
  // 颜色配置
  const backgroundColors = [
    ChartColors.primary,
    ChartColors.success,
    ChartColors.warning,
    ChartColors.error,
    ChartColors.purple,
    ChartColors.cyan,
    ChartColors.magenta,
    ChartColors.volcano
  ];
  
  const borderColors = backgroundColors.map(color => color.replace('0.8', '1'));
  
  return {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }
    ]
  };
};

/**
 * 创建饼图选项
 * @param {boolean} showLegend 是否显示图例
 * @returns {ChartOptions} 饼图选项
 */
export const createPieOptions = (
  showLegend: boolean = true
): ChartOptions<'pie'> => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 10
          }
        },
        display: showLegend
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            let value = context.raw || 0;
            let percentage = context.parsed || 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '30%'
  };
};
