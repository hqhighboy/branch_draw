/**
 * 支部综合能力评价模型
 */

// 定义维度和指标类型
export interface Indicator {
  id: string;
  name: string;
  description: string;
  weight: number;
  score: number;
}

export interface Dimension {
  id: string;
  name: string;
  description: string;
  weight: number;
  indicators: Indicator[];
  score?: number;
}

export interface EvaluationModel {
  dimensions: Dimension[];
  totalScore?: number;
}

// 计算维度得分
export const calculateDimensionScore = (dimension: Dimension): number => {
  if (!dimension.indicators || dimension.indicators.length === 0) {
    return 0;
  }

  let totalScore = 0;
  let totalWeight = 0;

  dimension.indicators.forEach(indicator => {
    totalScore += indicator.score * indicator.weight;
    totalWeight += indicator.weight;
  });

  return totalWeight > 0 ? totalScore / totalWeight : 0;
};

// 计算总得分
export const calculateTotalScore = (model: EvaluationModel): number => {
  if (!model.dimensions || model.dimensions.length === 0) {
    return 0;
  }

  let totalScore = 0;
  let totalWeight = 0;

  model.dimensions.forEach(dimension => {
    const dimensionScore = dimension.score !== undefined 
      ? dimension.score 
      : calculateDimensionScore(dimension);
    
    totalScore += dimensionScore * dimension.weight;
    totalWeight += dimension.weight;
  });

  return totalWeight > 0 ? totalScore / totalWeight : 0;
};

// 动态调整权重
export const adjustWeights = (
  model: EvaluationModel, 
  correlationMatrix: Record<string, Record<string, number>>,
  adjustmentFactor = 0.05
): EvaluationModel => {
  const newModel = JSON.parse(JSON.stringify(model)) as EvaluationModel;
  
  newModel.dimensions.forEach(dimension => {
    // 计算该维度下所有指标的平均相关系数
    const correlations = correlationMatrix[dimension.id] || {};
    const indicatorIds = dimension.indicators.map(ind => ind.id);
    
    let totalCorrelation = 0;
    let count = 0;
    
    indicatorIds.forEach(id => {
      if (correlations[id]) {
        totalCorrelation += correlations[id];
        count++;
      }
    });
    
    const avgCorrelation = count > 0 ? totalCorrelation / count : 0;
    
    // 调整权重
    let totalNewWeight = 0;
    dimension.indicators.forEach(indicator => {
      const correlation = correlations[indicator.id] || 0;
      const adjustment = adjustmentFactor * (correlation - avgCorrelation);
      
      // 确保权重在合理范围内
      const newWeight = Math.max(0.1, Math.min(0.9, indicator.weight + adjustment));
      indicator.weight = newWeight;
      totalNewWeight += newWeight;
    });
    
    // 归一化权重
    if (totalNewWeight > 0) {
      dimension.indicators.forEach(indicator => {
        indicator.weight = indicator.weight / totalNewWeight;
      });
    }
  });
  
  return newModel;
};

// 创建默认评价模型
export const createDefaultEvaluationModel = (): EvaluationModel => {
  return {
    dimensions: [
      {
        id: "M",
        name: "管理水平",
        description: "反映支部的管理水平",
        weight: 0.15,
        indicators: [
          {
            id: "M1",
            name: "组织建设",
            description: "支部组织结构完善度、制度建设情况",
            weight: 0.25,
            score: 0
          },
          {
            id: "M2",
            name: "决策效率",
            description: "重大决策的科学性、及时性",
            weight: 0.25,
            score: 0
          },
          {
            id: "M3",
            name: "资源配置",
            description: "人力资源、物力资源的合理配置",
            weight: 0.25,
            score: 0
          },
          {
            id: "M4",
            name: "沟通协调",
            description: "内部沟通机制、跨部门协作效果",
            weight: 0.25,
            score: 0
          }
        ]
      },
      {
        id: "P",
        name: "指标执行",
        description: "反映支部对于考核指标的执行情况",
        weight: 0.15,
        indicators: [
          {
            id: "P1",
            name: "计划完成率",
            description: "工作计划按时完成比例",
            weight: 0.25,
            score: 0
          },
          {
            id: "P2",
            name: "质量达标率",
            description: "工作质量符合标准比例",
            weight: 0.25,
            score: 0
          },
          {
            id: "P3",
            name: "执行效率",
            description: "任务执行速度与资源利用率",
            weight: 0.25,
            score: 0
          },
          {
            id: "P4",
            name: "问题解决",
            description: "执行过程中问题的解决能力",
            weight: 0.25,
            score: 0
          }
        ]
      },
      {
        id: "T",
        name: "人才培养",
        description: "反映人才培养和创新",
        weight: 0.15,
        indicators: [
          {
            id: "T1",
            name: "人才梯队",
            description: "人才结构合理性、后备人才培养",
            weight: 0.25,
            score: 0
          },
          {
            id: "T2",
            name: "培训效果",
            description: "培训计划执行情况、培训效果评估",
            weight: 0.25,
            score: 0
          },
          {
            id: "T3",
            name: "创新成果",
            description: "创新项目数量、创新成果应用情况",
            weight: 0.25,
            score: 0
          },
          {
            id: "T4",
            name: "技能提升",
            description: "员工技能水平提升情况",
            weight: 0.25,
            score: 0
          }
        ]
      },
      {
        id: "B",
        name: "党建成效",
        description: "反映党建基础是否扎实、发挥作用是否到位",
        weight: 0.15,
        indicators: [
          {
            id: "B1",
            name: "组织生活",
            description: "三会一课执行情况、组织生活规范性",
            weight: 0.25,
            score: 0
          },
          {
            id: "B2",
            name: "思想建设",
            description: "理论学习深度、思想教育效果",
            weight: 0.25,
            score: 0
          },
          {
            id: "B3",
            name: "党员先锋模范作用",
            description: "党员在工作中的表现、先进性体现",
            weight: 0.25,
            score: 0
          },
          {
            id: "B4",
            name: "群众满意度",
            description: "服务群众效果、群众评价",
            weight: 0.25,
            score: 0
          }
        ]
      },
      {
        id: "F",
        name: "任务跟进",
        description: "反映支部对于领导交办任务的跟进情况",
        weight: 0.15,
        indicators: [
          {
            id: "F1",
            name: "响应速度",
            description: "接收任务后的响应时间",
            weight: 0.25,
            score: 0
          },
          {
            id: "F2",
            name: "过程管控",
            description: "任务执行过程中的监控与调整",
            weight: 0.25,
            score: 0
          },
          {
            id: "F3",
            name: "结果反馈",
            description: "任务完成后的及时反馈",
            weight: 0.25,
            score: 0
          },
          {
            id: "F4",
            name: "持续改进",
            description: "根据反馈进行的持续优化",
            weight: 0.25,
            score: 0
          }
        ]
      },
      {
        id: "S",
        name: "安全廉洁",
        description: "反映支部安全安全廉洁底线红线事项",
        weight: 0.10,
        indicators: [
          {
            id: "S1",
            name: "安全生产",
            description: "安全事故发生率、安全培训覆盖率",
            weight: 0.25,
            score: 0
          },
          {
            id: "S2",
            name: "廉洁自律",
            description: "廉洁教育开展情况、违纪违规情况",
            weight: 0.25,
            score: 0
          },
          {
            id: "S3",
            name: "风险防控",
            description: "风险识别与防控措施落实情况",
            weight: 0.25,
            score: 0
          },
          {
            id: "S4",
            name: "合规管理",
            description: "各项工作合规性、制度执行情况",
            weight: 0.25,
            score: 0
          }
        ]
      },
      {
        id: "L",
        name: "管理人员",
        description: "管理人员赋值模式，补充其他未考虑到的方面",
        weight: 0.10,
        indicators: [
          {
            id: "L1",
            name: "领导力评估",
            description: "支部领导班子能力评估",
            weight: 0.25,
            score: 0
          },
          {
            id: "L2",
            name: "战略思维",
            description: "支部发展战略规划能力",
            weight: 0.25,
            score: 0
          },
          {
            id: "L3",
            name: "危机处理",
            description: "突发事件应对能力",
            weight: 0.25,
            score: 0
          },
          {
            id: "L4",
            name: "创新引领",
            description: "管理创新与技术创新推动能力",
            weight: 0.25,
            score: 0
          }
        ]
      },
      {
        id: "D",
        name: "综合发展",
        description: "支部综合发展情况",
        weight: 0.05,
        indicators: [
          {
            id: "D1",
            name: "文化建设",
            description: "支部文化建设情况、价值观认同度",
            weight: 0.25,
            score: 0
          },
          {
            id: "D2",
            name: "社会责任",
            description: "社会责任履行情况、公益活动参与",
            weight: 0.25,
            score: 0
          },
          {
            id: "D3",
            name: "品牌影响",
            description: "支部品牌建设、外部影响力",
            weight: 0.25,
            score: 0
          },
          {
            id: "D4",
            name: "可持续发展",
            description: "长期发展规划、可持续发展能力",
            weight: 0.25,
            score: 0
          }
        ]
      }
    ]
  };
};
