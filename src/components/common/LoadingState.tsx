import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './CommonStyles.css';

interface LoadingStateProps {
  tip?: string;
  size?: 'small' | 'default' | 'large';
  height?: number | string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  tip = '加载中...', 
  size = 'default',
  height = '100%'
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'small' ? 24 : size === 'large' ? 40 : 32 }} spin />;
  
  return (
    <div className="loading-container" style={{ height }}>
      <Spin indicator={antIcon} tip={tip} size={size} />
    </div>
  );
};

export default LoadingState;
