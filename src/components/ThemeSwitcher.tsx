import React from 'react';
import { Switch, Tooltip } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';

interface ThemeSwitcherProps {
  isDarkMode: boolean;
  onChange: (checked: boolean) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ isDarkMode, onChange }) => {
  return (
    <Tooltip title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}>
      <Switch
        checked={isDarkMode}
        onChange={onChange}
        checkedChildren={<BulbFilled />}
        unCheckedChildren={<BulbOutlined />}
        style={{ marginLeft: 16 }}
      />
    </Tooltip>
  );
};

export default ThemeSwitcher;
