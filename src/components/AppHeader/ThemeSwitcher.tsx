/**
 * @file 主题切换组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React from 'react';
import { Switch, Tooltip } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import './ThemeSwitcher.css';

// 组件属性
interface ThemeSwitcherProps {
  isDarkMode: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * 主题切换组件
 * @param {ThemeSwitcherProps} props 组件属性
 * @returns {JSX.Element} 主题切换组件
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ isDarkMode, onChange }) => {
  return (
    <Tooltip title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}>
      <Switch
        checked={isDarkMode}
        onChange={onChange}
        checkedChildren={<BulbFilled />}
        unCheckedChildren={<BulbOutlined />}
        className="theme-switch"
      />
    </Tooltip>
  );
};

export default ThemeSwitcher;
