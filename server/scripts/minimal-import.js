/**
 * 最小化Excel导入工具
 * 
 * 此脚本专门解决中文字段名和特殊字符导致的SQL语法错误问题
 * 使用最简单的方式导入数据，只包含最基本的字段
 */

const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

/**
 * 主函数
 */
async function main() {
  console.log('=== 最小化Excel导入工具 ===');
  
  try {
    // 提示用户输入Excel文件路径
    console.log('请将Excel数据文件放在任意位置，然后输入完整路径');
    console.log('例如：D:\\Data\\employees.xlsx 或 C:\\Users\\YourName\\Desktop\\employees.xlsx');
    
    const excelPath = await question('请输入Excel文件路径: ');
    
    if (!fs.existsSync(excelPath)) {
      console.error('文件不存在，请检查路径是否正确');
      rl.close();
      return;
    }
    
    console.log('正在读取Excel文件...');
    
    // 读取Excel文件
    const workbook = xlsx.readFile(excelPath);
    
    console.log('Excel文件读取成功');
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log(`使用工作表: ${sheetName}`);
    
    // 将工作表转换为JSON
    console.log('正在转换数据...');
    const rawData = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`读取到 ${rawData.length} 条记录`);
    
    // 连接数据库
    console.log('\n正在连接数据库...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 创建表
    console.log('准备创建/重置simple_employees表...');
    
    // 先删除表（如果存在）
    try {
      await connection.execute('DROP TABLE IF EXISTS simple_employees');
      console.log('已删除旧表');
    } catch (dropError) {
      console.error('删除旧表失败:', dropError.message);
    }
    
    // 创建新表 - 只使用最基本的字段
    try {
      const createTableSQL = `
        CREATE TABLE simple_employees (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100),
          department VARCHAR(255),
          position VARCHAR(100),
          age VARCHAR(10),
          education VARCHAR(50),
          skill_level VARCHAR(50),
          skill_type VARCHAR(100),
          tech_level VARCHAR(50),
          tech_type VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;
      
      await connection.execute(createTableSQL);
      console.log('simple_employees表创建成功');
    } catch (createError) {
      console.error('创建表失败:', createError.message);
      throw createError;
    }
    
    // 开始导入数据
    console.log('\n开始导入数据...');
    
    let successCount = 0;
    let errorCount = 0;
    
    // 处理每条记录
    for (let i = 0; i < rawData.length; i++) {
      const record = rawData[i];
      
      try {
        // 提取基本字段 - 使用可能的字段名称
        const name = record['员工基本信息-姓名'] || record['姓名'] || null;
        const department = record['组织信息-部门路径'] || record['部门路径'] || record['部门'] || null;
        const position = record['组织信息-岗位名称'] || record['岗位名称'] || record['岗位'] || null;
        const age = record['员工基本信息-年龄'] || record['年龄'] || null;
        const education = record['最高学历'] || record['员工基本信息-文化程度'] || record['文化程度'] || null;
        const skillLevel = record['最高技能等级类别'] || null;
        const skillType = record['最高技能等级工种'] || null;
        const techLevel = record['最高技术等级类别'] || null;
        const techType = record['最高技术等级工种'] || null;
        
        // 执行插入
        const insertSQL = `
          INSERT INTO simple_employees (
            name, department, position, age, education, 
            skill_level, skill_type, tech_level, tech_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
          name, department, position, age, education,
          skillLevel, skillType, techLevel, techType
        ];
        
        await connection.execute(insertSQL, params);
        
        successCount++;
        console.log(`记录 ${i+1}/${rawData.length} 导入成功`);
      } catch (error) {
        errorCount++;
        console.error(`导入第 ${i+1} 条记录失败:`, error.message);
      }
      
      // 每处理10条记录暂停一下
      if ((i + 1) % 10 === 0 && i + 1 < rawData.length) {
        console.log(`已处理 ${i+1}/${rawData.length} 条记录，暂停1秒...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n导入完成!');
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${errorCount} 条`);
    
    // 关闭数据库连接
    await connection.end();
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    rl.close();
  }
}

// 执行主函数
main().catch(console.error);
