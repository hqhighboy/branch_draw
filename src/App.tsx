import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ConfigProvider, Layout, theme as antTheme } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler,
  BarElement
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import "./config";
import { Branch } from './types';

import './App.css';
import './styles/theme.css';
import './styles/variables.css';
import './styles/AppContainer.css';
import './components/PieChartLabels.css';
import { utils, writeFile } from 'xlsx';
import { excelTemplateData } from './ExcelTemplate';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableDashboard from './components/DraggableDashboard';
import AIAnalysisSection from './components/AIAnalysisSection';
import MonthlyWork from './components/MonthlyWork';

// 导入支部数据模板，用于在API调用失败时使用
import personnelData from './data/branch_personnel_template.json';
import annualWorkData from './data/branch_annual_work_template.json';

// 注册ChartJS组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// 导入 Branch 类型

// 支部基本情况组件
// 这个组件已经被重构，这里只是为了保持兼容性
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AppBasicInfo({ branch }: { branch: Branch | null }) {
  const honors = [
    "2023年先进基层党组织",
    "2022年优秀党支部",
    "2022年安全生产先进集体",
    "2021年技术创新示范单位",
    "2021年党建工作示范点"
  ];

  if (!branch) return <div className="basic-info-card"><div className="card-title">支部基本情况</div><div className="info-content">暂无数据</div></div>;

  return (
    <div className="basic-info-card">
      <div className="card-title">支部基本情况</div>
      <div className="info-content">
        <table className="info-table">
          <tbody>
            <tr>
              <td className="field-label">支部名称</td>
              <td className="field-value" colSpan={3}>{branch.name}</td>
            </tr>
            <tr>
              <td className="field-label">书记</td>
              <td className="field-value">{branch.secretary}</td>
              <td className="field-label">副书记</td>
              <td className="field-value">{branch.deputySecretary}</td>
            </tr>
            <tr>
              <td className="field-label">组织委员</td>
              <td className="field-value">{branch.organizationalCommissioner}</td>
              <td className="field-label">纪检委员</td>
              <td className="field-value">{branch.disciplinaryCommissioner}</td>
            </tr>
            <tr>
              <td className="field-label">宣传委员</td>
              <td className="field-value">{branch.propagandaCommissioner}</td>
              <td className="field-label">青年委员</td>
              <td className="field-value">{branch.learningCommissioner}</td>
            </tr>
            <tr>
              <td className="field-label">支部人数</td>
              <td className="field-value">{branch.memberCount}</td>
              <td className="field-label">平均年龄</td>
              <td className="field-value">{branch.averageAge || ''}</td>
            </tr>
            <tr>
              <td className="field-label">上年度绩效</td>
              <td className="field-value" colSpan={3}>{branch.performance2024}</td>
            </tr>
            <tr>
              <td className="field-label">书记项目</td>
              <td className="field-value" colSpan={3}>{branch.secretaryProject}</td>
            </tr>
            <tr>
              <td className="field-label">获得荣誉</td>
              <td className="field-value" colSpan={3}>
                <div className="honors-list">
                  {(Array.isArray(honors) ? honors : [honors]).map((honor, index) => (
                    <span key={index} className="honor-item">{honor}</span>
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 支部人员分析组件
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AppPersonnelAnalysis({ branch }: { branch: Branch | null }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%', // 设置为环形图
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { font: { size: 10 } }
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
  };

  // 确保branch对象存在并且包含所需的数据
  const hasData = branch && branch.ageDistribution && branch.educationDistribution &&
                  branch.skillDistribution && branch.titleDistribution;

  // 年龄分布数据
  const ageLabels = ['18-28岁', '28-35岁', '35-50岁', '50-60岁'];
  const ageValues = hasData && branch?.ageDistribution
    ? ageLabels.map(label => {
        if (typeof branch.ageDistribution === 'object' && !Array.isArray(branch.ageDistribution)) {
          return (branch.ageDistribution as Record<string, number>)[label] || 0;
        }
        return 0;
      })
    : [25, 35, 30, 10];

  const ageData = {
    labels: ageLabels,
    datasets: [{
      data: ageValues,
      backgroundColor: [
        'rgba(24, 144, 255, 0.7)',
        'rgba(47, 194, 91, 0.7)',
        'rgba(250, 204, 20, 0.7)',
        'rgba(240, 72, 100, 0.7)',
      ],
      borderColor: [
        'rgba(24, 144, 255, 1)',
        'rgba(47, 194, 91, 1)',
        'rgba(250, 204, 20, 1)',
        'rgba(240, 72, 100, 1)',
      ],
      borderWidth: 1
    }],
  };

  // 学历分布数据
  const educationLabels = ['大专及以下', '本科', '硕士', '博士'];
  const educationValues = hasData && branch?.educationDistribution
    ? educationLabels.map(label => {
        if (typeof branch.educationDistribution === 'object' && !Array.isArray(branch.educationDistribution)) {
          return (branch.educationDistribution as Record<string, number>)[label] || 0;
        }
        return 0;
      })
    : [15, 55, 25, 5];

  const educationData = {
    labels: educationLabels,
    datasets: [{
      data: educationValues,
      backgroundColor: [
        'rgba(24, 144, 255, 0.7)',
        'rgba(47, 194, 91, 0.7)',
        'rgba(250, 204, 20, 0.7)',
        'rgba(240, 72, 100, 0.7)',
      ],
      borderColor: [
        'rgba(24, 144, 255, 1)',
        'rgba(47, 194, 91, 1)',
        'rgba(250, 204, 20, 1)',
        'rgba(240, 72, 100, 1)',
      ],
      borderWidth: 1,
    }],
  };

  // 技能等级分布数据
  const skillLabels = ['初中级工', '高级工', '技师', '高级技师'];
  const skillValues = hasData && branch?.skillDistribution
    ? skillLabels.map(label => {
        if (typeof branch.skillDistribution === 'object' && !Array.isArray(branch.skillDistribution)) {
          return (branch.skillDistribution as Record<string, number>)[label] || 0;
        }
        return 0;
      })
    : [25, 40, 25, 10];

  const skillData = {
    labels: skillLabels,
    datasets: [{
      data: skillValues,
      backgroundColor: [
        'rgba(24, 144, 255, 0.7)',
        'rgba(47, 194, 91, 0.7)',
        'rgba(250, 204, 20, 0.7)',
        'rgba(240, 72, 100, 0.7)',
      ],
      borderColor: [
        'rgba(24, 144, 255, 1)',
        'rgba(47, 194, 91, 1)',
        'rgba(250, 204, 20, 1)',
        'rgba(240, 72, 100, 1)',
      ],
      borderWidth: 1,
    }],
  };

  // 职称分布数据
  const titleLabels = ['助理工程师', '工程师', '高级工程师', '正高级工程师'];
  const titleValues = hasData && branch?.titleDistribution
    ? titleLabels.map(label => {
        if (typeof branch.titleDistribution === 'object' && !Array.isArray(branch.titleDistribution)) {
          return (branch.titleDistribution as Record<string, number>)[label] || 0;
        }
        return 0;
      })
    : [20, 45, 30, 5];

  const titleData = {
    labels: titleLabels,
    datasets: [{
      data: titleValues,
      backgroundColor: [
        'rgba(24, 144, 255, 0.7)',
        'rgba(47, 194, 91, 0.7)',
        'rgba(250, 204, 20, 0.7)',
        'rgba(240, 72, 100, 0.7)',
      ],
      borderColor: [
        'rgba(24, 144, 255, 1)',
        'rgba(47, 194, 91, 1)',
        'rgba(250, 204, 20, 1)',
        'rgba(240, 72, 100, 1)',
      ],
      borderWidth: 1,
    }],
  };
  return (
    <div className="personnel-card">
      <div className="card-title-container">
        <div className="card-title">支部人员分析</div>
      </div>
      <div className="charts-grid">
        <div className="chart-item">
          <div className="chart-title">年龄分布</div>
          <div className="pie-container">
            <Pie data={ageData} options={options} />
            {ageData.datasets[0].data.map((value, index) => {
              // 计算每个扇形的中心点位置
              const total = ageData.datasets[0].data.reduce((sum, val) => sum + val, 0);
              const startAngle = ageData.datasets[0].data.slice(0, index).reduce((sum, val) => sum + val, 0) / total * 2 * Math.PI;
              const sliceAngle = value / total * 2 * Math.PI;
              const angle = startAngle + sliceAngle / 2;
              const radius = 70; // 半径
              const x = 50 + radius * Math.cos(angle - Math.PI / 2);
              const y = 50 + radius * Math.sin(angle - Math.PI / 2);

              return (
                <div
                  key={`age-label-${index}`}
                  className={`pie-label pie-label-pos-${index % 6}`}
                >
                  {value}%
                </div>
              );
            })}
          </div>
        </div>
        <div className="chart-item">
          <div className="chart-title">学历分布</div>
          <div className="pie-container">
            <Pie data={educationData} options={options} />
            {educationData.datasets[0].data.map((value, index) => {
              // 计算每个扇形的中心点位置
              const total = educationData.datasets[0].data.reduce((sum, val) => sum + val, 0);
              const startAngle = educationData.datasets[0].data.slice(0, index).reduce((sum, val) => sum + val, 0) / total * 2 * Math.PI;
              const sliceAngle = value / total * 2 * Math.PI;
              const angle = startAngle + sliceAngle / 2;
              const radius = 70; // 半径
              const x = 50 + radius * Math.cos(angle - Math.PI / 2);
              const y = 50 + radius * Math.sin(angle - Math.PI / 2);

              return (
                <div
                  key={`edu-label-${index}`}
                  className={`pie-label pie-label-pos-${index % 6}`}
                >
                  {value}%
                </div>
              );
            })}
          </div>
        </div>
        <div className="chart-item">
          <div className="chart-title">技能等级</div>
          <div className="pie-container">
            <Pie data={skillData} options={options} />
            {skillData.datasets[0].data.map((value, index) => {
              // 计算每个扇形的中心点位置
              const total = skillData.datasets[0].data.reduce((sum, val) => sum + val, 0);
              const startAngle = skillData.datasets[0].data.slice(0, index).reduce((sum, val) => sum + val, 0) / total * 2 * Math.PI;
              const sliceAngle = value / total * 2 * Math.PI;
              const angle = startAngle + sliceAngle / 2;
              const radius = 70; // 半径
              const x = 50 + radius * Math.cos(angle - Math.PI / 2);
              const y = 50 + radius * Math.sin(angle - Math.PI / 2);

              return (
                <div
                  key={`skill-label-${index}`}
                  className={`pie-label pie-label-pos-${index % 6}`}
                >
                  {value}%
                </div>
              );
            })}
          </div>
        </div>
        <div className="chart-item">
          <div className="chart-title">职称情况</div>
          <div className="pie-container">
            <Pie data={titleData} options={options} />
            {titleData.datasets[0].data.map((value, index) => {
              // 计算每个扇形的中心点位置
              const total = titleData.datasets[0].data.reduce((sum, val) => sum + val, 0);
              const startAngle = titleData.datasets[0].data.slice(0, index).reduce((sum, val) => sum + val, 0) / total * 2 * Math.PI;
              const sliceAngle = value / total * 2 * Math.PI;
              const angle = startAngle + sliceAngle / 2;
              const radius = 70; // 半径
              const x = 50 + radius * Math.cos(angle - Math.PI / 2);
              const y = 50 + radius * Math.sin(angle - Math.PI / 2);

              return (
                <div
                  key={`title-label-${index}`}
                  className={`pie-label pie-label-pos-${index % 6}`}
                >
                  {value}%
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 年度重点工作组件
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AppAnnualWork({ branch }: { branch: Branch | null }) {
  // 确保branch对象存在并且包含annualWork数据
  const workData = branch && branch.annualWork ? branch.annualWork : [];

  return (
    <div className="annual-work-card">
      <div className="card-title-container">
        <div className="card-title">年度重点工作</div>
      </div>
      <div className="work-table-container">
        <table className="work-table">
          <thead>
            <tr>
              <th className="sequence-column">序号</th>
              <th className="work-task">工作任务</th>
              <th>时间安排</th>
              <th>状态</th>
              <th>进度</th>
            </tr>
          </thead>
          <tbody>
            {workData.map((item: any) => (
              <tr key={item.id}>
                <td className="sequence-column">{item.id}</td>
                <td>{item.task}</td>
                <td>{item.startTime} ~ {item.endTime}</td>
                <td>
                  <span className={`status-tag status-${item.status.replace(/\s+/g, '-')}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div
                        className={`progress-fill progress-width-${Math.round(item.progress / 10) * 10}`}
                      />
                    </div>
                    <span className="progress-text">{item.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 月度工作完成情况组件
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AppMonthlyWork({ branches }: { branches: Branch[] }) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    '月度督办任务',
    '党建工作质量',
    '宣传稿件数量',
    '领导交办工作'
  ]);

  const metrics = [
    { id: '月度督办任务', label: '月度督办任务' },
    { id: '党建工作质量', label: '党建工作质量' },
    { id: '宣传稿件数量', label: '宣传稿件数量' },
    { id: '领导交办工作', label: '领导交办工作' }
  ];

  // 使用传入的branches数据，如果不存在则使用personnelData
  // 确保只显示数据库中存在的11个党支部
  const validBranches = [
    '党建人事党支部',
    '综合党支部',
    '生技党支部',
    '安监党支部',
    '数字运行部党支部',
    '检修试验党支部',
    '继保自动化党支部',
    '500千伏科北数字巡维中心党支部',
    '500千伏北郊数字巡维中心党支部',
    '220千伏罗涌数字巡维中心党支部',
    '220千伏田心数字巡维中心党支部'
  ];

  const branchNames = Array.isArray(branches) && branches.length > 0
    ? branches.filter((b) => b && b.name && validBranches.includes(b.name)).map((b) => b.name)
    : validBranches;

  const data = {
    labels: branchNames,
    datasets: selectedMetrics.map((metric, index) => ({
      label: metric,
      data: branchNames.map(() => Math.floor(Math.random() * 40) + 60),
      backgroundColor: [
        'rgba(24, 144, 255, 0.7)',
        'rgba(47, 194, 91, 0.7)',
        'rgba(250, 204, 20, 0.7)',
        'rgba(240, 72, 100, 0.7)',
        'rgba(114, 46, 209, 0.7)'
      ][index],
      borderColor: [
        'rgba(24, 144, 255, 1)',
        'rgba(47, 194, 91, 1)',
        'rgba(250, 204, 20, 1)',
        'rgba(240, 72, 100, 1)',
        'rgba(114, 46, 209, 1)'
      ][index],
      borderWidth: 1
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          offset: true
        }
      },
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
    barPercentage: 0.7,  // 设置柱子宽度为类别宽度的70%
    categoryPercentage: 0.8  // 设置类别宽度为可用宽度的80%
  };

  const handleMetricChange = (metricId: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  return (
    <div className="monthly-work-card">
      <div className="card-title-container">
        <div className="card-title">月度工作完成情况</div>
      </div>
      <div className="metrics-selector">
        {metrics.map(metric => (
          <label key={metric.id} className="metric-checkbox">
            <input
              type="checkbox"
              checked={selectedMetrics.includes(metric.id)}
              onChange={() => handleMetricChange(metric.id)}
            />
            {metric.label}
          </label>
        ))}
      </div>
      <div className="monthly-chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}



// 定义类型
interface AppBranchData {
  id?: string | number;
  name: string;
  ageDistribution?: Record<string, number>;
  educationDistribution?: Record<string, number>;
  skillDistribution?: Record<string, number>;
  titleDistribution?: Record<string, number>;
  annualWork?: Array<{
    id: number;
    task: string;
    startTime: string;
    endTime: string;
    status: string;
    progress: number;
  }>;
  secretary?: string;
  deputySecretary?: string;
  organizationalCommissioner?: string;
  disciplinaryCommissioner?: string;
  propagandaCommissioner?: string;
  learningCommissioner?: string;
  memberCount?: number;
  averageAge?: number;
  performance2024?: string;
  secretaryProject?: string;
  honors?: string[] | string;
}

interface PersonnelData {
  branches: Array<{
    name: string;
    ageDistribution: Record<string, number>;
    educationDistribution: Record<string, number>;
    skillDistribution: Record<string, number>;
    titleDistribution: Record<string, number>;
  }>;
}

interface AnnualWorkData {
  branches: Array<{
    name: string;
    annualWork: Array<{
      id: number;
      task: string;
      startTime: string;
      endTime: string;
      status: string;
      progress: number;
    }>;
  }>;
}

// 删除本地静态数据相关逻辑，只用接口数据

const { Content } = Layout;
const { defaultAlgorithm, darkAlgorithm } = antTheme;

function App() {
  // 状态管理
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentSection, setCurrentSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isDraggable, setIsDraggable] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 初始化数据
  useEffect(() => {
    setIsLoading(true);

    // 从本地存储中获取主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // 加载支部数据的函数
    const loadBranchData = () => {
      try {
        // 如果API调用失败，使用本地数据
        if (personnelData && (personnelData as PersonnelData).branches && Array.isArray((personnelData as PersonnelData).branches)) {
          const mockBranches = (personnelData as PersonnelData).branches.map((branch, index) => ({
            id: index + 1,
            name: branch.name
          }));

          setBranches(mockBranches);

          // 选择第一个支部
          if (mockBranches.length > 0) {
            fetchBranchDetails(mockBranches[0].id);
          }
        } else {
          // 如果本地数据也不可用，设置为空数组
          console.error('本地数据不可用');
          setBranches([]);
        }
      } catch (error) {
        console.error('使用模拟数据时出错:', error);
        // 确保即使出错也设置一个空数组
        setBranches([]);
      }
    };

    try {
      axios.get('/api/branches')
        .then((response) => {
          if (Array.isArray(response.data)) {
            setBranches(response.data);
            if (response.data.length > 0) {
              fetchBranchDetails(response.data[0].id);
            }
          } else {
            console.error('API返回的数据不是数组:', response.data);
            // 设置为空数组，避免后续使用时出错
            setBranches([]);
            // 使用本地数据
            loadBranchData();
          }
        })
        .catch((error) => {
          console.error('获取支部列表失败:', error);
          // 使用本地数据
          loadBranchData();
        })
        .finally(() => {
          // 模拟加载时间，实际项目中可以删除这个setTimeout
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        });
    } catch (error) {
      console.error('初始化数据时出错:', error);
      // 确保即使出错也设置一个空数组
      setBranches([]);
      setIsLoading(false);
    }
  }, []);

  const fetchBranchDetails = (branchId: number | string) => {
    console.log('获取支部详细信息, branchId:', branchId);

    // 从数据库获取支部详细信息
    axios.get(`/api/branches/${branchId}`)
      .then((response) => {
        const branchData = response.data;
        console.log('从数据库获取的支部数据:', branchData);

        // 将数据库中的数据转换为前端需要的格式
        setSelectedBranch({
          id: branchData.id,
          name: branchData.name,
          ageDistribution: branchData.ageDistribution,
          educationDistribution: branchData.educationDistribution,
          skillDistribution: branchData.skillDistribution,
          titleDistribution: branchData.titleDistribution,
          annualWork: branchData.annualWork,
          secretary: branchData.secretary,
          deputySecretary: branchData.deputy_secretary || branchData.deputySecretary,
          organizationalCommissioner: branchData.organizational_commissioner || branchData.organizationalCommissioner,
          disciplinaryCommissioner: branchData.disciplinary_commissioner || branchData.disciplinaryCommissioner,
          propagandaCommissioner: branchData.propaganda_commissioner || branchData.propagandaCommissioner,
          learningCommissioner: branchData.learning_commissioner || branchData.learningCommissioner,
          memberCount: branchData.member_count || branchData.memberCount,
          averageAge: branchData.average_age || branchData.averageAge,
          performance2024: branchData.performance_2024 || branchData.performance2024,
          secretaryProject: branchData.secretary_project || branchData.secretaryProject,
          honors: branchData.honors
        });
      })
      .catch((error) => {
        console.error('获取支部详细信息失败:', error);

        // 如果API调用失败，使用本地数据
        const branchIndex = typeof branchId === 'string' ? parseInt(branchId, 10) - 1 : branchId - 1;

        if (personnelData && (personnelData as PersonnelData).branches && (personnelData as PersonnelData).branches[branchIndex]) {
          const selectedPersonnelData = (personnelData as PersonnelData).branches[branchIndex];
          const selectedAnnualWorkData = (annualWorkData as AnnualWorkData).branches[branchIndex].annualWork;

          const newSelectedBranch = {
            id: branchIndex + 1,
            ...selectedPersonnelData,
            annualWork: selectedAnnualWorkData,
            secretary: `张三${branchIndex + 1}`,
            deputySecretary: `李四${branchIndex + 1}`,
            organizationalCommissioner: `王五${branchIndex + 1}`,
            disciplinaryCommissioner: `赵六${branchIndex + 1}`,
            propagandaCommissioner: `孙七${branchIndex + 1}`,
            learningCommissioner: `周八${branchIndex + 1}`,
            memberCount: 20 + branchIndex,
            averageAge: 35 + (branchIndex % 5),
            performance2024: ['A', 'B+', 'A-', 'B', 'A+'][branchIndex % 5],
            secretaryProject: `支部书记项目${branchIndex + 1}`,
            honors: `荣誉${branchIndex + 1}`
          };

          setSelectedBranch(newSelectedBranch);
        } else {
          console.error('找不到支部数据, branchIndex:', branchIndex);
        }
      });
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (username === 'admin' && password === 'bdes@123') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('用户名或密码错误');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      alert('请上传Excel文件（.xlsx或.xls格式）');
      return;
    }

    // 创建FormData对象并添加文件
    const formData = new FormData();
    formData.append('file', file);

    // 显示上传中提示
    setIsRefreshing(true);

    // 将文件发送到服务器
    axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        console.log('文件上传成功:', response.data);
        alert(`文件 "${file.name}" 上传成功！数据已更新。`);

        // 刷新支部列表和当前选中的支部数据
        axios.get('/api/branches')
          .then((response) => {
            setBranches(response.data);
            if (selectedBranch && selectedBranch.id) {
              fetchBranchDetails(selectedBranch.id);
            } else if (response.data.length > 0) {
              fetchBranchDetails(response.data[0].id);
            }
          })
          .catch((error) => {
            console.error('获取支部列表失败:', error);
          });
      })
      .catch(error => {
        console.error('文件上传失败:', error);
        alert('文件上传失败，请重试。');
      })
      .finally(() => {
        setIsRefreshing(false);

        // 清空文件输入，以便可以重复上传同一个文件
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDownloadTemplate = () => {
    try {
      // 创建工作簿对象
      const workbook = utils.book_new();

      // 为每个工作表添加数据
      Object.entries(excelTemplateData).forEach(([sheetName, data]) => {
        const worksheet = utils.aoa_to_sheet(data);
        utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      // 保存Excel文件
      writeFile(workbook, "党支部数据模板.xlsx");
    } catch (error) {
      console.error("Excel模板下载失败", error);
      alert("Excel模板下载失败，请稍后重试");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRefresh = () => {
    setIsRefreshing(true);

    // 添加页面刷新动画效果
    const cards = document.querySelectorAll('.radar-chart-card, .chart-item, .monthly-chart-container');

    // 为每个卡片添加淡出和淡入效果
    cards.forEach((card) => {
      const element = card as HTMLElement;
      element.style.transition = 'opacity 0.5s';
      element.style.opacity = '0.2';

      setTimeout(() => {
        element.style.opacity = '1';
      }, 800);
    });

    // 刷新当前选中的支部数据
    if (selectedBranch && branches.length > 0) {
      const currentBranchId = branches.find(b => b.name === selectedBranch.name)?.id;
      if (currentBranchId) {
        fetchBranchDetails(currentBranchId);
      }
    }

    // 模拟数据更新过程
    setTimeout(() => {
      // 更新月度工作图表
      const monthlyChartEl = document.querySelector('.monthly-chart-container canvas');
      if (monthlyChartEl) {
        const chartInstance = ChartJS.getChart(monthlyChartEl as HTMLCanvasElement);
        if (chartInstance && chartInstance.data && chartInstance.data.datasets) {
          chartInstance.data.datasets.forEach(dataset => {
            if (dataset.data) {
              for (let i = 0; i < dataset.data.length; i++) {
                dataset.data[i] = Math.floor(Math.random() * 40) + 60;
              }
            }
          });
          chartInstance.update();
        }
      }

      setIsRefreshing(false);
    }, 1200);
  };

  // 处理主题切换
  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', checked ? 'dark' : 'light');
  };

  // 处理导航
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleNavigate = (key: string) => {
    setCurrentSection(key);

    // 如果导航到支部概览，加载选中支部的详细信息
    if (key === 'overview' && branches.length > 0 && selectedBranch) {
      fetchBranchDetails(selectedBranch.id);
    }
  };

  // 渲染内容区域
  const renderContent = () => {
    // 根据当前选择的部分加载不同的页面
    if (currentSection === 'data-upload') {
      const DataUploadPage = React.lazy(() => import('./pages/DataUploadPage/index'));
      return (
        <React.Suspense fallback={<div>加载中...</div>}>
          <DataUploadPage />
        </React.Suspense>
      );
    }

    // 加载11个支部雷达图页面
    if (currentSection === 'all-branches-radar') {
      const AllBranchesRadarView = React.lazy(() => import('./components/AllBranchesRadarView'));
      return (
        <React.Suspense fallback={<div>加载中...</div>}>
          <div className="content-container">
            <AllBranchesRadarView />
          </div>
        </React.Suspense>
      );
    }

    // 加载支部雷达图页面
    if (currentSection === 'simple-branch-radar' || currentSection === 'radar-demo') {
      const BranchCapability = React.lazy(() => import('./components/BranchCapability'));
      return (
        <React.Suspense fallback={<div>加载中...</div>}>
          <div className="content-container">
            <BranchCapability />
          </div>
        </React.Suspense>
      );
    }

    // 加载人员管理页面
    if (currentSection === 'personnel') {
      const PersonnelManagementPage = React.lazy(() => import('./pages/PersonnelManagementPage/index'));
      return (
        <React.Suspense fallback={<div>加载中...</div>}>
          <PersonnelManagementPage />
        </React.Suspense>
      );
    }

    // 加载工作管理页面
    if (currentSection === 'work') {
      const WorkManagementPage = React.lazy(() => import('./pages/WorkManagementPage/index'));
      return (
        <React.Suspense fallback={<div>加载中...</div>}>
          <WorkManagementPage />
        </React.Suspense>
      );
    }

    // 加载年度工作页面
    if (currentSection === 'annual-work') {
      return (
        <React.Suspense fallback={<div>加载中...</div>}>
          <div className="content-container">
            <h2>年度工作</h2>
            {selectedBranch && <AppAnnualWork branch={selectedBranch} />}
          </div>
        </React.Suspense>
      );
    }

    // 加载月度工作页面
    if (currentSection === 'monthly-work') {
      return (
        <React.Suspense fallback={<div>加载中...</div>}>
          <div className="content-container">
            <h2>月度工作完成情况</h2>
            <AppMonthlyWork branches={branches} />
          </div>
        </React.Suspense>
      );
    }

    // 加载AI分析页面
    if (currentSection === 'ai') {
      const AIAnalysisPage = React.lazy(() => import('./pages/AIAnalysisPage/index'));
      return (
        <React.Suspense fallback={<div>加载中...</div>}>
          <AIAnalysisPage />
        </React.Suspense>
      );
    }

    // 加载系统设置页面
    if (currentSection === 'settings') {
      const SettingsPage = React.lazy(() => import('./pages/SettingsPage/index'));
      return (
        <React.Suspense fallback={<div>加载中...</div>}>
          <SettingsPage />
        </React.Suspense>
      );
    }

    // 默认显示11个支部雷达图页面
    const AllBranchesRadarView = React.lazy(() => import('./components/AllBranchesRadarView'));
    return (
      <React.Suspense fallback={<div>加载中...</div>}>
        <div className="content-container">
          <AllBranchesRadarView />
        </div>
      </React.Suspense>
    );
  };

  if (!isLoggedIn) {
    return (
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
          token: {
            colorPrimary: '#0056A4',
          },
        }}
      >
        <div className="login-overlay">
          <div className="login-container">
            <div className="login-title">党支部数据展示系统</div>
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">用户名</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  placeholder="请输入用户名"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">密码</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="请输入密码"
                />
              </div>
              {loginError && <div className="error-message">{loginError}</div>}
              <button type="submit" className="login-button">
                登录
              </button>
            </form>
          </div>
        </div>
      </ConfigProvider>
    );
  }

  if (isLoading) {
    return (
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
          token: {
            colorPrimary: '#0056A4',
          },
        }}
      >
        <LoadingScreen message="正在加载数据，请稍候..." />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#0056A4',
        },
      }}
    >
      <ErrorBoundary>
        <DndProvider backend={HTML5Backend}>
          <div className="app-container">
            <Layout className="layout">
              <div className="drag-mode-toggle">
                <button 
                  className={`drag-mode-button ${isDraggable ? 'active' : ''}`}
                  onClick={() => setIsDraggable(!isDraggable)}
                >
                  {isDraggable ? '退出拖拽模式' : '拖拽模式'}
                </button>
              </div>
              <div className="header">
                <div className="header-left">
                  <img src="/gz_logo.png" alt="Logo" className="header-logo" onError={(e) => {
                    e.currentTarget.src = process.env.PUBLIC_URL + "/gz_logo.png";
                    if (!e.currentTarget.src.includes("gz_logo.png")) {
                      e.currentTarget.src = "../gz_logo.png";
                    }
                  }} />
                </div>
                <div className="header-content">
                  <div className="header-title">党支部数据展示系统</div>
                  <div className="header-subtitle">Designed By Liuxing_hq</div>
                </div>
                <div className="header-right">
                  {/* 移除了支部选择下拉框 */}
                </div>
              </div>
              <Content className="content">
                {isRefreshing ? (
                  <div className="refresh-overlay">
                    <div className="refresh-spinner">
                      <div className="spinner"></div>
                      <p>正在刷新数据...</p>
                    </div>
                  </div>
                ) : null}
                
                <div className="top-section">
                  <div className="top-section-content">
                    {selectedBranch && <AppBasicInfo branch={selectedBranch} />}
                    {selectedBranch && <AppPersonnelAnalysis branch={selectedBranch} />}
                    {selectedBranch && <AppAnnualWork branch={selectedBranch} />}
                  </div>
                </div>
                <div className="dashboard-section">
                  <React.Suspense fallback={<div>加载中...</div>}>
                    <DraggableDashboard 
                      selectedBranch={selectedBranch}
                      branches={branches}
                      isDraggable={isDraggable}
                    />
                  </React.Suspense>
                </div>
              </Content>
            </Layout>
          </div>
        </DndProvider>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
