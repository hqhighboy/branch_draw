/**
 * 创建Excel导入模板
 */

const xlsx = require('xlsx');
const path = require('path');

// 创建工作簿
const workbook = xlsx.utils.book_new();

// 支部基本信息工作表
const branchesData = [
  [
    '支部名称', '书记', '副书记', '组织委员', '纪检委员', 
    '宣传委员', '学习委员', '支部人数', '平均年龄', 
    '上年度绩效', '书记项目', '获得荣誉'
  ],
  [
    '党建人事部党支部', '张三', '李四', '王五', '赵六',
    '钱七', '孙八', 30, 35,
    'A', '提升基层党建工作质量', '2023年先进基层党组织'
  ],
  [
    '技术创新党支部', '王明', '李华', '张强', '刘勇',
    '陈晓', '吴刚', 25, 32,
    'A+', '技术创新能力提升', '2022年优秀党支部'
  ]
];

const branchesSheet = xlsx.utils.aoa_to_sheet(branchesData);
xlsx.utils.book_append_sheet(workbook, branchesSheet, '支部基本信息');

// 年龄分布工作表
const ageData = [
  ['支部名称', '18-28岁', '28-35岁', '35-50岁', '50-60岁'],
  ['党建人事部党支部', 25, 35, 30, 10],
  ['技术创新党支部', 30, 40, 20, 10]
];

const ageSheet = xlsx.utils.aoa_to_sheet(ageData);
xlsx.utils.book_append_sheet(workbook, ageSheet, '年龄分布');

// 学历分布工作表
const educationData = [
  ['支部名称', '大专及以下', '本科', '硕士', '博士'],
  ['党建人事部党支部', 15, 55, 25, 5],
  ['技术创新党支部', 10, 50, 30, 10]
];

const educationSheet = xlsx.utils.aoa_to_sheet(educationData);
xlsx.utils.book_append_sheet(workbook, educationSheet, '学历分布');

// 技能分布工作表
const skillData = [
  ['支部名称', '初中级工', '高级工', '技师', '高级技师'],
  ['党建人事部党支部', 25, 40, 25, 10],
  ['技术创新党支部', 20, 35, 30, 15]
];

const skillSheet = xlsx.utils.aoa_to_sheet(skillData);
xlsx.utils.book_append_sheet(workbook, skillSheet, '技能分布');

// 职称分布工作表
const titleData = [
  ['支部名称', '助理工程师', '工程师', '高级工程师', '正高级工程师'],
  ['党建人事部党支部', 20, 45, 30, 5],
  ['技术创新党支部', 15, 40, 35, 10]
];

const titleSheet = xlsx.utils.aoa_to_sheet(titleData);
xlsx.utils.book_append_sheet(workbook, titleSheet, '职称分布');

// 年度工作工作表
const workData = [
  ['支部名称', '工作任务', '开始时间', '结束时间', '状态', '进度'],
  ['党建人事部党支部', '质量提升工程', '2024-01', '2024-12', '进行中', 40],
  ['党建人事部党支部', '技术创新项目', '2024-02', '2024-10', '进行中', 45],
  ['党建人事部党支部', '标准化建设', '2024-03', '2024-09', '进行中', 50],
  ['党建人事部党支部', '人才培养计划', '2024-04', '2024-12', '准备中', 0],
  ['党建人事部党支部', '技术交流活动', '2024-09', '2024-11', '未开始', 0],
  ['技术创新党支部', '创新平台建设', '2024-01', '2024-10', '进行中', 60],
  ['技术创新党支部', '专利申请计划', '2024-03', '2024-12', '进行中', 35],
  ['技术创新党支部', '技术攻关项目', '2024-02', '2024-11', '进行中', 40],
  ['技术创新党支部', '青年人才培养', '2024-05', '2024-12', '准备中', 0],
  ['技术创新党支部', '对外技术合作', '2024-04', '2024-09', '进行中', 55]
];

const workSheet = xlsx.utils.aoa_to_sheet(workData);
xlsx.utils.book_append_sheet(workbook, workSheet, '年度工作');

// 保存工作簿
const templatePath = path.join(__dirname, '..', 'import_template.xlsx');
xlsx.writeFile(workbook, templatePath);

console.log(`模板已创建: ${templatePath}`);
