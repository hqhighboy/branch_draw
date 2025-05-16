/**
 * AI服务接口定义
 */

// AI配置接口
export interface AIConfig {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
}

// AI分析结果接口
export interface AIAnalysisResult {
  strengths: string;
  recommendations: string;
  potentialAssessment: string;
  bestPractices: string;
}

// AI预测结果接口
export interface AIPredictionResult {
  scoresTrend: string;
  dimensionsTrend: string;
  keyFactors: string;
  focusAreas: string;
}

// 文档提取数据接口
export interface DocumentExtraction {
  [key: string]: string;
}

// 自然语言查询结果接口
export interface NaturalLanguageQueryResult {
  answer: string;
  confidence: number;
  relatedData?: any;
}

// 改进建议接口
export interface AIRecommendations {
  overallAssessment: string;
  strengths: string;
  weaknesses: string;
  dimensionRecommendations: {
    [key: string]: string;
  };
  bestPractices: string;
  longTermPlan: string;
}

// 比较数据接口
export interface ComparisonData {
  averageBaseScore: number;
  averageTotalScore: number;
  highestScoreBranch: string;
  highestScore: number;
}

// 历史数据点接口
export interface HistoricalDataPoint {
  date: string;
  totalScore: number;
  organizationManagement: number;
  kpiExecution: number;
  talentDevelopment: number;
  partyBuilding?: number;
  taskFollowUp?: number;
  safetyCompliance?: number;
  satisfaction?: number;
}

// AI服务响应接口
export interface AIServiceResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// AI服务错误接口
export interface AIServiceError {
  code: string;
  message: string;
  details?: any;
}
