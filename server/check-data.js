const mysql = require('mysql2/promise');

async function checkData() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'bdes@123',
      database: 'db'
    });
    
    // 查询支部信息
    console.log('支部信息:');
    const [branches] = await conn.query(`
      SELECT id, name, secretary, deputy_secretary, organizational_commissioner, 
             disciplinary_commissioner, propaganda_commissioner, learning_commissioner,
             production_commissioner, member_count
      FROM branches
      ORDER BY id
    `);
    console.log(JSON.stringify(branches, null, 2));
    
    // 查询党员数量
    const [employeeCount] = await conn.query('SELECT COUNT(*) as count FROM employees');
    console.log(`\n党员总数: ${employeeCount[0].count}`);
    
    // 查询职务信息
    console.log('\n职务信息:');
    const [positions] = await conn.query(`
      SELECT mp.position_type, COUNT(*) as count
      FROM member_positions mp
      GROUP BY mp.position_type
      ORDER BY count DESC
    `);
    console.log(JSON.stringify(positions, null, 2));
    
    // 查询每个支部的党员数量
    console.log('\n各支部党员数量:');
    const [branchMemberCounts] = await conn.query(`
      SELECT b.id, b.name, COUNT(bp.id) as member_count
      FROM branches b
      LEFT JOIN branch_personnel bp ON b.id = bp.branch_id
      GROUP BY b.id, b.name
      ORDER BY b.id
    `);
    console.log(JSON.stringify(branchMemberCounts, null, 2));
    
    await conn.end();
  } catch (err) {
    console.error('查询数据失败:', err);
  }
}

checkData();
