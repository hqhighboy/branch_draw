import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Button, Switch, Alert } from 'antd';
import axios from 'axios';
import './DashboardPage.css';

// 常规导入
import BasicInfo from '../components/BasicInfo';
import PersonnelAnalysis from '../components/PersonnelAnalysis';
import AnnualWork from '../components/AnnualWork';
import MonthlyWork from '../components/MonthlyWork';
import AIAnalysisSection from '../components/AIAnalysisSection';

// 公共组件
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import BackToTop from '../components/common/BackToTop';
import BreadcrumbNav from '../components/common/BreadcrumbNav';

// 拖拽式Dashboard组件
import DraggableDashboard from '../components/DraggableDashboard';

// 动态导入雷达图组件、AI分析组件和增强版支部综合能力画像组件
const AllBranchesRadarSection = React.lazy(() => import('../components/AllBranchesRadarSection'));
const AIConfigSection = React.lazy(() => import('../components/AIConfigSection'));
const EnhancedBranchCapabilitySection = React.lazy(() => import('../components/EnhancedBranchCapabilitySection'));

const { Title } = Typography;

// 定义支部数据类型
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

/**
 * 综合仪表盘页面 - 将所有组件整合到一个页面
 */
const DashboardPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<string>('');
  // 添加拖拽模式状态
  const [draggableMode, setDraggableMode] = useState<boolean>(false);
  // 添加提示状态，控制是否显示提示信息
  const [showDragTip, setShowDragTip] = useState<boolean>(true);

  // 获取支部详细信息
  const fetchBranchDetails = async (branchId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/branches/${branchId}`);
      if (response.data) {
        setSelectedBranch(response.data);
      }
    } catch (error) {
      console.error(`获取支部 ${branchId} 详细信息失败:`, error);
      // 使用模拟数据
      const branchName = branches.find(b => b.id === branchId)?.name || '未知支部';
      const mockBranchDetail = {
        id: branchId,
        name: branchName,
        secretary: '张三',
        deputySecretary: '李四',
        organizationalCommissioner: '王五',
        disciplinaryCommissioner: '赵六',
        memberCount: Math.floor(Math.random() * 30) + 20,
        averageAge: Math.floor(Math.random() * 10) + 35,
        honors: [
          "2023年先进基层党组织",
          "2022年优秀党支部",
          "2022年安全生产先进集体"
        ],
        ageDistribution: {
          '18-28岁': Math.floor(Math.random() * 20) + 10,
          '29-35岁': Math.floor(Math.random() * 20) + 20,
          '36-45岁': Math.floor(Math.random() * 20) + 30,
          '46-60岁': Math.floor(Math.random() * 10) + 5
        },
        educationDistribution: {
          '大专及以下': Math.floor(Math.random() * 15) + 5,
          '本科': Math.floor(Math.random() * 30) + 40,
          '硕士': Math.floor(Math.random() * 20) + 10,
          '博士': Math.floor(Math.random() * 10)
        },
        skillDistribution: {
          '初级工': Math.floor(Math.random() * 10) + 5,
          '中级工': Math.floor(Math.random() * 15) + 15,
          '高级工': Math.floor(Math.random() * 20) + 30,
          '技师': Math.floor(Math.random() * 20) + 10,
          '高级技师': Math.floor(Math.random() * 10) + 5
        },
        titleDistribution: {
          '助理工程师': Math.floor(Math.random() * 20) + 10,
          '工程师': Math.floor(Math.random() * 30) + 30,
          '高级工程师': Math.floor(Math.random() * 20) + 10,
          '正高级工程师': Math.floor(Math.random() * 10)
        },
        annualWork: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          title: ['党建工作计划', '党员教育培训', '组织生活会', '党风廉政建设', '党建品牌创建',
                  '党员发展工作', '党建工作考核', '党建工作总结', '党建信息化建设', '党建工作创新'][i],
          description: `${['党建工作计划', '党员教育培训', '组织生活会', '党风廉政建设', '党建品牌创建',
                          '党员发展工作', '党建工作考核', '党建工作总结', '党建信息化建设', '党建工作创新'][i]}相关工作内容描述`,
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          status: ['未开始', '进行中', '已完成', '已延期'][Math.floor(Math.random() * 4)],
          progress: Math.floor(Math.random() * 100)
        }))
      };
      setSelectedBranch(mockBranchDetail as Branch);
    } finally {
      setLoading(false);
    }
  };

  // 获取所有支部数据
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/branches');
        if (response.data && Array.isArray(response.data)) {
          setBranches(response.data);
          // 默认选择第一个支部
          if (response.data.length > 0) {
            fetchBranchDetails(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('获取支部列表失败:', error);
        // 使用模拟数据
        const mockBranches = [
          { id: '1', name: '变电管理二所党支部' },
          { id: '2', name: '党建人事部党支部' },
          { id: '3', name: '数字运行部党支部' },
          { id: '4', name: '检修试验党支部' },
          { id: '5', name: '继保自动化党支部' },
          { id: '6', name: '变电管理一所党支部' },
          { id: '7', name: '变电管理三所党支部' },
          { id: '8', name: '变电管理四所党支部' },
          { id: '9', name: '变电管理五所党支部' },
          { id: '10', name: '变电管理六所党支部' },
          { id: '11', name: '变电管理七所党支部' },
        ];
        setBranches(mockBranches);
        // 默认选择第一个支部
        fetchBranchDetails('1');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 处理支部选择变化
  const handleBranchChange = (branchId: string) => {
    fetchBranchDetails(branchId);
  };

  // 处理布局保存
  const handleSaveLayout = (layout: any) => {
    console.log('Layout saved:', layout);
  };

  // 切换拖拽模式
  const toggleDraggableMode = () => {
    setDraggableMode(!draggableMode);
    // 当开启拖拽模式时，隐藏提示
    if (!draggableMode) {
      setShowDragTip(false);
    }
  };

  // 渲染组件时处理类型问题
  const renderBasicInfo = () => {
    return <BasicInfo branch={selectedBranch || undefined} />;
  };

  const renderPersonnelAnalysis = () => {
    return <PersonnelAnalysis branch={selectedBranch || undefined} />;
  };

  const renderAnnualWork = () => {
    return <AnnualWork branch={selectedBranch || undefined} />;
  };

  return (
    <div className="dashboard-page">
      {loading ? (
        <LoadingState tip="加载中..." size="large" height={400} />
      ) : (
        <>
          <div className="dashboard-header">
            <BreadcrumbNav items={[{ label: '支部分析' }]} />
            <div className="branch-selector-container">
              <span>当前支部：</span>
              <select
                className="branch-selector"
                onChange={(e) => handleBranchChange(e.target.value)}
                value={selectedBranch?.id}
                title="选择支部"
                aria-label="选择支部"
              >
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* 拖拽模式开关 - 独立放置在明显位置 */}
          <div className="view-mode-switch">
            <span>拖拽模式</span>
            <Switch
              checked={draggableMode}
              onChange={toggleDraggableMode}
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
          </div>
          
          {/* 添加拖拽模式提示 */}
          {showDragTip && (
            <div className="drag-tip-container">
              <Alert
                message="提示：请点击右上角的拖拽模式开关，开启后可拖动调整各组件位置和大小"
                type="info"
                showIcon
                closable
                className="drag-mode-tip"
                onClose={() => setShowDragTip(false)}
                action={
                  <Button size="small" type="primary" onClick={toggleDraggableMode}>
                    立即开启
                  </Button>
                }
              />
            </div>
          )}
          
          <div className="dashboard-content">
            {draggableMode ? (
              // 拖拽式Dashboard视图
              <DraggableDashboard
                selectedBranch={selectedBranch}
                branches={branches}
                isDraggable={draggableMode}
                onSaveLayout={handleSaveLayout}
              />
            ) : (
              // 常规Dashboard视图
              <>
                <Row gutter={[16, 16]} className="row-spacing">
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Card title="支部基本情况" className="dashboard-card first-row-card">
                      {renderBasicInfo()}
                    </Card>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Card title="人员分析" className="dashboard-card first-row-card">
                      {renderPersonnelAnalysis()}
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]} className="row-spacing">
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Card title="年度重点工作" className="dashboard-card">
                      {renderAnnualWork()}
                    </Card>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Card title="支部能力雷达图" className="dashboard-card">
                      <React.Suspense fallback={<div>加载中...</div>}>
                        <AllBranchesRadarSection 
                          selectedBranch={selectedBranch || undefined}
                          branches={branches}
                        />
                      </React.Suspense>
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]} className="row-spacing">
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Card title="月度工作完成情况" className="dashboard-card">
                      <MonthlyWork showAllBranches={true} branches={branches} />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]} className="row-spacing">
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Card title="支部能力智能分析" className="dashboard-card">
                      <AIAnalysisSection 
                        branch={selectedBranch} 
                        branches={branches.map(b => ({
                          id: b.id || '',
                          name: b.name
                        }))} 
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </div>
          
          <BackToTop />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
