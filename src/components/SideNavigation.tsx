import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Tooltip } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  RadarChartOutlined,
  UploadOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  TableOutlined,
  HeatMapOutlined,
  LineChartOutlined,
  FileTextOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

interface SideNavigationProps {
  onNavigate: (key: string) => void;
  currentSection: string;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ onNavigate, currentSection }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      theme="light"
      width={220}
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginRight: '20px',
        background: token.colorBgContainer,
      }}
    >
      <div style={{
        padding: '16px',
        textAlign: 'center',
        color: token.colorPrimary,
        fontWeight: 'bold',
        fontSize: collapsed ? '14px' : '16px',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {collapsed ? '党支部系统' : '党支部数据展示系统'}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[currentSection]}
        style={{ borderRight: 0 }}
        onClick={({ key }) => onNavigate(key)}
        items={[
          {
            key: 'overview',
            icon: <HomeOutlined />,
            label: '支部概览'
          },
          {
            key: 'personnel',
            icon: <TeamOutlined />,
            label: '人员分析'
          },
          {
            key: 'work',
            icon: <ScheduleOutlined />,
            label: '工作计划',
            children: [
              {
                key: 'annual-work',
                label: '年度工作'
              },
              {
                key: 'monthly-work',
                label: '月度工作'
              }
            ]
          },
          {
            key: 'all-branches-radar',
            icon: <RadarChartOutlined />,
            label: '11个支部雷达图'
          },
          {
            key: 'simple-branch-radar',
            icon: <RadarChartOutlined />,
            label: '支部雷达图'
          },
          {
            key: 'radar-demo',
            icon: <RadarChartOutlined />,
            label: '雷达图演示'
          },
          {
            key: 'capability',
            icon: <RadarChartOutlined />,
            label: '能力画像',
            children: [
              {
                key: 'overview',
                icon: <TableOutlined />,
                label: '全部支部视图'
              },
              {
                key: 'monthly-work',
                icon: <ScheduleOutlined />,
                label: '月度工作视图'
              },
              {
                key: 'bar-view',
                icon: <BarChartOutlined />,
                label: '柱状图视图'
              },
              {
                key: 'card-view',
                icon: <AppstoreOutlined />,
                label: '卡片视图'
              },
              {
                key: 'heatmap-view',
                icon: <HeatMapOutlined />,
                label: '热力图视图'
              },
              {
                key: 'trend-view',
                icon: <LineChartOutlined />,
                label: '趋势图视图'
              },
              {
                key: 'all-branches-radar',
                icon: <RadarChartOutlined />,
                label: '雷达图视图'
              }
            ]
          },
          {
            key: 'data-upload',
            icon: <UploadOutlined />,
            label: '数据上传'
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '系统设置'
          },
          {
            key: 'user',
            icon: <UserOutlined />,
            label: '用户信息'
          }
        ]}
      />

      <div style={{
        position: 'absolute',
        bottom: '20px',
        width: '100%',
        textAlign: 'center',
        padding: '0 16px'
      }}>
        <Tooltip title={collapsed ? "展开菜单" : "收起菜单"}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{ width: '100%' }}
          />
        </Tooltip>
      </div>
    </Sider>
  );
};

export default SideNavigation;
