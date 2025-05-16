/**
 * @file 年度重点工作组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { useState, useEffect } from 'react';
import { Progress, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useBranch } from '../../context/BranchContext';
import { AnnualWork as AnnualWorkType, WorkStatus, WorkStatusLabels, WorkPriority, WorkPriorityLabels, Branch } from '../../types';
import api from '../../services/api';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import './AnnualWork.css';

// 组件属性
export interface AnnualWorkProps {
  branch?: Branch | null;
}

/**
 * 年度重点工作组件
 * @param {AnnualWorkProps} props 组件属性
 * @returns {JSX.Element} 年度重点工作组件
 */
const AnnualWork: React.FC<AnnualWorkProps> = ({ branch }) => {
  // 获取支部上下文
  const { selectedBranch, selectedBranchId, loading: branchLoading, error: branchError } = useBranch();

  // 使用传入的 branch 或者上下文中的 selectedBranch
  const branchData = branch || selectedBranch;
  const branchId = branch?.id || selectedBranchId;

  // 状态
  const [annualWorkData, setAnnualWorkData] = useState<AnnualWorkType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 获取年度重点工作数据
  useEffect(() => {
    const fetchAnnualWorkData = async () => {
      if (!branchId) return;

      try {
        setLoading(true);
        setError(null);

        const currentYear = new Date().getFullYear();
        const data = await api.work.getAnnualWork(branchId, currentYear);

        // 转换API返回的数据格式以匹配组件需要的格式
        const convertedData = data.map(item => ({
          ...item,
          status: item.status === 'not_started' ? WorkStatus.NotStarted :
                 item.status === 'in_progress' ? WorkStatus.InProgress :
                 WorkStatus.Completed,
          priority: item.priority === 'low' ? WorkPriority.Low :
                   item.priority === 'medium' ? WorkPriority.Medium :
                   WorkPriority.High
        }));

        setAnnualWorkData(convertedData);
      } catch (err) {
        console.error('获取年度重点工作数据失败:', err);
        setError('获取年度重点工作数据失败，请稍后重试');
        // 生成模拟数据
        setAnnualWorkData(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchAnnualWorkData();
  }, [branchId]);

  /**
   * 生成模拟数据
   * @returns {AnnualWorkType[]} 模拟的年度重点工作数据
   */
  const generateMockData = (): AnnualWorkType[] => {
    if (!branchId) return [];

    const currentYear = new Date().getFullYear();
    const titles = [
      '加强党员教育培训',
      '开展"两学一做"学习教育',
      '推进党建工作信息化',
      '加强基层组织建设',
      '开展党风廉政建设',
      '推进党建工作创新',
      '加强党员发展工作',
      '开展主题党日活动'
    ];

    return Array.from({ length: 5 }, (_, i) => ({
      id: `mock-${i}`,
      branchId: branchId,
      title: titles[i % titles.length],
      description: `这是关于${titles[i % titles.length]}的详细描述，包括工作目标、内容和要求等。`,
      startDate: `${currentYear}-0${i + 1}-01`,
      endDate: `${currentYear}-${i + 7}-30`,
      status: Object.values(WorkStatus)[i % 3],
      completion: i === 0 ? 100 : i === 1 ? 75 : i === 2 ? 50 : i === 3 ? 25 : 0,
      priority: Object.values(WorkPriority)[i % 3]
    }));
  };

  // 表格列定义
  const columns: ColumnsType<AnnualWorkType> = [
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
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: '10%',
      render: (priority: WorkPriority) => {
        const className = `priority-${priority}`;
        return <span className={`priority-tag ${className}`}>{WorkPriorityLabels[priority]}</span>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status: WorkStatus) => {
        const className = `status-${status}`;
        return <span className={`status-tag ${className}`}>{WorkStatusLabels[status]}</span>;
      },
    },
    {
      title: '进度',
      dataIndex: 'completion',
      key: 'completion',
      width: '30%',
      render: (completion) => (
        <Progress
          percent={completion}
          size="small"
          status={completion === 100 ? 'success' : 'active'}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
      ),
    },
  ];

  // 加载中
  if ((branchLoading || loading) && !branch) {
    return <Loading />;
  }

  // 错误
  if ((branchError || error) && !branch) {
    return <ErrorMessage message={branchError || error || '加载数据失败'} />;
  }

  // 无数据
  if (!branchData) {
    return <EmptyState description="暂无支部数据" />;
  }

  // 无年度工作数据
  if (annualWorkData.length === 0) {
    return <EmptyState description="暂无年度重点工作数据" />;
  }

  return (
    <div className="annual-work">
      <Table
        columns={columns}
        dataSource={annualWorkData}
        rowKey="id"
        pagination={false}
        size="small"
        className="annual-work-table"
      />
    </div>
  );
};

export default AnnualWork;
