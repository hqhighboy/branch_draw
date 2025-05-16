const mysql = require('mysql2/promise');

async function clearDatabase() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'bdes@123',
      database: 'db'
    });
    
    console.log('正在获取所有表名...');
    const [tables] = await conn.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('找到的表:', tableNames);
    
    // 禁用外键检查以便删除有关联的表
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const tableName of tableNames) {
      console.log(`正在清空表: ${tableName}`);
      try {
        await conn.query(`TRUNCATE TABLE \`${tableName}\``);
        console.log(`表 ${tableName} 已清空`);
      } catch (err) {
        console.error(`清空表 ${tableName} 时出错:`, err.message);
      }
    }
    
    // 重新启用外键检查
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('所有表已清空');
    await conn.end();
  } catch (err) {
    console.error('清空数据库时出错:', err);
  }
}

clearDatabase();
