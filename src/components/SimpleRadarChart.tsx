import React from 'react';
import './SimpleRadarChart.css';

interface SimpleRadarChartProps {
  data: number[];
  labels: string[];
  size?: number;
  color?: string;
  backgroundColor?: string;
}

/**
 * 极简的雷达图组件，不依赖Chart.js
 */
const SimpleRadarChart: React.FC<SimpleRadarChartProps> = ({
  data,
  labels,
  size = 200,
  color = 'rgba(24, 144, 255, 0.8)',
  backgroundColor = 'rgba(24, 144, 255, 0.2)'
}) => {
  // 添加调试日志
  console.log('SimpleRadarChart data:', data);
  console.log('SimpleRadarChart labels:', labels);
  console.log('SimpleRadarChart size:', size); // 添加尺寸调试信息

  // 确保数据和标签都是有效的数组
  if (!Array.isArray(data) || !Array.isArray(labels)) {
    console.error('无效的数据或标签格式:', { data, labels });
    return <div className="radar-no-data">数据格式错误</div>;
  }

  // 确保数据和标签数量一致
  const validData = data.slice(0, labels.length);
  const pointCount = validData.length;

  console.log('处理后的数据:', validData);
  console.log('点数量:', pointCount);

  // 如果没有数据或者标签，则不渲染
  if (pointCount === 0) {
    return <div className="radar-no-data">无数据</div>;
  }

  // 确保至少有3个点才能形成有效的多边形
  if (pointCount < 3) {
    console.error('雷达图至少需要3个点才能渲染:', pointCount);
    return <div className="radar-no-data">数据点不足</div>;
  }

  // 计算中心点和半径
  const center = size / 2;
  const radius = (size / 2) * 0.9; // 进一步增大半径，使雷达图更加明显

  // 计算每个点的角度和坐标
  const points = validData.map((value, index) => {
    // 确保值是有效的数字
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;

    // 将值标准化到0-1之间 - 确保最大值为100
    const normalizedValue = Math.min(Math.max(safeValue, 0), 100) / 100;

    // 计算角度 (从12点钟方向开始，顺时针)
    // 对于六边形，我们需要从正上方开始，并且均匀分布6个点
    const angle = (Math.PI * 2 * index) / pointCount - Math.PI / 2;

    // 计算坐标 - 使用normalizedValue确保点在多边形内
    const x = center + radius * normalizedValue * Math.cos(angle);
    const y = center + radius * normalizedValue * Math.sin(angle);

    // 确保坐标是有效的数字
    return {
      x: isNaN(x) ? center : x,
      y: isNaN(y) ? center : y,
      value: safeValue,
      angle
    };
  });

  // 生成多边形路径
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  console.log('多边形路径:', polygonPoints);

  // 只生成两个网格线，减少视觉干扰
  const gridLines = [0.5, 1].map(level => {
    const gridPoints = Array.from({ length: pointCount }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / pointCount - Math.PI / 2;
      const x = center + radius * level * Math.cos(angle);
      const y = center + radius * level * Math.sin(angle);
      return `${x},${y}`;
    });
    return gridPoints.join(' ');
  });

  // 生成轴线
  const axisLines = Array.from({ length: pointCount }).map((_, index) => {
    const angle = (Math.PI * 2 * index) / pointCount - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x1: center, y1: center, x2: x, y2: y };
  });

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="radar-chart-svg">
      {/* 背景多边形 */}
      <polygon
        points={gridLines[1]}
        fill="rgba(240, 240, 240, 0.3)"
        stroke="rgba(200, 200, 200, 0.3)"
        strokeWidth="0.5"
      />

      {/* 网格线 */}
      {gridLines.map((points, index) => (
        <polygon
          key={`grid-${index}`}
          points={points}
          fill="none"
          stroke="rgba(200, 200, 200, 0.5)"
          strokeWidth="0.5"
          strokeDasharray={index === 0 ? "2,2" : ""}
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
          strokeWidth="0.5"
        />
      ))}

      {/* 数据多边形 */}
      {polygonPoints && (
        <polygon
          points={polygonPoints}
          fill={backgroundColor}
          stroke={color}
          strokeWidth="1.5"
        />
      )}

      {/* 数据点 */}
      {points.map((point, index) => (
        <circle
          key={`point-${index}`}
          cx={point.x}
          cy={point.y}
          r="3.5"
          fill="#fff"
          stroke={color}
          strokeWidth="2"
        />
      ))}

      {/* 标签 */}
      {labels.map((label, index) => {
        const angle = (Math.PI * 2 * index) / pointCount - Math.PI / 2;
        const labelRadius = radius * 1.15; // 调整标签位置，避免超出SVG边界
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
            fontSize="12"
            fill="#0056A4"
            fontWeight="600"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
};

export default SimpleRadarChart;
