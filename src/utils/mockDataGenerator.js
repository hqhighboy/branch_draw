/**
 * 生成随机数据工具函数
 */

// 生成随机整数
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 生成随机浮点数（保留1位小数）
const getRandomFloat = (min, max) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
};

// 生成随机颜色
const getRandomColor = (opacity = 1) => {
  const r = getRandomInt(0, 255);
  const g = getRandomInt(0, 255);
  const b = getRandomInt(0, 255);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// 生成随机状态
const getRandomStatus = () => {
  const statuses = ['未开始', '进行中', '已完成', '已延期', '已取消'];
  const weights = [0.1, 0.5, 0.2, 0.1, 0.1]; // 权重，使"进行中"出现概率更高

  let random = Math.random();
  let sum = 0;

  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random < sum) {
      return statuses[i];
    }
  }

  return statuses[0];
};

// 生成随机日期（在指定范围内）
const getRandomDate = (start, end) => {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  const randomDate = new Date(startDate + Math.random() * (endDate - startDate));

  return `${randomDate.getFullYear()}-${String(randomDate.getMonth() + 1).padStart(2, '0')}-${String(randomDate.getDate()).padStart(2, '0')}`;
};

// 生成支部基本信息
const generateBranchBasicInfo = (id, name) => {
  const secretaries = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
  const titles = ['高级工程师', '工程师', '高级技师', '技师', '主任', '副主任', '主管', '专员'];

  return {
    id,
    name,
    secretary: secretaries[getRandomInt(0, secretaries.length - 1)],
    deputySecretary: secretaries[getRandomInt(0, secretaries.length - 1)],
    organizationalCommissioner: secretaries[getRandomInt(0, secretaries.length - 1)],
    disciplinaryCommissioner: secretaries[getRandomInt(0, secretaries.length - 1)],
    propagandaCommissioner: secretaries[getRandomInt(0, secretaries.length - 1)],
    learningCommissioner: secretaries[getRandomInt(0, secretaries.length - 1)],
    memberCount: getRandomInt(15, 50),
    averageAge: getRandomInt(30, 45),
    secretaryTitle: titles[getRandomInt(0, titles.length - 1)],
    deputySecretaryTitle: titles[getRandomInt(0, titles.length - 1)],
    honors: [
      "2023年先进基层党组织",
      "2022年优秀党支部",
      "2022年安全生产先进集体",
      "2021年技术创新示范单位",
      "2021年党建工作示范点"
    ].slice(0, getRandomInt(2, 5))
  };
};

// 生成人员分析数据
const generatePersonnelAnalysisData = () => {
  return {
    ageDistribution: {
      '18-28岁': getRandomInt(10, 30),
      '29-35岁': getRandomInt(20, 40),
      '36-45岁': getRandomInt(20, 40),
      '46-60岁': getRandomInt(5, 20)
    },
    educationDistribution: {
      '大专及以下': getRandomInt(5, 20),
      '本科': getRandomInt(40, 70),
      '硕士': getRandomInt(10, 30),
      '博士': getRandomInt(0, 10)
    },
    skillDistribution: {
      '初级工': getRandomInt(5, 15),
      '中级工': getRandomInt(15, 30),
      '高级工': getRandomInt(30, 50),
      '技师': getRandomInt(10, 30),
      '高级技师': getRandomInt(5, 15)
    },
    titleDistribution: {
      '助理工程师': getRandomInt(10, 30),
      '工程师': getRandomInt(30, 60),
      '高级工程师': getRandomInt(10, 30),
      '正高级工程师': getRandomInt(0, 10)
    }
  };
};

// 生成年度工作数据
const generateAnnualWorkData = () => {
  const workTasks = [
    '党建工作计划',
    '党员教育培训',
    '组织生活会',
    '党风廉政建设',
    '党建品牌创建',
    '党员发展工作',
    '党建工作考核',
    '党建工作总结',
    '党建信息化建设',
    '党建工作创新',
    '主题党日活动',
    '党员先锋岗创建',
    '党员责任区建设',
    '党员示范岗评选',
    '党建与业务融合'
  ];

  const currentYear = new Date().getFullYear();

  return Array.from({ length: getRandomInt(8, 12) }, (_, index) => {
    const startMonth = getRandomInt(1, 6);
    const endMonth = getRandomInt(7, 12);

    const status = getRandomStatus();
    let progress = 0;

    if (status === '已完成') {
      progress = 100;
    } else if (status === '进行中') {
      progress = getRandomInt(10, 90);
    } else if (status === '已延期') {
      progress = getRandomInt(30, 70);
    } else if (status === '未开始') {
      progress = 0;
    } else {
      progress = getRandomInt(0, 100);
    }

    return {
      id: index + 1,
      task: workTasks[index % workTasks.length],
      description: `${workTasks[index % workTasks.length]}相关工作内容描述`,
      startTime: `${currentYear}-${String(startMonth).padStart(2, '0')}-01`,
      endTime: `${currentYear}-${String(endMonth).padStart(2, '0')}-30`,
      status,
      progress
    };
  });
};

// 生成雷达图数据
const generateRadarData = () => {
  return {
    labels: ['管理水平', '指标执行', '人才培养', '党建成效', '任务跟进', '安全合规'],
    data: [
      getRandomInt(70, 95),
      getRandomInt(70, 95),
      getRandomInt(70, 95),
      getRandomInt(70, 95),
      getRandomInt(70, 95),
      getRandomInt(70, 95)
    ]
  };
};

// 生成随机评分
export const generateRandomScores = (model) => {
  // 深拷贝模型以避免修改原始对象
  const scoredModel = JSON.parse(JSON.stringify(model));

  // 为每个维度生成随机分数
  scoredModel.dimensions.forEach(dimension => {
    // 为每个指标生成随机分数
    dimension.indicators.forEach(indicator => {
      indicator.score = getRandomInt(60, 100);
    });

    // 计算维度得分 (基于指标得分的加权平均)
    let totalWeight = 0;
    let weightedScore = 0;

    dimension.indicators.forEach(indicator => {
      totalWeight += indicator.weight;
      weightedScore += indicator.score * indicator.weight;
    });

    dimension.score = totalWeight > 0 ? weightedScore / totalWeight : 0;
  });

  // 计算总分 (基于维度得分的加权平均)
  let totalWeight = 0;
  let weightedScore = 0;

  scoredModel.dimensions.forEach(dimension => {
    totalWeight += dimension.weight;
    weightedScore += dimension.score * dimension.weight;
  });

  scoredModel.totalScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

  return scoredModel;
};

// 生成所有支部的评价数据
export const generateBranchesEvaluationData = (model, branchCount = 11) => {
  const branchesData = {};

  // 为每个支部生成数据
  for (let i = 1; i <= branchCount; i++) {
    const branchId = `${i}`;
    branchesData[branchId] = generateRandomScores(model);
  }

  return branchesData;
};

// 生成历史数据
export const generateHistoricalData = (model, branchId, monthCount = 6) => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const currentMonth = new Date().getMonth();

  const historicalData = [];

  // 生成过去几个月的数据
  for (let i = 0; i < monthCount; i++) {
    const monthIndex = (currentMonth - i + 12) % 12; // 处理跨年的情况

    historicalData.push({
      month: months[monthIndex],
      data: generateRandomScores(model)
    });
  }

  return historicalData;
};

// 生成完整的支部数据
export const generateBranchData = (id, name) => {
  const basicInfo = generateBranchBasicInfo(id, name);
  const personnelData = generatePersonnelAnalysisData();
  const annualWork = generateAnnualWorkData();
  const radarData = generateRadarData();

  return {
    ...basicInfo,
    ...personnelData,
    annualWork,
    radarData
  };
};

// 导出函数
export {
  getRandomInt,
  getRandomFloat,
  getRandomColor,
  getRandomStatus,
  getRandomDate,
  generateBranchBasicInfo,
  generatePersonnelAnalysisData,
  generateAnnualWorkData,
  generateRadarData
};
