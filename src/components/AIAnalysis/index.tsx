/**
 * @file AI分析组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, message, Tooltip, List, Tag, Typography } from 'antd';
import { 
  RobotOutlined, 
  SyncOutlined, 
  BulbOutlined, 
  CheckCircleOutlined,
  BarChartOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useBranch } from '../../context/BranchContext';
import { AIAnalysisResult } from '../../types';
import api from '../../services/api';
import './AIAnalysis.css';

const { Paragraph, Title } = Typography;

// 组件属性
interface AIAnalysisProps {
  selectedModel: string;
}

/**
 * AI分析组件
 * @param {AIAnalysisProps} props 组件属性
 * @returns {JSX.Element} AI分析组件
 */
const AIAnalysis: React.FC<AIAnalysisProps> = ({ selectedModel }) => {
  // 获取支部上下文
  const { selectedBranch, selectedBranchId } = useBranch();
  
  // 状态
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  
  // 获取分析结果
  useEffect(() => {
    const fetchAnalysisResult = async () => {
      if (!selectedBranchId) return;
      
      try {
        setLoading(true);
        const result = await api.ai.getAnalysisResult(selectedBranchId);
        setAnalysisResult(result);
      } catch (error) {
        console.error('获取AI分析结果失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysisResult();
  }, [selectedBranchId]);
  
  /**
   * 开始分析
   */
  const handleStartAnalysis = async () => {
    if (!selectedBranchId || !selectedModel) {
      message.error('请选择支部和AI模型');
      return;
    }
    
    try {
      setAnalyzing(true);
      message.info(`正在使用 ${selectedModel} 模型分析支部数据，请稍候...`);
      
      const result = await api.ai.requestAnalysis(selectedBranchId, selectedModel);
      
      if (result) {
        setAnalysisResult(result);
        message.success('分析完成');
      } else {
        message.error('分析失败，请稍后重试');
      }
    } catch (error) {
      console.error('AI分析失败:', error);
      message.error('AI分析失败，请检查模型配置或网络连接');
      
      // 生成模拟数据
      generateMockAnalysisResult();
    } finally {
      setAnalyzing(false);
    }
  };
  
  /**
   * 生成模拟分析结果
   */
  const generateMockAnalysisResult = () => {
    if (!selectedBranchId || !selectedBranch) return;
    
    const mockResult: AIAnalysisResult = {
      branchId: selectedBranchId,
      analysisText: `${selectedBranch.name}整体表现良好，在党建工作、人才培养和团队协作方面表现突出。管理水平得分为85分，处于良好水平，但仍有提升空间。KPI执行得分为82分，执行力度有待加强。人才培养得分为90分，表现优秀，建立了完善的人才培养机制。党建工作得分为92分，表现优秀，各项党建活动开展有序。任务跟进得分为83分，需要加强任务的监督和跟踪。安全合规得分为88分，安全意识较强，但仍需加强合规培训。创新能力得分为80分，创新意识有待提高。团队协作得分为89分，团队凝聚力强，协作效率高。资源利用得分为84分，资源配置合理，但利用效率有待提高。`,
      suggestions: [
        '加强管理层的领导力培训，提升整体管理水平',
        '建立更完善的KPI跟踪机制，提高执行力',
        '进一步发挥人才培养优势，形成示范效应',
        '加强创新文化建设，鼓励支部成员提出创新想法',
        '优化资源分配机制，提高资源利用效率',
        '建立更系统的任务跟进机制，确保各项工作按时完成'
      ],
      timestamp: new Date().toISOString()
    };
    
    setAnalysisResult(mockResult);
    message.success('已生成模拟分析结果');
  };
  
  /**
   * 导出分析报告
   */
  const handleExportReport = () => {
    message.info('导出功能开发中...');
  };
  
  return (
    <div className="ai-analysis">
      <Card
        title={
          <div className="ai-analysis-title">
            <RobotOutlined /> AI智能分析
          </div>
        }
        className="ai-analysis-card"
        extra={
          <div className="card-actions">
            <Tooltip title="开始分析">
              <Button
                type="primary"
                icon={<SyncOutlined spin={analyzing} />}
                onClick={handleStartAnalysis}
                loading={analyzing}
                disabled={!selectedModel || !selectedBranchId}
              >
                {analyzing ? '分析中...' : '开始分析'}
              </Button>
            </Tooltip>
            
            {analysisResult && (
              <Tooltip title="导出报告">
                <Button
                  icon={<FileTextOutlined />}
                  onClick={handleExportReport}
                  style={{ marginLeft: '8px' }}
                >
                  导出报告
                </Button>
              </Tooltip>
            )}
          </div>
        }
      >
        {loading ? (
          <div className="loading-container">
            <Spin tip="加载分析结果..." />
          </div>
        ) : analyzing ? (
          <div className="analyzing-container">
            <Spin tip={`正在使用 ${selectedModel} 模型分析支部数据...`} />
            <p className="analyzing-tip">分析过程可能需要几分钟，请耐心等待</p>
          </div>
        ) : analysisResult ? (
          <div className="analysis-result">
            <div className="analysis-header">
              <Title level={4}>
                <BarChartOutlined /> {selectedBranch?.name} 综合分析
              </Title>
              <Tag color="blue">
                {new Date(analysisResult.timestamp).toLocaleString()}
              </Tag>
            </div>
            
            <div className="analysis-content">
              <Paragraph className="analysis-text">
                {analysisResult.analysisText}
              </Paragraph>
            </div>
            
            <div className="analysis-suggestions">
              <Title level={5}>
                <BulbOutlined /> 改进建议
              </Title>
              <List
                dataSource={analysisResult.suggestions}
                renderItem={(item, index) => (
                  <List.Item>
                    <div className="suggestion-item">
                      <CheckCircleOutlined className="suggestion-icon" />
                      <span>{item}</span>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        ) : (
          <div className="empty-analysis">
            <div className="empty-icon">
              <RobotOutlined />
            </div>
            <p className="empty-text">
              点击"开始分析"按钮，使用AI分析支部数据
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AIAnalysis;
