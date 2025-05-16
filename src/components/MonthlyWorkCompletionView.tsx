import React, { useState } from 'react';
import { Card, Select, Row, Col, Checkbox, Tooltip } from 'antd';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip as ChartTooltip, 
  Legend 
} from 'chart.js';
import { BranchCapabilityData } from '../interfaces/BranchCapability';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

interface MonthlyWorkCompletionViewProps {
  data: BranchCapabilityData[];
}

// 月度工作指标类型
const workMetrics = [
  { id: 'monthlyTask', label: '月度督办任务' },
  { id: 'partyBuilding', label: '党建工作质量' },
  { id: 'propaganda', label: '宣传稿件数量' },
  { id: 'leadership', label: '领导交办工作' },
  { id: 'safety', label: '安全生产工作' }
];

const MonthlyWorkCompletionView: React.FC<MonthlyWorkCompletionViewProps> = ({ data }) => {
  // 状态
  const [selectedMonth, setSelectedMonth] = useState<string>('当前月');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'monthlyTask', 'partyBuilding', 'propaganda', 'leadership'
  ]);

  // 月份选项
  const months = ['当前月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  // 处理月份选择
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  // 处理指标选择
  const handleMetricsChange = (checkedValues: string[]) => {
    setSelectedMetrics(checkedValues);
  };

  // 生成随机数据（实际项目中应该从API获取）
  const generateRandomData = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // 获取所有支部名称
  const branchNames = data.map(branch => branch.name);

  // 准备图表数据
  const chartData = {
    labels: branchNames,
    datasets: selectedMetrics.map((metricId, index) => {
      const metric = workMetrics.find(m => m.id === metricId);
      const colors = [
        { bg: 'rgba(54, 162, 235, 0.6)', border: 'rgb(54, 162, 235)' },
        { bg: 'rgba(255, 99, 132, 0.6)', border: 'rgb(255, 99, 132)' },
        { bg: 'rgba(255, 206, 86, 0.6)', border: 'rgb(255, 206, 86)' },
        { bg: 'rgba(75, 192, 192, 0.6)', border: 'rgb(75, 192, 192)' },
        { bg: 'rgba(153, 102, 255, 0.6)', border: 'rgb(153, 102, 255)' }
      ];
      
      return {
        label: metric?.label || metricId,
        data: data.map(() => generateRandomData(60, 100)),
        backgroundColor: colors[index % colors.length].bg,
        borderColor: colors[index % colors.length].border,
        borderWidth: 1
      };
    })
  };

  // 图表配置
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: '完成率(%)'
        }
      },
      x: {
        title: {
          display: true,
          text: '党支部'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      }
    },
    barPercentage: 0.8,
    categoryPercentage: 0.9
  };

  return (
    <div className="monthly-work-completion-view">
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Select
            value={selectedMonth}
            onChange={handleMonthChange}
            style={{ width: '100%' }}
          >
            {months.map(month => (
              <Option key={month} value={month}>{month}</Option>
            ))}
          </Select>
        </Col>
        <Col span={16}>
          <CheckboxGroup
            options={workMetrics.map(metric => ({ label: metric.label, value: metric.id }))}
            value={selectedMetrics}
            onChange={handleMetricsChange}
          />
        </Col>
      </Row>
      
      <Card title={`${selectedMonth}月度工作完成情况`} bordered={false}>
        <div style={{ height: '500px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Card>
      
      <div style={{ marginTop: '16px', textAlign: 'center', color: '#888' }}>
        <Tooltip title="数据说明：各项指标得分区间为0-100，表示工作完成率">
          <span>数据说明：各项指标得分区间为0-100，表示工作完成率</span>
        </Tooltip>
      </div>
    </div>
  );
};

export default MonthlyWorkCompletionView;
