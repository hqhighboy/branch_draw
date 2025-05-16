/**
 * @file 应用头部组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { useState } from 'react';
import { Layout, Typography, Avatar, Dropdown, Space, Button, Badge, Tooltip, MenuProps } from 'antd';
import {
  UserOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useBranch } from '../../context/BranchContext';
import ThemeSwitcher from './ThemeSwitcher';
import './AppHeader.css';

const { Header } = Layout;
const { Title } = Typography;

// 组件属性
export interface AppHeaderProps {
  username: string;
  isDarkMode: boolean;
  onThemeChange: (checked: boolean) => void;
  onLogout: () => void;
}

/**
 * 应用头部组件
 * @param {AppHeaderProps} props 组件属性
 * @returns {JSX.Element} 应用头部组件
 */
const AppHeader: React.FC<AppHeaderProps> = ({
  username,
  isDarkMode,
  onThemeChange,
  onLogout
}) => {
  // 状态
  const [collapsed, setCollapsed] = useState<boolean>(false);
  // 获取支部上下文
  const { branches } = useBranch();

  // 状态
  const [notificationCount, setNotificationCount] = useState<number>(2);

  // 用户菜单项
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: '个人信息',
      icon: <UserOutlined />
    },
    {
      key: 'settings',
      label: '设置',
      icon: <SettingOutlined />
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: onLogout
    }
  ];

  // 通知菜单项
  const notificationMenuItems: MenuProps['items'] = [
    {
      key: 'notification-1',
      label: '系统更新通知',
      onClick: () => {
        console.log('查看系统更新通知');
        setNotificationCount(prev => Math.max(0, prev - 1));
      }
    },
    {
      key: 'notification-2',
      label: '数据导入完成',
      onClick: () => {
        console.log('查看数据导入通知');
        setNotificationCount(prev => Math.max(0, prev - 1));
      }
    },
    {
      key: 'notification-3',
      label: '查看所有通知',
      onClick: () => {
        console.log('查看所有通知');
        setNotificationCount(0);
      }
    }
  ];

  /**
   * 处理侧边栏折叠切换
   */
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Header className={`app-header ${isDarkMode ? 'app-header-dark' : ''}`}>
      <div className="header-left">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          className={`collapse-button ${isDarkMode ? 'collapse-button-dark' : ''}`}
        />

        <img
          src="/gz_logo.png"
          alt="广州供电局Logo"
          className="header-logo"
          onError={(e) => {
            e.currentTarget.src = process.env.PUBLIC_URL + "/gz_logo.png";
            if (!e.currentTarget.src.includes("gz_logo.png")) {
              e.currentTarget.src = "../../../gz_logo.png";
            }
          }}
        />

        <div className="header-title-container">
          <Title
            level={3}
            className={`header-title ${isDarkMode ? 'header-title-dark' : ''}`}
          >
            党支部数据展示系统
            <span className={`header-subtitle ${isDarkMode ? 'header-subtitle-dark' : ''}`}>
              Designed By Liuxing_hq
            </span>
          </Title>
        </div>
      </div>

      <div className="header-right">
        <Tooltip title="帮助中心">
          <Button
            type="text"
            icon={<QuestionCircleOutlined />}
            className={isDarkMode ? 'header-button-dark' : 'header-button'}
          />
        </Tooltip>

        <Dropdown
          menu={{ items: notificationMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Badge count={notificationCount} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              className={isDarkMode ? 'header-button-dark' : 'header-button'}
            />
          </Badge>
        </Dropdown>

        <ThemeSwitcher
          isDarkMode={isDarkMode}
          onChange={onThemeChange}
        />

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Space className={`user-dropdown ${isDarkMode ? 'user-dropdown-dark' : ''}`}>
            <Avatar icon={<UserOutlined />} />
            <span className="username">{username}</span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
