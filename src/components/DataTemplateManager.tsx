import React, { useState, useRef } from 'react';
import axios from 'axios';
import './DataTemplateManager.css';

interface TemplateInfo {
  id: string;
  name: string;
  downloadUrl: string;
  uploadUrl: string;
  description: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  stats?: {
    total: number;
    inserted: number;
    updated: number;
    [key: string]: any;
  };
  errors?: string[];
}

const DataTemplateManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('party-member');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 定义所有可用的模板
  const templates: TemplateInfo[] = [
    {
      id: 'party-member',
      name: '党员信息模板',
      downloadUrl: '/api/party-member-template',
      uploadUrl: '/api/import-party-members',
      description: '用于导入党员基本信息和职务信息，支持增量更新。'
    },
    {
      id: 'employee',
      name: '员工信息模板',
      downloadUrl: '/api/employee-template',
      uploadUrl: '/api/import-employees',
      description: '用于导入员工基本信息，包括姓名、年龄、学历等。'
    },
    {
      id: 'annual-work',
      name: '年度重点工作模板',
      downloadUrl: '/api/annual-work-template',
      uploadUrl: '/api/upload-annual-work',
      description: '用于导入各支部年度重点工作计划和进度，支持增量更新。'
    },
    {
      id: 'capability',
      name: '支部能力画像模板',
      downloadUrl: '/api/capability-template',
      uploadUrl: '/api/upload-capability',
      description: '用于导入支部综合能力画像数据，包括组织建设、思想建设等维度。'
    }
  ];

  // 获取当前选中的模板
  const currentTemplate = templates.find(t => t.id === activeTab) || templates[0];

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      alert('请上传Excel文件（.xlsx或.xls格式）');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      // 创建FormData对象并添加文件
      const formData = new FormData();
      formData.append('file', file);

      // 发送请求
      const response = await axios.post(currentTemplate.uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // 处理响应
      setUploadResult({
        success: response.data.success || true,
        message: response.data.message || '数据导入成功',
        stats: response.data.stats || {
          total: response.data.total || 0,
          inserted: response.data.inserted || 0,
          updated: response.data.updated || 0
        }
      });
    } catch (error: any) {
      console.error('上传失败:', error);
      
      // 处理错误
      setUploadResult({
        success: false,
        message: error.response?.data?.message || '上传失败，请检查文件格式或联系管理员',
        errors: error.response?.data?.errors || ['未知错误']
      });
    } finally {
      setIsUploading(false);
      // 清空文件输入，以便可以重复上传同一个文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 下载模板
  const downloadTemplate = () => {
    window.open(`${currentTemplate.downloadUrl}?t=${new Date().getTime()}`, '_blank');
  };

  return (
    <div className="data-template-manager">
      <h2>数据模板管理</h2>
      
      <div className="template-tabs">
        {templates.map(template => (
          <button
            key={template.id}
            className={`template-tab ${activeTab === template.id ? 'active' : ''}`}
            onClick={() => setActiveTab(template.id)}
          >
            {template.name}
          </button>
        ))}
      </div>
      
      <div className="template-content">
        <div className="template-info">
          <h3>{currentTemplate.name}</h3>
          <p>{currentTemplate.description}</p>
        </div>
        
        <div className="template-actions">
          <button 
            className="template-download-btn"
            onClick={downloadTemplate}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            下载{currentTemplate.name}
          </button>
          
          <div className="upload-container">
            <input
              type="file"
              ref={fileInputRef}
              className="file-input"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              id="template-file-input"
              disabled={isUploading}
            />
            <button
              className="template-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {isUploading ? '上传中...' : `上传${currentTemplate.name}`}
            </button>
          </div>
        </div>
        
        {uploadResult && (
          <div className={`upload-result ${uploadResult.success ? 'success' : 'error'}`}>
            <h4>{uploadResult.success ? '上传成功' : '上传失败'}</h4>
            <p>{uploadResult.message}</p>
            
            {uploadResult.success && uploadResult.stats && (
              <div className="upload-stats">
                <div className="stat-item">
                  <span className="stat-label">总记录数:</span>
                  <span className="stat-value">{uploadResult.stats.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">新增记录:</span>
                  <span className="stat-value">{uploadResult.stats.inserted}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">更新记录:</span>
                  <span className="stat-value">{uploadResult.stats.updated}</span>
                </div>
              </div>
            )}
            
            {!uploadResult.success && uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="upload-errors">
                <h5>错误详情:</h5>
                <ul>
                  {uploadResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTemplateManager;
