import React, { useState, useEffect } from 'react';
import { Table, Progress, Card, Row, Col, Typography, Tooltip, Tabs } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { createDefaultEvaluationModel, Dimension, Indicator } from '../models/evaluationModel';
import { generateRandomScores } from '../utils/mockDataGenerator';
import './BranchCapabilityDetail.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Branch {
  id: string;
  name: string;
}

interface BranchCapabilityDetailProps {
  branch: Branch | null;
}

/**
 * 支部能力详细分析组件
 */
const BranchCapabilityDetail: React.FC<BranchCapabilityDetailProps> = ({ branch }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // 初始化数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 创建默认评价模型
        const defaultModel = createDefaultEvaluationModel();

        // 生成随机评分
        const scoredModel = generateRandomScores(defaultModel);

        // 更新状态
        setEvaluationData(scoredModel);
      } catch (error) {
        console.error('获取支部能力详细数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (branch) {
      fetchData();
    }
  }, [branch]);

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 获取维度得分颜色类名
  const getDimensionScoreClass = (score: number) => {
    if (score >= 90) return 'score-excellent'; // 优秀 - 绿色
    if (score >= 80) return 'score-good'; // 良好 - 蓝色
    if (score >= 70) return 'score-average'; // 一般 - 黄色
    if (score >= 60) return 'score-pass'; // 及格 - 橙色
    return 'score-fail'; // 不及格 - 红色
  };

  // 获取维度得分等级
  const getDimensionScoreLevel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    if (score >= 60) return '及格';
    return '不及格';
  };

  // 获取进度条类名
  const getProgressClass = (score: number) => {
    if (score >= 90) return 'progress-excellent'; // 优秀 - 绿色
    if (score >= 80) return 'progress-good'; // 良好 - 蓝色
    if (score >= 70) return 'progress-average'; // 一般 - 黄色
    if (score >= 60) return 'progress-pass'; // 及格 - 橙色
    return 'progress-fail'; // 不及格 - 红色
  };

  // 维度表格列定义
  const dimensionColumns = [
    {
      title: '维度',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Dimension) => (
        <Tooltip title={record.description}>
          <span>{text} <InfoCircleOutlined /></span>
        </Tooltip>
      ),
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => `${(weight * 100).toFixed(0)}%`,
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <span className={getDimensionScoreClass(score)}>
          {score.toFixed(1)}
        </span>
      ),
    },
    {
      title: '等级',
      dataIndex: 'score',
      key: 'level',
      render: (score: number) => (
        <span className={getDimensionScoreClass(score)}>
          {getDimensionScoreLevel(score)}
        </span>
      ),
    },
    {
      title: '得分情况',
      dataIndex: 'score',
      key: 'progress',
      render: (score: number) => (
        <Progress
          percent={score}
          className={getProgressClass(score)}
          size="small"
        />
      ),
    },
  ];

  // 指标表格列定义
  const indicatorColumns = [
    {
      title: '指标',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Indicator) => (
        <Tooltip title={record.description}>
          <span>{text} <InfoCircleOutlined /></span>
        </Tooltip>
      ),
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => `${(weight * 100).toFixed(0)}%`,
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <span className={getDimensionScoreClass(score)}>
          {score.toFixed(1)}
        </span>
      ),
    },
    {
      title: '等级',
      dataIndex: 'score',
      key: 'level',
      render: (score: number) => (
        <span className={getDimensionScoreClass(score)}>
          {getDimensionScoreLevel(score)}
        </span>
      ),
    },
    {
      title: '得分情况',
      dataIndex: 'score',
      key: 'progress',
      render: (score: number) => (
        <Progress
          percent={score}
          className={getProgressClass(score)}
          size="small"
        />
      ),
    },
  ];

  if (!branch || !evaluationData) {
    return (
      <div className="branch-capability-detail-empty">
        <Text>请选择一个支部查看详细分析</Text>
      </div>
    );
  }

  return (
    <div className="branch-capability-detail">
      <Tabs activeKey={activeTab} onChange={handleTabChange} type="card" className="capability-detail-tabs">
        <TabPane tab="总体概览" key="overview">
          <div className="tab-content">
            <Card className="overview-card">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={4}>{branch.name} - 综合能力评价</Title>
                </Col>
                <Col span={24}>
                  <div className="total-score-container">
                    <div className="total-score">
                      <span className="score-value">{evaluationData.totalScore?.toFixed(1)}</span>
                      <span className="score-label">总分</span>
                    </div>
                    <div className="score-level">
                      <span className={`level-value ${getDimensionScoreClass(evaluationData.totalScore || 0)}`}>
                        {getDimensionScoreLevel(evaluationData.totalScore || 0)}
                      </span>
                      <span className="level-label">等级</span>
                    </div>
                  </div>
                </Col>
                <Col span={24}>
                  <Table
                    dataSource={evaluationData.dimensions}
                    columns={dimensionColumns}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                  />
                </Col>
              </Row>
            </Card>
          </div>
        </TabPane>
        <TabPane tab="维度详情" key="dimensions">
          <div className="tab-content">
            {evaluationData.dimensions.map((dimension: Dimension) => (
              <Card key={dimension.id} title={dimension.name} className="dimension-card">
                <div className="dimension-header">
                  <div className="dimension-info">
                    <Tooltip title={dimension.description}>
                      <InfoCircleOutlined /> {dimension.description}
                    </Tooltip>
                  </div>
                  <div className="dimension-score">
                    <span className="score-label">得分：</span>
                    <span className={`score-value ${getDimensionScoreClass(dimension.score || 0)}`}>
                      {dimension.score?.toFixed(1)}
                    </span>
                    <span className={`score-level ${getDimensionScoreClass(dimension.score || 0)}`}>
                      ({getDimensionScoreLevel(dimension.score || 0)})
                    </span>
                  </div>
                </div>
                <Table
                  dataSource={dimension.indicators}
                  columns={indicatorColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            ))}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BranchCapabilityDetail;
