// 支部综合能力评价接口定义

// 基础评价维度
export interface BaseDimension {
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  grade: string;
  trend: 'up' | 'down' | 'stable';
}

// 管理赋值类型
export type ManagementScoreType = 
  | '特殊贡献赋值' 
  | '创新工作赋值' 
  | '战略任务赋值' 
  | '管理裁量赋值' 
  | '突发事件应对赋值';

// 管理赋值项
export interface ManagementScore {
  id: string;
  type: ManagementScoreType;
  score: number;
  reason: string;
  evaluator: string;
  evaluationDate: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approver?: string;
  approvalDate?: string;
  approvalComment?: string;
}

// 支部综合能力数据
export interface BranchCapabilityData {
  id: number;
  name: string;
  // 基础评价数据
  baseDimensions: {
    organizationManagement: BaseDimension; // 组织管理水平
    kpiExecution: BaseDimension; // 考核指标执行
    talentDevelopment: BaseDimension; // 人才培养创新
    partyBuilding: BaseDimension; // 党建基础工作
    taskFollowUp: BaseDimension; // 任务跟进落实
    safetyCompliance: BaseDimension; // 安全廉洁底线
    satisfaction: BaseDimension; // 群众满意度
  };
  baseScore: number; // 基础评价总分
  baseGrade: string; // 基础评价等级
  
  // 管理赋值数据
  managementScores: ManagementScore[];
  managementScore: number; // 管理赋值总分
  
  // 综合得分
  totalScore: number; // 综合得分
  grade: string; // 综合等级
  
  // 标签
  tags: string[];
  
  // 雷达图数据
  radarData: {
    labels: string[];
    data: number[];
  };
  
  // 趋势数据
  trendData: {
    months: string[];
    baseScores: number[];
    managementScores: number[];
    totalScores: number[];
  };
}

// 支部综合能力评价模型
export interface BranchCapabilityModel {
  branches: BranchCapabilityData[];
  lastUpdated: string;
}
