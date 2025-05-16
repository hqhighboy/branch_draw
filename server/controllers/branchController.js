/**
 * @file 支部控制器，处理支部相关的请求
 * @author 党支部分析系统开发团队
 * @date 2023-06-01
 */

const db = require('../db');

/**
 * 获取所有支部
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getAllBranches = async (req, res) => {
  try {
    // 查询所有支部
    const [rows] = await db.query('SELECT id, name, secretary, deputy_secretary as deputySecretary, member_count as memberCount FROM branches');

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('获取支部列表失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '获取支部列表失败'
    });
  }
};

/**
 * 获取指定支部详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getBranchById = async (req, res) => {
  try {
    const branchId = req.params.id;

    // 查询支部基本信息
    const [branchRows] = await db.query(
      'SELECT id, name, secretary, deputy_secretary as deputySecretary, member_count as memberCount FROM branches WHERE id = ?',
      [branchId]
    );

    if (branchRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的支部'
      });
    }

    const branch = branchRows[0];

    // 查询年龄分布
    const [ageDistributionRows] = await db.query(
      'SELECT age_group as ageGroup, count, percentage FROM branch_age_distribution WHERE branch_id = ?',
      [branchId]
    );

    // 查询学历分布
    const [educationDistributionRows] = await db.query(
      'SELECT education_level as educationLevel, count, percentage FROM branch_education_distribution WHERE branch_id = ?',
      [branchId]
    );

    // 查询党龄分布
    const [partyAgeDistributionRows] = await db.query(
      'SELECT party_age_group as partyAgeGroup, count, percentage FROM branch_party_age_distribution WHERE branch_id = ?',
      [branchId]
    );

    // 查询职务分布
    const [positionDistributionRows] = await db.query(
      'SELECT position, count, percentage FROM branch_position_distribution WHERE branch_id = ?',
      [branchId]
    );

    // 组合数据
    const branchDetail = {
      ...branch,
      ageDistribution: ageDistributionRows,
      educationDistribution: educationDistributionRows,
      partyAgeDistribution: partyAgeDistributionRows,
      positionDistribution: positionDistributionRows
    };

    res.json({
      success: true,
      data: branchDetail
    });
  } catch (error) {
    console.error(`获取支部(ID: ${req.params.id})详情失败:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '获取支部详情失败'
    });
  }
};

/**
 * 创建支部
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.createBranch = async (req, res) => {
  try {
    const { name, secretary, deputySecretary, memberCount } = req.body;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '支部名称不能为空'
      });
    }

    // 插入支部数据
    const [result] = await db.query(
      'INSERT INTO branches (name, secretary, deputy_secretary, member_count) VALUES (?, ?, ?, ?)',
      [name, secretary, deputySecretary, memberCount]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name,
        secretary,
        deputySecretary,
        memberCount
      },
      message: '支部创建成功'
    });
  } catch (error) {
    console.error('创建支部失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '创建支部失败'
    });
  }
};

/**
 * 更新支部
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.updateBranch = async (req, res) => {
  try {
    const branchId = req.params.id;
    const { name, secretary, deputySecretary, memberCount } = req.body;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '支部名称不能为空'
      });
    }

    // 检查支部是否存在
    const [existingBranches] = await db.query('SELECT id FROM branches WHERE id = ?', [branchId]);

    if (existingBranches.length === 0) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的支部'
      });
    }

    // 更新支部数据
    await db.query(
      'UPDATE branches SET name = ?, secretary = ?, deputy_secretary = ?, member_count = ? WHERE id = ?',
      [name, secretary, deputySecretary, memberCount, branchId]
    );

    res.json({
      success: true,
      data: {
        id: branchId,
        name,
        secretary,
        deputySecretary,
        memberCount
      },
      message: '支部更新成功'
    });
  } catch (error) {
    console.error(`更新支部(ID: ${req.params.id})失败:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '更新支部失败'
    });
  }
};

/**
 * 删除支部
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.deleteBranch = async (req, res) => {
  try {
    const branchId = req.params.id;

    // 检查支部是否存在
    const [existingBranches] = await db.query('SELECT id FROM branches WHERE id = ?', [branchId]);

    if (existingBranches.length === 0) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的支部'
      });
    }

    // 删除支部数据
    await db.query('DELETE FROM branches WHERE id = ?', [branchId]);

    res.json({
      success: true,
      message: '支部删除成功'
    });
  } catch (error) {
    console.error(`删除支部(ID: ${req.params.id})失败:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: '删除支部失败'
    });
  }
};
