import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = '加载中...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100%',
      background: 'rgba(255, 255, 255, 0.8)'
    }}>
      <Spin 
        indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
        size="large"
      />
      <Title level={4} style={{ marginTop: 24 }}>{message}</Title>
    </div>
  );
};

export default LoadingScreen;
