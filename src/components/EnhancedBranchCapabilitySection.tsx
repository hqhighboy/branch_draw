import React, { useState } from 'react';
import { Tabs, Card, Row, Col, Button, Tooltip } from 'antd';
import { BarChartOutlined, RadarChartOutlined, LineChartOutlined, TableOutlined, RobotOutlined } from '@ant-design/icons';
import BranchCapabilityPortrait from './BranchCapabilityPortrait';
import BranchCapabilityDetail from './BranchCapabilityDetail';
import './EnhancedBranchCapabilitySection.css';

const { TabPane } = Tabs;

interface Branch {
  id: string;
  name: string;
}

interface EnhancedBranchCapabilitySectionProps {
  branches: Branch[];
  selectedBranch: Branch | null;
}

/**
 * 增强版支部综合能力画像组件
 */
const EnhancedBranchCapabilitySection: React.FC<EnhancedBranchCapabilitySectionProps> = ({ branches, selectedBranch }) => {
  const [activeTab, setActiveTab] = useState<string>('portrait');

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className="enhanced-branch-capability-section">
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange} 
        type="card"
        className="capability-main-tabs"
        tabBarExtraContent={
          <div className="tab-extra-content">
            <Tooltip title="导出数据">
              <Button type="text" icon={<TableOutlined />}>导出</Button>
            </Tooltip>
            <Tooltip title="AI分析">
              <Button type="primary" icon={<RobotOutlined />}>AI分析</Button>
            </Tooltip>
          </div>
        }
      >
        <TabPane 
          tab={<span><RadarChartOutlined /> 能力画像</span>} 
          key="portrait"
        >
          <BranchCapabilityPortrait branches={branches} selectedBranch={selectedBranch} />
        </TabPane>
        <TabPane 
          tab={<span><BarChartOutlined /> 详细分析</span>} 
          key="detail"
        >
          <BranchCapabilityDetail branch={selectedBranch} />
        </TabPane>
        <TabPane 
          tab={<span><LineChartOutlined /> 管理人员赋值</span>} 
          key="management"
        >
          <div className="management-content">
            <Card title="管理人员赋值模式" className="management-card">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <p className="management-description">
                    管理人员赋值模式是对支部综合能力评价的补充，用于评估支部管理人员的能力和表现，
                    以及对支部整体工作的影响。通过这一模式，可以更全面地了解支部的管理水平和潜力。
                  </p>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="领导力评估" className="sub-card">
                    <p>评估支部领导班子的领导能力、决策水平和团队管理能力。</p>
                    <div className="score-container">
                      <div className="score-item">
                        <span className="score-label">当前得分</span>
                        <span className="score-value">{Math.floor(Math.random() * 20) + 80}</span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">权重</span>
                        <span className="score-value">25%</span>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="战略思维" className="sub-card">
                    <p>评估支部管理人员的战略规划能力和长远发展思维。</p>
                    <div className="score-container">
                      <div className="score-item">
                        <span className="score-label">当前得分</span>
                        <span className="score-value">{Math.floor(Math.random() * 20) + 80}</span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">权重</span>
                        <span className="score-value">25%</span>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="危机处理" className="sub-card">
                    <p>评估支部管理人员应对突发事件和危机的能力。</p>
                    <div className="score-container">
                      <div className="score-item">
                        <span className="score-label">当前得分</span>
                        <span className="score-value">{Math.floor(Math.random() * 20) + 80}</span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">权重</span>
                        <span className="score-value">25%</span>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="创新引领" className="sub-card">
                    <p>评估支部管理人员推动创新和变革的能力。</p>
                    <div className="score-container">
                      <div className="score-item">
                        <span className="score-label">当前得分</span>
                        <span className="score-value">{Math.floor(Math.random() * 20) + 80}</span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">权重</span>
                        <span className="score-value">25%</span>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={24}>
                  <div className="total-management-score">
                    <span className="total-label">管理人员综合得分</span>
                    <span className="total-value">{Math.floor(Math.random() * 10) + 85}</span>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default EnhancedBranchCapabilitySection;
