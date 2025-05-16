import React, { useState } from 'react';
import { Card, Select, Typography, Divider } from 'antd';
import './SimpleBranchRadarPage.css';

const { Option } = Select;
const { Title } = Typography;

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
 * 简单支部雷达图页面
 */
const SimpleBranchRadarPage: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState(branchesData[0]);

  // 处理支部选择变化
  const handleBranchChange = (branchId: number) => {
    const branch = branchesData.find(b => b.id === branchId);
    if (branch) {
      setSelectedBranch(branch);
    }
  };

  // 雷达图SVG配置
  const size = 400;
  const center = size / 2;
  const radius = (size / 2) * 0.8;
  const padding = 40;

  // 计算多边形顶点
  const calculatePoints = (scores: number[]) => {
    return scores.map((score, index) => {
      const normalizedValue = score / 100; // 标准化到0-1
      const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
      const x = center + radius * normalizedValue * Math.cos(angle);
      const y = center + radius * normalizedValue * Math.sin(angle);
      return { x, y };
    });
  };

  // 生成多边形路径
  const points = calculatePoints(selectedBranch.scores);
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
    return { x1: center, y1: center, x2: x, y2: y };
  });

  return (
    <div className="simple-branch-radar-page">
      <Card className="radar-card">
        <Title level={3} className="page-title">支部能力雷达图展示</Title>
        <div className="branch-selector-container">
          <span className="selector-label">选择支部：</span>
          <Select
            defaultValue={selectedBranch.id}
            style={{ width: 300 }}
            onChange={handleBranchChange}
          >
            {branchesData.map(branch => (
              <Option key={branch.id} value={branch.id}>{branch.name}</Option>
            ))}
          </Select>
        </div>
        
        <Divider />
        
        <div className="radar-container">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* 背景圆 */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="rgba(240, 240, 240, 0.3)"
              stroke="rgba(200, 200, 200, 0.3)"
              strokeWidth="1"
            />
            
            {/* 网格线 */}
            {gridLines.map((points, index) => (
              <polygon
                key={`grid-${index}`}
                points={points}
                fill="none"
                stroke="rgba(200, 200, 200, 0.5)"
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
                stroke="rgba(150, 150, 150, 0.5)"
                strokeWidth="1"
              />
            ))}
            
            {/* 数据多边形 */}
            <polygon
              points={polygonPoints}
              fill="rgba(24, 144, 255, 0.2)"
              stroke="rgba(24, 144, 255, 0.8)"
              strokeWidth="2"
            />
            
            {/* 数据点 */}
            {points.map((point, index) => (
              <circle
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#fff"
                stroke="rgba(24, 144, 255, 0.8)"
                strokeWidth="2"
              />
            ))}
            
            {/* 标签 */}
            {dimensions.map((label, index) => {
              const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
              const labelRadius = radius * 1.15;
              const x = center + labelRadius * Math.cos(angle);
              const y = center + labelRadius * Math.sin(angle);
              
              // 根据角度调整文本对齐方式
              let textAnchor = 'middle';
              if (angle > -Math.PI * 0.25 && angle < Math.PI * 0.25) textAnchor = 'start';
              else if (angle > Math.PI * 0.75 || angle < -Math.PI * 0.75) textAnchor = 'end';
              
              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  fontSize="14"
                  fill="#333"
                  fontWeight="bold"
                >
                  {label}
                </text>
              );
            })}
            
            {/* 分数标签 */}
            {[25, 50, 75, 100].map((score, index) => (
              <text
                key={`score-${index}`}
                x={center}
                y={center - radius * (score / 100) + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#999"
              >
                {score}
              </text>
            ))}
          </svg>
        </div>
        
        <div className="score-details">
          <Title level={4}>{selectedBranch.name} 能力评分</Title>
          <div className="score-grid">
            {dimensions.map((dimension, index) => (
              <div key={`score-item-${index}`} className="score-item">
                <div className="dimension-name">{dimension}</div>
                <div className="dimension-score">{selectedBranch.scores[index]}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SimpleBranchRadarPage;
