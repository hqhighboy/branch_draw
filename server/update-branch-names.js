/**
 * 更新支部名称脚本
 * 
 * 此脚本用于更新数据库中的支部名称，使其与Excel文件中的支部名称匹配
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
 * 更新支部名称
 */
async function updateBranchNames() {
  console.log('开始更新支部名称...');
  
  const conn = await mysql.createConnection(dbConfig);
  
  try {
    // 定义名称映射
    const nameMapping = [
      { oldName: '党建人事部党支部', newName: '党建人事党支部' },
      { oldName: '生产技术党支部', newName: '生技党支部' },
      { oldName: '数字运行党支部', newName: '数字运行部党支部' },
      { oldName: '500kV科北数字巡维中心党支部', newName: '500千伏科北数字巡维中心党支部' },
      { oldName: '500kV北郊数字巡维中心党支部', newName: '500千伏北郊数字巡维中心党支部' },
      { oldName: '220kV罗涌数字巡维中心党支部', newName: '220千伏罗涌数字巡维中心党支部' },
      { oldName: '220kV田心数字巡维中心党支部', newName: '220千伏田心数字巡维中心党支部' }
    ];
    
    // 更新支部名称
    for (const mapping of nameMapping) {
      console.log(`更新支部名称: ${mapping.oldName} -> ${mapping.newName}`);
      
      await conn.query(
        'UPDATE branches SET name = ? WHERE name = ?',
        [mapping.newName, mapping.oldName]
      );
    }
    
    // 查询更新后的支部名称
    const [branches] = await conn.query('SELECT id, name FROM branches ORDER BY id');
    
    console.log('\n更新后的支部名称:');
    branches.forEach(branch => {
      console.log(`${branch.id}: ${branch.name}`);
    });
    
    console.log('\n支部名称更新完成');
  } catch (error) {
    console.error('更新支部名称时出错:', error);
  } finally {
    await conn.end();
  }
}

// 执行更新
updateBranchNames().catch(console.error);
