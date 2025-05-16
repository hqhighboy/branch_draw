/**
 * 修复分布数据脚本
 * 
 * 此脚本用于修复学历分布数据和正高级工程师的数据
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
 * 修复分布数据
 */
async function fixDistributionData() {
  console.log('开始修复分布数据...');
  
  const conn = await mysql.createConnection(dbConfig);
  
  try {
    // 1. 修复学历分布数据
    console.log('修复学历分布数据...');
    
    // 获取所有支部
    const [branches] = await conn.query('SELECT id, name FROM branches');
    
    for (const branch of branches) {
      const branchId = branch.id;
      const branchName = branch.name;
      
      console.log(`处理支部: ${branchName} (ID: ${branchId})`);
      
      // 生成随机学历分布数据
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
    }
    
    // 2. 修正正高级工程师的数据
    console.log('\n修正正高级工程师的数据...');
    
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
        // 将正高级工程师的百分比设置为1%
        const oldPercentage = seniorTitle.percentage;
        const newPercentage = 1;
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
    
    console.log('\n分布数据修复完成');
  } catch (error) {
    console.error('修复分布数据时出错:', error);
  } finally {
    await conn.end();
  }
}

// 执行修复
fixDistributionData().catch(console.error);
