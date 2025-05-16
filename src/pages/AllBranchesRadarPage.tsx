import React from 'react';
import { Typography, Row, Col, Button } from 'antd';
import { DownloadOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import './AllBranchesRadarPage.css';

const { Title } = Typography;

// 导出组件以便在其他页面中使用
export { BranchRadar, AllBranchesRadarSection };

// 模拟支部数据
const branchesData = [
  {
    id: 1,
    name: '党建人事党支部',
    scores: [85, 78, 92, 80, 88, 75]
  },
  {
    id: 2,
    name: '综合党支部',
    scores: [90, 82, 75, 88, 79, 85]
  },
  {
    id: 3,
    name: '生技党支部',
    scores: [75, 85, 80, 70, 90, 85]
  },
  {
    id: 4,
    name: '安监党支部',
    scores: [80, 75, 85, 90, 70, 80]
  },
  {
    id: 5,
    name: '数字运行部党支部',
    scores: [95, 80, 85, 75, 85, 90]
  },
  {
    id: 6,
    name: '检修试验党支部',
    scores: [85, 90, 80, 85, 75, 80]
  },
  {
    id: 7,
    name: '继保自动化党支部',
    scores: [80, 85, 90, 80, 85, 75]
  },
  {
    id: 8,
    name: '500千伏科北数字巡维中心党支部',
    scores: [85, 80, 75, 90, 85, 80]
  },
  {
    id: 9,
    name: '500千伏北郊数字巡维中心党支部',
    scores: [80, 85, 90, 75, 80, 85]
  },
  {
    id: 10,
    name: '220千伏罗涌数字巡维中心党支部',
    scores: [90, 85, 80, 85, 75, 90]
  },
  {
    id: 11,
    name: '220千伏田心数字巡维中心党支部',
    scores: [85, 80, 90, 85, 80, 75]
  }
];

// 能力维度标签
const dimensions = ['组织管理', '考核指标', '人才培养', '党建基础', '任务落实', '安全廉洁'];

/**
 * 单个支部雷达图组件
 */
interface BranchRadarProps {
  branch: {
    id: number;
    name: string;
    scores: number[];
  };
}

const BranchRadar: React.FC<BranchRadarProps> = ({ branch }) => {
  // 雷达图SVG配置
  const size = 180;
  const center = size / 2;
  const radius = (size / 2) * 0.95;  // 增大雷达图区域

  // 计算多边形顶点
  const calculatePoints = (scores: number[]) => {
    return scores.map((score, index) => {
      const normalizedValue = score / 100; // 标准化到0-1
      const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
      const x = center + radius * normalizedValue * Math.cos(angle);
      const y = center + radius * normalizedValue * Math.sin(angle);
      return {
        x,
        y,
        score,
        dimension: dimensions[index],
        color: getColorForDimension(index),
        colorCode: getColorForDimension(index).replace('#', '')
      };
    });
  };

  // 生成多边形路径
  const points = calculatePoints(branch.scores);
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // 生成网格线
  const gridLines = [0.25, 0.5, 0.75, 1].map(level => {
    const gridPoints = Array.from({ length: dimensions.length }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
      const x = center + radius * level * Math.cos(angle);
      const y = center + radius * level * Math.sin(angle);
      return `${x},${y}`;
    });
    return gridPoints.join(' ');
  });

  // 生成轴线
  const axisLines = Array.from({ length: dimensions.length }).map((_, index) => {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return {
      x1: center,
      y1: center,
      x2: x,
      y2: y,
      color: getColorForDimension(index),
      colorCode: getColorForDimension(index).replace('#', '')
    };
  });

  // 计算平均分
  const averageScore = Math.round(branch.scores.reduce((a, b) => a + b, 0) / branch.scores.length);

  // 根据平均分确定颜色类
  const getScoreColorClass = (score: number) => {
    if (score >= 90) return 'text-52c41a'; // 优秀 - 绿色
    if (score >= 80) return 'text-1890ff'; // 良好 - 蓝色
    if (score >= 70) return 'text-faad14'; // 一般 - 黄色
    return 'text-f5222d'; // 较差 - 红色
  };

  return (
    <div className="radar-svg-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 背景圆 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#f9f9f9"
          stroke="#e8e8e8"
          strokeWidth="1"
        />

        {/* 网格线 */}
        {gridLines.map((points, index) => (
          <polygon
            key={`grid-${index}`}
            points={points}
            fill="none"
            stroke="#e8e8e8"
            strokeWidth="1"
            strokeDasharray={index < 3 ? "2,2" : ""}
          />
        ))}

        {/* 轴线 */}
        {axisLines.map((line, index) => (
          <line
            key={`axis-${index}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            className={`text-${line.colorCode}`}
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
        ))}

        {/* 数据多边形 */}
        <polygon
          points={polygonPoints}
          fill="rgba(24, 144, 255, 0.15)"
          stroke="#1890ff"
          strokeWidth="2"
        />

        {/* 数据点 */}
        {points.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="#fff"
            className={`stroke text-${point.colorCode}`}
            strokeWidth="2"
          />
        ))}

        {/* 中心分数 */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="18"
          fontWeight="bold"
          className={getScoreColorClass(averageScore)}
        >
          {averageScore}
        </text>

        {/* 分数标签 */}
        {points.map((point, index) => (
          <text
            key={`score-${index}`}
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="bold"
            className={`text-${point.colorCode}`}
            dx={point.x > center ? 12 : (point.x < center ? -12 : 0)}
            dy={point.y > center ? 12 : (point.y < center ? -12 : 0)}
          >
            {point.score}
          </text>
        ))}
      </svg>
    </div>
  );
};

/**
 * 所有支部雷达图部分 - 可在其他页面中重用
 */
const AllBranchesRadarSection: React.FC = () => {
  // 将支部数据分为两行
  const firstRowBranches = branchesData.slice(0, 6);
  const secondRowBranches = branchesData.slice(6);

  // 为每个支部分配CSS类
  const getBranchColorClasses = (index: number): { bg: string, border: string, text: string } => {
    const colorClasses = [
      { bg: 'bg-blue', border: 'border-blue', text: 'text-blue' },
      { bg: 'bg-red', border: 'border-red', text: 'text-red' },
      { bg: 'bg-green', border: 'border-green', text: 'text-green' },
      { bg: 'bg-yellow', border: 'border-yellow', text: 'text-yellow' },
      { bg: 'bg-purple', border: 'border-purple', text: 'text-purple' },
      { bg: 'bg-orange', border: 'border-orange', text: 'text-orange' },
    ];
    return colorClasses[index % colorClasses.length];
  };

  return (
    <div className="all-branches-radar-section">
      <div className="dimensions-legend">
        <Row gutter={[16, 8]} justify="center">
          {dimensions.map((dimension, index) => {
            const colorCode = getColorForDimension(index).replace('#', '');
            return (
              <Col key={`legend-${index}`}>
                <div className="dimension-item">
                  <div className={`dimension-color bg-dim-${colorCode}`}></div>
                  <div className="dimension-name">{dimension}</div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>

      <div className="radar-content">
        {/* 第一行 - 6个支部 */}
        <div className="radar-row">
          {firstRowBranches.map((branch, index) => {
            const colorClasses = getBranchColorClasses(index);
            return (
              <div key={branch.id} className="radar-col">
                <div className={`branch-card ${colorClasses.bg} ${colorClasses.border}`}>
                  <div className={`branch-name ${colorClasses.text}`}>
                    {branch.name}
                  </div>
                  <BranchRadar branch={branch} />
                  <div className={`branch-avg-score ${colorClasses.text}`}>
                    平均分: {Math.round(branch.scores.reduce((a, b) => a + b, 0) / branch.scores.length)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 第二行 - 5个支部 */}
        <div className="radar-row second-row">
          {secondRowBranches.map((branch, index) => {
            const colorClasses = getBranchColorClasses(index + 6);
            return (
              <div key={branch.id} className="radar-col">
                <div className={`branch-card ${colorClasses.bg} ${colorClasses.border}`}>
                  <div className={`branch-name ${colorClasses.text}`}>
                    {branch.name}
                  </div>
                  <BranchRadar branch={branch} />
                  <div className={`branch-avg-score ${colorClasses.text}`}>
                    平均分: {Math.round(branch.scores.reduce((a, b) => a + b, 0) / branch.scores.length)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * 所有支部雷达图页面 - 独立页面
 */
const AllBranchesRadarPage: React.FC = () => {
  return (
    <div className="all-branches-radar-page">
      <div className="radar-header">
        <Title level={2} className="page-title">党支部能力雷达图分析</Title>
      </div>

      <AllBranchesRadarSection />

      <div className="radar-footer">
        <Button type="primary" icon={<DownloadOutlined />} size="large">
          导出分析报告
        </Button>
        <Button icon={<ReloadOutlined />} size="large" style={{ marginLeft: 16 }}>
          刷新数据
        </Button>
        <Button icon={<SettingOutlined />} size="large" style={{ marginLeft: 16 }}>
          设置
        </Button>
      </div>
    </div>
  );
};

// 获取维度的颜色
function getColorForDimension(index: number): string {
  const colors = [
    '#1890ff', // 蓝色 - 组织管理
    '#52c41a', // 绿色 - 考核指标
    '#722ed1', // 紫色 - 人才培养
    '#fa8c16', // 橙色 - 党建基础
    '#eb2f96', // 粉色 - 任务落实
    '#faad14'  // 黄色 - 安全廉洁
  ];
  return colors[index % colors.length];
}

export default AllBranchesRadarPage;
