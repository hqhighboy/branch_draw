/**
 * 创建年度重点工作Excel模板
 */

const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// 读取JSON模板
const templateData = require('./annual-work-template.json');

// 创建Excel工作簿
function createAnnualWorkTemplate() {
  // 创建工作簿
  const workbook = xlsx.utils.book_new();
  
  // 准备年度重点工作数据
  const annualWorkData = [
    // 表头
    ['ID', '支部名称', '工作任务', '开始时间', '结束时间', '状态', '进度(%)']
  ];
  
  // 添加年度重点工作数据
  templateData.forEach(work => {
    annualWorkData.push([
      work.id,
      work.branch,
      work.task,
      work.startTime,
      work.endTime,
      work.status,
      work.progress
    ]);
  });
  
  // 创建工作表
  const annualWorkSheet = xlsx.utils.aoa_to_sheet(annualWorkData);
  
  // 设置列宽
  const colWidths = [
    { wch: 5 },   // ID
    { wch: 40 },  // 支部名称
    { wch: 40 },  // 工作任务
    { wch: 15 },  // 开始时间
    { wch: 15 },  // 结束时间
    { wch: 10 },  // 状态
    { wch: 10 }   // 进度(%)
  ];
  
  annualWorkSheet['!cols'] = colWidths;
  
  // 添加工作表到工作簿
  xlsx.utils.book_append_sheet(workbook, annualWorkSheet, '年度重点工作');
  
  // 添加说明工作表
  const instructionsData = [
    ['年度重点工作模板使用说明'],
    [''],
    ['1. 请在"年度重点工作"工作表中编辑数据'],
    ['2. 支部名称必须是以下11个支部之一：'],
    ['   - 党建人事党支部'],
    ['   - 综合党支部'],
    ['   - 生技党支部'],
    ['   - 安监党支部'],
    ['   - 数字运行部党支部'],
    ['   - 检修试验党支部'],
    ['   - 继保自动化党支部'],
    ['   - 500千伏科北数字巡维中心党支部'],
    ['   - 500千伏北郊数字巡维中心党支部'],
    ['   - 220千伏罗涌数字巡维中心党支部'],
    ['   - 220千伏田心数字巡维中心党支部'],
    [''],
    ['3. 状态可以是以下几种：'],
    ['   - 未开始'],
    ['   - 进行中'],
    ['   - 已完成'],
    ['   - 已延期'],
    ['   - 已取消'],
    [''],
    ['4. 进度为0-100的整数，表示完成百分比'],
    ['5. 时间格式为YYYY-MM-DD，例如：2024-01-01'],
    ['6. ID为唯一标识，请勿重复'],
    ['7. 编辑完成后保存文件，然后导入系统']
  ];
  
  const instructionsSheet = xlsx.utils.aoa_to_sheet(instructionsData);
  xlsx.utils.book_append_sheet(workbook, instructionsSheet, '使用说明');
  
  // 保存Excel文件
  const templateDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }
  
  const filePath = path.join(templateDir, '年度重点工作模板.xlsx');
  xlsx.writeFile(workbook, filePath);
  
  console.log(`模板已创建: ${filePath}`);
  return filePath;
}

// 执行创建模板
createAnnualWorkTemplate();
