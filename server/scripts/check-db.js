/**
 * 数据库检查工具
 *
 * 此脚本用于检查数据库连接和表结构
 */

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

async function main() {
  console.log('=== 数据库检查工具 ===');

  try {
    // 连接数据库
    console.log('正在连接数据库...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');

    // 检查数据库版本
    const [versionResult] = await connection.execute('SELECT VERSION() as version');
    console.log(`MySQL版本: ${versionResult[0].version}`);

    // 检查数据库字符集
    const [charsetResult] = await connection.execute('SHOW VARIABLES LIKE "character_set_database"');
    console.log(`数据库字符集: ${charsetResult[0].Value}`);

    // 检查数据库排序规则
    const [collationResult] = await connection.execute('SHOW VARIABLES LIKE "collation_database"');
    console.log(`数据库排序规则: ${collationResult[0].Value}`);

    // 列出所有表
    const [tables] = await connection.execute(
      'SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
      [dbConfig.database]
    );

    console.log(`\n数据库中共有 ${tables.length} 个表:`);
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.TABLE_NAME} (约 ${table.TABLE_ROWS || 0} 行, 创建于 ${table.CREATE_TIME || 'unknown'})`);
    });

    // 检查是否存在员工表
    const employeesTables = tables.filter(t =>
      t.TABLE_NAME === 'employees' ||
      t.TABLE_NAME === 'simple_employees'
    );

    if (employeesTables.length > 0) {
      console.log('\n找到员工相关表:');

      for (const table of employeesTables) {
        console.log(`\n表 ${table.TABLE_NAME} 的结构:`);

        // 获取表结构
        const [columns] = await connection.execute(
          `SHOW COLUMNS FROM ${table.TABLE_NAME}`
        );

        columns.forEach((column, index) => {
          console.log(`  ${index + 1}. ${column.Field} (${column.Type}, ${column.Null === 'YES' ? '可为空' : '不可为空'}${column.Key === 'PRI' ? ', 主键' : ''})`);
        });

        // 获取表中的记录数
        const [countResult] = await connection.execute(
          `SELECT COUNT(*) as count FROM ${table.TABLE_NAME}`
        );

        console.log(`\n表 ${table.TABLE_NAME} 中共有 ${countResult[0].count} 条记录`);

        // 如果有记录，显示前5条
        if (countResult[0].count > 0) {
          const [records] = await connection.execute(
            `SELECT * FROM ${table.TABLE_NAME} LIMIT 5`
          );

          console.log(`\n前5条记录示例:`);
          records.forEach((record, index) => {
            console.log(`\n记录 ${index + 1}:`);
            Object.keys(record).forEach(key => {
              if (record[key] !== null) {
                console.log(`  ${key}: ${record[key]}`);
              }
            });
          });
        }
      }
    } else {
      console.log('\n未找到员工相关表，请先导入数据');
    }

    // 关闭数据库连接
    await connection.end();
    console.log('\n检查完成');
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行主函数
main().catch(console.error);
