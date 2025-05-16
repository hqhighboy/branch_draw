/**
 * 员工信息Excel导入工具
 *
 * 此脚本用于将员工信息Excel表格导入到数据库
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
      if (typeof data === 'object') {
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(data);
      }
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
 * 将日期字符串转换为MySQL日期格式
 * @param {string|number} dateValue 日期值
 * @returns {string|null} MySQL日期格式或null
 */
function formatDate(dateValue) {
  if (!dateValue) return null;

  // 如果是日期对象，直接格式化
  if (dateValue instanceof Date) {
    if (isNaN(dateValue.getTime())) return null;
    return dateValue.toISOString().split('T')[0];
  }

  try {
    let date;

    if (typeof dateValue === 'string') {
      // 处理特殊格式
      if (dateValue.includes('/')) {
        // 处理 MM/DD/YYYY 或 YYYY/MM/DD 格式
        const parts = dateValue.split('/');
        if (parts.length === 3) {
          // 判断是哪种格式
          if (parseInt(parts[0]) > 1000) {
            // YYYY/MM/DD
            date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          } else {
            // MM/DD/YYYY
            date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
          }
        } else {
          date = new Date(dateValue);
        }
      } else if (dateValue.includes('-')) {
        // 处理 YYYY-MM-DD 格式
        date = new Date(dateValue);
      } else if (dateValue.includes('.')) {
        // 处理 DD.MM.YYYY 格式
        const parts = dateValue.split('.');
        if (parts.length === 3) {
          date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          date = new Date(dateValue);
        }
      } else if (/^\d{8}$/.test(dateValue)) {
        // 处理 YYYYMMDD 格式
        const year = parseInt(dateValue.substring(0, 4));
        const month = parseInt(dateValue.substring(4, 6)) - 1;
        const day = parseInt(dateValue.substring(6, 8));
        date = new Date(year, month, day);
      } else {
        // 尝试其他格式
        date = new Date(dateValue);
      }
    } else if (typeof dateValue === 'number') {
      // Excel日期是从1900年1月1日开始的天数
      date = new Date((dateValue - 25569) * 86400 * 1000);
    }

    if (isNaN(date.getTime())) {
      // 如果日期无效，返回null
      return null;
    }

    // 检查日期是否合理
    const year = date.getFullYear();
    if (year < 1900 || year > 2100) {
      // 年份超出合理范围
      return null;
    }

    // 格式化为 YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error(`日期格式化错误: ${dateValue}`, error);
    return null;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('=== 员工信息Excel导入工具 ===');

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
    console.log('请稍等，这可能需要一些时间，取决于文件大小...');

    let workbook;
    try {
      // 设置读取选项，增加内存效率
      workbook = xlsx.readFile(excelPath, {
        cellFormula: false, // 不解析公式
        cellHTML: false,    // 不解析HTML
        cellText: false,    // 不解析文本
        cellStyles: false,  // 不解析样式
        cellDates: true,    // 将日期转换为日期对象
        sheetStubs: false,  // 忽略空单元格
        dense: true         // 使用稀疏数组格式
      });
      console.log('Excel文件读取成功');
    } catch (readError) {
      console.error('Excel文件读取失败:', readError);
      throw readError;
    }

    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 将工作表转换为JSON
    console.log('正在将工作表转换为JSON格式...');

    let data;
    try {
      data = xlsx.utils.sheet_to_json(worksheet, {
        raw: true,       // 使用原始值
        defval: null,    // 空单元格的默认值
        header: 'A'      // 使用列标识符作为键
      });

      // 如果使用列标识符作为键，需要将第一行作为列名
      const headers = {};
      const headerRow = worksheet['!ref'] ? xlsx.utils.decode_range(worksheet['!ref']).s.r : 0;

      // 遍历第一行，获取列名
      for (let col = 0; col < 100; col++) { // 假设最多100列
        const cellAddress = xlsx.utils.encode_cell({ r: headerRow, c: col });
        const cell = worksheet[cellAddress];
        if (!cell) break;
        headers[xlsx.utils.encode_col(col)] = cell.v;
      }

      // 使用真实列名重新转换数据
      data = data.map(row => {
        const newRow = {};
        Object.keys(row).forEach(key => {
          if (headers[key]) {
            newRow[headers[key]] = row[key];
          }
        });
        return newRow;
      });

      // 移除第一行（列名行）
      data = data.slice(1);

      console.log(`读取到 ${data.length} 条员工记录`);
    } catch (jsonError) {
      console.error('转换数据失败:', jsonError);

      // 尝试使用更简单的方法
      console.log('尝试使用备用方法转换数据...');
      try {
        data = xlsx.utils.sheet_to_json(worksheet);
        console.log(`转换成功，读取到 ${data.length} 条员工记录`);
      } catch (fallbackError) {
        console.error('备用方法也失败:', fallbackError);
        throw fallbackError;
      }
    }

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

    // 确认是否继续导入
    const confirmImport = await question('\n确认导入数据到数据库? (y/n): ');

    if (confirmImport.toLowerCase() !== 'y') {
      console.log('操作已取消');
      await connection.end();
      rl.close();
      return;
    }

    // 开始导入数据
    console.log('\n开始导入数据...');

    // 清空现有数据
    console.log('清空现有数据...');
    await connection.execute('TRUNCATE TABLE employees');

    // 导入数据
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // 设置批量处理大小
    const batchSize = 10;
    const totalRecords = data.length;

    console.log(`开始分批导入数据，每批 ${batchSize} 条记录...`);

    // 分批处理数据
    for (let i = 0; i < totalRecords; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, totalRecords);
      console.log(`正在处理第 ${i+1} 至 ${batchEnd} 条记录 (共 ${totalRecords} 条)...`);

      // 处理当前批次的数据
      for (let j = i; j < batchEnd; j++) {
        const record = data[j];

        try {
        // 构建插入语句
        const insertSQL = `
          INSERT INTO employees (
            name, employee_code, gender, birth_date, age, ethnicity, native_place, work_years,
            birth_place, education_level, political_status, company_name, department_name,
            department_path, team_name, position_name, position_level, position_category,
            position_specialty, position_sequence, current_position, current_position_level,
            tech_expert_level, tech_expert_specialty, skill_expert_level, skill_expert_specialty,
            tenure_years, current_position_date, work_start_date, continuous_work_start_date,
            join_system_date, join_company_date, mobile_phone, education_history,
            professional_certs, current_cert_name, current_cert_level, current_cert_specialty,
            current_cert_sub_specialty, current_cert_date, current_cert_issuer, current_cert_import_date,
            competency_certs, current_competency_name, current_competency_level, current_competency_date,
            current_competency_issuer, vocational_certs, current_vocational_name, current_vocational_level,
            current_vocational_type, current_vocational_date, current_vocational_issuer,
            current_vocational_number, current_vocational_import_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // 准备参数
        const params = [
          record['员工基本信息-姓名'] || null,
          record['员工基本信息-员工编码'] || null,
          record['员工基本信息-性别'] || null,
          formatDate(record['员工基本信息-出生日期']),
          record['员工基本信息-年龄'] || null,
          record['员工基本信息-民族'] || null,
          record['员工基本信息-籍贯'] || null,
          record['员工基本信息-工龄'] || null,
          record['员工基本信息-出生地'] || null,
          record['员工基本信息-文化程度'] || null,
          record['员工基本信息-政治面貌'] || null,
          record['组织信息-单位名称'] || null,
          record['组织信息-部门名称'] || null,
          record['组织信息-部门路径'] || null,
          record['组织信息-班组名称'] || null,
          record['组织信息-岗位名称'] || null,
          record['组织信息-岗位层级'] || null,
          record['组织信息-岗位类别'] || null,
          record['组织信息-岗位专业分类'] || null,
          record['组织信息-岗位序列'] || null,
          record['职务信息-现任职务'] || null,
          record['职务信息-现任职务级别'] || null,
          record['技术专家-技术专家等级'] || null,
          record['技术专家-技术专家专业'] || null,
          record['技能专家-技能专家等级'] || null,
          record['技能专家-技能专家专业'] || null,
          record['员工工作信息-任职年限'] || null,
          formatDate(record['员工工作信息-现任岗位聘任日期']),
          formatDate(record['员工工作信息-参加工作日期']),
          formatDate(record['员工工作信息-连续工龄起算日期']),
          formatDate(record['员工工作信息-入南网系统日期']),
          formatDate(record['员工工作信息-入本单位日期']),
          record['员工联系信息-手机'] || null,
          record['学历学位教育-有学历学位教育-(入学日期,毕业日期,毕业院校,院校类别)'] || null,
          record['职称资格证书-多个职称资格证书-(资格名称,资格等级,专业名称,分支专业,资格取得时间,审批发证单位,是否当前证书,入库时间)'] || null,
          record['职称资格证书-当前-职称资格证书资格名称'] || null,
          record['职称资格证书-当前-职称资格证书资格等级'] || null,
          record['职称资格证书-当前-职称资格证书专业名称'] || null,
          record['职称资格证书-当前-职称资格证书分支专业'] || null,
          formatDate(record['职称资格证书-当前-职称资格证书资格取得时间']),
          record['职称资格证书-当前-职称资格证书审批发证单位'] || null,
          formatDate(record['职称资格证书-当前-职称资格证书入库时间']),
          record['岗位胜任能力资格证书-多个岗位胜任能力资格证书-(资格名称,岗位胜任能力证书等级,资格取得时间,审批发证单位,是否当前)'] || null,
          record['岗位胜任能力资格证书-当前-岗位胜任能力资格证书资格名称'] || null,
          record['岗位胜任能力资格证书-当前-岗位胜任能力证书等级'] || null,
          formatDate(record['岗位胜任能力资格证书-当前-岗位胜任能力资格证书资格取得时间']),
          record['岗位胜任能力资格证书-当前-岗位胜任能力资格证书审批发证单位'] || null,
          record['职业技能等级认定证书-多个职业技能等级认定证书-(资格名称,资格等级,工种名称,资格取得时间,审批发证单位,证书编号,入库时间,是否当前证书)'] || null,
          record['职业技能等级认定证书-当前-职业技能等级认定证书资格名称'] || null,
          record['职业技能等级认定证书-当前-职业技能等级认定证书资格等级'] || null,
          record['职业技能等级认定证书-当前-职业技能等级认定证书工种名称'] || null,
          formatDate(record['职业技能等级认定证书-当前-职业技能等级认定证书资格取得时间']),
          record['职业技能等级认定证书-当前-职业技能等级认定证书审批发证单位'] || null,
          record['职业技能等级认定证书-当前-职业技能等级认定证书证书编号'] || null,
          formatDate(record['职业技能等级认定证书-当前-职业技能等级认定证书入库时间'])
        ];

        // 执行插入
        try {
          await connection.execute(insertSQL, params);
          successCount++;
        } catch (sqlError) {
          // 如果插入失败，尝试使用更简单的方法
          console.error(`插入记录 ${j+1} 失败:`, sqlError.message);

          // 尝试只插入基本字段
          try {
            const basicInsertSQL = `
              INSERT INTO employees (name, employee_code, department_name, position_name)
              VALUES (?, ?, ?, ?)
            `;

            const basicParams = [
              record['员工基本信息-姓名'] || null,
              record['员工基本信息-员工编码'] || null,
              record['组织信息-部门名称'] || null,
              record['组织信息-岗位名称'] || null
            ];

            await connection.execute(basicInsertSQL, basicParams);
            console.log(`记录 ${j+1} 使用基本字段插入成功`);
            successCount++;
          } catch (basicError) {
            console.error(`基本字段插入也失败:`, basicError.message);
            throw basicError;
          }
        }
      } catch (error) {
        errorCount++;
        errors.push({
          index: j,
          name: record['员工基本信息-姓名'] || '未知',
          error: error.message
        });

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

    if (errorCount > 0) {
      console.log('\n失败记录:');
      errors.slice(0, 5).forEach((error, index) => {
        console.log(`  ${index + 1}. 姓名: ${error.name}, 错误: ${error.error}`);
      });

      if (errors.length > 5) {
        console.log(`  ...以及其他 ${errors.length - 5} 条错误记录`);
      }
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
