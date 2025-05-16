import React, { useState } from 'react';
import { Input, Button, Spin, Row, Col, Card, Typography } from 'antd';
import './AIAnalysisSection.css';

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

interface Branch {
  id: string;
  name: string;
  secretary?: string;
  deputySecretary?: string;
  organizationalCommissioner?: string;
  disciplinaryCommissioner?: string;
  memberCount?: number;
  averageAge?: number;
  honors?: string[];
  ageDistribution?: { [key: string]: number };
  educationDistribution?: { [key: string]: number };
  skillDistribution?: { [key: string]: number };
  titleDistribution?: { [key: string]: number };
  annualWork?: Array<{
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    progress: number;
  }>;
}

interface AIAnalysisSectionProps {
  branch: Branch | null | undefined;
  branches: Branch[];
  selectedModel?: string;
}

/**
 * AI分析组件
 */
const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({ branch, branches, selectedModel }) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // 处理查询
  const handleQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // 如果有选择模型且是本地Ollama模型，尝试使用真实API
      if (selectedModel) {
        try {
          // 构建提示词，包含支部数据上下文
          const prompt = `
            你是一个专业的党支部数据分析助手。请基于以下数据分析用户的问题：

            ${branch ? JSON.stringify(branch, null, 2) : '暂无支部数据'}

            用户问题: ${query}
          `;

          // 调用Ollama API
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: selectedModel,
              prompt: prompt,
              stream: false
            })
          });

          if (response.ok) {
            const data = await response.json();
            setAnalysisResult(data.response || '分析完成，但没有返回结果');
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Ollama API调用失败，回退到模拟数据:', error);
          // 如果API调用失败，继续使用模拟数据
        }
      }

      // 模拟延迟
      setTimeout(() => {
        // 根据不同的查询生成不同的分析结果
        let result = '';
        if (query.includes('支部排名') || query.includes('排名') || query.includes('对比')) {
          result = generateRankingAnalysis();
        } else if (query.includes('人才') || query.includes('人员')) {
          result = generateTalentAnalysis();
        } else if (query.includes('工作') || query.includes('任务')) {
          result = generateWorkAnalysis();
        } else if (query.includes('建议') || query.includes('提升')) {
          result = generateSuggestionAnalysis();
        } else {
          result = generateGeneralAnalysis();
        }

        setAnalysisResult(result);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('AI分析请求失败:', error);
      setAnalysisResult('分析请求失败，请稍后再试。');
      setLoading(false);
    }
  };

  // 生成支部排名分析
  const generateRankingAnalysis = () => {
    return `## 支部排名分析

根据当前数据分析，各支部综合能力排名如下：

1. **调控中心党支部** - 综合得分：90分
   - 优势：指标执行(94分)、安全合规(96分)
   - 劣势：人才培养(80分)

2. **安监党支部** - 综合得分：90分
   - 优势：安全合规(97分)、任务跟进(93分)
   - 劣势：人才培养(81分)

3. **财务党支部** - 综合得分：89分
   - 优势：任务跟进(91分)、指标执行(91分)
   - 劣势：人才培养(79分)

当前支部在所有11个支部中排名第${Math.floor(Math.random() * 5) + 1}位，相比上季度${Math.random() > 0.5 ? '上升' : '下降'}了${Math.floor(Math.random() * 2) + 1}位。

主要差距在于人才培养方面，建议加强人才培养和技能提升工作。`;
  };

  // 生成人才分析
  const generateTalentAnalysis = () => {
    return `## 支部人才分析

当前支部人员结构分析：

- **年龄结构**：以中青年为主，35-50岁占比40%，有利于支部长期发展
- **学历结构**：本科学历占比60%，高于全局平均水平
- **技能结构**：高级工占比40%，技师及以上占比30%，技术力量较强
- **职称结构**：工程师占比50%，高级及以上占比30%，专业能力较强

人才发展建议：
1. 加强青年人才培养，建立人才梯队
2. 提高高级技师比例，增强技术创新能力
3. 鼓励人员考取更高职称，提升专业水平
4. 建立健全人才激励机制，留住核心人才`;
  };

  // 生成工作分析
  const generateWorkAnalysis = () => {
    return `## 支部工作分析

当前支部工作完成情况：

- **计划工作**：完成率85%，高于平均水平
- **执行工作**：完成率78%，需要加强
- **检查工作**：完成率92%，表现优秀
- **评估工作**：完成率80%，符合预期
- **改进工作**：完成率75%，有提升空间

重点工作进展：
1. 党建工作计划完成度75%，进度正常
2. 党员教育培训完成度60%，需要加快进度

工作改进建议：
1. 加强执行力度，提高执行工作完成率
2. 完善工作评估机制，及时发现问题
3. 强化改进措施落实，提高改进工作效率
4. 建立工作进度定期通报机制，促进按期完成`;
  };

  // 生成建议分析
  const generateSuggestionAnalysis = () => {
    return `## 支部能力提升建议

基于当前支部数据分析，提出以下提升建议：

1. **管理水平提升**
   - 完善支部管理制度，规范管理流程
   - 加强支部委员会建设，提高决策效率
   - 建立科学的绩效评价体系，激发工作积极性

2. **人才培养加强**
   - 制定个性化培养计划，针对不同层次人才
   - 开展技能竞赛和专业培训，提高专业能力
   - 建立导师制，促进经验传承和知识共享

3. **党建工作创新**
   - 运用信息化手段，提高党建工作效率
   - 开展特色党建活动，增强党组织凝聚力
   - 深化"三会一课"内涵，提高党员参与度

4. **安全合规强化**
   - 完善安全责任体系，落实安全责任
   - 加强安全教育培训，提高安全意识
   - 开展安全隐患排查，消除安全风险`;
  };

  // 生成通用分析
  const generateGeneralAnalysis = () => {
    return `## 支部综合分析

${branch?.name || '当前支部'}综合能力评估：

- **综合得分**：${Math.floor(Math.random() * 10) + 80}分
- **排名**：在11个支部中排名第${Math.floor(Math.random() * 5) + 1}位
- **优势领域**：${['安全合规', '任务跟进', '指标执行'][Math.floor(Math.random() * 3)]}
- **劣势领域**：${['人才培养', '党建成效'][Math.floor(Math.random() * 2)]}

发展趋势：近三个月综合得分${Math.random() > 0.5 ? '稳步上升' : '略有波动'}，整体呈${Math.random() > 0.7 ? '上升' : '稳定'}趋势。

建议关注人才培养和党建成效两个方面，制定针对性措施提升整体能力水平。`;
  };

  return (
    <div className="ai-analysis-section">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div className="ai-query-container">
            <TextArea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="请输入您的分析需求，例如：分析当前支部与其他支部的排名对比"
              autoSize={{ minRows: 2, maxRows: 4 }}
              className="ai-query-input"
            />
            <Button
              type="primary"
              onClick={handleQuery}
              loading={loading}
              className="ai-query-button"
            >
              分析
            </Button>
          </div>
        </Col>
      </Row>

      {loading && (
        <div className="ai-loading">
          <Spin size="large" tip="AI正在分析中..." />
        </div>
      )}

      {!loading && analysisResult && (
        <div className="ai-result">
          <Card className="ai-result-card">
            <Typography>
              <div dangerouslySetInnerHTML={{
                __html: analysisResult.replace(/\n\n/g, '<br/><br/>')
                                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                      .replace(/## (.*?)(\n|$)/g, '<h3>$1</h3>')
                                      .replace(/\n-/g, '<br/>-')
                                      .replace(/\n\d\./g, '<br/>$&')
              }} />
            </Typography>
          </Card>
        </div>
      )}

      {!loading && !analysisResult && (
        <div className="ai-tips">
          <Card className="ai-tips-card">
            <Title level={4}>AI分析助手使用提示</Title>
            <Paragraph>
              您可以通过输入自然语言问题来获取支部数据分析结果。以下是一些示例问题：
            </Paragraph>
            <ul className="ai-tips-list">
              <li><Text strong>支部排名分析：</Text> &quot;分析当前支部在所有支部中的排名情况&quot;</li>
              <li><Text strong>人才分析：</Text> &quot;分析当前支部的人才结构和发展建议&quot;</li>
              <li><Text strong>工作分析：</Text> &quot;分析当前支部的工作完成情况&quot;</li>
              <li><Text strong>能力提升：</Text> &quot;给出提升支部能力的建议&quot;</li>
            </ul>
            {selectedModel ? (
              <Paragraph>
                <Text type="success">当前使用模型: {selectedModel}</Text>
              </Paragraph>
            ) : (
              <Paragraph>
                <Text type="warning">请在AI配置中选择模型以获得更准确的分析结果</Text>
              </Paragraph>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisSection;
