/**
 * 创建党员信息导入模板
 */
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

function createPartyMemberTemplate(outputPath) {
  // 创建工作簿
  const workbook = xlsx.utils.book_new();
  
  // 创建表头
  const headers = [
    '姓名',
    '支部信息',
    '政治面貌',
    '党委书记',
    '党委副书记',
    '纪委书记',
    '工会主席',
    '党委委员',
    '支部书记',
    '支部副书记',
    '组织委员',
    '纪检委员',
    '宣传委员',
    '青年委员',
    '生产委员'
  ];
  
  // 创建示例数据
  const exampleData = [
    [
      '张三',
      '党建人事部党支部',
      '党员',
      '',
      '',
      '',
      '',
      '',
      '是',
      '',
      '',
      '',
      '',
      '',
      ''
    ],
    [
      '李四',
      '党建人事部党支部',
      '党员',
      '',
      '',
      '',
      '',
      '',
      '',
      '是',
      '',
      '',
      '',
      '',
      ''
    ],
    [
      '王五',
      '党建人事部党支部',
      '党员',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '是',
      '',
      '',
      '',
      ''
    ]
  ];
  
  // 合并表头和示例数据
  const worksheetData = [headers, ...exampleData];
  
  // 创建工作表
  const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
  
  // 设置列宽
  const colWidths = [
    { wch: 15 },  // 姓名
    { wch: 25 },  // 支部信息
    { wch: 15 },  // 政治面貌
    { wch: 10 },  // 党委书记
    { wch: 10 },  // 党委副书记
    { wch: 10 },  // 纪委书记
    { wch: 10 },  // 工会主席
    { wch: 10 },  // 党委委员
    { wch: 10 },  // 支部书记
    { wch: 10 },  // 支部副书记
    { wch: 10 },  // 组织委员
    { wch: 10 },  // 纪检委员
    { wch: 10 },  // 宣传委员
    { wch: 10 },  // 青年委员
    { wch: 10 }   // 生产委员
  ];
  
  worksheet['!cols'] = colWidths;
  
  // 添加工作表到工作簿
  xlsx.utils.book_append_sheet(workbook, worksheet, '党员信息');
  
  // 添加说明工作表
  const instructionsData = [
    ['党员信息导入模板说明'],
    [''],
    ['1. 请按照模板格式填写党员信息，不要修改表头。'],
    ['2. 姓名和支部信息为必填项。'],
    ['3. 政治面貌默认为"党员"，可以根据实际情况修改。'],
    ['4. 职务列中填写"是"、"√"或"Y"表示担任该职务，留空或填写其他值表示不担任该职务。'],
    ['5. 如果党员已存在于系统中，将会更新其信息；如果不存在，将会新增。'],
    ['6. 导入前请确保支部名称与系统中的支部名称一致，否则将无法导入。'],
    [''],
    ['系统中的支部名称列表：'],
    ['- 党建人事部党支部'],
    ['- 综合党支部'],
    ['- 生产技术党支部'],
    ['- 安监党支部'],
    ['- 数字运行党支部'],
    ['- 检修试验党支部'],
    ['- 继保自动化党支部'],
    ['- 500kV科北数字巡维中心党支部'],
    ['- 500kV北郊数字巡维中心党支部'],
    ['- 220kV罗涌数字巡维中心党支部'],
    ['- 220kV田心数字巡维中心党支部'],
    ['- 220kV田心数字运维中心党支部'],
    ['- 技术创新党支部']
  ];
  
  const instructionsWorksheet = xlsx.utils.aoa_to_sheet(instructionsData);
  instructionsWorksheet['!cols'] = [{ wch: 80 }];
  
  // 设置单元格样式
  instructionsWorksheet['A1'] = { 
    v: '党员信息导入模板说明', 
    t: 's',
    s: { font: { bold: true, sz: 14 } }
  };
  
  xlsx.utils.book_append_sheet(workbook, instructionsWorksheet, '说明');
  
  // 写入文件
  xlsx.writeFile(workbook, outputPath);
  
  console.log(`模板已创建: ${outputPath}`);
  return outputPath;
}

// 如果直接运行此脚本
if (require.main === module) {
  const outputPath = path.join(__dirname, '../uploads/党员信息导入模板.xlsx');
  
  // 确保目录存在
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  createPartyMemberTemplate(outputPath);
}

module.exports = { createPartyMemberTemplate };
