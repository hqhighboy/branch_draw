/**
 * 清空所有数据脚本
 * 
 * 此脚本用于清空数据库中的所有数据
 */

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'bdes@123',
  database: 'db'
};

/**
 * 清空所有数据
 */
async function clearAllData() {
  console.log('开始清空所有数据...');
  
  const conn = await mysql.createConnection(dbConfig);
  
  try {
    // 禁用外键检查
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // 获取所有表名
    const [tables] = await conn.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'db'
    `);
    
    console.log(`找到 ${tables.length} 个表`);
    
    // 清空所有表
    for (const table of tables) {
      const tableName = table.TABLE_NAME || table.table_name;
      console.log(`清空表: ${tableName}`);
      await conn.query(`TRUNCATE TABLE \`${tableName}\``);
    }
    
    // 重新启用外键检查
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('所有数据已清空');
  } catch (error) {
    console.error('清空数据时出错:', error);
  } finally {
    await conn.end();
  }
}

// 执行清空
clearAllData().catch(console.error);
