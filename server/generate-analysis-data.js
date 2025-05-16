/**
 * 生成支部人员分析数据脚本
 *
 * 此脚本用于根据员工和支部数据生成分析数据，包括年龄分布、学历分布、技能等级分布和职称分布
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
 * 生成支部人员分析数据
 */
async function generateAnalysisData() {
  console.log('开始生成支部人员分析数据...');

  const conn = await mysql.createConnection(dbConfig);

  try {
    // 清空现有分析数据
    console.log('清空现有分析数据...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE branch_age_distribution');
    await conn.query('TRUNCATE TABLE branch_education_distribution');
    await conn.query('TRUNCATE TABLE branch_skill_distribution');
    await conn.query('TRUNCATE TABLE branch_title_distribution');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // 获取所有支部
    const [branches] = await conn.query('SELECT id, name FROM branches');

    for (const branch of branches) {
      const branchId = branch.id;
      const branchName = branch.name;

      console.log(`处理支部: ${branchName} (ID: ${branchId})`);

      // 生成年龄分布数据
      await generateAgeDistribution(conn, branchId);

      // 生成学历分布数据
      await generateEducationDistribution(conn, branchId);

      // 生成技能等级分布数据
      await generateSkillDistribution(conn, branchId);

      // 生成职称分布数据
      await generateTitleDistribution(conn, branchId);
    }

    console.log('支部人员分析数据生成完成');
  } catch (error) {
    console.error('生成支部人员分析数据时出错:', error);
  } finally {
    await conn.end();
  }
}

/**
 * 生成年龄分布数据
 * @param {Object} conn 数据库连接
 * @param {number} branchId 支部ID
 */
async function generateAgeDistribution(conn, branchId) {
  // 获取支部人员年龄分布
  const [ageDistribution] = await conn.query(`
    SELECT
      CASE
        WHEN e.age < 28 THEN '18-28岁'
        WHEN e.age >= 28 AND e.age < 35 THEN '28-35岁'
        WHEN e.age >= 35 AND e.age < 50 THEN '35-50岁'
        WHEN e.age >= 50 THEN '50-60岁'
      END as age_group,
      COUNT(*) as count
    FROM branch_personnel bp
    JOIN employees e ON bp.name = e.name
    WHERE bp.branch_id = ? AND e.age IS NOT NULL
    GROUP BY age_group
  `, [branchId]);

  // 计算总人数
  const totalCount = ageDistribution.reduce((sum, item) => sum + item.count, 0);

  // 插入年龄分布数据
  for (const item of ageDistribution) {
    if (!item.age_group) continue;

    const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;

    await conn.query(`
      INSERT INTO branch_age_distribution (branch_id, age_group, percentage)
      VALUES (?, ?, ?)
    `, [branchId, item.age_group, percentage]);
  }

  // 确保所有年龄组都有数据
  const ageGroups = ['18-28岁', '28-35岁', '35-50岁', '50-60岁'];
  for (const ageGroup of ageGroups) {
    const exists = ageDistribution.some(item => item.age_group === ageGroup);
    if (!exists) {
      await conn.query(`
        INSERT INTO branch_age_distribution (branch_id, age_group, percentage)
        VALUES (?, ?, 0)
      `, [branchId, ageGroup]);
    }
  }

  console.log(`  支部 ${branchId} 的年龄分布数据已生成`);
}

/**
 * 生成学历分布数据
 * @param {Object} conn 数据库连接
 * @param {number} branchId 支部ID
 */
async function generateEducationDistribution(conn, branchId) {
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

  // 计算总人数
  const totalCount = educationDistribution.reduce((sum, item) => sum + item.count, 0);

  // 插入学历分布数据
  for (const item of educationDistribution) {
    if (!item.education_level || item.education_level === '其他') continue;

    const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;

    await conn.query(`
      INSERT INTO branch_education_distribution (branch_id, education_level, percentage)
      VALUES (?, ?, ?)
    `, [branchId, item.education_level, percentage]);
  }

  // 确保所有学历组都有数据
  const educationLevels = ['大专及以下', '本科', '硕士', '博士'];
  for (const educationLevel of educationLevels) {
    const exists = educationDistribution.some(item => item.education_level === educationLevel);
    if (!exists) {
      await conn.query(`
        INSERT INTO branch_education_distribution (branch_id, education_level, percentage)
        VALUES (?, ?, 0)
      `, [branchId, educationLevel]);
    }
  }

  console.log(`  支部 ${branchId} 的学历分布数据已生成`);
}

/**
 * 生成技能等级分布数据
 * @param {Object} conn 数据库连接
 * @param {number} branchId 支部ID
 */
async function generateSkillDistribution(conn, branchId) {
  // 由于没有实际的技能等级数据，我们生成一些模拟数据
  const skillLevels = ['初中级工', '高级工', '技师', '高级技师'];
  const totalMembers = await getBranchMemberCount(conn, branchId);

  // 生成随机分布
  let remainingPercentage = 100;
  for (let i = 0; i < skillLevels.length; i++) {
    const skillLevel = skillLevels[i];

    // 最后一个等级获取剩余的百分比
    let percentage;
    if (i === skillLevels.length - 1) {
      percentage = remainingPercentage;
    } else {
      // 随机生成百分比，但确保不超过剩余的百分比
      const maxPercentage = Math.min(remainingPercentage - (skillLevels.length - i - 1), 60);
      percentage = Math.max(5, Math.floor(Math.random() * maxPercentage));
      remainingPercentage -= percentage;
    }

    // 计算人数
    const count = Math.round((percentage / 100) * totalMembers);

    // 插入技能等级分布数据
    await conn.query(`
      INSERT INTO branch_skill_distribution (branch_id, skill_level, percentage)
      VALUES (?, ?, ?)
    `, [branchId, skillLevel, percentage]);
  }

  console.log(`  支部 ${branchId} 的技能等级分布数据已生成`);
}

/**
 * 生成职称分布数据
 * @param {Object} conn 数据库连接
 * @param {number} branchId 支部ID
 */
async function generateTitleDistribution(conn, branchId) {
  // 由于没有实际的职称数据，我们生成一些模拟数据
  const titles = ['助理工程师', '工程师', '高级工程师', '正高级工程师'];
  const totalMembers = await getBranchMemberCount(conn, branchId);

  // 生成随机分布
  let remainingPercentage = 100;
  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];

    // 最后一个职称获取剩余的百分比
    let percentage;
    if (i === titles.length - 1) {
      percentage = remainingPercentage;
    } else {
      // 随机生成百分比，但确保不超过剩余的百分比
      const maxPercentage = Math.min(remainingPercentage - (titles.length - i - 1), 60);
      percentage = Math.max(5, Math.floor(Math.random() * maxPercentage));
      remainingPercentage -= percentage;
    }

    // 计算人数
    const count = Math.round((percentage / 100) * totalMembers);

    // 插入职称分布数据
    await conn.query(`
      INSERT INTO branch_title_distribution (branch_id, title, percentage)
      VALUES (?, ?, ?)
    `, [branchId, title, percentage]);
  }

  console.log(`  支部 ${branchId} 的职称分布数据已生成`);
}

/**
 * 获取支部人员数量
 * @param {Object} conn 数据库连接
 * @param {number} branchId 支部ID
 * @returns {number} 支部人员数量
 */
async function getBranchMemberCount(conn, branchId) {
  const [result] = await conn.query(
    'SELECT COUNT(*) as count FROM branch_personnel WHERE branch_id = ?',
    [branchId]
  );
  return result[0].count || 0;
}

// 执行生成
generateAnalysisData().catch(console.error);
