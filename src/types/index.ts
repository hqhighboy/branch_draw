/**
 * @file 类型定义文件，集中管理所有类型定义
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 支部类型定义
export interface Branch {
  id: string;
  name: string;
  secretary: string;
  deputySecretary: string;
  memberCount: number;
  foundingDate: string;
  description: string;
  organizationalCommissioner?: string;
  disciplinaryCommissioner?: string;
  propagandaCommissioner?: string;
  learningCommissioner?: string;
  averageAge?: number;
  performance2024?: string;
  secretaryProject?: string;
  honors?: string[] | string;
  ageDistribution?: AgeDistribution[] | Record<string, number>;
  educationDistribution?: EducationDistribution[] | Record<string, number>;
  partyAgeDistribution?: PartyAgeDistribution[];
  positionDistribution?: PositionDistribution[];
  skillDistribution?: Record<string, number>;
  titleDistribution?: Record<string, number>;
  annualWork?: any[];
}



// 支部详情类型定义
export interface BranchDetail extends Branch {
  ageDistribution: AgeDistribution[];
  educationDistribution: EducationDistribution[];
  partyAgeDistribution: PartyAgeDistribution[];
  positionDistribution: PositionDistribution[];
}

// 年龄分布类型
export interface AgeDistribution {
  ageGroup: string;
  count: number;
  percentage: number;
}

// 学历分布类型
export interface EducationDistribution {
  educationLevel: string;
  count: number;
  percentage: number;
}

// 党龄分布类型
export interface PartyAgeDistribution {
  partyAgeGroup: string;
  count: number;
  percentage: number;
}

// 职务分布类型
export interface PositionDistribution {
  position: string;
  count: number;
  percentage: number;
}

// 月度工作类型定义
export interface MonthlyWork {
  branchId: string;
  branchName: string;
  month: number;
  year: number;
  planningCompletion: number;
  executionCompletion: number;
  inspectionCompletion: number;
  evaluationCompletion: number;
  improvementCompletion: number;
}

// 工作类型枚举
export enum WorkType {
  Planning = 'planning',
  Execution = 'execution',
  Inspection = 'inspection',
  Evaluation = 'evaluation',
  Improvement = 'improvement'
}

// 工作类型标签映射
export const WorkTypeLabels: Record<WorkType, string> = {
  [WorkType.Planning]: '月度工作计划',
  [WorkType.Execution]: '计划工作执行',
  [WorkType.Inspection]: '执行情况检查',
  [WorkType.Evaluation]: '工作评价与总结',
  [WorkType.Improvement]: '持续改进工作'
};

// 年度重点工作类型定义
export interface AnnualWork {
  id: string;
  branchId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: WorkStatus;
  completion: number;
  priority: WorkPriority;
}

// 工作状态枚举
export enum WorkStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Completed = 'completed'
}

// 工作状态标签映射
export const WorkStatusLabels: Record<WorkStatus, string> = {
  [WorkStatus.NotStarted]: '未开始',
  [WorkStatus.InProgress]: '进行中',
  [WorkStatus.Completed]: '已完成'
};

// 工作优先级枚举
export enum WorkPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high'
}

// 工作优先级标签映射
export const WorkPriorityLabels: Record<WorkPriority, string> = {
  [WorkPriority.Low]: '低',
  [WorkPriority.Medium]: '中',
  [WorkPriority.High]: '高'
};

// 支部能力画像类型定义
export interface BranchCapability {
  branchId: string;
  branchName: string;
  managementLevel: number;
  kpiExecution: number;
  talentDevelopment: number;
  partyBuilding: number;
  taskFollowUp: number;
  safetyCompliance: number;
  innovationCapability: number;
  teamCollaboration: number;
  resourceUtilization: number;
  overallScore: number;
}

// 能力维度枚举
export enum CapabilityDimension {
  ManagementLevel = 'managementLevel',
  KpiExecution = 'kpiExecution',
  TalentDevelopment = 'talentDevelopment',
  PartyBuilding = 'partyBuilding',
  TaskFollowUp = 'taskFollowUp',
  SafetyCompliance = 'safetyCompliance',
  InnovationCapability = 'innovationCapability',
  TeamCollaboration = 'teamCollaboration',
  ResourceUtilization = 'resourceUtilization'
}

// 能力维度标签映射
export const CapabilityDimensionLabels: Record<CapabilityDimension, string> = {
  [CapabilityDimension.ManagementLevel]: '管理水平',
  [CapabilityDimension.KpiExecution]: 'KPI执行',
  [CapabilityDimension.TalentDevelopment]: '人才培养',
  [CapabilityDimension.PartyBuilding]: '党建工作',
  [CapabilityDimension.TaskFollowUp]: '任务跟进',
  [CapabilityDimension.SafetyCompliance]: '安全合规',
  [CapabilityDimension.InnovationCapability]: '创新能力',
  [CapabilityDimension.TeamCollaboration]: '团队协作',
  [CapabilityDimension.ResourceUtilization]: '资源利用'
};

// AI分析结果类型定义
export interface AIAnalysisResult {
  branchId: string;
  analysisText: string;
  suggestions: string[];
  timestamp: string;
}

// AI模型配置类型定义
export interface AIModelConfig {
  modelName: string;
  apiKey?: string;
  apiBaseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

// 图表颜色配置
export const ChartColors = {
  primary: 'rgba(24, 144, 255, 0.8)',
  success: 'rgba(82, 196, 26, 0.8)',
  warning: 'rgba(250, 173, 20, 0.8)',
  error: 'rgba(245, 34, 45, 0.8)',
  purple: 'rgba(114, 46, 209, 0.8)',
  cyan: 'rgba(19, 194, 194, 0.8)',
  magenta: 'rgba(235, 47, 150, 0.8)',
  volcano: 'rgba(250, 84, 28, 0.8)',
  orange: 'rgba(250, 140, 22, 0.8)',
  gold: 'rgba(250, 219, 20, 0.8)',
  lime: 'rgba(160, 217, 17, 0.8)',
  green: 'rgba(82, 196, 26, 0.8)',
  blue: 'rgba(24, 144, 255, 0.8)',
  geekblue: 'rgba(47, 84, 235, 0.8)',
  purple2: 'rgba(114, 46, 209, 0.8)'
};

// 工作类型颜色映射
export const WorkTypeColors: Record<WorkType, { bg: string; border: string }> = {
  [WorkType.Planning]: {
    bg: 'rgba(65, 148, 246, 0.8)',
    border: 'rgba(65, 148, 246, 1)'
  },
  [WorkType.Execution]: {
    bg: 'rgba(75, 192, 120, 0.8)',
    border: 'rgba(75, 192, 120, 1)'
  },
  [WorkType.Inspection]: {
    bg: 'rgba(255, 206, 86, 0.8)',
    border: 'rgba(255, 206, 86, 1)'
  },
  [WorkType.Evaluation]: {
    bg: 'rgba(255, 99, 132, 0.8)',
    border: 'rgba(255, 99, 132, 1)'
  },
  [WorkType.Improvement]: {
    bg: 'rgba(153, 102, 255, 0.8)',
    border: 'rgba(153, 102, 255, 1)'
  }
};
