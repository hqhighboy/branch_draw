import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Button,
  Select,
  DatePicker,
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Tag,
  Modal,
  message
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  PlusOutlined,
  RadarChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  HeatMapOutlined,
  AppstoreOutlined,
  ScheduleOutlined,
  TableOutlined,
  RobotOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { RangePickerProps } from 'antd/es/date-picker';
import axios from 'axios';
import dayjs from 'dayjs';

// 导入组件
import RadarChartView from './RadarChartView';
import BarChartView from './BarChartView';
import TrendChartView from './TrendChartView';
import HeatMapView from './HeatMapView';
import CardView from './CardView';
import MonthlyWorkCompletionView from './MonthlyWorkCompletionView';
import CompactBranchCapabilityView from './CompactBranchCapabilityView';
import ManagementScoreForm from './ManagementScoreForm';
import AIAnalysisPanel from './AIAnalysisPanel';
import AIConfigManager from './AIConfigManager';

// 导入样式
import './BranchCapabilityDashboard.css';

// 导入接口和模拟数据
import { BranchCapabilityData } from '../interfaces/BranchCapability';
import { mockBranchCapabilityData } from '../data/mockBranchCapabilityData';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface BranchCapabilityDashboardProps {
  apiBaseUrl?: string;
  initialView?: string;
}

const BranchCapabilityDashboard: React.FC<BranchCapabilityDashboardProps> = ({
  apiBaseUrl = 'http://localhost:3002', // 确保后端使用3002端口
  initialView = 'compact' // 默认视图为全部支部视图
}) => {
  // 状态
  const [activeView, setActiveView] = useState<string>(initialView);
  const [branchesData, setBranchesData] = useState<BranchCapabilityData[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs()
  ]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [scoreFormVisible, setScoreFormVisible] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 获取支部综合能力画像数据
  useEffect(() => {
    setLoading(true);
    // 实际项目中应该调用API获取数据
    // axios.get(`${apiBaseUrl}/api/branch-capability`)
    //   .then(response => {
    //     setBranchesData(response.data.branches);
    //     if (response.data.branches.length > 0) {
    //       setSelectedBranchId(response.data.branches[0].id);
    //     }
    //   })
    //   .catch(error => {
    //     console.error('获取支部综合能力画像数据失败:', error);
    //     message.error('获取数据失败，使用模拟数据');
    //     // 使用模拟数据
    //     setBranchesData(mockBranchCapabilityData.branches);
    //     if (mockBranchCapabilityData.branches.length > 0) {
    //       setSelectedBranchId(mockBranchCapabilityData.branches[0].id);
    //     }
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });

    // 使用模拟数据
    setTimeout(() => {
      setBranchesData(mockBranchCapabilityData.branches);
      if (mockBranchCapabilityData.branches.length > 0) {
        setSelectedBranchId(mockBranchCapabilityData.branches[0].id);
      }
      setLoading(false);
    }, 1000);
  }, [apiBaseUrl]);

  // 处理视图切换
  const handleViewChange = (key: string) => {
    setActiveView(key);
  };

  // 处理支部选择
  const handleBranchChange = (value: number) => {
    setSelectedBranchId(value);
  };

  // 处理日期范围选择
  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates) {
      setDateRange([dates[0] as dayjs.Dayjs, dates[1] as dayjs.Dayjs]);
    }
  };

  // 处理维度选择
  const handleDimensionChange = (values: string[]) => {
    setSelectedDimensions(values);
  };

  // 处理添加赋值
  const handleAddScore = () => {
    setScoreFormVisible(true);
  };

  // 处理赋值表单提交
  const handleScoreFormSubmit = (values: any) => {
    console.log('提交赋值:', values);
    // 实际项目中应该调用API保存数据
    // axios.post(`${apiBaseUrl}/api/management-scores`, values)
    //   .then(response => {
    //     message.success('赋值提交成功');
    //     // 刷新数据
    //     // fetchData();
    //   })
    //   .catch(error => {
    //     console.error('赋值提交失败:', error);
    //     message.error('赋值提交失败');
    //   });

    // 模拟提交成功
    message.success('赋值提交成功');
    setScoreFormVisible(false);
  };

  // 处理赋值表单取消
  const handleScoreFormCancel = () => {
    setScoreFormVisible(false);
  };

  // 处理上传文件
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      message.error('请上传Excel文件（.xlsx或.xls格式）');
      return;
    }

    // 创建FormData对象并添加文件
    const formData = new FormData();
    formData.append('file', file);

    // 显示上传中提示
    setIsUploading(true);

    // 实际项目中应该调用API上传文件
    // axios.post(`${apiBaseUrl}/api/upload-capability`, formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data'
    //   }
    // })
    //   .then(response => {
    //     console.log('文件上传成功:', response.data);
    //     message.success(`文件 "${file.name}" 上传成功！支部综合能力画像数据已更新。`);
    //     // 刷新数据
    //     // fetchData();
    //   })
    //   .catch(error => {
    //     console.error('文件上传失败:', error);
    //     message.error('文件上传失败，请重试。');
    //   })
    //   .finally(() => {
    //     setIsUploading(false);
    //     // 清空文件输入，以便可以重复上传同一个文件
    //     if (fileInputRef.current) {
    //       fileInputRef.current.value = '';
    //     }
    //   });

    // 模拟上传成功
    setTimeout(() => {
      message.success(`文件 "${file.name}" 上传成功！支部综合能力画像数据已更新。`);
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 2000);
  };

  // 处理下载模板
  const handleDownloadTemplate = () => {
    // 实际项目中应该调用API下载模板
    // window.open(`${apiBaseUrl}/api/capability-template`, '_blank');

    // 模拟下载
    message.success('模板下载中...');
  };

  // 处理导出报表
  const handleExportReport = () => {
    // 实际项目中应该调用API导出报表
    // window.open(`${apiBaseUrl}/api/export-capability-report`, '_blank');

    // 模拟导出
    message.success('报表导出中...');
  };

  // 获取当前选中的支部数据
  const selectedBranch = branchesData.find(branch => branch.id === selectedBranchId);

  // 获取支部排名数据
  const rankData = branchesData
    .map(branch => ({ name: branch.name, score: branch.totalScore }))
    .sort((a, b) => b.score - a.score);

  // 获取平均水平数据
  const averageData = [
    // 组织管理水平
    parseFloat((branchesData.reduce((sum, branch) => sum + branch.baseDimensions.organizationManagement.score, 0) / branchesData.length).toFixed(1)),
    // 考核指标执行
    parseFloat((branchesData.reduce((sum, branch) => sum + branch.baseDimensions.kpiExecution.score, 0) / branchesData.length).toFixed(1)),
    // 人才培养创新
    parseFloat((branchesData.reduce((sum, branch) => sum + branch.baseDimensions.talentDevelopment.score, 0) / branchesData.length).toFixed(1)),
    // 党建基础工作
    parseFloat((branchesData.reduce((sum, branch) => sum + branch.baseDimensions.partyBuilding.score, 0) / branchesData.length).toFixed(1)),
    // 任务跟进落实
    parseFloat((branchesData.reduce((sum, branch) => sum + branch.baseDimensions.taskFollowUp.score, 0) / branchesData.length).toFixed(1)),
    // 安全廉洁底线
    parseFloat((branchesData.reduce((sum, branch) => sum + branch.baseDimensions.safetyCompliance.score, 0) / branchesData.length).toFixed(1)),
    // 群众满意度
    parseFloat((branchesData.reduce((sum, branch) => sum + branch.baseDimensions.satisfaction.score, 0) / branchesData.length).toFixed(1)),
    // 管理赋值
    parseFloat((branchesData.reduce((sum, branch) => sum + branch.managementScore * 10, 0) / branchesData.length).toFixed(1))
  ];

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

  if (loading) {
    return (
      <div className="branch-capability-dashboard">
        <div className="loading-container">正在加载数据...</div>
      </div>
    );
  }

  return (
    <div className="branch-capability-dashboard">
      <div className="dashboard-header">
        <h2>党支部综合能力画像</h2>
        <div className="view-controls">
          <Tabs defaultActiveKey="compact" onChange={handleViewChange} style={{ width: '100%' }}>
            <TabPane tab={<span><TableOutlined />全部支部视图</span>} key="compact" />
            <TabPane tab={<span><ScheduleOutlined />月度工作视图</span>} key="monthly" />
            <TabPane tab={<span><BarChartOutlined />柱状图视图</span>} key="bar" />
            <TabPane tab={<span><AppstoreOutlined />卡片视图</span>} key="card" />
            <TabPane tab={<span><HeatMapOutlined />热力图视图</span>} key="heatmap" />
            <TabPane tab={<span><LineChartOutlined />趋势图视图</span>} key="trend" />
            <TabPane tab={<span><RadarChartOutlined />雷达图视图</span>} key="radar" />
            <TabPane tab={<span><RobotOutlined />AI分析</span>} key="ai" />
            <TabPane tab={<span><SettingOutlined />AI配置</span>} key="ai-config" />
          </Tabs>
        </div>
        <div className="action-buttons">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            aria-label="上传数据文件"
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
            loading={isUploading}
          >
            导入数据
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            下载模板
          </Button>
          <Button icon={<PlusOutlined />} type="primary" onClick={handleAddScore}>
            添加赋值
          </Button>
        </div>
      </div>

      <div className="dashboard-filters">
        <Select
          placeholder="选择支部"
          style={{ width: 200 }}
          onChange={handleBranchChange}
          value={selectedBranchId}
          disabled={activeView === 'card' || activeView === 'heatmap'}
        >
          {branchesData.map(branch => (
            <Option key={branch.id} value={branch.id}>{branch.name}</Option>
          ))}
        </Select>
        <RangePicker
          onChange={handleDateRangeChange}
          value={[dateRange[0], dateRange[1]]}
          disabled={activeView !== 'trend'}
        />
        <Select
          placeholder="评价维度"
          mode="multiple"
          style={{ width: 300 }}
          onChange={handleDimensionChange}
          value={selectedDimensions}
          disabled={activeView !== 'trend'}
        >
          <Option value="organization">组织管理水平</Option>
          <Option value="kpi">考核指标执行</Option>
          <Option value="talent">人才培养创新</Option>
          <Option value="party">党建基础工作</Option>
          <Option value="task">任务跟进落实</Option>
          <Option value="safety">安全廉洁底线</Option>
          <Option value="satisfaction">群众满意度</Option>
          <Option value="management">管理赋值</Option>
        </Select>
        <Button onClick={handleExportReport}>导出报表</Button>
      </div>

      <div className="dashboard-content">
        {selectedBranch && activeView === 'radar' && (
          <RadarChartView data={selectedBranch} averageData={averageData} />
        )}
        {selectedBranch && activeView === 'bar' && (
          <BarChartView data={selectedBranch} averageData={averageData} rankData={rankData} />
        )}
        {selectedBranch && activeView === 'trend' && (
          <TrendChartView data={selectedBranch} />
        )}
        {activeView === 'heatmap' && (
          <HeatMapView data={branchesData[0]} allBranchesData={branchesData} />
        )}
        {activeView === 'card' && (
          <CardView data={branchesData} />
        )}
        {activeView === 'compact' && (
          <CompactBranchCapabilityView
            data={branchesData}
            onExpandBranch={(branchId) => {
              setSelectedBranchId(branchId);
              setActiveView('radar');
            }}
          />
        )}
        {activeView === 'monthly' && (
          <MonthlyWorkCompletionView data={branchesData} />
        )}
        {selectedBranch && activeView === 'ai' && (
          <AIAnalysisPanel branchData={selectedBranch} apiBaseUrl={apiBaseUrl} />
        )}
        {activeView === 'ai-config' && (
          <AIConfigManager apiBaseUrl={apiBaseUrl} />
        )}
      </div>

      {selectedBranch && activeView !== 'card' && activeView !== 'monthly' && activeView !== 'heatmap' && activeView !== 'compact' && (
        <div className="dashboard-summary">
          <Row gutter={16}>
            <Col span={8}>
              <Card title="基础评价得分" bordered={false}>
                <Statistic
                  value={selectedBranch.baseScore}
                  suffix="/ 100"
                  precision={1}
                  valueStyle={{ color: getScoreColor(selectedBranch.baseScore) }}
                />
                <Progress
                  percent={selectedBranch.baseScore}
                  status="active"
                  strokeColor={getScoreColor(selectedBranch.baseScore)}
                />
                <Tag color={getGradeColor(selectedBranch.baseGrade)}>{selectedBranch.baseGrade}</Tag>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="管理赋值得分" bordered={false}>
                <Statistic
                  value={selectedBranch.managementScore}
                  suffix="/ 10"
                  precision={1}
                  valueStyle={{ color: getScoreColor(selectedBranch.managementScore * 10) }}
                />
                <Progress
                  percent={selectedBranch.managementScore * 10}
                  status="active"
                  strokeColor={getScoreColor(selectedBranch.managementScore * 10)}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="综合能力得分" bordered={false}>
                <Statistic
                  value={selectedBranch.totalScore}
                  suffix="/ 100"
                  precision={1}
                  valueStyle={{ color: getScoreColor(selectedBranch.totalScore) }}
                />
                <Progress
                  percent={selectedBranch.totalScore}
                  status="active"
                  strokeColor={getScoreColor(selectedBranch.totalScore)}
                />
                <Tag color={getGradeColor(selectedBranch.grade)}>{selectedBranch.grade}</Tag>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      <Modal
        title="添加管理赋值"
        open={scoreFormVisible}
        onCancel={handleScoreFormCancel}
        footer={null}
        width={700}
      >
        {selectedBranch && (
          <ManagementScoreForm
            branchId={selectedBranch.id}
            branchName={selectedBranch.name}
            onSubmit={handleScoreFormSubmit}
            onCancel={handleScoreFormCancel}
          />
        )}
      </Modal>
    </div>
  );
};

export default BranchCapabilityDashboard;
