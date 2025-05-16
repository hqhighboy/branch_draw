/**
 * 创建支部综合能力画像Excel模板
 */

const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// 创建Excel工作簿
function createCapabilityTemplate() {
  // 创建工作簿
  const workbook = xlsx.utils.book_new();

  // 准备支部能力数据
  const capabilityData = [
    // 表头
    [
      '支部ID',
      '支部名称',
      '组织管理水平',
      '考核指标执行',
      '人才培养创新',
      '党建基础工作',
      '任务跟进落实',
      '安全廉洁底线',
      '群众满意度',
      '组织管理水平趋势',
      '考核指标执行趋势',
      '人才培养创新趋势',
      '党建基础工作趋势',
      '任务跟进落实趋势',
      '安全廉洁底线趋势',
      '群众满意度趋势',
      '标签1',
      '标签2',
      '标签3',
      '标签4',
      '标签5',
      '基础评价得分1月',
      '基础评价得分2月',
      '基础评价得分3月',
      '基础评价得分4月',
      '基础评价得分5月',
      '基础评价得分6月',
      '管理赋值得分1月',
      '管理赋值得分2月',
      '管理赋值得分3月',
      '管理赋值得分4月',
      '管理赋值得分5月',
      '管理赋值得分6月',
      '综合得分1月',
      '综合得分2月',
      '综合得分3月',
      '综合得分4月',
      '综合得分5月',
      '综合得分6月'
    ],
    // 示例数据
    [
      1,
      '党建人事党支部',
      85,
      90,
      78,
      88,
      92,
      95,
      82,
      'up',
      'stable',
      'up',
      'up',
      'stable',
      'stable',
      'up',
      '进取型',
      '创新型',
      '攻坚型',
      '高效型',
      '人才摇篮',
      82,
      83,
      85,
      84,
      86,
      88,
      4,
      5,
      6,
      5,
      7,
      8,
      70,
      72,
      74,
      73,
      76,
      78
    ]
  ];

  // 管理赋值数据模板
  const managementScoreData = [
    [
      'ID',
      '支部ID',
      '支部名称',
      '赋值类型',
      '赋值分数',
      '赋值理由',
      '赋值人员',
      '赋值日期',
      '审核状态',
      '审核人',
      '审核日期',
      '审核意见'
    ],
    [
      'ms-1',
      1,
      '党建人事党支部',
      '特殊贡献赋值',
      3,
      '抗洪抢险表现突出',
      '张三',
      '2023-05-10',
      'approved',
      '李四',
      '2023-05-11',
      '同意'
    ],
    [
      'ms-2',
      1,
      '党建人事党支部',
      '创新工作赋值',
      2,
      '党建工作创新',
      '王五',
      '2023-05-12',
      'approved',
      '赵六',
      '2023-05-13',
      '同意'
    ]
  ];

  // 创建工作表
  const capabilitySheet = xlsx.utils.aoa_to_sheet(capabilityData);
  const managementScoreSheet = xlsx.utils.aoa_to_sheet(managementScoreData);

  // 设置列宽
  const capabilityColWidths = [
    { wch: 8 },  // 支部ID
    { wch: 40 }, // 支部名称
    { wch: 15 }, // 组织管理水平
    { wch: 15 }, // 考核指标执行
    { wch: 15 }, // 人才培养创新
    { wch: 15 }, // 党建基础工作
    { wch: 15 }, // 任务跟进落实
    { wch: 15 }, // 安全廉洁底线
    { wch: 15 }, // 群众满意度
    { wch: 15 }, // 组织管理水平趋势
    { wch: 15 }, // 考核指标执行趋势
    { wch: 15 }, // 人才培养创新趋势
    { wch: 15 }, // 党建基础工作趋势
    { wch: 15 }, // 任务跟进落实趋势
    { wch: 15 }, // 安全廉洁底线趋势
    { wch: 15 }, // 群众满意度趋势
    { wch: 10 }, // 标签1
    { wch: 10 }, // 标签2
    { wch: 10 }, // 标签3
    { wch: 10 }, // 标签4
    { wch: 10 }, // 标签5
    { wch: 15 }, // 基础评价得分1月
    { wch: 15 }, // 基础评价得分2月
    { wch: 15 }, // 基础评价得分3月
    { wch: 15 }, // 基础评价得分4月
    { wch: 15 }, // 基础评价得分5月
    { wch: 15 }, // 基础评价得分6月
    { wch: 15 }, // 管理赋值得分1月
    { wch: 15 }, // 管理赋值得分2月
    { wch: 15 }, // 管理赋值得分3月
    { wch: 15 }, // 管理赋值得分4月
    { wch: 15 }, // 管理赋值得分5月
    { wch: 15 }, // 管理赋值得分6月
    { wch: 15 }, // 综合得分1月
    { wch: 15 }, // 综合得分2月
    { wch: 15 }, // 综合得分3月
    { wch: 15 }, // 综合得分4月
    { wch: 15 }, // 综合得分5月
    { wch: 15 }  // 综合得分6月
  ];

  capabilitySheet['!cols'] = capabilityColWidths;

  // 添加工作表到工作簿
  xlsx.utils.book_append_sheet(workbook, capabilitySheet, '支部综合能力画像');
  xlsx.utils.book_append_sheet(workbook, managementScoreSheet, '管理赋值');

  // 添加说明工作表
  const instructionsData = [
    ['支部综合能力画像模板使用说明'],
    [''],
    ['1. 请在"支部综合能力画像"工作表中编辑数据'],
    ['2. 各能力指标的数值范围为0-100'],
    ['3. 趋势可选值: up(上升), down(下降), stable(稳定)'],
    ['4. 标签可以选择以下类型：'],
    ['   - 进取型'],
    ['   - 创新型'],
    ['   - 攻坚型'],
    ['   - 高效型'],
    ['   - 人才摇篮'],
    ['   - 执行力强'],
    ['   - 党建扎实'],
    ['   - 安全意识高'],
    ['   - 任务落实好'],
    ['   - 管理规范'],
    ['   - 效率偏低'],
    ['   - 基础薄弱'],
    ['   - 创新不足'],
    ['   - 执行力偏低'],
    ['   - 人才培养弱'],
    ['   - 躺平型'],
    [''],
    ['5. 积极标签（显示为绿色）：进取型、创新型、攻坚型、高效型、人才摇篮、执行力强、党建扎实、安全意识高、任务落实好、管理规范'],
    ['6. 消极标签（显示为红色）：效率偏低、基础薄弱、创新不足、执行力偏低、人才培养弱、躺平型'],
    [''],
    ['7. 管理赋值类型包括：特殊贡献赋值、创新工作赋值、战略任务赋值、管理裁量赋值、突发事件应对赋值'],
    ['8. 管理赋值分数范围：'],
    ['   - 特殊贡献赋值: 0-5分'],
    ['   - 创新工作赋值: 0-3分'],
    ['   - 战略任务赋值: 0-5分'],
    ['   - 管理裁量赋值: -3-3分'],
    ['   - 突发事件应对赋值: -5-5分'],
    [''],
    ['9. 请保持支部ID和支部名称不变'],
    ['10. 编辑完成后保存文件，然后导入系统']
  ];

  const instructionsSheet = xlsx.utils.aoa_to_sheet(instructionsData);
  xlsx.utils.book_append_sheet(workbook, instructionsSheet, '使用说明');

  // 保存Excel文件
  const templateDir = path.join(__dirname, 'templates');
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }

  const filePath = path.join(templateDir, 'capability-template.xlsx');
  xlsx.writeFile(workbook, filePath);

  console.log(`模板已创建: ${filePath}`);
  return filePath;
}

// 执行创建模板
createCapabilityTemplate();
