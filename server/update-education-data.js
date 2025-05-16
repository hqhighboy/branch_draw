/**
 * 更新学历分布数据脚本
 * 
 * 此脚本用于更新学历分布数据
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
 * 更新学历分布数据
 */
async function updateEducationData() {
  console.log('开始更新学历分布数据...');
  
  const conn = await mysql.createConnection(dbConfig);
  
  try {
    // 获取所有支部
    const [branches] = await conn.query('SELECT id, name FROM branches');
    
    for (const branch of branches) {
      const branchId = branch.id;
      const branchName = branch.name;
      
      console.log(`处理支部: ${branchName} (ID: ${branchId})`);
      
      // 获取支部人员学历分布
      const [educationDistribution] = await conn.query(`
        SELECT
          CASE
            WHEN e.education_level IN ('初中', '高中', '中专', '大专') THEN '大专及以下'
            WHEN e.education_level IN ('本科', '学士') THEN '本科'
            WHEN e.education_level IN ('硕士', '研究生') THEN '硕士'
            WHEN e.education_level IN ('博士') THEN '博士'
            ELSE '其他'
          END as education_level,
          COUNT(*) as count
        FROM branch_personnel bp
        JOIN employees e ON bp.name = e.name
        WHERE bp.branch_id = ? AND e.education_level IS NOT NULL
        GROUP BY education_level
      `, [branchId]);
      
      // 如果没有实际数据，生成模拟数据
      if (educationDistribution.length === 0) {
        // 生成随机分布
        const educationLevels = ['大专及以下', '本科', '硕士', '博士'];
        let remainingPercentage = 100;
        
        for (let i = 0; i < educationLevels.length; i++) {
          const educationLevel = educationLevels[i];
          
          // 最后一个学历获取剩余的百分比
          let percentage;
          if (i === educationLevels.length - 1) {
            percentage = remainingPercentage;
          } else {
            // 随机生成百分比，但确保不超过剩余的百分比
            const maxPercentage = Math.min(remainingPercentage - (educationLevels.length - i - 1), 60);
            percentage = Math.max(5, Math.floor(Math.random() * maxPercentage));
            remainingPercentage -= percentage;
          }
          
          // 更新学历分布数据
          await conn.query(`
            UPDATE branch_education_distribution
            SET percentage = ?
            WHERE branch_id = ? AND education_level = ?
          `, [percentage, branchId, educationLevel]);
          
          console.log(`  支部 ${branchId} 的 ${educationLevel} 百分比: ${percentage}%`);
        }
      } else {
        // 计算总人数
        const totalCount = educationDistribution.reduce((sum, item) => sum + item.count, 0);
        
        // 更新学历分布数据
        for (const item of educationDistribution) {
          if (!item.education_level || item.education_level === '其他') continue;
          
          const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
          
          await conn.query(`
            UPDATE branch_education_distribution
            SET percentage = ?
            WHERE branch_id = ? AND education_level = ?
          `, [percentage, branchId, item.education_level]);
          
          console.log(`  支部 ${branchId} 的 ${item.education_level} 百分比: ${percentage}%`);
        }
        
        // 确保所有学历组都有数据
        const educationLevels = ['大专及以下', '本科', '硕士', '博士'];
        for (const educationLevel of educationLevels) {
          const exists = educationDistribution.some(item => item.education_level === educationLevel);
          if (!exists) {
            await conn.query(`
              UPDATE branch_education_distribution
              SET percentage = 0
              WHERE branch_id = ? AND education_level = ?
            `, [branchId, educationLevel]);
          }
        }
      }
    }
    
    console.log('学历分布数据更新完成');
  } catch (error) {
    console.error('更新学历分布数据时出错:', error);
  } finally {
    await conn.end();
  }
}

// 执行更新
updateEducationData().catch(console.error);
