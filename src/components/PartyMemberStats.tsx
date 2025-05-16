import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import './PartyMemberStats.css';

interface StatsData {
  totalMembers: number;
  branchDistribution: Array<{
    branch_name: string;
    member_count: number;
  }>;
  ageDistribution: Array<{
    age_group: string;
    count: number;
  }>;
  educationDistribution: Array<{
    education_level: string;
    count: number;
  }>;
  positionDistribution: Array<{
    position_type: string;
    count: number;
  }>;
}

const PartyMemberStats: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 职务类型映射
  const positionTypeMap: Record<string, string> = {
    'party_committee_secretary': '党委书记',
    'party_committee_deputy_secretary': '党委副书记',
    'discipline_committee_secretary': '纪委书记',
    'union_chairman': '工会主席',
    'party_committee_member': '党委委员',
    'branch_secretary': '支部书记',
    'branch_deputy_secretary': '支部副书记',
    'organization_commissioner': '组织委员',
    'discipline_commissioner': '纪检委员',
    'propaganda_commissioner': '宣传委员',
    'youth_commissioner': '青年委员',
    'production_commissioner': '生产委员'
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3003/api/party-member-stats');
        setStats(response.data);
        setError(null);
      } catch (err: any) {
        console.error('获取党员统计数据失败:', err);
        setError(err.message || '获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">加载统计数据中...</div>;
  }

  if (error) {
    return <div className="error">错误: {error}</div>;
  }

  if (!stats) {
    return <div className="no-data">暂无统计数据</div>;
  }

  // 准备图表数据
  const ageChartData = {
    labels: stats.ageDistribution.map(item => item.age_group),
    datasets: [
      {
        label: '年龄分布',
        data: stats.ageDistribution.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const educationChartData = {
    labels: stats.educationDistribution.map(item => item.education_level),
    datasets: [
      {
        label: '学历分布',
        data: stats.educationDistribution.map(item => item.count),
        backgroundColor: [
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const positionChartData = {
    labels: stats.positionDistribution.map(item => positionTypeMap[item.position_type] || item.position_type),
    datasets: [
      {
        label: '职务分布',
        data: stats.positionDistribution.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const branchChartData = {
    labels: stats.branchDistribution.map(item => item.branch_name),
    datasets: [
      {
        label: '党员人数',
        data: stats.branchDistribution.map(item => item.member_count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value}人 (${percentage}%)`;
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}人`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '人数'
        }
      }
    }
  };

  return (
    <div className="party-member-stats">
      <h2>党员信息统计</h2>
      
      <div className="stats-summary">
        <div className="stat-card">
          <h3>党员总数</h3>
          <div className="stat-value">{stats.totalMembers}</div>
        </div>
      </div>

      <div className="stats-charts">
        <div className="chart-container">
          <h3>各支部党员人数</h3>
          <Bar data={branchChartData} options={barChartOptions} />
        </div>

        <div className="chart-row">
          <div className="chart-container">
            <h3>年龄分布</h3>
            <Pie data={ageChartData} options={chartOptions} />
          </div>

          <div className="chart-container">
            <h3>学历分布</h3>
            <Pie data={educationChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3>职务分布</h3>
          <Bar data={positionChartData} options={barChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default PartyMemberStats;
