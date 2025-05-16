import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Tag, Progress, Button, DatePicker, Space, Row, Col, Spin, Alert } from 'antd';
import { PlusOutlined, FilterOutlined, ExportOutlined } from '@ant-design/icons';
import './WorkManagementPage.css';
import locale from 'antd/es/date-picker/locale/zh_CN';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 工作状态枚举
enum WorkStatus {
  NotStarted = '未开始',
  InProgress = '进行中',
  Completed = '已完成',
  Delayed = '已延期'
}

// 工作优先级枚举
enum WorkPriority {
  Low = '低',
  Medium = '中',
  High = '高'
}

// 模拟年度工作数据
const mockAnnualWorkData = Array.from({ length: 10 }, (_, i) => ({
  id: `aw-${i + 1}`,
  task: `年度重点工作${i + 1}`,
  description: `这是年度重点工作${i + 1}的详细描述，包含工作内容和目标。`,
  startTime: `2023-${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}-01`,
  endTime: `2023-${String(Math.floor(Math.random() * 6) + 7).padStart(2, '0')}-30`,
  status: i % 4 === 0 ? WorkStatus.NotStarted : i % 4 === 1 ? WorkStatus.InProgress : i % 4 === 2 ? WorkStatus.Completed : WorkStatus.Delayed,
  progress: i % 4 === 0 ? 0 : i % 4 === 1 ? Math.floor(Math.random() * 60) + 20 : i % 4 === 2 ? 100 : Math.floor(Math.random() * 40) + 60,
  priority: i % 3 === 0 ? WorkPriority.Low : i % 3 === 1 ? WorkPriority.Medium : WorkPriority.High,
  responsible: `负责人${i % 5 + 1}`,
}));

// 模拟月度工作数据
const mockMonthlyWorkData = Array.from({ length: 15 }, (_, i) => ({
  id: `mw-${i + 1}`,
  task: `月度工作任务${i + 1}`,
  description: `这是月度工作任务${i + 1}的详细描述。`,
  startTime: `2023-07-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}`,
  endTime: `2023-07-${String(Math.floor(Math.random() * 15) + 16).padStart(2, '0')}`,
  status: i % 4 === 0 ? WorkStatus.NotStarted : i % 4 === 1 ? WorkStatus.InProgress : i % 4 === 2 ? WorkStatus.Completed : WorkStatus.Delayed,
  progress: i % 4 === 0 ? 0 : i % 4 === 1 ? Math.floor(Math.random() * 60) + 20 : i % 4 === 2 ? 100 : Math.floor(Math.random() * 40) + 60,
  priority: i % 3 === 0 ? WorkPriority.Low : i % 3 === 1 ? WorkPriority.Medium : WorkPriority.High,
  responsible: `负责人${i % 5 + 1}`,
  branch: `支部${i % 11 + 1}`,
}));

const WorkManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('annual');
  const [annualWorkData, setAnnualWorkData] = useState<any[]>([]);
  const [monthlyWorkData, setMonthlyWorkData] = useState<any[]>([]);

  useEffect(() => {
    // 模拟API请求
    const fetchData = async () => {
      try {
        // 实际项目中这里应该是API请求
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnnualWorkData(mockAnnualWorkData);
        setMonthlyWorkData(mockMonthlyWorkData);
      } catch (error) {
        console.error('获取工作数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 年度工作表格列定义
  const annualWorkColumns = [
    {
      title: '任务名称',
      dataIndex: 'task',
      key: 'task',
      width: 200,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: WorkStatus) => {
        const colorMap: Record<WorkStatus, string> = {
          [WorkStatus.NotStarted]: 'default',
          [WorkStatus.InProgress]: 'processing',
          [WorkStatus.Completed]: 'success',
          [WorkStatus.Delayed]: 'error',
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number) => (
        <Progress percent={progress} size="small" status={progress === 100 ? 'success' : 'active'} />
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: WorkPriority) => {
        const colorMap: Record<WorkPriority, string> = {
          [WorkPriority.Low]: 'green',
          [WorkPriority.Medium]: 'orange',
          [WorkPriority.High]: 'red',
        };
        return <Tag color={colorMap[priority]}>{priority}</Tag>;
      },
    },
    {
      title: '负责人',
      dataIndex: 'responsible',
      key: 'responsible',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small">编辑</Button>
        </Space>
      ),
    },
  ];

  // 月度工作表格列定义
  const monthlyWorkColumns = [
    ...annualWorkColumns.slice(0, -1),
    {
      title: '所属支部',
      dataIndex: 'branch',
      key: 'branch',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small">编辑</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="work-management-page">
      <h2 className="page-title">工作管理</h2>

      <Card className="work-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="年度重点工作" key="annual">
            <Row gutter={[16, 16]} className="toolbar">
              <Col xs={24} sm={12} md={8} lg={6}>
                <RangePicker locale={locale} style={{ width: '100%' }} />
              </Col>
              <Col xs={24} sm={12} md={16} lg={18} className="action-buttons">
                <Space>
                  <Button type="primary" icon={<PlusOutlined />}>添加工作</Button>
                  <Button icon={<FilterOutlined />}>筛选</Button>
                  <Button icon={<ExportOutlined />}>导出</Button>
                </Space>
              </Col>
            </Row>

            {loading ? (
              <div className="loading-container">
                <Spin size="large" tip="加载数据中..." />
              </div>
            ) : (
              <>
                {annualWorkData.length === 0 ? (
                  <Alert
                    message="暂无数据"
                    description="当前没有年度工作数据，请添加或导入数据。"
                    type="info"
                    showIcon
                  />
                ) : (
                  <Table
                    columns={annualWorkColumns}
                    dataSource={annualWorkData}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: total => `共 ${total} 条记录`,
                    }}
                    scroll={{ x: 1100 }}
                  />
                )}
              </>
            )}
          </TabPane>

          <TabPane tab="月度工作" key="monthly">
            <Row gutter={[16, 16]} className="toolbar">
              <Col xs={24} sm={12} md={8} lg={6}>
                <RangePicker locale={locale} style={{ width: '100%' }} />
              </Col>
              <Col xs={24} sm={12} md={16} lg={18} className="action-buttons">
                <Space>
                  <Button type="primary" icon={<PlusOutlined />}>添加工作</Button>
                  <Button icon={<FilterOutlined />}>筛选</Button>
                  <Button icon={<ExportOutlined />}>导出</Button>
                </Space>
              </Col>
            </Row>

            {loading ? (
              <div className="loading-container">
                <Spin size="large" tip="加载数据中..." />
              </div>
            ) : (
              <>
                {monthlyWorkData.length === 0 ? (
                  <Alert
                    message="暂无数据"
                    description="当前没有月度工作数据，请添加或导入数据。"
                    type="info"
                    showIcon
                  />
                ) : (
                  <Table
                    columns={monthlyWorkColumns}
                    dataSource={monthlyWorkData}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: total => `共 ${total} 条记录`,
                    }}
                    scroll={{ x: 1200 }}
                  />
                )}
              </>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default WorkManagementPage;
