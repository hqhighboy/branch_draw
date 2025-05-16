import React, { useState } from 'react';
import { 
  Upload, 
  Button, 
  message, 
  Card, 
  Typography, 
  Space, 
  Spin, 
  Alert, 
  Table,
  Divider
} from 'antd';
import { UploadOutlined, DownloadOutlined, ClearOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

interface UploadResult {
  success: boolean;
  message: string;
  data?: any;
  stats?: {
    total: number;
    inserted: number;
    updated: number;
    errors: number;
  };
  errors?: string[];
}

const EmployeeDataUploader: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [clearLoading, setClearLoading] = useState<boolean>(false);

  // 上传属性配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload/employee-data',
    headers: {
      authorization: 'authorization-text',
    },
    accept: '.xlsx,.xls',
    showUploadList: true,
    maxCount: 1,
    onChange(info) {
      if (info.file.status === 'uploading') {
        setLoading(true);
        setUploadResult(null);
      }
      if (info.file.status === 'done') {
        setLoading(false);
        const response = info.file.response as UploadResult;
        setUploadResult(response);
        
        if (response.success) {
          message.success(`${info.file.name} 文件上传成功`);
        } else {
          message.error(`${info.file.name} 文件上传失败: ${response.message}`);
        }
      } else if (info.file.status === 'error') {
        setLoading(false);
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  // 下载模板
  const handleDownloadTemplate = () => {
    window.location.href = '/api/download/employee-template';
    message.success('模板下载中...');
  };

  // 清空数据
  const handleClearData = async () => {
    try {
      setClearLoading(true);
      const response = await axios.post('/api/clear/employee-data');
      if (response.data.success) {
        message.success('数据已成功清空');
      } else {
        message.error(`清空数据失败: ${response.data.message}`);
      }
    } catch (error) {
      message.error('清空数据时发生错误');
      console.error('清空数据错误:', error);
    } finally {
      setClearLoading(false);
    }
  };

  // 渲染上传结果
  const renderUploadResult = () => {
    if (!uploadResult) return null;

    return (
      <div style={{ marginTop: '20px' }}>
        <Card 
          title="上传结果" 
          type="inner"
          style={{ 
            borderColor: uploadResult.success ? '#52c41a' : '#ff4d4f',
            marginBottom: '20px'
          }}
        >
          <p><strong>状态:</strong> {uploadResult.success ? '成功' : '失败'}</p>
          <p><strong>消息:</strong> {uploadResult.message}</p>
          
          {uploadResult.success && uploadResult.stats && (
            <div>
              <p><strong>总记录数:</strong> {uploadResult.stats.total}</p>
              <p><strong>新增记录:</strong> {uploadResult.stats.inserted}</p>
              <p><strong>更新记录:</strong> {uploadResult.stats.updated}</p>
              <p><strong>错误记录:</strong> {uploadResult.stats.errors}</p>
            </div>
          )}
          
          {(!uploadResult.success || (uploadResult.errors && uploadResult.errors.length > 0)) && (
            <div>
              <p><strong>错误详情:</strong></p>
              <ul>
                {(uploadResult.errors || []).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={4}>员工数据管理</Title>
        <Paragraph>
          通过上传Excel文件导入员工数据。请确保使用正确的模板格式，您可以点击"下载模板"按钮获取标准模板。
        </Paragraph>
        
        <Divider />
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} loading={loading}>上传Excel文件</Button>
            </Upload>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadTemplate}
            >
              下载模板
            </Button>
            <Button 
              icon={<ClearOutlined />} 
              danger 
              onClick={handleClearData}
              loading={clearLoading}
            >
              清空数据
            </Button>
          </Space>
          
          {loading && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Spin tip="正在处理数据..." />
            </div>
          )}
          
          {renderUploadResult()}
          
          <Alert
            message="注意事项"
            description={
              <ul>
                <li>请使用标准模板格式，不要修改表头</li>
                <li>支持.xlsx和.xls格式的Excel文件</li>
                <li>文件大小不应超过10MB</li>
                <li>上传过程中请勿刷新页面</li>
                <li>清空数据操作不可恢复，请谨慎操作</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
};

export default EmployeeDataUploader;
