import React from 'react';
import { Row, Col, Card, Avatar, List, Tag } from 'antd';
import { Radar } from 'react-chartjs-2';
import { 
  TrophyOutlined, 
  RocketOutlined, 
  ThunderboltOutlined, 
  ToolOutlined, 
  AlertOutlined 
} from '@ant-design/icons';
import { BranchCapabilityData, ManagementScore, ManagementScoreType } from '../interfaces/BranchCapability';

interface RadarChartViewProps {
  data: BranchCapabilityData;
  averageData?: number[];
}

const RadarChartView: React.FC<RadarChartViewProps> = ({ data, averageData }) => {
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

  // 获取标签大小类
  const getTagSizeClass = (index: number) => {
    if (index < 2) return 'tag-large';
    if (index < 5) return 'tag-medium';
    return 'tag-small';
  };

  // 获取标签颜色
  const getTagColor = (tag: string) => {
    const positiveColors = ['blue', 'green', 'gold', 'purple', 'cyan'];
    const negativeColors = ['orange', 'red', 'volcano', 'magenta', 'lime'];
    
    const positiveKeywords = ['进取型', '创新型', '攻坚型', '高效型', '人才摇篮', '执行力强', '党建扎实', '安全意识高'];
    
    if (positiveKeywords.some(keyword => tag.includes(keyword))) {
      return positiveColors[Math.floor(Math.random() * positiveColors.length)];
    } else {
      return negativeColors[Math.floor(Math.random() * negativeColors.length)];
    }
  };

  // 雷达图数据
  const radarData = {
    labels: data.radarData.labels,
    datasets: [
      {
        label: data.name,
        data: data.radarData.data,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2
      },
      ...(averageData ? [{
        label: '平均水平',
        data: averageData,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2
      }] : [])
    ]
  };

  // 雷达图配置
  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="radar-chart-view">
      <Row gutter={16}>
        <Col span={16}>
          <Card title="综合能力雷达图" bordered={false}>
            <div className="radar-container">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="能力特征标签" bordered={false}>
            <div className="tag-cloud">
              {data.tags.map((tag, index) => (
                <Tag 
                  key={index} 
                  color={getTagColor(tag)} 
                  className={getTagSizeClass(index)}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </Card>
          <Card title="管理赋值详情" bordered={false} style={{ marginTop: '16px' }}>
            <List
              itemLayout="horizontal"
              dataSource={data.managementScores}
              renderItem={(item: ManagementScore) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={getScoreTypeIcon(item.type)} />}
                    title={item.type}
                    description={`${item.score > 0 ? '+' : ''}${item.score} 分 - ${item.reason}`}
                  />
                  <div>{item.evaluator}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RadarChartView;
