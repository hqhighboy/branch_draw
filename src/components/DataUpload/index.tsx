import React, { useState } from 'react';
import { Upload, Button, message, Card, Select, Spin, Typography, Divider } from 'antd';
import { UploadOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import './DataUpload.css';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

// 数据类型选项
const DATA_TYPES = [
  { value: 'branch-info', label: '支部基本信息', template: '/templates/branch-info-template.xlsx' },
  { value: 'branch-members', label: '支部党员信息', template: '/templates/branch-members-template.xlsx' },
  { value: 'branch-capability', label: '支部能力画像', template: '/templates/branch-capability-template.xlsx' },
  { value: 'monthly-work', label: '月度工作完成情况', template: '/templates/monthly-work-template.xlsx' },
  { value: 'annual-work', label: '年度重点工作', template: '/templates/annual-work-template.xlsx' },
];

/**
 * 数据上传组件
 * 提供模板下载和数据上传功能
 */
const DataUpload: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('branch-info');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // 处理数据类型选择变更
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setUploadResult(null);
  };

  // 处理模板下载
  const handleDownloadTemplate = () => {
    const selectedTemplate = DATA_TYPES.find(type => type.value === selectedType)?.template;
    if (selectedTemplate) {
      // 创建一个临时链接并触发下载
      const link = document.createElement('a');
      link.href = selectedTemplate;
      link.download = selectedTemplate.split('/').pop() || 'template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('模板下载已开始');
    } else {
      message.error('无法找到所选类型的模板');
    }
  };

  // 上传文件的配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: `/api/upload/${selectedType}`,
    headers: {
      authorization: 'authorization-text',
    },
    accept: '.xlsx,.xls,.csv',
    showUploadList: false,
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                      file.type === 'application/vnd.ms-excel' ||
                      file.name.endsWith('.csv');
      if (!isExcel) {
        message.error('只能上传Excel或CSV文件!');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onChange(info) {
      if (info.file.status === 'uploading') {
        setUploading(true);
        setUploadResult(null);
      }
      if (info.file.status === 'done') {
        setUploading(false);
        message.success(`${info.file.name} 上传成功`);
        setUploadResult(info.file.response);
      } else if (info.file.status === 'error') {
        setUploading(false);
        message.error(`${info.file.name} 上传失败: ${info.file.response?.message || '未知错误'}`);
      }
    },
  };

  // 获取当前选择的数据类型标签
  const getSelectedTypeLabel = () => {
    return DATA_TYPES.find(type => type.value === selectedType)?.label || '未知类型';
  };

  return (
    <Card className="data-upload-card">
      <Title level={4}>数据上传</Title>
      <Paragraph>
        通过此功能，您可以下载数据模板，填写后上传到系统。系统将自动处理您上传的数据。
      </Paragraph>

      <div className="data-upload-section">
        <div className="data-type-selector">
          <Text strong>选择数据类型：</Text>
          <Select 
            value={selectedType} 
            onChange={handleTypeChange} 
            style={{ width: 200 }}
          >
            {DATA_TYPES.map(type => (
              <Option key={type.value} value={type.value}>{type.label}</Option>
            ))}
          </Select>
        </div>

        <div className="data-upload-actions">
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleDownloadTemplate}
            className="template-download-btn"
          >
            下载模板
          </Button>

          <Upload {...uploadProps}>
            <Button 
              type="primary" 
              icon={<UploadOutlined />} 
              loading={uploading}
              className="data-upload-btn"
            >
              上传数据
            </Button>
          </Upload>
        </div>
      </div>

      <Divider />

      <div className="upload-instructions">
        <Title level={5}>上传说明</Title>
        <Paragraph>
          <ul>
            <li>请先下载对应的数据模板，按照模板格式填写数据</li>
            <li>支持的文件格式：Excel (.xlsx, .xls) 或 CSV (.csv)</li>
            <li>文件大小不超过10MB</li>
            <li>上传前请确保数据格式正确，避免导入错误</li>
            <li>如遇到上传问题，请联系系统管理员</li>
          </ul>
        </Paragraph>
      </div>

      {uploading && (
        <div className="upload-loading">
          <Spin tip="正在上传..." />
        </div>
      )}

      {uploadResult && (
        <div className="upload-result">
          <Title level={5}>上传结果</Title>
          <div className="result-summary">
            <Text>成功导入：{uploadResult.success || 0} 条</Text>
            <Text>失败：{uploadResult.failed || 0} 条</Text>
          </div>
          {uploadResult.message && (
            <Paragraph>{uploadResult.message}</Paragraph>
          )}
        </div>
      )}
    </Card>
  );
};

export default DataUpload;
