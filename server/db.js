const mysql = require('mysql2/promise');

// 创建数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'bdes@123', // 请替换为实际的数据库密码
  database: 'db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}

// 获取所有支部列表
async function getAllBranches() {
  try {
    const [rows] = await pool.query('SELECT * FROM branches');
    return rows;
  } catch (error) {
    console.error('获取支部列表失败:', error);
    throw error;
  }
}

// 提供查询方法
async function query(sql, params) {
  try {
    const [rows] = await pool.query(sql, params);
    return [rows];
  } catch (error) {
    console.error('查询失败:', error);
    throw error;
  }
}

// 获取指定支部的详细信息
async function getBranchById(id) {
  try {
    // 获取支部基本信息
    const [branchInfo] = await pool.query('SELECT * FROM branches WHERE id = ?', [id]);

    if (branchInfo.length === 0) {
      return null;
    }

    // 获取支部人员分布数据
    const [ageDistribution] = await pool.query(
      'SELECT age_group, percentage FROM branch_age_distribution WHERE branch_id = ?',
      [id]
    );

    const [educationDistribution] = await pool.query(
      'SELECT education_level, percentage FROM branch_education_distribution WHERE branch_id = ?',
      [id]
    );

    const [skillDistribution] = await pool.query(
      'SELECT skill_level, percentage FROM branch_skill_distribution WHERE branch_id = ?',
      [id]
    );

    const [titleDistribution] = await pool.query(
      'SELECT title, percentage FROM branch_title_distribution WHERE branch_id = ?',
      [id]
    );

    // 获取支部年度工作
    const [annualWork] = await pool.query(
      'SELECT * FROM branch_annual_work WHERE branch_id = ?',
      [id]
    );

    // 构建完整的支部数据对象
    const branch = {
      ...branchInfo[0],
      ageDistribution: ageDistribution.reduce((acc, curr) => {
        acc[curr.age_group] = curr.percentage;
        return acc;
      }, {}),
      educationDistribution: educationDistribution.reduce((acc, curr) => {
        acc[curr.education_level] = curr.percentage;
        return acc;
      }, {}),
      skillDistribution: skillDistribution.reduce((acc, curr) => {
        acc[curr.skill_level] = curr.percentage;
        return acc;
      }, {}),
      titleDistribution: titleDistribution.reduce((acc, curr) => {
        acc[curr.title] = curr.percentage;
        return acc;
      }, {}),
      annualWork: annualWork.map(work => ({
        id: work.id,
        task: work.task,
        startTime: work.start_time,
        endTime: work.end_time,
        status: work.status,
        progress: work.progress
      }))
    };

    return branch;
  } catch (error) {
    console.error(`获取支部ID=${id}的详细信息失败:`, error);
    throw error;
  }
}

// 更新支部数据
async function updateBranchData(branchData) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 更新支部基本信息
    await connection.query(
      `UPDATE branches SET
       name = ?,
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
       WHERE id = ?`,
      [
        branchData.name,
        branchData.secretary,
        branchData.deputySecretary,
        branchData.organizationalCommissioner,
        branchData.disciplinaryCommissioner,
        branchData.propagandaCommissioner,
        branchData.learningCommissioner,
        branchData.memberCount,
        branchData.averageAge,
        branchData.performance2024,
        branchData.secretaryProject,
        branchData.honors,
        branchData.id
      ]
    );

    // 更新年龄分布数据
    await connection.query('DELETE FROM branch_age_distribution WHERE branch_id = ?', [branchData.id]);
    for (const [ageGroup, percentage] of Object.entries(branchData.ageDistribution)) {
      await connection.query(
        'INSERT INTO branch_age_distribution (branch_id, age_group, percentage) VALUES (?, ?, ?)',
        [branchData.id, ageGroup, percentage]
      );
    }

    // 更新学历分布数据
    await connection.query('DELETE FROM branch_education_distribution WHERE branch_id = ?', [branchData.id]);
    for (const [educationLevel, percentage] of Object.entries(branchData.educationDistribution)) {
      await connection.query(
        'INSERT INTO branch_education_distribution (branch_id, education_level, percentage) VALUES (?, ?, ?)',
        [branchData.id, educationLevel, percentage]
      );
    }

    // 更新技能分布数据
    await connection.query('DELETE FROM branch_skill_distribution WHERE branch_id = ?', [branchData.id]);
    for (const [skillLevel, percentage] of Object.entries(branchData.skillDistribution)) {
      await connection.query(
        'INSERT INTO branch_skill_distribution (branch_id, skill_level, percentage) VALUES (?, ?, ?)',
        [branchData.id, skillLevel, percentage]
      );
    }

    // 更新职称分布数据
    await connection.query('DELETE FROM branch_title_distribution WHERE branch_id = ?', [branchData.id]);
    for (const [title, percentage] of Object.entries(branchData.titleDistribution)) {
      await connection.query(
        'INSERT INTO branch_title_distribution (branch_id, title, percentage) VALUES (?, ?, ?)',
        [branchData.id, title, percentage]
      );
    }

    // 更新年度工作数据
    await connection.query('DELETE FROM branch_annual_work WHERE branch_id = ?', [branchData.id]);
    for (const work of branchData.annualWork) {
      await connection.query(
        `INSERT INTO branch_annual_work
         (branch_id, task, start_time, end_time, status, progress)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [branchData.id, work.task, work.startTime, work.endTime, work.status, work.progress]
      );
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('更新支部数据失败:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection,
  getAllBranches,
  getBranchById,
  updateBranchData,
  query
};
