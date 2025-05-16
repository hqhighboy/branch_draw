/**
 * @file 管理人员赋值组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Slider, Button, Form, Input, message } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import './ManagementScore.css';

// 组件属性
interface ManagementScoreProps {
  branchId: string | null;
  branchName: string;
}

// 管理维度类型
interface ManagementDimension {
  id: string;
  name: string;
  description: string;
  score: number;
  weight: number;
}

/**
 * 管理人员赋值组件
 * @param {ManagementScoreProps} props 组件属性
 * @returns {JSX.Element} 管理人员赋值组件
 */
const ManagementScore: React.FC<ManagementScoreProps> = ({ branchId, branchName }) => {
  // 状态
  const [dimensions, setDimensions] = useState<ManagementDimension[]>([
    {
      id: 'leadership',
      name: '领导力评估',
      description: '评估支部领导班子的领导能力、决策水平和团队管理能力。',
      score: Math.floor(Math.random() * 20) + 80,
      weight: 25
    },
    {
      id: 'strategy',
      name: '战略思维',
      description: '评估支部管理人员的战略规划能力和长远发展思维。',
      score: Math.floor(Math.random() * 20) + 80,
      weight: 25
    },
    {
      id: 'crisis',
      name: '危机处理',
      description: '评估支部管理人员应对突发事件和危机的能力。',
      score: Math.floor(Math.random() * 20) + 80,
      weight: 25
    },
    {
      id: 'innovation',
      name: '创新引领',
      description: '评估支部管理人员推动创新和变革的能力。',
      score: Math.floor(Math.random() * 20) + 80,
      weight: 25
    }
  ]);
  
  // 表单实例
  const [form] = Form.useForm();
  
  // 计算总分
  const totalScore = Math.round(
    dimensions.reduce((sum, dim) => sum + dim.score * dim.weight / 100, 0)
  );
  
  // 初始化表单数据
  useEffect(() => {
    const formValues: Record<string, number> = {};
    dimensions.forEach(dim => {
      formValues[dim.id] = dim.score;
    });
    form.setFieldsValue(formValues);
  }, [form, dimensions]);
  
  /**
   * 处理分数变化
   * @param {string} id 维度ID
   * @param {number} value 分数
   */
  const handleScoreChange = (id: string, value: number) => {
    setDimensions(prev => 
      prev.map(dim => 
        dim.id === id ? { ...dim, score: value } : dim
      )
    );
  };
  
  /**
   * 处理保存
   */
  const handleSave = () => {
    if (!branchId) {
      message.error('未选择支部');
      return;
    }
    
    message.success('管理人员赋值保存成功');
  };
  
  /**
   * 处理重置
   */
  const handleReset = () => {
    setDimensions(prev => 
      prev.map(dim => ({
        ...dim,
        score: Math.floor(Math.random() * 20) + 80
      }))
    );
    
    const formValues: Record<string, number> = {};
    dimensions.forEach(dim => {
      formValues[dim.id] = Math.floor(Math.random() * 20) + 80;
    });
    form.setFieldsValue(formValues);
  };
  
  return (
    <div className="management-score">
      <Card 
        title={`${branchName} - 管理人员赋值模式`}
        className="management-card"
        extra={
          <div className="card-actions">
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={handleSave}
              style={{ marginRight: '8px' }}
            >
              保存
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleReset}
            >
              重置
            </Button>
          </div>
        }
      >
        <p className="management-description">
          管理人员赋值模式是对支部综合能力评价的补充，用于评估支部管理人员的能力和表现，
          以及对支部整体工作的影响。通过这一模式，可以更全面地了解支部的管理水平和潜力。
        </p>
        
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>
            {dimensions.map(dimension => (
              <Col key={dimension.id} xs={24} md={12}>
                <Card 
                  title={dimension.name} 
                  className="dimension-card"
                  size="small"
                >
                  <p className="dimension-description">{dimension.description}</p>
                  
                  <Form.Item 
                    name={dimension.id}
                    label="得分"
                    rules={[{ required: true, message: '请输入得分' }]}
                  >
                    <div className="score-slider">
                      <Slider
                        min={0}
                        max={100}
                        value={dimension.score}
                        onChange={(value) => handleScoreChange(dimension.id, value)}
                      />
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={dimension.score}
                        onChange={(e) => handleScoreChange(dimension.id, parseInt(e.target.value) || 0)}
                        style={{ width: '60px', marginLeft: '16px' }}
                      />
                    </div>
                  </Form.Item>
                  
                  <div className="dimension-weight">
                    <span className="weight-label">权重</span>
                    <span className="weight-value">{dimension.weight}%</span>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Form>
        
        <div className="total-score">
          <span className="total-label">管理人员综合得分</span>
          <span className="total-value">{totalScore}</span>
        </div>
      </Card>
    </div>
  );
};

export default ManagementScore;
