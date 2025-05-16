/**
 * 支部人员信息导入工具
 *
 * 此脚本用于导入包含员工基本信息的Excel表格
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

// 设置调试模式
const DEBUG = true;

/**
 * 调试日志函数
 * @param {string} message 日志消息
 * @param {any} data 相关数据
 */
function debugLog(message, data = null) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`);
    if (data !== null) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

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
  console.log('=== 支部人员信息导入工具 ===');

  try {
    // 提示用户输入Excel文件路径
    console.log('请将Excel数据文件放在任意位置，然后输入完整路径');
    console.log('例如：D:\\Data\\personnel.xlsx 或 C:\\Users\\YourName\\Desktop\\personnel.xlsx');

    const excelPath = await question('请输入Excel文件路径: ');

    if (!fs.existsSync(excelPath)) {
      console.error('文件不存在，请检查路径是否正确');
      rl.close();
      return;
    }

    console.log('正在读取Excel文件...');
    const workbook = xlsx.readFile(excelPath);

    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 将工作表转换为JSON
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`读取到 ${data.length} 条人员记录`);

    // 显示前5条记录的字段名称
    if (data.length > 0) {
      console.log('\n数据字段示例:');
      const sampleRecord = data[0];
      Object.keys(sampleRecord).forEach(key => {
        console.log(`  ${key}: ${sampleRecord[key]}`);
      });
    }

    // 连接数据库
    console.log('\n正在连接数据库...');
    debugLog('数据库配置', dbConfig);

    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);
      console.log('数据库连接成功');

      // 测试数据库连接
      const [result] = await connection.execute('SELECT 1 as test');
      debugLog('测试数据库连接结果', result);
    } catch (dbError) {
      console.error('数据库连接失败:', dbError);
      throw dbError;
    }

    // 检查branch_personnel表是否存在，如果不存在则创建
    console.log('检查数据库表结构...');
    await ensurePersonnelTableExists(connection);

    // 测试插入一条测试数据
    try {
      console.log('测试插入一条测试数据...');
      await connection.execute(
        `INSERT INTO branch_personnel (name, department_path, age) VALUES (?, ?, ?)`,
        ['测试用户', '测试部门', 30]
      );
      console.log('测试数据插入成功');

      // 查询测试数据
      const [testRows] = await connection.execute('SELECT * FROM branch_personnel WHERE name = ?', ['测试用户']);
      debugLog('测试数据查询结果', testRows);
    } catch (testError) {
      console.error('测试数据插入失败:', testError);
    }

    // 导入数据
    console.log('\n开始导入人员数据...');
    const importResult = await importPersonnelData(data, connection);

    console.log(`\n导入完成: 成功 ${importResult.success} 条, 失败 ${importResult.failed} 条`);

    if (importResult.failed > 0) {
      console.log('\n失败记录:');
      importResult.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. 姓名: ${error.name || '未知'}, 错误: ${error.error}`);
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

/**
 * 确保branch_personnel表存在
 * @param {Object} connection 数据库连接
 */
async function ensurePersonnelTableExists(connection) {
  try {
    // 检查表是否存在
    debugLog('检查branch_personnel表是否存在');
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'branch_personnel'",
      [dbConfig.database]
    );

    debugLog('检查表结果', tables);

    if (tables.length === 0) {
      console.log('创建branch_personnel表...');

      // 创建表
      const createTableSQL = `
        CREATE TABLE branch_personnel (
          id INT AUTO_INCREMENT PRIMARY KEY,
          branch_id INT,
          name VARCHAR(50) NOT NULL,
          department_path VARCHAR(255),
          skill_category VARCHAR(100),
          skill_type VARCHAR(100),
          skill_date DATE,
          tech_category VARCHAR(100),
          tech_type VARCHAR(100),
          tech_date DATE,
          education VARCHAR(50),
          age INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
        )
      `;

      debugLog('创建表SQL', createTableSQL);

      try {
        await connection.execute(createTableSQL);
        console.log('表创建成功');
      } catch (createError) {
        console.error('创建表失败:', createError);

        // 如果创建表失败，尝试不使用外键约束创建表
        console.log('尝试不使用外键约束创建表...');
        const createTableWithoutFKSQL = `
          CREATE TABLE branch_personnel (
            id INT AUTO_INCREMENT PRIMARY KEY,
            branch_id INT,
            name VARCHAR(50) NOT NULL,
            department_path VARCHAR(255),
            skill_category VARCHAR(100),
            skill_type VARCHAR(100),
            skill_date DATE,
            tech_category VARCHAR(100),
            tech_type VARCHAR(100),
            tech_date DATE,
            education VARCHAR(50),
            age INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `;

        debugLog('创建表SQL(无外键)', createTableWithoutFKSQL);
        await connection.execute(createTableWithoutFKSQL);
        console.log('表创建成功(无外键约束)');
      }
    } else {
      console.log('branch_personnel表已存在');

      // 检查表结构
      const [columns] = await connection.execute(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'branch_personnel'",
        [dbConfig.database]
      );

      debugLog('branch_personnel表结构', columns);
    }
  } catch (error) {
    console.error('检查/创建表时出错:', error);
    throw error;
  }
}

/**
 * 导入人员数据
 * @param {Array} data 人员数据
 * @param {Object} connection 数据库连接
 * @returns {Object} 导入结果
 */
async function importPersonnelData(data, connection) {
  const result = {
    success: 0,
    failed: 0,
    errors: []
  };

  // 获取所有支部
  debugLog('获取支部列表');
  let branches = [];
  try {
    [branches] = await connection.execute('SELECT id, name FROM branches');
    debugLog('支部列表', branches);
  } catch (branchError) {
    console.error('获取支部列表失败:', branchError);
    // 如果无法获取支部列表，创建一个空数组
    branches = [];
  }

  const branchMap = new Map();
  branches.forEach(branch => {
    branchMap.set(branch.name, branch.id);
  });

  debugLog('支部映射关系', Array.from(branchMap.entries()));

  // 处理每条记录
  for (const record of data) {
    try {
      // 提取字段值
      const name = record['员工基本信息-姓名'] || '';
      const departmentPath = record['组织信息-部门路径'] || '';
      const skillCategory = record['最高技能等级类别'] || '';
      const skillType = record['最高技能等级工种'] || '';
      const skillDate = record['最高技能等级获取时间'] || null;
      const techCategory = record['最高技术等级类别'] || '';
      const techType = record['最高技术等级工种'] || '';
      const techDate = record['最高技术等级获取时间'] || null;
      const education = record['最高学历'] || '';
      const age = record['年龄'] || 0;

      // 尝试从部门路径中提取支部名称
      let branchId = null;
      if (departmentPath) {
        // 假设部门路径格式为 "公司/部门/支部"
        const pathParts = departmentPath.split('/');
        for (let i = pathParts.length - 1; i >= 0; i--) {
          const part = pathParts[i].trim();
          if (branchMap.has(part)) {
            branchId = branchMap.get(part);
            break;
          }
        }
      }

      // 格式化日期
      let formattedSkillDate = null;
      if (skillDate) {
        if (typeof skillDate === 'string') {
          // 尝试解析日期字符串
          const date = new Date(skillDate);
          if (!isNaN(date.getTime())) {
            formattedSkillDate = date.toISOString().split('T')[0];
          }
        } else if (typeof skillDate === 'number') {
          // Excel日期是从1900年1月1日开始的天数
          const date = new Date((skillDate - 25569) * 86400 * 1000);
          formattedSkillDate = date.toISOString().split('T')[0];
        }
      }

      let formattedTechDate = null;
      if (techDate) {
        if (typeof techDate === 'string') {
          const date = new Date(techDate);
          if (!isNaN(date.getTime())) {
            formattedTechDate = date.toISOString().split('T')[0];
          }
        } else if (typeof techDate === 'number') {
          const date = new Date((techDate - 25569) * 86400 * 1000);
          formattedTechDate = date.toISOString().split('T')[0];
        }
      }

      // 检查人员是否已存在
      const [existingPersonnel] = await connection.execute(
        'SELECT id FROM branch_personnel WHERE name = ?',
        [name]
      );

      if (existingPersonnel.length > 0) {
        // 更新现有记录
        const personnelId = existingPersonnel[0].id;
        await connection.execute(
          `UPDATE branch_personnel SET
           branch_id = ?,
           department_path = ?,
           skill_category = ?,
           skill_type = ?,
           skill_date = ?,
           tech_category = ?,
           tech_type = ?,
           tech_date = ?,
           education = ?,
           age = ?
           WHERE id = ?`,
          [
            branchId,
            departmentPath,
            skillCategory,
            skillType,
            formattedSkillDate,
            techCategory,
            techType,
            formattedTechDate,
            education,
            age,
            personnelId
          ]
        );

        console.log(`更新人员: ${name}`);
      } else {
        // 插入新记录
        await connection.execute(
          `INSERT INTO branch_personnel (
            branch_id, name, department_path, skill_category, skill_type, skill_date,
            tech_category, tech_type, tech_date, education, age
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            branchId,
            name,
            departmentPath,
            skillCategory,
            skillType,
            formattedSkillDate,
            techCategory,
            techType,
            formattedTechDate,
            education,
            age
          ]
        );

        console.log(`插入人员: ${name}`);
      }

      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        name: record['员工基本信息-姓名'] || '未知',
        error: error.message
      });

      console.error(`处理人员 ${record['员工基本信息-姓名'] || '未知'} 时出错:`, error);
    }
  }

  return result;
}

// 执行主函数
main().catch(console.error);
