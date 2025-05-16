import { EvaluationModel, calculateDimensionScore, calculateTotalScore } from '../models/evaluationModel';

/**
 * 生成随机评分 (60-100之间)
 */
export const generateRandomScore = (min: number = 60, max: number = 100): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 为评价模型生成随机分数
 */
export const generateRandomScores = (model: EvaluationModel): EvaluationModel => {
  const newModel = JSON.parse(JSON.stringify(model)) as EvaluationModel;
  
  newModel.dimensions.forEach(dimension => {
    dimension.indicators.forEach(indicator => {
      indicator.score = generateRandomScore();
    });
    
    // 计算维度得分
    dimension.score = calculateDimensionScore(dimension);
  });
  
  // 计算总得分
  newModel.totalScore = calculateTotalScore(newModel);
  
  return newModel;
};

/**
 * 生成多个支部的评价数据
 */
export const generateBranchesEvaluationData = (
  model: EvaluationModel, 
  branchCount: number
): Record<string, EvaluationModel> => {
  const branchesData: Record<string, EvaluationModel> = {};
  
  for (let i = 1; i <= branchCount; i++) {
    branchesData[`branch_${i}`] = generateRandomScores(model);
  }
  
  return branchesData;
};

/**
 * 生成历史评价数据 (按月)
 */
export const generateHistoricalData = (
  model: EvaluationModel, 
  branchId: string, 
  months: number
): Array<{month: string, data: EvaluationModel}> => {
  const historicalData = [];
  const currentDate = new Date();
  
  for (let i = 0; i < months; i++) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    historicalData.push({
      month: monthStr,
      data: generateRandomScores(model)
    });
  }
  
  return historicalData;
};

/**
 * 生成相关性矩阵 (用于权重调整)
 */
export const generateCorrelationMatrix = (model: EvaluationModel): Record<string, Record<string, number>> => {
  const matrix: Record<string, Record<string, number>> = {};
  
  model.dimensions.forEach(dimension => {
    matrix[dimension.id] = {};
    
    dimension.indicators.forEach(indicator => {
      // 生成0.3到0.9之间的随机相关系数
      matrix[dimension.id][indicator.id] = 0.3 + Math.random() * 0.6;
    });
  });
  
  return matrix;
};

/**
 * 生成支部排名数据
 */
export const generateRankingData = (branchesData: Record<string, EvaluationModel>): Array<{
  branchId: string;
  totalScore: number;
  dimensionScores: Record<string, number>;
}> => {
  const rankingData = Object.entries(branchesData).map(([branchId, model]) => {
    const dimensionScores: Record<string, number> = {};
    
    model.dimensions.forEach(dimension => {
      dimensionScores[dimension.id] = dimension.score || 0;
    });
    
    return {
      branchId,
      totalScore: model.totalScore || 0,
      dimensionScores
    };
  });
  
  // 按总分排序
  return rankingData.sort((a, b) => b.totalScore - a.totalScore);
};

/**
 * 生成支部对比数据
 */
export const generateComparisonData = (
  branchesData: Record<string, EvaluationModel>,
  branchIds: string[]
): Array<{
  dimensionId: string;
  dimensionName: string;
  branchScores: Record<string, number>;
}> => {
  if (!branchesData || Object.keys(branchesData).length === 0) {
    return [];
  }
  
  // 使用第一个支部的维度作为模板
  const firstBranchId = Object.keys(branchesData)[0];
  const dimensions = branchesData[firstBranchId].dimensions;
  
  return dimensions.map(dimension => {
    const branchScores: Record<string, number> = {};
    
    branchIds.forEach(branchId => {
      if (branchesData[branchId]) {
        const dim = branchesData[branchId].dimensions.find(d => d.id === dimension.id);
        branchScores[branchId] = dim?.score || 0;
      }
    });
    
    return {
      dimensionId: dimension.id,
      dimensionName: dimension.name,
      branchScores
    };
  });
};
