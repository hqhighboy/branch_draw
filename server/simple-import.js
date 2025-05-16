/**
 * 简化版Excel导入工具
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

async function main() {
  console.log('=== 简化版Excel导入工具 ===');

  // 创建命令行交互界面
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = promisify(rl.question).bind(rl);

  try {
    // 提示用户输入Excel文件路径
    console.log('请将Excel数据文件放在任意位置，然后输入完整路径');
    console.log('例如：D:\\Data\\branch_data.xlsx 或 C:\\Users\\YourName\\Desktop\\branch_data.xlsx');
    console.log('如果您想使用默认模板，请直接按回车');

    let excelPath = await question('请输入Excel文件路径: ');

    // 如果用户没有输入路径，使用默认模板
    if (!excelPath.trim()) {
      excelPath = path.join(__dirname, 'import_template.xlsx');
      console.log(`使用默认模板: ${excelPath}`);
    }

    if (!fs.existsSync(excelPath)) {
      console.error('文件不存在，请检查路径是否正确');
      rl.close();
      return;
    }

    console.log('正在读取Excel文件...');
    const workbook = xlsx.readFile(excelPath);

    // 连接数据库
    console.log('正在连接数据库...');
    const connection = await mysql.createConnection(dbConfig);

    console.log('数据库连接成功');

    // 读取支部基本信息
    const branchesSheet = workbook.Sheets['支部基本信息'];
    const branchesData = xlsx.utils.sheet_to_json(branchesSheet);

    console.log(`读取到 ${branchesData.length} 条支部数据`);

    // 导入支部基本信息
    for (const branch of branchesData) {
      try {
        // 检查支部是否已存在
        const [existingBranches] = await connection.execute(
          'SELECT id FROM branches WHERE name = ?',
          [branch['支部名称']]
        );

        if (existingBranches.length > 0) {
          // 更新现有支部
          const branchId = existingBranches[0].id;
          await connection.execute(
            `UPDATE branches SET
             secretary = ?,
             deputy_secretary = ?,
             organizational_commissioner = ?,
             disciplinary_commissioner = ?,
             propaganda_commissioner = ?,
             learning_commissioner = ?,
             member_count = ?,
             average_age = ?,
             performance_2024 = ?,
             secretary_project = ?,
             honors = ?
             WHERE id = ?`,
            [
              branch['书记'],
              branch['副书记'],
              branch['组织委员'],
              branch['纪检委员'],
              branch['宣传委员'],
              branch['学习委员'],
              branch['支部人数'],
              branch['平均年龄'],
              branch['上年度绩效'],
              branch['书记项目'],
              branch['获得荣誉'],
              branchId
            ]
          );
          console.log(`更新支部: ${branch['支部名称']}`);
        } else {
          // 插入新支部
          const [result] = await connection.execute(
            `INSERT INTO branches (
              name, secretary, deputy_secretary, organizational_commissioner,
              disciplinary_commissioner, propaganda_commissioner, learning_commissioner,
              member_count, average_age, performance_2024, secretary_project, honors
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              branch['支部名称'],
              branch['书记'],
              branch['副书记'],
              branch['组织委员'],
              branch['纪检委员'],
              branch['宣传委员'],
              branch['学习委员'],
              branch['支部人数'],
              branch['平均年龄'],
              branch['上年度绩效'],
              branch['书记项目'],
              branch['获得荣誉']
            ]
          );
          console.log(`插入支部: ${branch['支部名称']}, ID: ${result.insertId}`);
        }
      } catch (error) {
        console.error(`处理支部 ${branch['支部名称']} 时出错:`, error);
      }
    }

    console.log('\n数据导入完成!');

    // 关闭数据库连接
    await connection.end();
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    // 关闭命令行交互界面
    rl.close();
  }
}

// 执行主函数
main().catch(console.error);
