import React from 'react';
import { Progress, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './AnnualWork.css';

interface AnnualWorkItem {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
}

interface Branch {
  id?: string;
  name: string;
  annualWork?: AnnualWorkItem[];
}

interface AnnualWorkProps {
  branch?: Branch;
}

/**
 * 年度重点工作组件
 */
const AnnualWork: React.FC<AnnualWorkProps> = ({ branch }) => {
  // 表格列定义
  const columns: ColumnsType<AnnualWorkItem> = [
    {
      title: '工作内容',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
      render: (text, record) => (
        <div>
          <div className="work-title">{text}</div>
          <div className="work-description">{record.description}</div>
        </div>
      ),
    },
    {
      title: '时间范围',
      dataIndex: 'startDate',
      key: 'timeRange',
      width: '20%',
      render: (_, record) => (
        <span>{record.startDate} 至 {record.endDate}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (text) => {
        let className = '';
        switch (text) {
          case '已完成':
            className = 'status-completed';
            break;
          case '进行中':
            className = 'status-in-progress';
            break;
          case '未开始':
            className = 'status-not-started';
            break;
          case '已延期':
            className = 'status-delayed';
            break;
          default:
            className = '';
        }
        return <span className={`status-tag ${className}`}>{text}</span>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: '40%',
      render: (progress) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      ),
    },
  ];

  // 如果没有年度工作数据，显示提示信息
  if (!branch || !branch.annualWork || branch.annualWork.length === 0) {
    return <div className="no-data">暂无年度重点工作数据</div>;
  }

  return (
    <div className="annual-work">
      <Table 
        columns={columns} 
        dataSource={branch.annualWork} 
        rowKey="id"
        pagination={false}
        size="small"
        className="annual-work-table"
      />
    </div>
  );
};

export default AnnualWork;
