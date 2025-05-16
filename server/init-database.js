const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'init-database.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // 分割SQL语句
    const sqlStatements = sqlContent
      .replace(/--.*$/gm, '') // 移除注释
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // 创建数据库连接
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'bdes@123',
      database: 'db',
      multipleStatements: true
    });
    
    console.log(`共有 ${sqlStatements.length} 条SQL语句需要执行`);
    
    // 执行每条SQL语句
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i].trim();
      if (statement) {
        try {
          console.log(`执行第 ${i + 1}/${sqlStatements.length} 条SQL语句`);
          await conn.query(statement);
        } catch (err) {
          console.error(`执行第 ${i + 1} 条SQL语句时出错:`, err.message);
          console.error('SQL语句:', statement);
        }
      }
    }
    
    console.log('数据库初始化完成');
    await conn.end();
  } catch (err) {
    console.error('初始化数据库时出错:', err);
  }
}

initDatabase();
