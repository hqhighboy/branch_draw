/**
 * 简化版Excel导入工具
 * 
 * 此脚本用于导入Excel表格数据到数据库，使用简化的方法，避免复杂处理导致的问题
 */

const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
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
  console.log('=== 简化版Excel导入工具 ===');
  
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
    console.log('这可能需要一些时间，请耐心等待...');
    
    // 读取Excel文件
    const workbook = xlsx.readFile(excelPath, {
      cellFormula: false,
      cellHTML: false,
      cellText: false,
      cellStyles: false,
      cellDates: true,
      sheetStubs: false,
      dense: true
    });
    
    console.log('Excel文件读取成功');
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log(`使用工作表: ${sheetName}`);
    
    // 将工作表转换为JSON
    console.log('正在转换数据...');
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`读取到 ${data.length} 条记录`);
    
    // 显示前5条记录的字段名称
    if (data.length > 0) {
      console.log('\n数据字段示例:');
      const sampleRecord = data[0];
      const keys = Object.keys(sampleRecord);
      console.log(`共有 ${keys.length} 个字段`);
      
      // 只显示前10个字段
      const displayKeys = keys.slice(0, 10);
      displayKeys.forEach(key => {
        console.log(`  ${key}: ${sampleRecord[key]}`);
      });
      console.log('  ...(更多字段)');
    }
    
    // 连接数据库
    console.log('\n正在连接数据库...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 确认是否继续导入
    const confirmImport = await question('\n确认导入数据到数据库? (y/n): ');
    
    if (confirmImport.toLowerCase() !== 'y') {
      console.log('操作已取消');
      await connection.end();
      rl.close();
      return;
    }
    
    // 检查表是否存在
    console.log('检查employees表是否存在...');
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'employees'",
      [dbConfig.database]
    );
    
    if (tables.length === 0) {
      console.log('employees表不存在，正在创建...');
      
      // 创建表
      const createTableSQL = `
        CREATE TABLE employees (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100),
          employee_code VARCHAR(50),
          gender VARCHAR(10),
          birth_date VARCHAR(20),
          age VARCHAR(10),
          ethnicity VARCHAR(20),
          native_place VARCHAR(100),
          work_years VARCHAR(20),
          birth_place VARCHAR(100),
          education_level VARCHAR(50),
          political_status VARCHAR(50),
          company_name VARCHAR(100),
          department_name VARCHAR(100),
          department_path VARCHAR(255),
          team_name VARCHAR(100),
          position_name VARCHAR(100),
          position_level VARCHAR(50),
          position_category VARCHAR(50),
          position_specialty VARCHAR(50),
          position_sequence VARCHAR(50),
          current_position VARCHAR(100),
          current_position_level VARCHAR(50),
          tech_expert_level VARCHAR(50),
          tech_expert_specialty VARCHAR(100),
          skill_expert_level VARCHAR(50),
          skill_expert_specialty VARCHAR(100),
          tenure_years VARCHAR(20),
          current_position_date VARCHAR(20),
          work_start_date VARCHAR(20),
          continuous_work_start_date VARCHAR(20),
          join_system_date VARCHAR(20),
          join_company_date VARCHAR(20),
          mobile_phone VARCHAR(20),
          education_history TEXT,
          professional_certs TEXT,
          current_cert_name VARCHAR(100),
          current_cert_level VARCHAR(50),
          current_cert_specialty VARCHAR(100),
          current_cert_sub_specialty VARCHAR(100),
          current_cert_date VARCHAR(20),
          current_cert_issuer VARCHAR(100),
          current_cert_import_date VARCHAR(20),
          competency_certs TEXT,
          current_competency_name VARCHAR(100),
          current_competency_level VARCHAR(50),
          current_competency_date VARCHAR(20),
          current_competency_issuer VARCHAR(100),
          vocational_certs TEXT,
          current_vocational_name VARCHAR(100),
          current_vocational_level VARCHAR(50),
          current_vocational_type VARCHAR(100),
          current_vocational_date VARCHAR(20),
          current_vocational_issuer VARCHAR(100),
          current_vocational_number VARCHAR(100),
          current_vocational_import_date VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_name (name),
          INDEX idx_employee_code (employee_code),
          INDEX idx_department_path (department_path),
          INDEX idx_position_name (position_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;
      
      await connection.execute(createTableSQL);
      console.log('employees表创建成功');
    } else {
      console.log('employees表已存在');
      
      // 清空现有数据
      console.log('清空现有数据...');
      await connection.execute('TRUNCATE TABLE employees');
    }
    
    // 开始导入数据
    console.log('\n开始导入数据...');
    
    // 设置批量处理大小
    const batchSize = 10;
    const totalRecords = data.length;
    
    let successCount = 0;
    let errorCount = 0;
    
    // 分批处理数据
    for (let i = 0; i < totalRecords; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, totalRecords);
      console.log(`正在处理第 ${i+1} 至 ${batchEnd} 条记录 (共 ${totalRecords} 条)...`);
      
      // 处理当前批次的数据
      for (let j = i; j < batchEnd; j++) {
        const record = data[j];
        
        try {
          // 获取所有字段
          const fields = Object.keys(record);
          const placeholders = fields.map(() => '?').join(', ');
          const values = fields.map(field => {
            const value = record[field];
            // 将所有值转换为字符串，避免类型问题
            return value !== null && value !== undefined ? String(value) : null;
          });
          
          // 构建插入语句
          const insertSQL = `INSERT INTO employees (${fields.join(', ')}) VALUES (${placeholders})`;
          
          // 执行插入
          await connection.execute(insertSQL, values);
          successCount++;
        } catch (error) {
          console.error(`导入第 ${j+1} 条记录失败:`, error.message);
          
          // 尝试使用基本字段插入
          try {
            console.log('尝试使用基本字段插入...');
            
            // 获取基本字段
            const basicFields = [
              '员工基本信息-姓名',
              '员工基本信息-员工编码',
              '组织信息-部门名称',
              '组织信息-岗位名称'
            ].filter(field => record[field] !== undefined);
            
            if (basicFields.length > 0) {
              const placeholders = basicFields.map(() => '?').join(', ');
              const values = basicFields.map(field => {
                const value = record[field];
                return value !== null && value !== undefined ? String(value) : null;
              });
              
              const insertSQL = `INSERT INTO employees (${basicFields.join(', ')}) VALUES (${placeholders})`;
              
              await connection.execute(insertSQL, values);
              console.log(`记录 ${j+1} 使用基本字段插入成功`);
              successCount++;
            } else {
              errorCount++;
              console.error('没有可用的基本字段');
            }
          } catch (basicError) {
            errorCount++;
            console.error('基本字段插入也失败:', basicError.message);
          }
        }
      }
      
      // 每批处理完成后暂停一下，避免数据库负载过高
      if (i + batchSize < totalRecords) {
        console.log('暂停1秒钟...');
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
