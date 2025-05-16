import React from 'react';
import { Layout, Typography, Avatar, Dropdown, Space, Button, Badge, Tooltip, MenuProps } from 'antd';
import { UserOutlined, BellOutlined, QuestionCircleOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import ThemeSwitcher from './ThemeSwitcher';
import './AppHeader.css';

const { Header } = Layout;
const { Title } = Typography;

interface AppHeaderProps {
  username: string;
  isDarkMode: boolean;
  onThemeChange: (checked: boolean) => void;
  onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  username,
  isDarkMode,
  onThemeChange,
  onLogout
}) => {
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

  const notificationMenuItems: MenuProps['items'] = [
    {
      key: 'notification-1',
      label: '系统更新通知',
      onClick: () => console.log('查看系统更新通知')
    },
    {
      key: 'notification-2',
      label: '数据导入完成',
      onClick: () => console.log('查看数据导入通知')
    },
    {
      key: 'notification-3',
      label: '查看所有通知',
      onClick: () => console.log('查看所有通知')
    }
  ];

  return (
    <Header className={`app-header ${isDarkMode ? 'app-header-dark' : ''}`}>
      <div className="header-left">
        <img
          src="/gz_logo.png"
          alt="广州供电局Logo"
          className="header-logo"
        />
        <div className="header-title-container">
          <Title
            level={3}
            className={`header-title ${isDarkMode ? 'header-title-dark' : ''}`}
            style={{ textAlign: 'center', width: '100%' }}
          >
            广州供电局变电管理二所党支部数据展示系统
            <span className={`header-subtitle ${isDarkMode ? 'header-subtitle-dark' : ''}`} style={{ display: 'inline-block', marginLeft: '15px', fontWeight: 'normal', verticalAlign: 'middle', fontSize: '12px' }}>
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
          <Badge count={2} size="small">
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
            <span>{username}</span>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
