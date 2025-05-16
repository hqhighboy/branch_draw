/**
 * 员工数据导入工具
 * 
 * 此脚本专门用于导入员工数据，并解决中文字段名问题
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

// 字段映射 - 将Excel中的字段名映射到数据库字段名
const fieldMapping = {
  '序号': 'sequence_number',
  '员工基本信息-姓名': 'name',
  '姓名': 'name',
  '组织信息-部门路径': 'department_path',
  '部门路径': 'department_path',
  '部门': 'department',
  '最高技能等级类别': 'highest_skill_level_category',
  '最高技能等级工种': 'highest_skill_level_type',
  '最高技能等级获取时间': 'highest_skill_level_date',
  '最高技术等级类别': 'highest_tech_level_category',
  '最高技术等级工种': 'highest_tech_level_type',
  '最高技术等级获取时间': 'highest_tech_level_date',
  '最高学历': 'highest_education',
  '年龄': 'age'
};

/**
 * 主函数
 */
async function main() {
  console.log('=== 员工数据导入工具 ===');
  
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
    console.log('准备创建/重置employee_data表...');
    
    // 先删除表（如果存在）
    try {
      await connection.execute('DROP TABLE IF EXISTS employee_data');
      console.log('已删除旧表');
    } catch (dropError) {
      console.error('删除旧表失败:', dropError.message);
    }
    
    // 创建新表
    try {
      const createTableSQL = `
        CREATE TABLE employee_data (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sequence_number VARCHAR(20),
          name VARCHAR(100),
          department_path VARCHAR(255),
          highest_skill_level_category VARCHAR(100),
          highest_skill_level_type VARCHAR(100),
          highest_skill_level_date VARCHAR(50),
          highest_tech_level_category VARCHAR(100),
          highest_tech_level_type VARCHAR(100),
          highest_tech_level_date VARCHAR(50),
          highest_education VARCHAR(50),
          age VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;
      
      await connection.execute(createTableSQL);
      console.log('employee_data表创建成功');
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
        // 提取字段值
        const values = {
          sequence_number: null,
          name: null,
          department_path: null,
          highest_skill_level_category: null,
          highest_skill_level_type: null,
          highest_skill_level_date: null,
          highest_tech_level_category: null,
          highest_tech_level_type: null,
          highest_tech_level_date: null,
          highest_education: null,
          age: null
        };
        
        // 遍历记录中的所有字段
        Object.keys(record).forEach(field => {
          // 如果有映射，使用映射的字段名
          if (fieldMapping[field] && values[fieldMapping[field]] !== undefined) {
            values[fieldMapping[field]] = record[field];
          }
        });
        
        // 构建插入SQL
        const insertSQL = `
          INSERT INTO employee_data (
            sequence_number, name, department_path, 
            highest_skill_level_category, highest_skill_level_type, highest_skill_level_date,
            highest_tech_level_category, highest_tech_level_type, highest_tech_level_date,
            highest_education, age
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
          values.sequence_number,
          values.name,
          values.department_path,
          values.highest_skill_level_category,
          values.highest_skill_level_type,
          values.highest_skill_level_date,
          values.highest_tech_level_category,
          values.highest_tech_level_type,
          values.highest_tech_level_date,
          values.highest_education,
          values.age
        ];
        
        // 执行插入
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
    
    // 显示导入后的记录数
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM employee_data');
    console.log(`\n表 employee_data 中共有 ${countResult[0].count} 条记录`);
    
    // 显示前5条记录
    if (countResult[0].count > 0) {
      const [records] = await connection.execute('SELECT * FROM employee_data LIMIT 5');
      
      console.log('\n前5条记录示例:');
      records.forEach((record, index) => {
        console.log(`\n记录 ${index + 1}:`);
        Object.keys(record).forEach(key => {
          if (record[key] !== null && key !== 'id' && key !== 'created_at') {
            console.log(`  ${key}: ${record[key]}`);
          }
        });
      });
    }
    
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
