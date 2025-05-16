import React, { useState, useEffect } from 'react';
import {
  Button,
  Upload,
  message,
  Card,
  Tabs,
  Table,
  Space,
  Typography,
  Spin,
  Alert,
  Modal,
  Form,
  Input,
  Select
} from 'antd';
import { UploadOutlined, SettingOutlined, HistoryOutlined, ApiOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface DifyWorkflowManagerProps {
  apiBaseUrl?: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  stats?: {
    total?: number;
    inserted?: number;
    updated?: number;
    errors?: string[];
  };
  errors?: string[];
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: string;
  startTime: string;
  endTime: string;
  result: any;
}

interface DifyConfig {
  apiKey: string;
  baseUrl: string;
  workflowId: string;
}

const DifyWorkflowManager: React.FC<DifyWorkflowManagerProps> = ({ apiBaseUrl = 'http://localhost:3002' }) => {
  const [activeTab, setActiveTab] = useState('import');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [config, setConfig] = useState<DifyConfig>({
    apiKey: '',
    baseUrl: 'https://api.dify.ai/v1',
    workflowId: ''
  });
  const [form] = Form.useForm();

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/dify/config`);
        if (response.data.success) {
          setConfig(response.data.config);
          form.setFieldsValue(response.data.config);
        }
      } catch (error) {
        console.error('加载配置失败:', error);
      }
    };

    loadConfig();
  }, [apiBaseUrl, form]);

  // 加载执行历史
  const loadExecutions = async () => {
    if (!config.workflowId) {
      message.warning('请先配置工作流ID');
      return;
    }

    setExecutionsLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/api/dify/executions/${config.workflowId}`);
      if (response.data.success) {
        setExecutions(response.data.executions);
      } else {
        message.error(response.data.message || '加载执行历史失败');
      }
    } catch (error) {
      console.error('加载执行历史失败:', error);
      message.error('加载执行历史失败');
    } finally {
      setExecutionsLoading(false);
    }
  };

  // 当切换到历史记录标签时加载执行历史
  useEffect(() => {
    if (activeTab === 'history') {
      loadExecutions();
    }
  }, [activeTab, config.workflowId]);

  // 上传文件
  const uploadProps: UploadProps = {
    name: 'file',
    action: `${apiBaseUrl}/api/dify/import-excel`,
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'uploading') {
        setLoading(true);
        setImportResult(null);
      }
      if (info.file.status === 'done') {
        setLoading(false);
        const response = info.file.response as ImportResult;
        setImportResult(response);

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
    accept: '.xlsx,.xls',
  };

  // 下载模板
  const downloadTemplate = async () => {
    try {
      window.open(`${apiBaseUrl}/api/dify/template`, '_blank');
    } catch (error) {
      console.error('下载模板失败:', error);
      message.error('下载模板失败');
    }
  };

  // 保存配置
  const saveConfig = async (values: DifyConfig) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/api/dify/config`, values);
      if (response.data.success) {
        setConfig(values);
        message.success('配置保存成功');
        setConfigModalVisible(false);
      } else {
        message.error(response.data.message || '保存配置失败');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存配置失败');
    }
  };

  // 创建工作流
  const createWorkflow = async () => {
    if (!config.apiKey) {
      message.warning('请先配置API密钥');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/api/dify/create-workflow`);
      if (response.data.success) {
        const newConfig = { ...config, workflowId: response.data.workflowId };
        setConfig(newConfig);
        form.setFieldsValue(newConfig);
        message.success('工作流创建成功');
      } else {
        message.error(response.data.message || '创建工作流失败');
      }
    } catch (error) {
      console.error('创建工作流失败:', error);
      message.error('创建工作流失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新工作流
  const updateWorkflow = async () => {
    if (!config.apiKey || !config.workflowId) {
      message.warning('请先配置API密钥和工作流ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${apiBaseUrl}/api/dify/update-workflow/${config.workflowId}`);
      if (response.data.success) {
        message.success('工作流更新成功');
      } else {
        message.error(response.data.message || '更新工作流失败');
      }
    } catch (error) {
      console.error('更新工作流失败:', error);
      message.error('更新工作流失败');
    } finally {
      setLoading(false);
    }
  };

  // 执行历史表格列
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        let color = 'default';
        if (status === 'completed') color = 'success';
        if (status === 'failed') color = 'error';
        if (status === 'running') color = 'processing';
        return <Text type={color as any}>{status}</Text>;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
      render: (time: string) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: React.ReactNode, record: WorkflowExecution) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => {
              Modal.info({
                title: '执行结果',
                content: (
                  <pre style={{ maxHeight: '400px', overflow: 'auto' }}>
                    {JSON.stringify(record.result, null, 2)}
                  </pre>
                ),
                width: 800,
              });
            }}
          >
            查看结果
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={4}>Dify工作流管理</Title>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <UploadOutlined />
                数据导入
              </span>
            }
            key="import"
          >
            <div style={{ marginBottom: '20px' }}>
              <Alert
                message="Excel数据导入"
                description="通过Dify工作流从Excel表格中提取数据并更新到系统中。请上传符合模板格式的Excel文件。"
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
              />
              <Space>
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />} loading={loading}>上传Excel文件</Button>
                </Upload>
                <Button onClick={downloadTemplate}>下载导入模板</Button>
              </Space>
            </div>

            {importResult && (
              <div style={{ marginTop: '20px' }}>
                <Card
                  title="导入结果"
                  type="inner"
                  style={{
                    borderColor: importResult.success ? '#52c41a' : '#ff4d4f',
                    marginBottom: '20px'
                  }}
                >
                  <p><strong>状态:</strong> {importResult.success ? '成功' : '失败'}</p>
                  <p><strong>消息:</strong> {importResult.message}</p>

                  {importResult.success && importResult.stats && (
                    <div>
                      <p><strong>总数:</strong> {importResult.stats.total}</p>
                      <p><strong>插入:</strong> {importResult.stats.inserted}</p>
                      <p><strong>更新:</strong> {importResult.stats.updated}</p>
                    </div>
                  )}

                  {(!importResult.success || (importResult.stats?.errors && importResult.stats.errors.length > 0)) && (
                    <div>
                      <p><strong>错误:</strong></p>
                      <ul>
                        {(importResult.errors || importResult.stats?.errors || []).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </TabPane>

          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                执行历史
              </span>
            }
            key="history"
          >
            <div style={{ marginBottom: '20px' }}>
              <Space>
                <Button onClick={loadExecutions} loading={executionsLoading}>
                  刷新
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={executions}
              rowKey="id"
              loading={executionsLoading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <SettingOutlined />
                配置
              </span>
            }
            key="config"
          >
            <Card title="工作流配置" style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <p><strong>API密钥:</strong> {config.apiKey ? '******' : '未设置'}</p>
                <p><strong>API基础URL:</strong> {config.baseUrl}</p>
                <p><strong>工作流ID:</strong> {config.workflowId || '未设置'}</p>
              </div>

              <Space>
                <Button
                  type="primary"
                  onClick={() => {
                    form.setFieldsValue(config);
                    setConfigModalVisible(true);
                  }}
                >
                  编辑配置
                </Button>
                <Button onClick={createWorkflow} loading={loading} disabled={!config.apiKey}>
                  创建工作流
                </Button>
                <Button
                  onClick={updateWorkflow}
                  loading={loading}
                  disabled={!config.apiKey || !config.workflowId}
                >
                  更新工作流
                </Button>
              </Space>
            </Card>

            <Card title="API测试">
              <div style={{ marginBottom: '20px' }}>
                <p>测试Dify API连接状态</p>
              </div>

              <Button
                type="primary"
                icon={<ApiOutlined />}
                onClick={async () => {
                  try {
                    const response = await axios.get(`${apiBaseUrl}/api/dify/test-connection`);
                    if (response.data.success) {
                      message.success('API连接成功');
                    } else {
                      message.error(response.data.message || 'API连接失败');
                    }
                  } catch (error) {
                    console.error('API连接测试失败:', error);
                    message.error('API连接测试失败');
                  }
                }}
              >
                测试连接
              </Button>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="编辑配置"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfigModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              form.validateFields()
                .then(values => {
                  saveConfig(values);
                })
                .catch(info => {
                  console.log('验证失败:', info);
                });
            }}
          >
            保存
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={config}
        >
          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="请输入Dify API密钥" />
          </Form.Item>

          <Form.Item
            name="baseUrl"
            label="API基础URL"
            rules={[{ required: true, message: '请输入API基础URL' }]}
          >
            <Input placeholder="请输入Dify API基础URL" />
          </Form.Item>

          <Form.Item
            name="workflowId"
            label="工作流ID"
          >
            <Input placeholder="请输入工作流ID（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DifyWorkflowManager;
