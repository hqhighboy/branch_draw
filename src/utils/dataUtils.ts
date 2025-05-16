/**
 * @file 数据工具函数
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

import { 
  BranchCapability, 
  AgeDistribution, 
  EducationDistribution,
  PartyAgeDistribution,
  PositionDistribution,
  MonthlyWork,
  WorkType
} from '../types';

/**
 * 格式化百分比
 * @param {number} value 百分比值
 * @param {number} precision 精度，默认为2
 * @returns {string} 格式化后的百分比
 */
export const formatPercentage = (value: number, precision: number = 2): string => {
  return `${value.toFixed(precision)}%`;
};

/**
 * 格式化日期
 * @param {string} dateString 日期字符串
 * @param {string} format 格式，默认为'YYYY-MM-DD'
 * @returns {string} 格式化后的日期
 */
export const formatDate = (dateString: string, format: string = 'YYYY-MM-DD'): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return dateString;
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  let result = format;
  result = result.replace('YYYY', String(year));
  result = result.replace('MM', month);
  result = result.replace('DD', day);
  
  return result;
};

/**
 * 计算平均值
 * @param {number[]} values 数值数组
 * @returns {number} 平均值
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

/**
 * 计算支部能力画像的综合得分
 * @param {BranchCapability} capability 支部能力画像数据
 * @returns {number} 综合得分
 */
export const calculateOverallScore = (capability: Omit<BranchCapability, 'branchId' | 'branchName' | 'overallScore'>): number => {
  const scores = [
    capability.managementLevel,
    capability.kpiExecution,
    capability.talentDevelopment,
    capability.partyBuilding,
    capability.taskFollowUp,
    capability.safetyCompliance,
    capability.innovationCapability,
    capability.teamCollaboration,
    capability.resourceUtilization
  ];
  
  return Math.round(calculateAverage(scores));
};

/**
 * 生成随机的年龄分布数据
 * @param {number} total 总人数
 * @returns {AgeDistribution[]} 年龄分布数据
 */
export const generateRandomAgeDistribution = (total: number): AgeDistribution[] => {
  // 年龄组
  const ageGroups = ['20-30岁', '31-40岁', '41-50岁', '51-60岁', '60岁以上'];
  
  // 生成随机分布
  let remaining = total;
  const distribution: AgeDistribution[] = [];
  
  for (let i = 0; i < ageGroups.length; i++) {
    const isLast = i === ageGroups.length - 1;
    const count = isLast ? remaining : Math.floor(Math.random() * remaining * 0.7);
    
    distribution.push({
      ageGroup: ageGroups[i],
      count,
      percentage: Math.round((count / total) * 100)
    });
    
    remaining -= count;
    
    if (remaining <= 0) break;
  }
  
  return distribution;
};

/**
 * 生成随机的学历分布数据
 * @param {number} total 总人数
 * @returns {EducationDistribution[]} 学历分布数据
 */
export const generateRandomEducationDistribution = (total: number): EducationDistribution[] => {
  // 学历级别
  const educationLevels = ['高中及以下', '大专', '本科', '硕士', '博士'];
  
  // 生成随机分布
  let remaining = total;
  const distribution: EducationDistribution[] = [];
  
  for (let i = 0; i < educationLevels.length; i++) {
    const isLast = i === educationLevels.length - 1;
    const count = isLast ? remaining : Math.floor(Math.random() * remaining * 0.7);
    
    distribution.push({
      educationLevel: educationLevels[i],
      count,
      percentage: Math.round((count / total) * 100)
    });
    
    remaining -= count;
    
    if (remaining <= 0) break;
  }
  
  return distribution;
};

/**
 * 生成随机的党龄分布数据
 * @param {number} total 总人数
 * @returns {PartyAgeDistribution[]} 党龄分布数据
 */
export const generateRandomPartyAgeDistribution = (total: number): PartyAgeDistribution[] => {
  // 党龄组
  const partyAgeGroups = ['1-5年', '6-10年', '11-15年', '16-20年', '20年以上'];
  
  // 生成随机分布
  let remaining = total;
  const distribution: PartyAgeDistribution[] = [];
  
  for (let i = 0; i < partyAgeGroups.length; i++) {
    const isLast = i === partyAgeGroups.length - 1;
    const count = isLast ? remaining : Math.floor(Math.random() * remaining * 0.7);
    
    distribution.push({
      partyAgeGroup: partyAgeGroups[i],
      count,
      percentage: Math.round((count / total) * 100)
    });
    
    remaining -= count;
    
    if (remaining <= 0) break;
  }
  
  return distribution;
};

/**
 * 生成随机的职务分布数据
 * @param {number} total 总人数
 * @returns {PositionDistribution[]} 职务分布数据
 */
export const generateRandomPositionDistribution = (total: number): PositionDistribution[] => {
  // 职务
  const positions = ['普通党员', '组织委员', '宣传委员', '纪检委员', '支部书记', '副书记'];
  
  // 生成随机分布
  let remaining = total;
  const distribution: PositionDistribution[] = [];
  
  for (let i = 0; i < positions.length; i++) {
    const isLast = i === positions.length - 1;
    const count = isLast ? remaining : (i === 0 ? Math.floor(remaining * 0.7) : Math.floor(Math.random() * remaining * 0.3));
    
    distribution.push({
      position: positions[i],
      count,
      percentage: Math.round((count / total) * 100)
    });
    
    remaining -= count;
    
    if (remaining <= 0) break;
  }
  
  return distribution;
};

/**
 * 生成随机的月度工作数据
 * @param {string} branchId 支部ID
 * @param {string} branchName 支部名称
 * @param {number} year 年份
 * @param {number} month 月份
 * @returns {MonthlyWork} 月度工作数据
 */
export const generateRandomMonthlyWork = (
  branchId: string,
  branchName: string,
  year: number,
  month: number
): MonthlyWork => {
  return {
    branchId,
    branchName,
    month,
    year,
    planningCompletion: Math.floor(Math.random() * 40) + 60,
    executionCompletion: Math.floor(Math.random() * 40) + 60,
    inspectionCompletion: Math.floor(Math.random() * 40) + 60,
    evaluationCompletion: Math.floor(Math.random() * 40) + 60,
    improvementCompletion: Math.floor(Math.random() * 40) + 60
  };
};

/**
 * 获取工作类型的颜色
 * @param {WorkType} workType 工作类型
 * @returns {Object} 颜色对象，包含背景色和边框色
 */
export const getWorkTypeColor = (workType: WorkType): { bg: string; border: string } => {
  switch (workType) {
    case WorkType.Planning:
      return { bg: 'rgba(65, 148, 246, 0.8)', border: 'rgba(65, 148, 246, 1)' };
    case WorkType.Execution:
      return { bg: 'rgba(75, 192, 120, 0.8)', border: 'rgba(75, 192, 120, 1)' };
    case WorkType.Inspection:
      return { bg: 'rgba(255, 206, 86, 0.8)', border: 'rgba(255, 206, 86, 1)' };
    case WorkType.Evaluation:
      return { bg: 'rgba(255, 99, 132, 0.8)', border: 'rgba(255, 99, 132, 1)' };
    case WorkType.Improvement:
      return { bg: 'rgba(153, 102, 255, 0.8)', border: 'rgba(153, 102, 255, 1)' };
    default:
      return { bg: 'rgba(200, 200, 200, 0.8)', border: 'rgba(200, 200, 200, 1)' };
  }
};
