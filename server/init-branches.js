/**
 * 初始化支部数据脚本
 * 
 * 此脚本用于初始化支部数据
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
 * 初始化支部数据
 */
async function initBranches() {
  console.log('开始初始化支部数据...');
  
  const conn = await mysql.createConnection(dbConfig);
  
  try {
    // 支部数据
    const branches = [
      { id: 1, name: '党建人事党支部' },
      { id: 2, name: '综合党支部' },
      { id: 3, name: '生技党支部' },
      { id: 4, name: '安监党支部' },
      { id: 5, name: '数字运行部党支部' },
      { id: 6, name: '检修试验党支部' },
      { id: 7, name: '继保自动化党支部' },
      { id: 8, name: '500千伏科北数字巡维中心党支部' },
      { id: 9, name: '500千伏北郊数字巡维中心党支部' },
      { id: 10, name: '220千伏罗涌数字巡维中心党支部' },
      { id: 11, name: '220千伏田心数字巡维中心党支部' }
    ];
    
    // 插入支部数据
    for (const branch of branches) {
      console.log(`插入支部: ${branch.name}`);
      await conn.query(`
        INSERT INTO branches (id, name)
        VALUES (?, ?)
      `, [branch.id, branch.name]);
    }
    
    console.log('支部数据初始化完成');
  } catch (error) {
    console.error('初始化支部数据时出错:', error);
  } finally {
    await conn.end();
  }
}

// 执行初始化
initBranches().catch(console.error);
