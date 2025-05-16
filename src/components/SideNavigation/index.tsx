/**
 * @file 侧边导航组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { useState } from 'react';
import { Layout, Menu, Tooltip } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  BarChartOutlined,
  RadarChartOutlined,
  RobotOutlined,
  FileTextOutlined,
  SettingOutlined,
  UploadOutlined
} from '@ant-design/icons';
import './SideNavigation.css';

const { Sider } = Layout;

// 组件属性
export interface SideNavigationProps {
  collapsed?: boolean;
  onNavigate?: (key: string) => void;
  currentSection?: string;
}

/**
 * 侧边导航组件
 * @param {SideNavigationProps} props 组件属性
 * @returns {JSX.Element} 侧边导航组件
 */
const SideNavigation: React.FC<SideNavigationProps> = ({
  collapsed = false,
  onNavigate,
  currentSection = 'dashboard'
}) => {
  // 状态
  const [selectedKeys, setSelectedKeys] = useState<string[]>([currentSection]);

  /**
   * 处理菜单项点击
   * @param {Object} info 菜单项信息
   */
  const handleMenuClick = (info: { key: string }) => {
    setSelectedKeys([info.key]);
    if (onNavigate) {
      onNavigate(info.key);
    }
  };

  return (
    <Sider
      width={200}
      collapsible
      collapsed={collapsed}
      collapsedWidth={80}
      trigger={null}
      className="side-navigation"
    >
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        onClick={handleMenuClick}
        className="side-menu"
        items={[
          {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: '支部概览',
          },
          {
            key: 'personnel',
            icon: <TeamOutlined />,
            label: '人员管理',
          },
          {
            key: 'work',
            icon: <BarChartOutlined />,
            label: '工作管理',
          },
          {
            key: 'capability',
            icon: <RadarChartOutlined />,
            label: '能力画像',
          },
          {
            key: 'ai',
            icon: <RobotOutlined />,
            label: 'AI分析',
          },
          {
            key: 'reports',
            icon: <FileTextOutlined />,
            label: '报表管理',
          },
          {
            key: 'data-upload',
            icon: <UploadOutlined />,
            label: '数据上传',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '系统设置',
          }
        ]}
      />

      <div className="side-footer">
        <Tooltip title="版本 1.0.0" placement="right">
          <div className="version-info">v1.0.0</div>
        </Tooltip>
      </div>
    </Sider>
  );
};

export default SideNavigation;
