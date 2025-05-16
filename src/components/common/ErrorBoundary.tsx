/**
 * @file 错误边界组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';
import './ErrorBoundary.css';

// 组件属性
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// 组件状态
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 用于捕获子组件树中的 JavaScript 错误，记录错误并显示备用 UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * 从错误中派生状态
   * @param {Error} error 捕获的错误
   * @returns {ErrorBoundaryState} 新状态
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新状态，下次渲染时显示备用 UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  /**
   * 捕获错误信息
   * @param {Error} error 捕获的错误
   * @param {ErrorInfo} errorInfo 错误信息
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // 这里可以添加错误上报逻辑
  }

  /**
   * 重置错误状态
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义的 fallback，则使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // 默认的错误 UI
      return (
        <div className="error-boundary">
          <Result
            status="error"
            title="组件渲染错误"
            subTitle={this.state.error?.message || '发生了未知错误'}
            extra={[
              <Button type="primary" key="reset" onClick={this.handleReset}>
                重试
              </Button>
            ]}
          >
            {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
              <div className="error-details">
                <details>
                  <summary>错误详情</summary>
                  <pre>{this.state.error?.toString()}</pre>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </details>
              </div>
            )}
          </Result>
        </div>
      );
    }

    // 正常渲染子组件
    return this.props.children;
  }
}

export default ErrorBoundary;
