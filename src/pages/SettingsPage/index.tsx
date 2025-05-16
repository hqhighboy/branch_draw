import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Switch, Select, Radio, Divider, Row, Col, message } from 'antd';
import { SaveOutlined, UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, BulbOutlined, DatabaseOutlined } from '@ant-design/icons';
import './SettingsPage.css';

const { TabPane } = Tabs;
const { Option } = Select;

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    // 模拟API请求
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('提交的设置:', values);
      message.success('设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <h2 className="page-title">系统设置</h2>
      
      <Card className="settings-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="账户设置" key="account">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                username: '管理员',
                email: 'admin@example.com',
                phone: '13800138000',
                notifications: true,
                language: 'zh_CN'
              }}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="username"
                    label="用户名"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="用户名" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="邮箱" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="phone"
                    label="手机号"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { pattern: /^1\d{10}$/, message: '请输入有效的手机号' }
                    ]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="手机号" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    name="language"
                    label="系统语言"
                  >
                    <Select>
                      <Option value="zh_CN">简体中文</Option>
                      <Option value="en_US">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="notifications"
                label="系统通知"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="安全设置" key="security">
            <Form
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="currentPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="当前密码" />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 8, message: '密码长度不能少于8个字符' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="新密码" />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
              </Form.Item>
              
              <Form.Item
                name="twoFactorAuth"
                label="两步验证"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="显示设置" key="display">
            <Form
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                theme: 'light',
                fontSize: 'medium',
                colorScheme: 'blue'
              }}
            >
              <Form.Item
                name="theme"
                label="主题模式"
              >
                <Radio.Group>
                  <Radio value="light">浅色模式</Radio>
                  <Radio value="dark">深色模式</Radio>
                  <Radio value="system">跟随系统</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                name="fontSize"
                label="字体大小"
              >
                <Radio.Group>
                  <Radio value="small">小</Radio>
                  <Radio value="medium">中</Radio>
                  <Radio value="large">大</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                name="colorScheme"
                label="配色方案"
              >
                <Radio.Group>
                  <Radio value="blue">南网蓝</Radio>
                  <Radio value="green">绿色</Radio>
                  <Radio value="purple">紫色</Radio>
                  <Radio value="orange">橙色</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                name="compactMode"
                label="紧凑模式"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<BulbOutlined />} loading={loading}>
                  应用设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="数据设置" key="data">
            <Form
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                dataSource: 'local',
                autoBackup: true,
                backupFrequency: 'daily'
              }}
            >
              <Form.Item
                name="dataSource"
                label="数据源"
              >
                <Select>
                  <Option value="local">本地数据库</Option>
                  <Option value="remote">远程数据库</Option>
                  <Option value="cloud">云端数据</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="autoBackup"
                label="自动备份"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="backupFrequency"
                label="备份频率"
              >
                <Radio.Group>
                  <Radio value="daily">每日</Radio>
                  <Radio value="weekly">每周</Radio>
                  <Radio value="monthly">每月</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                name="dataRetention"
                label="数据保留期限"
              >
                <Select>
                  <Option value="1month">1个月</Option>
                  <Option value="3months">3个月</Option>
                  <Option value="6months">6个月</Option>
                  <Option value="1year">1年</Option>
                  <Option value="forever">永久</Option>
                </Select>
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<DatabaseOutlined />} loading={loading}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SettingsPage;
