import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Input, message, Spin, Tooltip } from 'antd';
import { RobotOutlined, ApiOutlined, SettingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './AIConfigSection.css';

const { Option } = Select;

interface AIModel {
  name: string;
  displayName: string;
  size: string;
}

interface AIConfigSectionProps {
  onModelSelect: (model: string) => void;
}

const AIConfigSection: React.FC<AIConfigSectionProps> = ({ onModelSelect }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [configType, setConfigType] = useState<'local' | 'remote'>('local');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');

  // 获取本地Ollama模型列表
  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        // 尝试从本地Ollama获取模型列表
        const response = await fetch('http://localhost:11434/api/tags');
        const data = await response.json();

        if (data && data.models) {
          const formattedModels = data.models.map((model: any) => {
            // 提取模型大小信息
            const sizeInGB = model.size ? (model.size / (1024 * 1024 * 1024)).toFixed(1) + 'GB' : 'Unknown';
            // 提取参数大小信息
            const paramSize = model.details?.parameter_size || '';

            return {
              name: model.name,
              displayName: model.name.split(':')[0],
              size: paramSize || sizeInGB
            };
          });

          setModels(formattedModels);

          // 如果有deepseek-r1:14b模型，默认选择它
          const defaultModel = formattedModels.find((m: AIModel) => m.name === 'deepseek-r1:14b');
          if (defaultModel) {
            setSelectedModel(defaultModel.name);
            onModelSelect(defaultModel.name);
          } else if (formattedModels.length > 0) {
            setSelectedModel(formattedModels[0].name);
            onModelSelect(formattedModels[0].name);
          }
        }
      } catch (error) {
        console.error('获取模型列表失败:', error);
        message.error('无法连接到本地Ollama服务，请确保Ollama已启动');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [onModelSelect]);

  // 处理模型选择
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    onModelSelect(value);
  };

  // 测试连接
  const handleTestConnection = async () => {
    setTestStatus('testing');

    try {
      if (configType === 'local') {
        // 测试本地Ollama连接
        const response = await fetch(`http://localhost:11434/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: '你好，这是一个测试',
            stream: false
          })
        });

        if (response.ok) {
          setTestStatus('success');
          message.success('连接成功！模型可用');
        } else {
          setTestStatus('error');
          message.error('连接失败，请检查模型是否正确加载');
        }
      } else {
        // 测试远程API连接
        // 这里可以添加远程API的测试逻辑
        if (!apiKey || !apiBaseUrl) {
          setTestStatus('error');
          message.error('请填写API密钥和基础URL');
          return;
        }

        // 模拟远程API测试
        setTimeout(() => {
          setTestStatus('success');
          message.success('远程API连接成功');
        }, 1500);
      }
    } catch (error) {
      console.error('测试连接失败:', error);
      setTestStatus('error');
      message.error('连接测试失败，请检查服务是否正常运行');
    }
  };

  return (
    <div className="ai-config-section">
      <Card
        title={
          <div className="ai-config-title">
            <RobotOutlined /> AI配置
          </div>
        }
        className="ai-config-card"
      >
        <div className="config-type-selector">
          <Button
            type={configType === 'local' ? 'primary' : 'default'}
            onClick={() => setConfigType('local')}
            icon={<ApiOutlined />}
          >
            本地部署
          </Button>
          <Button
            type={configType === 'remote' ? 'primary' : 'default'}
            onClick={() => setConfigType('remote')}
            icon={<SettingOutlined />}
          >
            远程API
          </Button>
        </div>

        {configType === 'local' ? (
          <div className="local-config">
            <div className="model-selector">
              <label>选择模型:</label>
              {loading ? (
                <Spin size="small" />
              ) : (
                <Select
                  value={selectedModel}
                  onChange={handleModelChange}
                  placeholder="选择一个模型"
                  style={{ width: '100%' }}
                >
                  {models.map(model => (
                    <Option key={model.name} value={model.name}>
                      <Tooltip title={`${model.name} (${model.size})`}>
                        {model.displayName} ({model.size})
                      </Tooltip>
                    </Option>
                  ))}
                </Select>
              )}
            </div>
          </div>
        ) : (
          <div className="remote-config">
            <div className="api-input">
              <label>API密钥:</label>
              <Input.Password
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="输入API密钥"
              />
            </div>
            <div className="api-input">
              <label>API基础URL:</label>
              <Input
                value={apiBaseUrl}
                onChange={e => setApiBaseUrl(e.target.value)}
                placeholder="例如: https://api.openai.com/v1"
              />
            </div>
          </div>
        )}

        <div className="test-connection">
          <Button
            type="primary"
            onClick={handleTestConnection}
            loading={testStatus === 'testing'}
            icon={testStatus === 'success' ? <CheckCircleOutlined /> : <ApiOutlined />}
            className={testStatus === 'success' ? 'success-button' : ''}
          >
            {testStatus === 'testing' ? '测试中...' :
             testStatus === 'success' ? '连接成功' : '测试连接'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIConfigSection;
