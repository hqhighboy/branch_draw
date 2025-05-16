const mysql = require('mysql2/promise');

async function showTableStructures() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'bdes@123',
      database: 'db'
    });
    
    const [tables] = await conn.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    for (const tableName of tableNames) {
      console.log(`\n表名: ${tableName}`);
      const [columns] = await conn.query(`DESCRIBE \`${tableName}\``);
      console.log(JSON.stringify(columns, null, 2));
    }
    
    await conn.end();
  } catch (err) {
    console.error('获取表结构时出错:', err);
  }
}

showTableStructures();
