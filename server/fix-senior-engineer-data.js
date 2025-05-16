/**
 * 修正正高级工程师数据脚本
 * 
 * 此脚本用于将正高级工程师的百分比设置为0
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
 * 修正正高级工程师数据
 */
async function fixSeniorEngineerData() {
  console.log('开始修正正高级工程师数据...');
  
  const conn = await mysql.createConnection(dbConfig);
  
  try {
    // 获取所有支部的职称分布数据
    const [titleData] = await conn.query(`
      SELECT id, branch_id, title, percentage
      FROM branch_title_distribution
      WHERE title IN ('助理工程师', '工程师', '高级工程师', '正高级工程师')
      ORDER BY branch_id, title
    `);
    
    // 按支部分组
    const branchTitleData = {};
    for (const item of titleData) {
      if (!branchTitleData[item.branch_id]) {
        branchTitleData[item.branch_id] = [];
      }
      branchTitleData[item.branch_id].push(item);
    }
    
    // 修正每个支部的职称分布数据
    for (const branchId in branchTitleData) {
      const titles = branchTitleData[branchId];
      
      // 找到正高级工程师的数据
      const seniorTitle = titles.find(t => t.title === '正高级工程师');
      if (seniorTitle) {
        // 将正高级工程师的百分比设置为0
        const oldPercentage = seniorTitle.percentage;
        const newPercentage = 0;
        const diff = oldPercentage - newPercentage;
        
        // 更新正高级工程师的百分比
        await conn.query(`
          UPDATE branch_title_distribution
          SET percentage = ?
          WHERE id = ?
        `, [newPercentage, seniorTitle.id]);
        
        console.log(`  支部 ${branchId} 的正高级工程师百分比: ${oldPercentage}% -> ${newPercentage}%`);
        
        // 将差值分配给其他职称
        const otherTitles = titles.filter(t => t.title !== '正高级工程师');
        const totalOtherPercentage = otherTitles.reduce((sum, t) => sum + t.percentage, 0);
        
        for (const title of otherTitles) {
          // 按比例分配差值
          const proportion = title.percentage / totalOtherPercentage;
          const additionalPercentage = Math.round(diff * proportion);
          const newTitlePercentage = title.percentage + additionalPercentage;
          
          // 更新职称百分比
          await conn.query(`
            UPDATE branch_title_distribution
            SET percentage = ?
            WHERE id = ?
          `, [newTitlePercentage, title.id]);
          
          console.log(`  支部 ${branchId} 的 ${title.title} 百分比: ${title.percentage}% -> ${newTitlePercentage}%`);
        }
      }
    }
    
    console.log('\n正高级工程师数据修正完成');
  } catch (error) {
    console.error('修正正高级工程师数据时出错:', error);
  } finally {
    await conn.end();
  }
}

// 执行修正
fixSeniorEngineerData().catch(console.error);
