/**
 * 模糊匹配Excel导入工具
 *
 * 此脚本用于读取Excel文件，通过模糊匹配将数据导入到数据库中
 * 支持字段名称的模糊匹配，自动处理数据类型转换
 */

const xlsx = require('xlsx');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');
const readline = require('readline');
const { promisify } = require('util');

// 数据库配置
const db = require('../db');
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

// 表结构定义 - 用于字段映射和类型转换
const tableStructure = {
  branches: {
    fields: [
      { name: 'id', type: 'number', primaryKey: true, autoIncrement: true },
      { name: 'name', type: 'string', aliases: ['支部名称', '党支部名称', '名称'] },
      { name: 'secretary', type: 'string', aliases: ['书记', '支部书记', '党支部书记'] },
      { name: 'deputySecretary', type: 'string', aliases: ['副书记', '支部副书记'] },
      { name: 'organizationalCommissioner', type: 'string', aliases: ['组织委员'] },
      { name: 'disciplinaryCommissioner', type: 'string', aliases: ['纪检委员', '纪律委员'] },
      { name: 'propagandaCommissioner', type: 'string', aliases: ['宣传委员'] },
      { name: 'learningCommissioner', type: 'string', aliases: ['学习委员'] },
      { name: 'memberCount', type: 'number', aliases: ['支部人数', '党员人数', '成员数量'] },
      { name: 'averageAge', type: 'number', aliases: ['平均年龄'] },
      { name: 'performance2024', type: 'string', aliases: ['上年度绩效', '2024年绩效', '绩效'] },
      { name: 'secretaryProject', type: 'string', aliases: ['书记项目', '支部书记项目'] },
      { name: 'honors', type: 'string', aliases: ['获得荣誉', '荣誉', '表彰'] }
    ]
  },
  branch_age_distribution: {
    fields: [
      { name: 'id', type: 'number', primaryKey: true, autoIncrement: true },
      { name: 'branch_id', type: 'number', foreignKey: 'branches.id' },
      { name: 'age_group', type: 'string', aliases: ['年龄段', '年龄分布', '年龄组'] },
      { name: 'percentage', type: 'number', aliases: ['百分比', '占比', '比例'] }
    ]
  },
  branch_education_distribution: {
    fields: [
      { name: 'id', type: 'number', primaryKey: true, autoIncrement: true },
      { name: 'branch_id', type: 'number', foreignKey: 'branches.id' },
      { name: 'education_level', type: 'string', aliases: ['学历', '教育水平', '学历层次'] },
      { name: 'percentage', type: 'number', aliases: ['百分比', '占比', '比例'] }
    ]
  },
  branch_skill_distribution: {
    fields: [
      { name: 'id', type: 'number', primaryKey: true, autoIncrement: true },
      { name: 'branch_id', type: 'number', foreignKey: 'branches.id' },
      { name: 'skill_level', type: 'string', aliases: ['技能等级', '技能水平', '技能层次'] },
      { name: 'percentage', type: 'number', aliases: ['百分比', '占比', '比例'] }
    ]
  },
  branch_title_distribution: {
    fields: [
      { name: 'id', type: 'number', primaryKey: true, autoIncrement: true },
      { name: 'branch_id', type: 'number', foreignKey: 'branches.id' },
      { name: 'title_level', type: 'string', aliases: ['职称', '职称等级', '职称层次'] },
      { name: 'percentage', type: 'number', aliases: ['百分比', '占比', '比例'] }
    ]
  },
  branch_annual_work: {
    fields: [
      { name: 'id', type: 'number', primaryKey: true, autoIncrement: true },
      { name: 'branch_id', type: 'number', foreignKey: 'branches.id' },
      { name: 'task', type: 'string', aliases: ['工作任务', '任务', '工作内容'] },
      { name: 'startTime', type: 'string', aliases: ['开始时间', '起始时间', '开始日期'] },
      { name: 'endTime', type: 'string', aliases: ['结束时间', '截止时间', '结束日期'] },
      { name: 'status', type: 'string', aliases: ['状态', '进展状态', '完成状态'] },
      { name: 'progress', type: 'number', aliases: ['进度', '完成进度', '完成百分比'] }
    ]
  }
};

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

/**
 * 模糊匹配字段名
 * @param {string} columnName Excel中的列名
 * @param {Array} fields 数据库字段定义
 * @returns {Object|null} 匹配的字段或null
 */
function fuzzyMatchField(columnName, fields) {
  // 首先尝试精确匹配
  const exactMatch = fields.find(field =>
    field.name.toLowerCase() === columnName.toLowerCase() ||
    (field.aliases && field.aliases.some(alias => alias.toLowerCase() === columnName.toLowerCase()))
  );

  if (exactMatch) return exactMatch;

  // 如果没有精确匹配，尝试模糊匹配
  let bestMatch = null;
  let bestScore = 0.5; // 设置一个阈值，避免匹配太差的结果

  fields.forEach(field => {
    // 检查字段名的相似度
    const nameScore = stringSimilarity.compareTwoStrings(
      columnName.toLowerCase(),
      field.name.toLowerCase()
    );

    if (nameScore > bestScore) {
      bestMatch = field;
      bestScore = nameScore;
    }

    // 检查别名的相似度
    if (field.aliases) {
      field.aliases.forEach(alias => {
        const aliasScore = stringSimilarity.compareTwoStrings(
          columnName.toLowerCase(),
          alias.toLowerCase()
        );

        if (aliasScore > bestScore) {
          bestMatch = field;
          bestScore = aliasScore;
        }
      });
    }
  });

  return bestMatch;
}

/**
 * 转换数据类型
 * @param {any} value 原始值
 * @param {string} type 目标类型
 * @returns {any} 转换后的值
 */
function convertDataType(value, type) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (type) {
    case 'number':
      // 处理百分比格式
      if (typeof value === 'string' && value.includes('%')) {
        return parseFloat(value.replace('%', ''));
      }
      return Number(value);
    case 'string':
      return String(value);
    case 'boolean':
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        if (['true', 'yes', '是', '1'].includes(lowerValue)) return true;
        if (['false', 'no', '否', '0'].includes(lowerValue)) return false;
      }
      return Boolean(value);
    case 'date':
      return new Date(value);
    default:
      return value;
  }
}

/**
 * 读取Excel文件
 * @param {string} filePath Excel文件路径
 * @returns {Object} 包含工作表数据的对象
 */
function readExcelFile(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const result = {};

    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      result[sheetName] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    });

    return result;
  } catch (error) {
    console.error('读取Excel文件失败:', error);
    throw error;
  }
}

/**
 * 解析Excel数据并映射到数据库结构
 * @param {Array} sheetData Excel工作表数据
 * @param {string} tableName 目标表名
 * @returns {Object} 映射结果
 */
function parseExcelData(sheetData, tableName) {
  if (!sheetData || sheetData.length < 2) {
    throw new Error(`工作表数据不完整，至少需要标题行和一行数据`);
  }

  const tableFields = tableStructure[tableName].fields;
  const headerRow = sheetData[0];
  const dataRows = sheetData.slice(1);

  // 映射列名到数据库字段
  const columnMapping = [];

  headerRow.forEach((columnName, index) => {
    if (!columnName) return; // 跳过空列名

    const matchedField = fuzzyMatchField(columnName, tableFields);
    if (matchedField) {
      columnMapping.push({
        columnIndex: index,
        field: matchedField,
        originalName: columnName
      });
    }
  });

  // 解析数据行
  const parsedData = [];

  dataRows.forEach(row => {
    if (row.length === 0 || row.every(cell => cell === null || cell === undefined || cell === '')) {
      return; // 跳过空行
    }

    const rowData = {};

    columnMapping.forEach(mapping => {
      const value = row[mapping.columnIndex];
      const convertedValue = convertDataType(value, mapping.field.type);
      rowData[mapping.field.name] = convertedValue;
    });

    parsedData.push(rowData);
  });

  return {
    columnMapping,
    data: parsedData
  };
}

/**
 * 将解析后的数据导入到数据库
 * @param {Array} data 解析后的数据
 * @param {string} tableName 目标表名
 * @param {Object} connection 数据库连接
 * @returns {Promise<Object>} 导入结果
 */
async function importDataToDatabase(data, tableName, connection) {
  if (!data || data.length === 0) {
    return { success: false, message: '没有数据可导入' };
  }

  try {
    const result = {
      success: true,
      inserted: 0,
      updated: 0,
      errors: []
    };

    // 获取表的主键
    const primaryKeyField = tableStructure[tableName].fields.find(f => f.primaryKey);
    const primaryKey = primaryKeyField ? primaryKeyField.name : null;

    // 处理每一行数据
    for (const row of data) {
      try {
        // 准备SQL语句
        const fields = Object.keys(row).filter(key => {
          // 排除自增主键
          const field = tableStructure[tableName].fields.find(f => f.name === key);
          return !(field && field.primaryKey && field.autoIncrement);
        });

        const values = fields.map(field => row[field]);
        const placeholders = fields.map(() => '?').join(', ');

        // 构建INSERT或UPDATE语句
        let sql;
        let params;

        if (primaryKey && row[primaryKey] && !primaryKeyField.autoIncrement) {
          // 如果有主键值且不是自增的，尝试更新
          const updateFields = fields.map(field => `${field} = ?`).join(', ');
          sql = `UPDATE ${tableName} SET ${updateFields} WHERE ${primaryKey} = ?`;
          params = [...values, row[primaryKey]];

          const [updateResult] = await connection.execute(sql, params);

          if (updateResult.affectedRows > 0) {
            result.updated++;
          } else {
            // 如果更新失败（记录不存在），则插入
            sql = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
            params = values;

            const [insertResult] = await connection.execute(sql, params);
            result.inserted++;
          }
        } else {
          // 没有主键值或主键是自增的，直接插入
          sql = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
          params = values;

          const [insertResult] = await connection.execute(sql, params);
          result.inserted++;
        }
      } catch (error) {
        result.errors.push({
          row,
          error: error.message
        });
      }
    }

    return result;
  } catch (error) {
    console.error(`导入数据到表 ${tableName} 失败:`, error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * 处理分布数据（年龄、学历、技能、职称）
 * @param {Array} branchData 支部基本数据
 * @param {Object} distributionData 分布数据
 * @param {Object} connection 数据库连接
 * @returns {Promise<Object>} 处理结果
 */
async function processDistributionData(branchData, distributionData, connection) {
  const result = {
    ageDistribution: { processed: 0, errors: [] },
    educationDistribution: { processed: 0, errors: [] },
    skillDistribution: { processed: 0, errors: [] },
    titleDistribution: { processed: 0, errors: [] }
  };

  // 获取所有支部ID
  const [branches] = await connection.execute('SELECT id, name FROM branches');
  const branchMap = new Map();
  branches.forEach(branch => {
    branchMap.set(branch.name.toLowerCase(), branch.id);
  });

  // 处理年龄分布
  if (distributionData.ageDistribution && distributionData.ageDistribution.data) {
    for (const row of distributionData.ageDistribution.data) {
      try {
        const branchName = row.branch_name || '';
        const branchId = branchMap.get(branchName.toLowerCase());

        if (!branchId) continue;

        // 删除现有数据
        await connection.execute('DELETE FROM branch_age_distribution WHERE branch_id = ?', [branchId]);

        // 插入新数据
        const ageGroups = ['18-28岁', '28-35岁', '35-50岁', '50-60岁'];
        for (const ageGroup of ageGroups) {
          if (row[ageGroup] !== undefined) {
            await connection.execute(
              'INSERT INTO branch_age_distribution (branch_id, age_group, percentage) VALUES (?, ?, ?)',
              [branchId, ageGroup, convertDataType(row[ageGroup], 'number')]
            );
            result.ageDistribution.processed++;
          }
        }
      } catch (error) {
        result.ageDistribution.errors.push({
          row,
          error: error.message
        });
      }
    }
  }

  // 处理学历分布
  if (distributionData.educationDistribution && distributionData.educationDistribution.data) {
    for (const row of distributionData.educationDistribution.data) {
      try {
        const branchName = row.branch_name || '';
        const branchId = branchMap.get(branchName.toLowerCase());

        if (!branchId) continue;

        // 删除现有数据
        await connection.execute('DELETE FROM branch_education_distribution WHERE branch_id = ?', [branchId]);

        // 插入新数据
        const educationLevels = ['大专及以下', '本科', '硕士', '博士'];
        for (const level of educationLevels) {
          if (row[level] !== undefined) {
            await connection.execute(
              'INSERT INTO branch_education_distribution (branch_id, education_level, percentage) VALUES (?, ?, ?)',
              [branchId, level, convertDataType(row[level], 'number')]
            );
            result.educationDistribution.processed++;
          }
        }
      } catch (error) {
        result.educationDistribution.errors.push({
          row,
          error: error.message
        });
      }
    }
  }

  // 处理技能分布
  if (distributionData.skillDistribution && distributionData.skillDistribution.data) {
    for (const row of distributionData.skillDistribution.data) {
      try {
        const branchName = row.branch_name || '';
        const branchId = branchMap.get(branchName.toLowerCase());

        if (!branchId) continue;

        // 删除现有数据
        await connection.execute('DELETE FROM branch_skill_distribution WHERE branch_id = ?', [branchId]);

        // 插入新数据
        const skillLevels = ['初中级工', '高级工', '技师', '高级技师'];
        for (const level of skillLevels) {
          if (row[level] !== undefined) {
            await connection.execute(
              'INSERT INTO branch_skill_distribution (branch_id, skill_level, percentage) VALUES (?, ?, ?)',
              [branchId, level, convertDataType(row[level], 'number')]
            );
            result.skillDistribution.processed++;
          }
        }
      } catch (error) {
        result.skillDistribution.errors.push({
          row,
          error: error.message
        });
      }
    }
  }

  // 处理职称分布
  if (distributionData.titleDistribution && distributionData.titleDistribution.data) {
    for (const row of distributionData.titleDistribution.data) {
      try {
        const branchName = row.branch_name || '';
        const branchId = branchMap.get(branchName.toLowerCase());

        if (!branchId) continue;

        // 删除现有数据
        await connection.execute('DELETE FROM branch_title_distribution WHERE branch_id = ?', [branchId]);

        // 插入新数据
        const titleLevels = ['助理工程师', '工程师', '高级工程师', '正高级工程师'];
        for (const level of titleLevels) {
          if (row[level] !== undefined) {
            await connection.execute(
              'INSERT INTO branch_title_distribution (branch_id, title_level, percentage) VALUES (?, ?, ?)',
              [branchId, level, convertDataType(row[level], 'number')]
            );
            result.titleDistribution.processed++;
          }
        }
      } catch (error) {
        result.titleDistribution.errors.push({
          row,
          error: error.message
        });
      }
    }
  }

  return result;
}

/**
 * 处理年度工作数据
 * @param {Array} annualWorkData 年度工作数据
 * @param {Object} connection 数据库连接
 * @returns {Promise<Object>} 处理结果
 */
async function processAnnualWorkData(annualWorkData, connection) {
  const result = {
    processed: 0,
    errors: []
  };

  if (!annualWorkData || !annualWorkData.data || annualWorkData.data.length === 0) {
    return result;
  }

  // 获取所有支部ID
  const [branches] = await connection.execute('SELECT id, name FROM branches');
  const branchMap = new Map();
  branches.forEach(branch => {
    branchMap.set(branch.name.toLowerCase(), branch.id);
  });

  for (const row of annualWorkData.data) {
    try {
      const branchName = row.branch_name || '';
      const branchId = branchMap.get(branchName.toLowerCase());

      if (!branchId) continue;

      // 检查必要字段
      if (!row.task) continue;

      // 准备数据
      const task = row.task;
      const startTime = row.startTime || row.start_time || '';
      const endTime = row.endTime || row.end_time || '';
      const status = row.status || '未开始';
      const progress = convertDataType(row.progress || 0, 'number');

      // 插入数据
      await connection.execute(
        'INSERT INTO branch_annual_work (branch_id, task, startTime, endTime, status, progress) VALUES (?, ?, ?, ?, ?, ?)',
        [branchId, task, startTime, endTime, status, progress]
      );

      result.processed++;
    } catch (error) {
      result.errors.push({
        row,
        error: error.message
      });
    }
  }

  return result;
}

/**
 * 主函数
 */
async function main() {
  console.log('=== 模糊匹配Excel导入工具 ===');

  try {
    // 获取Excel文件路径
    const excelPath = await question('请输入Excel文件路径: ');

    if (!fs.existsSync(excelPath)) {
      console.error('文件不存在，请检查路径是否正确');
      rl.close();
      return;
    }

    console.log('正在读取Excel文件...');
    const excelData = readExcelFile(excelPath);

    // 连接数据库
    console.log('正在连接数据库...');
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    });

    console.log('数据库连接成功');

    // 解析并导入支部基本信息
    console.log('\n处理支部基本信息...');
    let branchesSheet = null;

    // 尝试找到包含支部信息的工作表
    for (const sheetName in excelData) {
      if (sheetName.toLowerCase().includes('支部') ||
          sheetName.toLowerCase().includes('branch') ||
          sheetName.toLowerCase().includes('基本')) {
        branchesSheet = sheetName;
        break;
      }
    }

    if (!branchesSheet && Object.keys(excelData).length > 0) {
      // 如果没有找到匹配的工作表名，使用第一个工作表
      branchesSheet = Object.keys(excelData)[0];
    }

    if (!branchesSheet) {
      console.error('未找到有效的工作表');
      await connection.end();
      rl.close();
      return;
    }

    console.log(`使用工作表 "${branchesSheet}" 作为支部基本信息`);

    const branchesData = parseExcelData(excelData[branchesSheet], 'branches');

    console.log('列映射结果:');
    branchesData.columnMapping.forEach(mapping => {
      console.log(`  Excel列 "${mapping.originalName}" -> 数据库字段 "${mapping.field.name}"`);
    });

    console.log(`共解析 ${branchesData.data.length} 条支部数据`);

    // 确认是否继续
    const confirmImport = await question('是否继续导入数据? (y/n): ');

    if (confirmImport.toLowerCase() !== 'y') {
      console.log('操作已取消');
      await connection.end();
      rl.close();
      return;
    }

    // 开始导入数据
    console.log('\n开始导入数据...');

    // 导入支部基本信息
    const branchImportResult = await importDataToDatabase(branchesData.data, 'branches', connection);

    console.log('\n支部基本信息导入结果:');
    console.log(`  成功: ${branchImportResult.success}`);
    console.log(`  插入: ${branchImportResult.inserted} 条`);
    console.log(`  更新: ${branchImportResult.updated} 条`);
    console.log(`  错误: ${branchImportResult.errors.length} 条`);

    // 处理分布数据
    console.log('\n处理分布数据...');

    const distributionData = {
      ageDistribution: null,
      educationDistribution: null,
      skillDistribution: null,
      titleDistribution: null
    };

    // 尝试找到分布数据工作表
    for (const sheetName in excelData) {
      const lowerSheetName = sheetName.toLowerCase();

      if (lowerSheetName.includes('年龄') || lowerSheetName.includes('age')) {
        distributionData.ageDistribution = parseExcelData(excelData[sheetName], 'branch_age_distribution');
      } else if (lowerSheetName.includes('学历') || lowerSheetName.includes('education')) {
        distributionData.educationDistribution = parseExcelData(excelData[sheetName], 'branch_education_distribution');
      } else if (lowerSheetName.includes('技能') || lowerSheetName.includes('skill')) {
        distributionData.skillDistribution = parseExcelData(excelData[sheetName], 'branch_skill_distribution');
      } else if (lowerSheetName.includes('职称') || lowerSheetName.includes('title')) {
        distributionData.titleDistribution = parseExcelData(excelData[sheetName], 'branch_title_distribution');
      }
    }

    const distributionResult = await processDistributionData(branchesData.data, distributionData, connection);

    console.log('\n分布数据处理结果:');
    console.log(`  年龄分布: 处理 ${distributionResult.ageDistribution.processed} 条, 错误 ${distributionResult.ageDistribution.errors.length} 条`);
    console.log(`  学历分布: 处理 ${distributionResult.educationDistribution.processed} 条, 错误 ${distributionResult.educationDistribution.errors.length} 条`);
    console.log(`  技能分布: 处理 ${distributionResult.skillDistribution.processed} 条, 错误 ${distributionResult.skillDistribution.errors.length} 条`);
    console.log(`  职称分布: 处理 ${distributionResult.titleDistribution.processed} 条, 错误 ${distributionResult.titleDistribution.errors.length} 条`);

    // 处理年度工作数据
    console.log('\n处理年度工作数据...');

    let annualWorkSheet = null;

    // 尝试找到包含年度工作的工作表
    for (const sheetName in excelData) {
      if (sheetName.toLowerCase().includes('工作') ||
          sheetName.toLowerCase().includes('work') ||
          sheetName.toLowerCase().includes('任务') ||
          sheetName.toLowerCase().includes('task')) {
        annualWorkSheet = sheetName;
        break;
      }
    }

    if (annualWorkSheet) {
      console.log(`使用工作表 "${annualWorkSheet}" 作为年度工作数据`);

      const annualWorkData = parseExcelData(excelData[annualWorkSheet], 'branch_annual_work');
      const annualWorkResult = await processAnnualWorkData(annualWorkData, connection);

      console.log('\n年度工作数据处理结果:');
      console.log(`  处理: ${annualWorkResult.processed} 条`);
      console.log(`  错误: ${annualWorkResult.errors.length} 条`);
    } else {
      console.log('未找到年度工作数据工作表');
    }

    console.log('\n数据导入完成!');

    // 关闭数据库连接
    await connection.end();
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    rl.close();
  }
}

// 如果直接运行此脚本，则执行main函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  readExcelFile,
  parseExcelData,
  importDataToDatabase,
  processDistributionData,
  processAnnualWorkData,
  fuzzyMatchField,
  convertDataType
};
