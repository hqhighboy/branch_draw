import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Progress, Tag, Tooltip, Radio, Tabs, Button, Table, Statistic, Badge, Space, Divider } from 'antd';
import {
  RadarChartOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  InfoCircleOutlined,
  FullscreenOutlined,
  TableOutlined,
  AppstoreOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import { BranchCapabilityData } from '../interfaces/BranchCapability';
import StaticRadarChart from './StaticRadarChart';
import '../styles/CompactBranchCapabilityView.css';

const { TabPane } = Tabs;

interface CompactBranchCapabilityViewProps {
  data: BranchCapabilityData[];
  onExpandBranch?: (branchId: number) => void;
}

const CompactBranchCapabilityView: React.FC<CompactBranchCapabilityViewProps> = ({
  data,
  onExpandBranch
}) => {
  console.log('CompactBranchCapabilityView data:', data);

  // 默认使用雷达图模式 - 所有Hooks必须在组件顶层调用，不能放在条件语句中
  const [viewMode, setViewMode] = useState<'radar' | 'bar'>('radar');
  const [displayMetric, setDisplayMetric] = useState<'total' | 'base' | 'management'>('total');
  const [layoutMode, setLayoutMode] = useState<'card' | 'table'>('card');

  // 设置默认视图模式
  useEffect(() => {
    // 初始化时设置为雷达图模式
    setViewMode('radar');
  }, []);

  // 检查数据是否有效 - 移到Hooks之后
  if (!data || data.length === 0) {
    return <div className="no-data-message">暂无数据，请检查数据源</div>;
  }

  // 获取得分颜色
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 80) return '#1890ff';
    if (score >= 70) return '#faad14';
    if (score >= 60) return '#fa8c16';
    return '#f5222d';
  };

  // 获取等级颜色
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'green';
      case 'A': return 'blue';
      case 'B+': return 'gold';
      case 'B': return 'orange';
      default: return 'red';
    }
  };

  // 获取趋势图标
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    if (trend === 'down') return <ArrowDownOutlined style={{ color: '#f5222d' }} />;
    return <MinusOutlined style={{ color: '#faad14' }} />;
  };

  // 不再需要Chart.js的雷达图配置，使用自定义SimpleRadarChart组件

  // 获取要显示的得分
  const getDisplayScore = (branch: BranchCapabilityData) => {
    switch (displayMetric) {
      case 'base':
        return {
          score: branch.baseScore,
          suffix: '/ 100',
          grade: branch.baseGrade
        };
      case 'management':
        return {
          score: branch.managementScore,
          suffix: '/ 10',
          grade: null
        };
      default:
        return {
          score: branch.totalScore,
          suffix: '/ 100',
          grade: branch.grade
        };
    }
  };

  // 获取维度得分
  const getDimensionScore = (branch: BranchCapabilityData, dimension: string) => {
    switch (dimension) {
      case 'organizationManagement':
        return branch.baseDimensions.organizationManagement;
      case 'kpiExecution':
        return branch.baseDimensions.kpiExecution;
      case 'talentDevelopment':
        return branch.baseDimensions.talentDevelopment;
      case 'partyBuilding':
        return branch.baseDimensions.partyBuilding;
      case 'taskFollowUp':
        return branch.baseDimensions.taskFollowUp;
      case 'safetyCompliance':
        return branch.baseDimensions.safetyCompliance;
      case 'satisfaction':
        return branch.baseDimensions.satisfaction;
      default:
        return branch.baseDimensions.organizationManagement;
    }
  };

  // 确保雷达图数据正确格式化
  const ensureRadarData = (branch: BranchCapabilityData) => {
    // 检查branch对象是否有效
    if (!branch || !branch.baseDimensions) {
      console.error('无效的branch数据:', branch);
      return { labels: [], data: [] };
    }

    // 不使用branch.radarData，因为可能存在格式问题
    // 直接使用基础维度数据创建雷达图数据

    // 创建新的雷达图数据，使用固定的6个维度
    console.log('创建新的雷达图数据');

    // 确保所有得分都是有效的数字
    const orgScore = typeof branch.baseDimensions.organizationManagement?.score === 'number' ?
      branch.baseDimensions.organizationManagement.score : 0;

    const kpiScore = typeof branch.baseDimensions.kpiExecution?.score === 'number' ?
      branch.baseDimensions.kpiExecution.score : 0;

    const talentScore = typeof branch.baseDimensions.talentDevelopment?.score === 'number' ?
      branch.baseDimensions.talentDevelopment.score : 0;

    const partyScore = typeof branch.baseDimensions.partyBuilding?.score === 'number' ?
      branch.baseDimensions.partyBuilding.score : 0;

    const taskScore = typeof branch.baseDimensions.taskFollowUp?.score === 'number' ?
      branch.baseDimensions.taskFollowUp.score : 0;

    const safetyScore = typeof branch.baseDimensions.safetyCompliance?.score === 'number' ?
      branch.baseDimensions.safetyCompliance.score : 0;

    console.log(`支部 ${branch.name} 的维度得分:`, {
      组织: orgScore,
      考核: kpiScore,
      人才: talentScore,
      党建: partyScore,
      任务: taskScore,
      安全: safetyScore
    });

    return {
      labels: [
        '组织',
        '考核',
        '人才',
        '党建',
        '任务',
        '安全'
      ],
      data: [
        orgScore,
        kpiScore,
        talentScore,
        partyScore,
        taskScore,
        safetyScore
      ]
    };
  };

  // 表格列定义
  const columns = [
    {
      title: '支部名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text: string, record: BranchCapabilityData) => (
        <div className="branch-name-cell">
          <span className="branch-name">{text}</span>
          <Button
            type="link"
            size="small"
            icon={<FullscreenOutlined />}
            onClick={() => onExpandBranch && onExpandBranch(record.id)}
            className="expand-button"
          />
        </div>
      )
    },
    {
      title: '综合得分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 100,
      sorter: (a: BranchCapabilityData, b: BranchCapabilityData) => a.totalScore - b.totalScore,
      render: (score: number, record: BranchCapabilityData) => (
        <div className="score-cell">
          <span className="score-value">{score}</span>
          <Tag color={getGradeColor(record.grade)} className="grade-tag">{record.grade}</Tag>
        </div>
      )
    },
    {
      title: '组织管理水平',
      dataIndex: ['baseDimensions', 'organizationManagement', 'score'],
      key: 'organizationManagement',
      width: 120,
      render: (score: number, record: BranchCapabilityData) => (
        <div className="dimension-cell">
          <Progress
            percent={score}
            size="small"
            strokeColor={getScoreColor(score)}
            format={(percent) => `${percent}`}
          />
          {getTrendIcon(record.baseDimensions.organizationManagement.trend)}
        </div>
      )
    },
    {
      title: '考核指标执行',
      dataIndex: ['baseDimensions', 'kpiExecution', 'score'],
      key: 'kpiExecution',
      width: 120,
      render: (score: number, record: BranchCapabilityData) => (
        <div className="dimension-cell">
          <Progress
            percent={score}
            size="small"
            strokeColor={getScoreColor(score)}
            format={(percent) => `${percent}`}
          />
          {getTrendIcon(record.baseDimensions.kpiExecution.trend)}
        </div>
      )
    },
    {
      title: '人才培养创新',
      dataIndex: ['baseDimensions', 'talentDevelopment', 'score'],
      key: 'talentDevelopment',
      width: 120,
      render: (score: number, record: BranchCapabilityData) => (
        <div className="dimension-cell">
          <Progress
            percent={score}
            size="small"
            strokeColor={getScoreColor(score)}
            format={(percent) => `${percent}`}
          />
          {getTrendIcon(record.baseDimensions.talentDevelopment.trend)}
        </div>
      )
    },
    {
      title: '党建基础工作',
      dataIndex: ['baseDimensions', 'partyBuilding', 'score'],
      key: 'partyBuilding',
      width: 120,
      render: (score: number, record: BranchCapabilityData) => (
        <div className="dimension-cell">
          <Progress
            percent={score}
            size="small"
            strokeColor={getScoreColor(score)}
            format={(percent) => `${percent}`}
          />
          {getTrendIcon(record.baseDimensions.partyBuilding.trend)}
        </div>
      )
    },
    {
      title: '任务跟进落实',
      dataIndex: ['baseDimensions', 'taskFollowUp', 'score'],
      key: 'taskFollowUp',
      width: 120,
      render: (score: number, record: BranchCapabilityData) => (
        <div className="dimension-cell">
          <Progress
            percent={score}
            size="small"
            strokeColor={getScoreColor(score)}
            format={(percent) => `${percent}`}
          />
          {getTrendIcon(record.baseDimensions.taskFollowUp.trend)}
        </div>
      )
    },
    {
      title: '安全廉洁底线',
      dataIndex: ['baseDimensions', 'safetyCompliance', 'score'],
      key: 'safetyCompliance',
      width: 120,
      render: (score: number, record: BranchCapabilityData) => (
        <div className="dimension-cell">
          <Progress
            percent={score}
            size="small"
            strokeColor={getScoreColor(score)}
            format={(percent) => `${percent}`}
          />
          {getTrendIcon(record.baseDimensions.safetyCompliance.trend)}
        </div>
      )
    },
    {
      title: '群众满意度',
      dataIndex: ['baseDimensions', 'satisfaction', 'score'],
      key: 'satisfaction',
      width: 120,
      render: (score: number, record: BranchCapabilityData) => (
        <div className="dimension-cell">
          <Progress
            percent={score}
            size="small"
            strokeColor={getScoreColor(score)}
            format={(percent) => `${percent}`}
          />
          {getTrendIcon(record.baseDimensions.satisfaction.trend)}
        </div>
      )
    },
    {
      title: '管理赋值',
      dataIndex: 'managementScore',
      key: 'managementScore',
      width: 100,
      render: (score: number) => (
        <div className="dimension-cell">
          <span className="management-score">{score}</span>
          <Progress
            percent={score * 10}
            size="small"
            strokeColor={getScoreColor(score * 10)}
            showInfo={false}
          />
        </div>
      )
    },
    {
      title: '特征标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <div className="tags-cell">
          {tags.slice(0, 2).map((tag, index) => (
            <Tag key={index} color="blue" className="branch-tag">{tag}</Tag>
          ))}
          {tags.length > 2 && (
            <Tooltip title={tags.slice(2).join(', ')}>
              <Tag className="branch-tag">+{tags.length - 2}</Tag>
            </Tooltip>
          )}
        </div>
      )
    }
  ];

  // 卡片视图渲染函数
  const renderCardView = () => {
    // 再次检查数据有效性
    if (!data || data.length === 0) {
      return <div className="no-data-message">暂无支部数据</div>;
    }

    return (
      <Row gutter={[16, 16]} className="branch-cards-container">
        {data.map((branch, index) => {
          // 检查branch对象是否有效
          if (!branch || !branch.id) {
            console.error('无效的branch数据项:', branch);
            return null;
          }

          const displayData = getDisplayScore(branch);
          const rankBadge = index < 3 ?
            <Badge count={index + 1} className={`rank-badge rank-${index + 1}`} /> : null;

          return (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} xxl={4} key={branch.id} className="branch-card-col">
              <Card
                className="compact-branch-card"
                size="small"
                title={
                  <div className="card-header">
                    <div className="card-title">
                      <Space>
                        {rankBadge}
                        <Tooltip title={branch.name}>
                          <span>{branch.name}</span>
                        </Tooltip>
                      </Space>
                    </div>
                    {displayData.grade && (
                      <Tag color={getGradeColor(displayData.grade)} className="grade-tag">{displayData.grade}</Tag>
                    )}
                  </div>
                }
                extra={
                  <Tooltip title="查看详情">
                    <Button
                      type="text"
                      size="small"
                      icon={<FullscreenOutlined />}
                      onClick={() => onExpandBranch && onExpandBranch(branch.id)}
                      className="expand-button"
                    />
                  </Tooltip>
                }
              >
                <div className="card-content">
                  <div className="score-section">
                    <div className="main-score">
                      <div className="score-value">
                        {displayData.score}
                      </div>
                      <div className="score-suffix">{displayData.suffix}</div>
                      <Progress
                        percent={displayMetric === 'management' ? displayData.score * 10 : displayData.score}
                        size="small"
                        strokeColor={getScoreColor(displayMetric === 'management' ? displayData.score * 10 : displayData.score)}
                        showInfo={false}
                        strokeWidth={6}
                        trailColor="#f0f0f0"
                      />
                    </div>

                    <div className="dimension-scores">
                      <div className="dimension-row">
                        <Tooltip title="组织管理水平">
                          <span>组织管理: <strong>{branch.baseDimensions.organizationManagement.score}</strong>{getTrendIcon(branch.baseDimensions.organizationManagement.trend)}</span>
                        </Tooltip>
                        <Tooltip title="考核指标执行">
                          <span>考核指标: <strong>{branch.baseDimensions.kpiExecution.score}</strong>{getTrendIcon(branch.baseDimensions.kpiExecution.trend)}</span>
                        </Tooltip>
                      </div>
                      <div className="dimension-row">
                        <Tooltip title="人才培养创新">
                          <span>人才培养: <strong>{branch.baseDimensions.talentDevelopment.score}</strong>{getTrendIcon(branch.baseDimensions.talentDevelopment.trend)}</span>
                        </Tooltip>
                        <Tooltip title="党建基础工作">
                          <span>党建基础: <strong>{branch.baseDimensions.partyBuilding.score}</strong>{getTrendIcon(branch.baseDimensions.partyBuilding.trend)}</span>
                        </Tooltip>
                      </div>
                      <div className="dimension-row">
                        <Tooltip title="任务跟进落实">
                          <span>任务落实: <strong>{branch.baseDimensions.taskFollowUp.score}</strong>{getTrendIcon(branch.baseDimensions.taskFollowUp.trend)}</span>
                        </Tooltip>
                        <Tooltip title="安全廉洁底线">
                          <span>安全廉洁: <strong>{branch.baseDimensions.safetyCompliance.score}</strong>{getTrendIcon(branch.baseDimensions.safetyCompliance.trend)}</span>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="tags-section">
                      <div className="tags-container">
                        {branch.tags.slice(0, 3).map((tag, index) => (
                          <Tag key={index} color="blue" className="branch-tag">{tag}</Tag>
                        ))}
                        {branch.tags.length > 3 && (
                          <Tooltip title={branch.tags.slice(3).join(', ')}>
                            <Tag className="more-tag">+{branch.tags.length - 3}</Tag>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>

                  {viewMode === 'radar' && (
                    <div className="chart-section" style={{ height: '200px', marginTop: '8px', borderTop: '1px dashed #eaeaea', paddingTop: '8px' }}>
                      <StaticRadarChart />
                    </div>
                  )}

                  {viewMode === 'bar' && (
                    <div className="bar-chart-section">
                      {['organizationManagement', 'kpiExecution', 'talentDevelopment', 'partyBuilding', 'taskFollowUp', 'safetyCompliance'].map((dim) => {
                        const dimension = getDimensionScore(branch, dim);
                        return (
                          <div key={dim} className="bar-item">
                            <div className="bar-label">
                              <Tooltip title={dimension.name}>
                                {dimension.name.substring(0, 4)}:
                              </Tooltip>
                            </div>
                            <Progress
                              percent={dimension.score}
                              size="small"
                              strokeColor={getScoreColor(dimension.score)}
                              showInfo={false}
                              className="bar-progress"
                              strokeWidth={4}
                              trailColor="#f0f0f0"
                            />
                            <div className="bar-value">
                              {dimension.score}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  // 表格视图渲染函数
  const renderTableView = () => {
    // 再次检查数据有效性
    if (!data || data.length === 0) {
      return <div className="no-data-message">暂无支部数据</div>;
    }

    return (
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="middle"
        scroll={{ x: 'max-content' }}
        className="branch-capability-table"
        rowClassName={(record, index) => index < 3 ? `top-${index + 1}-row` : ''}
        bordered
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={2}>
                <Space>
                  <TrophyOutlined className="trophy-icon" />
                  <strong>平均得分</strong>
                </Space>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                <strong className="summary-score">
                  {(data.reduce((sum, branch) => sum + branch.totalScore, 0) / data.length).toFixed(1)}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}>
                <strong className="summary-score">
                  {(data.reduce((sum, branch) => sum + branch.baseDimensions.organizationManagement.score, 0) / data.length).toFixed(1)}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <strong className="summary-score">
                  {(data.reduce((sum, branch) => sum + branch.baseDimensions.kpiExecution.score, 0) / data.length).toFixed(1)}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5}>
                <strong className="summary-score">
                  {(data.reduce((sum, branch) => sum + branch.baseDimensions.talentDevelopment.score, 0) / data.length).toFixed(1)}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6}>
                <strong className="summary-score">
                  {(data.reduce((sum, branch) => sum + branch.baseDimensions.partyBuilding.score, 0) / data.length).toFixed(1)}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7}>
                <strong className="summary-score">
                  {(data.reduce((sum, branch) => sum + branch.baseDimensions.taskFollowUp.score, 0) / data.length).toFixed(1)}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8}>
                <strong className="summary-score">
                  {(data.reduce((sum, branch) => sum + branch.baseDimensions.safetyCompliance.score, 0) / data.length).toFixed(1)}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={9}>
                <strong className="summary-score">
                  {(data.reduce((sum, branch) => sum + branch.baseDimensions.satisfaction.score, 0) / data.length).toFixed(1)}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={10}>
                <strong className="summary-score">
                  {(data.reduce((sum, branch) => sum + branch.managementScore, 0) / data.length).toFixed(1)}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={11}></Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    );
  };

  return (
    <div className="compact-branch-capability-view">
      <div className="view-controls">
        <div className="control-left">
          <Space size="middle">
            <Radio.Group value={layoutMode} onChange={(e) => setLayoutMode(e.target.value)} buttonStyle="solid" size="small">
              <Radio.Button value="card"><AppstoreOutlined /> 卡片视图</Radio.Button>
              <Radio.Button value="table"><TableOutlined /> 表格视图</Radio.Button>
            </Radio.Group>

            {layoutMode === 'card' && (
              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                buttonStyle="solid"
                size="small"
                className="view-mode-control"
              >
                <Radio.Button value="radar"><RadarChartOutlined /> 雷达图</Radio.Button>
                <Radio.Button value="bar"><BarChartOutlined /> 柱状图</Radio.Button>
              </Radio.Group>
            )}

            <Radio.Group
              value={displayMetric}
              onChange={(e) => setDisplayMetric(e.target.value)}
              buttonStyle="solid"
              size="small"
              className="metric-control"
            >
              <Radio.Button value="total">综合得分</Radio.Button>
              <Radio.Button value="base">基础评价</Radio.Button>
              <Radio.Button value="management">管理赋值</Radio.Button>
            </Radio.Group>
          </Space>
        </div>

        <div className="control-right">
          <Space>
            <Button icon={<FilterOutlined />} size="small">筛选</Button>
            <Button icon={<SortAscendingOutlined />} size="small">排序</Button>
            <Tooltip title="刷新视图">
              <Button
                onClick={() => {
                  // 强制刷新视图
                  const currentMode = viewMode;
                  setViewMode(currentMode === 'radar' ? 'bar' : 'radar');
                  setTimeout(() => setViewMode(currentMode), 100);
                }}
                icon={<RadarChartOutlined />}
                size="small"
              >刷新</Button>
            </Tooltip>
            <Tooltip title="指标说明">
              <Button
                type="primary"
                ghost
                icon={<InfoCircleOutlined />}
                size="small"
                className="info-button"
              />
            </Tooltip>
          </Space>
        </div>
      </div>

      <Divider className="control-divider" />

      {layoutMode === 'card' ? renderCardView() : renderTableView()}
    </div>
  );
};

export default CompactBranchCapabilityView;
