/**
 * @file 仪表盘页面组件
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card } from 'antd';
import { BranchProvider } from '../../context/BranchContext';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';
import SideNavigation from '../../components/SideNavigation';
import BasicInfo from '../../components/BasicInfo';
import PersonnelAnalysis from '../../components/PersonnelAnalysis';
import AnnualWork from '../../components/AnnualWork';
import MonthlyWork from '../../components/MonthlyWork';
import BranchCapability from '../../components/BranchCapability';
import AllBranchesRadarView from '../../components/AllBranchesRadarView';
import AIConfig from '../../components/AIConfig';
import AIAnalysis from '../../components/AIAnalysis';
import BackToTop from '../../components/common/BackToTop';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import './DashboardPage.css';

const { Content } = Layout;

/**
 * 仪表盘页面组件
 * @returns {JSX.Element} 仪表盘页面组件
 */
const DashboardPage: React.FC = () => {
  // 状态
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [currentSection, setCurrentSection] = useState<string>('dashboard');

  // 创建一个空的 Branch 对象
  const emptyBranch = {
    id: '',
    name: '',
    secretary: '',
    deputySecretary: '',
    memberCount: 0,
    foundingDate: '',
    description: ''
  };

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-theme');
    }
  }, []);

  /**
   * 处理主题切换
   * @param {boolean} checked 是否为深色模式
   */
  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  /**
   * 处理退出登录
   */
  const handleLogout = () => {
    console.log('退出登录');
  };

  /**
   * 处理模型选择
   * @param {string} model 选中的模型名称
   */
  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
  };

  return (
    <BranchProvider>
      <Layout className={`dashboard-layout ${isDarkMode ? 'dark-theme' : ''}`}>
        <AppHeader
          username="管理员"
          isDarkMode={isDarkMode}
          onThemeChange={handleThemeChange}
          onLogout={handleLogout}
        />

        <Layout>
          <SideNavigation
            currentSection={currentSection}
            onNavigate={(key) => setCurrentSection(key)}
          />

          <Content className="dashboard-content">
            {/* 第一行 - 支部基本情况、支部人员分析、年度重点工作 */}
            <Row gutter={[16, 16]} className="row-spacing">
              <Col xs={24} md={8}>
                <ErrorBoundary>
                  <Card title="支部基本情况" className="dashboard-card first-row-card">
                    <BasicInfo branch={emptyBranch} />
                  </Card>
                </ErrorBoundary>
              </Col>
              <Col xs={24} md={8}>
                <ErrorBoundary>
                  <Card title="支部人员分析" className="dashboard-card first-row-card">
                    <PersonnelAnalysis branch={emptyBranch} vertical={true} />
                  </Card>
                </ErrorBoundary>
              </Col>
              <Col xs={24} md={8}>
                <ErrorBoundary>
                  <Card title="年度重点工作" className="dashboard-card first-row-card">
                    <AnnualWork branch={emptyBranch} />
                  </Card>
                </ErrorBoundary>
              </Col>
            </Row>

            {/* 第二行 - 11个支部雷达图 */}
            <Row gutter={[16, 16]} className="row-spacing">
              <Col xs={24}>
                <ErrorBoundary>
                  <AllBranchesRadarView />
                </ErrorBoundary>
              </Col>
            </Row>

            {/* 第三行 - 月度工作完成情况 */}
            <Row gutter={[16, 16]} className="row-spacing">
              <Col xs={24}>
                <ErrorBoundary>
                  <Card title="月度工作完成情况" className="dashboard-card monthly-work-card">
                    <MonthlyWork branches={[]} showAllBranches={true} />
                  </Card>
                </ErrorBoundary>
              </Col>
            </Row>

            {/* 第四行 - 支部综合能力画像 */}
            <Row gutter={[16, 16]} className="row-spacing">
              <Col span={24}>
                <ErrorBoundary>
                  <BranchCapability />
                </ErrorBoundary>
              </Col>
            </Row>

            {/* 第四行 - AI配置和AI分析 */}
            <Row gutter={[16, 16]} className="row-spacing">
              <Col xs={24} md={8}>
                <ErrorBoundary>
                  <AIConfig onModelSelect={handleModelSelect} />
                </ErrorBoundary>
              </Col>
              <Col xs={24} md={16}>
                <ErrorBoundary>
                  <AIAnalysis selectedModel={selectedModel} />
                </ErrorBoundary>
              </Col>
            </Row>
          </Content>
        </Layout>

        <AppFooter isDarkMode={isDarkMode} />
        <BackToTop />
      </Layout>
    </BranchProvider>
  );
};

export default DashboardPage;
