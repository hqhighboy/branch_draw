/**
 * 清除虚假数据脚本
 * 
 * 此脚本用于清除数据库中的虚假数据
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
 * 清除虚假数据
 */
async function clearFakeData() {
  console.log('开始清除虚假数据...');
  
  const conn = await mysql.createConnection(dbConfig);
  
  try {
    // 清除虚假的副书记数据
    await conn.query("UPDATE branches SET deputy_secretary = NULL WHERE deputy_secretary = '李四'");
    console.log('已清除虚假的副书记数据');
    
    // 查询更新后的支部信息
    const [branches] = await conn.query('SELECT id, name, secretary, deputy_secretary FROM branches ORDER BY id');
    
    console.log('\n更新后的支部信息:');
    branches.forEach(branch => {
      console.log(`${branch.id}: ${branch.name}, 书记: ${branch.secretary || '无'}, 副书记: ${branch.deputy_secretary || '无'}`);
    });
    
    console.log('\n虚假数据清除完成');
  } catch (error) {
    console.error('清除虚假数据时出错:', error);
  } finally {
    await conn.end();
  }
}

// 执行清除
clearFakeData().catch(console.error);
