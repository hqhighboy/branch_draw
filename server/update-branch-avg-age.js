/**
 * 更新支部平均年龄脚本
 * 
 * 此脚本用于计算每个支部的平均年龄并更新到数据库
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
 * 更新支部平均年龄
 */
async function updateBranchAvgAge() {
  console.log('开始更新支部平均年龄...');
  
  const conn = await mysql.createConnection(dbConfig);
  
  try {
    // 获取所有支部
    const [branches] = await conn.query('SELECT id, name FROM branches');
    
    for (const branch of branches) {
      const branchId = branch.id;
      const branchName = branch.name;
      
      console.log(`处理支部: ${branchName} (ID: ${branchId})`);
      
      // 计算支部平均年龄
      const [avgAgeResult] = await conn.query(`
        SELECT AVG(e.age) as avg_age
        FROM branch_personnel bp
        JOIN employees e ON bp.name = e.name
        WHERE bp.branch_id = ? AND e.age IS NOT NULL
      `, [branchId]);
      
      const avgAge = avgAgeResult[0].avg_age || 0;
      const roundedAvgAge = Math.round(avgAge * 10) / 10; // 四舍五入到一位小数
      
      console.log(`  支部平均年龄: ${roundedAvgAge}`);
      
      // 更新支部平均年龄
      await conn.query(
        'UPDATE branches SET average_age = ? WHERE id = ?',
        [roundedAvgAge, branchId]
      );
    }
    
    console.log('支部平均年龄更新完成');
  } catch (error) {
    console.error('更新支部平均年龄时出错:', error);
  } finally {
    await conn.end();
  }
}

// 执行更新
updateBranchAvgAge().catch(console.error);
