/**
 * 读取Excel表头脚本
 */

const xlsx = require('xlsx');
const path = require('path');

// 指定Excel文件路径
const excelPath = 'D:/Projects/cursor/server/员工信息模板-0424.xlsx';

try {
  console.log(`正在读取Excel文件: ${excelPath}`);
  
  // 读取Excel文件
  const workbook = xlsx.readFile(excelPath);
  
  // 获取所有工作表名称
  const sheetNames = workbook.SheetNames;
  console.log(`Excel文件包含 ${sheetNames.length} 个工作表:`);
  
  // 遍历每个工作表
  sheetNames.forEach(sheetName => {
    console.log(`\n工作表: ${sheetName}`);
    
    // 获取工作表
    const worksheet = workbook.Sheets[sheetName];
    
    // 将工作表转换为JSON
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    // 输出表头（第一行）
    if (data.length > 0) {
      console.log('表头:');
      console.log(data[0]);
    } else {
      console.log('工作表为空');
    }
  });
} catch (error) {
  console.error('读取Excel文件失败:', error);
}
