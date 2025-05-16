const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

async function createDetailedTemplate(outputPath) {
  try {
    // 获取数据库中的支部信息
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'bdes@123',
      database: 'db'
    });
    
    const [branches] = await conn.query('SELECT id, name FROM branches');
    await conn.end();
    
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
    
    // 为每个支部创建示例数据
    const allData = [];
    
    // 添加表头
    allData.push(headers);
    
    // 为每个支部添加示例数据
    branches.forEach((branch, index) => {
      // 支部书记
      allData.push([
        `${branch.name}书记`,
        branch.name,
        '党员',
        '', '', '', '', '',
        '是', // 支部书记
        '', '', '', '', '', ''
      ]);
      
      // 支部副书记
      allData.push([
        `${branch.name}副书记`,
        branch.name,
        '党员',
        '', '', '', '', '',
        '',
        '是', // 支部副书记
        '', '', '', '', ''
      ]);
      
      // 组织委员
      allData.push([
        `${branch.name}组织委员`,
        branch.name,
        '党员',
        '', '', '', '', '',
        '', '',
        '是', // 组织委员
        '', '', '', ''
      ]);
      
      // 纪检委员
      allData.push([
        `${branch.name}纪检委员`,
        branch.name,
        '党员',
        '', '', '', '', '',
        '', '', '',
        '是', // 纪检委员
        '', '', ''
      ]);
      
      // 宣传委员
      allData.push([
        `${branch.name}宣传委员`,
        branch.name,
        '党员',
        '', '', '', '', '',
        '', '', '', '',
        '是', // 宣传委员
        '', ''
      ]);
      
      // 青年委员
      allData.push([
        `${branch.name}青年委员`,
        branch.name,
        '党员',
        '', '', '', '', '',
        '', '', '', '', '',
        '是', // 青年委员
        ''
      ]);
      
      // 生产委员
      allData.push([
        `${branch.name}生产委员`,
        branch.name,
        '党员',
        '', '', '', '', '',
        '', '', '', '', '', '',
        '是' // 生产委员
      ]);
      
      // 普通党员
      allData.push([
        `${branch.name}普通党员1`,
        branch.name,
        '党员',
        '', '', '', '', '',
        '', '', '', '', '', '', ''
      ]);
      
      allData.push([
        `${branch.name}普通党员2`,
        branch.name,
        '党员',
        '', '', '', '', '',
        '', '', '', '', '', '', ''
      ]);
    });
    
    // 创建工作表
    const worksheet = xlsx.utils.aoa_to_sheet(allData);
    
    // 设置列宽
    const colWidths = [
      { wch: 25 },  // 姓名
      { wch: 30 },  // 支部信息
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
    
    // 添加支部信息工作表
    const branchHeaders = ['支部ID', '支部名称'];
    const branchData = branches.map(b => [b.id, b.name]);
    const branchWorksheetData = [branchHeaders, ...branchData];
    const branchWorksheet = xlsx.utils.aoa_to_sheet(branchWorksheetData);
    branchWorksheet['!cols'] = [{ wch: 10 }, { wch: 40 }];
    xlsx.utils.book_append_sheet(workbook, branchWorksheet, '支部信息');
    
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
      ['7. 本模板已预填了每个支部的示例数据，您可以根据实际情况修改。'],
      ['8. 导入时，系统会自动更新支部的职务信息。'],
      [''],
      ['支部信息工作表中列出了系统中所有支部的ID和名称，请参考。']
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
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 写入文件
    xlsx.writeFile(workbook, outputPath);
    
    console.log(`详细模板已创建: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error('创建详细模板失败:', err);
    throw err;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const outputPath = path.join(__dirname, '../uploads/党员信息导入详细模板.xlsx');
  createDetailedTemplate(outputPath)
    .catch(err => console.error(err));
}

module.exports = { createDetailedTemplate };
