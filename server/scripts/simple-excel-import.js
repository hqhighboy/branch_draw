/**
 * 简单Excel导入工具
 * 
 * 此脚本专门解决中文字段名和特殊字符导致的SQL语法错误问题
 * 使用最简单的方式导入数据，只包含最基本的字段
 */

const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');
const path = require('path');

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
  console.log('=== 简单Excel导入工具 ===');
  
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
    
    // 显示前5条记录的字段名
    if (rawData.length > 0) {
      console.log('\n前5条记录的字段名:');
      const firstRecord = rawData[0];
      const fieldNames = Object.keys(firstRecord);
      
      fieldNames.forEach((field, index) => {
        console.log(`${index + 1}. ${field}`);
      });
      
      // 询问用户要导入哪些字段
      console.log('\n请选择要导入的字段 (输入字段编号，用逗号分隔，例如: 1,3,5)');
      console.log('如果要导入所有字段，请直接按回车');
      
      const selectedFieldsInput = await question('选择字段: ');
      
      let selectedFields = fieldNames;
      
      if (selectedFieldsInput.trim() !== '') {
        const selectedIndices = selectedFieldsInput.split(',').map(num => parseInt(num.trim()) - 1);
        selectedFields = selectedIndices.map(index => fieldNames[index]).filter(Boolean);
      }
      
      console.log(`\n已选择 ${selectedFields.length} 个字段:`);
      selectedFields.forEach((field, index) => {
        console.log(`${index + 1}. ${field}`);
      });
      
      // 连接数据库
      console.log('\n正在连接数据库...');
      const connection = await mysql.createConnection(dbConfig);
      console.log('数据库连接成功');
      
      // 创建表名
      const fileName = path.basename(excelPath, path.extname(excelPath));
      const tableName = `excel_import_${fileName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`;
      
      console.log(`\n将使用表名: ${tableName}`);
      console.log('是否继续? (y/n)');
      
      const confirmTableName = await question('> ');
      
      if (confirmTableName.toLowerCase() !== 'y') {
        console.log('操作已取消');
        await connection.end();
        rl.close();
        return;
      }
      
      // 创建表
      console.log(`\n准备创建/重置 ${tableName} 表...`);
      
      // 先删除表（如果存在）
      try {
        await connection.execute(`DROP TABLE IF EXISTS ${tableName}`);
        console.log('已删除旧表');
      } catch (dropError) {
        console.error('删除旧表失败:', dropError.message);
      }
      
      // 创建新表
      try {
        // 为每个字段创建一个安全的列名
        const columns = selectedFields.map(field => {
          // 创建安全的列名
          const safeColumnName = field
            .replace(/[^a-zA-Z0-9_]/g, '_') // 替换非字母数字下划线字符为下划线
            .replace(/^[0-9]/, '_$&')       // 如果以数字开头，添加下划线前缀
            .toLowerCase();                  // 转为小写
          
          return {
            originalName: field,
            safeName: safeColumnName
          };
        });
        
        // 构建创建表的SQL
        let createTableSQL = `
          CREATE TABLE ${tableName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
        `;
        
        columns.forEach((column, index) => {
          createTableSQL += `    ${column.safeName} TEXT${index < columns.length - 1 ? ',' : ''}
          `;
        });
        
        createTableSQL += `    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        
        await connection.execute(createTableSQL);
        console.log(`${tableName} 表创建成功`);
        
        // 开始导入数据
        console.log('\n开始导入数据...');
        
        let successCount = 0;
        let errorCount = 0;
        
        // 分批处理数据
        const batchSize = 10;
        const totalRecords = rawData.length;
        
        for (let i = 0; i < totalRecords; i += batchSize) {
          const batchEnd = Math.min(i + batchSize, totalRecords);
          console.log(`正在处理第 ${i+1} 至 ${batchEnd} 条记录 (共 ${totalRecords} 条)...`);
          
          // 处理当前批次的数据
          for (let j = i; j < batchEnd; j++) {
            const record = rawData[j];
            
            try {
              // 构建插入SQL
              let insertSQL = `INSERT INTO ${tableName} (`;
              let placeholders = '';
              const values = [];
              
              columns.forEach((column, index) => {
                insertSQL += `${column.safeName}${index < columns.length - 1 ? ', ' : ''}`;
                placeholders += `?${index < columns.length - 1 ? ', ' : ''}`;
                values.push(record[column.originalName] || null);
              });
              
              insertSQL += `) VALUES (${placeholders})`;
              
              // 执行插入
              await connection.execute(insertSQL, values);
              
              successCount++;
              console.log(`记录 ${j+1} 导入成功`);
            } catch (error) {
              errorCount++;
              console.error(`导入第 ${j+1} 条记录失败:`, error.message);
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
        
        // 显示导入后的表结构
        console.log('\n导入后的表结构:');
        const [tableColumns] = await connection.execute(`SHOW COLUMNS FROM ${tableName}`);
        
        tableColumns.forEach((column, index) => {
          console.log(`${index + 1}. ${column.Field} (${column.Type})`);
        });
        
        // 显示导入后的记录数
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`\n表 ${tableName} 中共有 ${countResult[0].count} 条记录`);
        
        // 显示前5条记录
        if (countResult[0].count > 0) {
          const [records] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 5`);
          
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
      } catch (error) {
        console.error('创建表或导入数据失败:', error.message);
      }
      
      // 关闭数据库连接
      await connection.end();
    } else {
      console.log('Excel文件中没有数据');
    }
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    rl.close();
  }
}

// 执行主函数
main().catch(console.error);
