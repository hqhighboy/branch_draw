import React from 'react';
import { Card, Progress, Tag, Statistic, Divider, List, Avatar } from 'antd';
import {
  TrophyOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  AlertOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { BranchCapabilityData, ManagementScoreType } from '../interfaces/BranchCapability';

interface CardViewProps {
  data: BranchCapabilityData[];
}

const CardView: React.FC<CardViewProps> = ({ data }) => {
  console.log('CardView data:', data);

  // 获取得分颜色 - 确保所有函数定义在条件判断之前
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

  // 获取赋值类型对应的图标
  const getScoreTypeIcon = (type: ManagementScoreType) => {
    switch (type) {
      case '特殊贡献赋值':
        return <TrophyOutlined />;
      case '创新工作赋值':
        return <RocketOutlined />;
      case '战略任务赋值':
        return <ThunderboltOutlined />;
      case '管理裁量赋值':
        return <ToolOutlined />;
      case '突发事件应对赋值':
        return <AlertOutlined />;
      default:
        return <TrophyOutlined />;
    }
  };

  // 获取趋势图标
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <ArrowUpOutlined style={{ color: 'green' }} />;
    if (trend === 'down') return <ArrowDownOutlined style={{ color: 'red' }} />;
    return null;
  };

  // 检查数据是否有效 - 移到函数定义之后
  if (!data || data.length === 0) {
    return <div className="no-data-message">暂无数据</div>;
  }


  return (
    <div className="card-view">
      {data.map(branch => (
        <Card
          key={branch.id}
          className="capability-card"
          hoverable
        >
          <div className="card-header">
            <h3>{branch.name}</h3>
            <Tag color={getGradeColor(branch.grade)}>{branch.grade}</Tag>
          </div>
          <div className="card-content">
            <Statistic
              title="综合能力得分"
              value={branch.totalScore}
              precision={1}
              valueStyle={{ color: getScoreColor(branch.totalScore) }}
              suffix="/ 100"
            />
            <Progress
              percent={branch.totalScore}
              status="active"
              strokeColor={getScoreColor(branch.totalScore)}
            />

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Statistic
                  title="基础评价"
                  value={branch.baseScore}
                  precision={1}
                  valueStyle={{ fontSize: '16px', color: getScoreColor(branch.baseScore) }}
                  suffix={<Tag color={getGradeColor(branch.baseGrade)}>{branch.baseGrade}</Tag>}
                />
              </div>
              <div>
                <Statistic
                  title="管理赋值"
                  value={branch.managementScore}
                  precision={1}
                  valueStyle={{ fontSize: '16px', color: getScoreColor(branch.managementScore * 10) }}
                  suffix="/ 10"
                />
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ marginBottom: '12px' }}>
              <h4>能力特征</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {branch.tags.map((tag, index) => (
                  <Tag key={index} color={index < 3 ? 'blue' : 'default'}>{tag}</Tag>
                ))}
              </div>
            </div>

            <div>
              <h4>管理赋值详情</h4>
              <List
                size="small"
                dataSource={branch.managementScores.slice(0, 2)} // 只显示前两条
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={getScoreTypeIcon(item.type)} />}
                      title={item.type}
                      description={`${item.score > 0 ? '+' : ''}${item.score} 分`}
                    />
                  </List.Item>
                )}
              />
              {branch.managementScores.length > 2 && (
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>
                  还有 {branch.managementScores.length - 2} 条赋值记录
                </div>
              )}
            </div>
          </div>
          <div className="card-footer">
            <div>
              <span style={{ marginRight: '8px' }}>
                组织管理: {branch.baseDimensions.organizationManagement.score}
                {getTrendIcon(branch.baseDimensions.organizationManagement.trend)}
              </span>
              <span>
                党建基础: {branch.baseDimensions.partyBuilding.score}
                {getTrendIcon(branch.baseDimensions.partyBuilding.trend)}
              </span>
            </div>
            <div>
              <span style={{ marginRight: '8px' }}>
                人才培养: {branch.baseDimensions.talentDevelopment.score}
                {getTrendIcon(branch.baseDimensions.talentDevelopment.trend)}
              </span>
              <span>
                任务落实: {branch.baseDimensions.taskFollowUp.score}
                {getTrendIcon(branch.baseDimensions.taskFollowUp.trend)}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CardView;
