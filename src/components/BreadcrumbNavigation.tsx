import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

interface BreadcrumbNavigationProps {
  currentSection: string;
  subSection?: string;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  currentSection,
  subSection
}) => {
  // 映射部分名称为更友好的显示名称
  const getSectionName = (key: string): string => {
    const sectionMap: Record<string, string> = {
      'overview': '支部概览',
      'personnel': '人员分析',
      'work': '工作计划',
      'annual-work': '年度工作',
      'monthly-work': '月度工作',
      'capability': '能力画像',
      'all-branches': '全部支部视图',
      'monthly-view': '月度工作视图',
      'bar-view': '柱状图视图',
      'card-view': '卡片视图',
      'heatmap-view': '热力图视图',
      'trend-view': '趋势图视图',
      'radar-view': '雷达图视图',
      'all-branches-radar': '11个支部雷达图',
      'simple-branch-radar': '支部雷达图',
      'radar-demo': '雷达图演示',
      'data-management': '数据管理',
      'party-member-import': '党员数据导入',
      'template-manager': '模板管理',
      'employee-uploader': '员工数据上传',
      'settings': '系统设置',
      'user': '用户信息'
    };

    return sectionMap[key] || key;
  };

  // 获取父级部分
  const getParentSection = (key: string): string | null => {
    const parentMap: Record<string, string> = {
      'annual-work': 'work',
      'monthly-work': 'work',
      'all-branches': 'capability',
      'monthly-view': 'capability',
      'bar-view': 'capability',
      'card-view': 'capability',
      'heatmap-view': 'capability',
      'trend-view': 'capability',
      'radar-view': 'capability',
      'party-member-import': 'data-management',
      'template-manager': 'data-management',
      'employee-uploader': 'data-management'
    };

    return parentMap[key] || null;
  };

  // 构建面包屑项
  const buildBreadcrumbItems = () => {
    const items = [
      {
        title: <HomeOutlined />,
        key: 'home'
      },
      {
        title: getSectionName(currentSection),
        key: currentSection
      }
    ];

    // 如果有子部分，添加到面包屑
    if (subSection) {
      items.push({
        title: getSectionName(subSection),
        key: subSection
      });
    }
    // 如果当前部分有父级，在当前部分前添加父级
    else {
      const parentSection = getParentSection(currentSection);
      if (parentSection) {
        items.splice(1, 0, {
          title: getSectionName(parentSection),
          key: parentSection
        });
      }
    }

    return items;
  };

  return (
    <Breadcrumb
      items={buildBreadcrumbItems()}
      style={{
        margin: '16px 0',
        fontSize: '14px'
      }}
    />
  );
};

export default BreadcrumbNavigation;
