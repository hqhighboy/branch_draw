import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import { Responsive, WidthProvider, Layout as LayoutType } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './DraggableDashboard.css';

// 导入所需的组件
import BasicInfo from './BasicInfo';
import PersonnelAnalysis from './PersonnelAnalysis';
import AnnualWork from './AnnualWork';
import MonthlyWork from './MonthlyWork';

// 响应式网格布局 - 不要明确指定类型，避免类型错误
const ResponsiveGridLayout = WidthProvider(Responsive);

// 定义简化的Branch类型接口，用于Dashboard
interface BranchData {
  id?: string;
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
  annualWork?: any[];
  [key: string]: any; // 添加索引签名，支持其他属性
}

interface DraggableDashboardProps {
  selectedBranch: BranchData | null;
  branches: BranchData[];
  loading?: boolean;
  isDraggable?: boolean;
  onSaveLayout?: (layout: any) => void;
}

const DraggableDashboard: React.FC<DraggableDashboardProps> = ({
  selectedBranch,
  branches,
  loading = false,
  isDraggable = true,
  onSaveLayout
}) => {
  // 默认布局配置
  const defaultLayouts = {
    lg: [
      { i: 'basic-info', x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
      { i: 'personnel-analysis', x: 6, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
      { i: 'annual-work', x: 0, y: 4, w: 6, h: 4, minW: 4, minH: 3 },
      { i: 'radar-chart', x: 6, y: 4, w: 6, h: 4, minW: 4, minH: 3 },
      { i: 'monthly-work', x: 0, y: 8, w: 12, h: 4, minW: 6, minH: 3 },
      { i: 'capability', x: 0, y: 12, w: 12, h: 4, minW: 6, minH: 3 },
      { i: 'ai-analysis', x: 0, y: 16, w: 12, h: 4, minW: 6, minH: 3 }
    ],
    md: [
      { i: 'basic-info', x: 0, y: 0, w: 6, h: 4 },
      { i: 'personnel-analysis', x: 6, y: 0, w: 6, h: 4 },
      { i: 'annual-work', x: 0, y: 4, w: 6, h: 4 },
      { i: 'radar-chart', x: 6, y: 4, w: 6, h: 4 },
      { i: 'monthly-work', x: 0, y: 8, w: 12, h: 4 },
      { i: 'capability', x: 0, y: 12, w: 12, h: 4 },
      { i: 'ai-analysis', x: 0, y: 16, w: 12, h: 4 }
    ],
    sm: [
      { i: 'basic-info', x: 0, y: 0, w: 6, h: 4 },
      { i: 'personnel-analysis', x: 0, y: 4, w: 6, h: 4 },
      { i: 'annual-work', x: 0, y: 8, w: 6, h: 4 },
      { i: 'radar-chart', x: 0, y: 12, w: 6, h: 4 },
      { i: 'monthly-work', x: 0, y: 16, w: 6, h: 4 },
      { i: 'capability', x: 0, y: 20, w: 6, h: 4 },
      { i: 'ai-analysis', x: 0, y: 24, w: 6, h: 4 }
    ],
    xs: [
      { i: 'basic-info', x: 0, y: 0, w: 4, h: 4 },
      { i: 'personnel-analysis', x: 0, y: 4, w: 4, h: 4 },
      { i: 'annual-work', x: 0, y: 8, w: 4, h: 4 },
      { i: 'radar-chart', x: 0, y: 12, w: 4, h: 4 },
      { i: 'monthly-work', x: 0, y: 16, w: 4, h: 4 },
      { i: 'capability', x: 0, y: 20, w: 4, h: 4 },
      { i: 'ai-analysis', x: 0, y: 24, w: 4, h: 4 }
    ]
  };

  // 尝试从localStorage获取保存的布局
  const [layouts, setLayouts] = useState(() => {
    const savedLayouts = localStorage.getItem('dashboardLayouts');
    return savedLayouts ? JSON.parse(savedLayouts) : defaultLayouts;
  });

  // 保存布局到localStorage
  const handleLayoutChange = (currentLayout: LayoutType[], allLayouts: any) => {
    localStorage.setItem('dashboardLayouts', JSON.stringify(allLayouts));
    setLayouts(allLayouts);
    if (onSaveLayout) {
      onSaveLayout(allLayouts);
    }
  };

  // 重置布局
  const resetLayout = () => {
    setLayouts(defaultLayouts);
    localStorage.removeItem('dashboardLayouts');
  };

  // 动态导入组件 - 懒加载可能会导致类型问题
  // 使用React.lazy懒加载组件
  const [LazyComponents, setLazyComponents] = useState<{[key: string]: React.ComponentType<any>}>({});

  // 使用useEffect懒加载组件
  useEffect(() => {
    const loadComponents = async () => {
      const AllBranchesRadarSection = React.lazy(() => import('./AllBranchesRadarSection'));
      const AIAnalysisSection = React.lazy(() => import('./AIAnalysisSection'));
      const EnhancedBranchCapabilitySection = React.lazy(() => import('./EnhancedBranchCapabilitySection'));

      setLazyComponents({
        AllBranchesRadarSection,
        AIAnalysisSection,
        EnhancedBranchCapabilitySection
      });
    };

    loadComponents();
  }, []);

  // 将BranchData转换为各个组件需要的Branch类型
  const convertedBranch = selectedBranch ? {
    id: selectedBranch.id || '',
    name: selectedBranch.name,
    secretary: selectedBranch.secretary,
    deputySecretary: selectedBranch.deputySecretary,
    organizationalCommissioner: selectedBranch.organizationalCommissioner,
    disciplinaryCommissioner: selectedBranch.disciplinaryCommissioner,
    memberCount: selectedBranch.memberCount,
    averageAge: selectedBranch.averageAge,
    honors: selectedBranch.honors ? (Array.isArray(selectedBranch.honors) ? selectedBranch.honors : [selectedBranch.honors]) : [],
    ageDistribution: selectedBranch.ageDistribution,
    educationDistribution: selectedBranch.educationDistribution,
    skillDistribution: selectedBranch.skillDistribution,
    titleDistribution: selectedBranch.titleDistribution,
    annualWork: selectedBranch.annualWork
  } : undefined;

  // 组件内容映射
  const componentMap: { [key: string]: React.ReactNode } = {
    'basic-info': (
      <Card 
        title="支部基本情况" 
        className="dashboard-card"
        extra={<span className="drag-handle">拖动</span>}
      >
        <BasicInfo branch={convertedBranch} />
      </Card>
    ),
    'personnel-analysis': (
      <Card 
        title="人员分析" 
        className="dashboard-card"
        extra={<span className="drag-handle">拖动</span>}
      >
        <PersonnelAnalysis branch={convertedBranch} />
      </Card>
    ),
    'annual-work': (
      <Card 
        title="年度重点工作" 
        className="dashboard-card"
        extra={<span className="drag-handle">拖动</span>}
      >
        <AnnualWork branch={convertedBranch} />
      </Card>
    ),
    'radar-chart': (
      <Card 
        title="支部能力雷达图" 
        className="dashboard-card"
        extra={<span className="drag-handle">拖动</span>}
      >
        <React.Suspense fallback={<div>加载中...</div>}>
          {LazyComponents.AllBranchesRadarSection ? (
            <LazyComponents.AllBranchesRadarSection 
              selectedBranch={convertedBranch}
              branches={branches.map(b => ({id: b.id || '', name: b.name}))}
            />
          ) : (
            <div>加载组件中...</div>
          )}
        </React.Suspense>
      </Card>
    ),
    'monthly-work': (
      <Card 
        title="月度工作完成情况" 
        className="dashboard-card monthly-work-card"
        extra={<span className="drag-handle">拖动</span>}
      >
        <MonthlyWork branches={branches.map(b => ({id: b.id || '', name: b.name}))} />
      </Card>
    ),
    'capability': (
      <Card 
        title="支部能力画像" 
        className="dashboard-card"
        extra={<span className="drag-handle">拖动</span>}
      >
        <React.Suspense fallback={<div>加载中...</div>}>
          {LazyComponents.EnhancedBranchCapabilitySection ? (
            <LazyComponents.EnhancedBranchCapabilitySection 
              selectedBranch={selectedBranch}
              branches={branches.map(b => ({id: b.id || '', name: b.name}))}
            />
          ) : (
            <div>加载组件中...</div>
          )}
        </React.Suspense>
      </Card>
    ),
    'ai-analysis': (
      <Card 
        title="AI分析建议" 
        className="dashboard-card"
        extra={<span className="drag-handle">拖动</span>}
      >
        <React.Suspense fallback={<div>加载中...</div>}>
          {LazyComponents.AIAnalysisSection ? (
            <LazyComponents.AIAnalysisSection 
              branch={selectedBranch}
              branches={branches.map(b => ({id: b.id || '', name: b.name}))}
            />
          ) : (
            <div>加载组件中...</div>
          )}
        </React.Suspense>
      </Card>
    )
  };

  // 创建要放入网格布局的子元素组件
  const gridItems = Object.keys(componentMap).map(key => (
    <div key={key} className="grid-item">
      {componentMap[key]}
    </div>
  ));

  return (
    <div className="draggable-dashboard">
      <div className="dashboard-toolbar">
        <button className="reset-layout-btn" onClick={resetLayout}>
          重置布局
        </button>
        <span className="layout-hint">提示: 拖拽卡片边缘可调整大小，拖拽卡片标题可移动位置</span>
      </div>
      
      {/* @ts-expect-error - children类型兼容性问题 */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 4 }}
        rowHeight={100}
        onLayoutChange={handleLayoutChange}
        isDraggable={isDraggable}
        isResizable={isDraggable}
        draggableHandle=".drag-handle"
        draggableCancel=".non-draggable"
        useCSSTransforms={true}
        margin={[16, 16]}
        containerPadding={[10, 10]}
      >
        {gridItems}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DraggableDashboard; 