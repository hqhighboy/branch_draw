/**
 * 初始化支部基本信息数据
 * 
 * 此脚本用于初始化支部基本信息数据
 */

const mysql = require('mysql2/promise');

async function initBranchInfo() {
  console.log('开始初始化支部基本信息...');
  
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
    
    // 获取所有支部
    const [branches] = await connection.execute('SELECT id, name FROM branches');
    
    // 为每个支部更新基本信息
    for (const branch of branches) {
      console.log(`更新支部 ${branch.name} 的基本信息...`);
      
      // 生成随机数据
      const secretary = `${branch.name.substring(0, 2)}书记`;
      const deputySecretary = `${branch.name.substring(0, 2)}副书记`;
      const organizationalCommissioner = `${branch.name.substring(0, 2)}组织委员`;
      const disciplinaryCommissioner = `${branch.name.substring(0, 2)}纪律委员`;
      const propagandaCommissioner = `${branch.name.substring(0, 2)}宣传委员`;
      const learningCommissioner = `${branch.name.substring(0, 2)}学习委员`;
      const memberCount = Math.floor(Math.random() * 20) + 10; // 10-30人
      const averageAge = Math.floor(Math.random() * 10) + 35; // 35-45岁
      const performance2024 = ['优秀', '良好', '合格'][Math.floor(Math.random() * 3)];
      const secretaryProject = `${branch.name}书记项目：提升党员先锋模范作用`;
      const honors = `${branch.name}荣誉：\n1. 2023年度先进基层党组织\n2. 2023年度"五星级"党支部\n3. 2022年度优秀党支部`;
      
      // 更新支部基本信息
      await connection.execute(`
        UPDATE branches
        SET 
          secretary = ?,
          deputy_secretary = ?,
          organizational_commissioner = ?,
          disciplinary_commissioner = ?,
          propaganda_commissioner = ?,
          learning_commissioner = ?,
          member_count = ?,
          average_age = ?,
          performance_2024 = ?,
          secretary_project = ?,
          honors = ?
        WHERE id = ?
      `, [
        secretary,
        deputySecretary,
        organizationalCommissioner,
        disciplinaryCommissioner,
        propagandaCommissioner,
        learningCommissioner,
        memberCount,
        averageAge,
        performance2024,
        secretaryProject,
        honors,
        branch.id
      ]);
      
      // 初始化年龄分布数据
      await connection.execute('DELETE FROM branch_age_distribution WHERE branch_id = ?', [branch.id]);
      const ageGroups = [
        { group: '30岁以下', percentage: Math.floor(Math.random() * 30) },
        { group: '30-40岁', percentage: Math.floor(Math.random() * 30) },
        { group: '40-50岁', percentage: Math.floor(Math.random() * 30) }
      ];
      // 确保最后一组使总和为100%
      ageGroups.push({ 
        group: '50岁以上', 
        percentage: 100 - ageGroups.reduce((sum, item) => sum + item.percentage, 0) 
      });
      
      for (const ageGroup of ageGroups) {
        await connection.execute(`
          INSERT INTO branch_age_distribution (branch_id, age_group, percentage)
          VALUES (?, ?, ?)
        `, [branch.id, ageGroup.group, ageGroup.percentage]);
      }
      
      // 初始化学历分布数据
      await connection.execute('DELETE FROM branch_education_distribution WHERE branch_id = ?', [branch.id]);
      const educationGroups = [
        { level: '博士', percentage: Math.floor(Math.random() * 10) },
        { level: '硕士', percentage: Math.floor(Math.random() * 30) },
        { level: '本科', percentage: Math.floor(Math.random() * 40) }
      ];
      // 确保最后一组使总和为100%
      educationGroups.push({ 
        level: '大专及以下', 
        percentage: 100 - educationGroups.reduce((sum, item) => sum + item.percentage, 0) 
      });
      
      for (const educationGroup of educationGroups) {
        await connection.execute(`
          INSERT INTO branch_education_distribution (branch_id, education_level, percentage)
          VALUES (?, ?, ?)
        `, [branch.id, educationGroup.level, educationGroup.percentage]);
      }
      
      // 初始化技能分布数据
      await connection.execute('DELETE FROM branch_skill_distribution WHERE branch_id = ?', [branch.id]);
      const skillGroups = [
        { level: '高级技师', percentage: Math.floor(Math.random() * 20) },
        { level: '技师', percentage: Math.floor(Math.random() * 30) },
        { level: '高级工', percentage: Math.floor(Math.random() * 30) }
      ];
      // 确保最后一组使总和为100%
      skillGroups.push({ 
        level: '中级工及以下', 
        percentage: 100 - skillGroups.reduce((sum, item) => sum + item.percentage, 0) 
      });
      
      for (const skillGroup of skillGroups) {
        await connection.execute(`
          INSERT INTO branch_skill_distribution (branch_id, skill_level, percentage)
          VALUES (?, ?, ?)
        `, [branch.id, skillGroup.level, skillGroup.percentage]);
      }
      
      // 初始化职称分布数据
      await connection.execute('DELETE FROM branch_title_distribution WHERE branch_id = ?', [branch.id]);
      const titleGroups = [
        { title: '高级职称', percentage: Math.floor(Math.random() * 20) },
        { title: '中级职称', percentage: Math.floor(Math.random() * 40) }
      ];
      // 确保最后一组使总和为100%
      titleGroups.push({ 
        title: '初级职称及以下', 
        percentage: 100 - titleGroups.reduce((sum, item) => sum + item.percentage, 0) 
      });
      
      for (const titleGroup of titleGroups) {
        await connection.execute(`
          INSERT INTO branch_title_distribution (branch_id, title, percentage)
          VALUES (?, ?, ?)
        `, [branch.id, titleGroup.title, titleGroup.percentage]);
      }
      
      // 初始化年度工作数据
      await connection.execute('DELETE FROM branch_annual_work WHERE branch_id = ?', [branch.id]);
      const annualWorks = [
        { 
          task: '党员教育培训', 
          startTime: '2024-01-01', 
          endTime: '2024-12-31', 
          status: '进行中', 
          progress: Math.floor(Math.random() * 100) 
        },
        { 
          task: '党建品牌创建', 
          startTime: '2024-03-01', 
          endTime: '2024-10-31', 
          status: '进行中', 
          progress: Math.floor(Math.random() * 100) 
        },
        { 
          task: '党员先锋岗创建', 
          startTime: '2024-02-01', 
          endTime: '2024-11-30', 
          status: '进行中', 
          progress: Math.floor(Math.random() * 100) 
        },
        { 
          task: '党风廉政建设', 
          startTime: '2024-01-01', 
          endTime: '2024-12-31', 
          status: '进行中', 
          progress: Math.floor(Math.random() * 100) 
        },
        { 
          task: '主题党日活动', 
          startTime: '2024-01-01', 
          endTime: '2024-12-31', 
          status: '进行中', 
          progress: Math.floor(Math.random() * 100) 
        }
      ];
      
      for (const work of annualWorks) {
        await connection.execute(`
          INSERT INTO branch_annual_work (branch_id, task, start_time, end_time, status, progress)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [branch.id, work.task, work.startTime, work.endTime, work.status, work.progress]);
      }
    }
    
    console.log('支部基本信息初始化完成');
  } catch (error) {
    console.error('初始化支部基本信息时出错:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行初始化
initBranchInfo();
