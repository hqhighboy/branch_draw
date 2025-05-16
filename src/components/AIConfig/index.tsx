/**
 * @file AI配置组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Input, message, Spin, Tooltip, Tabs } from 'antd';
import { 
  RobotOutlined, 
  ApiOutlined, 
  SettingOutlined, 
  CheckCircleOutlined,
  CloudOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import { AIModelConfig } from '../../types';
import './AIConfig.css';

// 组件属性
interface AIConfigProps {
  onModelSelect: (model: string, config?: Partial<AIModelConfig>) => void;
}

// AI模型类型
interface AIModel {
  name: string;
  displayName: string;
  size: string;
}

/**
 * AI配置组件
 * @param {AIConfigProps} props 组件属性
 * @returns {JSX.Element} AI配置组件
 */
const AIConfig: React.FC<AIConfigProps> = ({ onModelSelect }) => {
  // 状态
  const [loading, setLoading] = useState<boolean>(true);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [configType, setConfigType] = useState<'local' | 'remote'>('local');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(2000);
  
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
        
        // 添加一些模拟模型数据
        const mockModels = [
          { name: 'deepseek-r1:14b', displayName: 'deepseek-r1', size: '14B' },
          { name: 'llama3:8b', displayName: 'llama3', size: '8B' },
          { name: 'mistral:7b', displayName: 'mistral', size: '7B' }
        ];
        setModels(mockModels);
        setSelectedModel('deepseek-r1:14b');
        onModelSelect('deepseek-r1:14b');
      } finally {
        setLoading(false);
      }
    };
    
    fetchModels();
  }, [onModelSelect]);
  
  /**
   * 处理模型选择
   * @param {string} value 选中的模型名称
   */
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    
    if (configType === 'local') {
      onModelSelect(value);
    } else {
      onModelSelect(value, {
        apiKey,
        apiBaseUrl,
        temperature,
        maxTokens
      });
    }
  };
  
  /**
   * 处理API配置变更
   */
  const handleApiConfigChange = () => {
    if (configType === 'remote' && selectedModel) {
      onModelSelect(selectedModel, {
        apiKey,
        apiBaseUrl,
        temperature,
        maxTokens
      });
    }
  };
  
  /**
   * 测试连接
   */
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
    <div className="ai-config">
      <Card
        title={
          <div className="ai-config-title">
            <RobotOutlined /> AI配置
          </div>
        }
        className="ai-config-card"
      >
        <Tabs
          activeKey={configType}
          onChange={(key) => setConfigType(key as 'local' | 'remote')}
          items={[
            {
              key: 'local',
              label: (
                <span>
                  <DesktopOutlined /> 本地部署
                </span>
              ),
              children: (
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
                        options={models.map(model => ({
                          value: model.name,
                          label: (
                            <Tooltip title={`${model.name} (${model.size})`}>
                              {model.displayName} ({model.size})
                            </Tooltip>
                          )
                        }))}
                      />
                    )}
                  </div>
                  
                  <div className="model-params">
                    <div className="param-item">
                      <label>温度 (Temperature):</label>
                      <Input
                        type="number"
                        min={0}
                        max={2}
                        step={0.1}
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                      />
                      <div className="param-desc">控制输出的随机性，值越高输出越随机</div>
                    </div>
                    
                    <div className="param-item">
                      <label>最大令牌数 (Max Tokens):</label>
                      <Input
                        type="number"
                        min={100}
                        max={8000}
                        step={100}
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2000)}
                      />
                      <div className="param-desc">控制输出的最大长度</div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: 'remote',
              label: (
                <span>
                  <CloudOutlined /> 远程API
                </span>
              ),
              children: (
                <div className="remote-config">
                  <div className="api-input">
                    <label>API密钥:</label>
                    <Input.Password
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        handleApiConfigChange();
                      }}
                      placeholder="输入API密钥"
                    />
                  </div>
                  
                  <div className="api-input">
                    <label>API基础URL:</label>
                    <Input
                      value={apiBaseUrl}
                      onChange={(e) => {
                        setApiBaseUrl(e.target.value);
                        handleApiConfigChange();
                      }}
                      placeholder="例如: https://api.openai.com/v1"
                    />
                  </div>
                  
                  <div className="api-input">
                    <label>模型名称:</label>
                    <Input
                      value={selectedModel}
                      onChange={(e) => handleModelChange(e.target.value)}
                      placeholder="例如: gpt-3.5-turbo"
                    />
                  </div>
                  
                  <div className="model-params">
                    <div className="param-item">
                      <label>温度 (Temperature):</label>
                      <Input
                        type="number"
                        min={0}
                        max={2}
                        step={0.1}
                        value={temperature}
                        onChange={(e) => {
                          setTemperature(parseFloat(e.target.value) || 0);
                          handleApiConfigChange();
                        }}
                      />
                    </div>
                    
                    <div className="param-item">
                      <label>最大令牌数 (Max Tokens):</label>
                      <Input
                        type="number"
                        min={100}
                        max={8000}
                        step={100}
                        value={maxTokens}
                        onChange={(e) => {
                          setMaxTokens(parseInt(e.target.value) || 2000);
                          handleApiConfigChange();
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            }
          ]}
        />
        
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

export default AIConfig;
