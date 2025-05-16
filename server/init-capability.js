/**
 * 初始化支部能力数据
 * 
 * 此脚本用于初始化支部能力画像数据
 */

const mysql = require('mysql2/promise');

async function initCapabilityData() {
  console.log('开始初始化支部能力数据...');
  
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
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'branch_capability'
    `, [dbConfig.database]);
    
    // 如果表不存在，创建表
    if (tables.length === 0) {
      console.log('创建branch_capability表...');
      await connection.execute(`
        CREATE TABLE branch_capability (
          id INT AUTO_INCREMENT PRIMARY KEY,
          branch_id INT NOT NULL,
          branch_name VARCHAR(100) NOT NULL,
          management_level FLOAT NOT NULL,
          kpi_execution FLOAT NOT NULL,
          talent_development FLOAT NOT NULL,
          party_building FLOAT NOT NULL,
          task_follow_up FLOAT NOT NULL,
          safety_compliance FLOAT NOT NULL,
          innovation_capability FLOAT NOT NULL,
          team_collaboration FLOAT NOT NULL,
          resource_utilization FLOAT NOT NULL,
          overall_score FLOAT NOT NULL,
          FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
        )
      `);
    }
    
    // 清空表
    await connection.execute('TRUNCATE TABLE branch_capability');
    console.log('已清空branch_capability表');
    
    // 获取所有支部
    const [branches] = await connection.execute('SELECT id, name FROM branches');
    
    // 为每个支部生成能力数据
    for (const branch of branches) {
      console.log(`为支部 ${branch.name} 生成能力数据...`);
      
      // 生成随机分数 (60-95)
      const managementLevel = Math.floor(Math.random() * 35) + 60;
      const kpiExecution = Math.floor(Math.random() * 35) + 60;
      const talentDevelopment = Math.floor(Math.random() * 35) + 60;
      const partyBuilding = Math.floor(Math.random() * 35) + 60;
      const taskFollowUp = Math.floor(Math.random() * 35) + 60;
      const safetyCompliance = Math.floor(Math.random() * 35) + 60;
      const innovationCapability = Math.floor(Math.random() * 35) + 60;
      const teamCollaboration = Math.floor(Math.random() * 35) + 60;
      const resourceUtilization = Math.floor(Math.random() * 35) + 60;
      
      // 计算总分 (所有分数的平均值)
      const overallScore = Math.round(
        (managementLevel + kpiExecution + talentDevelopment + partyBuilding + 
         taskFollowUp + safetyCompliance + innovationCapability + 
         teamCollaboration + resourceUtilization) / 9
      );
      
      // 插入数据
      await connection.execute(`
        INSERT INTO branch_capability (
          branch_id, branch_name, management_level, kpi_execution, 
          talent_development, party_building, task_follow_up, 
          safety_compliance, innovation_capability, team_collaboration, 
          resource_utilization, overall_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        branch.id, branch.name, managementLevel, kpiExecution, 
        talentDevelopment, partyBuilding, taskFollowUp, 
        safetyCompliance, innovationCapability, teamCollaboration, 
        resourceUtilization, overallScore
      ]);
    }
    
    console.log('支部能力数据初始化完成');
  } catch (error) {
    console.error('初始化支部能力数据时出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行初始化
initCapabilityData();
