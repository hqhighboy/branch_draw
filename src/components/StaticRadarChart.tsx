import React from 'react';

/**
 * 静态雷达图组件 - 使用预定义的SVG图形
 */
const StaticRadarChart: React.FC = () => {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '10px'
    }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 200 200" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 背景圆 */}
        <circle cx="100" cy="100" r="80" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="1" />
        
        {/* 网格线 */}
        <circle cx="100" cy="100" r="60" fill="none" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4,4" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4,4" />
        <circle cx="100" cy="100" r="20" fill="none" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4,4" />
        
        {/* 轴线 */}
        <line x1="100" y1="20" x2="100" y2="180" stroke="#d0d0d0" strokeWidth="1" />
        <line x1="20" y1="100" x2="180" y2="100" stroke="#d0d0d0" strokeWidth="1" />
        <line x1="38" y1="38" x2="162" y2="162" stroke="#d0d0d0" strokeWidth="1" />
        <line x1="38" y1="162" x2="162" y2="38" stroke="#d0d0d0" strokeWidth="1" />
        
        {/* 数据多边形 - 示例数据 */}
        <polygon 
          points="100,40 150,70 130,140 70,140 50,70" 
          fill="rgba(24, 144, 255, 0.2)" 
          stroke="rgba(24, 144, 255, 0.8)" 
          strokeWidth="2" 
        />
        
        {/* 数据点 */}
        <circle cx="100" cy="40" r="4" fill="white" stroke="rgba(24, 144, 255, 0.8)" strokeWidth="2" />
        <circle cx="150" cy="70" r="4" fill="white" stroke="rgba(24, 144, 255, 0.8)" strokeWidth="2" />
        <circle cx="130" cy="140" r="4" fill="white" stroke="rgba(24, 144, 255, 0.8)" strokeWidth="2" />
        <circle cx="70" cy="140" r="4" fill="white" stroke="rgba(24, 144, 255, 0.8)" strokeWidth="2" />
        <circle cx="50" cy="70" r="4" fill="white" stroke="rgba(24, 144, 255, 0.8)" strokeWidth="2" />
        
        {/* 标签 */}
        <text x="100" y="20" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill="#333">组织</text>
        <text x="170" y="70" textAnchor="start" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill="#333">考核</text>
        <text x="140" y="160" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill="#333">人才</text>
        <text x="60" y="160" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill="#333">党建</text>
        <text x="30" y="70" textAnchor="end" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill="#333">任务</text>
      </svg>
    </div>
  );
};

export default StaticRadarChart;
