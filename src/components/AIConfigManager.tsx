import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Slider,
  message,
  Tabs,
  Spin,
  Alert,
  Typography,
  Space,
  Divider
} from 'antd';
import {
  SettingOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  RobotOutlined
} from '@ant-design/icons';
import axios from '../api';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
}

interface AIConfigManagerProps {
  apiBaseUrl?: string;
}

const AIConfigManager: React.FC<AIConfigManagerProps> = ({
  apiBaseUrl = 'http://localhost:3002' // 确保后端使用3002端口
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | 'unknown'>('unknown');
  const [activeTab, setActiveTab] = useState('config');
  const [isOllama, setIsOllama] = useState(false);

  // 监听表单值变化
  const handleProviderChange = (value: string) => {
    setIsOllama(value === 'ollama');
    if (value === 'ollama') {
      form.setFieldsValue({
        apiKey: '',
        baseUrl: 'http://localhost:11434/api'
      });
    }
  };

  // 加载配置
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiBaseUrl}/api/ai/config`);
        if (response.data.success) {
          const config = response.data.config;
          form.setFieldsValue({
            provider: config.provider,
            apiKey: config.apiKey === '********' ? '' : config.apiKey,
            model: config.model,
            baseUrl: config.baseUrl,
            temperature: config.temperature,
            maxTokens: config.maxTokens
          });

          // 设置是否为Ollama
          setIsOllama(config.provider === 'ollama');
        }
      } catch (error) {
        console.error('获取AI配置失败:', error);
        message.error('获取AI配置失败');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [apiBaseUrl, form]);

  // 保存配置
  const handleSaveConfig = async (values: AIConfig) => {
    setLoading(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/api/ai/config`, values);
      if (response.data.success) {
        message.success('AI配置已保存');
        setConnectionStatus('unknown');
      } else {
        message.error(`保存失败: ${response.data.message}`);
      }
    } catch (error) {
      console.error('保存AI配置失败:', error);
      message.error('保存AI配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 测试连接
  const handleTestConnection = async () => {
    setTestLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/api/ai/test-connection`);
      if (response.data.success) {
        setConnectionStatus('success');
        message.success('AI连接成功');
      } else {
        setConnectionStatus('error');
        message.error(`连接失败: ${response.data.message}`);
      }
    } catch (error) {
      console.error('测试AI连接失败:', error);
      setConnectionStatus('error');
      message.error('测试AI连接失败');
    } finally {
      setTestLoading(false);
    }
  };

  // 渲染连接状态
  const renderConnectionStatus = () => {
    if (connectionStatus === 'success') {
      return (
        <Alert
          message="连接成功"
          description="AI服务连接正常，可以正常使用AI功能。"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      );
    } else if (connectionStatus === 'error') {
      return (
        <Alert
          message="连接失败"
          description="无法连接到AI服务，请检查配置是否正确。"
          type="error"
          showIcon
          icon={<CloseCircleOutlined />}
        />
      );
    }
    return null;
  };

  return (
    <Card title="AI服务配置" className="ai-config-manager">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <SettingOutlined />
              配置
            </span>
          }
          key="config"
        >
          <Spin spinning={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveConfig}
              initialValues={{
                provider: 'openai',
                model: 'gpt-3.5-turbo',
                baseUrl: 'https://api.openai.com/v1',
                temperature: 0.7,
                maxTokens: 2000
              }}
            >
              <Form.Item
                name="provider"
                label="AI提供商"
                rules={[{ required: true, message: '请选择AI提供商' }]}
              >
                <Select onChange={handleProviderChange}>
                  <Option value="openai">OpenAI</Option>
                  <Option value="dify">Dify</Option>
                  <Option value="ollama">Ollama</Option>
                  <Option value="local">本地模型</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="apiKey"
                label="API密钥"
                rules={[{
                  required: !isOllama,
                  message: '请输入API密钥'
                }]}
              >
                <Input.Password
                  placeholder="输入API密钥"
                  disabled={isOllama}
                />
              </Form.Item>

              <Form.Item
                name="model"
                label="模型"
                rules={[{ required: true, message: '请选择模型' }]}
              >
                <Select>
                  <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
                  <Option value="gpt-4">GPT-4</Option>
                  <Option value="gpt-4-turbo">GPT-4 Turbo</Option>
                  <Option value="deepseek-r1:14b">Deepseek-R1:14b</Option>
                  <Option value="llama2">Llama 2</Option>
                  <Option value="llama3">Llama 3</Option>
                  <Option value="qwen:14b">Qwen:14b</Option>
                  <Option value="claude-3-opus">Claude 3 Opus</Option>
                  <Option value="claude-3-sonnet">Claude 3 Sonnet</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="baseUrl"
                label="API基础URL"
                rules={[{
                  required: !isOllama,
                  message: '请输入API基础URL'
                }]}
              >
                <Input
                  placeholder={isOllama ?
                    "Ollama使用默认地址http://localhost:11434/api" : "输入API基础URL"}
                  disabled={isOllama}
                />
              </Form.Item>

              <Form.Item name="temperature" label="温度 (0-1)">
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  marks={{
                    0: '精确',
                    0.5: '平衡',
                    1: '创造性'
                  }}
                />
              </Form.Item>

              <Form.Item name="maxTokens" label="最大令牌数">
                <Slider
                  min={100}
                  max={4000}
                  step={100}
                  marks={{
                    100: '100',
                    2000: '2000',
                    4000: '4000'
                  }}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    保存配置
                  </Button>
                  <Button
                    icon={<ApiOutlined />}
                    onClick={handleTestConnection}
                    loading={testLoading}
                  >
                    测试连接
                  </Button>
                </Space>
              </Form.Item>

              {renderConnectionStatus()}
            </Form>
          </Spin>
        </TabPane>

        <TabPane
          tab={
            <span>
              <InfoCircleOutlined />
              使用说明
            </span>
          }
          key="guide"
        >
          <Typography>
            <Title level={4}>AI服务配置说明</Title>
            <Paragraph>
              本系统支持多种AI服务提供商，您可以根据需要选择合适的提供商并配置相关参数。
            </Paragraph>

            <Divider />

            <Title level={5}>OpenAI</Title>
            <Paragraph>
              <ul>
                <li>API密钥：在OpenAI官网获取的API密钥</li>
                <li>模型：支持GPT-3.5和GPT-4系列模型</li>
                <li>API基础URL：默认为https://api.openai.com/v1</li>
              </ul>
            </Paragraph>

            <Title level={5}>Ollama</Title>
            <Paragraph>
              <ul>
                <li>API密钥：可留空，Ollama通常不需要API密钥</li>
                <li>模型：选择已在Ollama中安装的模型，如deepseek-r1:14b</li>
                <li>API基础URL：Ollama API的URL，默认为http://localhost:11434/api</li>
              </ul>
            </Paragraph>

            <Title level={5}>Dify</Title>
            <Paragraph>
              <ul>
                <li>API密钥：在Dify平台获取的API密钥</li>
                <li>API基础URL：本地部署的Dify实例URL，如http://localhost/api/v1</li>
              </ul>
            </Paragraph>

            <Title level={5}>本地模型</Title>
            <Paragraph>
              <ul>
                <li>API密钥：本地模型服务的访问密钥（如有）</li>
                <li>API基础URL：本地模型服务的URL，如http://localhost:8000</li>
                <li>模型：本地部署的模型名称</li>
              </ul>
            </Paragraph>

            <Divider />

            <Title level={5}>参数说明</Title>
            <Paragraph>
              <ul>
                <li><Text strong>温度：</Text>控制生成文本的随机性，值越低生成的文本越确定性，值越高生成的文本越多样化</li>
                <li><Text strong>最大令牌数：</Text>生成文本的最大长度限制</li>
              </ul>
            </Paragraph>
          </Typography>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default AIConfigManager;
