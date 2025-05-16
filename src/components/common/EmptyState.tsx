import React from 'react';
import { Empty } from 'antd';
import './CommonStyles.css';

interface EmptyStateProps {
  description?: string;
  image?: string;
  height?: number | string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  description = '暂无数据', 
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  height = '100%'
}) => {
  return (
    <div className="empty-container" style={{ height }}>
      <Empty 
        image={image}
        description={description}
        imageStyle={{ height: 60 }}
      />
    </div>
  );
};

export default EmptyState;
