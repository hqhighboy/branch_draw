const mysql = require('mysql2/promise');

async function updateBranchPositions() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'bdes@123',
      database: 'db'
    });
    
    console.log('开始更新支部职务信息...');
    
    // 获取所有支部
    const [branches] = await conn.query('SELECT id, name FROM branches');
    
    for (const branch of branches) {
      const branchId = branch.id;
      const branchName = branch.name;
      
      console.log(`处理支部: ${branchName} (ID: ${branchId})`);
      
      // 获取支部书记
      const [secretaries] = await conn.query(`
        SELECT e.name
        FROM member_positions mp
        JOIN employees e ON mp.employee_id = e.id
        WHERE mp.branch_id = ? AND mp.position_type = 'branch_secretary'
        LIMIT 1
      `, [branchId]);
      
      if (secretaries.length > 0) {
        await conn.query('UPDATE branches SET secretary = ? WHERE id = ?', [secretaries[0].name, branchId]);
        console.log(`  更新支部书记: ${secretaries[0].name}`);
      }
      
      // 获取支部副书记
      const [deputySecretaries] = await conn.query(`
        SELECT e.name
        FROM member_positions mp
        JOIN employees e ON mp.employee_id = e.id
        WHERE mp.branch_id = ? AND mp.position_type = 'branch_deputy_secretary'
        LIMIT 1
      `, [branchId]);
      
      if (deputySecretaries.length > 0) {
        await conn.query('UPDATE branches SET deputy_secretary = ? WHERE id = ?', [deputySecretaries[0].name, branchId]);
        console.log(`  更新支部副书记: ${deputySecretaries[0].name}`);
      }
      
      // 获取组织委员
      const [organizationalCommissioners] = await conn.query(`
        SELECT e.name
        FROM member_positions mp
        JOIN employees e ON mp.employee_id = e.id
        WHERE mp.branch_id = ? AND mp.position_type = 'organizational_commissioner'
        LIMIT 1
      `, [branchId]);
      
      if (organizationalCommissioners.length > 0) {
        await conn.query('UPDATE branches SET organizational_commissioner = ? WHERE id = ?', [organizationalCommissioners[0].name, branchId]);
        console.log(`  更新组织委员: ${organizationalCommissioners[0].name}`);
      }
      
      // 获取纪检委员
      const [disciplinaryCommissioners] = await conn.query(`
        SELECT e.name
        FROM member_positions mp
        JOIN employees e ON mp.employee_id = e.id
        WHERE mp.branch_id = ? AND mp.position_type = 'disciplinary_commissioner'
        LIMIT 1
      `, [branchId]);
      
      if (disciplinaryCommissioners.length > 0) {
        await conn.query('UPDATE branches SET disciplinary_commissioner = ? WHERE id = ?', [disciplinaryCommissioners[0].name, branchId]);
        console.log(`  更新纪检委员: ${disciplinaryCommissioners[0].name}`);
      }
      
      // 获取宣传委员
      const [propagandaCommissioners] = await conn.query(`
        SELECT e.name
        FROM member_positions mp
        JOIN employees e ON mp.employee_id = e.id
        WHERE mp.branch_id = ? AND mp.position_type = 'propaganda_commissioner'
        LIMIT 1
      `, [branchId]);
      
      if (propagandaCommissioners.length > 0) {
        await conn.query('UPDATE branches SET propaganda_commissioner = ? WHERE id = ?', [propagandaCommissioners[0].name, branchId]);
        console.log(`  更新宣传委员: ${propagandaCommissioners[0].name}`);
      }
      
      // 获取青年委员
      const [youthCommissioners] = await conn.query(`
        SELECT e.name
        FROM member_positions mp
        JOIN employees e ON mp.employee_id = e.id
        WHERE mp.branch_id = ? AND mp.position_type = 'youth_commissioner'
        LIMIT 1
      `, [branchId]);
      
      if (youthCommissioners.length > 0) {
        await conn.query('UPDATE branches SET learning_commissioner = ? WHERE id = ?', [youthCommissioners[0].name, branchId]);
        console.log(`  更新青年委员: ${youthCommissioners[0].name}`);
      }
      
      // 获取生产委员
      const [productionCommissioners] = await conn.query(`
        SELECT e.name
        FROM member_positions mp
        JOIN employees e ON mp.employee_id = e.id
        WHERE mp.branch_id = ? AND mp.position_type = 'production_commissioner'
        LIMIT 1
      `, [branchId]);
      
      if (productionCommissioners.length > 0) {
        await conn.query('UPDATE branches SET production_commissioner = ? WHERE id = ?', [productionCommissioners[0].name, branchId]);
        console.log(`  更新生产委员: ${productionCommissioners[0].name}`);
      }
      
      // 更新支部人数
      const [memberCountResult] = await conn.query(`
        SELECT COUNT(*) as count
        FROM branch_personnel
        WHERE branch_id = ?
      `, [branchId]);
      
      const memberCount = memberCountResult[0].count;
      await conn.query('UPDATE branches SET member_count = ? WHERE id = ?', [memberCount, branchId]);
      console.log(`  更新支部人数: ${memberCount}`);
    }
    
    console.log('支部职务信息更新完成');
    await conn.end();
  } catch (err) {
    console.error('更新支部职务信息失败:', err);
  }
}

updateBranchPositions();
