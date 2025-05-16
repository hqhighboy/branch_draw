import React, { useState } from 'react';
import axios from 'axios';
import './PartyMemberImport.css';

interface ImportStats {
  total: number;
  inserted: number;
  updated: number;
  positions_added: number;
  errors: string[];
}

interface ImportResult {
  success: boolean;
  message: string;
  stats: ImportStats;
}

const PartyMemberImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('请选择要上传的Excel文件');
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('开始上传文件:', file.name);

      // 直接使用完整URL路径
      const response = await axios.post('http://localhost:3003/api/import-party-members', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // 添加超时设置
        timeout: 30000
      });

      console.log('上传成功，响应数据:', response.data);
      setResult(response.data);
    } catch (error: any) {
      console.error('上传失败:', error);

      // 更详细的错误信息
      let errorMessage = '上传失败，请检查文件格式或联系管理员';
      let errorDetails = '未知错误';

      if (error.response) {
        // 服务器响应了错误状态码
        errorMessage = `服务器错误: ${error.response.status}`;
        errorDetails = error.response.data?.message || JSON.stringify(error.response.data);
      } else if (error.request) {
        // 请求发出但没有收到响应
        errorMessage = '服务器没有响应，请检查后端服务是否运行';
        errorDetails = 'Network Error';
      } else {
        // 请求设置时发生错误
        errorMessage = '请求错误';
        errorDetails = error.message || '未知错误';
      }

      setResult({
        success: false,
        message: errorMessage,
        stats: {
          total: 0,
          inserted: 0,
          updated: 0,
          positions_added: 0,
          errors: [errorDetails]
        }
      });
    } finally {
      setIsUploading(false);
    }
  };

  const toggleTemplate = () => {
    setShowTemplate(!showTemplate);
  };

  return (
    <div className="party-member-import">
      <h2>党员信息导入</h2>

      <div className="import-form">
        <div className="file-input-container">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            id="party-member-file"
            disabled={isUploading}
          />
          <label htmlFor="party-member-file">
            {file ? file.name : '选择Excel文件'}
          </label>
        </div>

        <button
          type="button"
          className="upload-button"
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading ? '导入中...' : '开始导入'}
        </button>
      </div>

      <div className="template-info">
        <div className="template-actions">
          <button type="button" className="template-toggle" onClick={toggleTemplate}>
            {showTemplate ? '隐藏模板说明' : '查看模板说明'}
          </button>
          <div className="template-buttons">
            <button
              type="button"
              className="download-template"
              onClick={() => {
                // 使用完整URL并添加时间戳防止缓存
                window.open(`http://localhost:3003/api/party-member-template?t=${new Date().getTime()}`, '_blank');
              }}
            >
              下载党员信息模板
            </button>
            <button
              type="button"
              className="download-template"
              onClick={() => {
                // 使用完整URL并添加时间戳防止缓存
                window.open(`http://localhost:3003/api/employee-template?t=${new Date().getTime()}`, '_blank');
              }}
            >
              下载员工信息模板
            </button>
          </div>
        </div>

        {showTemplate && (
          <div className="template-details">
            <h3>Excel模板格式说明</h3>
            <p>请确保您的Excel文件包含以下列：</p>
            <table className="template-table">
              <thead>
                <tr>
                  <th>列名</th>
                  <th>说明</th>
                  <th>示例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>姓名</td>
                  <td>党员姓名（必填）</td>
                  <td>张三</td>
                </tr>
                <tr>
                  <td>支部信息</td>
                  <td>所属支部名称（必填）</td>
                  <td>党建人事部党支部</td>
                </tr>
                <tr>
                  <td>政治面貌</td>
                  <td>党员政治面貌</td>
                  <td>党员</td>
                </tr>
                <tr>
                  <td>党委书记</td>
                  <td>是否担任党委书记</td>
                  <td>是/√/Y</td>
                </tr>
                <tr>
                  <td>党委副书记</td>
                  <td>是否担任党委副书记</td>
                  <td>是/√/Y</td>
                </tr>
                <tr>
                  <td>纪委书记</td>
                  <td>是否担任纪委书记</td>
                  <td>是/√/Y</td>
                </tr>
                <tr>
                  <td>工会主席</td>
                  <td>是否担任工会主席</td>
                  <td>是/√/Y</td>
                </tr>
                <tr>
                  <td>党委委员</td>
                  <td>是否担任党委委员</td>
                  <td>是/√/Y</td>
                </tr>
                <tr>
                  <td>支部书记</td>
                  <td>是否担任支部书记</td>
                  <td>是/√/Y</td>
                </tr>
                <tr>
                  <td>支部副书记</td>
                  <td>是否担任支部副书记</td>
                  <td>是/√/Y</td>
                </tr>
                <tr>
                  <td>组织委员</td>
                  <td>是否担任组织委员</td>
                  <td>是/√/Y</td>
                </tr>
                <tr>
                  <td>纪检委员</td>
                  <td>是否担任纪检委员</td>
                  <td>是/√/Y</td>
                </tr>
                <tr>
                  <td>宣传委员</td>
                  <td>是否担任宣传委员</td>
                  <td>是/√/Y</td>
                </tr>
                <tr>
                  <td>青年委员</td>
                  <td>是否担任青年委员</td>
                  <td>是/√/Y</td>
                </tr>
                <tr>
                  <td>生产委员</td>
                  <td>是否担任生产委员</td>
                  <td>是/√/Y</td>
                </tr>
              </tbody>
            </table>
            <p className="template-note">注意：职务列中填写"是"、"√"或"Y"表示担任该职务，留空或填写其他值表示不担任该职务。</p>
          </div>
        )}
      </div>

      {result && (
        <div className={`import-result ${result.success ? 'success' : 'error'}`}>
          <h3>{result.success ? '导入成功' : '导入失败'}</h3>
          <p className="result-message">{result.message}</p>

          {result.success && (
            <div className="stats">
              <div className="stat-item">
                <span className="stat-label">总记录数:</span>
                <span className="stat-value">{result.stats.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">新增记录:</span>
                <span className="stat-value">{result.stats.inserted}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">更新记录:</span>
                <span className="stat-value">{result.stats.updated}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">添加职务:</span>
                <span className="stat-value">{result.stats.positions_added}</span>
              </div>
            </div>
          )}

          {result.stats.errors.length > 0 && (
            <div className="errors">
              <h4>导入过程中发生以下问题:</h4>
              <ul>
                {result.stats.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PartyMemberImport;
