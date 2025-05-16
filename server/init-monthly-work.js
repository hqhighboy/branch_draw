/**
 * 初始化月度工作数据
 * 
 * 此脚本用于初始化支部月度工作完成情况数据
 */

const mysql = require('mysql2/promise');

async function initMonthlyWorkData() {
  console.log('开始初始化月度工作数据...');
  
  // 数据库配置
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'bdes@123',
    database: 'db'
  };
  
  let connection;
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    
    // 检查表是否存在
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'monthly_work'
    `, [dbConfig.database]);
    
    // 如果表不存在，创建表
    if (tables.length === 0) {
      console.log('创建monthly_work表...');
      await connection.execute(`
        CREATE TABLE monthly_work (
          id INT AUTO_INCREMENT PRIMARY KEY,
          branch_id INT NOT NULL,
          branch_name VARCHAR(100) NOT NULL,
          year INT NOT NULL,
          month INT NOT NULL,
          planning_completion INT NOT NULL,
          execution_completion INT NOT NULL,
          inspection_completion INT NOT NULL,
          evaluation_completion INT NOT NULL,
          improvement_completion INT NOT NULL,
          FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
        )
      `);
    }
    
    // 清空表
    await connection.execute('TRUNCATE TABLE monthly_work');
    console.log('已清空monthly_work表');
    
    // 获取所有支部
    const [branches] = await connection.execute('SELECT id, name FROM branches');
    
    // 为每个支部生成2024年1-12月的月度工作数据
    const currentYear = 2024;
    
    for (const branch of branches) {
      console.log(`为支部 ${branch.name} 生成月度工作数据...`);
      
      for (let month = 1; month <= 12; month++) {
        // 生成随机完成率 (50-100)
        const planningCompletion = Math.floor(Math.random() * 50) + 50;
        const executionCompletion = Math.floor(Math.random() * 50) + 50;
        const inspectionCompletion = Math.floor(Math.random() * 50) + 50;
        const evaluationCompletion = Math.floor(Math.random() * 50) + 50;
        const improvementCompletion = Math.floor(Math.random() * 50) + 50;
        
        // 插入数据
        await connection.execute(`
          INSERT INTO monthly_work (
            branch_id, branch_name, year, month,
            planning_completion, execution_completion,
            inspection_completion, evaluation_completion,
            improvement_completion
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          branch.id, branch.name, currentYear, month,
          planningCompletion, executionCompletion,
          inspectionCompletion, evaluationCompletion,
          improvementCompletion
        ]);
      }
    }
    
    console.log('月度工作数据初始化完成');
  } catch (error) {
    console.error('初始化月度工作数据时出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行初始化
initMonthlyWorkData();
