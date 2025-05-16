import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer } = Layout;
const { Text } = Typography;

interface AppFooterProps {
  isDarkMode: boolean;
}

const AppFooter: React.FC<AppFooterProps> = ({ isDarkMode }) => {
  const currentYear = new Date().getFullYear();

  return (
    <Footer style={{
      textAlign: 'center',
      background: '#0056A4', // 南网蓝色
      color: '#ffffff', // 白色文字
      padding: '8px 50px',
      height: 40
    }}>
      <Text style={{ color: 'inherit' }}>
        广州供电局变电管理二所党支部数据展示系统 ©{currentYear} Designed by Liuxing
      </Text>
    </Footer>
  );
};

export default AppFooter;
