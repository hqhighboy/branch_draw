import { BranchCapabilityData, BranchCapabilityModel } from '../interfaces/BranchCapability';

// 生成模拟数据
const generateMockData = (): BranchCapabilityModel => {
  const branchNames = [
    '党建人事党支部',
    '综合党支部',
    '生技党支部',
    '安监党支部',
    '数字运行部党支部',
    '检修试验党支部',
    '继保自动化党支部',
    '500千伏科北数字巡维中心党支部',
    '500千伏北郊数字巡维中心党支部',
    '220千伏罗涌数字巡维中心党支部',
    '220千伏田心数字巡维中心党支部'
  ];

  const dimensions = [
    '组织管理水平',
    '考核指标执行',
    '人才培养创新',
    '党建基础工作',
    '任务跟进落实',
    '安全廉洁底线',
    '群众满意度',
    '管理赋值'
  ];

  const trends = ['up', 'down', 'stable'];
  const grades = ['A+', 'A', 'B+', 'B', 'C'];
  const tags = [
    '进取型', '创新型', '攻坚型', '高效型', '人才摇篮',
    '执行力强', '党建扎实', '安全意识高', '任务落实好', '管理规范'
  ];

  const months = ['1月', '2月', '3月', '4月', '5月', '6月'];

  const branches: BranchCapabilityData[] = branchNames.map((name, index) => {
    // 基础评价维度
    const organizationManagement = {
      name: '组织管理水平',
      score: Math.floor(Math.random() * 15) + 75,
      weight: 0.15,
      weightedScore: 0,
      grade: grades[Math.floor(Math.random() * grades.length)],
      trend: trends[Math.floor(Math.random() * trends.length)] as 'up' | 'down' | 'stable'
    };

    const kpiExecution = {
      name: '考核指标执行',
      score: Math.floor(Math.random() * 15) + 75,
      weight: 0.15,
      weightedScore: 0,
      grade: grades[Math.floor(Math.random() * grades.length)],
      trend: trends[Math.floor(Math.random() * trends.length)] as 'up' | 'down' | 'stable'
    };

    const talentDevelopment = {
      name: '人才培养创新',
      score: Math.floor(Math.random() * 15) + 75,
      weight: 0.15,
      weightedScore: 0,
      grade: grades[Math.floor(Math.random() * grades.length)],
      trend: trends[Math.floor(Math.random() * trends.length)] as 'up' | 'down' | 'stable'
    };

    const partyBuilding = {
      name: '党建基础工作',
      score: Math.floor(Math.random() * 15) + 75,
      weight: 0.15,
      weightedScore: 0,
      grade: grades[Math.floor(Math.random() * grades.length)],
      trend: trends[Math.floor(Math.random() * trends.length)] as 'up' | 'down' | 'stable'
    };

    const taskFollowUp = {
      name: '任务跟进落实',
      score: Math.floor(Math.random() * 15) + 75,
      weight: 0.15,
      weightedScore: 0,
      grade: grades[Math.floor(Math.random() * grades.length)],
      trend: trends[Math.floor(Math.random() * trends.length)] as 'up' | 'down' | 'stable'
    };

    const safetyCompliance = {
      name: '安全廉洁底线',
      score: Math.floor(Math.random() * 15) + 75,
      weight: 0.15,
      weightedScore: 0,
      grade: grades[Math.floor(Math.random() * grades.length)],
      trend: trends[Math.floor(Math.random() * trends.length)] as 'up' | 'down' | 'stable'
    };

    const satisfaction = {
      name: '群众满意度',
      score: Math.floor(Math.random() * 15) + 75,
      weight: 0.10,
      weightedScore: 0,
      grade: grades[Math.floor(Math.random() * grades.length)],
      trend: trends[Math.floor(Math.random() * trends.length)] as 'up' | 'down' | 'stable'
    };

    // 计算加权得分
    organizationManagement.weightedScore = organizationManagement.score * organizationManagement.weight;
    kpiExecution.weightedScore = kpiExecution.score * kpiExecution.weight;
    talentDevelopment.weightedScore = talentDevelopment.score * talentDevelopment.weight;
    partyBuilding.weightedScore = partyBuilding.score * partyBuilding.weight;
    taskFollowUp.weightedScore = taskFollowUp.score * taskFollowUp.weight;
    safetyCompliance.weightedScore = safetyCompliance.score * safetyCompliance.weight;
    satisfaction.weightedScore = satisfaction.score * satisfaction.weight;

    // 基础评价总分
    const baseScore = parseFloat((
      organizationManagement.weightedScore +
      kpiExecution.weightedScore +
      talentDevelopment.weightedScore +
      partyBuilding.weightedScore +
      taskFollowUp.weightedScore +
      safetyCompliance.weightedScore +
      satisfaction.weightedScore
    ).toFixed(1));

    // 基础评价等级
    let baseGrade = 'C';
    if (baseScore >= 90) baseGrade = 'A+';
    else if (baseScore >= 80) baseGrade = 'A';
    else if (baseScore >= 70) baseGrade = 'B+';
    else if (baseScore >= 60) baseGrade = 'B';

    // 管理赋值
    const managementScores = [
      {
        id: `ms-${index}-1`,
        type: '特殊贡献赋值' as const,
        score: Math.floor(Math.random() * 5),
        reason: '抗洪抢险表现突出',
        evaluator: '张三',
        evaluationDate: '2023-05-10',
        approvalStatus: 'approved' as const
      },
      {
        id: `ms-${index}-2`,
        type: '创新工作赋值' as const,
        score: Math.floor(Math.random() * 3),
        reason: '党建工作创新',
        evaluator: '李四',
        evaluationDate: '2023-05-12',
        approvalStatus: 'approved' as const
      },
      {
        id: `ms-${index}-3`,
        type: '战略任务赋值' as const,
        score: Math.floor(Math.random() * 5),
        reason: '重点项目推进',
        evaluator: '王五',
        evaluationDate: '2023-05-15',
        approvalStatus: 'approved' as const
      }
    ];

    // 管理赋值总分
    const managementScore = parseFloat(managementScores.reduce((sum, item) => sum + item.score, 0).toFixed(1));

    // 综合得分
    const totalScore = parseFloat((baseScore * 0.8 + managementScore * 2).toFixed(1));

    // 综合等级
    let grade = 'C';
    if (totalScore >= 90) grade = 'A+';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 70) grade = 'B+';
    else if (totalScore >= 60) grade = 'B';

    // 随机选择3-5个标签
    const selectedTags: string[] = [];
    const tagCount = Math.floor(Math.random() * 3) + 3; // 3-5个标签
    for (let i = 0; i < tagCount; i++) {
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      if (!selectedTags.includes(randomTag)) {
        selectedTags.push(randomTag);
      }
    }

    // 生成趋势数据
    const baseScores = months.map(() => Math.floor(Math.random() * 15) + 75);
    const managementScoresData = months.map(() => Math.floor(Math.random() * 10));
    const totalScores = months.map((_, i) =>
      parseFloat((baseScores[i] * 0.8 + managementScoresData[i] * 2).toFixed(1))
    );

    return {
      id: index + 1,
      name,
      baseDimensions: {
        organizationManagement,
        kpiExecution,
        talentDevelopment,
        partyBuilding,
        taskFollowUp,
        safetyCompliance,
        satisfaction
      },
      baseScore,
      baseGrade,
      managementScores,
      managementScore,
      totalScore,
      grade,
      tags: selectedTags,
      radarData: {
        labels: dimensions,
        data: [
          organizationManagement.score,
          kpiExecution.score,
          talentDevelopment.score,
          partyBuilding.score,
          taskFollowUp.score,
          safetyCompliance.score,
          satisfaction.score,
          managementScore * 10 // 将管理赋值转换为百分制
        ]
      },
      trendData: {
        months,
        baseScores,
        managementScores: managementScoresData,
        totalScores
      }
    };
  });

  return {
    branches,
    lastUpdated: new Date().toISOString()
  };
};

export const mockBranchCapabilityData = generateMockData();
