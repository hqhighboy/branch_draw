import React from 'react';
import './SimpleRadarDemo.css';

/**
 * 简单雷达图演示组件
 */
const SimpleRadarDemo: React.FC = () => {
  // 雷达图数据
  const data = [80, 65, 90, 75, 85, 70];
  const labels = ['组织管理', '考核指标', '人才培养', '党建基础', '任务落实', '安全廉洁'];
  
  // 雷达图尺寸和配置
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) * 0.8;
  
  // 计算多边形顶点
  const points = data.map((value, index) => {
    const normalizedValue = value / 100; // 标准化到0-1
    const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
    const x = center + radius * normalizedValue * Math.cos(angle);
    const y = center + radius * normalizedValue * Math.sin(angle);
    return { x, y };
  });
  
  // 生成多边形路径
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  
  // 生成网格线
  const gridLines = [0.25, 0.5, 0.75, 1].map(level => {
    const gridPoints = Array.from({ length: data.length }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
      const x = center + radius * level * Math.cos(angle);
      const y = center + radius * level * Math.sin(angle);
      return `${x},${y}`;
    });
    return gridPoints.join(' ');
  });
  
  // 生成轴线
  const axisLines = Array.from({ length: data.length }).map((_, index) => {
    const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x1: center, y1: center, x2: x, y2: y };
  });
  
  return (
    <div className="radar-demo-container">
      <h2>党支部能力雷达图演示</h2>
      
      <div className="radar-chart-container">
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
          {labels.map((label, index) => {
            const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
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
        </svg>
      </div>
      
      <div className="radar-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: 'rgba(24, 144, 255, 0.8)' }}></div>
          <div className="legend-label">当前支部能力水平</div>
        </div>
      </div>
      
      <div className="radar-description">
        <p>此雷达图展示了党支部在六个维度上的能力水平，数值范围为0-100。</p>
      </div>
    </div>
  );
};

export default SimpleRadarDemo;
