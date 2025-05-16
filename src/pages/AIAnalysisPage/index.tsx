import React, { useState } from 'react';
import { Card, Tabs, Input, Button, Space, Row, Col, Typography, Spin, List, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, HistoryOutlined, SettingOutlined } from '@ant-design/icons';
import './AIAnalysisPage.css';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

// 模拟AI分析历史记录
const mockHistoryData = [
  {
    id: 'h1',
    question: '分析支部1的党建工作情况',
    timestamp: '2023-07-15 14:30',
    summary: '支部1党建工作整体良好，但在人才培养方面有待加强...'
  },
  {
    id: 'h2',
    question: '比较支部2和支部3的工作完成情况',
    timestamp: '2023-07-14 10:15',
    summary: '支部2在任务跟进方面表现优秀，支部3在创新能力方面领先...'
  },
  {
    id: 'h3',
    question: '预测下半年各支部的工作趋势',
    timestamp: '2023-07-10 16:45',
    summary: '根据历史数据分析，预计下半年各支部工作重点将转向...'
  }
];

// 模拟AI回复
const mockAIResponse = `
## 支部1党建工作分析报告

根据系统中的历史数据，支部1的党建工作情况如下：

### 优势领域
1. **组织建设**: 支部会议规范性达到95分，组织架构完整性达到92分
2. **思想建设**: 理论学习覆盖率达到90%，学习效果评估良好
3. **制度建设**: 各项制度执行合规性达到88分

### 需改进领域
1. **人才培养**: 青年党员培养比例仅为65%，低于平均水平
2. **创新工作**: 创新项目数量较少，仅有2个，低于平均水平

### 建议措施
1. 加强青年党员的培养和发展工作
2. 鼓励党员参与创新项目，提高创新能力
3. 建立更完善的人才培养机制

### 趋势预测
如果保持当前发展态势，预计年底前组织建设评分可达到96分，但人才培养仍是短板。

`;

const AIAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string, timestamp: string}[]>([]);

  // 处理发送消息
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // 添加用户消息到历史记录
    const userMessage = {
      role: 'user' as const,
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatHistory([...chatHistory, userMessage]);
    setInputValue('');
    setLoading(true);
    
    // 模拟AI响应
    setTimeout(() => {
      const aiMessage = {
        role: 'ai' as const,
        content: mockAIResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="ai-analysis-page">
      <h2 className="page-title">AI分析</h2>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={18}>
          <Card className="main-card">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="AI对话" key="chat">
                <div className="chat-container">
                  <div className="chat-messages">
                    {chatHistory.length === 0 ? (
                      <div className="empty-chat">
                        <RobotOutlined className="robot-icon" />
                        <Title level={4}>AI助手</Title>
                        <Paragraph>
                          您可以向AI助手询问关于党支部数据的任何问题，例如：
                        </Paragraph>
                        <ul className="example-questions">
                          <li>分析支部1的党建工作情况</li>
                          <li>比较支部2和支部3的工作完成情况</li>
                          <li>预测下半年各支部的工作趋势</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="message-list">
                        {chatHistory.map((msg, index) => (
                          <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
                            <div className="message-avatar">
                              {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                            </div>
                            <div className="message-content">
                              <div className="message-header">
                                <span className="message-sender">{msg.role === 'user' ? '您' : 'AI助手'}</span>
                                <span className="message-time">{msg.timestamp}</span>
                              </div>
                              <div className="message-text">
                                {msg.role === 'ai' ? (
                                  <div className="markdown-content">
                                    {msg.content.split('\n').map((line, i) => (
                                      <div key={i}>{line}</div>
                                    ))}
                                  </div>
                                ) : (
                                  msg.content
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="chat-input">
                    <TextArea
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="输入您的问题..."
                      autoSize={{ minRows: 2, maxRows: 6 }}
                      onPressEnter={e => {
                        if (!e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      loading={loading}
                    >
                      发送
                    </Button>
                  </div>
                </div>
              </TabPane>
              
              <TabPane tab="数据分析" key="analysis">
                <div className="analysis-container">
                  <Paragraph>
                    选择分析类型和数据范围，生成专业的数据分析报告。
                  </Paragraph>
                  
                  <div className="analysis-content">
                    <Text>此功能正在开发中...</Text>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
        
        <Col xs={24} md={6}>
          <Card className="sidebar-card" title="历史记录">
            <List
              itemLayout="horizontal"
              dataSource={mockHistoryData}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<HistoryOutlined />} />}
                    title={<a href="#!">{item.question}</a>}
                    description={
                      <>
                        <div>{item.timestamp}</div>
                        <div className="history-summary">{item.summary}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
          
          <Card className="sidebar-card settings-card" title="AI设置" style={{ marginTop: '16px' }}>
            <List>
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<SettingOutlined />} />}
                  title="AI模型"
                  description="当前使用: deepseek-R1:14b"
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<SettingOutlined />} />}
                  title="数据源"
                  description="党支部综合数据库"
                />
              </List.Item>
            </List>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AIAnalysisPage;
