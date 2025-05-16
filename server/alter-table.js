const mysql = require('mysql2/promise');

async function alterTable() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'bdes@123',
      database: 'db'
    });
    
    console.log('修改employees表结构...');
    
    // 修改tenure_years字段类型为VARCHAR(50)
    await conn.query(`
      ALTER TABLE employees 
      MODIFY COLUMN tenure_years VARCHAR(50)
    `);
    
    console.log('表结构修改成功');
    
    // 修改work_years字段类型为VARCHAR(50)
    await conn.query(`
      ALTER TABLE employees 
      MODIFY COLUMN work_years VARCHAR(50)
    `);
    
    console.log('work_years字段修改成功');
    
    await conn.end();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('修改表结构失败:', error);
  }
}

alterTable();
