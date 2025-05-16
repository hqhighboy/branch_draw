/**
 * @file 加载组件，用于显示加载状态
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './Loading.css';

// 加载组件属性
interface LoadingProps {
  tip?: string;
  size?: 'small' | 'default' | 'large';
  fullScreen?: boolean;
}

/**
 * 加载组件
 * @param {LoadingProps} props 组件属性
 * @returns {JSX.Element} 加载组件
 */
const Loading: React.FC<LoadingProps> = ({
  tip = '加载中...',
  size = 'default',
  fullScreen = false
}) => {
  // 设置加载图标
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'small' ? 24 : size === 'large' ? 40 : 32 }} spin />;
  
  // 全屏加载
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <Spin indicator={antIcon} tip={tip} size={size} />
      </div>
    );
  }
  
  // 普通加载
  return (
    <div className="loading-container">
      <Spin indicator={antIcon} tip={tip} size={size} />
    </div>
  );
};

export default Loading;
