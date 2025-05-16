import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Spin,
  Tabs,
  Typography,
  Divider,
  message,
  Empty,
  Tag,
  Space,
  Tooltip,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  RobotOutlined,
  LineChartOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  UploadOutlined
} from '@ant-design/icons';
import axios from '../api';
import { BranchCapabilityData } from '../interfaces/BranchCapability';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

interface AIAnalysisPanelProps {
  branchData: BranchCapabilityData;
  apiBaseUrl?: string;
}

interface AnalysisResult {
  strengths: string;
  recommendations: string;
  potentialAssessment: string;
  bestPractices: string;
}

interface PredictionResult {
  scoresTrend: string;
  dimensionsTrend: string;
  keyFactors: string;
  focusAreas: string;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  branchData,
  apiBaseUrl = 'http://localhost:3002'
}) => {
  const [activeTab, setActiveTab] = useState('analysis');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [documentUploadVisible, setDocumentUploadVisible] = useState(false);

  // 获取分析结果
  const fetchAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const response = await axios.post(`${apiBaseUrl}/api/ai/analyze-branch-capability`, {
        branchData
      });
      
      if (response.data.success) {
        setAnalysisResult(response.data.analysis);
      } else {
        message.error(`获取分析失败: ${response.data.message}`);
      }
    } catch (error) {
      console.error('获取AI分析失败:', error);
      message.error('获取AI分析失败');
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 获取预测结果
  const fetchPrediction = async () => {
    setPredictionLoading(true);
    try {
      // 构建历史数据
      const historicalData = branchData.trendData.months.map((month, index) => ({
        date: month,
        totalScore: branchData.trendData.totalScores[index],
        organizationManagement: branchData.baseDimensions.organizationManagement.score,
        kpiExecution: branchData.baseDimensions.kpiExecution.score,
        talentDevelopment: branchData.baseDimensions.talentDevelopment.score
      }));

      const response = await axios.post(`${apiBaseUrl}/api/ai/predict-branch-trend`, {
        branchData,
        historicalData
      });
      
      if (response.data.success) {
        setPredictionResult(response.data.prediction);
      } else {
        message.error(`获取预测失败: ${response.data.message}`);
      }
    } catch (error) {
      console.error('获取AI预测失败:', error);
      message.error('获取AI预测失败');
    } finally {
      setPredictionLoading(false);
    }
  };

  // 生成改进建议
  const generateRecommendations = async () => {
    setAnalysisLoading(true);
    try {
      // 构建比较数据
      const comparisonData = {
        averageBaseScore: 75.5, // 示例数据，实际应从系统获取
        averageTotalScore: 78.2,
        highestScoreBranch: '第一党支部',
        highestScore: 88.5
      };

      const response = await axios.post(`${apiBaseUrl}/api/ai/generate-recommendations`, {
        branchData,
        comparisonData
      });
      
      if (response.data.success) {
        // 将生成的建议解析为分析结果格式
        const recommendations = response.data.recommendations;
        const sections = recommendations.split(/\d+\.\s+/).filter(Boolean);
        
        setAnalysisResult({
          strengths: sections[1] || '',
          recommendations: sections[3] || '',
          potentialAssessment: sections[5] || '',
          bestPractices: sections[4] || ''
        });
      } else {
        message.error(`生成建议失败: ${response.data.message}`);
      }
    } catch (error) {
      console.error('生成改进建议失败:', error);
      message.error('生成改进建议失败');
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 渲染分析结果
  const renderAnalysisResult = () => {
    if (analysisLoading) {
      return (
        <div className="loading-container">
          <Spin tip="AI正在分析数据..." />
        </div>
      );
    }

    if (!analysisResult) {
      return (
        <Empty
          description="暂无分析结果"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<RobotOutlined />} onClick={fetchAnalysis}>
            开始AI分析
          </Button>
        </Empty>
      );
    }

    return (
      <div className="analysis-result">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="优势分析" bordered={false}>
              <Paragraph>{analysisResult.strengths}</Paragraph>
            </Card>
          </Col>
          
          <Col span={24}>
            <Card title="改进建议" bordered={false}>
              <Paragraph>{analysisResult.recommendations}</Paragraph>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="发展潜力评估" bordered={false}>
              <Paragraph>{analysisResult.potentialAssessment}</Paragraph>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="可借鉴的先进经验" bordered={false}>
              <Paragraph>{analysisResult.bestPractices}</Paragraph>
            </Card>
          </Col>
        </Row>
        
        <div className="action-buttons" style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button icon={<SyncOutlined />} onClick={fetchAnalysis}>
              重新分析
            </Button>
            <Button type="primary" icon={<BulbOutlined />} onClick={generateRecommendations}>
              生成详细建议
            </Button>
          </Space>
        </div>
      </div>
    );
  };

  // 渲染预测结果
  const renderPredictionResult = () => {
    if (predictionLoading) {
      return (
        <div className="loading-container">
          <Spin tip="AI正在预测趋势..." />
        </div>
      );
    }

    if (!predictionResult) {
      return (
        <Empty
          description="暂无预测结果"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<LineChartOutlined />} onClick={fetchPrediction}>
            开始AI预测
          </Button>
        </Empty>
      );
    }

    return (
      <div className="prediction-result">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="综合能力得分趋势预测" bordered={false}>
              <Paragraph>{predictionResult.scoresTrend}</Paragraph>
            </Card>
          </Col>
          
          <Col span={24}>
            <Card title="各维度得分变化趋势" bordered={false}>
              <Paragraph>{predictionResult.dimensionsTrend}</Paragraph>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="影响发展的关键因素" bordered={false}>
              <Paragraph>{predictionResult.keyFactors}</Paragraph>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="建议关注的重点领域" bordered={false}>
              <Paragraph>{predictionResult.focusAreas}</Paragraph>
            </Card>
          </Col>
        </Row>
        
        <div className="action-buttons" style={{ marginTop: 16, textAlign: 'right' }}>
          <Button icon={<SyncOutlined />} onClick={fetchPrediction}>
            重新预测
          </Button>
        </div>
      </div>
    );
  };

  // 渲染自然语言查询
  const renderNaturalLanguageQuery = () => {
    return (
      <div className="natural-language-query">
        <Empty
          description="自然语言查询功能即将上线"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<QuestionCircleOutlined />} disabled>
            开始查询
          </Button>
        </Empty>
      </div>
    );
  };

  // 渲染文档分析
  const renderDocumentAnalysis = () => {
    return (
      <div className="document-analysis">
        <Empty
          description="文档分析功能即将上线"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<FileTextOutlined />} disabled>
            上传文档
          </Button>
        </Empty>
      </div>
    );
  };

  return (
    <Card
      title={
        <Space>
          <RobotOutlined />
          <span>AI智能分析</span>
          <Tag color="blue">Beta</Tag>
        </Space>
      }
      className="ai-analysis-panel"
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <BulbOutlined />
              能力分析
            </span>
          }
          key="analysis"
        >
          {renderAnalysisResult()}
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <LineChartOutlined />
              趋势预测
            </span>
          }
          key="prediction"
        >
          {renderPredictionResult()}
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <QuestionCircleOutlined />
              自然语言查询
            </span>
          }
          key="query"
        >
          {renderNaturalLanguageQuery()}
        </TabPane>
        
        <TabPane
          tab={
            <span>
              <FileTextOutlined />
              文档分析
            </span>
          }
          key="document"
        >
          {renderDocumentAnalysis()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default AIAnalysisPanel;
