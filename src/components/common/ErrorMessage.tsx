/**
 * @file 错误消息组件，用于显示错误信息
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React from 'react';
import { Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import './ErrorMessage.css';

// 错误消息组件属性
interface ErrorMessageProps {
  message: string;
  description?: string;
  onRetry?: () => void;
}

/**
 * 错误消息组件
 * @param {ErrorMessageProps} props 组件属性
 * @returns {JSX.Element} 错误消息组件
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  description,
  onRetry
}) => {
  return (
    <div className="error-message-container">
      <Alert
        message={message}
        description={description}
        type="error"
        showIcon
        className="error-alert"
        action={
          onRetry && (
            <Button
              icon={<ReloadOutlined />}
              size="small"
              type="primary"
              onClick={onRetry}
            >
              重试
            </Button>
          )
        }
      />
    </div>
  );
};

export default ErrorMessage;
