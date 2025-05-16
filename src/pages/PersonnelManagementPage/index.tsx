import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, Space, Row, Col, Spin, Alert } from 'antd';
import { SearchOutlined, UserAddOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import './PersonnelManagementPage.css';

// 模拟人员数据
const mockPersonnelData = Array.from({ length: 20 }, (_, i) => ({
  id: `p-${i + 1}`,
  name: `党员${i + 1}`,
  gender: i % 2 === 0 ? '男' : '女',
  age: Math.floor(Math.random() * 30) + 25,
  joinDate: `${2000 + Math.floor(Math.random() * 22)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  position: i % 5 === 0 ? '支部书记' : i % 5 === 1 ? '组织委员' : i % 5 === 2 ? '宣传委员' : i % 5 === 3 ? '纪检委员' : '普通党员',
  department: `部门${Math.floor(i / 4) + 1}`,
  status: i % 10 === 0 ? '预备党员' : '正式党员',
}));

const PersonnelManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [personnelData, setPersonnelData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // 模拟API请求
    const fetchData = async () => {
      try {
        // 实际项目中这里应该是API请求
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPersonnelData(mockPersonnelData);
      } catch (error) {
        console.error('获取人员数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      filters: [
        { text: '男', value: '男' },
        { text: '女', value: '女' },
      ],
      onFilter: (value: any, record: any) => record.gender === value,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      sorter: (a: any, b: any) => a.age - b.age,
    },
    {
      title: '入党日期',
      dataIndex: 'joinDate',
      key: 'joinDate',
      sorter: (a: any, b: any) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
    },
    {
      title: '职务',
      dataIndex: 'position',
      key: 'position',
      filters: [
        { text: '支部书记', value: '支部书记' },
        { text: '组织委员', value: '组织委员' },
        { text: '宣传委员', value: '宣传委员' },
        { text: '纪检委员', value: '纪检委员' },
        { text: '普通党员', value: '普通党员' },
      ],
      onFilter: (value: any, record: any) => record.position === value,
    },
    {
      title: '所属部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === '预备党员' ? 'orange' : 'green'}>
          {status}
        </Tag>
      ),
      filters: [
        { text: '预备党员', value: '预备党员' },
        { text: '正式党员', value: '正式党员' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small">编辑</Button>
        </Space>
      ),
    },
  ];

  // 过滤数据
  const filteredData = personnelData.filter(item =>
    item.name.includes(searchText) ||
    item.department.includes(searchText) ||
    item.position.includes(searchText)
  );

  return (
    <div className="personnel-management-page">
      <h2 className="page-title">人员管理</h2>

      <Card className="personnel-card">
        <Row gutter={[16, 16]} className="toolbar">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="搜索姓名、部门或职务"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={16} lg={18} className="action-buttons">
            <Space>
              <Button type="primary" icon={<UserAddOutlined />}>添加党员</Button>
              <Button icon={<UploadOutlined />}>导入数据</Button>
              <Button icon={<DownloadOutlined />}>导出数据</Button>
            </Space>
          </Col>
        </Row>

        {loading ? (
          <div className="loading-container">
            <Spin size="large" tip="加载数据中..." />
          </div>
        ) : (
          <>
            {personnelData.length === 0 ? (
              <Alert
                message="暂无数据"
                description="当前没有人员数据，请添加或导入数据。"
                type="info"
                showIcon
              />
            ) : (
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: total => `共 ${total} 条记录`,
                }}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default PersonnelManagementPage;
