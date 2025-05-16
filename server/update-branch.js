const mysql = require('mysql2/promise');

async function updateBranchPositions() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'bdes@123',
      database: 'db'
    });
    
    console.log('更新支部职务信息...');
    
    // 更新支部职务信息
    await conn.query(`
      UPDATE branches 
      SET propaganda_commissioner = NULL, 
          production_commissioner = NULL,
          deputy_secretary = NULL
      WHERE id = 1
    `);
    
    console.log('更新完成');
    
    // 查询更新后的支部信息
    const [branch] = await conn.query('SELECT * FROM branches WHERE id = 1');
    console.log('更新后的支部信息:', JSON.stringify(branch, null, 2));
    
    await conn.end();
  } catch (err) {
    console.error('更新支部职务信息失败:', err);
  }
}

updateBranchPositions();
