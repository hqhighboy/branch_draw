/**
 * 生成Excel模板文件
 * 
 * 此脚本用于生成各种数据上传的Excel模板
 */

const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// 确保模板目录存在
const templatesDir = path.join(__dirname, '..', 'public', 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// 生成支部基本信息模板
function generateBranchInfoTemplate() {
  // 创建工作簿
  const wb = xlsx.utils.book_new();
  
  // 定义表头
  const headers = [
    '支部名称', '书记', '副书记', '组织委员', '纪律委员', '宣传委员', '学习委员',
    '党员人数', '平均年龄', '2024年表现', '书记项目', '荣誉',
    '30岁以下', '30-40岁', '40-50岁', '50岁以上',
    '博士', '硕士', '本科', '大专及以下'
  ];
  
  // 创建示例数据
  const exampleData = [
    {
      '支部名称': '党建人事部党支部',
      '书记': '张三',
      '副书记': '李四',
      '组织委员': '王五',
      '纪律委员': '赵六',
      '宣传委员': '钱七',
      '学习委员': '孙八',
      '党员人数': 25,
      '平均年龄': 38,
      '2024年表现': '优秀',
      '书记项目': '提升党员先锋模范作用',
      '荣誉': '2023年度先进基层党组织',
      '30岁以下': 20,
      '30-40岁': 30,
      '40-50岁': 30,
      '50岁以上': 20,
      '博士': 5,
      '硕士': 25,
      '本科': 50,
      '大专及以下': 20
    }
  ];
  
  // 创建工作表
  const ws = xlsx.utils.json_to_sheet(exampleData, { header: headers });
  
  // 添加工作表到工作簿
  xlsx.utils.book_append_sheet(wb, ws, '支部基本信息');
  
  // 写入文件
  xlsx.writeFile(wb, path.join(templatesDir, 'branch-info-template.xlsx'));
  
  console.log('支部基本信息模板已生成');
}

// 生成支部能力画像模板
function generateBranchCapabilityTemplate() {
  // 创建工作簿
  const wb = xlsx.utils.book_new();
  
  // 定义表头
  const headers = [
    '支部名称', '管理水平', 'KPI执行', '人才培养', '党建工作', 
    '任务跟进', '安全合规', '创新能力', '团队协作', '资源利用', '总体得分'
  ];
  
  // 创建示例数据
  const exampleData = [
    {
      '支部名称': '党建人事部党支部',
      '管理水平': 85,
      'KPI执行': 82,
      '人才培养': 78,
      '党建工作': 90,
      '任务跟进': 85,
      '安全合规': 92,
      '创新能力': 75,
      '团队协作': 88,
      '资源利用': 80,
      '总体得分': 84
    }
  ];
  
  // 创建工作表
  const ws = xlsx.utils.json_to_sheet(exampleData, { header: headers });
  
  // 添加工作表到工作簿
  xlsx.utils.book_append_sheet(wb, ws, '支部能力画像');
  
  // 写入文件
  xlsx.writeFile(wb, path.join(templatesDir, 'branch-capability-template.xlsx'));
  
  console.log('支部能力画像模板已生成');
}

// 生成月度工作完成情况模板
function generateMonthlyWorkTemplate() {
  // 创建工作簿
  const wb = xlsx.utils.book_new();
  
  // 定义表头
  const headers = [
    '支部名称', '年份', '月份', '计划完成率', '执行完成率', 
    '检查完成率', '评估完成率', '改进完成率'
  ];
  
  // 创建示例数据
  const exampleData = [
    {
      '支部名称': '党建人事部党支部',
      '年份': 2024,
      '月份': 6,
      '计划完成率': 85,
      '执行完成率': 82,
      '检查完成率': 78,
      '评估完成率': 75,
      '改进完成率': 80
    }
  ];
  
  // 创建工作表
  const ws = xlsx.utils.json_to_sheet(exampleData, { header: headers });
  
  // 添加工作表到工作簿
  xlsx.utils.book_append_sheet(wb, ws, '月度工作完成情况');
  
  // 写入文件
  xlsx.writeFile(wb, path.join(templatesDir, 'monthly-work-template.xlsx'));
  
  console.log('月度工作完成情况模板已生成');
}

// 生成年度重点工作模板
function generateAnnualWorkTemplate() {
  // 创建工作簿
  const wb = xlsx.utils.book_new();
  
  // 定义表头
  const headers = [
    '支部名称', '任务名称', '开始时间', '结束时间', '状态', '进度'
  ];
  
  // 创建示例数据
  const exampleData = [
    {
      '支部名称': '党建人事部党支部',
      '任务名称': '党员教育培训',
      '开始时间': '2024-01-01',
      '结束时间': '2024-12-31',
      '状态': '进行中',
      '进度': 50
    }
  ];
  
  // 创建工作表
  const ws = xlsx.utils.json_to_sheet(exampleData, { header: headers });
  
  // 添加工作表到工作簿
  xlsx.utils.book_append_sheet(wb, ws, '年度重点工作');
  
  // 写入文件
  xlsx.writeFile(wb, path.join(templatesDir, 'annual-work-template.xlsx'));
  
  console.log('年度重点工作模板已生成');
}

// 生成支部党员信息模板
function generateBranchMembersTemplate() {
  // 创建工作簿
  const wb = xlsx.utils.book_new();
  
  // 定义表头
  const headers = [
    '支部名称', '姓名', '性别', '年龄', '学历', '职称', '职务', '入党时间', '党龄', '联系电话'
  ];
  
  // 创建示例数据
  const exampleData = [
    {
      '支部名称': '党建人事部党支部',
      '姓名': '张三',
      '性别': '男',
      '年龄': 35,
      '学历': '本科',
      '职称': '高级工程师',
      '职务': '部门经理',
      '入党时间': '2010-07-01',
      '党龄': 14,
      '联系电话': '13800138000'
    }
  ];
  
  // 创建工作表
  const ws = xlsx.utils.json_to_sheet(exampleData, { header: headers });
  
  // 添加工作表到工作簿
  xlsx.utils.book_append_sheet(wb, ws, '支部党员信息');
  
  // 写入文件
  xlsx.writeFile(wb, path.join(templatesDir, 'branch-members-template.xlsx'));
  
  console.log('支部党员信息模板已生成');
}

// 生成所有模板
function generateAllTemplates() {
  generateBranchInfoTemplate();
  generateBranchCapabilityTemplate();
  generateMonthlyWorkTemplate();
  generateAnnualWorkTemplate();
  generateBranchMembersTemplate();
  
  console.log('所有模板已生成');
}

// 执行生成
generateAllTemplates();
