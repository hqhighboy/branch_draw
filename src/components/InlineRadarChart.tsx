import React from 'react';

interface InlineRadarChartProps {
  data: number[];
  labels: string[];
  color?: string;
  backgroundColor?: string;
}

/**
 * 内联雷达图组件，不依赖外部样式
 */
const InlineRadarChart: React.FC<InlineRadarChartProps> = ({
  data,
  labels,
  color = 'rgba(24, 144, 255, 0.8)',
  backgroundColor = 'rgba(24, 144, 255, 0.2)'
}) => {
  // 添加调试日志
  console.log('InlineRadarChart data:', data);
  console.log('InlineRadarChart labels:', labels);

  // 确保数据和标签都是有效的数组
  if (!Array.isArray(data) || !Array.isArray(labels)) {
    console.error('无效的数据或标签格式:', { data, labels });
    return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999', fontSize: '12px', background: '#f5f5f5', borderRadius: '50%' }}>数据格式错误</div>;
  }

  // 确保数据和标签数量一致
  const validData = data.slice(0, labels.length);
  const pointCount = validData.length;

  console.log('处理后的数据:', validData);
  console.log('点数量:', pointCount);

  // 如果没有数据或者标签，则不渲染
  if (pointCount === 0) {
    return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999', fontSize: '12px', background: '#f5f5f5', borderRadius: '50%' }}>无数据</div>;
  }

  // 确保至少有3个点才能形成有效的多边形
  if (pointCount < 3) {
    console.error('雷达图至少需要3个点才能渲染:', pointCount);
    return <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999', fontSize: '12px', background: '#f5f5f5', borderRadius: '50%' }}>数据点不足</div>;
  }

  // 固定尺寸
  const size = 180;
  const center = size / 2;
  const radius = (size / 2) * 0.8;

  // 计算每个点的角度和坐标
  const points = validData.map((value, index) => {
    // 确保值是有效的数字
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;

    // 将值标准化到0-1之间 - 确保最大值为100
    const normalizedValue = Math.min(Math.max(safeValue, 0), 100) / 100;

    // 计算角度 (从12点钟方向开始，顺时针)
    const angle = (Math.PI * 2 * index) / pointCount - Math.PI / 2;

    // 计算坐标 - 使用normalizedValue确保点在圆内
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
    <div style={{ width: '180px', height: '180px', margin: '0 auto', position: 'relative' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        {/* 背景圆 */}
        <circle
          cx={center}
          cy={center}
          r={radius}
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
            r="2.5"
            fill="#fff"
            stroke={color}
            strokeWidth="1.5"
          />
        ))}

        {/* 标签 */}
        {labels.map((label, index) => {
          const angle = (Math.PI * 2 * index) / pointCount - Math.PI / 2;
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
              fontSize="10"
              fill="#333"
              fontWeight="600"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default InlineRadarChart;
