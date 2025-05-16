/**
 * @file 卡片组件，用于包装内容
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React from 'react';
import { Card as AntCard } from 'antd';
import './Card.css';

// 卡片组件属性
interface CardProps {
  title: string;
  className?: string;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  children: React.ReactNode;
  extra?: React.ReactNode;
}

/**
 * 卡片组件
 * @param {CardProps} props 组件属性
 * @returns {JSX.Element} 卡片组件
 */
const Card: React.FC<CardProps> = ({
  title,
  className = '',
  style,
  bodyStyle,
  children,
  extra
}) => {
  return (
    <AntCard
      title={title}
      className={`dashboard-card ${className}`}
      style={style}
      bodyStyle={bodyStyle}
      extra={extra}
    >
      {children}
    </AntCard>
  );
};

export default Card;
