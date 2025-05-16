/**
 * @file 测试工具函数
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { BranchProvider } from '../context/BranchContext';

// 测试包装器属性
interface TestWrapperProps {
  children: React.ReactNode;
}

/**
 * 测试包装器组件
 * @param {TestWrapperProps} props 组件属性
 * @returns {JSX.Element} 测试包装器组件
 */
const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  return (
    <ConfigProvider>
      <BranchProvider>
        {children}
      </BranchProvider>
    </ConfigProvider>
  );
};

/**
 * 自定义渲染函数
 * @param {ReactElement} ui 要渲染的UI组件
 * @param {RenderOptions} options 渲染选项
 * @returns {Object} 渲染结果
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options });

// 导出所有testing-library函数
export * from '@testing-library/react';

// 导出自定义渲染函数
export { customRender as render };
